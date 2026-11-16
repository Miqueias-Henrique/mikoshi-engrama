import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC_CSS = path.join(ROOT, 'src', 'styles.css');
const SRC_JS = path.join(ROOT, 'src', 'app.js');
const OUT_JS_DIR = path.join(ROOT, 'assets', 'js');
const OUT_JS = path.join(OUT_JS_DIR, 'app.min.js');
const INDEX_HTML = path.join(ROOT, 'index.html');

function minifyCss(input) {
  let out = '';
  let i = 0;
  const n = input.length;
  let inString = null;
  let braceDepth = 0;
  let pendingSpace = false;

  const isSpace = (c) => c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f';

  while (i < n) {
    const ch = input[i];

    if (inString) {
      out += ch;
      if (ch === '\\' && i + 1 < n) {
        out += input[++i];
      } else if (ch === inString) {
        inString = null;
      }
      i++;
      continue;
    }

    if (ch === '"' || ch === "'") {
      if (pendingSpace && out && !'{}:;,('.includes(out[out.length - 1])) out += ' ';
      pendingSpace = false;
      inString = ch;
      out += ch;
      i++;
      continue;
    }

    if (ch === '/' && input[i + 1] === '*') {
      const end = input.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }

    if (isSpace(ch)) {
      pendingSpace = true;
      i++;
      continue;
    }

    if (ch === '{') {
      pendingSpace = false;
      braceDepth++;
      out += '{';
      i++;
      continue;
    }

    if (ch === '}') {
      pendingSpace = false;
      if (out.endsWith(';')) out = out.slice(0, -1);
      braceDepth = Math.max(0, braceDepth - 1);
      out += '}';
      i++;
      continue;
    }

    if (ch === ';' || ch === ',') {
      pendingSpace = false;
      out += ch;
      i++;
      continue;
    }

    if (ch === ':') {
      if (pendingSpace && out.length > 0 && !'{};,'.includes(out[out.length - 1])) {
        out += ' ';
      }
      pendingSpace = false;
      out += ':';
      if (braceDepth > 0) {
        while (i + 1 < n && isSpace(input[i + 1])) i++;
      }
      i++;
      continue;
    }

    if (pendingSpace && out.length > 0) {
      const last = out[out.length - 1];
      if (!'{};,'.includes(last) && !(last === ':' && braceDepth > 0)) {
        out += ' ';
      }
    }
    pendingSpace = false;
    out += ch;
    i++;
  }

  return out.trim();
}

function minifyJs(input) {
  const tokens = [];
  const n = input.length;
  let i = 0;

  const isIdStart = (c) => /[A-Za-z0-9_$]/.test(c);
  const canPrecedeRegex = (tok) => {
    if (!tok) return true;
    if (tok.type === 'nl') {
      // Look at previous non-ws/nl token
      for (let k = tokens.length - 1; k >= 0; k--) {
        if (tokens[k].type !== 'ws' && tokens[k].type !== 'nl') {
          return canPrecedeRegex(tokens[k]);
        }
      }
      return true;
    }
    if (tok.type === 'id') {
      return ['return', 'throw', 'case', 'delete', 'void', 'typeof', 'in', 'instanceof', 'of', 'new', 'else', 'do', 'yield', 'await'].includes(tok.value);
    }
    if (tok.type === 'op' || tok.type === 'punc') {
      return !tok.value.endsWith(')') && !tok.value.endsWith(']') && tok.value !== '++' && tok.value !== '--';
    }
    return false;
  };

  let lastSig = null;

  while (i < n) {
    const ch = input[i];

    // Newlines
    if (ch === '\n' || ch === '\r') {
      while (i < n && (input[i] === '\n' || input[i] === '\r' || input[i] === ' ' || input[i] === '\t')) i++;
      if (tokens.length && tokens[tokens.length - 1].type !== 'nl') {
        if (tokens[tokens.length - 1].type === 'ws') tokens.pop();
        tokens.push({ type: 'nl', value: '\n' });
      }
      continue;
    }

    // Horizontal whitespace
    if (ch === ' ' || ch === '\t' || ch === '\f' || ch === '\v') {
      while (i < n && (input[i] === ' ' || input[i] === '\t' || input[i] === '\f' || input[i] === '\v')) i++;
      if (tokens.length && tokens[tokens.length - 1].type !== 'ws' && tokens[tokens.length - 1].type !== 'nl') {
        tokens.push({ type: 'ws', value: ' ' });
      }
      continue;
    }

    // Line comment
    if (ch === '/' && input[i + 1] === '/') {
      i += 2;
      while (i < n && input[i] !== '\n' && input[i] !== '\r') i++;
      continue;
    }

    // Block comment
    if (ch === '/' && input[i + 1] === '*') {
      const start = i;
      i += 2;
      let hasNewline = false;
      while (i < n && !(input[i] === '*' && input[i + 1] === '/')) {
        if (input[i] === '\n' || input[i] === '\r') hasNewline = true;
        i++;
      }
      i = i < n ? i + 2 : n;
      if (start < i && tokens.length) {
        const last = tokens[tokens.length - 1];
        if (hasNewline && last.type !== 'nl') {
          if (last.type === 'ws') tokens.pop();
          tokens.push({ type: 'nl', value: '\n' });
        } else if (!hasNewline && last.type !== 'ws' && last.type !== 'nl') {
          tokens.push({ type: 'ws', value: ' ' });
        }
      }
      continue;
    }

    // Strings
    if (ch === "'" || ch === '"') {
      let val = ch;
      i++;
      while (i < n) {
        const c = input[i++];
        val += c;
        if (c === '\\' && i < n) val += input[i++];
        else if (c === ch) break;
      }
      const tok = { type: 'str', value: val };
      tokens.push(tok);
      lastSig = tok;
      continue;
    }

    // Template literals (preserved verbatim to protect SQL/C#/VB6/Java snippets & multi-line layouts)
    if (ch === '`') {
      let val = '`';
      i++;
      let interpDepth = 0;
      while (i < n) {
        const c = input[i++];
        val += c;
        if (c === '\\' && i < n) {
          val += input[i++];
        } else if (c === '$' && input[i] === '{') {
          val += input[i++];
          interpDepth++;
          while (i < n && interpDepth > 0) {
            const ic = input[i++];
            val += ic;
            if (ic === '\\' && i < n) val += input[i++];
            else if (ic === "'" || ic === '"') {
              const q = ic;
              while (i < n) {
                const sc = input[i++];
                val += sc;
                if (sc === '\\' && i < n) val += input[i++];
                else if (sc === q) break;
              }
            } else if (ic === '{') interpDepth++;
            else if (ic === '}') interpDepth--;
          }
        } else if (c === '`') {
          break;
        }
      }
      const tok = { type: 'tpl', value: val };
      tokens.push(tok);
      lastSig = tok;
      continue;
    }

    // Regex literal vs Division
    if (ch === '/' && canPrecedeRegex(lastSig)) {
      let val = '/';
      i++;
      let inClass = false;
      while (i < n) {
        const c = input[i++];
        val += c;
        if (c === '\\' && i < n) val += input[i++];
        else if (c === '[') inClass = true;
        else if (c === ']') inClass = false;
        else if (c === '/' && !inClass) break;
      }
      while (i < n && /[gimsuvy]/.test(input[i])) val += input[i++];
      const tok = { type: 'regex', value: val };
      tokens.push(tok);
      lastSig = tok;
      continue;
    }

    // Numbers & Identifiers
    if (isIdStart(ch)) {
      let val = '';
      const startNum = /[0-9]/.test(ch);
      while (i < n && /[A-Za-z0-9_$]/.test(input[i])) {
        val += input[i++];
      }
      // Decimal fraction
      if (startNum && input[i] === '.' && /[0-9]/.test(input[i + 1] || '')) {
        val += input[i++];
        while (i < n && /[0-9_]/.test(input[i])) val += input[i++];
      }
      const tok = { type: startNum ? 'num' : 'id', value: val };
      tokens.push(tok);
      lastSig = tok;
      continue;
    }

    // Multi-char operators & punctuation
    const rest = input.slice(i, i + 4);
    const ops = ['>>>=', '===', '!==', '>>>', '<<=', '>>=', '**=', '&&=', '||=', '??=', '...', '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '++', '--', '+=', '-=', '*=', '/=', '%=', '**', '<<', '>>', '?.'];
    let matchedOp = ops.find((op) => rest.startsWith(op));
    if (matchedOp) {
      i += matchedOp.length;
      const tok = { type: 'op', value: matchedOp };
      tokens.push(tok);
      lastSig = tok;
      continue;
    }

    i++;
    const punc = '{}()[];,.:?';
    const tok = { type: punc.includes(ch) ? 'punc' : 'op', value: ch };
    tokens.push(tok);
    lastSig = tok;
  }

  // Emit with safe whitespace & newline elision
  let out = '';
  const safeNlPrev = new Set([';', '{', ',', '(', '[', '=>', '=', '?', ':', '+', '-', '*', '/', '%', '&&', '||', '??']);
  const safeNlNext = new Set(['}', ')', ']', ';', ',', '.', ':', '&&', '||', '??', '?']);

  for (let idx = 0; idx < tokens.length; idx++) {
    const t = tokens[idx];
    if (t.type !== 'ws' && t.type !== 'nl') {
      out += t.value;
      continue;
    }
    const prev = tokens[idx - 1];
    const next = tokens[idx + 1];
    if (!prev || !next) continue;

    if (t.type === 'nl') {
      if (safeNlPrev.has(prev.value) || safeNlNext.has(next.value)) {
        // Need space only if omitting newline merges dangerous adjacent tokens
        if (prev.value === '+' && next.value.startsWith('+')) out += ' ';
        else if (prev.value === '-' && next.value.startsWith('-')) out += ' ';
        else if (prev.value === '/' && (next.value.startsWith('/') || next.value.startsWith('*'))) out += ' ';
      } else {
        out += '\n';
      }
      continue;
    }

    // Horizontal ws
    const pLast = prev.value[prev.value.length - 1];
    const nFirst = next.value[0];
    const bothWord = /[A-Za-z0-9_$]/.test(pLast) && /[A-Za-z0-9_$]/.test(nFirst);
    const sameSign = (pLast === '+' && nFirst === '+') || (pLast === '-' && nFirst === '-');
    const divAmbig = pLast === '/' && (nFirst === '/' || nFirst === '*');
    const wordRegex = prev.type === 'id' && next.type === 'regex';
    const numDot = prev.type === 'num' && nFirst === '.';
    if (bothWord || sameSign || divAmbig || wordRegex || numDot) {
      out += ' ';
    }
  }

  return out;
}

const rawCss = fs.readFileSync(SRC_CSS, 'utf8');
const minCss = minifyCss(rawCss);

const rawJs = fs.readFileSync(SRC_JS, 'utf8');
const minJs = minifyJs(rawJs);

// Validate minified JS syntax with Node VM
new vm.Script(minJs, { filename: 'app.min.js' });

fs.mkdirSync(OUT_JS_DIR, { recursive: true });
fs.writeFileSync(OUT_JS, minJs, 'utf8');

// Inject minified CSS into index.html if markers are present
const CSS_START = '/* BUILD:CSS_START */';
const CSS_END = '/* BUILD:CSS_END */';
let html = fs.readFileSync(INDEX_HTML, 'utf8');
const startIdx = html.indexOf(CSS_START);
const endIdx = html.indexOf(CSS_END);
if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
  html = html.slice(0, startIdx + CSS_START.length) + minCss + html.slice(endIdx);
  fs.writeFileSync(INDEX_HTML, html, 'utf8');
}

const bytes = (val) => typeof val === 'string' ? Buffer.byteLength(val, 'utf8') : val.length;
const gz = (buf) => zlib.gzipSync(typeof buf === 'string' ? Buffer.from(buf, 'utf8') : buf).length;
const imgPath = path.join(ROOT, 'assets', 'img', 'portrait-2.webp');
const imgBuf = fs.existsSync(imgPath) ? fs.readFileSync(imgPath) : Buffer.alloc(0);

console.log(JSON.stringify({
  styles: { srcBytes: bytes(rawCss), minBytes: bytes(minCss), minGzipBytes: gz(minCss) },
  app: { srcBytes: bytes(rawJs), minBytes: bytes(minJs), minGzipBytes: gz(minJs) },
  html: { bytes: bytes(html), gzipBytes: gz(html), injectedCss: startIdx !== -1 },
  portrait: { bytes: bytes(imgBuf), gzipBytes: gz(imgBuf) },
  totalInitialRawBytes: bytes(html) + bytes(minJs) + bytes(imgBuf),
  totalInitialGzipBytes: gz(html) + gz(minJs) + gz(imgBuf)
}, null, 2));

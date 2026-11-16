(function () {
  'use strict';

  /* ==========================================================================
     STATE & SINGLE-PASS DOM CACHE
     ========================================================================== */
  const MAX_RAM_UNITS = 8;
  const reducedMotionQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  let audioOn = true;
  let audioCtx = null;
  let perkPoints = 5;
  let sandevistanOn = false;
  let overclockOn = false;
  let cwCapacity = 248;
  let ramUnits = 8;
  let ramRegenTimer = null;
  let toastTimer = null;
  let glitchTimer = null;

  const $id = (id) => document.getElementById(id);
  const $all = (sel) => Array.from(document.querySelectorAll(sel));

  const dom = {
    cursorTelemetry: $id('cursorTelemetry'),
    ramCountText: $id('ramCountText'),
    radioBtn: $id('radioBtn'),
    johnnyBanner: $id('johnnyBanner'),
    johnnyQuoteText: $id('johnnyQuoteText'),
    sandevistanBtn: $id('sandevistanBtn'),
    overclockBtn: $id('overclockBtn'),
    humanityReadout: $id('humanityReadout'),
    humanityBarFill: $id('humanityBarFill'),
    cwCapacityReadout: $id('cwCapacityReadout'),
    sandevistanCanvas: $id('sandevistanCanvas'),
    osModeLabel: $id('osModeLabel'),
    hudToast: $id('hudToast'),

    cwInspectorCard: $id('cwInspectorCard'),
    cwTierText: $id('cwTierText'),
    cwRamText: $id('cwRamText'),
    cwTitle: $id('cwTitle'),
    cwCategory: $id('cwCategory'),
    cwLoreQuote: $id('cwLoreQuote'),
    cwStat1: $id('cwStat1'),
    cwStat2: $id('cwStat2'),
    cwStat3: $id('cwStat3'),
    cwBullets: $id('cwBullets'),
    cwCodePreview: $id('cwCodePreview'),
    cwMods: $id('cwMods'),

    mapBriefingCard: $id('mapBriefingCard'),
    gpsRouteLine: $id('gpsRouteLine'),
    gpsTargetPulse: $id('gpsTargetPulse'),
    mapCoordReadout: $id('mapCoordReadout'),
    gpsDistanceReadout: $id('gpsDistanceReadout'),
    gigTypeBadge: $id('gigTypeBadge'),
    gigRewardBadge: $id('gigRewardBadge'),
    gigKicker: $id('gigKicker'),
    gigTitle: $id('gigTitle'),
    gigDesc: $id('gigDesc'),
    gigBlueprint: $id('gigBlueprint'),
    gigTerminalOutput: $id('gigTerminalOutput'),
    gigStackPills: $id('gigStackPills'),
    gigPrimaryLink: $id('gigPrimaryLink'),

    perkCanvasBox: $id('perkCanvasBox'),
    perkInspectorCard: $id('perkInspectorCard'),
    activeTreeTitle: $id('activeTreeTitle'),
    perkTitle: $id('perkTitle'),
    perkSub: $id('perkSub'),
    perkDesc: $id('perkDesc'),
    perkProof: $id('perkProof'),
    perkStatusBadge: $id('perkStatusBadge'),
    perkPointsCount: $id('perkPointsCount'),

    diceRollerCard: $id('diceRollerCard'),
    d10ResultNumber: $id('d10ResultNumber'),
    d10FormulaText: $id('d10FormulaText'),
    d10OutcomeText: $id('d10OutcomeText'),

    questDetailCard: $id('questDetailCard'),
    jqStatus: $id('jqStatus'),
    jqLoc: $id('jqLoc'),
    jqTitle: $id('jqTitle'),
    jqJohnnyQuote: $id('jqJohnnyQuote'),
    jqNarrative: $id('jqNarrative'),
    jqObjectives: $id('jqObjectives'),
    bdLayerReadout: $id('bdLayerReadout'),
    bdEditorBox: $id('bdEditorBox'),
    tarotReadingBox: $id('tarotReadingBox'),

    holoSpeechBox: $id('holoSpeechBox'),
    bpBufferText: $id('bpBufferText'),
    daemon1: $id('daemon1'),
    daemon2: $id('daemon2'),
    daemon3: $id('daemon3')
  };

  const lists = {
    ramPips: $all('#ramPipsContainer .ram-pip'),
    screens: $all('.cp-screen'),
    menuTabs: $all('.cp-menu-tab'),
    cwSlots: $all('.cw-slot-card'),
    cwHotspots: $all('.cw-hotspot'),
    mapPins: $all('.map-pin'),
    mapFilterBtns: $all('.map-filter-btn'),
    attrBtns: $all('.attr-pillar-btn'),
    perkNodes: $all('.perk-node'),
    questBtns: $all('.quest-row-btn'),
    bdBtns: $all('.bd-layer-btn'),
    tarotCards: $all('.tarot-card'),
    hexBtns: $all('#bpMatrixGrid .hex-btn')
  };

  const tabByScreen = Object.create(null);
  for (let i = 0; i < lists.menuTabs.length; i++) {
    const b = lists.menuTabs[i];
    const s = b.getAttribute('data-screen');
    if (s) tabByScreen[s] = b;
  }

  const screenEls = Object.create(null);
  for (let i = 0; i < lists.screens.length; i++) {
    screenEls[lists.screens[i].id] = lists.screens[i];
  }

  const cwBadgeEls = {
    sql_cortex: $id('lvl-sql_cortex'),
    dotnet_deck: $id('lvl-dotnet_deck'),
    vb6_chassis: $id('lvl-vb6_chassis'),
    java_reflex: $id('lvl-java_reflex'),
    node_ts: $id('lvl-node_ts'),
    git_optics: $id('lvl-git_optics')
  };

  const pNodeEls = [];
  const pNodeLabelEls = [];
  const pNodeRankEls = [];
  for (let i = 0; i < 6; i++) {
    pNodeEls.push($id('pnode-' + i));
    pNodeLabelEls.push($id('pnode-label-' + i));
    pNodeRankEls.push($id('prank-' + i));
  }

  const netFloorEls = [];
  const netStatusEls = [];
  for (let i = 0; i < 5; i++) {
    netFloorEls.push($id('net-floor-' + i));
    netStatusEls.push($id('net-status-' + i));
  }

  /* Zero-reflow panel flash using Web Animations API */
  function flashPanel(panelId) {
    const el = dom[panelId] || $id(panelId);
    if (!el || (reducedMotionQuery && reducedMotionQuery.matches)) return;
    if (typeof el.animate === 'function') {
      if (el._flashAnim) el._flashAnim.cancel();
      el._flashAnim = el.animate(
        [
          { boxShadow: '0 0 0 rgba(252, 238, 9, 0)' },
          { boxShadow: '0 0 32px rgba(252, 238, 9, 0.65), inset 0 0 24px rgba(0, 240, 255, 0.28)' },
          { boxShadow: '0 0 0 rgba(252, 238, 9, 0)' }
        ],
        { duration: 360, easing: 'ease' }
      );
    }
  }

  /* ==========================================================================
     CYBERDECK RAM REGENERATION (ON-DEMAND) & KIROSHI RETICLE TELEMETRY
     ========================================================================== */
  function renderRamBar() {
    for (let i = 0; i < lists.ramPips.length; i++) {
      lists.ramPips[i].classList.toggle('spent', i >= ramUnits);
    }
    if (dom.ramCountText) {
      dom.ramCountText.textContent = `${ramUnits}/${MAX_RAM_UNITS} UNIDADES [RECARREGAR]`;
    }
  }

  function stopRamRegen() {
    if (ramRegenTimer !== null) {
      clearInterval(ramRegenTimer);
      ramRegenTimer = null;
    }
  }

  function startRamRegen() {
    if (ramRegenTimer !== null || ramUnits >= MAX_RAM_UNITS || document.hidden) return;
    ramRegenTimer = setInterval(() => {
      if (ramUnits < MAX_RAM_UNITS) {
        ramUnits++;
        renderRamBar();
      }
      if (ramUnits >= MAX_RAM_UNITS) {
        stopRamRegen();
      }
    }, 2000);
  }

  function rechargeAllRam() {
    playUiSound(520, 1480, 0.12, 'triangle');
    ramUnits = MAX_RAM_UNITS;
    stopRamRegen();
    renderRamBar();
    toast('⚡ Cyberdeck RAM 100% recarregada (8/8 Unidades)!');
  }

  function spendRam(cost) {
    if (ramUnits < cost) {
      ramUnits = MAX_RAM_UNITS;
    }
    ramUnits = Math.max(0, ramUnits - cost);
    renderRamBar();
    startRamRegen();
    return true;
  }

  /* ==========================================================================
     WEBAUDIO UI SYNTH & MULTI-STATION NIGHT CITY FM
     ========================================================================== */
  function ensureAudio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playUiSound(freqStart = 640, freqEnd = 1280, dur = 0.09, wave = 'sawtooth') {
    if (!audioOn) return;
    try {
      const ctx = ensureAudio();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, now + dur);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.01);
    } catch (_) {}
  }

  const radioStations = [
    { name: 'OFF', notes: [], tempo: 0, wave: 'triangle' },
    { name: '98.7 BODY HEAT FM', notes: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 293.66, 349.23], tempo: 210, wave: 'triangle' },
    { name: '107.3 MORRO ROCK', notes: [110, 110, 146.83, 110, 164.81, 146.83, 130.81, 98.00], tempo: 180, wave: 'sawtooth' },
    { name: '89.3 PACIFIC DREAMS', notes: [196.00, 246.94, 293.66, 392.00, 329.63, 293.66], tempo: 340, wave: 'sine' }
  ];
  let stationIdx = 0;
  let noteStep = 0;
  let radioInterval = null;

  function startRadioLoop() {
    clearInterval(radioInterval);
    radioInterval = null;
    if (stationIdx === 0 || document.hidden) return;
    const st = radioStations[stationIdx];
    radioInterval = setInterval(() => {
      if (!audioOn || stationIdx === 0 || document.hidden) return;
      const f = st.notes[noteStep % st.notes.length];
      noteStep++;
      playUiSound(f, f * 1.01, st.tempo * 0.00075, st.wave);
    }, st.tempo);
  }

  function cycleNightCityRadio() {
    stationIdx = (stationIdx + 1) % radioStations.length;
    clearInterval(radioInterval);
    radioInterval = null;
    const st = radioStations[stationIdx];
    const btn = dom.radioBtn;
    if (stationIdx === 0) {
      if (btn) {
        btn.textContent = '📻 RÁDIO FM: OFF';
        btn.classList.remove('active');
      }
      toast('Rádio Night City FM desligada');
    } else {
      if (btn) {
        btn.textContent = '📻 ' + st.name;
        btn.classList.add('active');
      }
      toast('SINTONIZADO: ' + st.name);
      noteStep = 0;
      playUiSound(st.notes[0], st.notes[1] || 440, 0.15, st.wave);
      startRadioLoop();
    }
  }

  /* ==========================================================================
     JOHNNY SILVERHAND ENGRAM SUMMON [G]
     ========================================================================== */
  const johnnyLines = [
    '"Acorda, Samurai! Esse garoto mantém sistemas farmacêuticos em produção na Zetti e constrói APIs limpas em C#/.NET e SQL Server. Contrata logo antes que a Arasaka leve!"',
    '"Sabe o que é mais difícil que invadir a Torre Arasaka? Refatorar sistema legado em VB6 para CNPJ Alfanumérico sem derrubar uma única farmácia. O Miqueias faz isso todo dia."',
    '"Olha essa ficha: 8 repositórios auditáveis no GitHub, Árvore AVL em O(log n), Tabela Hash em nanossegundos e APIs com Docker e Swagger. Isso é código de Edgerunner raiz."',
    '"Se você precisa de um Dev Júnior Backend que não treme na frente de Stored Procedures em SQL Server nem de código em produção, achou o mercenário certo."'
  ];
  let johnnyIdx = 0;

  function triggerGlitchClass() {
    document.body.classList.add('relic-malfunction');
    clearTimeout(glitchTimer);
    glitchTimer = setTimeout(() => document.body.classList.remove('relic-malfunction'), 450);
  }

  function summonJohnnyEngram() {
    playUiSound(220, 1340, 0.19, 'sawtooth');
    triggerGlitchClass();
    if (dom.johnnyQuoteText) {
      dom.johnnyQuoteText.textContent = johnnyLines[johnnyIdx % johnnyLines.length];
    }
    johnnyIdx++;
    if (dom.johnnyBanner) dom.johnnyBanner.classList.add('active');
    toast('🎸 ENGRAMA RELIC ATIVADO: JOHNNY SILVERHAND');
  }

  function closeJohnnyEngram() {
    if (dom.johnnyBanner) dom.johnnyBanner.classList.remove('active');
  }

  /* ==========================================================================
     SANDEVISTAN, OVERCLOCK & ON-DEMAND AFTERIMAGE CANVAS
     ========================================================================== */
  const sandyParticles = [];
  let sandevistanRafId = null;
  let canvasCtx = null;
  let canvasW = 0;
  let canvasH = 0;

  function resizeSandevistanCanvas() {
    const canvas = dom.sandevistanCanvas;
    if (!canvas) return;
    canvasW = canvas.width = window.innerWidth || 1280;
    canvasH = canvas.height = window.innerHeight || 720;
  }

  function stopSandevistanCanvas() {
    if (sandevistanRafId !== null) {
      cancelAnimationFrame(sandevistanRafId);
      sandevistanRafId = null;
    }
    if (canvasCtx) canvasCtx.clearRect(0, 0, canvasW, canvasH);
    if (dom.sandevistanCanvas) dom.sandevistanCanvas.classList.remove('active');
  }

  function renderSandevistanFrame() {
    sandevistanRafId = null;
    if (document.hidden) {
      sandyParticles.length = 0;
      stopSandevistanCanvas();
      return;
    }
    if (!canvasCtx || sandyParticles.length === 0) {
      stopSandevistanCanvas();
      return;
    }
    canvasCtx.clearRect(0, 0, canvasW, canvasH);
    canvasCtx.lineWidth = 2;
    const isOver = overclockOn;
    canvasCtx.fillStyle = isOver ? 'rgba(255, 0, 60, 0.09)' : 'rgba(0, 255, 102, 0.09)';

    for (let i = sandyParticles.length - 1; i >= 0; i--) {
      const p = sandyParticles[i];
      canvasCtx.strokeStyle = isOver ? '#FF003C' : (i % 2 === 0 ? '#00FF66' : '#00F0FF');
      canvasCtx.globalAlpha = p.alpha;
      canvasCtx.beginPath();
      canvasCtx.arc(p.x, p.y, p.r, 0, 6.283185307179586);
      canvasCtx.fill();
      canvasCtx.stroke();
      p.r += 0.85;
      p.alpha -= 0.028;
      if (p.alpha <= 0) sandyParticles.splice(i, 1);
    }
    canvasCtx.globalAlpha = 1;

    if (sandyParticles.length > 0 && (sandevistanOn || overclockOn)) {
      sandevistanRafId = requestAnimationFrame(renderSandevistanFrame);
    } else {
      stopSandevistanCanvas();
    }
  }

  function ensureSandevistanLoop() {
    if (!canvasCtx || sandevistanRafId !== null || document.hidden) return;
    if (dom.sandevistanCanvas) dom.sandevistanCanvas.classList.add('active');
    sandevistanRafId = requestAnimationFrame(renderSandevistanFrame);
  }

  (function initSandevistanCanvas() {
    const canvas = dom.sandevistanCanvas;
    if (!canvas || !canvas.getContext) return;
    canvasCtx = canvas.getContext('2d');
    window.addEventListener('resize', resizeSandevistanCanvas, { passive: true });
    resizeSandevistanCanvas();
  })();

  /* Unified rAF-coalesced passive mousemove listener */
  let latestMouseX = -1;
  let latestMouseY = -1;
  let lastRenderedMouseX = -1;
  let lastRenderedMouseY = -1;
  let telRafId = null;

  function flushCursorTelemetry() {
    telRafId = null;
    if (dom.cursorTelemetry && (latestMouseX !== lastRenderedMouseX || latestMouseY !== lastRenderedMouseY)) {
      lastRenderedMouseX = latestMouseX;
      lastRenderedMouseY = latestMouseY;
      dom.cursorTelemetry.textContent =
        `RETÍCULA X:${String(latestMouseX).padStart(4, '0')} Y:${String(latestMouseY).padStart(4, '0')}`;
    }
  }

  window.addEventListener('mousemove', (e) => {
    latestMouseX = e.clientX;
    latestMouseY = e.clientY;
    if (telRafId === null && !document.hidden) {
      telRafId = requestAnimationFrame(flushCursorTelemetry);
    }
    if ((sandevistanOn || overclockOn) && !(reducedMotionQuery && reducedMotionQuery.matches)) {
      sandyParticles.push({ x: e.clientX, y: e.clientY, r: 15, alpha: 0.78 });
      if (sandyParticles.length > 26) sandyParticles.shift();
      ensureSandevistanLoop();
    }
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopRamRegen();
      clearInterval(radioInterval);
      radioInterval = null;
      stopSandevistanCanvas();
      if (telRafId !== null) {
        cancelAnimationFrame(telRafId);
        telRafId = null;
      }
    } else {
      startRamRegen();
      startRadioLoop();
    }
  });

  function updateBiomonitorReadouts() {
    const hum = dom.humanityReadout;
    const bar = dom.humanityBarFill;
    const cap = dom.cwCapacityReadout;
    if (overclockOn) {
      if (hum) hum.textContent = '52 / 90 [OVERCLOCK LIMITE — MODO DAVID MARTINEZ]';
      if (bar) bar.style.width = '58%';
      if (cap) cap.textContent = `${cwCapacity} / 300 [OVERCLOCK MÁXIMO!]`;
    } else if (sandevistanOn) {
      if (hum) hum.textContent = '64 / 90 [SANDEVISTAN APOGEE — DILATAÇÃO 85%]';
      if (bar) bar.style.width = '72%';
      if (cap) cap.textContent = `${cwCapacity} / 300 [APOGEE ATIVO]`;
    } else {
      if (hum) hum.textContent = '78 / 90 [ESTÁVEL — SEM CYBERPSICOSE]';
      if (bar) bar.style.width = '88%';
      if (cap) cap.textContent = `${cwCapacity} / 300 [EDGERUNNER]`;
    }
  }

  function toggleSandevistan() {
    sandevistanOn = !sandevistanOn;
    document.body.classList.toggle('sandevistan-active', sandevistanOn);
    if (dom.sandevistanBtn) dom.sandevistanBtn.classList.toggle('active', sandevistanOn);
    playUiSound(sandevistanOn ? 180 : 980, sandevistanOn ? 1480 : 220, 0.22, 'sawtooth');
    updateBiomonitorReadouts();
    if (!sandevistanOn && !overclockOn) {
      sandyParticles.length = 0;
      stopSandevistanCanvas();
    }
    toast(sandevistanOn
      ? '⚡ MILITECH "APOGEE" SANDEVISTAN ATIVADO (David Martinez Mode)!'
      : 'Sandevistan desativado — Sinapses estabilizadas');
  }

  function toggleCyberpsychosisOverclock() {
    overclockOn = !overclockOn;
    document.body.classList.toggle('cyberpsychosis-overclock', overclockOn);
    if (dom.overclockBtn) dom.overclockBtn.classList.toggle('outline', !overclockOn);
    playUiSound(overclockOn ? 140 : 620, overclockOn ? 1680 : 300, 0.25, 'sawtooth');
    cwCapacity = overclockOn ? 298 : 248;
    updateBiomonitorReadouts();
    if (!sandevistanOn && !overclockOn) {
      sandyParticles.length = 0;
      stopSandevistanCanvas();
    }
    toast(overclockOn
      ? '🔥 OVERCLOCK EDGERUNNER ATIVO: CAPACIDADE 298/300 (Modo David Martinez!)'
      : 'Overclock desativado — Capacidade estabilizada em 248/300');
  }

  const osModes = ['default', 'edgerunners', 'blackwall'];
  const osLabels = { default: 'MIKOSHI OS', edgerunners: 'EDGERUNNERS', blackwall: 'BLACKWALL' };
  let osIdx = 0;

  function triggerRelicGlitch() {
    playUiSound(260, 1180, 0.16);
    triggerGlitchClass();
    osIdx = (osIdx + 1) % osModes.length;
    const mode = osModes[osIdx];
    if (mode === 'default') document.body.removeAttribute('data-cyber-os');
    else document.body.setAttribute('data-cyber-os', mode);
    if (dom.osModeLabel) dom.osModeLabel.textContent = osLabels[mode];
    toast('RELIC BIOCHIP SYNC // MODO: ' + osLabels[mode]);
  }

  function toast(msg) {
    const t = dom.hudToast;
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2700);
  }

  function copyClip(txt, msg) {
    playUiSound(880, 1420, 0.08);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(() => toast(msg)).catch(() => toast(msg));
    } else {
      toast(msg);
    }
  }

  function openGameScreen(screenId, btnEl) {
    playUiSound(440, 980, 0.10);
    for (let i = 0; i < lists.screens.length; i++) {
      const s = lists.screens[i];
      s.classList.toggle('active', s.id === 'screen-' + screenId);
    }
    const activeBtn = btnEl || tabByScreen[screenId];
    for (let i = 0; i < lists.menuTabs.length; i++) {
      const b = lists.menuTabs[i];
      const isAct = b === activeBtn;
      b.classList.toggle('active', isAct);
      b.setAttribute('aria-selected', isAct ? 'true' : 'false');
    }
  }

  /* ==========================================================================
     SCREEN 1 DATA: CYBERWARE SLOTS + LORE QUOTES + REAL CODE SNIPPETS
     ========================================================================== */
  let currentCwKey = 'sql_cortex';
  const cwUpgradeLevels = {
    sql_cortex: 0, dotnet_deck: 0, vb6_chassis: 0, java_reflex: 0, node_ts: 0, git_optics: 0
  };
  const cyberwareData = {
    sql_cortex: {
      tier: 'TIER 5++ // IMPLANTE ICÔNICO DE PRODUÇÃO',
      ram: 'CUSTO HUMANIDADE: 14 HC (4d6)',
      title: 'SQL Server Engine MK.5++',
      cat: 'CÓRTEX FRONTAL // BANCO DE DADOS RELACIONAL EM PRODUÇÃO',
      quote: '"Garoto, esse co-processador SQL aguenta a pressão de dezenas de farmácias rodando ao mesmo tempo sem fritar uma única sinapse." — Viktor Vektor, Ripperdoc',
      s1: '92% PROD', s2: 'ZETTI REAL', s3: 'INT 10 + 8',
      bullets: [
        'Desenvolvimento e otimização diária de <strong>queries, views e stored procedures</strong> em SQL Server na Zetti.',
        'Apoio direto a regras de negócio, correções críticas e atualizações em massa em bases de dados de múltiplas farmácias.',
        'Adequação de esquemas e relatórios para o novo formato alfanumérico do CNPJ e novos impostos.'
      ],
      code: `-- SQL Server Procedure @ Zetti (CNPJ Alfanumérico & Impostos)
CREATE OR ALTER PROCEDURE dbo.sp_ValidarAtualizarCNPJ_Alfa
  @FarmaciaID INT, @NovoCNPJ CHAR(14)
AS BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.UnidadesFarmacia
  SET CNPJ_Alfa = UPPER(@NovoCNPJ), AtualizadoEm = SYSDATETIME()
  WHERE FarmaciaID = @FarmaciaID AND Ativo = 1;
END;`,
      mods: ['SQL Server', 'MySQL', 'PostgreSQL', 'Queries & Views', 'Procedures', 'Modelagem Relacional']
    },
    dotnet_deck: {
      tier: 'TIER 5++ // MILITECH "APOGEE" SANDEVISTAN DECK',
      ram: 'CUSTO HUMANIDADE: 16 HC (4d6+2)',
      title: 'C# / .NET Sandevistan Runtime',
      cat: 'SISTEMA OPERACIONAL // BACKEND, POO & APIs REST',
      quote: '"Esse é o implante que o David Martinez usava para enxergar o código em câmera lenta. C# e .NET puro, direto na espinha dorsal." — Lucy Kushinada',
      s1: 'FOCO #1', s2: 'APIs REST', s3: 'TECH 10 + 8',
      bullets: [
        'Conhecimentos sólidos em <strong>C# e ecossistema .NET</strong> aplicados na construção de projetos estruturados.',
        'Implementação de APIs REST com documentação interativa via <strong>Swagger</strong>, validação de dados e separação em camadas.',
        'Domínio de Programação Orientada a Objetos (POO), lógica de programação e tradução de regras de negócio.'
      ],
      code: `// C# / .NET Core — Arquitetura Limpa & REST Controller
[ApiController]
[Route("api/v1/[controller]")]
public class ProdutosFarmaciaController : ControllerBase {
  private readonly IProdutoService _service;
  public ProdutosFarmaciaController(IProdutoService service) => _service = service;

  [HttpPost("atualizar-lote")]
  public async Task<IActionResult> AtualizarLote([FromBody] LoteFiscalDto dto)
    => Ok(await _service.ProcessarRegrasFiscaisAsync(dto));
}`,
      mods: ['C#', '.NET', 'APIs REST', 'Swagger', 'POO', 'Arquitetura em Camadas']
    },
    vb6_chassis: {
      tier: 'TIER 5+ // BLINDAGEM SUBDÉRMICA DE PRODUÇÃO',
      ram: 'CUSTO HUMANIDADE: 12 HC (3d6)',
      title: 'VB6 Legacy Reactor @ Zetti',
      cat: 'ESQUELETO // SUSTENTAÇÃO DE SISTEMAS CRÍTICOS EM AMBIENTE REAL',
      quote: '"Tecnologia pré-DataKrash de Rache Bartmoss que ainda move o mundo real. Quem domina esse reator mantém a cidade inteira de pé." — Johnny Silverhand',
      s1: '100% DIÁRIO', s2: 'FARMÁCIAS', s3: 'COOL 9 + 8',
      bullets: [
        'Manutenção, correção de bugs e evolução de sistema legado em <strong>VB6</strong> utilizado diariamente por múltiplas farmácias.',
        'Entrega de demandas fiscais e regulatórias críticas como <strong>CNPJ alfanumérico</strong> e novos cálculos de impostos.',
        'Validação rigorosa das correções antes da conclusão de cada chamado em produção.'
      ],
      code: `' VB6 Production Module @ Zetti — Adequação CNPJ Alfanumérico
Public Function ValidarCNPJAlfanumerico(ByVal sCNPJ As String) As Boolean
    Dim sLimpo As String
    sLimpo = UCase$(Trim$(Replace(Replace(sCNPJ, ".", ""), "-", "")))
    If Len(sLimpo) <> 14 Then Exit Function
    ValidarCNPJAlfanumerico = ExecutarRegraFiscalSQL(sLimpo)
End Function`,
      mods: ['VB6 Profissional', 'Regras de Negócio', 'Sistemas Legados', 'CNPJ Alfanumérico', 'Sustentação Crítica']
    },
    java_reflex: {
      tier: 'TIER 5+ // IMPULSOR NEURAL KERENZIKOV',
      ram: 'CUSTO HUMANIDADE: 14 HC (4d6)',
      title: 'Java 17/21, Spring Boot 3 & Algoritmos',
      cat: 'SISTEMA NERVOSO // API CAMADAS, DESKTOP DAO & ESTRUTURAS DE DADOS',
      quote: '"Busca em Árvore AVL em O(log n) e Tabela Hash em O(1) medido em nanossegundos. Rápido como um Kerenzikov em combate." — Wakako Okada',
      s1: '5 PROJETOS', s2: 'O(log n) / O(1)', s3: 'REF 8 + 8',
      bullets: [
        'Arquitetura em 4 camadas (Controller, Service, Repository JPA e Entity) com <strong>Spring Boot 3 e PostgreSQL</strong> (vital-conscious-api).',
        'Aplicação desktop gráfica com <strong>Java 21, JavaFX, JDBC e padrão DAO</strong> (controle-estoque-javafx).',
        'Implementação de <strong>Árvore AVL auto-balanceada, BST e Tabela Hash O(1)</strong> com benchmark em nanossegundos e testes JUnit 5.'
      ],
      code: `// Java 17 — Tabela Hash O(1) & Balanceamento AVL O(log n)
public RegistroCPF buscarO1(String cpf) {
    long t0 = System.nanoTime();
    int bucket = Math.abs(cpf.hashCode()) % capacidade;
    RegistroCPF res = tabela[bucket].buscarPorChave(cpf);
    this.ultimoTempoNs = System.nanoTime() - t0; // ~138ns
    return res;
}`,
      mods: ['Java 17 / 21', 'Spring Boot 3', 'Spring Data JPA', 'JavaFX DAO', 'Árvore AVL & BST', 'Hash Table O(1)', 'JUnit 5']
    },
    node_ts: {
      tier: 'TIER 5++ // MONOFIO TÉRMICO DE NETRUNNER (LUCY)',
      ram: 'CUSTO HUMANIDADE: 12 HC (3d6)',
      title: 'Node.js, TypeScript, Express & NestJS',
      cat: 'BRAÇOS & INTERFACE // APIs REST PAGINADAS, TYPEORM & PRISMA',
      quote: '"Fatia qualquer requisição HTTP com precisão cirúrgica: Express, NestJS, TypeORM, Prisma e Docker prontos para deploy." — Rogue Amendiares',
      s1: 'TOP 1 REPO', s2: 'DOCKER', s3: 'JEST + YUP',
      bullets: [
        'Autor da <strong>api-gestao-produtos</strong> (Express, TypeScript, TypeORM, MySQL, Migrations, Seeds, Yup, Swagger e Docker).',
        'Autor da <strong>vosso-cinema-api</strong> (NestJS, TypeScript, Prisma ORM, PostgreSQL com 5 entidades, Swagger e testes Jest).',
        'Integração ponta a ponta com frontend web responsivo (vosso-cinema-web).'
      ],
      code: `// TypeScript + Express + TypeORM (api-gestao-produtos)
export class ListProductsService {
  async execute({ page = 1, limit = 10 }: PaginationParams) {
    const [items, total] = await productRepository.findAndCount({
      relations: ['category', 'situation'],
      skip: (page - 1) * limit,
      take: limit
    });
    return { items, total, page };
  }
}`,
      mods: ['Node.js', 'TypeScript', 'Express', 'NestJS', 'TypeORM', 'Prisma ORM', 'Docker', 'Jest']
    },
    git_optics: {
      tier: 'TIER 5+ // ÓPTICA KIROSHI "THE ORACLE" MK.5',
      ram: 'CUSTO HUMANIDADE: 10 HC (2d6)',
      title: 'Git, GitKraken, Jira & Visual Studio',
      cat: 'SISTEMA ÓPTICO // FLUXO ÁGIL, VERSIONAMENTO & CONTAINERS',
      quote: '"Enxerga conflitos de merge através das paredes e rastreia cada ticket no Jira até a validação final." — Viktor Vektor',
      s1: 'FLUXO REAL', s2: 'GITLAB/HUB', s3: 'DOCKER',
      bullets: [
        'Uso diário de <strong>Jira, Git, GitHub, GitLab e GitKraken</strong> no ciclo de chamados e code review na Zetti.',
        'Desenvolvimento e depuração utilizando <strong>Visual Studio, VS Code e containers Docker</strong>.',
        'Trabalho em equipe, organização, proatividade e resolução ágil de problemas.'
      ],
      code: `# Pipeline Diário de Engenharia (Zetti & GitHub)
$ git checkout -b fix/JIRA-408-cnpj-alfanumerico
$ docker compose up -d mysql-db api-service
$ npm run typeorm migration:run && npm test
[✓] Todos os checks validados antes de fechar o chamado no Jira.`,
      mods: ['Git', 'GitHub', 'GitLab', 'GitKraken', 'Jira', 'Visual Studio', 'VS Code', 'Docker']
    }
  };

  function selectCyberware(key, btnEl) {
    playUiSound(580, 1180, 0.08);
    currentCwKey = key;
    const d = cyberwareData[key];
    if (!d) return;

    for (let i = 0; i < lists.cwSlots.length; i++) {
      const b = lists.cwSlots[i];
      b.classList.toggle('active', b.getAttribute('data-cw') === key || b === btnEl);
    }
    for (let i = 0; i < lists.cwHotspots.length; i++) {
      const h = lists.cwHotspots[i];
      h.classList.toggle('active', h.getAttribute('data-cw') === key);
    }

    if (dom.cwTierText) dom.cwTierText.textContent = d.tier;
    if (dom.cwRamText) dom.cwRamText.textContent = d.ram;
    if (dom.cwTitle) dom.cwTitle.textContent = d.title;
    if (dom.cwCategory) dom.cwCategory.textContent = d.cat;
    if (dom.cwLoreQuote) dom.cwLoreQuote.textContent = d.quote;
    if (dom.cwStat1) dom.cwStat1.textContent = d.s1;
    if (dom.cwStat2) dom.cwStat2.textContent = d.s2;
    if (dom.cwStat3) dom.cwStat3.textContent = d.s3;
    if (dom.cwBullets) dom.cwBullets.innerHTML = d.bullets.map(b => `<li>${b}</li>`).join('');
    if (dom.cwCodePreview) dom.cwCodePreview.textContent = d.code;
    if (dom.cwMods) {
      dom.cwMods.innerHTML = d.mods.map(m => `<button type="button" onclick="toast('Módulo Ativo: ${m}')">${m}</button>`).join('');
    }
    flashPanel('cwInspectorCard');
    toast('Implante inspecionado: ' + d.title);
  }

  function copyCurrentCwCode() {
    const d = cyberwareData[currentCwKey];
    if (d) copyClip(d.code, 'Snippet de código copiado: ' + d.title);
  }

  function upgradeSelectedCyberware() {
    spendRam(2);
    playUiSound(320, 1640, 0.18, 'sawtooth');
    cwUpgradeLevels[currentCwKey] = (cwUpgradeLevels[currentCwKey] || 0) + 1;
    const lvl = cwUpgradeLevels[currentCwKey];
    const badge = cwBadgeEls[currentCwKey];
    if (badge) badge.textContent = `TIER 5++ [MK.${5 + lvl}]`;
    if (dom.cwTierText) dom.cwTierText.textContent = `TIER 5++ ICÔNICO OVERCLOCKADO [MK.${5 + lvl}] // VIKTOR VEKTOR TUNED`;
    if (dom.cwStat1) dom.cwStat1.textContent = '100% MAX';
    cwCapacity = Math.min(300, cwCapacity + 8);
    updateBiomonitorReadouts();
    flashPanel('cwInspectorCard');
    toast(`🔧 Implante aprimorado para MK.${5 + lvl}! Capacidade: ${cwCapacity}/300`);
  }

  /* ==========================================================================
     SCREEN 2 DATA: MAP PINS + GPS ROUTE + LIVE TERMINAL SIMULATOR
     ========================================================================== */
  let currentMapKey = 'zetti_job';
  let currentMapCloneCmd = 'Miqueias Carvalho — Estagiário de Desenvolvimento @ Zetti (VB6 & SQL Server)';

  const mapPinsData = {
    zetti_job: {
      x: 176, y: 108,
      coord: "COORD: 16°40'S 49°15'W // CORP PLAZA: ZETTI",
      dist: '0.0 KM (QG OPERACIONAL ATUAL)',
      type: 'MISSÃO PRINCIPAL // EM OPERAÇÃO',
      reward: 'FIXER: ZETTI TECH',
      kicker: 'GOIÂNIA, GO · 08/12/2025 — ATUAL',
      title: 'Estagiário de Desenvolvimento — Zetti',
      desc: 'Manutenção, correção e evolução de sistema em produção utilizado diariamente por múltiplas farmácias, apoiando diretamente a operação dos clientes.',
      blueprint: '▸ Manutenção e evolução de sistema legado em VB6.<br>▸ Desenvolvimento e otimização de queries, views e procedures em SQL Server.<br>▸ Adequação ao CNPJ alfanumérico, novos impostos e atualizações em massa.<br>▸ Validação de chamados com Jira, GitHub, GitLab, GitKraken e Visual Studio.',
      terminal: `$ zetti-prod-cli --exec-ticket JIRA-2077
[SQL SERVER] Executando sp_AtualizarImpostosFarmacia...
[VB6 RUNTIME] Módulo de CNPJ Alfanumérico compilado sem regressão.
[QA CHECK] 100% validado em homologação antes da entrega.`,
      stack: ['VB6', 'SQL Server', 'Queries, Views & Procedures', 'Regras de Negócio', 'Jira', 'GitKraken'],
      link: 'https://www.linkedin.com/in/miqueias-henrique-88503b218/',
      linkText: 'Ver Perfil no LinkedIn ↗',
      clone: 'Miqueias Carvalho — Estagiário de Desenvolvimento @ Zetti (VB6 & SQL Server)'
    },
    carvalho_job: {
      x: 264, y: 162,
      coord: "COORD: 16°41'S 49°16'W // CORP PLAZA: CARVALHO",
      dist: '1.8 KM DO QG CENTRAL',
      type: 'MISSÃO CONCLUÍDA // HISTÓRICO',
      reward: '+2500 STREET CRED',
      kicker: 'GOIÂNIA, GO · 2021 — 2025',
      title: 'Auxiliar Administrativo — Carvalho Forros e Divisórias',
      desc: 'Início como Jovem Aprendiz e posterior efetivação devido à organização, disciplina e resolução de problemas no atendimento e gestão documental.',
      blueprint: '▸ Rotinas administrativas e controle de processos internos.<br>▸ Organização de documentos e atendimento direto.<br>▸ Base sólida de responsabilidade profissional e trabalho em equipe.',
      terminal: `$ history-log --company "Carvalho Forros e Divisórias"
[2021] Ingresso como Jovem Aprendiz
[2022-2025] Efetivado como Auxiliar Administrativo
[STATUS] Base sólida de processos, organização e atendimento.`,
      stack: ['Organização', 'Processos Administrativos', 'Atendimento', 'Trabalho em Equipe'],
      link: 'Curriculo_Miqueias_Carvalho.pdf',
      linkText: 'Baixar Currículo PDF ⬇',
      clone: 'Experiência: Carvalho Forros e Divisórias (2021 - 2025)'
    },
    'api-gestao-produtos': {
      x: 456, y: 99,
      coord: "COORD: 16°39'S 49°14'W // AFTERLIFE: CONTRATO DA ROGUE #01",
      dist: '3.4 KM // ROTA RÁPIDA VIA AFTERLIFE',
      type: '★ CONTRATO TOP 1 // RECOMENDADO P/ AVALIAÇÃO',
      reward: 'FIXER: ROGUE (AFTERLIFE)',
      kicker: 'REPOSITÓRIO GITHUB // NODE.JS, TYPESCRIPT & MYSQL',
      title: 'api-gestao-produtos',
      desc: 'API REST completa em Node.js, TypeScript, Express e TypeORM com MySQL. Possui CRUD paginado para produtos, categorias, situações e usuários.',
      blueprint: '▸ Camadas: Express REST → Validação Yup → TypeORM → MySQL.<br>▸ Migrations versionadas e Seeds automatizadas para testes rápidos.<br>▸ Documentação interativa no Swagger + Ambiente Docker pronto.',
      terminal: `$ docker compose up -d && curl -X GET http://localhost:3333/products?page=1
HTTP/1.1 200 OK (Content-Type: application/json)
{ "total": 48, "page": 1, "swagger": "/api-docs", "orm": "TypeORM + MySQL" }`,
      stack: ['Node.js', 'TypeScript', 'Express', 'TypeORM', 'MySQL', 'Yup', 'Swagger', 'Docker'],
      link: 'https://github.com/Miqueias-Henrique/api-gestao-produtos',
      linkText: 'Abrir Repositório no GitHub ↗',
      clone: 'git clone https://github.com/Miqueias-Henrique/api-gestao-produtos.git'
    },
    'vosso-cinema-api': {
      x: 552, y: 171,
      coord: "COORD: 16°38'S 49°13'W // AFTERLIFE: CONTRATO DA ROGUE #02",
      dist: '4.2 KM // SETOR NESTJS',
      type: 'CONTRATO DE FIXER // ARQUITETURA MODULAR',
      reward: 'FIXER: ROGUE (+4200 CRED)',
      kicker: 'REPOSITÓRIO GITHUB // NESTJS, PRISMA & POSTGRESQL',
      title: 'vosso-cinema-api',
      desc: 'API REST para gerenciamento de cinema (filmes, salas, sessões, ingressos e lanches) com arquitetura modular NestJS e Prisma ORM.',
      blueprint: '▸ Modelagem relacional de 5 entidades no PostgreSQL via Prisma ORM.<br>▸ Documentação OpenAPI/Swagger completa.<br>▸ Testes automatizados configurados com Jest.',
      terminal: `$ npx prisma migrate deploy && npm run test:cov
PASS src/movies/movies.service.spec.ts
PASS src/sessions/sessions.controller.spec.ts
[NESTJS] 5 Entidades PostgreSQL + Swagger ativo em /api.`,
      stack: ['NestJS', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'Swagger', 'Jest'],
      link: 'https://github.com/Miqueias-Henrique/vosso-cinema-api',
      linkText: 'Abrir Repositório no GitHub ↗',
      clone: 'git clone https://github.com/Miqueias-Henrique/vosso-cinema-api.git'
    },
    'vital-conscious-api': {
      x: 656, y: 135,
      coord: "COORD: 16°39'S 49°12'W // AFTERLIFE: CONTRATO DA ROGUE #03",
      dist: '5.1 KM // ARCOLOGIA SPRING BOOT',
      type: 'CONTRATO DE FIXER // 4 CAMADAS JAVA',
      reward: 'FIXER: WAKAKO (+4500 CRED)',
      kicker: 'REPOSITÓRIO GITHUB // JAVA 17 & SPRING BOOT 3',
      title: 'vital-conscious-api',
      desc: 'API REST universitária estruturada em 4 camadas (Controller, Service, Repository e Entity) para gestão de alunos e professores.',
      blueprint: '▸ Arquitetura Spring Boot 3 + Spring Data JPA + Hibernate.<br>▸ Banco de dados PostgreSQL e redução de boilerplate com Lombok.<br>▸ Acompanhada de diagramas UML e documentação PDS.',
      terminal: `$ ./mvnw spring-boot:run
[Spring Boot 3.2] HikariPool-1 - Conectado ao PostgreSQL
[JPA] Camadas Controller -> Service -> Repository -> Entity ativas!`,
      stack: ['Java 17', 'Spring Boot 3', 'Spring Data JPA', 'PostgreSQL', 'Lombok'],
      link: 'https://github.com/Miqueias-Henrique/vital-conscious-api',
      linkText: 'Abrir Repositório no GitHub ↗',
      clone: 'git clone https://github.com/Miqueias-Henrique/vital-conscious-api.git'
    },
    'controle-estoque-javafx': {
      x: 152, y: 279,
      coord: "COORD: 16°42'S 49°17'W // JAPACTOWN: CONTRATO WAKAKO #04",
      dist: '2.7 KM // DISTRITO JAVAFX',
      type: 'BICO TÉCNICO // PADRÃO DAO & SQL',
      reward: 'FIXER: WAKAKO OKADA',
      kicker: 'REPOSITÓRIO GITHUB // JAVA 21, JAVAFX & JDBC',
      title: 'controle-estoque-javafx',
      desc: 'Aplicação desktop em Java 21 e JavaFX para controle de estoque com interface gráfica e persistência em PostgreSQL via JDBC.',
      blueprint: '▸ Isolamento da camada de persistência utilizando o Padrão DAO.<br>▸ Conexão JDBC segura com PostgreSQL.<br>▸ Interface JavaFX intuitiva para cadastro e consulta de produtos.',
      terminal: `$ java --module-path javafx-sdk-21/lib --add-modules javafx.controls App
[JDBC DAO] Conexão PostgreSQL estabelecida com sucesso.
[JAVAFX] Tela de Controle de Estoque renderizada.`,
      stack: ['Java 21', 'JavaFX', 'JDBC', 'PostgreSQL', 'Padrão DAO'],
      link: 'https://github.com/Miqueias-Henrique/controle-estoque-javafx',
      linkText: 'Abrir Repositório no GitHub ↗',
      clone: 'git clone https://github.com/Miqueias-Henrique/controle-estoque-javafx.git'
    },
    'catalogo-livros-avl-bst': {
      x: 256, y: 333,
      coord: "COORD: 16°43'S 49°16'W // JAPACTOWN: LAB DE ESTRUTURAS O(log n)",
      dist: '3.1 KM // LAB ALGORITMOS',
      type: 'BICO TÉCNICO // ÁRVORES BINÁRIAS',
      reward: 'COMPLEXIDADE: O(log n)',
      kicker: 'REPOSITÓRIO GITHUB // JAVA 17, AVL & BST',
      title: 'catalogo-livros-avl-bst',
      desc: 'Sistema de catálogo de livros em Java comparando Árvore Binária de Busca (BST) e Árvore AVL auto-balanceada.',
      blueprint: '▸ Rotações simples e duplas garantindo balanceamento AVL.<br>▸ Percursos In-Ordem, Pré-Ordem, Pós-Ordem e Busca em Largura (BFS).<br>▸ Persistência em CSV e telemetria de rotações e comparações.',
      terminal: `$ java -cp bin CatalogoLivrosAVL --benchmark
[BST] Altura: 14 | Comparações: 12
[AVL] Altura: 4 (Balanceada O(log n)) | Rotações Duplas: 3 | CSV salvo!`,
      stack: ['Java 17', 'Árvore AVL', 'Árvore BST', 'BFS / DFS', 'CSV'],
      link: 'https://github.com/Miqueias-Henrique/catalogo-livros-avl-bst',
      linkText: 'Abrir Repositório no GitHub ↗',
      clone: 'git clone https://github.com/Miqueias-Henrique/catalogo-livros-avl-bst.git'
    },
    'tabela-hash-cpf-java': {
      x: 328, y: 261,
      coord: "COORD: 16°42'S 49°15'W // JAPACTOWN: NÚCLEO DE INDEXAÇÃO O(1)",
      dist: '2.9 KM // NÚCLEO HASH O(1)',
      type: 'BICO TÉCNICO // BENCHMARK EM NANOSSEGUNDOS',
      reward: 'COMPLEXIDADE: O(1)',
      kicker: 'REPOSITÓRIO GITHUB // JAVA 17 & HASH TABLE',
      title: 'tabela-hash-cpf-java',
      desc: 'Implementação de Tabela Hash em Java com tratamento de colisões por encadeamento separado (LinkedList) e validação de CPF.',
      blueprint: '▸ Tratamento de colisões via listas encadeadas independentes.<br>▸ Validador matemático de CPF integrado.<br>▸ Medição de desempenho real (colisões, comparações e tempo em ns).',
      terminal: `$ java TabelaHashCPF --lookup 123.456.789-00
[CPF VÁLIDO] Bucket #42 localizado via LinkedList
[BENCHMARK] Tempo de busca O(1): 138 nanossegundos (ns)!`,
      stack: ['Java 17', 'Hash Table', 'LinkedList', 'Validação CPF', 'Benchmark (ns)'],
      link: 'https://github.com/Miqueias-Henrique/tabela-hash-cpf-java',
      linkText: 'Abrir Repositório no GitHub ↗',
      clone: 'git clone https://github.com/Miqueias-Henrique/tabela-hash-cpf-java.git'
    },
    'quiz-cli-java': {
      x: 128, y: 360,
      coord: "COORD: 16°44'S 49°18'W // JAPACTOWN: TERMINAL JUNIT 5",
      dist: '3.8 KM // TERMINAL MAVEN',
      type: 'BICO TÉCNICO // TESTES AUTOMATIZADOS',
      reward: '100% TEST PASS',
      kicker: 'REPOSITÓRIO GITHUB // JAVA 17, MAVEN & JUNIT 5',
      title: 'quiz-cli-java',
      desc: 'Aplicação interativa de quiz no terminal em Java 17 estruturada com Maven e bateria de testes unitários automatizados com JUnit 5.',
      blueprint: '▸ Validação segura de entradas no console.<br>▸ Cálculo de pontuação e percentual de aproveitamento.<br>▸ Cobertura de testes unitários com JUnit 5 Jupiter.',
      terminal: `$ mvn clean test
[INFO] Running com.miqueias.quiz.QuizServiceTest
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0 — BUILD SUCCESS!`,
      stack: ['Java 17', 'Maven', 'JUnit 5', 'POO', 'CLI'],
      link: 'https://github.com/Miqueias-Henrique/quiz-cli-java',
      linkText: 'Abrir Repositório no GitHub ↗',
      clone: 'git clone https://github.com/Miqueias-Henrique/quiz-cli-java.git'
    },
    'vosso-cinema-web': {
      x: 512, y: 288,
      coord: "COORD: 16°42'S 49°13'W // SANTO DOMINGO: DISTRITO WEB UI",
      dist: '3.5 KM // DISTRITO WEB',
      type: 'CONTRATO FRONTEND // INTERFACE RESPONSIVA',
      reward: 'RECOMPENSA: +3200 CRED',
      kicker: 'REPOSITÓRIO GITHUB // HTML5, CSS3, JS & BOOTSTRAP 5',
      title: 'vosso-cinema-web',
      desc: 'Interface web responsiva para gestão de filmes, salas, sessões e venda de ingressos de cinema com persistência via localStorage.',
      blueprint: '▸ Manipulação de DOM com JavaScript Vanilla.<br>▸ Layout responsivo construído com Bootstrap 5.<br>▸ Fluxo completo de cadastro e reserva salvo localmente.',
      terminal: `$ open index.html --storage localStorage
[DOM READY] Módulos de Filmes, Salas, Sessões e Ingressos carregados.
[BOOTSTRAP 5] Grid responsivo sincronizado.`,
      stack: ['JavaScript', 'HTML5', 'CSS3', 'Bootstrap 5', 'LocalStorage'],
      link: 'https://github.com/Miqueias-Henrique/vosso-cinema-web',
      linkText: 'Abrir Repositório no GitHub ↗',
      clone: 'git clone https://github.com/Miqueias-Henrique/vosso-cinema-web.git'
    },
    unifan_edu: {
      x: 632, y: 342,
      coord: "COORD: 16°43'S 49°12'W // SANTO DOMINGO: ACADEMIA UNIFAN",
      dist: '4.0 KM // CAMPUS UNIFAN',
      type: 'FORMAÇÃO SUPERIOR // EM ANDAMENTO',
      reward: 'PREVISÃO: 2027 (68%)',
      kicker: 'GRADUAÇÃO // ENGENHARIA DE SOFTWARE',
      title: 'UNIFAN — Engenharia de Software',
      desc: 'Bacharelado em Engenharia de Software em andamento (conclusão em 2027), somado a cursos complementares e idiomas.',
      blueprint: '▸ Cursos: Banco de Dados (2026), C#, GitHub, Java Básico, Algoritmo, HTML, CSS e Kotlin.<br>▸ Inglês: Intermediário para leitura e compreensão, conversação básica.<br>▸ Espanhol: Intermediário.',
      terminal: `$ unifan-academic-status --student "Miqueias Carvalho"
[CURSO] Bacharelado em Engenharia de Software (68% concluído — 2027)
[CERTIFICADOS] Banco de Dados (2026), C#, GitHub, Java, Algoritmo, Kotlin.`,
      stack: ['Engenharia de Software', 'UNIFAN 2027', 'Banco de Dados (2026)', 'C#', 'Inglês & Espanhol'],
      link: 'Curriculo_Miqueias_Carvalho.pdf',
      linkText: 'Baixar Currículo PDF ⬇',
      clone: 'UNIFAN — Engenharia de Software (Conclusão prevista: 2027)'
    }
  };

  function selectMapPin(pinKey, btnEl) {
    playUiSound(660, 1320, 0.09);
    currentMapKey = pinKey;
    const d = mapPinsData[pinKey];
    if (!d) return;

    for (let i = 0; i < lists.mapPins.length; i++) {
      const p = lists.mapPins[i];
      p.classList.toggle('active', p.getAttribute('data-pin-key') === pinKey || p === btnEl);
    }

    const tx = String(d.x || 456);
    const ty = String(d.y || 99);
    if (dom.gpsRouteLine) {
      dom.gpsRouteLine.setAttribute('x2', tx);
      dom.gpsRouteLine.setAttribute('y2', ty);
    }
    if (dom.gpsTargetPulse) {
      dom.gpsTargetPulse.setAttribute('cx', tx);
      dom.gpsTargetPulse.setAttribute('cy', ty);
    }

    if (dom.mapCoordReadout) dom.mapCoordReadout.textContent = d.coord;
    if (dom.gpsDistanceReadout) dom.gpsDistanceReadout.textContent = 'ROTA GPS TRAÇADA // DISTÂNCIA: ' + d.dist;
    if (dom.gigTypeBadge) dom.gigTypeBadge.textContent = d.type;
    if (dom.gigRewardBadge) dom.gigRewardBadge.textContent = d.reward;
    if (dom.gigKicker) dom.gigKicker.textContent = d.kicker;
    if (dom.gigTitle) dom.gigTitle.textContent = d.title;
    if (dom.gigDesc) dom.gigDesc.textContent = d.desc;
    if (dom.gigBlueprint) dom.gigBlueprint.innerHTML = d.blueprint;
    if (dom.gigTerminalOutput) dom.gigTerminalOutput.textContent = d.terminal;
    if (dom.gigStackPills) {
      dom.gigStackPills.innerHTML = d.stack.map(s => `<button type="button" onclick="toast('Tecnologia: ${s}')">${s}</button>`).join('');
    }
    if (dom.gigPrimaryLink) {
      dom.gigPrimaryLink.href = d.link;
      dom.gigPrimaryLink.textContent = d.linkText;
    }
    currentMapCloneCmd = d.clone;
    flashPanel('mapBriefingCard');
    toast('Rota GPS traçada: ' + d.title);
  }

  function simulateCurrentGigTerminal() {
    spendRam(1);
    playUiSound(420, 1560, 0.14, 'sawtooth');
    const d = mapPinsData[currentMapKey];
    if (dom.gigTerminalOutput && d) {
      dom.gigTerminalOutput.textContent =
        `[EXECUTANDO SIMULAÇÃO KIROSHI — ${new Date().toLocaleTimeString()}]\n` +
        d.terminal +
        `\n[✓] STATUS HTTP 200 // TESTES VALIDADOS COM SUCESSO!`;
    }
    flashPanel('mapBriefingCard');
    toast('▶ Simulação concluída para: ' + (d ? d.title : currentMapKey));
  }

  function copyMapClone() {
    copyClip(currentMapCloneCmd, 'Copiado: ' + currentMapCloneCmd);
  }

  function filterMapPins(cat, btnEl) {
    playUiSound(500, 960, 0.07);
    for (let i = 0; i < lists.mapFilterBtns.length; i++) {
      lists.mapFilterBtns[i].classList.toggle('active', lists.mapFilterBtns[i] === btnEl);
    }
    let firstVisibleKey = null;
    let firstVisibleBtn = null;
    for (let i = 0; i < lists.mapPins.length; i++) {
      const pin = lists.mapPins[i];
      const cats = (pin.getAttribute('data-pin-cat') || '').split(/\s+/);
      const visible = cat === 'all' || cats.includes(cat);
      pin.classList.toggle('hidden-pin', !visible);
      if (visible && !firstVisibleKey) {
        firstVisibleKey = pin.getAttribute('data-pin-key');
        firstVisibleBtn = pin;
      }
    }
    if (firstVisibleKey) {
      selectMapPin(firstVisibleKey, firstVisibleBtn);
    }
  }

  /* ==========================================================================
     SCREEN 3 DATA: ATTRIBUTE & PERK TREES
     ========================================================================== */
  const perkTrees = {
    int: {
      header: 'ÁRVORE ATIVA: INTELIGÊNCIA // ENGENHARIA DE DADOS & SQL SERVER',
      nodes: [
        { label: 'MESTRE SQL', title: 'Arquiteto de Queries, Views & Procedures', sub: 'INTELIGÊNCIA // PRODUÇÃO ZETTI', desc: 'Desenvolvimento e otimização diária de queries, views e stored procedures em SQL Server apoiando regras críticas de negócio.', proof: '✓ Produção Real: Zetti (múltiplas farmácias)<br>✓ Curso: Banco de Dados (2026)' },
        { label: 'PROCEDURES', title: 'Stored Procedures & Regras no Banco', sub: 'INTELIGÊNCIA // AUTOMAÇÃO SQL', desc: 'Encapsulamento e manutenção de lógicas transacionais e fiscais diretamente em procedures do SQL Server.', proof: '✓ Adequação CNPJ Alfanumérico & Novos Impostos' },
        { label: 'VIEWS & JOIN', title: 'Views Analíticas & Relatórios', sub: 'INTELIGÊNCIA // CONSULTAS COMPLEXAS', desc: 'Construção e ajuste de views relacionais para relatórios gerenciais e fiscais de clientes.', proof: '✓ Atualização de relatórios em produção na Zetti' },
        { label: 'MYSQL ORM', title: 'MySQL + TypeORM Migrations', sub: 'INTELIGÊNCIA // PERSISTÊNCIA NODE/TS', desc: 'Modelagem relacional com migrations e seeds automatizadas em MySQL.', proof: '✓ Projeto: api-gestao-produtos' },
        { label: 'POSTGRES', title: 'PostgreSQL + Prisma & Spring JPA', sub: 'INTELIGÊNCIA // MODELAGEM MULTI-ENTIDADE', desc: 'Domínio de PostgreSQL tanto com Prisma ORM (NestJS) quanto com Spring Data JPA / JDBC (Java).', proof: '✓ Projetos: vosso-cinema-api, vital-conscious-api, controle-estoque-javafx' },
        { label: 'MASS UPDATE', title: 'Atualizações Seguras em Massa', sub: 'INTELIGÊNCIA // OPERAÇÃO CRÍTICA', desc: 'Execução validada de scripts de atualização em massa em bases de dados de clientes reais.', proof: '✓ Operação diária validada antes do fechamento de chamados' }
      ]
    },
    tech: {
      header: 'ÁRVORE ATIVA: HABILIDADE TÉCNICA // C#/.NET, APIs REST & DOCKER',
      nodes: [
        { label: 'C# / .NET', title: 'Desenvolvimento Backend C# / .NET', sub: 'HABILIDADE TÉCNICA // VETOR PRINCIPAL', desc: 'Construção de aplicações e APIs utilizando C# e plataforma .NET com foco em código limpo e orientação a objetos.', proof: '✓ Foco principal de carreira como Desenvolvedor Júnior Backend' },
        { label: 'REST API', title: 'Arquitetura de APIs RESTful', sub: 'HABILIDADE TÉCNICA // CONTRATOS HTTP', desc: 'Criação de endpoints paginados, tratamento de status HTTP, DTOs e validações de entrada.', proof: '✓ 3 APIs REST completas publicadas no GitHub' },
        { label: 'SWAGGER', title: 'Documentação OpenAPI / Swagger', sub: 'HABILIDADE TÉCNICA // DX & CONTRATOS', desc: 'Padronização e documentação interativa de rotas REST utilizando Swagger UI.', proof: '✓ Presente em api-gestao-produtos e vosso-cinema-api' },
        { label: 'DOCKER', title: 'Ambientes Containerizados Docker', sub: 'HABILIDADE TÉCNICA // INFRA & DEPLOY', desc: 'Configuração de containers para subir banco de dados e aplicação backend de forma reprodutível.', proof: '✓ Docker configurado em api-gestao-produtos' },
        { label: 'NEST / TS', title: 'TypeScript, Express & NestJS', sub: 'HABILIDADE TÉCNICA // ECOSSISTEMA NODE', desc: 'Desenvolvimento fortemente tipado com validação Yup e testes unitários em Jest.', proof: '✓ Projetos: api-gestao-produtos & vosso-cinema-api' },
        { label: 'CLEAN ARCH', title: 'Separação em Camadas (Controller/Service/Repo)', sub: 'HABILIDADE TÉCNICA // ENGENHARIA', desc: 'Isolamento claro entre controle de requisições, regras de negócio e persistência de dados.', proof: '✓ Aplicado em todos os projetos de API e Desktop' }
      ]
    },
    ref: {
      header: 'ÁRVORE ATIVA: REFLEXOS // JAVA 17/21, SPRING BOOT 3 & ALGORITMOS',
      nodes: [
        { label: 'SPRING 3', title: 'Java 17 & Spring Boot 3 (4 Camadas)', sub: 'REFLEXOS // BACKEND CORPORATIVO', desc: 'Desenvolvimento de API REST com Spring Boot 3, Spring Data JPA, Hibernate e Lombok.', proof: '✓ Projeto: vital-conscious-api' },
        { label: 'AVL O(log n)', title: 'Árvore AVL Auto-Balanceada & BST', sub: 'REFLEXOS // ESTRUTURAS DE DADOS', desc: 'Implementação de rotações simples/duplas, percursos BFS/DFS e métricas comparativas.', proof: '✓ Projeto: catalogo-livros-avl-bst' },
        { label: 'HASH O(1)', title: 'Tabela Hash CPF & Benchmark (ns)', sub: 'REFLEXOS // ALTA VELOCIDADE', desc: 'Indexação O(1) com encadeamento separado (LinkedList) e cronometragem em nanossegundos.', proof: '✓ Projeto: tabela-hash-cpf-java' },
        { label: 'JAVAFX DAO', title: 'Java 21, JavaFX & Padrão DAO', sub: 'REFLEXOS // DESKTOP & JDBC', desc: 'Interface gráfica desktop integrada ao PostgreSQL via JDBC seguindo o padrão DAO.', proof: '✓ Projeto: controle-estoque-javafx' },
        { label: 'JUNIT 5', title: 'Testes Unitários com Maven & JUnit 5', sub: 'REFLEXOS // GARANTIA DE QUALIDADE', desc: 'Automação de testes unitários validando regras de cálculo e entradas.', proof: '✓ Projeto: quiz-cli-java (100% Pass)' },
        { label: 'POO SOLID', title: 'Programação Orientada a Objetos', sub: 'REFLEXOS // BASE SÓLIDA', desc: 'Encapsulamento, polimorfismo, interfaces e tratamento de exceções.', proof: '✓ Base acadêmica UNIFAN + 5 repositórios Java' }
      ]
    },
    body: {
      header: 'ÁRVORE ATIVA: CORPO // SUSTENTAÇÃO EM PRODUÇÃO & SISTEMAS LEGADOS',
      nodes: [
        { label: 'VB6 PROD', title: 'Sustentação Diária em VB6 @ Zetti', sub: 'CORPO // RESILIÊNCIA EM PRODUÇÃO', desc: 'Manutenção, diagnóstico de bugs e evolução de sistema crítico utilizado por múltiplas farmácias.', proof: '✓ Experiência Profissional: Zetti (dez/2025 – Atual)' },
        { label: 'CNPJ ALFA', title: 'Adequação ao CNPJ Alfanumérico', sub: 'CORPO // DEMANDA REGULATÓRIA', desc: 'Adaptação de máscaras, validações e banco de dados para o novo padrão alfanumérico do CNPJ.', proof: '✓ Entregue em produção na Zetti' },
        { label: 'IMPOSTOS', title: 'Atualização Fiscal & Relatórios', sub: 'CORPO // REGRAS FINANCEIRAS', desc: 'Ajuste de relatórios e cálculos para contemplar novas regras de impostos no varejo farmacêutico.', proof: '✓ Entregue em produção na Zetti' },
        { label: 'QA VALID', title: 'Validação Rigorosa Pré-Release', sub: 'CORPO // ZERO REGRESSÃO', desc: 'Testes e validação completa das correções antes da conclusão dos chamados no Jira.', proof: '✓ Rotina diária de qualidade na Zetti' },
        { label: 'DEBUGGER', title: 'Diagnóstico Lógico de Bugs Reais', sub: 'CORPO // RESOLUÇÃO DE PROBLEMAS', desc: 'Rastreamento de gargalos entre aplicação VB6 e procedures SQL Server.', proof: '✓ Soft Skill central destacada no currículo' },
        { label: 'UPTIME', title: 'Foco na Operação do Cliente', sub: 'CORPO // IMPACTO REAL', desc: 'Priorização de chamados que impactam diretamente o atendimento das farmácias.', proof: '✓ Experiência prática Zetti + Carvalho Forros' }
      ]
    },
    cool: {
      header: 'ÁRVORE ATIVA: SANGUE FRIO // ENG. DE SOFTWARE, GIT & IDIOMAS',
      nodes: [
        { label: 'UNIFAN 27', title: 'Engenharia de Software — UNIFAN', sub: 'SANGUE FRIO // GRADUAÇÃO (2027)', desc: 'Formação superior em Engenharia de Software em andamento (68% concluído).', proof: '✓ Previsão de conclusão: 2027' },
        { label: 'GIT FLOW', title: 'Git, GitHub, GitLab & GitKraken', sub: 'SANGUE FRIO // VERSIONAMENTO EM TIME', desc: 'Controle de versão distribuído utilizando linha de comando e GitKraken no fluxo diário.', proof: '✓ Uso diário na Zetti e no GitHub' },
        { label: 'JIRA AGILE', title: 'Gestão de Demandas com Jira', sub: 'SANGUE FRIO // ORGANIZAÇÃO', desc: 'Acompanhamento estruturado de tickets, sprints e validações.', proof: '✓ Fluxo oficial de desenvolvimento na Zetti' },
        { label: 'INGLÊS', title: 'Inglês Intermediário Técnico', sub: 'SANGUE FRIO // COMUNICAÇÃO GLOBAL', desc: 'Leitura e compreensão intermediária de documentações técnicas, com conversação básica.', proof: '✓ Qualificação de Idiomas no Currículo' },
        { label: 'ESPANHOL', title: 'Espanhol Intermediário', sub: 'SANGUE FRIO // IDIOMAS', desc: 'Compreensão e comunicação em nível intermediário.', proof: '✓ Qualificação de Idiomas no Currículo' },
        { label: 'PROATIVO', title: 'Proatividade & Aprendizado Contínuo', sub: 'SANGUE FRIO // PERK COMPORTAMENTAL', desc: 'Evolução constante em C#/.NET, bancos de dados e novas arquiteturas conforme necessidade da equipe.', proof: '✓ 8 cursos complementares concluídos' }
      ]
    }
  };

  let currentTreeKey = 'int';
  let currentNodeIdx = 0;

  function selectAttributeTree(treeKey, btnEl) {
    playUiSound(500, 1120, 0.09);
    currentTreeKey = treeKey;
    for (let i = 0; i < lists.attrBtns.length; i++) {
      lists.attrBtns[i].classList.toggle('active', lists.attrBtns[i] === btnEl);
    }
    const tree = perkTrees[treeKey];
    if (dom.activeTreeTitle && tree) dom.activeTreeTitle.textContent = tree.header;
    if (tree) {
      for (let i = 0; i < tree.nodes.length; i++) {
        if (pNodeLabelEls[i]) pNodeLabelEls[i].textContent = tree.nodes[i].label;
      }
    }
    flashPanel('perkCanvasBox');
    inspectPerkNode(0);
  }

  function inspectPerkNode(idx) {
    playUiSound(720, 1360, 0.07);
    currentNodeIdx = idx;
    const tree = perkTrees[currentTreeKey];
    const n = tree && tree.nodes[idx];
    if (!n) return;

    for (let i = 0; i < lists.perkNodes.length; i++) {
      lists.perkNodes[i].classList.toggle('active', i === idx);
    }
    if (pNodeEls[idx]) pNodeEls[idx].classList.add('unlocked');
    if (pNodeRankEls[idx]) pNodeRankEls[idx].textContent = 'NV 3/3 MAX';

    if (dom.perkTitle) dom.perkTitle.textContent = n.title;
    if (dom.perkSub) dom.perkSub.textContent = n.sub;
    if (dom.perkDesc) dom.perkDesc.textContent = n.desc;
    if (dom.perkProof) dom.perkProof.innerHTML = n.proof;
    if (dom.perkStatusBadge) dom.perkStatusBadge.textContent = 'STATUS: EQUIPADA (NV 3/3)';
    flashPanel('perkInspectorCard');
    toast('Vantagem selecionada: ' + n.title);
  }

  function overclockCurrentPerk() {
    playUiSound(360, 1520, 0.16);
    if (pNodeEls[currentNodeIdx]) pNodeEls[currentNodeIdx].classList.add('unlocked');
    if (pNodeRankEls[currentNodeIdx]) pNodeRankEls[currentNodeIdx].textContent = 'OVERCLOCK ★';
    if (perkPoints > 0) perkPoints--;
    if (dom.perkPointsCount) dom.perkPointsCount.textContent = perkPoints + ' PONTOS DE VANTAGEM DISPONÍVEIS';
    if (dom.perkStatusBadge) dom.perkStatusBadge.textContent = 'STATUS: OVERCLOCK MÁXIMO ✓';
    flashPanel('perkInspectorCard');
    toast('⚡ Vantagem Overclockada: ' + (dom.perkTitle ? dom.perkTitle.textContent : ''));
  }

  function unlockAllPerksInTree() {
    playUiSound(280, 1720, 0.22, 'sawtooth');
    for (let i = 0; i < lists.perkNodes.length; i++) {
      lists.perkNodes[i].classList.add('unlocked');
      if (pNodeRankEls[i]) pNodeRankEls[i].textContent = 'NV 3/3 MAX';
    }
    perkPoints = 0;
    if (dom.perkPointsCount) dom.perkPointsCount.textContent = 'ÁRVORE MAXIMIZADA // NÍVEL 50 EDGERUNNER';
    flashPanel('perkCanvasBox');
    toast('⚡ Todas as Vantagens da Árvore foram maximizadas!');
  }

  /* ==========================================================================
     SCREEN 4: CYBERPUNK RED 1d10 ROLLER & NET ARCHITECTURE ELEVATOR
     ========================================================================== */
  function rollCyberpunkD10(taskName, statName, statVal, skillVal, dv) {
    playUiSound(340, 1480, 0.14);
    const d10 = Math.floor(Math.random() * 10) + 1;
    let bonusCrit = 0;
    let critLabel = '';
    if (d10 === 10) {
      bonusCrit = Math.floor(Math.random() * 10) + 1;
      critLabel = ` [CRÍTICO 10! +${bonusCrit}]`;
    }
    const total = d10 + bonusCrit + statVal + skillVal;
    if (dom.d10ResultNumber) dom.d10ResultNumber.textContent = total;
    if (dom.d10FormulaText) dom.d10FormulaText.textContent = `1d10 [${d10}${critLabel}] + ${statName} [${statVal}] + Perícia [${skillVal}] = ${total} vs DV ${dv}`;
    if (dom.d10OutcomeText) {
      dom.d10OutcomeText.textContent = d10 === 10
        ? `★ SUCESSO CRÍTICO EXPLOSIVO // ${taskName.toUpperCase()}!`
        : `✓ SUCESSO LENDÁRIO (+${total - dv} ACIMA DA DV) // ${taskName.toUpperCase()}`;
    }
    flashPanel('diceRollerCard');
    toast(`🎲 Rolagem Cyberpunk RED: ${total} vs DV ${dv} (${taskName})`);
  }

  let currentNetFloor = 0;
  const netFloorDVs = [12, 15, 17, 18, 20];
  const netFloorNames = [
    'ANDAR 01 // FIREWALL CORPORATIVO',
    'ANDAR 02 // GELO NEGRO: HELLHOUND',
    'ANDAR 03 // NODO SQL SERVER CLUSTER',
    'ANDAR 04 // GELO NEGRO: KRAKEN',
    'ANDAR 05 (ROOT) // CONTRATAR_MIQUEIAS.DAEMON'
  ];

  function hackSpecificNetFloor(floorIdx) {
    currentNetFloor = floorIdx;
    advanceNetArchitecture();
  }

  function advanceNetArchitecture() {
    if (currentNetFloor >= 5) {
      resetNetArchitecture();
      return;
    }
    const dv = netFloorDVs[currentNetFloor];
    const fname = netFloorNames[currentNetFloor];
    rollCyberpunkD10(fname, 'INTERFACE+INT', 10, 8, dv);

    const row = netFloorEls[currentNetFloor];
    const st = netStatusEls[currentNetFloor];
    if (row) {
      row.classList.remove('current');
      row.classList.add('cleared');
    }
    if (st) st.textContent = `DV ${dv} · [HACKEADO ✓]`;

    currentNetFloor++;
    const nextRow = netFloorEls[currentNetFloor];
    if (nextRow) {
      nextRow.classList.add('current');
    } else {
      toast('🏆 ROOT ACCESS CONQUISTADO: Vírus CONTRATAR_MIQUEIAS.daemon instalado!');
    }
  }

  function resetNetArchitecture() {
    playUiSound(400, 820, 0.1);
    currentNetFloor = 0;
    const labels = [
      'DV 12 · [CLIQUE P/ HACKEAR]',
      'DV 15 · [PROGRAMA: ZAP / SLIDE]',
      'DV 17 · [EYE-DEE / PROCEDURES]',
      'DV 18 · [OVERCLOCK C#/.NET]',
      'DV 20 · [ACESSO TOTAL]'
    ];
    for (let i = 0; i < 5; i++) {
      const r = netFloorEls[i];
      const st = netStatusEls[i];
      if (r) {
        r.classList.remove('cleared', 'current');
        if (i === 0) r.classList.add('current');
      }
      if (st) st.textContent = labels[i];
    }
    toast('Arquitetura NET reiniciada para o Andar 01');
  }

  function exportCyberpunkRedSheet() {
    playUiSound(520, 1280, 0.12);
    const sheetText = [
      '====================================================================',
      'CYBERPUNK RED // FICHA DE PERSONAGEM (R. TALSORIAN GAMES)',
      '====================================================================',
      'HANDLE: Miqueias "SQL_Runner" Carvalho',
      'ROLES: Netrunner Rank 8 (Interface) / Tech Rank 8 (Maker)',
      'LOCALIZAÇÃO: Goiânia, GO | CONTATO: (62) 99842-1308 | miqueiash989@gmail.com',
      'LINKEDIN: https://www.linkedin.com/in/miqueias-henrique-88503b218/',
      'GITHUB: https://github.com/Miqueias-Henrique',
      '',
      '[STATS CLÁSSICOS]',
      'INT: 10 | TECH: 10 | REF: 8 | DEX: 8 | COOL: 9',
      'WILL: 9 | LUCK: 8/8 | MOVE: 8 | BODY: 8 | EMP: 9 (78 Humanity)',
      '',
      '[EXPERIÊNCIA EM PRODUÇÃO (GIGS REAIS)]',
      '1. Estagiário de Desenvolvimento — Zetti (08/12/2025 – Atual)',
      '   - Manutenção e evolução de sistema legado em VB6 (múltiplas farmácias)',
      '   - Queries, Views e Stored Procedures em SQL Server',
      '   - Adequação ao CNPJ Alfanumérico, novos impostos e atualizações em massa',
      '2. Auxiliar Administrativo — Carvalho Forros e Divisórias (2021 – 2025)',
      '',
      '[8 PROJETOS AUDITÁVEIS NO GITHUB]',
      '- api-gestao-produtos (Node.js, TS, Express, TypeORM, MySQL, Swagger, Docker)',
      '- vosso-cinema-api (NestJS, TS, Prisma ORM, PostgreSQL, Swagger, Jest)',
      '- vital-conscious-api (Java 17, Spring Boot 3, JPA, PostgreSQL, 4 Camadas)',
      '- controle-estoque-javafx (Java 21, JavaFX, JDBC, PostgreSQL, DAO)',
      '- catalogo-livros-avl-bst (Java 17, Árvores AVL & BST O(log n), CSV)',
      '- tabela-hash-cpf-java (Java 17, Tabela Hash O(1) em nanossegundos)',
      '- quiz-cli-java (Java 17, Maven, JUnit 5)',
      '- vosso-cinema-web (JS, HTML5, CSS3, Bootstrap 5)',
      '===================================================================='
    ].join('\n');
    const blob = new Blob([sheetText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Ficha_Cyberpunk_RED_Miqueias_Carvalho.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('⬇ Ficha Cyberpunk RED (.TXT) exportada com sucesso!');
  }

  /* ==========================================================================
     SCREEN 5 DATA: JOURNAL QUEST LOG + BRAINDANCE 3-LAYER + MISTY TAROT
     ========================================================================== */
  const journalQuests = {
    q_zetti: {
      status: 'STATUS: MISSÃO PRINCIPAL EM RASTREAMENTO',
      loc: 'LOCAL: GOIÂNIA, GO (08/12/2025 – ATUAL)',
      title: 'Estagiário de Desenvolvimento — Zetti',
      quote: '"Acorda, Samurai! Manter sistema em produção rodando em dezenas de farmácias todo santo dia é o que separa os mercenários de verdade dos turistas de Night City." — Johnny Silverhand',
      narrative: 'Atuação profissional diária mantendo, corrigindo e evoluindo sistema utilizado em ambiente real por múltiplas farmácias, com forte atuação em banco de dados SQL Server e regras de negócio.',
      objs: [
        'Manutenção, correção e evolução de sistema legado em VB6 utilizado diariamente por múltiplas farmácias.',
        'Desenvolvimento e otimizar queries, views e procedures em SQL Server.',
        'Atuação em demandas como adequação ao novo formato alfanumérico do CNPJ, atualização de relatórios para novos impostos e atualizações em massa em bases de clientes.',
        'Validação de correções antes da conclusão dos chamados e uso de Jira, GitHub, GitLab, GitKraken e Visual Studio.'
      ]
    },
    q_unifan: {
      status: 'STATUS: FORMAÇÃO ACADÊMICA EM CURSO (68%)',
      loc: 'PREVISÃO DE CONCLUSÃO: 2027',
      title: 'UNIFAN — Bacharelado em Engenharia de Software',
      quote: '"Conhecimento de arquitetura e banco de dados é a única munição que nenhuma megacorporação pode tirar de você." — Alt Cunningham',
      narrative: 'Graduação focada em arquitetura de software, programação orientada a objetos, estruturas de dados, engenharia de requisitos e bancos de dados relacionais.',
      objs: [
        'Cursando Engenharia de Software na UNIFAN (Conclusão em 2027).',
        'Cursos complementares: Banco de Dados (2026), C#, GitHub, Java Básico, Algoritmo, HTML, CSS e Kotlin.',
        'Idiomas: Inglês intermediário (leitura e compreensão, conversação básica) e Espanhol intermediário.'
      ]
    },
    q_carvalho: {
      status: 'STATUS: MISSÃO CONCLUÍDA COM SUCESSO',
      loc: 'PERÍODO: 2021 — 2025 · GOIÂNIA, GO',
      title: 'Auxiliar Administrativo — Carvalho Forros e Divisórias',
      quote: '"Todo Edgerunner de respeito começou aprendendo disciplina e organização na linha de frente." — Viktor Vektor',
      narrative: 'Trajetória iniciada como Jovem Aprendiz e seguida de efetivação, consolidando organização, atendimento ao cliente e gestão de rotinas administrativas.',
      objs: [
        'Execução de rotinas administrativas e organização de documentos.',
        'Atendimento direto a clientes e suporte operacional.',
        'Início como Jovem Aprendiz e posterior efetivação.'
      ]
    },
    q_api_produtos: {
      status: 'STATUS: ★ CONTRATO TOP 1 AUDITÁVEL NO GITHUB',
      loc: 'STACK: NODE.JS · TYPESCRIPT · EXPRESS · TYPEORM · MYSQL',
      title: 'api-gestao-produtos — API REST Completa com Docker',
      quote: '"Esse é o meu contrato favorito no Afterlife: CRUD paginado, TypeORM, MySQL, Swagger e Docker prontos para rodar." — Rogue Amendiares',
      narrative: 'Projeto destaque para avaliação técnica backend: API REST estruturada com CRUD paginado, migrations, seeds, validação com Yup, documentação Swagger e containerização Docker.',
      objs: [
        'CRUD paginado para produtos, categorias, situações e usuários.',
        'Persistência em MySQL via TypeORM com migrations e seeds versionadas.',
        'Validação declarativa com Yup, documentação Swagger e suporte a Docker.'
      ]
    },
    q_cinema_api: {
      status: 'STATUS: CONTRATO CONCLUÍDO NO GITHUB',
      loc: 'STACK: NESTJS · TYPESCRIPT · PRISMA ORM · POSTGRESQL',
      title: 'vosso-cinema-api — Arquitetura Modular NestJS',
      quote: '"Cinco entidades relacionais no PostgreSQL orquestradas com NestJS, Prisma e testes no Jest. Trabalho limpo." — Lucy Kushinada',
      narrative: 'API REST para gerenciamento completo de redes de cinema (filmes, salas, sessões, ingressos e lanches) com Prisma ORM e testes automatizados.',
      objs: [
        '5 entidades relacionais modeladas no PostgreSQL com Prisma ORM.',
        'Documentação interativa no Swagger e validação de DTOs.',
        'Testes automatizados implementados com Jest.'
      ]
    },
    q_vital_api: {
      status: 'STATUS: CONTRATO CONCLUÍDO NO GITHUB',
      loc: 'STACK: JAVA 17 · SPRING BOOT 3 · SPRING DATA JPA · POSTGRESQL',
      title: 'vital-conscious-api — API em 4 Camadas',
      quote: '"Quatro camadas bem separadas com Spring Boot 3 e diagramas de engenharia. Elegante e letal." — Wakako Okada',
      narrative: 'API REST universitária estruturada em Controller, Service, Repository e Entity para gestão acadêmica, acompanhada de diagramas UML e PDS.',
      objs: [
        'Arquitetura em 4 camadas com Spring Boot 3 e Spring Data JPA.',
        'Integração com banco de dados PostgreSQL e uso de Lombok.',
        'Documentação de engenharia de software com diagramas e PDS.'
      ]
    },
    q_javafx_algo: {
      status: 'STATUS: SUITE DE 4 REPOSITÓRIOS JAVA NO GITHUB',
      loc: 'STACK: JAVA 17/21 · JAVAFX · AVL/BST · HASH O(1) · JUNIT 5',
      title: 'Projetos Java Desktop, Estruturas de Dados & Testes',
      quote: '"Árvore AVL auto-balanceada e Tabela Hash medida em nanossegundos. Isso é engenharia raiz." — Rache Bartmoss',
      narrative: 'Conjunto de 4 repositórios demonstrando domínio da linguagem Java desde interfaces desktop com banco SQL até algoritmos clássicos de alta performance.',
      objs: [
        'controle-estoque-javafx: Aplicação desktop Java 21 + JavaFX + JDBC + PostgreSQL no padrão DAO.',
        'catalogo-livros-avl-bst: Comparativo prático entre Árvore BST e Árvore AVL O(log n) com BFS/DFS e CSV.',
        'tabela-hash-cpf-java: Tabela Hash O(1) com LinkedList, validação de CPF e benchmark em nanossegundos.',
        'quiz-cli-java: Aplicação CLI com Maven e bateria de testes unitários 100% aprovados no JUnit 5.'
      ]
    }
  };

  function selectJournalQuest(qKey, btnEl) {
    playUiSound(540, 1080, 0.08);
    const q = journalQuests[qKey];
    if (!q) return;
    for (let i = 0; i < lists.questBtns.length; i++) {
      lists.questBtns[i].classList.toggle('active', lists.questBtns[i] === btnEl);
    }

    if (dom.jqStatus) dom.jqStatus.textContent = q.status;
    if (dom.jqLoc) dom.jqLoc.textContent = q.loc;
    if (dom.jqTitle) dom.jqTitle.textContent = q.title;
    if (dom.jqJohnnyQuote) dom.jqJohnnyQuote.textContent = q.quote;
    if (dom.jqNarrative) dom.jqNarrative.textContent = q.narrative;
    if (dom.jqObjectives) {
      dom.jqObjectives.innerHTML = q.objs.map(o => `
        <div class="quest-obj-item">
          <span class="quest-obj-box">[✓]</span>
          <span>${o}</span>
        </div>
      `).join('');
    }
    flashPanel('questDetailCard');
    toast('Missão carregada: ' + q.title);
  }

  const bdLayers = {
    visual: {
      text: '[CAMADA VISUAL ATIVA]: Telas fiscais e operacionais em VB6 rodando em múltiplas farmácias + Interfaces Swagger UI e JavaFX respondendo sem travamentos.',
      color: '#FCEE09'
    },
    audio: {
      text: '[CAMADA DE ÁUDIO ATIVA]: Comunicação diária com a equipe técnica na Zetti, alinhamento de chamados no Jira, code review no GitHub/GitLab e resolução ágil.',
      color: '#00F0FF'
    },
    thermal: {
      text: '[CAMADA TÉRMICA / DADOS ATIVA]: Assinatura de calor concentrada no SQL Server (Stored Procedures, Views, CNPJ Alfanumérico) e buscas Hash O(1) em 138 nanossegundos!',
      color: '#FF003C'
    }
  };

  function selectBdLayer(layerKey, btnEl) {
    playUiSound(680, 1340, 0.08);
    for (let i = 0; i < lists.bdBtns.length; i++) {
      lists.bdBtns[i].classList.toggle('active', lists.bdBtns[i] === btnEl);
    }
    const layer = bdLayers[layerKey];
    if (dom.bdLayerReadout && layer) {
      dom.bdLayerReadout.textContent = layer.text;
      dom.bdLayerReadout.style.color = layer.color;
    }
    if (dom.bdEditorBox && layer) {
      dom.bdEditorBox.style.borderColor = layer.color;
    }
    toast('Braindance Scanner: Camada ' + layerKey.toUpperCase());
  }

  const tarotReadings = [
    'MISTY OLSZEWSKI — ARCANO 0 (O LOUCO): "O início da jornada. Representa a coragem de Miqueias ao evoluir de Jovem Aprendiz e Auxiliar Administrativo (2021–2025) para mergulhar de cabeça na Engenharia de Software."',
    'MISTY OLSZEWSKI — ARCANO I (O MAGO): "O domínio das ferramentas. C#/.NET, SQL Server, Java 17/21, Node.js/NestJS e Docker canalizados em 8 projetos reais e documentados no GitHub."',
    'MISTY OLSZEWSKI — ARCANO IX (O EREMITA): "A sabedoria de quem decifra códigos ancestrais. Na Zetti, Miqueias domina sistemas legados em VB6 e procedures complexas que mantêm dezenas de farmácias operando."',
    'MISTY OLSZEWSKI — ARCANO XXI (O MUNDO): "A realização. Com experiência real em produção e graduação na UNIFAN (2027), ele está pronto para assumir missões como Desenvolvedor Backend Júnior."'
  ];

  function inspectTarotCard(idx, cardEl) {
    playUiSound(480, 1240, 0.11, 'triangle');
    for (let i = 0; i < lists.tarotCards.length; i++) {
      lists.tarotCards[i].classList.toggle('active', i === idx || lists.tarotCards[i] === cardEl);
    }
    if (dom.tarotReadingBox && tarotReadings[idx]) {
      dom.tarotReadingBox.textContent = tarotReadings[idx];
    }
    if (tarotReadings[idx]) toast(tarotReadings[idx].split(':')[0]);
  }

  /* ==========================================================================
     SCREEN 6: HOLOCALL & BREACH PROTOCOL + AUTO-SOLVER
     ========================================================================== */
  function setSpeech(txt) {
    if (dom.holoSpeechBox) dom.holoSpeechBox.innerHTML = '"' + txt + '"';
  }

  let bpBuffer = [];

  function pickHex(btnEl, code) {
    if (bpBuffer.length >= 5) {
      resetBreachMatrix();
    }
    playUiSound(780, 1480, 0.07);
    if (btnEl) btnEl.classList.add('used');
    bpBuffer.push(code);
    if (dom.bpBufferText) dom.bpBufferText.textContent = 'BUFFER: [ ' + bpBuffer.join(' ') + ' ]';

    const seq = bpBuffer.join(' ');
    if (dom.daemon1 && (seq.includes('1C 55 BD') || code === '1C')) {
      dom.daemon1.classList.add('unlocked');
    }
    if (dom.daemon2 && (seq.includes('55 BD E9') || bpBuffer.length >= 3)) {
      dom.daemon2.classList.add('unlocked');
    }
    if (dom.daemon3 && (seq.includes('BD E9 7A') || bpBuffer.length >= 4)) {
      dom.daemon3.classList.add('unlocked');
    }
    toast('Hex injetado no Buffer: ' + code);
  }

  function unlockSingleDaemon(num) {
    playUiSound(520, 1480, 0.12);
    const el = dom['daemon' + num];
    if (el) el.classList.add('unlocked');
    if (num === 3 && !sandevistanOn) toggleSandevistan();
    toast('⚡ Daemon #' + num + ' executado diretamente!');
  }

  function autoSolveBreachProtocol() {
    playUiSound(300, 1680, 0.22, 'sawtooth');
    resetBreachMatrix();
    const targetSeq = ['1C', '55', 'BD', 'E9', '7A'];
    for (let i = 0; i < targetSeq.length; i++) {
      const code = targetSeq[i];
      const idx = i;
      setTimeout(() => {
        if (lists.hexBtns[idx]) pickHex(lists.hexBtns[idx], code);
      }, idx * 120);
    }
    toast('⚡ Auto-Hack Kiroshi: 3 Daemons Desbloqueados!');
  }

  function resetBreachMatrix() {
    playUiSound(400, 900, 0.1);
    bpBuffer = [];
    if (dom.bpBufferText) dom.bpBufferText.textContent = 'BUFFER: [ _ _ _ _ _ ]';
    for (let i = 0; i < lists.hexBtns.length; i++) {
      lists.hexBtns[i].classList.remove('used');
    }
    if (dom.daemon1) dom.daemon1.classList.remove('unlocked');
    if (dom.daemon2) dom.daemon2.classList.remove('unlocked');
    if (dom.daemon3) dom.daemon3.classList.remove('unlocked');
  }

  /* ==========================================================================
     HOTKEYS I, M, P, R, J, H, E, G, O
     ========================================================================== */
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const k = e.key.toLowerCase();
    if (k === 'i' || k === '1') openGameScreen('cyberware');
    else if (k === 'm' || k === '2') openGameScreen('mapa');
    else if (k === 'p' || k === '3') openGameScreen('perks');
    else if (k === 'r' || k === '4') openGameScreen('trpg');
    else if (k === 'j' || k === '5') openGameScreen('diario');
    else if (k === 'h' || k === '6') openGameScreen('holocall');
    else if (k === 'e') toggleSandevistan();
    else if (k === 'g') summonJohnnyEngram();
    else if (k === 'o') toggleCyberpsychosisOverclock();
  });

  Object.assign(window, {
    openGameScreen,
    selectCyberware,
    copyCurrentCwCode,
    upgradeSelectedCyberware,
    selectMapPin,
    simulateCurrentGigTerminal,
    copyMapClone,
    filterMapPins,
    selectAttributeTree,
    inspectPerkNode,
    overclockCurrentPerk,
    unlockAllPerksInTree,
    rollCyberpunkD10,
    hackSpecificNetFloor,
    advanceNetArchitecture,
    resetNetArchitecture,
    exportCyberpunkRedSheet,
    selectJournalQuest,
    selectBdLayer,
    inspectTarotCard,
    setSpeech,
    pickHex,
    unlockSingleDaemon,
    autoSolveBreachProtocol,
    resetBreachMatrix,
    rechargeAllRam,
    cycleNightCityRadio,
    summonJohnnyEngram,
    closeJohnnyEngram,
    toggleSandevistan,
    toggleCyberpsychosisOverclock,
    triggerRelicGlitch,
    toast,
    copyClip
  });
})();

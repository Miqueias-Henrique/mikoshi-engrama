# Design System Master File — MIKOSHI // ENGRAMA (Kiroshi Scanner & Night City HUD)

> **CONCEITO NORTEADOR:** *"O visitante é o V — o jogo é a embalagem, nunca a fechadura."*
> Nenhuma informação essencial (contato, CV, stack, experiência real na Zetti) fica bloqueada atrás de mini-game, animação ou easter egg.

---

**Project:** MIKOSHI // ENGRAMA MIQUEIAS CARVALHO (`portfolio-cyberpunk-2077`)
**Architecture:** Vanilla HTML5 + CSS Custom Properties (3-Layer Tokens) + Zero-Dependency ES6 (`scripts/build.mjs`)
**Token Files:** `assets/design-tokens.json`, `assets/design-tokens.css`, `design-system/cyberpunk-2077-portfolio/tokens.json`

---

## 1. Paleta de Cores (In-Game Cyberpunk 2077 HUD)

O amarelo `#FCEE09` é reservado **exclusivamente para CTAs primários, missão principal (Zetti) e estado de foco ativo**. Toda a estrutura do HUD utiliza o **vermelho-coral** (`#FF5A50`) e o **ciano óptico Kiroshi** (`#5EF6FF`) sobre superfície abissal (`#08070C`).

| Camada | Token CSS | Valor | Papel Semântico |
|---|---|---|---|
| Primitiva / HUD | `--cp-coral` | `#FF5A50` | Rótulos do Scanner Kiroshi, divisores e molduras primárias |
| Primitiva / HUD | `--cp-cyan` | `#5EF6FF` | Retícula de lock-on, valores escaneados e links técnicos |
| Primitiva / CTA | `--cp-yellow` | `#FCEE09` | **Apenas** CTA primário (`VER MISSÕES`), Missão Principal e foco |
| Primitiva / Status | `--cp-green` | `#00FF85` | Indicador `Disponível para contrato` e saída de código/terminal |
| Primitiva / Nômade | `--cp-iconic` | `#FF9E00` | Destaque de Lifepath Nômade e distrito Pacifica |
| Superfície Base | `--menu-bg` | `#08070C` | Fundo principal de Night City |
| Superfície Painel | `--menu-surface` | `rgba(14, 13, 20, 0.94)` | Painel principal em destaque (1 por tela) |
| Superfície Card | `--menu-card` | `rgba(20, 18, 28, 0.92)` | Cartões secundários com hairline discreto |
| Borda Hairline | `--hairline` | `rgba(255, 90, 80, 0.22)` | Divisores sutis de 1px sem poluição visual |
| Borda Destaque | `--hairline-strong` | `rgba(94, 246, 255, 0.36)` | Contorno de retícula ativa e cabeçalhos |
| Texto Principal | `--menu-text` | `#F8FAFC` | Títulos e leitura principal (contraste AAA) |
| Texto Secundário | `--menu-text-sub` | `#E2E8F0` | Descrições STAR e narrativas |
| Texto Muted | `--menu-text-muted` | `#94A3B8` | Metadados secundários |

---

## 2. Tipografia em 3 Camadas

- **Display Condensado (`--font-display`):** `'Rajdhani', 'Orbitron', system-ui, sans-serif` — Títulos de atos, `<h1> Miqueias Carvalho`, cabeçalhos de contratos.
- **Corpo Legível (`--font-sans`):** `'Rajdhani', system-ui, -apple-system, sans-serif` — Resumo executivo, descrições STAR, respostas do Holocall.
- **Dados & Código (`--font-mono`):** `'JetBrains Mono', ui-monospace, monospace` — **Exclusivo** para campos do Scanner Kiroshi, snippets de código (T-SQL, C#, VB6, Java, TypeScript) e telemetria.

---

## 3. Overrides por Ato e Distrito (`data-district` & `data-lifepath`)

| Ato | Seção | Distrito | Atmosfera & Regras de Override |
|---|---|---|---|
| **ATO 0 & 1** | Boot & Hero "Scan do Alvo" | **Watson** (`data-district="watson"`) | Retícula ciano `#5EF6FF` com lock-on no retrato `portrait-2.webp`, tabela Kiroshi com rótulos `#FF5A50`, `<h1>` visível e no máximo 2 CTAs (`VER MISSÕES` e `ABRIR HOLOCALL`). |
| **ATO 2** | Escolha de Lifepath | **Corpo Plaza / Net** | 3 rotas sincronizadas via `?path=corpo\|netrunner\|nomade`: **CORPO** (Recrutador 30s), **NETRUNNER** (Tech Lead / código + arquitetura), **NÔMADE** (Explorador / jogo completo). |
| **ATO 3** | Missões & Contratos STAR | **City Center** (`data-district="city-center"`) | Ciano corporativo `#5EF6FF`; cada projeto estruturado em `01 O CONTRATO`, `02 O ALVO`, `03 O HACK`, `04 A RECOMPENSA`, `05 A PROVA` + Feed GitHub ao vivo. |
| **Sobre** | Trajetória & Braindance | **Pacifica** (`data-district="pacifica"`) | Âmbar `#FF9E00`; linha do tempo `2021 → 2026` com 3 camadas narrativas: **Visual** (o que fiz), **Áudio** (o que aprendi), **Térmica** (onde senti pressão). |
| **ATO 4** | Holocall & Diálogo | **Afterlife** (`data-district="afterlife"`) | Neon vermelho/ciano; roda de diálogo com opções amarelas (missão principal) e azuis (opcionais) + widget de chamada entrando. |
| **ATO 5** | Final de Tarô & Créditos | **Mikoshi** | 4 finais dinâmicos conforme a jornada (**O Sol**, **A Estrela**, **O Diabo**, **Temperança**) + rolar de créditos. |
| **Modo Corpo** | "Desligar Implantes" | **Arasaka Executive** (`body.implants-off`) | Versão limpa, sem efeitos, alto contraste, legível por ATS e com `@media print` gerando currículo de 1 página. |

---

## 4. Navegação em Duas Camadas & Mobile ("O Telefone do V")

- **Rótulos claros + Subtítulo em lore:**
  - **Skills** · *Ripperdoc*
  - **Projetos** · *Gigs*
  - **Trajetória** · *Braindance*
  - **Contato** · *Holocall*
  - **Extras** · *Ficha RED*
- **Mobile (`390×844`):**
  - Atalhos de teclado ocultos em dispositivos touch (`@media (hover: none)`).
  - Nome, cargo, afiliação (Zetti) e CTA visíveis **sem rolar** na primeira dobra.
  - Barra inferior fixa com 4 ações: `Scan`, `Missões`, `Mensagens`, `Mais`.

# ⚡ MIKOSHI // ENGRAMA MIQUEIAS CARVALHO

> **"Wake the f*ck up, Samurai. We have legacy code to refactor and APIs to ship."**

Dossiê neural e portfólio gamificado de **Miqueias Carvalho** (Desenvolvedor de Software Júnior | Backend | C#/.NET | SQL Server), construído do zero como uma recriação fiel do **Menu de Pausa In-Game do Cyberpunk 2077 (Patch 2.1)** fundido com mecânicas de **Cyberpunk: Edgerunners (Studio Trigger)**, **Cyberpunk RED / 2020 (RPG de Mesa de Mike Pondsmith)** e literatura clássica Cyberpunk (*Neuromancer* de William Gibson / *DataKrash* de Rache Bartmoss).

- 🌐 **Live Demo (GitHub Pages):** [https://miqueias-henrique.github.io/mikoshi-engrama/](https://miqueias-henrique.github.io/mikoshi-engrama/)
- 📦 **Repositório:** [https://github.com/Miqueias-Henrique/mikoshi-engrama](https://github.com/Miqueias-Henrique/mikoshi-engrama)
- 📄 **Repositório Base (Dados Originais Preservados):** [https://github.com/Miqueias-Henrique/miqueias-henrique.github.io](https://github.com/Miqueias-Henrique/miqueias-henrique.github.io)

---

## 🔥 Novidades da Edição Potencializada (v2.1)

1. **Barra de Telemetria Kiroshi Mk.5 & Unidades de RAM do Cyberdeck (`8/8 RAM`):**
   - Rastreamento óptico em tempo real das coordenadas do cursor (`RETÍCULA X/Y`) e barra de **Unidades de RAM** que são consumidas ao fazer *Upgrade de Cyberware* ou *Simular Execução de Projetos* e recarregam automaticamente.
2. **Engrama Holográfico do Johnny Silverhand (`[G]`):**
   - Pressione `[G]` ou clique em `🎸 JOHNNY [G]` no topo para disparar o efeito de *Relic Malfunction* e invocar comentários ácidos do Johnny Silverhand sobre sustentação em produção, VB6, SQL Server e seus projetos no GitHub.
3. **Clínica de Ripperdoc (`[I]`) com Blueprint de Código Real, Upgrade Tier 5++ & Overclock (`[O]`):**
   - Cada implante cibernético exibe um **trecho de código real** (*Stored Procedure SQL Server*, *Controller C#/.NET*, *Módulo Fiscal VB6*, *Busca Hash O(1) em Java 17*, *Service paginado em TypeScript/TypeORM*).
   - Botão **Aprimorar Implante (+1 Tier)** e modo **Overclock Edgerunner (`[O]`)** que eleva a capacidade a `298/300` com aura vermelha de limite de empatia.
4. **Mapa Tático (`[M]`) com Traçado de Rota GPS Animado & Terminal Live Runner:**
   - Clicar em qualquer um dos **11 pinos** desenha dinamicamente uma **rota GPS tracejada neon** a partir do QG na Zetti até o contrato escolhido, calculando a distância em KM.
   - Inclui um **Terminal de Simulação do Projeto** que executa os comandos reais (`docker compose`, `curl`, `mvn test`, `java benchmark ns`) de cada repositório.
5. **Ficha RPG de Mesa Cyberpunk RED (`[R]`) com Elevador de Arquitetura NET (5 Andares) & Exportação `.TXT`:**
   - Além dos 10 atributos clássicos e do **Rolador `1d10 + STAT + PERÍCIA vs DV`** (com explosão crítica no `10`), inclui o mini-jogo oficial de **Invasão de Arquitetura NET em 5 Andares** (*Firewall DV12 → Hellhound DV15 → SQL Cluster DV17 → Kraken DV18 → Root Virus DV20*) e botão para baixar a ficha completa em `.TXT`.
6. **Diário (`[J]`) com Scanner de Braindance em 3 Camadas (Judy Alvarez) & Tarô da Misty:**
   - Alterne entre a **Camada Visual**, **Camada de Áudio** e **Camada Térmica / SQL** da operação profissional de Miqueias, além de consultar a leitura esotérica de *Misty Olszewski* para os 4 Arcanos Maiores do Tarô.
7. **Holocall & Breach Protocol (`[H]`) com Auto-Hack Kiroshi & Rádio Multi-Estações:**
   - Botão **Auto-Hack Kiroshi** que resolve automaticamente a matriz hexadecimal desbloqueando os 3 Daemons em sequência, e **Rádio FM** com 3 estações sintetizadas via WebAudio (*98.7 Body Heat FM*, *107.3 Morro Rock* e *89.3 Pacific Dreams*).

---

## ⚡ Arquitetura & Otimizações de Performance (v2.2)

- **Pipeline Modular e Build Reprodutível (`node scripts/build.mjs`):**
  - Código-fonte separado em [`src/styles.css`](src/styles.css) e [`src/app.js`](src/app.js), minificado em CSS crítico inline no [`index.html`](index.html) e JavaScript externo em cache com `defer` em [`assets/js/app.min.js`](assets/js/app.min.js) (validado via `vm.Script` + `node --check`).
- **Retrato Único Otimizado (`portrait-2.webp`):**
  - Mantido exclusivamente o retrato [`assets/img/portrait-2.webp`](assets/img/portrait-2.webp) (`7,21 KB` / `272×363`) no slot do Ripperdoc e no Holocall com `fetchpriority="high"` + `<link rel="preload" as="image">`, eliminando ~185 KB de Base64 inline bloqueante.
- **CPU, GPU e Renderização Sob Demanda:**
  - Loop do `sandevistanCanvas`, regeneração de RAM e eventos de `mousemove` (fundidos com `requestAnimationFrame` + `{ passive: true }`) operam exclusivamente sob demanda e pausam em aba oculta (`visibilitychange`), levando o consumo ocioso de canvas a zero.
  - Flash de painéis via **Web Animations API (`element.animate`)** sem reflow forçado, contenção de layout CSS (`contain: content / strict / layout style`), fontes assíncronas não-bloqueantes (`media="print"`) e suporte a `prefers-reduced-motion`.

| Métrica (Chromium Headless CDP) | Antes (`v2.1`) | Depois (`v2.2`) | Ganho |
| :--- | :---: | :---: | :---: |
| **`index.html` (crítico p/ 1ª renderização, gzip)** | `132.138 B` (`129 KB`) | `21.641 B` (`21,1 KB`) | **-83,6%** |
| **Transferência inicial total (raw / gzip)** | `295.478 B` / `133.876 B` | `167.755 B` / `52.064 B` | **-43,2% raw / -61,1% gzip** |
| **Desenhos em Canvas ocioso (`500 ms`)** | `31 chamadas` | `0 chamadas` | **-100%** |
| **Recálculos de Layout sob stress interativo** | `58` (`81 ms`) | `8` (`17 ms`) | **-86,2% layouts / -79,0% ms** |
| **Recálculos de Estilo sob stress interativo** | `65` | `42` | **-35,4%** |
| **Overflow horizontal mobile (`390×844`, 6 telas)** | — | `0 px` | **100% responsivo** |


# Portfólio — Miqueias Carvalho // Cyberpunk 2077 Edition (`KIROSHI OPTICS HUD v2.077`)

Repositório do portfólio e currículo online de **Miqueias Carvalho** com direção de arte e interface inspiradas em **Cyberpunk 2077** (*Kiroshi Optics HUD*, *Relic Biochip* e *Cyberdeck OS*).

- **Titular**: Miqueias Carvalho — Desenvolvedor de Software Júnior | Backend | C#/.NET | SQL Server
- **Localização**: Goiânia, GO (Disponível Presencial / Híbrido / Remoto)
- **Base de Dados**: Construído do zero em um novo repositório preservando 100% dos dados reais, fotos, projetos e currículo em PDF de [`miqueias-henrique.github.io`](https://github.com/Miqueias-Henrique/miqueias-henrique.github.io).

---

## Arquitetura & Design System

Este projeto foi construído integrando quatro frentes de engenharia de interface:

1. **Three-Layer Design Tokens (`assets/design-tokens.json` & `assets/design-tokens.css`)**:
   - **Camada Primitiva**: Paleta cromática *Night City* (`--primitive-color-cyber-yellow-400: #FCEE09`, `--primitive-color-kiroshi-cyan-400: #00F0FF`, `--primitive-color-samurai-red-500: #FF003C`, `--primitive-color-daemon-green-400: #00FF66`), escalas tipográficas (`Orbitron`, `Rajdhani`, `JetBrains Mono`) e geometria chanfrada (`clip-path` em 45°).
   - **Camada Semântica**: Variáveis dinâmicas para troca instantânea entre **5 Sistemas Operacionais de Facções de Cyberpunk 2077**:
     - `NIGHT CITY // V` (Amarelo Cyber `#FCEE09` & Ciano Kiroshi `#00F0FF`)
     - `ARASAKA // CORP` (Carmesim Corporativo `#FF003C` & Platina `#F8FAFC`)
     - `NETWATCH // BREACH` (Verde Daemon `#00FF66` & Ciano Gelo `#00F0FF`)
     - `EDGERUNNERS // SANDEVISTAN` (Ciano `#00F0FF`, Amarelo Choque `#FCEE09` & Magenta Lucy `#D946EF`)
     - `SAMURAI // SILVERHAND` (Âmbar Afterlife `#FF9E00`, Vermelho Rebelde `#FF003C` & Cromo `#E2E8F0`)
   - **Camada de Componentes**: Tokens dedicados para botões chanfrados, cards de telemetria, badges e modais.

2. **Componentes Acessíveis (Padrão `shadcn/ui` + WAI-ARIA)**:
   - **Tabs (`role="tablist"`, `role="tab"`, `role="tabpanel"`)**: Navegação acessível por teclado e atalhos rápidos (`1` a `4`):
     - `01 // Dossiê Merc`: Resumo executivo, KPIs de produção, barras de telemetria e destaques de arquitetura.
     - `02 // Gigs & Projetos`: Experiência profissional real (**Zetti** com VB6 e SQL Server; **Carvalho Forros e Divisórias**) e **8 projetos práticos no GitHub** com filtro por categoria e **Modal Inspetor de Arquitetura**.
     - `03 // Cyberware & Tech`: Stack técnica categorizada (`SYS.LANG`, `SYS.DATA`, `SYS.API`, `SYS.GIT`, `SYS.TOOL`), graduação em **Engenharia de Software (UNIFAN — 2027)**, idiomas, cursos e mini-game interativo **Breach Protocol**.
     - `04 // Holocall`: Canais diretos sem fricção (WhatsApp `(62) 99842-1308`, E-mail `miqueiash989@gmail.com`, LinkedIn, GitHub e download direto do currículo em PDF).
   - **Command Console / Quickhacks (`Ctrl+K`)**: Modal rápido para acionar WhatsApp, copiar e-mail, inspecionar repositórios, baixar PDF ou trocar o tema Cyberpunk.

3. **Efeitos Visuais & Áudio Sintetizado**:
   - **Scanner Óptico Kiroshi**: Retrato interativo com anéis de mira rotativos e transição cromática entre as 4 fotos reais a cada seção.
   - **Canvas Interativo (`#cyberdeckCanvas`)**: Malha tática e chuva de dados *Night City* em HTML5 Canvas que reage ao cursor e respeita `prefers-reduced-motion`.
   - **Sintetizador WebAudio (`Áudio: ON/OFF`)**: Efeitos sonoros futuristas gerados via Web Audio API sem dependências externas.

---

## Estrutura de Arquivos

- `index.html` — Aplicação principal auto-contida com HUD Cyberpunk 2077.
- `assets/design-tokens.json` — Fonte da verdade de Design Tokens (W3C DTCG em 3 camadas).
- `assets/design-tokens.css` — Variáveis CSS compiladas + temas das 5 facções Cyberpunk.
- `docs/brand-guidelines.md` — Diretrizes de marca e filosofia visual.
- `design-system/cyberpunk-2077-portfolio/MASTER.md` — Especificação do sistema de design UI/UX.
- `Curriculo_Miqueias_Carvalho.pdf` — Versão em PDF (1 página) do currículo.
- `favicon.svg` — Emblema vetorial Cyberpunk MC.

---

## Contato

- **WhatsApp / Telefone**: [(62) 99842-1308](https://wa.me/5562998421308)
- **E-mail**: [miqueiash989@gmail.com](mailto:miqueiash989@gmail.com)
- **LinkedIn**: [linkedin.com/in/miqueias-henrique-88503b218](https://www.linkedin.com/in/miqueias-henrique-88503b218/)
- **GitHub**: [github.com/Miqueias-Henrique](https://github.com/Miqueias-Henrique)

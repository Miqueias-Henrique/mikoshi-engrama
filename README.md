# ⚡ Miqueias Carvalho — Cyberpunk 2077 / Edgerunners / Cyberpunk RED Interactive Menu

> **"Wake the f*ck up, Samurai. We have legacy code to refactor and APIs to ship."**

Portfólio gamificado de **Miqueias Carvalho** (Desenvolvedor de Software Júnior | Backend | C#/.NET | SQL Server), construído do zero como uma recriação fiel do **Menu de Pausa In-Game do Cyberpunk 2077 (Patch 2.1)** fundido com mecânicas de **Cyberpunk: Edgerunners (Studio Trigger)**, **Cyberpunk RED / 2020 (RPG de Mesa de Mike Pondsmith)** e literatura clássica Cyberpunk (*Neuromancer* de William Gibson / *DataKrash* de Rache Bartmoss).

- 🌐 **Live Demo (GitHub Pages):** [https://miqueias-henrique.github.io/portfolio-cyberpunk-2077/](https://miqueias-henrique.github.io/portfolio-cyberpunk-2077/)
- 📦 **Repositório:** [https://github.com/Miqueias-Henrique/portfolio-cyberpunk-2077](https://github.com/Miqueias-Henrique/portfolio-cyberpunk-2077)
- 📄 **Repositório Base (Dados Originais Preservados):** [https://github.com/Miqueias-Henrique/miqueias-henrique.github.io](https://github.com/Miqueias-Henrique/miqueias-henrique.github.io)

---

## 🎮 As 6 Telas do Menu + Modos Especiais

| Atalho | Tela / Sistema | Referência da Franquia | Conteúdo do Portfólio |
| :--- | :--- | :--- | :--- |
| **`[I]`** | **Ripperdoc & Cyberware** | Clínica de *Viktor Vektor* (*Cyberpunk 2077*) + Barra de *Cyberware Capacity* & *Humanity (EMP)* | 10 implantes cibernéticos mapeando `C#/.NET`, `SQL Server`, `Java 17/21`, `Node.js/NestJS`, `VB6 Legacy`, `AVL/Hash O(1)` com Custo de Humanidade (`4d6`) e scanner biométrico |
| **`[M]`** | **Mapa de Gigs (11 Pinos)** | Mapa tático de *Night City* com briefings de *Fixers* (*Wakako Okada*, *Rogue Amendiares*, *Padre*, *Regina Jones*, *Faraday*) | Todos os **8 repositórios reais do GitHub** + experiências na **Zetti**, **Carvalho Forros** e **UNIFAN** posicionados como contratos de mercenário |
| **`[P]`** | **Árvore de Habilidades 2.0** | Skill Tree do *Patch 2.0* (*Intelligence*, *Technical Ability*, *Cool*, *Reflexes*, *Relic*) | Constelação neural SVG clicável destrinchando competências técnicas, QA, GitFlow e arquitetura |
| **`[R]`** | **Ficha RPG de Mesa (`1d10`)** | *Cyberpunk 2020 / Cyberpunk RED* (*R. Talsorian Games* / *Mike Pondsmith*) | Ficha completa multiclasse (`Netrunner Nv.8 / Tech Nv.8`), 10 atributos clássicos (`INT, REF, DEX, TECH, COOL, WILL, LUCK, MOVE, BODY, EMP`), *Lifepath* e **Rolador de Dados Interativo `1d10 + STAT + SKILL vs DV`** com explosão crítica no `10` |
| **`[J]`** | **Diário, Shards & Tarô** | *Journal*, *Data Shards* e os **Arcanos Maiores do Tarô da Misty** (*The Fool, The Magician, The Hermit, The World*) | Linha do tempo profissional, formação acadêmica na UNIFAN, certificações e citações de *William Gibson (Neuromancer)* e *Rache Bartmoss* |
| **`[H]`** | **Holocall & Breach Protocol** | Chamada holográfica + minigame *Breach Protocol* de matriz hexadecimal (`1C 55 BD E9 7A`) | Contato direto (WhatsApp, E-mail, LinkedIn, GitHub), download do currículo PDF e minigame para decriptar 3 Daemons (`ROOT_ACCESS`, `SQL_OPTIMIZER`, `HIRE_CANDIDATE`) |
| **`[E]`** | **Modo Sandevistan (*Apogee*)** | *Cyberpunk: Edgerunners* (*David Martinez* & *Lucy Kushinada*) | Distorção temporal visual neon-verde/ciano com **rastro fantasma cromático do cursor** no `<canvas>` e desaceleração do pulso neural |
| **`📻`** | **98.7 Body Heat Radio FM** | Rádio in-game (*98.7 Body Heat* / *107.3 Morro Rock* / *89.3 Pacific Dreams*) | Sintetizador WebAudio Darksynth em tempo real sem dependências externas |

---

## 🎨 Arquitetura de Design Tokens (W3C DTCG)

- [`assets/design-tokens.json`](./assets/design-tokens.json) — Tokens em 3 camadas (*Primitive → Semantic → Component*)
- [`assets/design-tokens.css`](./assets/design-tokens.css) — Variáveis CSS compiladas automaticamente via [`generate-tokens.cjs`](./generate-tokens.cjs)
- [`design-system/cyberpunk-2077-portfolio/MASTER.md`](./design-system/cyberpunk-2077-portfolio/MASTER.md) — Especificação completa de UI/UX
- [`docs/brand-guidelines.md`](./docs/brand-guidelines.md) — Guia de estilo e acessibilidade

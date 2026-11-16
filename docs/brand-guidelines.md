# Brand Guidelines & Design Philosophy — Miqueias Carvalho // Cyberpunk 2077 Edition

## 1. Identidade & Posicionamento (`KIROSHI OPTICS // MERC DOSSIER v2.077`)

- **Titular**: Miqueias Carvalho
- **Papel Principal**: Desenvolvedor de Software Júnior | Backend | C#/.NET | SQL Server
- **Localização**: Goiânia, GO (Disponível Presencial / Híbrido / Remoto)
- **Propósito da Interface**: Combinar **clareza executiva para recrutadores e tech leads** (leitura rápida de experiência real em produção na Zetti, domínio de SQL Server/VB6/C#/.NET, 8 projetos práticos e contato sem fricção em 1 clique) com a **direção de arte autêntica de Cyberpunk 2077** (HUD Kiroshi Optics, Cyberdeck de Netrunner, cantos chanfrados em 45°, tipografia técnica e telemetria em tempo real).

---

## 2. Filosofia Visual (Canvas Design System — *Chromatic Tactical HUD*)

1. **Hierarquia Guiada por Telemetria**: Cada métrica crítica (100% produção diária em múltiplas farmácias, SQL Server com Queries/Views/Procedures, 8 repositórios auditáveis no GitHub, Engenharia de Software UNIFAN 2027) é apresentada como leitura óptica de alta precisão.
2. **Geometria Chanfrada (Chamfered Brutalism)**: Substituímos bordas genéricas arredondadas por cortes angulares (`clip-path` em 45°) inspirados nos menus do *REDengine 4* e nos implantes *Kiroshi*, mantendo contraste mínimo WCAG AA (> 7:1 nos textos principais).
3. **Sistemas Cromáticos de Facção (5 Modos Operacionais)**:
   - **Night City Merc (`night_city`)**: Amarelo Cyber (`#FCEE09`), Ciano Kiroshi (`#00F0FF`) e Vermelho Samurai (`#FF003C`) sobre fundo Obsidiana (`#06060A`).
   - **Arasaka Corp (`arasaka`)**: Carmesim Corporativo (`#FF003C`), Platina (`#F8FAFC`) e Grafite Militar (`#070709`).
   - **NetWatch Breach (`netwatch`)**: Verde Daemon (`#00FF66`), Ciano Gelo (`#00F0FF`) e Matriz Profunda (`#040A07`).
   - **Edgerunners Sandevistan (`edgerunners`)**: Ciano Sandevistan (`#00F0FF`), Amarelo Choque (`#FCEE09`) e Magenta Lucy (`#D946EF`).
   - **Samurai Silverhand (`silverhand`)**: Cromo Metálico (`#E2E8F0`), Âmbar Afterlife (`#FF9E00`) e Vermelho Rebelde (`#FF003C`).

---

## 3. Arquitetura de Design Tokens (3 Camadas)

Seguindo o padrão W3C DTCG (`assets/design-tokens.json` → `assets/design-tokens.css`):

```
Primitive Tokens (--primitive-*)
       ↓
Semantic Tokens (--semantic-* / shadcn variables)
       ↓
Component Tokens (--component-*)
```

### Tipografia
- **Display / Headings**: `'Orbitron'`, `'Rajdhani'`, sans-serif (Caixa alta, tracking expandido `0.06em–0.14em`, pesos `700–900`).
- **Body / UI**: `'Rajdhani'`, `'Inter'`, system-ui (Leitura fluida e escaneável para recrutadores, pesos `500–700`).
- **Code / Telemetry / Monospace**: `'JetBrains Mono'`, `'Share Tech Mono'`, monospace (`tabular-nums` para contadores, hashes, comandos `git clone` e tags técnicas).

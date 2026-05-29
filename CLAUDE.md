# sites.rossolabs.com.br — Portfólio

Subdomain estático hospedado em **GitHub Pages**, CNAME `sites.rossolabs.com.br`. Função pós-migração: galeria de casos selecionados (4 nichos com prints reais) que linka pro estúdio principal em `rossolabs.com.br`.

## Estrutura

```
index.html              # Galeria principal (dark, Mona Sans, gradient tiles)
pages/                  # 10 niche HTMLs (demos antigos) — noindex removido, canonical → apex
  advogado.html         # + 3 variantes: academia, dentista, nutricionista
  siteParaAdvogado.html # + 5 variantes siteParaX (Personal, Empresa também)
assets/
  images/
    prints/desktop/*.webp    # Prints usados no /index.html principal + apex Portfolio.tsx
    prints/mobile/*.png      # Servidos via <picture> no /index.html <600px
    logo/, favicon.png
  css/, js/, fonts/          # CSS/JS legados das demos antigas
sitemap.xml             # Reduzido a `/` (demos não indexáveis)
robots.txt              # Allow: /
CNAME                   # sites.rossolabs.com.br
```

## Stack

- HTML estático puro (sem build pipeline)
- Google Fonts: Mona Sans + Inter (com `preload as=style`)
- Vanilla JS (no framework)
- GitHub Pages auto-deploy from `main`

## Convenções

- **DESIGN.md token system** seguido (igual repo apex): canvas `#090909`, Mona Sans display com `letter-spacing: -0.05em`, Inter body, accent blue `#0099ff` **apenas em links/focus/selection**, pill buttons, gradient cards apenas como CARDS (4 cores: violet/magenta/orange/coral).
- **Niche demos antigos** mantidos pra preservar backlinks externos. Cada `pages/*.html` tem:
  - `<link rel="canonical" href="https://rossolabs.com.br/pt-BR/para/<nicho>">`
  - Sticky banner inferior linkando "Ver página atualizada de \<nicho\> →" para apex
- **Sem `noindex`** nos canonicals — combinado com canonical confunde crawler. Ver skill `~/.claude/skills/learned/subdomain-to-apex-migration.md`.
- **Hamburger menu** ativo <520px com focus-trap, ESC handler, scroll lock.

## Comandos

```bash
# Servir local
python3 -m http.server 8765
# → http://localhost:8765
```

Sem build. Push em `main` = deploy direto via GitHub Pages.

## Avisos

- Toda mudança em `index.html` ou prints precisa coordenar com repo apex ([../rossolabs/](../rossolabs)) — Portfolio.tsx usa os mesmos `/assets/images/prints/desktop/*.webp` (copiados pra `/public/showcase/desktop/` no apex).
- Não criar light mode. Dark único, alinhado com apex.
- Demos órfãs (`siteParaPersonal.html`, `siteParaEmpresa.html`) servem 200 mas não estão na galeria. Mantidas só pra backlinks externos.

## Sessões Claude

- **Modo padrão: caveman (full).** Code/commits/security em normal. Toggle: `/caveman lite|full|ultra` ou "stop caveman".
- **claude-mem ativo.** SessionStart injeta contexto recente. `/mem-search "query"` puxa trabalho anterior.
- **Repo irmão:** apex Next.js 16 em [../rossolabs/](../rossolabs). Mudanças coordenadas — skill `subdomain-to-apex-migration`.

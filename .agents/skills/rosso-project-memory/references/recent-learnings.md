# Recent Learnings

## Mobile lessons

- Niche pages can break on `390px`, `360px`, and `320px` widths if CTAs and plan copy are too long.
- Shared mobile fixes should usually go into `assets/css/main.css` so the correction propagates across niche pages.
- In very small widths, the hero must be compact: lower vertical padding, shorter checklist lines, and smaller CTA blocks.

## Copy lessons

- Long CTA labels inside plan cards create unnecessary wrapping pressure.
- Shorter labels like `Pedir orçamento`, `Quero Start`, `Quero Business`, and `Quero Authority` preserve intent and improve mobile reading density.
- Plan descriptions should stay commercial, but compact. One strong sentence is usually enough on mobile.
- Niche pages can silently inherit copy from other niches; always scan for foreign terms in meta tags, search examples, mock browser URLs, alt texts, CTA labels, and FAQ text.
- Generic pages like `siteParaEmpresa.html` should not borrow example searches from regulated or specific niches unless the section is explicitly framed as multi-sector examples.

## JavaScript compatibility lessons

- `index.html` relies on inline calls to `closeMobile()` and `openNichoModal()`, so those helpers must remain available on `window`.
- Theme toggle behavior is controlled inside `assets/js/index.js` using `.theme-toggle`; avoid introducing duplicate theme-toggle state logic.
- Before editing HTML structure, check whether navigation, modal, analytics, transitions, or mobile-fix behavior depends on the current markup.

## Validation lessons

- Use `npm run lint` after JS/CSS/HTML work.
- For mobile-sensitive tasks, validate at least one niche page in `360px` and one in `320px`.
- If a layout issue appears in one niche page, inspect whether the same pattern exists in the other `pages/sitePara*.html` files.
- When reviewing niche pages, run a text scan for terms from other niches to catch copy contamination before shipping.

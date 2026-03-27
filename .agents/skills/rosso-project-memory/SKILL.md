---
name: rosso-project-memory
description: Use when working on the Rosso Labs landing pages in this repository, especially for copy, mobile responsiveness, CTA optimization, niche pages, and HTML/CSS changes that must stay compatible with existing JavaScript behavior.
---

# Rosso Project Memory

Use this skill when the task affects the Rosso Labs landing pages in this repository.

## Quick workflow

1. Read `AGENTS.md` first for business priorities and delivery format.
2. For repo-specific memory, read:
   - `references/project-context.md`
   - `references/recent-learnings.md`
   - `references/visual-qa-checklist.md`
3. Before changing HTML, verify impact on:
   - `assets/js/analytics.js`
   - `assets/js/index.js`
   - `assets/js/transitions.js`
   - `assets/js/mobile-fix.js`
4. If the task touches niche pages, prefer shared fixes in `assets/css/main.css` before page-specific overrides.
5. Validate with `npm run lint` and, for mobile-sensitive work, test small widths like `360px` and `320px`.

## When to prefer this memory

- landing page conversion work
- mobile layout fixes
- CTA/copy shortening
- niche page maintenance
- hero, plans, navbar, menu, modal, or theme toggle changes

## Constraints that matter

- Conversion beats aesthetics.
- Do not break classes, IDs, anchors, menu flow, modal behavior, or theme toggle.
- Avoid generic institutional copy.
- Mobile-first decisions should win when desktop and mobile compete.

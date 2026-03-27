# Visual QA Checklist

Use this after HTML, CSS, or copy changes that affect the landing pages.

## Above the fold

- Hero promise is still clear in a few seconds.
- Main CTA remains visible above the fold.
- Headline breaks cleanly on mobile.
- Hero does not consume excessive vertical space on `360px` or `320px`.

## CTA and conversion

- Main CTA text is short, direct, and easy to tap.
- Plan card CTAs do not overflow or create awkward wrapping.
- WhatsApp access is still obvious and clickable.
- Final CTA remains strong and commercial.

## Mobile layout

- No horizontal overflow on `390px`, `360px`, or `320px`.
- Buttons remain readable and centered.
- Cards do not clip text or create cramped spacing.
- Sections preserve consistent padding and rhythm.

## Behavior

- Mobile menu opens and closes correctly.
- Niche modal still opens and closes correctly.
- Theme toggle still works.
- Anchors still navigate to the correct sections.

## Shared page patterns

- If a fix was applied to one niche page, verify whether the same issue exists in the other `pages/sitePara*.html` files.
- Prefer shared CSS fixes before per-page patching when the issue repeats.
- Confirm the page does not contain terms, examples, metadata, or mock URLs from a different niche.
- Check that browser preview text, preview link target, and image alt text all match the niche being shown.

## Fast validation routine

1. Run `npm run lint`.
2. Check one affected page at `360px`.
3. Check one affected page at `320px` if the task touches hero, CTA, plans, or navbar.
4. Re-open the page and test menu, modal, and theme toggle if HTML or JS changed.
5. Run a quick text search for foreign niche terms when editing any `pages/sitePara*.html`.

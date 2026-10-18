# WOLCO Sanctuary — original concept refinement

An independent review preview refined from the supplied `wolco_homes_rebirth_live_preview (2).html`. The original input is preserved outside this repository.

The original Cinzel and Cormorant typography, garnet/bronze palette, frosted cards, hero composition, spatial explorer, material panels and section sequence are retained. See `docs/DESIGN_PRESERVATION.md` for the scope correction and the two existing demos that must remain unchanged.

## Run and build

Use Node 20 or later. `npm ci`, then `npm run build`. `npm run dev` serves the source; `node scripts/serve.mjs dist` serves the production export. Cloudflare Pages uses `npm run build` and `dist` on the `main` branch.

Tailwind is compiled at build time. Fonts, icons, scripts, images and film are served locally; there are no runtime development CDNs. `src/tailwind.css` is the compiler input and must never overwrite the compiled `public/assets/tailwind.css` during export.

## What the interactions do

- Hero study selection, two collection filters, search and concept detail dialogs.
- Two-level illustrative spatial diagram, mirrored arrangement and room hotspots.
- Three mood palettes and an approximate square-to-square-metre brief planner. No fabricated prices, construction times or commercial specifications.
- Twelve discussion steps, a controllable generated film and native accessible dialogs.
- Validated review, editable text download and explicit `mailto:` handoff. The preview has no automatic enquiry delivery, booking or CRM integration. No email is sent by the application.

Generated architecture is fictional inspiration. The original logo is used without alteration. Font licences and asset provenance are in `docs/`. The shared four-chapter film is silent, 1280×720, 24 fps and 38.42 seconds; the original visible generation marks are retained.

## Hosting and launch boundary

The preview is intentionally `noindex`. Pages Functions are routed only to the film for byte-range streaming; normal pages and assets remain static. The film is below Pages' per-file limit. No paid service or subscription was purchased. Video Function requests use the account's applicable Workers quota.

This preview does not change `wolcohomes.com.au`, its DNS or WordPress site. Real production launch still requires approved company details, plans, inclusions and media, a chosen lead destination with delivery verification, appropriate legal/privacy copy, domain/SEO cutover and physical-device verification. Browser emulation and lab tests do not establish universal device compatibility.

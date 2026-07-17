# Toy Safari — Pitch Deck + Website Mockup (build brief)

**Deliverable:** (1) a high-fidelity, *beautiful* HTML/CSS mockup of a redesigned Toy Safari website,
and (2) a **10–15 slide, full-color PDF pitch deck** that embeds screenshots of that mockup. The mockup
is not throwaway — it is the **Phase-1 prototype** that becomes the real rebuilt site. Polish is the point;
this deck is how Schyler wins a rev-share deal. Read `STORE-INVENTORY.md`, `TEARDOWN.md`, `PITCH.md` first.

## The core story (every slide serves this)
Their website shows ~301 vintage collectibles. Their STORE (see `STORE-INVENTORY.md` + `reference/store-frames/`)
is a full-spectrum toy wonderland — wooden, educational, baby, puzzles, books, plush, die-cast, modern figures,
vintage. **The website hides 85% of the store.** The mockup is the site that finally shows it all.

## Part 1 — the website mockup (build this FIRST; the deck assembles from it)
Stack: Vite + React (or clean static HTML/CSS — your call; speed + polish over framework purity).
- **Brand:** keep Toy Safari's identity — the cartoon **zebra** mascot, tagline *"Explore the joy, find some
  toys"*, playful but elevated. Fetch `https://toysafaritoys.com/` for the logo/colors/voice; match it, then refine.
- **Real products:** pull their actual catalog + image URLs from the Shopify public endpoint
  `https://toysafaritoys.com/products.json?limit=250` (and `&page=2`) — use real vintage products + images so it
  reads as THEIR store. For the new in-store categories (wooden, educational, puzzles, etc.) that aren't online,
  use tasteful **representative** imagery/placeholders (label them representative in the deck, honestly).
- **Pages to build (desktop, gorgeous):**
  1. **Homepage** — hero with the zebra + tagline; a **full category mega-nav** covering ALL 15+ categories from
     STORE-INVENTORY; featured collections; a premium **"Vintage Vault"** band for the collector cases; the
     gift-balloon service callout; trust signals (reviews, local Bay Area shop, secure checkout).
  2. **Category page** — e.g. "Wooden Toys" or "Puzzles": product grid + **faceted filters** (age, brand,
     price, franchise) + breadcrumb.
  3. **Product page** — one real vintage piece, with a **rich AI-written description** (condition, era, series,
     authenticity — show off what the 301-description fix looks like), reviews, trust badges, add-to-cart.
  4. **Intelligent search** — a search overlay showing smart autocomplete + results across categories
     (by character/franchise/scale/age), to make "rich navigation + intelligent search" tangible.
- Dark-on-light, warm, abundant-but-navigable; the magic is breadth made searchable. Mobile-responsive a plus.

## Part 2 — the deck (~13 slides), then render to PDF
Slide flow: (1) Cover — Toy Safari, "The store your website doesn't show yet." (2) The hidden catalog — the
side-by-side: website categories vs the real store list (with the store-frame thumbnails as proof). (3) What it's
costing — invisible inventory = invisible to Google + online buyers. (4–7) Mockup tour — homepage, the full
category mega-nav, a rich product page, intelligent search (full-bleed screenshots). (8) The 301-descriptions fix
(before: title only / after: rich description). (9) Trust + social proof additions. (10) The growth engine —
eBay, Whatnot live-selling, Instagram/TikTok, local SEO. (11) The offer — Phase 1 free, then a share of the
*measured* lift above their Shopify baseline; no upfront cost; the dashboard is the referee. (12) Why it's
risk-free + why now. (13) The ask — a free sample batch of descriptions; let's talk.

## Render recipe (headless Chromium is installed)
CHROME=`/home/user/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`
- **Mockup screenshots:** `$CHROME --headless --no-sandbox --hide-scrollbars --window-size=1512,2600 --screenshot=out.png file:///abs/path/page.html` (serve the Vite build with `vite preview` and screenshot the URL, or screenshot static files).
- **Deck → PDF:** build the deck as ONE self-contained `deck.html` (each slide a full-page section; CSS
  `@page { size: 1280px 720px; margin: 0 }` + `section { page-break-after: always }` for 16:9 slides), then
  `$CHROME --headless --no-sandbox --no-pdf-header-footer --print-to-pdf=/home/user/shmorganism/workshop/ventures/toysafari/Toy-Safari-Pitch.pdf file:///home/user/shmorganism/workshop/toysafari-pitch/deck.html`.
- Embed screenshots as `<img>` (base64 or relative). Verify the PDF: it should be 10–15 pages, full color.

## Guardrails + handoff
- LOCAL only — do NOT publish, deploy, push to GitHub, or use external credentials without Schyler's explicit go.
- Serve the mockup to Schyler's iPad over the tailnet for review (the LATTICE loop; allowlist the ts.net host).
- When the PDF renders + the mockup is preview-able, **report to Charlotte** with the PDF path — Charlotte sends
  the final PDF to Telegram (the external send stays with the conductor).
- FIRST: reply with a short build plan + your read on the single most striking mockup screenshot to nail. Then build.

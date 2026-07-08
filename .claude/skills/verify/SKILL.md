---
name: verify
description: Build, serve and drive the wellness dashboard end-to-end in headless Chromium to verify changes at the GUI surface.
---

# Verifying the wellness dashboard

Static Vite + React SPA (hash routing), data in IndexedDB via Dexie. No tests — verify by driving the real UI.

## Build & serve

```bash
npm install && npm run build
npx http-server dist -p 4173 -s &   # http-server is installed globally
```

## Drive with Playwright

Playwright 1.56 is installed globally (`/opt/node22/lib/node_modules/playwright`); for an ESM script outside the repo, symlink it into a local `node_modules`. Launch Chromium with:

```js
chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
```

Routes: `/#/`, `/#/products`, `/#/routine/{morning,evening,shower}`, `/#/supplements`, `/#/habits`, `/#/progress`, `/#/notes`, `/#/settings`. Anything else redirects home.

## Flows worth driving

- Home: tiles show live counts; habit ring reflects check-offs. UI is emoji-free — assert Lucide SVGs render (`.sidebar svg` count) and no emoji codepoints remain in body text.
- Products: FAB → form (name placeholder contains "CeraVe"); upload a photo via the hidden `input[type=file]` with an in-memory PNG buffer; search box, category chips, detail modal, edit/delete.
- Routine: click a `.flow-step .dot` to check off (ring updates); "Edit routine" → link a library product to a step (its photo replaces the icon); `.icon-picker button[aria-label="<icon>"]` picks step/habit icons.
- Habits: `.habit-check` toggle updates the ring and week dots. Todoist sync (close/reopen of the matching task, `todoistId` stored on the habit) needs a real API token — without one, verify the no-token banner names the "Wellness Habits" project and that toggles never error.
- Progress: upload two photos, "Compare two", pick both → Before/After captions.
- Settings: "Download backup" fires a real download — parse the JSON and check table counts (healthLogs/wishlist tables still exist in the schema but stay empty; their UIs were removed).

## Gotchas

- Each Playwright launch is a fresh profile → clean IndexedDB, seed data (21 routine steps, 9 habits) re-created on load.
- `page.click('text=…')` is non-strict and can hit a modal *title* with the same text as its submit button — always use `button:has-text(…)` for form submits (this has bitten twice: "Add to wishlist", "Add step").
- `npm run build` must run from the repo root — running it from the scratchpad silently fails and you end up driving a stale `dist/`.
- Mobile check: at 390px viewport assert `scrollWidth - clientWidth <= 1` on every route (grid tracks must be `minmax(0,1fr)` to avoid blowouts).

# 🌿 Wellness OS — Personal Wellness & Beauty Dashboard

A calm, Apple-inspired personal operating system for skincare, body care, supplements,
habits and health — designed to be enjoyable to open every day.

## What's inside

| Dashboard | What it does |
|---|---|
| **Home** | Card grid for every area with live counts, today's habit ring and routine progress |
| **Product Library** | Every product with its photo — searchable, filterable by Face / Body / Hair / Makeup / Supplement, with purpose, amount, order, rating, repurchase, dates, price, store, notes, expiry warnings |
| **Morning Routine** | Visual step-by-step checklist with product photos, quantities, wait times, and *why* each step matters |
| **Evening Routine** | Same flow — cleansing, treatments, moisturizer, supplements, in the correct order |
| **Shower Routine** | Sectioned into Hair · Body · Feet · Hands · Nails |
| **Supplements** | Dose, best time, with/without food, benefits, interactions, when *not* to take it |
| **Habits** | Recurring habits with streaks and a 7-day dot history, plus two-way **Todoist** sync |
| **Before & After** | Progress photos for Skin / Hair / Body with side-by-side compare |
| **Notes** | Routine changes, product reviews, questions, doctor recommendations, lab results |
| **Settings** | One-tap JSON backup/restore (photos included) and Todoist token |

## Running it

```bash
npm install
npm run dev        # local development
npm run build      # production build in dist/ — deploy to any static host
```

The build is a fully static site (relative paths, hash routing) — it works on Vercel,
Netlify, GitHub Pages, or even opened straight from a folder.

## Where the data lives

Everything is stored **privately in your browser** (IndexedDB) — products, photos,
logs, notes. Nothing is uploaded anywhere. Use **Settings → Download backup** to get a
single JSON file you can restore on another device.

## Adding products

Tap **+** anywhere in the Product Library, snap or upload a photo, pick the category —
it immediately appears in the library, in the matching Home card counts, and becomes
linkable as a step in any routine (the routine step then shows the real product photo).

## Todoist integration

Habits mirror the **Wellness Habits** project in Todoist. Paste your Todoist API token
(Todoist → Settings → Integrations → Developer) in Settings and the sync goes both ways:
checking a habit in the dashboard completes the task in Todoist, and completing a task
from the Todoist card on the Habits page checks the habit here. "Send habits" creates
recurring daily tasks for any habit that doesn't have one yet (never duplicates).

## Tech

Vite + React + Dexie (IndexedDB) + Lucide icons. No backend, no accounts, no tracking.

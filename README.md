# 🌿 Wellness OS — Personal Wellness & Beauty Dashboard

A calm, Apple-inspired personal operating system for skincare, body care, supplements,
habits and health — designed to be enjoyable to open every day.

## What's inside

| Dashboard | What it does |
|---|---|
| 🏠 **Home** | Beautiful card grid for every area, water ring, today's habit & routine progress |
| 📦 **Product Library** | Every product with its photo — searchable, filterable by Face / Body / Hair / Makeup / Supplement, with purpose, amount, order, rating, repurchase, dates, price, store, notes, expiry warnings |
| 🌞 **Morning Routine** | Visual step-by-step checklist with product photos, quantities, wait times, and *why* each step matters |
| 🌙 **Evening Routine** | Same flow — cleansing, treatments, moisturizer, supplements, in the correct order |
| 🛁 **Shower Routine** | Sectioned into Hair · Body · Feet · Hands · Nails |
| 💊 **Supplements** | Dose, best time, with/without food, benefits, interactions, when *not* to take it |
| ❤️ **Health** | Daily check-in: water, sleep, exercise, mood, stress, energy, weight, period, symptoms — with 2-week trend charts |
| 📅 **Habits** | Recurring habits with streaks and a 7-day dot history, plus optional **Todoist** sync |
| 🛍️ **Wishlist** | Save temptations and compare them with products you already own before buying |
| 📊 **Before & After** | Progress photos for Skin / Hair / Body with side-by-side compare |
| 📝 **Notes** | Routine changes, product reviews, questions, doctor recommendations, lab results |
| ⚙️ **Settings** | One-tap JSON backup/restore (photos included) and Todoist token |

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

## Todoist integration (optional)

Settings → paste your Todoist API token (Todoist → Settings → Integrations → Developer).
The Habits page then shows today's Todoist tasks, lets you complete them, and can push
all your habits into Todoist as daily recurring tasks.

## Tech

Vite + React + Dexie (IndexedDB). No backend, no accounts, no tracking.
Chart colors are validated for color-vision accessibility and contrast.

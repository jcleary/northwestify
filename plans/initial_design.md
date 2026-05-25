# Northwestify Podcast Website — Initial Design Plan

## Overview

A rebuilt podcast website for **Northwestify** — a North West UK business and technology podcast hosted by John Cleary and Zack Georgiou. The site replaces the existing minimal/corporate site at northwestify.co.uk with something bold, punchy, and visually engaging while remaining easy to maintain.

---

## Design Direction

**Vibe:** Bold and punchy. Big typography, strong visual hierarchy, energy that matches the conversational and human tone of the show.

**Color palette:**
- Background: near-black (e.g. `#0d0d0d`)
- Accent: electric teal (e.g. `#00d4c8` or similar)
- Text: clean white
- Secondary text: muted grey

**Typography:**
- Headings: **Syne** (Google Fonts) — chunky, modern, slightly condensed
- Body: **Inter** (Google Fonts) — clean, readable sans-serif

---

## Pages

### 1. Home
- **Hero section:** Bold Syne headline (e.g. *"Real conversations. Real people. Real North West."*), show logo, subscribe buttons (Apple Podcasts + Spotify)
- **Background:** mosaic/grid of episode guest artwork images — updates dynamically as new episodes are added
- **Latest episode:** featured card with guest photo, title, description snippet, and inline audio player
- **About blurb:** 2–3 sentences on what the show is about

### 2. Episodes
- Grid layout of all episodes, grouped or filterable by season
- Each card: guest artwork, guest name + title, episode number, duration, short description
- Links to individual episode detail pages

### 3. Episode Detail
- Guest artwork (large)
- Season/episode badge
- Guest name, job title, company
- Full episode description
- Custom HTML5 audio player (styled to match dark/teal theme — play/pause/scrub)
- Link out to Spotify / Apple Podcasts

### 4. Hosts
- Two host cards: circular headshot placeholder, name, short bio paragraph, LinkedIn link
- Placeholder content — real headshots and bios to be added by the team

### 5. Contact / Ask a Question
- Simple form: name, email, message
- Powered by **Formspree** (free tier, 50 submissions/month, submissions emailed to the team)
- No backend required

---

## Technology Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | **Astro** | Modern static site generator, ships zero JS by default, excellent remote data fetching at build time |
| Hosting | **GitHub Pages** | Free, fits low-frequency release cadence |
| Episode data | **Libsyn RSS feed** | Fetched at build time from `https://northwestify.libsyn.com/rss` — provides title, guest name, description, audio URL, artwork, duration, season/episode numbers |
| Audio player | Custom HTML5 `<audio>` element | Styled to match dark/teal theme; audio files served from Libsyn's CDN |
| Contact form | **Formspree** free tier | Works with static sites; submissions land in email inbox |
| Fonts | Google Fonts (Syne + Inter) | Free, no licensing concerns |

---

## Episode Data — RSS Feed Fields Available

The Libsyn RSS feed (`https://northwestify.libsyn.com/rss`) provides per-episode:
- Title (includes guest name and job title)
- Publish date
- Duration
- Description (plain text and HTML)
- Audio MP3 URL (hosted on Libsyn CDN)
- Per-episode artwork image URL
- Season and episode numbers
- Guest author name
- GUID

No manual data entry required — the build fetches the feed and generates all episode pages automatically.

---

## Deployment

- **GitHub repo:** `github.com/jcleary/northwestify` (public)
- **Branch strategy:** `main` for source, `gh-pages` for built output
- **Custom domain:** `www.northwestify.co.uk` (GitHub Pages custom domain via CNAME file + DNS configuration)
- **Apex redirect:** `northwestify.co.uk` → `www.northwestify.co.uk`

### GitHub Actions Workflow triggers:
1. **Push to `main`** — automatic build and deploy (for code changes)
2. **`workflow_dispatch`** — manual trigger button in GitHub UI (for new episode releases on Libsyn)

### Build process:
1. Fetch Libsyn RSS feed
2. Parse episode data
3. Run Astro build (generates static HTML)
4. Deploy output to `gh-pages` branch

---

## Out of Scope (for now)

- Google Podcasts links (platform shut down)
- CMS or admin interface
- Comments or community features
- Analytics (can be added later via a privacy-friendly tool like Plausible or Fathom)

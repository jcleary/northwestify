# NorthWestify

Website for the [NorthWestify podcast](https://northwestify.co.uk) — conversations with founders, engineers, and leaders from the North West of England. Hosted by John Cleary and Zack Georgiou.

## Stack

- [Astro](https://astro.build) — static site generator, zero JS by default
- [GitHub Pages](https://pages.github.com) — hosting
- [Libsyn RSS](https://northwestify.libsyn.com/rss) — episode data, fetched at build time
- [Formspree](https://formspree.io) — contact form (no backend required)

## Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # production build → dist/
npm run preview   # preview the build locally
```

## Deployment

Pushing to `main` triggers a GitHub Actions workflow that builds the site and deploys to GitHub Pages at `www.northwestify.co.uk`.

To publish a new episode without a code change, use the **Run workflow** button in the [Actions tab](../../actions) — this re-fetches the Libsyn RSS feed and redeploys.

## Before going live

- Replace `FORMSPREE_ID` in `src/pages/contact.astro` with your real [Formspree](https://formspree.io) form ID
- Update Apple Podcasts and Spotify links (currently `#`) in `src/components/Footer.astro`, `src/pages/index.astro`, and `src/pages/contact.astro`
- Add host headshot images to `src/pages/hosts.astro` (currently CSS placeholder initials)
- Enable GitHub Pages on the `gh-pages` branch in repository settings
- Add a DNS CNAME record: `www` → `jcleary.github.io`

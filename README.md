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



import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.northwestify.co.uk',
  // TODO: remove `base` once DNS is configured and the site lives at www.northwestify.co.uk
  // GitHub Pages serves this repo at /northwestify/ without a custom domain, so assets
  // need the prefix. Once DNS points www.northwestify.co.uk → jcleary.github.io, delete
  // the base line below and redeploy.
  base: '/northwestify',
});

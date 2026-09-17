// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { rewriteRepoLinks } from './scripts/rewrite-links.mjs'

// Used for canonical URLs and sitemap.xml. Override at build time once the
// site has a real home:  SITE_URL=https://your-domain npm run build
const SITE = process.env.SITE_URL ?? 'https://rohan-murmu.github.io/jasper-web'

export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [rewriteRepoLinks],
    rehypePlugins: [
      // Slugs first: autolink only decorates headings that already carry an id,
      // and Astro's own id pass runs after these plugins.
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          properties: { class: 'anchor', ariaHidden: 'true', tabIndex: -1 },
          content: { type: 'text', value: '#' },
        },
      ],
    ],
    shikiConfig: { theme: 'vesper', wrap: false },
  },
  devToolbar: { enabled: false },
})

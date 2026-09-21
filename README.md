# jasper-web

The marketing and documentation site for [**Jasper**](https://github.com/rohan-murmu/jasper) —
an architectural guardrail for coding agents.

Built with [Astro](https://astro.build). Static output, no client framework, no
image assets: every diagram on the site is inline SVG animated with CSS.

## Run it

```sh
npm install
npm run dev          # http://localhost:4321
```

That is the whole setup. `npm run dev` syncs the docs first (see below), then
starts Astro.

| Command | Does |
|---------|------|
| `npm run dev` | sync docs, then serve at `localhost:4321` with HMR |
| `npm run build` | sync docs, then emit static HTML to `dist/` |
| `npm run preview` | serve the built `dist/` exactly as it will deploy |
| `npm run sync:docs` | refresh `src/content/docs/` from the Jasper repo |

## Where the documentation comes from

The `/docs/*` routes are **not** written here. `scripts/sync-docs.mjs` copies
`../jasper/docs/*.md` into `src/content/docs/`, adding the front matter the
content collection needs. The Jasper repo stays the single source of truth, so
the site cannot drift from the docs a contributor reads in the source tree.

That means this project expects `jasper` as a **sibling directory**:

```
MyProjects/
├── jasper/          the Go CLI — docs/ lives here
└── jasper-web/      you are here
```

`src/content/docs/` is generated **and committed** — a deploy host only checks
out this repository, so the markdown has to ship with it. When the sibling repo
is missing, `sync:docs` logs a notice and builds from the committed copy instead
of failing.

Edit `../jasper/docs/*.md`, never the files under `src/content/docs/`. The sync
picks the change up on the next `dev` or `build`, tells you the vendored copy
moved, and **the change only reaches the deployed site once you commit it.**

Two small plugins keep the markdown usable as a website:

- `scripts/rewrite-links.mjs` rewrites the repo's relative links
  (`checks.md` → `/docs/checks`, `../README.md` → `/`), and sends links to real
  repo paths off to GitHub.
- `rehype-slug` + `rehype-autolink-headings` add the heading anchors that the
  right-hand "on this page" rail scrolls to.

Adding a doc means adding one line to `PAGES` in `scripts/sync-docs.mjs` — the
nav, the reading-order lists and the prev/next pager all read from there.

## Design

An old-desktop GUI. A tan desktop, peach windows, a vivid orange title bar, and a
hard 2px black outline on everything — shadows are a solid offset, never a blur,
and there are no gradients anywhere.

The palette is the logo's own amber family, so the mark belongs to the page
rather than sitting on top of it. It is always placed on a bordered white tile
(`.brand__tile`), never directly on a window surface, where its mid-tones would
sink into the peach.

Tokens live at the top of `src/styles/global.css`. The site is single-theme: a
retro desktop in dark mode is a contradiction, so the theme toggle was dropped.

Type is monospaced throughout — Space Mono for window titles and headings,
JetBrains Mono for body and code.

`src/components/Window.astro` is the one structural primitive. Everything that
would ordinarily be a "card" is a window with a title bar and a decorative
`_ □ ×` cluster, which is what makes the page read as a desktop instead of a
modern layout with a retro skin painted on.

Contrast is checked rather than assumed: every foreground/background pair in the
palette clears WCAG AA (4.5:1). That is why title bars use near-black text on the
orange rather than white — white on `#e8621c` is only 3.3:1, near-black is 5.4:1,
and the orange stays exactly as loud.

### Animation

Every animated block is paused until it scrolls into view, so a reader always
sees a diagram from its first frame:

- a single `IntersectionObserver` in `src/layouts/Base.astro` adds `.is-in` to
  anything marked `[data-reveal]` or `[data-anim]`
- `[data-anim]` sets `--run: paused`, `[data-anim].is-in` sets `--run: running`,
  and diagram keyframes read `animation-play-state: var(--run, paused)`
- flowchart edges normalise with `pathLength="100"`, so one keyframe block
  animates every wire regardless of its true length
- `prefers-reduced-motion` resolves each diagram to its finished state rather
  than hiding it

Diagrams live in `src/components/`: `DriftDiagram`, `LoopDiagram`,
`ArchDiamond`, `PreflightSequence`, `DecisionAnatomy`, `Stats` and `Terminal`.

### Responsiveness

Wide technical diagrams scroll rather than shrink to illegibility — each sits in
a `.scroll-x` container and takes a `min-width` only below its breakpoint, so the
labels stay readable on a phone. Nothing else is allowed to scroll the page:
`body` is `overflow-x: clip`, and long content (terminals, tables, fenced code)
scrolls inside its own box.

## Deploying

The build is plain static files in `dist/` — any static host will serve it, and
it needs nothing but this repository.

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

Set the canonical origin so `sitemap.xml` and the `<link rel="canonical">` tags
are right. The default in `astro.config.mjs` is a placeholder:

```sh
SITE_URL=https://your-domain npm run build
```

On Vercel or Netlify, set `SITE_URL` as an environment variable instead.

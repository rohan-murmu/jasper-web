# jasper-web

The marketing and documentation site for [**Jasper**](https://github.com/rohan-murmu/jasper) —
architectural decisions, enforced.

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

`src/content/docs/` is generated and git-ignored. Edit
`../jasper/docs/*.md` instead; the sync picks it up on the next `dev` or `build`.

Two small plugins keep the markdown usable as a website:

- `scripts/rewrite-links.mjs` rewrites the repo's relative links
  (`checks.md` → `/docs/checks`, `../README.md` → `/`), and sends links to real
  repo paths off to GitHub.
- `rehype-slug` + `rehype-autolink-headings` add the heading anchors that the
  right-hand "on this page" rail scrolls to.

Adding a doc means adding one line to `PAGES` in `scripts/sync-docs.mjs` — the
nav, the reading-order lists and the prev/next pager all read from there.

## Design

The palette is sampled from the Jasper logo: warm amber (`#f1c07d`, `#cb8242`)
on a near-black that is tinted brown rather than blue. Tokens live at the top of
`src/styles/global.css`; light mode redefines the same tokens under
`:root[data-theme='light']`, and the toggle writes to `localStorage`.

Type is Instrument Serif for display, Inter for UI, JetBrains Mono for code.

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
`ArchDiamond`, `PreflightSequence`, `DecisionAnatomy` and `Terminal`.

## Deploying

The build is plain static files in `dist/` — any static host will serve it.
Set the canonical origin at build time so `sitemap.xml` and the `<link rel=canonical>`
tags are right:

```sh
SITE_URL=https://your-domain npm run build
```

The default in `astro.config.mjs` is a placeholder. Deploying to a host that
does not have the `jasper` repo checked out alongside this one will fail at
`sync:docs` — vendor `src/content/docs/` into the build, or check out both
repositories in CI.

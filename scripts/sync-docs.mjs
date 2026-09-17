/**
 * Copies the Jasper repo's docs/ into this site's content collection.
 *
 * The repo stays the single source of truth: nothing here is hand-edited.
 * Front matter is derived from the ordering table below rather than added to
 * the markdown, so `jasper` never has to know a website exists.
 */
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const SOURCE = resolve(here, '../../jasper/docs')
const DEST = resolve(here, '../src/content/docs')

/** slug → [order, nav label, one-line summary]. Anything not listed is skipped. */
const PAGES = {
  architecture: [1, 'Architecture', 'Layers, seams, the purity boundary, and the data flow that holds it all together.'],
  workflows: [2, 'Workflows', 'init, check, MCP pre-flight and propose — each lifecycle end to end.'],
  checks: [3, 'Check reference', 'All ten check primitives, every field, defaults, gotchas and worked examples.'],
  languages: [4, 'Languages', 'Go, TypeScript, Python and Rust: extraction, resolution and honest limits.'],
  mcp: [5, 'MCP integration', 'Setup, transport, the seven tools, verdict semantics and agent prompting.'],
  scaling: [6, 'Scaling', 'Measured performance, monorepos and adopting Jasper on a legacy codebase.'],
  contributing: [7, 'Contributing', 'Adding a check, a language or a port — with real diffs.'],
}

const yaml = (s) => `"${String(s).replace(/"/g, '\\"')}"`

// The synced markdown is committed, so a build host that only checks out this
// repository (Vercel, Netlify, a CI runner) has everything it needs. The sync is
// a convenience for whoever has the jasper repo checked out next door.
if (!existsSync(SOURCE)) {
  const vendored = existsSync(DEST) && (await readdir(DEST)).some((f) => f.endsWith('.md'))

  if (vendored) {
    console.log(`  · no sibling jasper/ repo — using the ${(await readdir(DEST)).length} committed docs`)
    process.exit(0)
  }

  console.error(
    `\n  ✗ No docs to build from.\n\n` +
      `  Nothing is committed in src/content/docs/, and the jasper repo is not\n` +
      `  checked out next door at:\n      ${SOURCE}\n\n` +
      `  jasper-web expects the jasper repo as a sibling directory:\n` +
      `      MyProjects/\n        jasper/       <- the Go CLI, with docs/\n        jasper-web/   <- you are here\n\n` +
      `  Check both out side by side, run \`npm run sync:docs\`, and commit\n` +
      `  src/content/docs/.\n`
  )
  process.exit(1)
}

await mkdir(DEST, { recursive: true })

/**
 * Written only when the bytes actually differ. Blindly rewriting (or wiping the
 * directory first) invalidates Astro's content layer, which 404s every doc route
 * in a dev server that happens to be running in another terminal.
 */
async function writeIfChanged(path, next) {
  try {
    if ((await readFile(path, 'utf8')) === next) return false
  } catch {
    // not there yet
  }
  await writeFile(path, next, 'utf8')
  return true
}

const expected = new Set()
let written = 0
for (const file of await readdir(SOURCE)) {
  if (!file.endsWith('.md')) continue
  const slug = file.replace(/\.md$/, '')
  const meta = PAGES[slug]
  if (!meta) continue // docs/README.md — the site has its own index

  const [order, label, summary] = meta
  const raw = await readFile(join(SOURCE, file), 'utf8')

  // The first `# Heading` becomes the page title and is dropped from the body,
  // since the layout renders the title itself.
  const title = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? label
  const body = raw.replace(/^#\s+.+\n+/m, '')

  const frontmatter = [
    '---',
    `title: ${yaml(title)}`,
    `label: ${yaml(label)}`,
    `summary: ${yaml(summary)}`,
    `order: ${order}`,
    '---',
    '',
  ].join('\n')

  expected.add(file)
  if (await writeIfChanged(join(DEST, file), frontmatter + body)) written++
}

// Drop anything left over from a doc that was renamed or removed upstream.
let removed = 0
for (const file of await readdir(DEST)) {
  if (!expected.has(file)) {
    await rm(join(DEST, file), { force: true })
    removed++
  }
}

const parts = [`${expected.size} docs`]
if (written) parts.push(`${written} updated`)
if (removed) parts.push(`${removed} removed`)
console.log(`  ✓ ${parts.join(' · ')} — from ${SOURCE}`)

if (written || removed) {
  console.log('    ↳ src/content/docs/ changed — commit it, or the deployed site stays behind')
}

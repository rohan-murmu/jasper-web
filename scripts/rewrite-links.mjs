/**
 * Remark plugin: rewrite the repo's relative markdown links so they work as
 * site routes.
 *
 *   checks.md            -> /docs/checks
 *   checks.md#layers     -> /docs/checks#layers
 *   ../README.md         -> /
 *   ../docs/mcp.md       -> /docs/mcp
 *
 * Anything that already points somewhere absolute is left alone. A link into a
 * repo path with no site equivalent (`.jasper/decisions/...`, `internal/...`)
 * is sent to GitHub so it still resolves.
 */
const REPO = 'https://github.com/rohan-murmu/jasper'
const BLOB = `${REPO}/blob/main`

const SITE_DOCS = new Set([
  'architecture',
  'workflows',
  'checks',
  'languages',
  'mcp',
  'scaling',
  'contributing',
])

function rewrite(url) {
  if (!url || /^(https?:|mailto:|#|\/)/.test(url)) return url

  const [path, hash] = url.split('#')
  const anchor = hash ? `#${hash}` : ''
  const clean = path.replace(/^\.\//, '')

  if (/(^|\/)README\.md$/i.test(clean)) {
    // ../README.md is the project readme -> the landing page.
    return clean.startsWith('..') ? `/${anchor}` : `/docs${anchor}`
  }

  const doc = clean.match(/(?:^|\/)([a-z-]+)\.md$/)
  if (doc && SITE_DOCS.has(doc[1])) return `/docs/${doc[1]}${anchor}`

  // Not a doc page: a real file in the repo.
  return `${BLOB}/${clean.replace(/^(\.\.\/)+/, '')}${anchor}`
}

export function rewriteRepoLinks() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'link') node.url = rewrite(node.url)
      if (node.type === 'definition') node.url = rewrite(node.url)
      node.children?.forEach(walk)
    }
    walk(tree)
  }
}

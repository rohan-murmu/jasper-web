/** Every outward-facing constant lives here so nothing is duplicated in markup. */
export const site = {
  name: 'Jasper',
  tagline: 'An architectural guardrail for coding agents.',
  description:
    'Jasper is an architectural guardrail for coding agents. It records the decisions your agent makes as machine-checkable policy, answers the agent’s questions over MCP before it writes, and fails the build in CI when the code stops honoring them.',
  repo: 'https://github.com/rohan-murmu/jasper',
  issues: 'https://github.com/rohan-murmu/jasper/issues',
  license: 'https://github.com/rohan-murmu/jasper/blob/main/LICENSE',
  author: { name: 'Rohan Murmu', url: 'https://github.com/rohan-murmu' },
} as const

export const nav = [
  { href: '/#problem', label: 'Problem' },
  { href: '/#how', label: 'How it works' },
  { href: '/#checks', label: 'Checks' },
  { href: '/#agent', label: 'For agents' },
  { href: '/docs', label: 'Docs' },
] as const

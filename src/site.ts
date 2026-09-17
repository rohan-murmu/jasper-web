/** Every outward-facing constant lives here so nothing is duplicated in markup. */
export const site = {
  name: 'Jasper',
  tagline: 'Architectural decisions, enforced.',
  description:
    'Jasper turns the architectural decisions your coding agent makes into checks that run on every commit — and answers the agent’s questions while it is still deciding.',
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

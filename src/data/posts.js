// Post loader.
//
// Vite's `import.meta.glob` reads files matching a pattern at build time.
// We import every .md in the /posts folder as a raw string, parse the YAML
// frontmatter at the top (--- title / date / excerpt ---), and return a list.

const modules = import.meta.glob('/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// Minimal frontmatter parser: handles --- ... --- blocks with simple
// key: value lines. Strings can be quoted with "..." which we strip.
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }
  const yaml = match[1]
  const content = match[2]
  const data = {}
  for (const line of yaml.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!m) continue
    let value = m[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    data[m[1]] = value
  }
  return { data, content }
}

const posts = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = path.replace('/posts/', '').replace(/\.md$/, '')
    const { data, content } = parseFrontmatter(raw)
    return {
      slug,
      title: data.title || slug,
      date: data.date ? new Date(data.date) : null,
      excerpt: data.excerpt || '',
      content,
    }
  })
  .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))

export default posts

export function getPost(slug) {
  return posts.find((p) => p.slug === slug)
}

export function formatDate(d) {
  if (!d) return ''
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

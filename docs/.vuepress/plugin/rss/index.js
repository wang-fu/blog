/**
 * VuePress RSS Feed Plugin
 *
 * 生成 Atom feed (feed.xml) 和 RSS 2.0 feed (rss.xml)
 */

const fs = require('fs')
const path = require('path')

const HOSTNAME = 'https://imwangfu.com'
const SITE_NAME = '混沌随想'
const SITE_DESCRIPTION = '独立思考的软件工程师，专注于 web 前端技术和通用软件架构、代码整洁、研发效能'
const AUTHOR = '混沌随想'
const AUTHOR_EMAIL = 'imwangfu@gmail.com'

module.exports = (options, context) => {
  return {
    name: 'rss-feed',

    async generated() {
      const { pages } = context.getSiteData
        ? context.getSiteData()
        : context

      // 只包含已发布的博客文章
      const blogPosts = pages
        .filter(page => page.frontmatter.blog && page.title)
        .sort((a, b) => {
          const dateA = a.frontmatter.date ? new Date(a.frontmatter.date) : 0
          const dateB = b.frontmatter.date ? new Date(b.frontmatter.date) : 0
          return dateB - dateA
        })
        .slice(0, 20) // 最新 20 篇

      const now = new Date().toISOString()
      const lastBuildDate = blogPosts.length > 0
        ? safeUTC(blogPosts[0].frontmatter.date, new Date().toUTCString())
        : new Date().toUTCString()

      // --- 生成 Atom Feed ---
      const atomXml = generateAtomFeed(blogPosts, now)
      const atomPath = path.resolve(context.outDir || options.dest, 'feed.xml')
      fs.writeFileSync(atomPath, atomXml, 'utf-8')
      console.log(`[RSS] Atom feed generated: ${blogPosts.length} items`)

      // --- 生成 RSS 2.0 Feed ---
      const rssXml = generateRssFeed(blogPosts, lastBuildDate)
      const rssPath = path.resolve(context.outDir || options.dest, 'rss.xml')
      fs.writeFileSync(rssPath, rssXml, 'utf-8')
      console.log(`[RSS] RSS 2.0 feed generated: ${blogPosts.length} items`)
    }
  }
}

function escapeXml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function safeISO(value, fallback) {
  if (!value) return fallback
  const d = new Date(value)
  return isNaN(d.getTime()) ? fallback : d.toISOString()
}

function safeUTC(value, fallback) {
  if (!value) return fallback
  const d = new Date(value)
  return isNaN(d.getTime()) ? fallback : d.toUTCString()
}

function generateAtomFeed(posts, updatedTime) {
  const entries = posts.map(page => {
    const url = HOSTNAME + page.path
    const date = safeISO(page.frontmatter.date, updatedTime)
    const description = page.frontmatter.description || ''

    return `  <entry>
    <title>${escapeXml(page.title)}</title>
    <link href="${escapeXml(url)}" />
    <id>${escapeXml(url)}</id>
    <published>${date}</published>
    <updated>${date}</updated>
    <summary>${escapeXml(description)}</summary>
    <author>
      <name>${AUTHOR}</name>
      <email>${AUTHOR_EMAIL}</email>
    </author>
  </entry>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(SITE_NAME)}</title>
  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <link href="${HOSTNAME}/feed.xml" rel="self" type="application/atom+xml" />
  <link href="${HOSTNAME}" rel="alternate" type="text/html" />
  <id>${HOSTNAME}/</id>
  <updated>${updatedTime}</updated>
  <author>
    <name>${AUTHOR}</name>
    <email>${AUTHOR_EMAIL}</email>
  </author>
${entries}
</feed>
`
}

function generateRssFeed(posts, lastBuildDate) {
  const items = posts.map(page => {
    const url = HOSTNAME + page.path
    const pubDate = safeUTC(page.frontmatter.date, lastBuildDate)
    const description = page.frontmatter.description || ''
    const tags = page.frontmatter.tags || []
    const categoryTags = (Array.isArray(tags) ? tags : [tags])
      .map(t => `      <category>${escapeXml(t)}</category>`)
      .join('\n')

    return `    <item>
      <title>${escapeXml(page.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
${categoryTags}
    </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${HOSTNAME}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${HOSTNAME}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
}

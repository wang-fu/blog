/**
 * VuePress SEO Plugin
 *
 * Generates: Open Graph, Twitter Cards, JSON-LD structured data,
 * per-page keywords, canonical URLs
 */

const fs = require('fs')
const path = require('path')

const HOSTNAME = 'https://imwangfu.com'
const SITE_NAME = '混沌福王'
const AUTHOR = '混沌福王'
const TWITTER_HANDLE = '' // 如有 Twitter 可后续添加
const DEFAULT_IMAGE = HOSTNAME + '/logo.png'
const LOCALE = 'zh_CN'

// 存储每个页面的 JSON-LD 数据，在 generated 阶段注入
const pageJsonLdMap = new Map()

module.exports = (options, context) => {
  return {
    name: 'seo-meta',

    extendPageData($page) {
      const { frontmatter, title, path: pagePath, _strippedContent } = $page

      // 只为有内容的页面生成 SEO meta
      if (!title && !frontmatter.home) return

      const pageTitle = frontmatter.home
        ? SITE_NAME + ' - ' + (frontmatter.tagline || '')
        : title + ' | ' + SITE_NAME

      const description = frontmatter.description
        || (frontmatter.home ? '独立思考的软件工程师，专注于 web 前端技术和通用软件架构、代码整洁、研发效能' : '')
        || getExcerpt(_strippedContent)

      const url = HOSTNAME + pagePath
      const image = getPageImage(frontmatter, _strippedContent) || DEFAULT_IMAGE
      const publishDate = frontmatter.date ? new Date(frontmatter.date).toISOString() : ''
      const modifiedDate = $page.lastUpdated ? new Date($page.lastUpdated).toISOString() : ''

      // 收集 tags 作为 keywords
      const tags = frontmatter.tags || frontmatter.tag || []
      const tagList = Array.isArray(tags) ? tags : [tags]
      const keywords = tagList.length > 0
        ? tagList.join(',')
        : getDefaultKeywords(frontmatter)

      // 初始化 meta 数组
      if (!frontmatter.meta) {
        frontmatter.meta = []
      }

      const meta = frontmatter.meta

      // --- Open Graph ---
      addMeta(meta, 'og:title', pageTitle, 'property')
      addMeta(meta, 'og:description', description, 'property')
      addMeta(meta, 'og:url', url, 'property')
      addMeta(meta, 'og:site_name', SITE_NAME, 'property')
      addMeta(meta, 'og:locale', LOCALE, 'property')
      addMeta(meta, 'og:image', image, 'property')

      if (frontmatter.blog) {
        addMeta(meta, 'og:type', 'article', 'property')
        if (publishDate) {
          addMeta(meta, 'article:published_time', publishDate, 'property')
        }
        if (modifiedDate) {
          addMeta(meta, 'article:modified_time', modifiedDate, 'property')
        }
        addMeta(meta, 'article:author', AUTHOR, 'property')
        tagList.forEach(tag => {
          addMeta(meta, 'article:tag', String(tag), 'property')
        })
      } else {
        addMeta(meta, 'og:type', 'website', 'property')
      }

      // --- Twitter Cards ---
      addMeta(meta, 'twitter:card', 'summary_large_image')
      addMeta(meta, 'twitter:title', pageTitle)
      addMeta(meta, 'twitter:description', description)
      addMeta(meta, 'twitter:image', image)
      if (TWITTER_HANDLE) {
        addMeta(meta, 'twitter:site', TWITTER_HANDLE)
        addMeta(meta, 'twitter:creator', TWITTER_HANDLE)
      }

      // --- 额外 SEO meta ---
      if (keywords) {
        addMeta(meta, 'keywords', keywords)
      }

      // --- 存储 JSON-LD，供 generated 阶段注入 ---
      const jsonLd = generateJsonLd({
        isBlog: !!frontmatter.blog,
        isHome: !!frontmatter.home,
        title: title || SITE_NAME,
        description,
        url,
        image,
        publishDate,
        modifiedDate,
        tags: tagList,
      })

      pageJsonLdMap.set(pagePath, JSON.stringify(jsonLd))
    },

    // 在 HTML 文件生成后，注入 JSON-LD 到 <head>
    async generated() {
      const { pages } = context.getSiteData
        ? context.getSiteData()
        : context

      const outDir = context.outDir || context.options.dest

      let injected = 0

      for (const page of pages) {
        const jsonLd = pageJsonLdMap.get(page.path)
          || pageJsonLdMap.get(page._permalink)
          || pageJsonLdMap.get(page.regularPath)
        if (!jsonLd) continue

        // 使用 _permalink 或 path 计算输出文件路径
        const pagePath = page._permalink || page.path

        let htmlPath
        if (pagePath.endsWith('/')) {
          htmlPath = path.join(outDir, pagePath, 'index.html')
        } else if (pagePath.endsWith('.html')) {
          htmlPath = path.join(outDir, pagePath)
        } else {
          continue
        }

        if (!fs.existsSync(htmlPath)) continue

        let html = fs.readFileSync(htmlPath, 'utf-8')

        // 在 </head> 前注入 JSON-LD
        const scriptTag = `<script type="application/ld+json">${jsonLd}</script>`
        html = html.replace('</head>', `${scriptTag}\n</head>`)

        fs.writeFileSync(htmlPath, html, 'utf-8')
        injected++
      }

      console.log(`[SEO] JSON-LD injected into ${injected} pages`)
    }
  }
}

function addMeta(metaArr, nameOrProp, content, keyType = 'name') {
  if (!content) return
  const entry = { content: String(content) }
  entry[keyType] = nameOrProp
  metaArr.push(entry)
}

function getExcerpt(content) {
  if (!content) return ''
  const cleaned = content
    .replace(/^---[\s\S]*?---/, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  return cleaned.slice(0, 160)
}

function getPageImage(frontmatter, content) {
  if (frontmatter.image) return frontmatter.image
  if (frontmatter.cover) return frontmatter.cover

  if (content) {
    const match = content.match(/!\[.*?\]\((.*?)\)/)
    if (match && match[1]) {
      const imgPath = match[1]
      if (imgPath.startsWith('http')) return imgPath
    }
  }

  return null
}

function getDefaultKeywords(frontmatter) {
  if (frontmatter.blog) {
    return '混沌福王,前端,软件工程,web开发'
  }
  return '混沌福王,软件工程师,web前端,架构,代码整洁'
}

function generateJsonLd({ isBlog, isHome, title, description, url, image, publishDate, modifiedDate, tags }) {
  if (isHome) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': SITE_NAME,
      'url': HOSTNAME,
      'description': description,
      'author': {
        '@type': 'Person',
        'name': AUTHOR,
        'url': HOSTNAME + '/about/'
      }
    }
  }

  if (isBlog) {
    const article = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': title,
      'description': description,
      'url': url,
      'image': image,
      'author': {
        '@type': 'Person',
        'name': AUTHOR,
        'url': HOSTNAME + '/about/'
      },
      'publisher': {
        '@type': 'Person',
        'name': AUTHOR,
        'url': HOSTNAME
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': url
      }
    }

    if (publishDate) article.datePublished = publishDate
    if (modifiedDate) article.dateModified = modifiedDate
    if (tags && tags.length > 0) article.keywords = tags.join(', ')

    return article
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': title,
    'description': description,
    'url': url,
    'author': {
      '@type': 'Person',
      'name': AUTHOR
    }
  }
}

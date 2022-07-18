module.exports = {
  permalink: "/:year/:month/:slug.html",
  // title: '混沌福王',
  // description: '不会吹口琴的心理咨询师不是好的工程师',
  configureWebpack: {
    resolve: {
      alias: {
        '@img': './assets/img'
      }
    }
  },
  lang: 'zh-CN',
  locales: {
    // 键名是该语言所属的子路径
    // 作为特例，默认语言可以使用 '/' 作为其路径。
    '/': {
      lang: 'zh-CN',
      title: '混沌福王',
      description: '专注于 web 前端技术和通用软件架构、代码整洁，研发效能，做独立思考的软件工程师'
    }
  },
  themeConfig: {
    logo: '/logo.png',
    lang: 'zh-CN',
    lastUpdated: 'Last Updated',
    sidebar: 'auto',
    nav: [
      { text: '首页', link: '/' },
      { text: '历史博客', link: '/history/' },
      // { text: '腾讯文档', link: 'https://docs.qq.com' },
    ],
    displayAllHeaders: true,

  },
  plugins: [
    require('./plugin/old-blog.js'),
    require('./plugin/baidu-seo.js'),
    ['@vuepress/active-header-links', {
      sidebarLinkSelector: '.sidebar-links',
      headerAnchorSelector: '.header-anchor'
    }]
  ]
}
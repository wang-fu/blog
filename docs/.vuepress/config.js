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
    lastUpdated: '更新时间',
    sidebar: 'auto',
    nav: [
      { text: '首页', link: '/' },
      { text: '历史博客', link: '/history/' },
      // { text: '腾讯文档', link: 'https://docs.qq.com' },
    ],
    displayAllHeaders: true,

  },
  plugins: [
    // 【旧:插件顺序不能随便调整】!!! 原来本地插件没有加 name  会导致有些会漏执行！！！坑
    // fix lastupdated 时间用中文格式导致插件报错，统一返回时间戳
    [
      '@vuepress/last-updated',
      {
        transformer: (timestamp, lang) => {
          return timestamp;
        }
      }
    ],
    // 兼容旧版本的 url 格式
    [require('./plugin/old-blog.js')],
    // 兼容还没有写完的文章显示
    [require('./plugin/todo.js')],
    // seo 生成 sitmap
    [require('./plugin/vuepress-plugin-sitemap/index.js'), {
      hostname: 'https://imwangfu.com'
    }],
    // seo 相关信息
    [require('./plugin/baidu-seo.js')],
    // readme 每次发布更新
    [require('./plugin/readme')],
  ]
}
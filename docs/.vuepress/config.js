module.exports = {
  title: '混沌福王',
  description: '不会吹口琴的心理咨询师不是好的工程师',
  configureWebpack: {
    resolve: {
      alias: {
        '@img': './assets/img'
      }
    }
  },
  themeConfig: {
    logo: '/logo.png',
    lastUpdated: 'Last Updated',
    nav: [
      { text: '首页', link: '/' },
      { text: '历史博客', link: '/history/' },
      { text: '腾讯文档', link: 'https://docs.qq.com' },
    ],
    displayAllHeaders: true,

  }
}
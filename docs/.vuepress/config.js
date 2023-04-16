const defaultTheme = require('./default-theme.js');

module.exports = {
  permalink: "/:year/:month/:slug.html",
  markdown: {
    toc: { includeLevel: [1, 2] },
    // extendMarkdown: md => {
    //   console.log(md.renderer.rules)

    //   const defaultOpenRenderer = (tokens, idx, options, env, self) => self.renderToken(tokens, idx, options);
    
    //   const buildTheme = (themeTpl) => {
    //     let mapping = {};
    //     const base = Object.assign({}, defaultTheme.BASE, {
    //       "font-family": ' -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;',
    //       "font-size": '14px',
    //     })
    //     for (let ele in themeTpl.inline) {
    //       if (themeTpl.inline.hasOwnProperty(ele)) {
    //         let style = themeTpl.inline[ele];
    //         mapping[ele] = Object.assign({}, themeTpl.BASE, style);
    //       }
    //     }
  
    //     for (let ele in themeTpl.block) {
    //       if (themeTpl.block.hasOwnProperty(ele)) {
    //         let style = themeTpl.block[ele];
    //         mapping[ele] =  Object.assign({}, base, style);
    //       }
    //     }
    //     return mapping;
    //   };

    //   const styleMapping = buildTheme(defaultTheme)
    //   let getStyles = (tokenName, addition) => {
    //     let arr = [];
    //     let dict = styleMapping[tokenName];
    //     if (!dict) return "";
    //     for (const key in dict) {
    //       arr.push(key + ":" + dict[key]);
    //     }
    //     return `${arr.join(";") + (addition || "")}`;
    //   };
   

    //   // 使用更多的 markdown-it 插件!
    //   md.renderer.rules.bullet_list_open = function (tokens, idx, options, env, self) {
    //     tokens[idx].attrJoin("class", "bullet_list_open")
    //     tokens[idx].attrJoin("style", getStyles('ul'))
    //     // console.log(tokens[idx])
    //     return defaultOpenRenderer(tokens, idx, options, env, self)
    //   };

 

    //   md.renderer.rules.ordered_list_open = function (tokens, idx, options, env, self) {
    //     tokens[idx].attrJoin("class", "list_item_open")
    //     tokens[idx].attrJoin("style", getStyles('ol'))
    //     return defaultOpenRenderer(tokens, idx, options, env, self)
    //   };
    //   md.renderer.rules.list_item_open = function (tokens, idx, options, env, self) {
    //     tokens[idx].attrJoin("class", "ordered_list_close")
    //     tokens[idx].attrJoin("style", getStyles('listitem'))

    //     return defaultOpenRenderer(tokens, idx, options, env, self) + '<span>• </span>'
      
    //   };
    //   md.renderer.rules.image = function (tokens, idx, options, env, self) {
    //     tokens[idx].attrJoin("class", "image")
    //     tokens[idx].attrJoin("style", getStyles('img'))
    //     const src = tokens[idx].attrGet('src')
    //     const alt = tokens[idx].attrGet('alt')

    //     let subText = "";
    //     if (alt) {
    //       subText = `<figcaption ${getStyles(
    //         "figcaption"
    //       )}>${alt}</figcaption>`;
    //     }
    //     let figureStyles = getStyles("figure");
    //     let imgStyles = getStyles("image");
    //     return `<figure style='${figureStyles}'><img style='${imgStyles}' src="${src}"  alt="${alt}"/>${subText}</figure>`;
    //   };
    //   md.renderer.rules.paragraph_open = function (tokens, idx, options, env, self) {
    //     tokens[idx].attrJoin("class", "ppp")
    //     tokens[idx].attrJoin("style", getStyles('p'))
    //     return defaultOpenRenderer(tokens, idx, options, env, self)
    //   };
   
    //   md.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
    //     tokens[idx].attrJoin("class", "heading_open")
    //     if (tokens[idx].tag === 'h1') {
    //       tokens[idx].attrJoin("style", getStyles('h1'))
    //     }
    //     if (tokens[idx].tag === 'h2') {
    //       tokens[idx].attrJoin("style", getStyles('h2'))
    //     }
    //     if (tokens[idx].tag === 'h3') {
    //       tokens[idx].attrJoin("style", getStyles('h3'))
    //     }
    //     if (tokens[idx].tag === 'h4') {
    //       tokens[idx].attrJoin("style", getStyles('h4'))
    //     }
    //     if (tokens[idx].tag === 'h5') {
    //       tokens[idx].attrJoin("style", getStyles('h5'))
    //     }
    //     return defaultOpenRenderer(tokens, idx, options, env, self)
    //   };
    //   return md
    // }
  },
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
      description: '独立思考的软件工程师，专注于 web 前端技术和通用软件架构、代码整洁，研发效'
    }
  },
  themeConfig: {
    logo: '/logo.png',
    lang: 'zh-CN',
    lastUpdated: '更新时间',
    sidebar: 'auto',
    nav: [
      { text: '首页', link: '/' },
      { text: '关于作者', link: '/about/' },
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
    // [require('./plugin/baidu-seo.js')],
    // readme 每次发布更新
    [require('./plugin/readme')],
  ]
}
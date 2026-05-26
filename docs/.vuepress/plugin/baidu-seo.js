
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');
module.exports = (options, ctx) => {

  return {
    name: 'baidu-seo',
    async generated(pagePaths, pages) {
      // 提交百度收录
      let urls = ['https://imwangfu.com']
      ctx.pages.forEach(item => {
        if (item.frontmatter.blog) {
          urls.push('https://imwangfu.com' + item._permalink);
        }
      });

      const data = urls.join("\n");

      const sitePath = path.resolve('./docs/.vuepress/dist', 'site.txt');
      fs.writeFileSync(sitePath, data);

      try {
        const res = await axios.post('http://data.zz.baidu.com/urls?site=https://imwangfu.com&token=t7KIC4CzgUFmnFLb',
          data,
          {
            headers: {
              'content-Type': 'text/plain'
            },
            timeout: 10000
          });
        console.log('[Baidu SEO]', res.data);
      } catch (err) {
        console.log('[Baidu SEO] 推送失败（不影响构建）:', err.message);
      }
    }
  }
}

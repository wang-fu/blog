
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

      console.log(urls);
      const data = urls.join("\n");
     
      const sitePath = path.resolve('./docs/.vuepress/dist', 'site.txt');
      fs.writeFileSync(sitePath, data);
      // fs.createWriteStream(sitePath).write(data, 'utf-8');
      axios.post('http://data.zz.baidu.com/urls?site=https://imwangfu.com&token=t7KIC4CzgUFmnFLb',
        data,
        {
          headers: {
            'content-Type': 'text/plain'
          }
        }).then((res) => {
          console.log(res.data);
        })
    }
  }
}

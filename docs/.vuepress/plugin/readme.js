const fs = require('fs');
const path = require('path');
module.exports = (options, ctx) => {
  const blogList = [];
  const blogTodo = []
  return {
    name: 'set-readme',
    async generated() {
      const absolutePath = path.resolve('./README.md');
      var re = new RegExp(/## 已发布.*(?=## division)/, 'gs');
      const readme = fs.readFileSync(absolutePath, { encoding: 'utf-8' });
      let content = '## 已发布的 blog\n'
      let todoContent = '## 未完成的 blog\n'

      // 对博客列表按日期排序（降序）
      blogList.sort((a, b) => {
        const dateA = new Date(a.frontmatter.date || a.path.split('/').slice(1, 3).join('-'));
        const dateB = new Date(b.frontmatter.date || b.path.split('/').slice(1, 3).join('-'));
        return dateB - dateA;
      });

      blogList.forEach(page => {
        const link = `- [${page.frontmatter.title}](https://imwangfu.com${page.path})`
        content += link + '\n';
      });

      // 对未完成博客列表也进行排序
      blogTodo.sort((a, b) => {
        const dateA = new Date(a.frontmatter.date || a.path.split('/').slice(1, 3).join('-'));
        const dateB = new Date(b.frontmatter.date || b.path.split('/').slice(1, 3).join('-'));
        return dateB - dateA;
      });

      blogTodo.forEach((page => {
        const link = `- [${page.frontmatter.title}](https://imwangfu.com${page.path})`
        todoContent += link + '\n';
      }));
      console.log(content)
      console.log(todoContent)
      const newReadme = readme.replace(re, content + todoContent);

      fs.writeFileSync(absolutePath, newReadme);
    },
    extendPageData($page) {
      if ($page.frontmatter.blog) {
        blogList.push($page);
      }
      if ($page.frontmatter.todo) {
        blogTodo.push($page)
      }
    }
  }
}
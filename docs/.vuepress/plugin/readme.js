
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
      blogList.forEach(page => {
        const link = `- [${page.frontmatter.title}](https://imwangfu.com${page.path})`
        content += link + '\n';
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
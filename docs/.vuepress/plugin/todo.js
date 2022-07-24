const path = require('path');
module.exports = (options, ctx) => {
  return {
    name: 'todo-blog',
    extendPageData ($page) {
      if ($page.frontmatter.todo) {
        $page._content = '当前文章尚未完成状态...  敬请期待';
        $page._filePath = '';
      }
    },
  }
}

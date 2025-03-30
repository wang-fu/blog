/**
 * 处理 render_type: html 的文件，确保 HTML 内容正确渲染
 */
module.exports = (options = {}, context) => ({
  name: 'vuepress-plugin-html-render',
  
  extendPageData($page) {
    const { frontmatter, _strippedContent } = $page
    
    // 如果文件指定了 render_type: html，则保留所有 HTML 标签
    if (frontmatter && frontmatter.render_type === 'html') {
      // 在页面数据中添加一个标记，表示这是 HTML 内容
      $page.isHtmlContent = true
      
      // 确保内容中的 HTML 标签不被转义
      if (_strippedContent) {
        $page.htmlContent = _strippedContent
      }
    }
  }
}) 
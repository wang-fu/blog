/**
 * Markdown-it plugin: 为所有 img 标签添加 loading="lazy" 和 decoding="async"
 */
module.exports = (options, context) => {
  return {
    name: 'image-lazy-load',
    extendMarkdown(md) {
      const defaultImageRenderer = md.renderer.rules.image
        || function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options)
        }

      md.renderer.rules.image = function (tokens, idx, options, env, self) {
        const token = tokens[idx]

        // 添加 loading="lazy"
        token.attrSet('loading', 'lazy')
        // 添加 decoding="async"
        token.attrSet('decoding', 'async')

        return defaultImageRenderer(tokens, idx, options, env, self)
      }
    }
  }
}

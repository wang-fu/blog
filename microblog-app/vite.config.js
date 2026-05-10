import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// 部署在 https://imwangfu.com/microblog/ 下
// vuepress 把 docs/.vuepress/public/microblog/ 直接拷到 dist/microblog/
// 因此 base 必须是 /microblog/
const BASE = '/microblog/'

export default defineConfig({
  base: BASE,
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      // 不在根作用域注册 SW，只在 /microblog/ 下作用
      scope: BASE,
      base: BASE,
      strategies: 'generateSW',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '微博',
        short_name: '微博',
        description: '我的 timeline，自动同步到 X/知乎/小红书',
        theme_color: '#0f1419',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE,
        scope: BASE,
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // 不缓存 GitHub API（要拿最新 timeline），只缓存 raw 文件内容（按 sha 永久 cache）
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*\.md$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'microblog-raw-md',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // 不要 fallback 到 index.html（hash 路由不需要）
        navigateFallback: null,
      },
      devOptions: {
        enabled: false, // dev 模式不启用 SW，避免开发烦
      },
    }),
  ],
  build: {
    target: 'es2018',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'lib-vendor': ['idb-keyval', 'js-yaml', 'date-fns'],
        },
      },
    },
  },
  server: {
    port: 5174,
    host: true,
  },
})

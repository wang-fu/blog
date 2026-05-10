# microblog-app

「微博」PWA — 个人 IP 自动化运营系统的前端。

写一次 → GitHub repo → Halo 数字人定时同步到 X / 知乎想法 → blog timeline 显示同步状态。

## 架构

- **GitHub repo 即 backend**：所有短文存为 `microblog/*.md`，frontmatter 含同步状态
- **PWA**：写作 + 浏览，IndexedDB 存 PAT 和草稿，调 GitHub Contents API 直接写文件
- **Halo 数字人**：定时（默认 1h）扫 `microblog/`，找 `state: pending` 的目标平台，调对应 Skill（`x-post`、`zhihu-publish-pin`），结果回写 frontmatter
- **可扩展平台**：`microblog/.config.json` 配置平台元数据，加平台 = 加 Skill + 改一行 config

## 技术栈

- Vue 3 (Composition API + `<script setup>`) + Vite + Pinia + vue-router (hash mode)
- IndexedDB 通过 `idb-keyval`
- frontmatter 解析用 `js-yaml`
- 完整 PWA（vite-plugin-pwa + Workbox）：可装到主屏、离线打开

## 开发

```bash
cd microblog-app
npm install
npm run dev          # 本地开发，http://localhost:5174
npm run build        # 生产构建到 dist/
npm run build:public # 构建 + 拷到 ../docs/.vuepress/public/microblog/
npx vite preview --port 5180  # 预览生产构建
```

## 部署

GitHub Actions（`.github/workflows/blank.yml`）流程：

```
checkout → cd microblog-app → npm install + vite build
        → cp -R dist/. ../docs/.vuepress/public/microblog/
        → npm run dist (vuepress build 整站)
        → push 到 gh-pages → 上线 imwangfu.com/microblog/
```

`docs/.vuepress/public/microblog/` 不进 git（已加 .gitignore），完全由 CI 生成。

## 首次使用

1. 访问 `imwangfu.com/microblog/` → 自动跳到 `#/setup`
2. 输入 GitHub PAT（fine-grained，权限 contents:write，仓库 wang-fu/blog）
3. 点「保存并验证」→ 显示「✓ 已认证为 imwangfu」
4. 点「完成」→ 进入 timeline
5. 点右下角 `+` → 写一条 → 选目标平台 → 「发布」

PAT 存浏览器 IndexedDB，不上传任何服务器。

## Halo 数字人配置

详见 [/Volumes/s790/blog/.claude/skills/](../.claude/skills/) 下的 Skill 定义和 Halo App ID `def89888-f710-4151-9682-8398110ad07c`。

## md schema

```yaml
---
id: 2026-05-10-1430-a3f
created: "2026-05-10T14:30:00Z"
content: 正文
targets: [x, zhihu]
status:
  x:     { state: posted, url: "...", at: "..." }
  zhihu: { state: pending }
---
```

字段说明见 `src/lib/frontmatter.js`。

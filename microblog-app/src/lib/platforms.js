/**
 * platforms.js — 平台抽象 + 配置加载
 *
 * 设计：所有平台元数据集中在 microblog/.config.json（部署在 GitHub repo），
 * 前端启动时拉一次（带 30s cache），渲染 chips、计字、徽章都从这里来。
 *
 * 新增平台 = 改 .config.json + 加 Skill + 改数字人 system_prompt 映射。
 *
 * 内置默认（fallback，万一 .config.json 拉不到）。
 */

const DEFAULT_CONFIG = {
  platforms: [
    {
      id: 'x',
      name: 'X',
      icon: '𝕏',
      color: '#000',
      char_limit: 280,
      enabled: true,
      site_url: 'https://x.com',
    },
    {
      id: 'zhihu',
      name: '知乎想法',
      icon: '知',
      color: '#0084ff',
      char_limit: 1000,
      enabled: true,
      site_url: 'https://www.zhihu.com',
    },
    {
      id: 'xhs',
      name: '小红书',
      icon: '📕',
      color: '#ff2442',
      char_limit: 1000,
      enabled: false, // v1 不启用，等图片支持
      site_url: 'https://www.xiaohongshu.com',
    },
  ],
  // 写作时默认勾选的平台
  default_targets: ['x', 'zhihu'],
}

let _cached = null
let _cachedAt = 0
const CONFIG_CACHE_TTL = 30 * 1000

import { GithubError } from './github.js'

/**
 * 加载平台配置。优先 microblog/.config.json，失败回落到内置默认。
 */
export async function loadConfig({ settings, force = false } = {}) {
  if (!force && _cached && Date.now() - _cachedAt < CONFIG_CACHE_TTL) {
    return _cached
  }
  const url = `https://raw.githubusercontent.com/${settings.owner}/${settings.repo}/${settings.branch}/microblog/.config.json`
  try {
    const resp = await fetch(url, { cache: 'no-store' })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const cfg = await resp.json()
    _cached = mergeConfig(cfg)
    _cachedAt = Date.now()
    return _cached
  } catch (e) {
    // fallback
    _cached = DEFAULT_CONFIG
    _cachedAt = Date.now()
    return _cached
  }
}

function mergeConfig(remote) {
  const platforms = (remote.platforms || []).map((p) => ({
    ...DEFAULT_CONFIG.platforms.find((d) => d.id === p.id),
    ...p,
  }))
  // 加上 default 里有但 remote 没的（向前兼容）
  for (const d of DEFAULT_CONFIG.platforms) {
    if (!platforms.find((p) => p.id === d.id)) platforms.push(d)
  }
  return {
    platforms,
    default_targets: remote.default_targets || DEFAULT_CONFIG.default_targets,
  }
}

export function getPlatform(config, id) {
  return config.platforms.find((p) => p.id === id) || null
}

/** 字数对各平台的状态：ok / warn(80%) / over(超出) */
export function charCountStatus(content, platform) {
  const len = [...(content || '')].length
  const limit = platform.char_limit
  if (!limit || len <= limit * 0.8) return 'ok'
  if (len <= limit) return 'warn'
  return 'over'
}

/** 内置 fallback，给单元测试 / 离线场景 */
export function getDefaultConfig() {
  return DEFAULT_CONFIG
}

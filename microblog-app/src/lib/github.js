/**
 * github.js — GitHub Contents API 封装
 *
 * 设计原则：
 * - list 走 Contents API（带 PAT，5000/h）+ 30s 短缓存
 * - 单条内容走 raw.githubusercontent.com（CDN，无 rate limit）+ 按 sha 永久缓存
 * - 写走 Contents API PUT（带 sha 防冲突）
 * - 所有错误统一抛 GithubError，含 status / code / message
 */

import {
  getListCache,
  setListCache,
  getShaCache,
  setShaCache,
  pruneShaCache,
} from './storage.js'

export class GithubError extends Error {
  constructor(message, { status, code, payload } = {}) {
    super(message)
    this.name = 'GithubError'
    this.status = status
    this.code = code
    this.payload = payload
  }
}

const API = 'https://api.github.com'
const RAW = 'https://raw.githubusercontent.com'
const MICROBLOG_DIR = 'microblog'

function authHeaders(pat) {
  if (!pat) throw new GithubError('GitHub PAT 未配置', { code: 'no_pat' })
  return {
    Authorization: `Bearer ${pat}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function apiFetch(path, { method = 'GET', body, settings, headers = {} } = {}) {
  const url = path.startsWith('http') ? path : `${API}${path}`
  const opts = {
    method,
    headers: { ...authHeaders(settings.pat), ...headers },
  }
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  let resp
  try {
    resp = await fetch(url, opts)
  } catch (e) {
    throw new GithubError(`网络错误: ${e.message}`, { code: 'network_error' })
  }
  if (!resp.ok) {
    let payload = null
    try {
      payload = await resp.json()
    } catch {}
    const code = mapStatusToCode(resp.status)
    throw new GithubError(
      `GitHub API ${resp.status}: ${payload?.message || resp.statusText}`,
      { status: resp.status, code, payload },
    )
  }
  if (resp.status === 204) return null
  return resp.json()
}

function mapStatusToCode(status) {
  if (status === 401) return 'auth_invalid'
  if (status === 403) return 'rate_limited_or_forbidden'
  if (status === 404) return 'not_found'
  if (status === 409) return 'sha_conflict'
  if (status === 422) return 'validation_failed'
  if (status >= 500) return 'github_server_error'
  return 'http_error'
}

// ────────────────────────────────────────────
// list microblog/ 目录
// ────────────────────────────────────────────

/**
 * 列出 microblog/ 下所有 .md 文件，返回按文件名倒序（新的在前）。
 * 返回项 = { name, sha, size, path, download_url }
 */
export async function listPosts({ settings, useCache = true } = {}) {
  const cacheKey = `list:${settings.owner}/${settings.repo}@${settings.branch}/${MICROBLOG_DIR}`
  if (useCache) {
    const cached = await getListCache(cacheKey)
    if (cached) return cached
  }

  let items
  try {
    items = await apiFetch(
      `/repos/${settings.owner}/${settings.repo}/contents/${MICROBLOG_DIR}?ref=${encodeURIComponent(settings.branch)}`,
      { settings },
    )
  } catch (e) {
    if (e.code === 'not_found') {
      // 目录不存在 = 空 timeline
      await setListCache(cacheKey, [])
      return []
    }
    throw e
  }

  if (!Array.isArray(items)) {
    // GitHub API 返回单文件时不是数组，但目录返回是数组
    return []
  }

  const mds = items
    .filter((x) => x.type === 'file' && x.name.endsWith('.md'))
    .sort((a, b) => (a.name < b.name ? 1 : -1)) // 文件名倒序（YYYY-MM-DD- 开头，新的在前）

  await setListCache(cacheKey, mds)

  // 顺手 prune 过期 sha 缓存
  pruneShaCache(mds.map((m) => m.sha)).catch(() => {})

  return mds
}

// ────────────────────────────────────────────
// 读单条内容 — 走 raw + sha 缓存
// ────────────────────────────────────────────

/**
 * 读取一条 md 文件原始内容。
 * 优先走 sha 缓存（永久），miss 时走 raw.githubusercontent.com（CDN）。
 */
export async function fetchMdContent({ settings, item }) {
  if (item?.sha) {
    const cached = await getShaCache(item.sha)
    if (cached !== null) return cached
  }
  const url = `${RAW}/${settings.owner}/${settings.repo}/${settings.branch}/${item.path}`
  let resp
  try {
    resp = await fetch(url)
  } catch (e) {
    throw new GithubError(`raw 拉取网络错误: ${e.message}`, { code: 'network_error' })
  }
  if (!resp.ok) {
    throw new GithubError(`raw HTTP ${resp.status}`, { status: resp.status, code: 'http_error' })
  }
  const text = await resp.text()
  if (item.sha) await setShaCache(item.sha, text)
  return text
}

// ────────────────────────────────────────────
// 创建新文件
// ────────────────────────────────────────────

/**
 * 在 microblog/ 下创建新 md 文件。
 * 返回 GitHub API response（含 content.sha 等）。
 */
export async function createPostFile({ settings, filename, mdContent, message }) {
  const path = `${MICROBLOG_DIR}/${filename}`
  return apiFetch(`/repos/${settings.owner}/${settings.repo}/contents/${path}`, {
    method: 'PUT',
    settings,
    body: {
      message: message || `microblog: post ${filename}`,
      content: utf8ToBase64(mdContent),
      branch: settings.branch,
    },
  })
}

/** 更新已存在文件（要带 sha） */
export async function updatePostFile({ settings, path, sha, mdContent, message }) {
  return apiFetch(`/repos/${settings.owner}/${settings.repo}/contents/${path}`, {
    method: 'PUT',
    settings,
    body: {
      message: message || `microblog: update ${path}`,
      content: utf8ToBase64(mdContent),
      sha,
      branch: settings.branch,
    },
  })
}

// ────────────────────────────────────────────
// utils
// ────────────────────────────────────────────

/** 浏览器安全的 UTF-8 → base64 */
export function utf8ToBase64(str) {
  // encodeURIComponent → escape → btoa 的旧招式有缺陷；用 TextEncoder + 二进制
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

/** 验证 PAT 有效性（命中 /user）*/
export async function verifyToken({ settings }) {
  try {
    const u = await apiFetch('/user', { settings })
    return { ok: true, login: u.login }
  } catch (e) {
    return { ok: false, error: e.message, code: e.code }
  }
}

/** 验证 repo 可写 */
export async function verifyRepo({ settings }) {
  try {
    const r = await apiFetch(`/repos/${settings.owner}/${settings.repo}`, { settings })
    if (!r.permissions?.push) {
      return { ok: false, error: 'PAT 没有该仓库的写权限', code: 'no_push' }
    }
    return { ok: true, default_branch: r.default_branch, private: r.private }
  } catch (e) {
    return { ok: false, error: e.message, code: e.code }
  }
}

/**
 * storage.js — IndexedDB wrapper（基于 idb-keyval）
 *
 * 三种存储职责：
 *
 * 1. settings  — { pat, owner, repo, branch }，用户配置（敏感）
 * 2. drafts    — 当前 compose 草稿（单条，自动保存）
 * 3. localPosts — 本地乐观副本（已点提交但 GitHub 还没确认到达 / 还没显示在 timeline）
 *               key = post.id，value = { id, created, content, targets, status, localState }
 *               localState ∈ { 'pending_upload' | 'uploaded_pending_appear' | 'failed' }
 *
 * 4. listCache — GitHub list response 短期缓存（30s）
 * 5. shaCache  — sha → 文件内容长期缓存（永久，按 sha 失效）
 */

import { get, set, del, keys, createStore, entries } from 'idb-keyval'

const settingsStore = createStore('microblog-settings', 'kv')
const draftsStore = createStore('microblog-drafts', 'kv')
const localPostsStore = createStore('microblog-local-posts', 'kv')
const listCacheStore = createStore('microblog-list-cache', 'kv')
const shaCacheStore = createStore('microblog-sha-cache', 'kv')

// ────────────────────────────────────────────
// settings
// ────────────────────────────────────────────

const SETTINGS_KEY = 'config'

export async function getSettings() {
  return (await get(SETTINGS_KEY, settingsStore)) || null
}

export async function setSettings(cfg) {
  await set(SETTINGS_KEY, cfg, settingsStore)
}

export async function clearSettings() {
  await del(SETTINGS_KEY, settingsStore)
}

// ────────────────────────────────────────────
// draft
// ────────────────────────────────────────────

const DRAFT_KEY = 'current'

export async function getDraft() {
  return (await get(DRAFT_KEY, draftsStore)) || null
}

export async function setDraft(draft) {
  if (!draft || !draft.content) {
    await del(DRAFT_KEY, draftsStore)
    return
  }
  await set(DRAFT_KEY, draft, draftsStore)
}

export async function clearDraft() {
  await del(DRAFT_KEY, draftsStore)
}

// ────────────────────────────────────────────
// local posts (乐观副本)
// ────────────────────────────────────────────

export async function listLocalPosts() {
  const all = await entries(localPostsStore)
  return all.map(([, v]) => v)
}

export async function getLocalPost(id) {
  return (await get(id, localPostsStore)) || null
}

export async function setLocalPost(post) {
  if (!post?.id) throw new Error('setLocalPost: post.id required')
  await set(post.id, post, localPostsStore)
}

export async function deleteLocalPost(id) {
  await del(id, localPostsStore)
}

// ────────────────────────────────────────────
// list cache (短期)
// ────────────────────────────────────────────

const LIST_CACHE_TTL = 30 * 1000

export async function getListCache(key) {
  const entry = await get(key, listCacheStore)
  if (!entry) return null
  if (Date.now() - entry.savedAt > LIST_CACHE_TTL) {
    await del(key, listCacheStore)
    return null
  }
  return entry.data
}

export async function setListCache(key, data) {
  await set(key, { savedAt: Date.now(), data }, listCacheStore)
}

// ────────────────────────────────────────────
// sha cache (长期，按 sha 失效)
// ────────────────────────────────────────────

export async function getShaCache(sha) {
  return (await get(sha, shaCacheStore)) || null
}

export async function setShaCache(sha, content) {
  await set(sha, content, shaCacheStore)
}

/** 清掉过期 sha cache（不在 keepShas 集合里的） */
export async function pruneShaCache(keepShas) {
  const all = await keys(shaCacheStore)
  const keep = new Set(keepShas)
  for (const k of all) {
    if (!keep.has(k)) await del(k, shaCacheStore)
  }
}

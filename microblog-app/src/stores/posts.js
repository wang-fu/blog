/**
 * posts store —— 时间线核心状态
 *
 * 数据来源合并：
 *   1. 远程 GitHub repo 中的 microblog/*.md（authoritative）
 *   2. 本地 IndexedDB localPosts（乐观副本，远程没出现前显示）
 *
 * 合并规则：
 *   - 按 id 去重
 *   - 远程优先（远程版有数字人写回的最新 status）
 *   - 远程没有的本地副本继续显示，并标 displayState='本地等待上线'
 *
 * 远程一旦看到该 id → 删本地副本
 *
 * 分页：远程 list 一次性拿全（GitHub 单目录最多 1000 项 + 我们短文 .md 只有 frontmatter，体积小，OK）
 *      然后前端逐页加载详细内容（每页 10 条并发拉 raw）
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSettingsStore } from './settings.js'
import { listPosts, fetchMdContent } from '../lib/github.js'
import { parse } from '../lib/frontmatter.js'
import * as storage from '../lib/storage.js'

const PAGE_SIZE = 10

export const usePostsStore = defineStore('posts', () => {
  const settings = useSettingsStore()

  // 远程 list（轻量元数据）+ 本地副本
  const remoteList = ref([]) // [{ name, sha, path, download_url }, ...]
  const remoteContents = ref(new Map()) // id → { id, created, content, targets, status }
  const localPosts = ref(new Map()) // id → 同上 + localState

  const loadingList = ref(false)
  const loadingMore = ref(false)
  const loadedCount = ref(0) // 已经加载内容的远程项数
  const error = ref(null)

  /** 合并后的最终时间线（按 created 倒序） */
  const timeline = computed(() => {
    const map = new Map()
    // 先放本地副本
    for (const [id, p] of localPosts.value) {
      map.set(id, { ...p, source: 'local' })
    }
    // 远程覆盖本地（如果同 id 存在）
    for (const [id, p] of remoteContents.value) {
      map.set(id, { ...p, source: 'remote' })
    }
    const arr = [...map.values()]
    arr.sort((a, b) => {
      const ta = new Date(a.created).getTime() || 0
      const tb = new Date(b.created).getTime() || 0
      return tb - ta
    })
    return arr
  })

  const hasMore = computed(() => loadedCount.value < remoteList.value.length)

  /** 初始化：加载本地副本 + 远程 list + 第一页内容（无 PAT 也能跑，匿名读 public repo） */
  async function init({ force = false } = {}) {
    error.value = null
    await loadLocal()
    await refreshList({ force })
    await loadMore()
    // 远程出现了的本地副本 → 删
    await syncLocalCleanup()
  }

  async function loadLocal() {
    const list = await storage.listLocalPosts()
    localPosts.value = new Map(list.map((p) => [p.id, p]))
  }

  async function refreshList({ force = false } = {}) {
    loadingList.value = true
    error.value = null
    try {
      const items = await listPosts({ settings: settings.settings, useCache: !force })
      // 过滤掉 .config.json 等非短文
      remoteList.value = items.filter((it) => it.name.match(/^\d{4}-\d{2}-\d{2}.*\.md$/))
      loadedCount.value = 0
      remoteContents.value = new Map()
    } catch (e) {
      error.value = e.message
    } finally {
      loadingList.value = false
    }
  }

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    try {
      const start = loadedCount.value
      const end = Math.min(start + PAGE_SIZE, remoteList.value.length)
      const slice = remoteList.value.slice(start, end)
      const fetched = await Promise.all(
        slice.map(async (item) => {
          try {
            const text = await fetchMdContent({ settings: settings.settings, item })
            const { data } = parse(text)
            return { item, data, error: null }
          } catch (e) {
            return { item, data: null, error: e.message }
          }
        }),
      )
      const next = new Map(remoteContents.value)
      for (const { item, data, error: err } of fetched) {
        if (data && data.id) {
          next.set(data.id, {
            id: data.id,
            created: data.created || isoFromFilename(item.name),
            content: data.content || '',
            targets: data.targets || [],
            status: data.status || {},
            _path: item.path,
            _sha: item.sha,
          })
        } else if (err) {
          // 损坏的文件，给 placeholder
          next.set(`__broken_${item.sha}`, {
            id: `__broken_${item.sha}`,
            created: isoFromFilename(item.name),
            content: `(文件解析失败: ${err})`,
            targets: [],
            status: {},
            _broken: true,
          })
        }
      }
      remoteContents.value = next
      loadedCount.value = end

      // 同步检查：远程 ids 出现的本地副本删掉
      await syncLocalCleanup()
    } finally {
      loadingMore.value = false
    }
  }

  async function syncLocalCleanup() {
    const remoteIds = new Set(remoteContents.value.keys())
    for (const [id, p] of [...localPosts.value]) {
      if (remoteIds.has(id)) {
        await storage.deleteLocalPost(id)
        const next = new Map(localPosts.value)
        next.delete(id)
        localPosts.value = next
      }
    }
  }

  /** 提交后写入本地副本（乐观） */
  async function addLocalPost(post, localState) {
    const next = new Map(localPosts.value)
    const item = { ...post, localState }
    next.set(post.id, item)
    localPosts.value = next
    await storage.setLocalPost(item)
  }

  async function updateLocalPost(id, patch) {
    const cur = localPosts.value.get(id)
    if (!cur) return
    const next = new Map(localPosts.value)
    const updated = { ...cur, ...patch }
    next.set(id, updated)
    localPosts.value = next
    await storage.setLocalPost(updated)
  }

  function getById(id) {
    return localPosts.value.get(id) || remoteContents.value.get(id) || null
  }

  /** 详情页：按需保证已加载某 id（如果 list 有但还没拉内容，单独拉一次） */
  async function ensureLoaded(id) {
    if (getById(id)) return getById(id)
    // 详情页：无 PAT 也能加载（匿名读 public repo）
    // 找 remoteList 中匹配 id 的项（filename 含 id）
    const match = remoteList.value.find((it) => it.name.startsWith(id + '.') || it.name === id + '.md')
    if (!match) {
      // list 也没刷新过 → 强刷
      await refreshList({ force: true })
      const m2 = remoteList.value.find((it) => it.name.startsWith(id + '.') || it.name === id + '.md')
      if (!m2) return null
      const text = await fetchMdContent({ settings: settings.settings, item: m2 })
      const { data } = parse(text)
      const post = {
        id: data.id,
        created: data.created,
        content: data.content || '',
        targets: data.targets || [],
        status: data.status || {},
        _path: m2.path,
        _sha: m2.sha,
      }
      const next = new Map(remoteContents.value)
      next.set(post.id, post)
      remoteContents.value = next
      return post
    }
    const text = await fetchMdContent({ settings: settings.settings, item: match })
    const { data } = parse(text)
    const post = {
      id: data.id,
      created: data.created,
      content: data.content || '',
      targets: data.targets || [],
      status: data.status || {},
      _path: match.path,
      _sha: match.sha,
    }
    const next = new Map(remoteContents.value)
    next.set(post.id, post)
    remoteContents.value = next
    return post
  }

  return {
    timeline,
    remoteList,
    remoteContents,
    localPosts,
    loadingList,
    loadingMore,
    hasMore,
    error,
    init,
    loadLocal,
    refreshList,
    loadMore,
    addLocalPost,
    updateLocalPost,
    getById,
    ensureLoaded,
    syncLocalCleanup,
  }
})

/** 文件名 2026-05-10-1430-xxx.md → 大致 ISO 时间（兜底用） */
function isoFromFilename(name) {
  const m = name.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})/)
  if (!m) return new Date().toISOString()
  const [, y, mo, d, hh, mm] = m
  return `${y}-${mo}-${d}T${hh}:${mm}:00.000Z`
}

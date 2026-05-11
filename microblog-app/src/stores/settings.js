import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as storage from '../lib/storage.js'
import { verifyToken, verifyRepo } from '../lib/github.js'
import { getReadOnlySettings } from '../lib/defaults.js'

export const useSettingsStore = defineStore('settings', () => {
  // 用户保存的 settings（含 PAT，可能为 null 表示从没设置过）
  const userSettings = ref(null)
  const loading = ref(false)
  const verifyResult = ref(null) // { ok, login? owner? error? }

  /**
   * 实际生效的 settings。三档：
   *  - 有 PAT 的 userSettings → 完全态（可读可写）
   *  - 没 PAT 但有 owner/repo 配置 → 当 read-only（不太常见）
   *  - 完全没配置 → fallback 到 defaults（公开只读 wang-fu/blog）
   */
  const settings = computed(() => {
    if (userSettings.value?.owner && userSettings.value?.repo) {
      return userSettings.value
    }
    return getReadOnlySettings()
  })

  /** 用户是否已配置 PAT（即可以写） */
  const canWrite = computed(() => !!userSettings.value?.pat)

  /** 旧 API 兼容（已经在多处用了 isReady 判断），等同 canWrite */
  const isReady = canWrite

  async function load() {
    loading.value = true
    try {
      const cfg = await storage.getSettings()
      userSettings.value = cfg
    } finally {
      loading.value = false
    }
  }

  async function save(cfg) {
    const next = {
      pat: cfg.pat?.trim() || '',
      owner: cfg.owner?.trim() || '',
      repo: cfg.repo?.trim() || '',
      branch: cfg.branch?.trim() || 'master',
    }
    await storage.setSettings(next)
    userSettings.value = next
  }

  async function verify() {
    if (!canWrite.value) {
      verifyResult.value = { ok: false, error: '请填写 PAT' }
      return verifyResult.value
    }
    const t = await verifyToken({ settings: settings.value })
    if (!t.ok) {
      verifyResult.value = { ok: false, error: 'PAT 无效: ' + t.error }
      return verifyResult.value
    }
    const r = await verifyRepo({ settings: settings.value })
    if (!r.ok) {
      verifyResult.value = { ok: false, error: '仓库不可写: ' + r.error }
      return verifyResult.value
    }
    verifyResult.value = { ok: true, login: t.login, default_branch: r.default_branch }
    return verifyResult.value
  }

  async function clear() {
    await storage.clearSettings()
    userSettings.value = null
    verifyResult.value = null
  }

  return { settings, userSettings, loading, verifyResult, isReady, canWrite, load, save, verify, clear }
})

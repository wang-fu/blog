import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as storage from '../lib/storage.js'
import { verifyToken, verifyRepo } from '../lib/github.js'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(null)
  const loading = ref(false)
  const verifyResult = ref(null) // { ok, login? owner? error? }

  const isReady = computed(() => !!(settings.value?.pat && settings.value?.owner && settings.value?.repo))

  async function load() {
    loading.value = true
    try {
      const cfg = await storage.getSettings()
      settings.value = cfg
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
    settings.value = next
  }

  async function verify() {
    if (!isReady.value) {
      verifyResult.value = { ok: false, error: '配置不完整' }
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
    settings.value = null
    verifyResult.value = null
  }

  return { settings, loading, verifyResult, isReady, load, save, verify, clear }
})

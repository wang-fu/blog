<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings.js'
import { usePostsStore } from '../stores/posts.js'
import { loadConfig, getPlatform } from '../lib/platforms.js'
import { fullDateTime } from '../lib/relativeTime.js'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const settings = useSettingsStore()
const posts = usePostsStore()

const post = ref(null)
const config = ref({ platforms: [], default_targets: [] })
const loading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  await settings.load()
  if (!settings.isReady) {
    router.replace({ name: 'setup' })
    return
  }
  config.value = await loadConfig({ settings: settings.settings })
  if (posts.timeline.length === 0) {
    await posts.init()
  }
  try {
    const p = await posts.ensureLoaded(props.id)
    if (!p) {
      errorMsg.value = '找不到这条微博'
    } else {
      post.value = p
    }
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
})

function back() {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'timeline' })
}

const platformRows = computed(() => {
  if (!post.value) return []
  return (post.value.targets || []).map((id) => {
    const p = getPlatform(config.value, id) || { id, name: id, icon: id }
    const st = post.value.status?.[id] || {}
    return { id, platform: p, state: st }
  })
})
</script>

<template>
  <header class="app-header">
    <button class="icon-btn" @click="back" data-test="btn-detail-back" title="返回">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
    <h1>详情</h1>
    <div style="width: 36px"></div>
  </header>

  <main class="detail">
    <div v-if="loading" class="loading-state"><div class="spinner"></div></div>
    <div v-else-if="errorMsg" class="error-state">{{ errorMsg }}</div>
    <div v-else-if="post">
      <div class="detail-content" data-test="detail-content">{{ post.content }}</div>
      <div class="detail-time" :title="fullDateTime(post.created)">
        {{ fullDateTime(post.created) }}
      </div>
      <div class="detail-platforms">
        <div class="platform-row" v-for="row in platformRows" :key="row.id">
          <span class="badge-icon">{{ row.platform.icon }}</span>
          <span class="platform-name">{{ row.platform.name }}</span>
          <span class="platform-state">
            <template v-if="row.state.state === 'posted'">
              <a :href="row.state.url" target="_blank" rel="noopener">已发布 ↗</a>
            </template>
            <template v-else-if="row.state.state === 'failed'">
              ⚠ {{ row.state.error || '失败' }}
            </template>
            <template v-else>
              ⏳ 同步中
            </template>
          </span>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../stores/settings.js'
import { usePostsStore } from '../stores/posts.js'
import { loadConfig } from '../lib/platforms.js'
import PostCard from '../components/PostCard.vue'

const router = useRouter()
const settings = useSettingsStore()
const posts = usePostsStore()
const { timeline, loadingList, loadingMore, hasMore, error } = storeToRefs(posts)

const config = ref({ platforms: [], default_targets: [] })
const refreshing = ref(false)

onMounted(async () => {
  await settings.load()
  // 不再强制跳 setup —— 未配置 PAT 时进只读模式（用 defaults 仓库）
  config.value = await loadConfig({ settings: settings.settings })
  await posts.init()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

function onScroll() {
  if (loadingMore.value || !hasMore.value) return
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 400
  if (nearBottom) posts.loadMore()
}

async function refresh() {
  if (refreshing.value) return
  refreshing.value = true
  try {
    config.value = await loadConfig({ settings: settings.settings, force: true })
    await posts.refreshList({ force: true })
    await posts.loadMore()
  } finally {
    refreshing.value = false
  }
}

function goCompose() {
  router.push({ name: 'compose' })
}

function goSetup() {
  router.push({ name: 'setup' })
}
</script>

<template>
  <header class="app-header">
    <h1>微博</h1>
    <div style="display: flex; gap: 4px">
      <button
        class="icon-btn"
        @click="refresh"
        :disabled="refreshing"
        :title="refreshing ? '刷新中…' : '刷新'"
        data-test="btn-refresh"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          :style="refreshing ? 'animation: spin 0.8s linear infinite' : ''"
        >
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      </button>
      <button class="icon-btn" @click="goSetup" title="设置" data-test="btn-setup">
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
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </svg>
      </button>
    </div>
  </header>

  <main>
    <div v-if="error" class="error-state" data-test="timeline-error">{{ error }}</div>

    <div v-if="loadingList && timeline.length === 0" class="loading-state">
      <div class="spinner"></div>
      <div style="margin-top: 8px">加载中…</div>
    </div>

    <div v-else-if="timeline.length === 0" class="empty-state" data-test="timeline-empty">
      还没写过任何东西。
      <template v-if="settings.canWrite">
        <br />
        <a href="#" @click.prevent="goCompose" style="color: var(--color-accent)">写第一条</a>
      </template>
    </div>

    <div v-else data-test="timeline-list">
      <PostCard v-for="p in timeline" :key="p.id" :post="p" :config="config" />
      <div v-if="hasMore" class="load-more">
        <span v-if="loadingMore">
          <span class="spinner"></span>
          <span style="margin-left: 8px">加载更多…</span>
        </span>
        <button v-else class="btn-secondary" @click="posts.loadMore()">加载更多</button>
      </div>
      <div v-else class="load-more">— 已经到底了 —</div>
    </div>
  </main>

  <button
    v-if="settings.canWrite"
    class="compose-fab"
    @click="goCompose"
    title="写微博"
    data-test="fab-compose"
    aria-label="写微博"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M12 5v14M5 12h14" stroke-linecap="round" />
    </svg>
  </button>
</template>

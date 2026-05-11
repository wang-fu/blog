<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings.js'
import { usePostsStore } from '../stores/posts.js'
import { loadConfig, charCountStatus } from '../lib/platforms.js'
import * as storage from '../lib/storage.js'
import { genId, buildPostMd } from '../lib/frontmatter.js'
import { createPostFile, GithubError } from '../lib/github.js'

const router = useRouter()
const settings = useSettingsStore()
const posts = usePostsStore()

const content = ref('')
const config = ref({ platforms: [], default_targets: [] })
const targets = ref([])
const submitting = ref(false)
const errorMsg = ref('')
const initialized = ref(false)

const charCount = computed(() => [...content.value].length)

/** 字数对当前选中平台的状态：取最严格的（最低 limit）*/
const charStatus = computed(() => {
  const selected = config.value.platforms.filter(
    (p) => targets.value.includes(p.id) && p.char_limit,
  )
  if (selected.length === 0) return 'ok'
  let worst = 'ok'
  for (const p of selected) {
    const s = charCountStatus(content.value, p)
    if (s === 'over') return 'over'
    if (s === 'warn') worst = 'warn'
  }
  return worst
})

const submitDisabled = computed(
  () =>
    submitting.value ||
    !content.value.trim() ||
    targets.value.length === 0 ||
    charStatus.value === 'over',
)

let saveTimer = null

watch(content, (v) => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    storage.setDraft({ content: v, targets: [...targets.value], savedAt: Date.now() })
  }, 500)
})

watch(
  targets,
  (v) => {
    if (!initialized.value) return
    storage.setDraft({ content: content.value, targets: [...v], savedAt: Date.now() })
  },
  { deep: true },
)

onMounted(async () => {
  await settings.load()
  if (!settings.canWrite) {
    // 写微博需要 PAT —— 跳到 setup
    router.replace({ name: 'setup', query: { reason: 'compose' } })
    return
  }
  config.value = await loadConfig({ settings: settings.settings })
  const draft = await storage.getDraft()
  if (draft && draft.content) {
    content.value = draft.content
    targets.value = (draft.targets || []).filter(
      (t) => config.value.platforms.find((p) => p.id === t && p.enabled !== false),
    )
  }
  if (targets.value.length === 0) {
    targets.value = config.value.default_targets.filter(
      (id) => config.value.platforms.find((p) => p.id === id && p.enabled !== false),
    )
  }
  initialized.value = true
  // focus textarea
  setTimeout(() => {
    document.querySelector('.compose-textarea')?.focus()
  }, 100)
})

onBeforeUnmount(() => {
  if (saveTimer) clearTimeout(saveTimer)
})

function toggleTarget(id) {
  if (targets.value.includes(id)) {
    targets.value = targets.value.filter((t) => t !== id)
  } else {
    targets.value = [...targets.value, id]
  }
}

function close() {
  router.push({ name: 'timeline' })
}

async function submit() {
  if (submitDisabled.value) return
  submitting.value = true
  errorMsg.value = ''
  const now = new Date()
  const id = genId(now)
  const created = now.toISOString()
  const text = content.value
  const tgts = [...targets.value]

  const post = {
    id,
    created,
    content: text,
    targets: tgts,
    status: tgts.reduce((acc, t) => ({ ...acc, [t]: { state: 'pending' } }), {}),
  }

  // 1. 立刻写本地副本（乐观）
  await posts.addLocalPost(post, 'pending_upload')

  // 2. 立刻清掉草稿（避免重复发）
  await storage.clearDraft()

  // 3. 跳回 timeline，让用户立即看到
  router.push({ name: 'timeline' })

  // 4. 后台 PUT 到 GitHub
  try {
    const filename = `${id}.md`
    const md = buildPostMd({ id, created, content: text, targets: tgts })
    await createPostFile({
      settings: settings.settings,
      filename,
      mdContent: md,
      message: `microblog: post ${id}`,
    })
    await posts.updateLocalPost(id, { localState: 'uploaded_pending_appear' })
    // 不强刷 list（让 30s cache 自然到期或下拉刷新）
  } catch (e) {
    const msg = e instanceof GithubError ? e.message : String(e)
    await posts.updateLocalPost(id, { localState: 'failed', uploadError: msg })
    // 也存回草稿，方便用户重试（先存简单的）
    await storage.setDraft({ content: text, targets: tgts, savedAt: Date.now() })
    // 通知用户
    alert('上传失败：' + msg + '\n草稿已恢复，可以重试。')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="compose">
    <header class="app-header">
      <button class="icon-btn" @click="close" title="关闭" data-test="btn-compose-close">
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
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      <h1>写微博</h1>
      <div style="width: 36px"></div>
    </header>

    <div class="compose-body">
      <textarea
        class="compose-textarea"
        v-model="content"
        placeholder="此刻在想什么？"
        rows="8"
        data-test="compose-textarea"
      ></textarea>
    </div>

    <div class="compose-footer">
      <div class="compose-targets" data-test="compose-targets">
        <button
          v-for="p in config.platforms.filter((x) => x.enabled !== false)"
          :key="p.id"
          :class="['target-chip', { active: targets.includes(p.id) }]"
          :data-test="`chip-${p.id}`"
          @click="toggleTarget(p.id)"
        >
          <span>{{ p.icon }}</span>
          <span>{{ p.name }}</span>
        </button>
      </div>

      <div class="compose-bottom">
        <span :class="['char-counter', charStatus]" data-test="char-counter">
          <span class="count">{{ charCount }}</span>
          <span style="opacity: 0.6">字</span>
        </span>
        <button
          class="btn-primary"
          :disabled="submitDisabled"
          @click="submit"
          data-test="btn-submit"
        >
          {{ submitting ? '发布中…' : '发布' }}
        </button>
      </div>

      <div v-if="errorMsg" class="error-state" style="padding: 8px 0">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings.js'

const router = useRouter()
const settings = useSettingsStore()

const form = ref({ pat: '', owner: 'wang-fu', repo: 'blog', branch: 'master' })
const verifying = ref(false)
const verifyState = ref(null) // { ok, login? error? }

onMounted(async () => {
  await settings.load()
  if (settings.settings) {
    form.value = { ...form.value, ...settings.settings }
  }
})

async function saveAndVerify() {
  verifying.value = true
  verifyState.value = null
  await settings.save(form.value)
  const r = await settings.verify()
  verifyState.value = r
  verifying.value = false
}

function done() {
  router.push({ name: 'timeline' })
}

async function clearAll() {
  if (!confirm('确定清除所有配置？此操作不影响已发布的微博。')) return
  await settings.clear()
  form.value = { pat: '', owner: 'wang-fu', repo: 'blog', branch: 'master' }
  verifyState.value = null
}
</script>

<template>
  <header class="app-header">
    <button class="icon-btn" @click="router.back()" title="返回" data-test="btn-setup-back">
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
    <h1>设置</h1>
    <div style="width: 36px"></div>
  </header>

  <main class="setup">
    <div class="field">
      <label>GitHub PAT (个人访问令牌)</label>
      <input
        type="password"
        v-model="form.pat"
        placeholder="github_pat_xxx 或 ghp_xxx"
        autocomplete="new-password"
        data-test="input-pat"
      />
      <div class="help">
        <a
          href="https://github.com/settings/tokens?type=beta"
          target="_blank"
          rel="noopener"
          >这里生成</a
        >
        — fine-grained PAT，权限：仓库 contents: Read and write
      </div>
    </div>

    <div class="field">
      <label>仓库 owner</label>
      <input v-model="form.owner" placeholder="wang-fu" data-test="input-owner" />
    </div>

    <div class="field">
      <label>仓库 repo</label>
      <input v-model="form.repo" placeholder="blog" data-test="input-repo" />
    </div>

    <div class="field">
      <label>分支</label>
      <input v-model="form.branch" placeholder="master" data-test="input-branch" />
    </div>

    <div v-if="verifyState" :class="['verify-result', verifyState.ok ? 'ok' : 'fail']">
      <template v-if="verifyState.ok">
        ✓ 已认证为 <strong>{{ verifyState.login }}</strong>，仓库可写
      </template>
      <template v-else>✗ {{ verifyState.error }}</template>
    </div>

    <div style="display: flex; gap: 12px; margin-top: 16px">
      <button class="btn-primary" @click="saveAndVerify" :disabled="verifying" data-test="btn-verify">
        {{ verifying ? '验证中…' : '保存并验证' }}
      </button>
      <button
        v-if="verifyState?.ok"
        class="btn-secondary"
        @click="done"
        data-test="btn-done"
      >
        完成
      </button>
      <button v-if="settings.settings" class="btn-secondary" @click="clearAll" data-test="btn-clear">
        清除
      </button>
    </div>

    <p class="help" style="margin-top: 24px">
      所有配置存在浏览器本地（IndexedDB），不会上传任何服务器。
    </p>
  </main>
</template>

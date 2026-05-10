<script setup>
import { computed } from 'vue'
import { getPlatform } from '../lib/platforms.js'

const props = defineProps({
  status: { type: Object, default: () => ({}) },
  targets: { type: Array, default: () => [] },
  config: { type: Object, required: true },
  isLocal: { type: Boolean, default: false },
  localState: { type: String, default: '' },
})

const items = computed(() => {
  return props.targets.map((id) => {
    const p = getPlatform(props.config, id) || { id, name: id, icon: id[0]?.toUpperCase() || '?' }
    const st = props.status?.[id] || {}
    let cls = 'is-pending'
    let label = `⏳ ${p.icon}`
    let url = null
    let title = ''
    if (st.state === 'posted') {
      cls = 'is-posted'
      label = `✓ ${p.icon}`
      url = st.url
      title = `已同步 · ${st.at || ''}`
    } else if (st.state === 'failed') {
      cls = 'is-failed'
      label = `⚠ ${p.icon}`
      title = st.error || '发布失败'
    } else {
      title = props.isLocal ? '等待上线' : '同步中'
    }
    if (props.isLocal && props.localState && st.state !== 'posted') {
      cls += ' is-local'
      const localText =
        props.localState === 'pending_upload'
          ? '上传中'
          : props.localState === 'uploaded_pending_appear'
          ? '等待上线'
          : props.localState === 'failed'
          ? '上传失败'
          : ''
      if (localText) title = localText
    }
    return { id, label, cls, url, title }
  })
})
</script>

<template>
  <span class="post-badges">
    <a
      v-for="it in items"
      :key="it.id"
      :class="['badge', it.cls]"
      :href="it.url || undefined"
      :target="it.url ? '_blank' : undefined"
      :rel="it.url ? 'noopener' : undefined"
      :title="it.title"
      @click.stop="() => {}"
    >
      <span class="badge-icon">{{ it.label }}</span>
    </a>
  </span>
</template>

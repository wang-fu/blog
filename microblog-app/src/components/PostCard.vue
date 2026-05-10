<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { relativeTime } from '../lib/relativeTime.js'
import PlatformBadges from './PlatformBadges.vue'

const props = defineProps({
  post: { type: Object, required: true },
  config: { type: Object, required: true },
})

const time = computed(() => relativeTime(props.post.created))

const isLocal = computed(() => props.post.source === 'local')
</script>

<template>
  <RouterLink
    :to="{ name: 'detail', params: { id: post.id } }"
    class="post-card"
    :data-test-id="`post-${post.id}`"
  >
    <div class="post-content" data-test="post-content">{{ post.content }}</div>
    <div class="post-meta">
      <span class="post-time" :title="post.created">{{ time }}</span>
      <PlatformBadges
        :status="post.status"
        :targets="post.targets"
        :config="config"
        :is-local="isLocal"
        :local-state="post.localState"
      />
    </div>
  </RouterLink>
</template>

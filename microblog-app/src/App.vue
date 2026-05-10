<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from './stores/settings.js'

const settings = useSettingsStore()

onMounted(async () => {
  await settings.load()
})
</script>

<template>
  <div class="app-shell">
    <RouterView />
  </div>
</template>

<template>
  <div class="settings-container">
    <div class="settings-header">
      <h2 class="settings-title">博客设置</h2>
      <p class="settings-description">配置您的博客同步和个性化选项</p>
    </div>
    
    <div class="settings-content">

      <SyncWechat/>
      <GithubTokenSetting />
      <!-- 未来可添加更多设置选项 -->
    </div>
  </div>
</template>

<script>
import GithubTokenSetting from './GithubTokenSetting.vue'

import SyncWechat from '@theme/components/SyncWechat.vue'
export default {
  components: {
    GithubTokenSetting,
    SyncWechat
  }
}
</script>

<style lang="stylus" scoped>
.settings-container
  max-width 800px
  margin 0 auto
  padding 2rem 1rem
  margin-top 40px
  
.settings-header
  margin-bottom 2rem
  border-bottom 1px solid #eaecef
  padding-bottom 1rem
  
.settings-title
  font-size 2rem
  margin-top 0
  margin-bottom 0.5rem
  
.settings-description
  color #666
  margin-top 0
</style> 
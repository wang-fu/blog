<template>
  <div class="github-token-setting">
    <h3>GitHub访问令牌设置</h3>
    <p class="description">
      需要提供GitHub个人访问令牌用于文章同步功能。此令牌仅保存在您的浏览器中，不会被上传至服务器。
    </p>
    
    <div class="token-input-container">
      <input 
        :type="showToken ? 'text' : 'password'"
        v-model="token"
        placeholder="请输入GitHub个人访问令牌"
        class="token-input"
      />
      <button @click="toggleTokenVisibility" class="toggle-visibility">
        {{ showToken ? '隐藏' : '显示' }}
      </button>
    </div>
    
    <div class="actions">
      <button @click="saveToken" class="save-button" :disabled="!token">保存</button>
      <button @click="clearToken" class="clear-button">清除</button>
    </div>
    
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
    
    <div class="token-help">
      <h4>如何获取GitHub个人访问令牌：</h4>
      <ol>
        <li>访问 <a href="https://github.com/settings/tokens" target="_blank">GitHub个人访问令牌设置</a></li>
        <li>点击 "Generate new token" (Classic)</li>
        <li>填写说明，如 "Blog Wechat Sync"</li>
        <li>设置令牌有效期（推荐选择90天或更长）</li>
        <li>选择权限范围：<strong>必选 workflow, repo, admin:repo_hook</strong></li>
        <li><strong>重要：确保令牌有权访问仓库</strong></li>
        <li>生成并复制令牌到上方输入框</li>
      </ol>
      <p class="warning">注意：令牌只会显示一次，请妥善保存。如果丢失，需要重新生成。</p>
    </div>
    
    <div class="test-token" v-if="token">
      <h4>测试Token有效性</h4>
      <button @click="testToken" class="test-button" :disabled="testing">
        {{ testing ? '检测中...' : '检测Token权限' }}
      </button>
      <div v-if="testResult" :class="['test-result', testResultClass]">
        {{ testResult }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      token: '',
      showToken: false,
      message: '',
      messageType: 'info',
      tokenKey: 'github_token',
      testing: false,
      testResult: '',
      testResultClass: 'info'
    }
  },
  
  mounted() {
    // 初始化时尝试从localStorage加载token
    const savedToken = localStorage.getItem(this.tokenKey);
    if (savedToken) {
      this.token = savedToken;
      this.message = '已从浏览器加载令牌';
      this.messageType = 'info';
    }
  },
  
  methods: {
    toggleTokenVisibility() {
      this.showToken = !this.showToken;
    },
    
    saveToken() {
      if (!this.token) return;
      
      try {
        localStorage.setItem(this.tokenKey, this.token);
        this.message = '访问令牌已保存到浏览器';
        this.messageType = 'success';
      } catch (error) {
        console.error('保存令牌失败:', error);
        this.message = '保存令牌失败，请检查浏览器设置';
        this.messageType = 'error';
      }
    },
    
    clearToken() {
      localStorage.removeItem(this.tokenKey);
      this.token = '';
      this.message = '访问令牌已清除';
      this.messageType = 'info';
    },
    
    async testToken() {
      if (!this.token) return;
      
      this.testing = true;
      this.testResult = '正在检测Token有效性...';
      this.testResultClass = 'info';
      
      try {
        // 检查用户信息
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Token无效或已过期');
        }
        
        const userData = await userResponse.json();
        
        // 检查仓库权限
        const repoOwner = 'wang-fu'; // 修改为正确的GitHub用户名
        const repoName = 'blog'; // 修改为正确的仓库名
        
        const repoResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!repoResponse.ok) {
          throw new Error(`无法访问仓库 ${repoOwner}/${repoName}`);
        }
        
        // 检查工作流权限
        const workflowsResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows`, {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!workflowsResponse.ok) {
          throw new Error('Token没有工作流权限，请确保勾选了workflow权限');
        }
        
        this.testResult = `✅ Token有效！用户: ${userData.login}，具有仓库和工作流权限`;
        this.testResultClass = 'success';
      } catch (error) {
        console.error('Token检测失败:', error);
        this.testResult = `❌ ${error.message}`;
        this.testResultClass = 'error';
      } finally {
        this.testing = false;
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.github-token-setting
  background #f9f9f9
  border-radius 8px
  padding 1.5rem
  margin 2rem 0
  
  h3
    margin-top 0
    margin-bottom 1rem
    border-bottom 1px solid #eee
    padding-bottom 0.5rem
    
  .description
    color #666
    margin-bottom 1.5rem
    
  .token-input-container
    display flex
    margin-bottom 1rem
    
  .token-input
    flex 1
    padding 0.8rem
    font-size 1rem
    border 1px solid #ddd
    border-radius 4px 0 0 4px
    font-family monospace
    
  .toggle-visibility
    background #e0e0e0
    border none
    padding 0 1rem
    border-radius 0 4px 4px 0
    cursor pointer
    
    &:hover
      background #d0d0d0
      
  .actions
    display flex
    gap 1rem
    margin-bottom 1rem
    
  .save-button, .clear-button
    flex 1
    padding 0.7rem 0
    border none
    border-radius 4px
    cursor pointer
    font-weight 500
    
  .save-button
    background-color #3eaf7c
    color white
    
    &:disabled
      background-color #a0d9c1
      cursor not-allowed
      
  .clear-button
    background-color #f3f3f3
    color #666
    
    &:hover
      background-color #e5e5e5
      
  .message
    margin 1rem 0
    padding 0.6rem
    border-radius 4px
    font-size 0.9rem
    
    &.info
      background-color #e8f4fd
      color #0969da
      
    &.success
      background-color #ddf5e6
      color #2da44e
      
    &.error
      background-color #ffebe9
      color #d1242f
      
  .token-help
    margin-top 1.5rem
    background #fff
    border 1px solid #eee
    border-radius 6px
    padding 1rem
    
    h4
      margin-top 0
      margin-bottom 0.8rem
      
    ol
      padding-left 1.2rem
      
    li
      margin-bottom 0.5rem
      
    .warning
      color #d1242f
      font-weight 500
      margin-top 1rem
      
    a
      color #3eaf7c
      text-decoration none
      
      &:hover
        text-decoration underline

.test-token
  margin-top 1.5rem
  
.test-button
  background-color #3eaf7c
  color white
  border none
  padding 0.6rem 1.2rem
  border-radius 4px
  cursor pointer
  font-size 1rem
  display inline-block
  transition all 0.3s ease
  
  &:hover:not(:disabled)
    background-color #2c8a63
    
  &:disabled
    background-color #a0d9c1
    cursor not-allowed
    
.test-result
  margin-top 0.8rem
  padding 0.6rem
  border-radius 4px
  font-size 0.9rem
  
  &.info
    background-color #e8f4fd
    color #0969da
    
  &.success
    background-color #ddf5e6
    color #2da44e
    
  &.error
    background-color #ffebe9
    color #d1242f
</style> 
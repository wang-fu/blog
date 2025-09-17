<template>
  <div class="sync-wechat-container">
    <div v-if="!showForm" class="sync-button-wrapper">
      <button @click="showForm = true" class="sync-button">
        <span class="sync-icon">↻</span> 同步文章
      </button>
    </div>
    <div v-else class="sync-form">
      <input 
        v-model="articleUrl" 
        type="text" 
        placeholder="请输入文章URL（支持微信公众号和知乎专栏）" 
        class="url-input"
        @keyup.enter="syncArticle"
      />
      <div class="button-group">
        <button @click="syncArticle" class="action-button sync" :disabled="isSyncing || !isValidUrl">
          {{ isSyncing ? '同步中...' : '开始同步' }}
        </button>
        <button @click="cancelSync" class="action-button cancel">
          取消
        </button>
      </div>
      <div v-if="message" :class="['sync-message', messageType]">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showForm: false,
      articleUrl: '',
      isSyncing: false,
      message: '',
      messageType: 'info'
    }
  },
  
  
  computed: {
    isValidUrl() {
      const url = this.articleUrl.trim();
      // 支持微信公众号和知乎专栏链接
      return url.startsWith('https://mp.weixin.qq.com/') ||
             url.startsWith('http://mp.weixin.qq.com/') ||
             url.includes('zhihu.com/p/') ||
             url.includes('zhuanlan.zhihu.com/');
    }
  },
  
  methods: {
    async syncArticle() {
      if (!this.isValidUrl || this.isSyncing) return;
      
      this.isSyncing = true;
      this.message = '正在同步文章，请稍候...';
      this.messageType = 'info';
      
      try {
        // 获取GitHub个人访问令牌（需要用户事先设置在localStorage中）
        const token = localStorage.getItem('github_token');
        if (!token) {
          this.message = '请先在"设置"中配置GitHub访问令牌';
          this.messageType = 'error';
          this.isSyncing = false;
          return;
        }
        
        // 首先检查仓库信息和工作流是否存在
        this.message = '正在检查仓库配置...';
        
        // 修改为正确的GitHub用户名和仓库名
        const repoOwner = 'wang-fu'; // 修改为正确的GitHub用户名
        const repoName = 'blog'; // 修改为正确的仓库名
        
        // 先检查默认分支
        const repoResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!repoResponse.ok) {
          throw new Error('无法访问仓库，请检查GitHub Token和仓库名称');
        }
        
        const repoData = await repoResponse.json();
        const defaultBranch = repoData.default_branch; // 获取默认分支名
        
        this.message = `检查工作流文件...分支: ${defaultBranch}`;
        
        // 检查工作流文件是否存在
        const workflowResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/.github/workflows/sync-wechat.yml?ref=${defaultBranch}`, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!workflowResponse.ok) {
          this.message = '工作流文件不存在，请先将其提交到仓库';
          this.messageType = 'error';
          this.isSyncing = false;
          return;
        }
        
        // 调用GitHub API触发workflow
        this.message = '正在触发同步工作流...';
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/sync-wechat.yml/dispatches`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ref: defaultBranch, // 使用检测到的默认分支
            inputs: {
              article_url: this.articleUrl.trim()
            }
          })
        });
        
        if (response.ok) {
          this.message = '同步任务已提交，文章将在几分钟内同步到博客';
          this.messageType = 'success';
          setTimeout(() => {
            this.showForm = false;
            this.articleUrl = '';
            this.message = '';
          }, 3000);
        } else {
          let errorMessage = '触发同步工作流失败';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // 如果无法解析JSON，使用HTTP状态文本
            errorMessage = `${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('同步失败:', error);
        this.message = `同步失败: ${error.message}`;
        this.messageType = 'error';
      } finally {
        this.isSyncing = false;
      }
    },
    
    cancelSync() {
      this.showForm = false;
      this.articleUrl = '';
      this.message = '';
    }
  }
}
</script>

<style lang="stylus" scoped>
.sync-wechat-container
  margin 2rem 0
  
.sync-button-wrapper
  text-align center

.sync-button
  background-color #3eaf7c
  color white
  border none
  padding 0.6rem 1.2rem
  border-radius 4px
  cursor pointer
  font-size 1rem
  display inline-flex
  align-items center
  transition all 0.3s ease
  
  &:hover
    background-color #2c8a63
    transform translateY(-2px)
    box-shadow 0 2px 8px rgba(0,0,0,0.1)
  
.sync-icon
  margin-right 0.5rem
  font-weight bold

.sync-form
  background #f8f8f8
  border-radius 8px
  padding 1.5rem
  box-shadow 0 2px 12px rgba(0,0,0,0.1)
  
.url-input
  width 100%
  padding 0.8rem
  font-size 1rem
  border 1px solid #ddd
  border-radius 4px
  margin-bottom 1rem
  
.button-group
  display flex
  gap 1rem
  
.action-button
  flex 1
  padding 0.7rem 0
  border none
  border-radius 4px
  cursor pointer
  font-weight 500
  
  &.sync
    background-color #3eaf7c
    color white
    
    &:disabled
      background-color #a0d9c1
      cursor not-allowed
      
  &.cancel
    background-color #f3f3f3
    color #666
    
    &:hover
      background-color #e5e5e5
      
.sync-message
  margin-top 1rem
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
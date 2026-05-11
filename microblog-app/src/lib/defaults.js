/**
 * defaults.js — 当前部署的默认仓库（公开只读模式 fallback）
 *
 * 这个 SPA 部署在 imwangfu.com/microblog/ 下，对应仓库 wang-fu/blog。
 * 未登录访客直接用这套默认值匿名读 timeline。
 *
 * 如果 fork 给别人部署：改这三个值即可，写 PAT 走 user 自己的 settings。
 */

export const DEFAULT_OWNER = 'wang-fu'
export const DEFAULT_REPO = 'blog'
export const DEFAULT_BRANCH = 'master'

/** 没配置 PAT 时也能拿到一个能用的 settings 对象（pat 为空） */
export function getReadOnlySettings() {
  return {
    pat: '',
    owner: DEFAULT_OWNER,
    repo: DEFAULT_REPO,
    branch: DEFAULT_BRANCH,
  }
}

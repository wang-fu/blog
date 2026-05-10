/**
 * frontmatter.js
 *
 * Parse / serialize YAML frontmatter for microblog md files.
 *
 * Schema (单一 source of truth):
 *
 *   ---
 *   id: 2026-05-10-1430-a3f
 *   created: 2026-05-10T14:30:00.000Z
 *   content: |
 *     正文（多行）
 *   targets: [x, zhihu]
 *   status:
 *     x:     { state: pending }
 *     zhihu: { state: pending }
 *   ---
 *
 * 发布完成后 status 字段会被数字人写回：
 *   status:
 *     x: { state: posted, url: "https://x.com/...", at: "2026-05-10T14:32Z" }
 */

import yaml from 'js-yaml'

const FENCE = '---'
const FENCE_RE = /^---\s*$/m

/** 把 md 文本拆成 { data, body } */
export function parse(raw) {
  if (typeof raw !== 'string') {
    throw new TypeError('parse(): raw must be string')
  }
  const trimmed = raw.replace(/^\uFEFF/, '') // strip BOM

  // 必须以 --- 开头才视为有 frontmatter
  if (!trimmed.startsWith(FENCE)) {
    return { data: {}, body: trimmed }
  }

  const lines = trimmed.split('\n')
  // 第一行是 ---，找下一个 ---
  let endIdx = -1
  for (let i = 1; i < lines.length; i++) {
    if (FENCE_RE.test(lines[i])) {
      endIdx = i
      break
    }
  }
  if (endIdx === -1) {
    // 没找到结尾 fence — 整个当 body
    return { data: {}, body: trimmed }
  }

  const fmText = lines.slice(1, endIdx).join('\n')
  const body = lines.slice(endIdx + 1).join('\n')

  let data = {}
  try {
    data = yaml.load(fmText) || {}
  } catch (e) {
    throw new Error(`frontmatter parse error: ${e.message}`)
  }

  return { data, body }
}

/** 把 { data, body } 序列化回 md 文本 */
export function stringify({ data, body }) {
  const fm = yaml.dump(data || {}, {
    lineWidth: 200,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
  })
  // body 末尾确保单个换行
  const cleanBody = (body || '').replace(/\s+$/, '') + '\n'
  return `${FENCE}\n${fm}${FENCE}\n${cleanBody}`
}

/** 给一条新短文构造完整 md */
export function buildPostMd({ id, created, content, targets }) {
  const status = {}
  for (const t of targets) {
    status[t] = { state: 'pending' }
  }
  const data = {
    id,
    created,
    content,
    targets: [...targets],
    status,
  }
  return stringify({ data, body: '' })
}

/** 生成短文 id：YYYY-MM-DD-HHmm-xxx */
export function genId(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  const rand = Math.random().toString(36).slice(2, 5)
  return `${y}-${m}-${d}-${hh}${mm}-${rand}`
}

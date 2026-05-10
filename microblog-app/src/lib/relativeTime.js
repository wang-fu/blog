/**
 * relativeTime.js — 中文相对时间显示（推特风格）
 */

import { formatDistanceToNow, format, differenceInDays, differenceInHours } from 'date-fns'
import { zhCN } from 'date-fns/locale/zh-CN'

export function relativeTime(input) {
  if (!input) return ''
  const date = input instanceof Date ? input : new Date(input)
  if (isNaN(date.getTime())) return ''

  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 5) return '刚刚'
  if (diffSec < 60) return `${diffSec} 秒前`
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} 分钟前`

  const diffH = differenceInHours(now, date)
  if (diffH < 24) return `${diffH} 小时前`

  const diffD = differenceInDays(now, date)
  if (diffD < 7) return `${diffD} 天前`

  if (date.getFullYear() === new Date().getFullYear()) {
    return format(date, 'MM-dd HH:mm', { locale: zhCN })
  }
  return format(date, 'yyyy-MM-dd', { locale: zhCN })
}

export function fullDateTime(input) {
  if (!input) return ''
  const date = input instanceof Date ? input : new Date(input)
  if (isNaN(date.getTime())) return ''
  return format(date, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
}

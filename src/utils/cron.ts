/**
 * CRON 表达式校验与中文描述
 *
 * 功能说明：
 * - 仅支持 6 段（含秒）表达式：秒 分 时 日 月 周
 * - 支持 *, /, -, , 以及数字字面量
 * - 不支持 L / W / # / ? 等 Quartz 高级字符（前端不接 Quartz 语法）
 * - 用于定时任务页面前端拦截非法表达式
 *
 * 字段顺序：
 *  6 段：秒(0-59) 分(0-59) 时(0-23) 日(1-31) 月(1-12) 周(0-6)
 */

/** 单字段取值范围 */
const FIELD_RANGES: Record<string, [number, number]> = {
  second: [0, 59],
  minute: [0, 59],
  hour: [0, 23],
  day: [1, 31],
  month: [1, 12],
  week: [0, 6],
}

/** 6 段式字段顺序 */
const FIELDS_6 = ['second', 'minute', 'hour', 'day', 'month', 'week'] as const

/**
 * 校验单段表达式是否合法
 * @param segment 段字符串，支持 *, 数字, n-m 范围, n/m 步进, 枚举
 * @param range 字段取值范围 [min, max]
 * @returns 合法返回 true
 */
function isValidSegment(segment: string, range: [number, number]): boolean {
  const [min, max] = range
  const trimmed = segment.trim()
  if (!trimmed) return false

  // * 单独出现合法
  // */n 步进
  // n
  // n-m 或 n-m/k
  // n,m,... 枚举
  const parts = trimmed.split(',')
  for (const part of parts) {
    if (part === '*') continue

    if (part.startsWith('*/')) {
      const step = Number(part.slice(2))
      if (!Number.isInteger(step) || step <= 0) return false
      continue
    }

    if (part.includes('/')) {
      const [base, stepStr] = part.split('/')
      const step = Number(stepStr)
      if (!Number.isInteger(step) || step <= 0) return false
      if (!isValidSegment(base ?? '', range)) return false
      continue
    }

    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-')
      const start = Number(startStr)
      const end = Number(endStr)
      if (!Number.isInteger(start) || !Number.isInteger(end)) return false
      if (start < min || start > max || end < min || end > max) return false
      if (start > end) return false
      continue
    }

    const num = Number(part)
    if (!Number.isInteger(num)) return false
    if (num < min || num > max) return false
  }
  return true
}

/**
 * 校验 CRON 表达式
 * @param expr CRON 字符串
 * @returns 合法返回 true，不合法返回 false
 */
export function isValidCron(expr: string): boolean {
  if (!expr || typeof expr !== 'string') return false
  const trimmed = expr.trim()
  if (!trimmed) return false

  const parts = trimmed.split(/\s+/)
  // 仅接受 6 段（秒 分 时 日 月 周）格式
  if (parts.length !== 6) {
    return false
  }
  const fields = FIELDS_6

  for (let i = 0; i < fields.length; i++) {
    const fieldKey = fields[i] as keyof typeof FIELD_RANGES
    const range = FIELD_RANGES[fieldKey] as [number, number]
    if (!isValidSegment(parts[i] ?? '', range)) return false
  }
  return true
}

/**
 * 段名映射
 */
const FIELD_LABEL: Record<string, string> = {
  second: '秒',
  minute: '分',
  hour: '时',
  day: '日',
  month: '月',
  week: '周',
}

/**
 * 周数字 → 中文
 */
const WEEK_LABEL = ['日', '一', '二', '三', '四', '五', '六']

/**
 * 简化字段为人类可读短串
 * @param segment 单段
 * @param fieldKey 字段名
 * @param range 字段范围
 */
function describeSegment(segment: string, fieldKey: string, range: [number, number]): string {
  const trimmed = segment.trim()
  if (trimmed === '*') return '每' + FIELD_LABEL[fieldKey]
  if (trimmed.startsWith('*/')) {
    const step = trimmed.slice(2)
    return `每${step}${FIELD_LABEL[fieldKey]}`
  }
  if (trimmed.includes('/')) {
    const [base, step] = trimmed.split('/')
    if (base === '*') return `每${step ?? ''}${FIELD_LABEL[fieldKey]}`
    return `${describeSegment(base ?? '', fieldKey, range)}起每${step ?? ''}${FIELD_LABEL[fieldKey]}`
  }
  if (trimmed.includes(',')) {
    const items = trimmed.split(',').map((p) => describeSegment(p, fieldKey, range))
    return items.join('、')
  }
  if (trimmed.includes('-')) {
    const [s, e] = trimmed.split('-')
    if (fieldKey === 'week') {
      return `周${WEEK_LABEL[Number(s)]}至周${WEEK_LABEL[Number(e)]}`
    }
    return `${s}-${e}`
  }
  if (fieldKey === 'week') {
    return `周${WEEK_LABEL[Number(trimmed)]}`
  }
  return trimmed
}

/**
 * 生成 CRON 表达式的中文描述（供表单输入框 hint 使用）
 * @param expr CRON 字符串
 * @returns 中文描述；非法时返回空串
 */
export function describeCron(expr: string): string {
  if (!isValidCron(expr)) return ''
  const parts = expr.trim().split(/\s+/)
  const fields = FIELDS_6

  const segments: string[] = []
  for (let i = 0; i < fields.length; i++) {
    const key = fields[i] as keyof typeof FIELD_RANGES
    const range = FIELD_RANGES[key] as [number, number]
    segments.push(describeSegment(parts[i] ?? '', key, range))
  }

  // 简版拼接：展示前 3 段（秒 分 时）+ 后 3 段（日 月 周）
  return segments.slice(0, 3).join(' ') + ' - ' + segments.slice(3).join(' ')
}

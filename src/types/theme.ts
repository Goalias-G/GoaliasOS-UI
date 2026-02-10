/**
 * 主题相关类型定义
 *

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark'

/**
 * 颜色配置
 */
export interface ThemeConfig {
  primary: string

  primaryLight: string

  primaryDark: string
  /** 基础背景 */
  bgBase: string
  /** 提升背景（卡片） */
  bgElevated: string
  /** 粉色 */
  accentPink: string
  /** 青色 */
  accentCyan: string
  /** 黄色 */
  accentYellow: string
  /** 成功色 */
  success: string
  /** 警告色 */
  warning: string
  /** 错误色 */
  error: string
  /** 信息色 */
  info: string
  /** 主文本 */
  textPrimary: string
  /** 次要文本 */
  textSecondary: string
  /** 弱化文本 */
  textMuted: string
  /** 反色文本 */
  textInverse: string
}

/**
 * 主题相关类型定义
 *
 * 功能说明：
 * - 定义 Claymorphism 设计系统的主题配置类型
 * - 包含颜色、阴影、圆角、动画等设计令牌
 */

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark'

/**
 * 颜色配置
 */
export interface ColorConfig {
    /** 主紫色 */
    primary: string
    /** 浅紫色 */
    primaryLight: string
    /** 深紫色 */
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

/**
 * 阴影配置
 */
export interface ShadowConfig {
    /** 卡片阴影 */
    card: string
    /** 按钮阴影 */
    button: string
    /** 按压状态阴影 */
    pressed: string
    /** 悬停状态阴影 */
    hover: string
}

/**
 * 圆角配置
 */
export interface RadiusConfig {
    /** 小圆角 */
    sm: string
    /** 中圆角 */
    md: string
    /** 大圆角 */
    lg: string
    /** 超大圆角 */
    xl: string
    /** 完全圆形 */
    full: string
}

/**
 * 动画配置
 */
export interface AnimationConfig {
    /** 快速动画时长 */
    durationFast: string
    /** 正常动画时长 */
    durationNormal: string
    /** 慢速动画时长 */
    durationSlow: string
    /** 缓出函数 */
    easeOut: string
    /** 缓入缓出函数 */
    easeInOut: string
    /** 弹跳函数 */
    easeBounce: string
}

/**
 * 完整主题配置
 */
export interface ThemeConfig {
    /** 颜色配置 */
    colors: ColorConfig
    /** 阴影配置 */
    shadows: ShadowConfig
    /** 圆角配置 */
    radius: RadiusConfig
    /** 动画配置 */
    animation: AnimationConfig
}

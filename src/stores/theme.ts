/**
 * 主题状态管理模块
 *
 * 功能说明：
 * - 管理应用主题（light/dark）
 * - 提供主题切换功能
 * - 主题状态持久化到 localStorage
 */

import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'clay-theme'

export const useThemeStore = defineStore('theme', () => {
  // ==================== 状态 ====================

  /** 当前主题 */
  const theme = ref<Theme>((localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'light')

  // ==================== 方法 ====================

  /**
   * 应用主题到 document
   */
  function applyTheme(newTheme: Theme) {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
  }

  /**
   * 切换主题（light <-> dark）
   */
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  /**
   * 设置指定主题
   */
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
  }

  function getThemeColor() {
    const primaryColor = theme.value === 'light' ? '--clay-primary-light' : '--clay-primary-dark'
    return useCssVar(primaryColor).value
  }

  // 监听主题变化，持久化到 localStorage 并应用到 DOM
  watch(
    theme,
    (newTheme) => {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      applyTheme(newTheme)
    },
    { immediate: true },
  )

  return {
    // 状态
    theme,
    // 方法
    toggleTheme,
    setTheme,
    getThemeColor,
  }
})

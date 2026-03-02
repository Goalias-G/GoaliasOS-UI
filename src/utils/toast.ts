/**
 * Toast 提示工具
 *
 * 功能说明:
 * - 提供全局 Toast 提示方法
 * - 支持 success、error、warning、info 类型
 * - 自动管理 Toast 生命周期
 */

import { reactive } from 'vue'
import type { ToastItem, ToastType, ToastOptions } from '@/types'

// ==================== Toast 状态管理 ====================

/** Toast 列表 */
export const toasts = reactive<ToastItem[]>([])

/** Toast ID 计数器 */
let toastIdCounter = 0

// ==================== Toast 方法 ====================

/**
 * 显示 Toast 提示
 * @param message 提示消息
 * @param options Toast 选项
 * @returns Toast ID
 */
export function showToast(message: string, options: ToastOptions = {}): string {
  const { type = 'info', duration = 3000 } = options

  // 生成唯一 ID
  const id = `toast-${++toastIdCounter}-${Date.now()}`

  // 创建 Toast 项
  const toast: ToastItem = {
    id,
    type,
    message,
    duration,
  }

  // 添加到列表
  toasts.push(toast)

  // 自动移除
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

/**
 * 移除 Toast
 * @param id Toast ID
 */
export function removeToast(id: string) {
  const index = toasts.findIndex((t) => t.id === id)
  if (index !== -1) {
    toasts.splice(index, 1)
  }
}

/**
 * 清除所有 Toast
 */
export function clearToasts() {
  toasts.splice(0, toasts.length)
}

// ==================== 快捷方法 ====================

/**
 * 显示成功提示
 * @param message 提示消息
 * @param duration 持续时长（毫秒）
 */
export function showSuccess(message: string, duration?: number) {
  return showToast(message, { type: 'success', duration })
}

/**
 * 显示错误提示
 * @param message 提示消息
 * @param duration 持续时长（毫秒）
 */
export function showError(message: string, duration?: number) {
  return showToast(message, { type: 'error', duration })
}

/**
 * 显示警告提示
 * @param message 提示消息
 * @param duration 持续时长（毫秒）
 */
export function showWarning(message: string, duration?: number) {
  return showToast(message, { type: 'warning', duration })
}

/**
 * 显示信息提示
 * @param message 提示消息
 * @param duration 持续时长（毫秒）
 */
export function showInfo(message: string, duration?: number) {
  return showToast(message, { type: 'info', duration })
}

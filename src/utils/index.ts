/**
 * 工具函数统一导出
 *
 * 使用方式：
 * import { formatDate, isPhone, setStorage } from '@/utils'
 */

export * from './storage'
export * from './format'
export * from './validate'

/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
    fn: T,
    delay: number = 300,
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout> | null = null
    return function (this: unknown, ...args: Parameters<T>) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => fn.apply(this, args), delay)
    }
}

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param interval 间隔时间（毫秒）
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
    fn: T,
    interval: number = 300,
): (...args: Parameters<T>) => void {
    let lastTime = 0
    return function (this: unknown, ...args: Parameters<T>) {
        const now = Date.now()
        if (now - lastTime >= interval) {
            lastTime = now
            fn.apply(this, args)
        }
    }
}

/**
 * 深拷贝
 * @param obj 要拷贝的对象
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime()) as T
    if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as T
    if (obj instanceof Object) {
        const copy = {} as T
        Object.keys(obj).forEach((key) => {
            ; (copy as Record<string, unknown>)[key] = deepClone((obj as Record<string, unknown>)[key])
        })
        return copy
    }
    return obj
}

/**
 * 生成唯一 ID
 * @param prefix 前缀
 */
export function generateId(prefix: string = ''): string {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 休眠函数
 * @param ms 毫秒数
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        // 降级方案
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textarea)
        return success
    }
}

/**
 * 本地存储封装
 *
 * 功能说明：
 * - 封装 localStorage 和 sessionStorage
 * - 支持数据序列化/反序列化
 * - 支持过期时间设置
 * - 统一的 Key 前缀管理

 */

const STORAGE_PREFIX = 'app_'

interface StorageData<T> {
    value: T
    expire?: number // 过期时间戳
}

/**
 * 设置本地存储
 * @param key 存储键名
 * @param value 存储值
 * @param expire 过期时间（秒），不传则永不过期
 */
export function setStorage<T>(key: string, value: T, expire?: number): void {
    const data: StorageData<T> = {
        value,
        expire: expire ? Date.now() + expire * 1000 : undefined,
    }
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data))
}

/**
 * 获取本地存储
 * @param key 存储键名
 * @param defaultValue 默认值
 */
export function getStorage<T>(key: string, defaultValue?: T): T | undefined {
    const item = localStorage.getItem(STORAGE_PREFIX + key)
    if (!item) return defaultValue

    try {
        const data: StorageData<T> = JSON.parse(item)
        // 检查是否过期
        if (data.expire && Date.now() > data.expire) {
            removeStorage(key)
            return defaultValue
        }
        return data.value
    } catch {
        return defaultValue
    }
}

/**
 * 移除本地存储
 * @param key 存储键名
 */
export function removeStorage(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key)
}

/**
 * 清空所有本地存储（仅清除带前缀的）
 */
export function clearStorage(): void {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
            localStorage.removeItem(key)
        }
    })
}

// Session Storage 版本
export const session = {
    set: <T>(key: string, value: T) => {
        sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    },
    get: <T>(key: string, defaultValue?: T): T | undefined => {
        const item = sessionStorage.getItem(STORAGE_PREFIX + key)
        if (!item) return defaultValue
        try {
            return JSON.parse(item)
        } catch {
            return defaultValue
        }
    },
    remove: (key: string) => {
        sessionStorage.removeItem(STORAGE_PREFIX + key)
    },
    clear: () => {
        sessionStorage.clear()
    },
}

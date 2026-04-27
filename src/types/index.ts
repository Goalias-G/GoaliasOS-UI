/**
 * 通用类型定义
 *
 * 功能说明：
 * - 定义项目中通用的 TypeScript 类型
 * - 统一导出所有类型
 */

export * from './theme'
export * from './components'
export * from './ai'
export * from './os-config'
export * from './router'
export * from './api/user'
export * from './api/api'
export * from './api/page'
export * from './api/chat'
export * from './api/chat-common'
export * from './api/knowledge'
export * from './api/life'
export * from './api/file'
export * from './api/home'
export * from './api/finance'

/** 通用的键值对类型 */
export type AnyObject = Record<string, any>

/** 可选的类型 */
export type Nullable<T> = T | null

/** 可能为 undefined 的类型 */
export type Optional<T> = T | undefined

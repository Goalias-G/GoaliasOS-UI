/**
 * 通用类型定义
 *
 * 功能说明：
 * - 定义项目中通用的 TypeScript 类型
 * - 统一导出所有类型
 */

export * from './user'
export * from './api'

/** 通用的键值对类型 */
export type AnyObject = Record<string, any>

/** 可选的类型 */
export type Nullable<T> = T | null

/** 可能为 undefined 的类型 */
export type Optional<T> = T | undefined

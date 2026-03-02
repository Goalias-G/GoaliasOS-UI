/**
 * API 相关类型定义
 */

/** API 统一响应格式 */
export interface ApiResponse<T = any> {
  code: number // 业务状态码，200 表示成功
  data: T // 响应数据
  message: string // 响应消息
}

/** 业务状态码常量 */
export const API_CODE = {
  SUCCESS: 200, // 成功
  UNAUTHORIZED: 401, // 未授权
  FORBIDDEN: 403, // 禁止访问
  NOT_FOUND: 404, // 资源不存在
  SERVER_ERROR: 500, // 服务器错误
} as const

/** API 错误 */
export interface ApiError {
  code: number
  message: string
  details?: any
}

/**
 * 分页查询参数
 */
export interface PageQuery {
  pageNum: number
  pageSize: number
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  list: T[]
  total: number
}

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

/** 分页请求参数 */
export interface PaginationParams {
  page: number // 当前页码
  pageSize: number // 每页条数
}

/** 分页响应数据 */
export interface PaginatedData<T> {
  list: T[] // 数据列表
  total: number // 总条数
  page: number // 当前页码
  pageSize: number // 每页条数
  totalPages: number // 总页数
}

/** API 错误 */
export interface ApiError {
  code: number
  message: string
  details?: any
}

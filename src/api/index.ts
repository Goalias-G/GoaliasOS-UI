/**
 * HTTP 请求客户端封装
 *
 * 功能说明：
 * - 创建 Axios 实例，配置 baseURL、超时时间
 * - 请求拦截器：自动添加 Token、请求日志
 * - 响应拦截器：统一错误处理、401 自动登出
 * - 封装常用请求方法：get、post、put、delete
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

// ==================== 类型定义 ====================

/** API 统一响应格式 */
export interface ApiResponse<T = any> {
    code: number // 业务状态码，0 表示成功
    data: T // 响应数据
    message: string // 响应消息
}

/** 分页响应格式 */
export interface PaginatedResponse<T> {
    list: T[] // 数据列表
    total: number // 总条数
    page: number // 当前页码
    pageSize: number // 每页条数
}

/** 扩展的请求配置 */
export interface RequestConfig extends AxiosRequestConfig {
    skipAuth?: boolean // 跳过认证（不添加 Token）
    skipErrorHandler?: boolean // 跳过统一错误处理
    showLoading?: boolean // 显示加载状态（TODO）
}

/** API 错误对象 */
export interface ApiError {
    code: number
    message: string
    details?: any
}

// ==================== 常量定义 ====================

/** 业务状态码 */
export const API_CODE = {
    SUCCESS: 0, // 成功
    UNAUTHORIZED: 401, // 未授权
    FORBIDDEN: 403, // 禁止访问
    NOT_FOUND: 404, // 资源不存在
    SERVER_ERROR: 500, // 服务器错误
} as const

/** 错误消息映射 */
const ERROR_MESSAGES: Record<number, string> = {
    400: '请求参数错误',
    401: '登录已过期，请重新登录',
    403: '没有权限访问该资源',
    404: '请求的资源不存在',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务暂时不可用',
    504: '网关超时',
}

// ==================== Axios 实例 ====================

const instance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})


// ==================== 请求拦截器 ====================

instance.interceptors.request.use(
    (config) => {
        // 获取 Token（从 localStorage）
        const token = localStorage.getItem('token')

        // 如果有 Token 且未跳过认证，添加到请求头
        if (token && !(config as RequestConfig).skipAuth) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // 开发环境打印请求日志
        if (import.meta.env.DEV) {
            console.log(
                `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
                config.data || config.params,
            )
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// ==================== 响应拦截器 ====================

instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        const { data } = response

        // 开发环境打印响应日志
        if (import.meta.env.DEV) {
            console.log(`[API Response] ${response.config.url}`, data)
        }

        // 业务状态码判断
        if (data.code === API_CODE.SUCCESS) {
            return data.data // 直接返回业务数据
        }

        // 业务错误
        const error: ApiError = {
            code: data.code,
            message: data.message || '请求失败',
        }
        return Promise.reject(error)
    },
    (error) => {
        // HTTP 错误处理
        const status = error.response?.status
        const apiError: ApiError = {
            code: status || -1,
            message: ERROR_MESSAGES[status] || error.message || '网络请求失败',
        }

        // 401 未授权：清除 Token，跳转登录页
        if (status === 401) {
            localStorage.removeItem('token')
            // TODO: 调用 Pinia Store 的 logout 方法
            window.location.href = '/login'
        }

        return Promise.reject(apiError)
    },
)


// ==================== 请求方法封装 ====================

/**
 * GET 请求
 * @param url 请求地址
 * @param params 查询参数
 * @param config 请求配置
 */
export function get<T = any>(
    url: string,
    params?: Record<string, any>,
    config?: RequestConfig,
): Promise<T> {
    return instance.get(url, { params, ...config })
}

/**
 * POST 请求
 * @param url 请求地址
 * @param data 请求体数据
 * @param config 请求配置
 */
export function post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return instance.post(url, data, config)
}

/**
 * PUT 请求
 * @param url 请求地址
 * @param data 请求体数据
 * @param config 请求配置
 */
export function put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return instance.put(url, data, config)
}

/**
 * DELETE 请求
 * @param url 请求地址
 * @param config 请求配置
 */
export function del<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return instance.delete(url, config)
}

/**
 * PATCH 请求
 * @param url 请求地址
 * @param data 请求体数据
 * @param config 请求配置
 */
export function patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return instance.patch(url, data, config)
}

/**
 * 文件上传
 * @param url 上传地址
 * @param file 文件对象
 * @param onProgress 上传进度回调（TODO）
 */
export function upload<T = any>(
    url: string,
    file: File,
    onProgress?: (percent: number) => void,
): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    return instance.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
            if (event.total && onProgress) {
                onProgress(Math.round((event.loaded * 100) / event.total))
            }
        },
    })
}

// 导出 Axios 实例（用于特殊场景）
export { instance as axios }

/**
 * 用户相关类型定义
 */

/** 用户信息 */
export interface User {
    id: string
    username: string
    email?: string
    avatar?: string
    phone?: string
    createdAt?: string
    updatedAt?: string
    // TODO: 添加更多用户字段
    // roles?: string[]
    // permissions?: string[]
}

/** 登录请求参数 */
export interface LoginRequest {
    username: string
    password: string
    remember?: boolean // 记住登录状态
    captcha?: string // 验证码（TODO）
}

/** 登录响应 */
export interface LoginResponse {
    token: string
    user: User
    expiresIn?: number // Token 过期时间（秒）
}

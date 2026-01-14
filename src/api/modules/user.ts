/**
 * 用户相关 API 模块
 *
 * 功能说明：
 * - 用户登录、登出接口
 * - 获取用户信息接口
 * - 用户相关的其他接口
 *
 * TODO 扩展：
 * - [ ] 注册接口
 * - [ ] 修改密码接口
 * - [ ] 更新用户信息接口
 * - [ ] 刷新 Token 接口
 */

import { post, get } from '@/api'
import type { User, LoginRequest, LoginResponse } from '@/types'

/**
 * 用户登录
 * @param data 登录参数
 *
 * TODO: 对接真实后端接口
 */
export function login(data: LoginRequest): Promise<LoginResponse> {
    // TODO: 替换为真实接口地址
    return post<LoginResponse>('/auth/login', data)
}

/**
 * 用户登出
 *
 * TODO: 对接真实后端接口
 */
export function logout(): Promise<void> {
    // TODO: 替换为真实接口地址
    return post<void>('/auth/logout')
}

/**
 * 获取当前用户信息
 *
 * TODO: 对接真实后端接口
 */
export function getUserInfo(): Promise<User> {
    // TODO: 替换为真实接口地址
    return get<User>('/user/info')
}

/**
 * 刷新 Token
 *
 * TODO: 对接真实后端接口
 */
export function refreshToken(): Promise<{ token: string }> {
    // TODO: 替换为真实接口地址
    return post<{ token: string }>('/auth/refresh')
}

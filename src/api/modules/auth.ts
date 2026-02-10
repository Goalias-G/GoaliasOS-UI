/**
 * 认证相关 API
 *
 * 功能说明：
 * - 用户登录
 * - 用户登出
 * - 获取用户信息
 */

import { post, get } from '@/api'
import type { ApiResponse, LoginRequest, LoginResponseData, User } from '@/types'

export const authApi = {
  /**
   * 用户登录
   * @param credentials 登录凭证
   */
  login: (credentials: LoginRequest) =>
    post<ApiResponse<LoginResponseData>>('/auth/login', credentials),

  /**
   * 用户登出
   */
  logout: () => post('/auth/logout'),

  /**
   * 获取当前用户信息
   */
  getUserInfo: () => get<ApiResponse<User>>('/system/user/getInfo'),
}

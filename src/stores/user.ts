/**
 * 用户状态管理模块
 *
 * 功能说明：
 * - 管理用户认证状态（Token、登录状态）
 * - 管理用户信息
 * - 提供登录、登出、获取用户信息等方法
 *
 * TODO 扩展：
 * - [ ] 实现真实的登录 API 调用
 * - [ ] 实现获取用户信息 API 调用
 * - [ ] Token 刷新机制
 * - [ ] 记住登录状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { setStorage, getStorage, removeStorage } from '@/utils/storage'
import type { User, LoginRequest, LoginResponse } from '@/types'

export const useUserStore = defineStore('user', () => {
  // ==================== 状态 ====================

  /** 用户 Token */
  const token = ref<string | null>(getStorage('token') || null)

  /** 用户信息 */
  const userInfo = ref<User | null>(null)

  // ==================== 计算属性 ====================

  /** 是否已登录 */
  const isLoggedIn = computed(() => !!token.value)

  /** 用户名 */
  const username = computed(() => userInfo.value?.username || '未登录')

  /** 用户头像 */
  const avatar = computed(() => userInfo.value?.avatar || '')

  // ==================== 方法 ====================

  /**
   * 设置 Token
   * @param newToken Token 字符串
   */
  function setToken(newToken: string) {
    token.value = newToken
    setStorage('token', newToken)
    // 同时设置到 localStorage（供 Axios 拦截器使用）
    localStorage.setItem('token', newToken)
  }

  /**
   * 清除 Token
   */
  function clearToken() {
    token.value = null
    removeStorage('token')
    localStorage.removeItem('token')
  }

  /**
   * 登录
   * @param credentials 登录凭证
   *
   * TODO: 实现真实的登录 API 调用
   */
  async function login(credentials: LoginRequest): Promise<void> {
    // TODO: 调用登录 API
    // const response = await userApi.login(credentials)

    // 模拟登录成功
    const mockResponse: LoginResponse = {
      token: 'mock_token_' + Date.now(),
      user: {
        id: '1',
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        avatar: '',
      },
    }

    setToken(mockResponse.token)
    userInfo.value = mockResponse.user
  }

  /**
   * 登出
   */
  function logout() {
    clearToken()
    userInfo.value = null
    // TODO: 调用登出 API（可选，用于服务端清除 Session）
  }

  /**
   * 获取用户信息
   *
   * TODO: 实现真实的获取用户信息 API 调用
   */
  async function fetchUserInfo(): Promise<void> {
    if (!token.value) return

    // TODO: 调用获取用户信息 API
    // const user = await userApi.getUserInfo()
    // userInfo.value = user

    // 模拟获取用户信息
    userInfo.value = {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      avatar: '',
    }
  }

  return {
    // 状态
    token,
    userInfo,
    // 计算属性
    isLoggedIn,
    username,
    avatar,
    // 方法
    setToken,
    clearToken,
    login,
    logout,
    fetchUserInfo,
  }
})

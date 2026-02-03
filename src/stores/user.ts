/**
 * 用户状态管理模块
 *
 * 功能说明：
 * - 管理用户认证状态（Token、登录状态）
 * - 管理用户信息
 * - 提供登录、登出、获取用户信息等方法
 */

import { defineStore } from 'pinia'
import { authApi } from '@/api/modules/auth'
import type { User, LoginRequest, LoginResponseData, ApiResponse } from '@/types'

export const useUserStore = defineStore('user', () => {
  // ==================== 状态 ====================

  /** 用户 Token */
  const token = ref<string>('')

  /** 用户信息 */
  const userInfo = ref<User | null>(null)

  // ==================== 计算属性 ====================

  /** 是否已登录 */
  const isLoggedIn = computed(() => !!token.value)

  /** 用户昵称 */
  const nickName = computed(() => userInfo.value?.nickName || '游客')

  /** 用户头像 */
  const avatar = computed(() => userInfo.value?.avatar || '')

  /** 用户计划 */
  const userPlan = computed(() => userInfo.value?.userPlan || 'Free')

  // ==================== 方法 ====================

  /**
   * 设置 Token
   * @param newToken Token 字符串
   */
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  /**
   * 清除 Token
   */
  function clearToken() {
    token.value = ''
    localStorage.removeItem('token')
  }

  /**
   * 登录
   * @param credentials 登录凭证
   */
  async function login(credentials: LoginRequest): Promise<ApiResponse<LoginResponseData>> {
    try {
      const response = await authApi.login(credentials)
      setToken(response.data.token)
      userInfo.value = response.data.userInfo
      return response
    } catch (error) {
      console.error('登录失败:', error)
      clearToken()
      userInfo.value = null
      throw error
    }
  }

  /**
   * 登出
   */
  async function logout() {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      clearToken()
      userInfo.value = null
    }
  }

  /**
   * 获取用户信息
   */
  async function fetchUserInfo(): Promise<void> {
    if (!token.value) return

    try {
      const user = await authApi.getUserInfo()
      userInfo.value = user
    } catch (error) {
      console.error('获取用户信息失败:', error)
      clearToken()
      userInfo.value = null
    }
  }

  /**
   * 初始化（从 localStorage 恢复 Token）
   */
  function init() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      // 自动获取用户信息
      fetchUserInfo()
    }
  }

  // 初始化
  init()

  return {
    // 状态
    token,
    userInfo,
    // 计算属性
    isLoggedIn,
    nickName,
    avatar,
    userPlan,
    // 方法
    setToken,
    clearToken,
    login,
    logout,
    fetchUserInfo,
  }
})

/**
 * 用户相关类型定义
 */

/** 用户信息 */
export interface User {
  userId: number
  username?: string
  nickName: string
  avatar: string
  userPlan: string
  loginIp: string
  loginLocation?: string
  loginDate: string
  loginId: string

  userBalance: number
  isAdmin: boolean
}

/** 登录请求参数 */
export interface LoginRequest {
  username: string
  password: string
}

/** 登录响应数据 */
export interface LoginResponseData {
  token: string
  userInfo: User
}

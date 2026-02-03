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

/** 健康指标数据 */
export interface HealthMetrics {
    sleepHours: number // 睡眠时长（小时）
    waterIntake: number // 饮水量（毫升）
    steps: number // 步数
    calories: number // 卡路里消耗
    exerciseMinutes: number // 运动时长（分钟）
}

/** 日程事项 */
export interface ScheduleItem {
    id: string
    title: string
    time: string
    type: 'health' | 'life' | 'exercise' | 'study'
    completed: boolean
}

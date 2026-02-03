/**
 * 健康相关 API
 *
 * 功能说明：
 * - 获取健康指标
 * - 更新健康数据
 * - 获取日程安排
 */

import { get, post } from '@/api'
import type { HealthMetrics, ScheduleItem } from '@/types'

export const healthApi = {
    /**
     * 获取今日健康指标
     */
    getTodayMetrics: () => get<HealthMetrics>('/api/health/metrics/today'),

    /**
     * 更新健康指标
     * @param data 健康指标数据
     */
    updateMetrics: (data: Partial<HealthMetrics>) =>
        post<HealthMetrics>('/api/health/metrics/update', data),

    /**
     * 获取今日日程
     */
    getTodaySchedule: () => get<ScheduleItem[]>('/api/health/schedule/today'),

    /**
     * 完成日程事项
     * @param id 日程 ID
     */
    completeSchedule: (id: string) => post(`/api/health/schedule/${id}/complete`),
}

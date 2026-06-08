/**
 * 动态调度任务 / 任务执行日志 API
 *
 * 功能说明：
 * - 任务 CRUD、启停、立即执行、删除
 * - 执行日志分页查询、详情、批量删除、一键清空
 *
 * 自定义参数约定（params.taskParams，JSON 字符串，按 taskType 区分）：
 * - FINANCE：{ categoryId: number 必填, amount?: number 默认 0, tag?: 1|2|3|4 默认 2, remark?: string }
 *     tag 含义：1-必要支出 2-弹性支出 3-工薪收入 4-额外收入
 * - EMAIL_CHAT：{ prompt: string 必填, recipient: string 必填(多收件人以英文逗号分隔),
 *                 subject?: string 默认 "Goalias AI 提醒 yyyy-MM-dd HH:mm" }
 */

import { get, post, del, put } from '@/api'
import type {
  ApiResponse,
  ChangeStatusParams,
  PageQuery,
  PageResult,
  SysScheduledTask,
  SysScheduledTaskLog,
  SysScheduledTaskLogParams,
  SysScheduledTaskParams,
  TaskExecuteResult,
} from '@/types'

export const sysScheduledTaskApi = {
  /**
   * 分页查询动态任务列表
   * @param params 查询参数（userId 缺省取当前登录用户）
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<SysScheduledTaskParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<SysScheduledTask>>>('/schedule/tasks/list', {
      ...params,
      ...pageQuery,
    }),

  /**
   * 获取任务详情
   * @param id 任务 ID
   */
  getInfo: (id: number) => get<ApiResponse<SysScheduledTask>>(`/schedule/tasks/${id}`),

  /**
   * 新增任务；status=1 时立即注册到调度器
   * @param data 任务数据（taskParams 字段为 JSON 字符串，按 taskType 约定 key）
   */
  add: (data: SysScheduledTaskParams) => post<ApiResponse<void>>('/schedule/tasks', data),

  /**
   * 修改任务；cron/status/taskType/taskParams 任一变化会重新调度
   * @param data 任务数据（需带 id）
   */
  edit: (data: SysScheduledTaskParams) => put<ApiResponse<void>>('/schedule/tasks', data),

  /**
   * 启停任务
   * @param data { id, status: '0' | '1' }
   */
  changeStatus: (data: ChangeStatusParams) =>
    put<ApiResponse<void>>('/schedule/tasks/changeStatus', data),

  /**
   * 立即执行一次（同步返回执行结果）
   * @param id 任务 ID
   */
  runOnce: (id: number) => put<ApiResponse<TaskExecuteResult>>(`/schedule/tasks/run/${id}`),

  /**
   * 批量删除任务（先从调度器移除，再删除 DB 记录）
   * @param ids 任务 ID 数组
   */
  remove: (ids: number[]) => del<ApiResponse<void>>(`/schedule/tasks/${ids.join(',')}`),
}

export const sysScheduledTaskLogApi = {
  /**
   * 分页查询任务执行日志
   * @param params 查询参数（taskId / taskName / taskType / status / source / beginTime / endTime）
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<SysScheduledTaskLogParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<SysScheduledTaskLog>>>('/schedule/logs/list', {
      ...params,
      ...pageQuery,
    }),

  /**
   * 获取日志详情
   * @param id 日志 ID
   */
  getInfo: (id: number) => get<ApiResponse<SysScheduledTaskLog>>(`/schedule/logs/${id}`),

  /**
   * 批量删除日志
   * @param ids 日志 ID 数组
   */
  remove: (ids: number[]) => del<ApiResponse<void>>(`/schedule/logs/${ids.join(',')}`),

  /**
   * 一键清空所有日志
   */
  clean: () => del<ApiResponse<void>>('/schedule/logs/clean'),
}

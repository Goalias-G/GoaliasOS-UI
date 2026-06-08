/**
 * 动态调度任务 / 任务执行日志 类型定义
 *
 * 特殊字段说明：
 * - SysScheduledTask.taskParams：JSON 字符串，结构按 taskType 区分（见下方 TaskTypeParams）
 * - SysScheduledTask.status：'0' 暂停 / '1' 运行
 * - SysScheduledTaskLog.source：'SCHEDULE' 调度触发 / 'MANUAL' 手动触发
 * - SysScheduledTaskLog.status：'0' 失败 / '1' 成功
 *
 * 枚举约定：
 * - TaskType：FINANCE 财务任务 / LIFE 生活任务 / CHAT 对话任务 / EMAIL_CHAT AI对话邮件任务
 * - TaskStatus：'0' 暂停 / '1' 运行
 * - TaskExecuteStatus：'0' 失败 / '1' 成功
 * - TaskTriggerSource：'SCHEDULE' / 'MANUAL'
 */

/** 任务类型枚举 */
export type TaskType = 'FINANCE' | 'LIFE' | 'CHAT' | 'EMAIL_CHAT'

/** 任务状态枚举 */
export type TaskStatus = '0' | '1'

/** 任务执行结果枚举 */
export type TaskExecuteStatus = '0' | '1'

/** 任务触发来源枚举 */
export type TaskTriggerSource = 'SCHEDULE' | 'MANUAL'

/**
 * FINANCE 类型自定义参数
 * - 通过 Json 字符串传入 SysScheduledTaskParams.taskParams
 * - 必填 categoryId
 */
export interface FinanceTaskParams {
  /** 必填，财务分类 ID（finance_category.id） */
  categoryId: number
  /** 可选，金额（分），默认 0，传负数会被取绝对值 */
  amount?: number
  /** 可选，流水标签，默认 2：1-必要支出 2-弹性支出 3-工薪收入 4-额外收入 */
  tag?: 1 | 2 | 3 | 4
  /** 可选，备注，默认 "[自动] 定时任务生成" */
  remark?: string
}

/**
 * EMAIL_CHAT 类型自定义参数
 * - 通过 Json 字符串传入 SysScheduledTaskParams.taskParams
 * - 必填 prompt 与 recipient
 */
export interface EmailChatTaskParams {
  /** 必填，作为用户原文发送给 AI */
  prompt: string
  /** 必填，收件人邮箱；多个以英文逗号分隔 */
  recipient: string
  /** 可选，邮件主题；默认 "Goalias AI 提醒 yyyy-MM-dd HH:mm" */
  subject?: string
}

/** 动态调度任务实体 */
export interface SysScheduledTask {
  id?: number
  userId?: number
  taskName: string
  taskType: TaskType
  cronExpression: string
  description?: string
  status: TaskStatus
  lastExecuteTime?: string
  nextExecuteTime?: string
  lastExecuteStatus?: TaskExecuteStatus
  executeCount?: number
  /**
   * 自定义参数 JSON 字符串；结构按 taskType 区分：
   * - FINANCE → FinanceTaskParams
   * - EMAIL_CHAT → EmailChatTaskParams
   * 后端在保存时会校验必填字段；前端在调用 add/edit 前应 JSON.stringify(params)
   */
  params?: string
  remark?: string
  createTime?: string
  updateTime?: string
}

/**
 * 动态调度任务 新增/修改 入参
 * - 新增时 id 可为空；修改时 id 必填
 * - status 缺省时后端默认 '0' 暂停
 */
export interface SysScheduledTaskParams {
  id?: number
  userId?: number
  taskName: string
  taskType: TaskType
  cronExpression: string
  description?: string
  status?: TaskStatus
  /**
   * 自定义参数 JSON 字符串（必填范围因 taskType 而异，详见 SysScheduledTask.taskParams 说明）
   */
  taskParams?: string
  remark?: string
}

/** 启停任务入参 */
export interface ChangeStatusParams {
  id: number
  status: TaskStatus
}

/** 任务执行结果（立即执行接口响应） */
export interface TaskExecuteResult {
  success: boolean
  message?: string
  errorMessage?: string
  startTime?: string
  endTime?: string
  durationMs?: number
}

/** 任务执行日志实体 */
export interface SysScheduledTaskLog {
  id?: number
  taskId: number
  taskName: string
  taskType: TaskType
  startTime: string
  endTime?: string
  durationMs?: number
  status: TaskExecuteStatus
  errorMessage?: string
  resultMessage?: string
  source: TaskTriggerSource
  createTime?: string
}

/** 任务执行日志查询条件 */
export interface SysScheduledTaskLogParams {
  taskId?: number
  taskName?: string
  taskType?: TaskType
  status?: TaskExecuteStatus
  source?: TaskTriggerSource
  /** 开始时间起，格式 yyyy-MM-dd HH:mm:ss */
  beginTime?: string
  /** 开始时间止，格式 yyyy-MM-dd HH:mm:ss */
  endTime?: string
}

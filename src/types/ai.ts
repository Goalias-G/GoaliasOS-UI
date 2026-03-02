/**
 * AI 对话系统类型定义
 *
 * 功能说明：
 * - 定义 SSE 流式传输相关类型
 * - 定义 Store 状态管理类型
 * - 提供完整的类型安全支持
 *
 * 注意：会话、消息、模型、知识库、提示词模板等基础类型已在 types/api 目录中定义
 */

// 从现有类型中重新导出,方便使用
export type { ChatSession, ChatMessage, ChatModel, PromptTemplate } from './api/chat'
export type { MessageContent, ChatRequestParams } from './api/chat-common'
export type { KnowledgeInfo as Knowledge } from './api/knowledge'

// ==================== 提示词模板分类 ====================

/**
 * 提示词模板分类
 */
export type PromptCategory = '编程' | '写作' | '翻译' | '分析' | '其他'

// ==================== SSE 相关类型 ====================

/**
 * SSE 连接选项
 */
export interface SSEOptions {
  /** 接收消息回调 */
  onMessage: (data: SSEMessage) => void
  /** 错误回调 */
  onError: (error: Error) => void
  /** 完成回调 */
  onComplete: () => void
  /** 中断信号 */
  signal?: AbortSignal
}

/**
 * SSE 消息格式
 */
export interface SSEMessage {
  /** 消息内容（流式传输的文本片段） */
  content?: string
  /** 是否完成 */
  done: boolean
  /** 完整消息 ID（流式传输完成后返回） */
  messageId?: number
  /** 错误信息 */
  error?: string
}

// ==================== 请求/响应类型 ====================

/**
 * 创建会话请求
 */
export interface CreateSessionRequest {
  /** 会话标题 */
  sessionTitle?: string
  /** 用户 ID */
  userId: number
}

// ==================== Store 状态类型 ====================

/**
 * 会话 Store 加载状态
 */
export interface SessionLoadingState {
  /** 会话列表加载中 */
  sessions: boolean
  /** 消息列表加载中 */
  messages: boolean
  /** 消息发送中 */
  sending: boolean
}

/**
 * 流式消息
 */
export interface StreamingMessage {
  /** 角色 */
  role: 'assistant'
  /** 内容（逐步累积） */
  content: string
  /** 工具调用状态列表 */
  toolCalls?: ToolCallStatus[]
}

/**
 * 工具调用状态类型
 */
export type ToolCallStatusType =
  | 'tool_call_start' // 开始调用工具
  | 'tool_executing' // 工具执行中
  | 'tool_completed' // 工具执行完成
  | 'ai_thinking' // AI 分析结果中

/**
 * 工具调用状态
 */
export interface ToolCallStatus {
  /** 状态类型 */
  type: ToolCallStatusType
  /** 工具名称 */
  toolName?: string
  /** 状态消息 */
  message: string
  /** 当前执行的工具索引 */
  current?: number
  /** 总工具数量 */
  total?: number
  /** 执行耗时（毫秒） */
  executionTime?: number
  /** 时间戳 */
  timestamp: number
}

// ==================== Toast 提示类型 ====================

/**
 * Toast 类型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast 项
 */
export interface ToastItem {
  /** 唯一 ID */
  id: string
  /** 提示类型 */
  type: ToastType
  /** 提示消息 */
  message: string
  /** 持续时长（毫秒） */
  duration?: number
}

/**
 * Toast 选项
 */
export interface ToastOptions {
  /** 提示类型 */
  type?: ToastType
  /** 持续时长（毫秒，默认 3000） */
  duration?: number
}

/**
 * 聊天消息内容
 */
export interface MessageContent {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool'
  content: string | object
  name?: string
  reasoningContent?: string
}

/**
 * 聊天请求体
 */
export interface ChatRequestParams {
  messages: MessageContent[]
  model?: string
  sessionId?: number
  kid?: string
  enableSearch?: boolean
  autoSelectModel?: boolean
  hasAttachment?: boolean
  /** 快捷指令场景，对应 PromptTemplateEnum.desc */
  scene?: string
  /** 生活记录附件 OSS 文件 ID */
  fileIds?: number[]
  temperature?: number
  topP?: number
}

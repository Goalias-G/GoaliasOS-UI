/**
 * 聊天消息
 */
export interface ChatMessage {
  id: number
  userId: number
  content: string
  sessionId: number
  role: string
  deductCost: number
  totalTokens: number
  modelName: string
  remark: string
  billingType?: string
  createTime?: string
  updateTime?: string
}

/**
 * 聊天消息请求体
 */
export interface ChatMessageParams {
  id?: number
  userId?: number
  content: string
  sessionId: number
  role: string
  deductCost: number
  totalTokens: number
  modelName: string
  remark: string
  billingType?: string
}

/**
 * 聊天消息 (uniapp)
 */
export interface ChatMessageUniapp {
  id?: number
  userId: number
  role: string
  content: string
}

/**
 * 会话管理
 */
export interface ChatSession {
  id: number
  userId: number
  sessionTitle: string
  sessionContent: string
  remark: string
  conversationId: string
  archiveStatus?: number
  createTime?: string
  updateTime?: string
}

/**
 * 会话管理请求体
 */
export interface ChatSessionParams {
  id?: number
  userId?: number
  sessionTitle: string
  sessionContent?: string
  remark?: string
  conversationId?: string
  archiveStatus?: number
}

/** 当前用户的 AI 画像（Redis Hash，只读） */
export type ChatUserContext = Record<string, string>

/**
 * 聊天模型
 */
export interface ChatModel {
  id: number
  category: string
  modelName: string
  modelDescribe: string
  modelPrice: number
  modelType: string
  modelShow: string
  apiHost: string
  priority: number
  apiKey: string
  providerName: string
  remark: string
  enableSearch?: number // 0: 不支持联网搜索, 1: 支持联网搜索
  inputUsage?: number
  outputUsage?: number
  createTime?: string
  updateTime?: string
}

/**
 * 聊天模型请求体
 */
export interface ChatModelParams {
  id?: number
  category: string
  modelName: string
  modelDescribe: string
  modelPrice: number
  modelType: string
  modelShow: string
  apiHost: string
  priority?: number
  apiKey: string
  providerName?: string
  remark: string
}

/**
 * 提示词模板
}

/词模板
 */
export interface PromptTemplate {
  id: number
  templateName: string
  templateContent: string
  category: string
  remark: string
  priority: number
  createTime?: string
  updateTime?: string
}

/**
 * 提示词模板请求体
 */
export interface PromptTemplateParams {
  id?: number
  templateName: string
  templateContent: string
  category: string
  remark: string
  priority: number
}

/**
 * 配置信息
 */
export interface ChatConfig {
  id: number
  category: string
  configName: string
  configValue: string
  configDict: string
  remark: string
  updateIp: string
  createTime?: string
  updateTime?: string
}

/**
 * 配置信息请求体
 */
export interface ChatConfigParams {
  id?: number
  category: string
  configName: string
  configValue: string
  configDict: string
  remark: string
  updateIp: string
}

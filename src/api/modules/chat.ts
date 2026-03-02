/**
 * 聊天 API
 *
 * 功能说明：
 * - SSE 流式聊天
 * - 简单文本聊天
 */

import { post } from '@/api'
import type { ApiResponse, ChatRequestParams } from '@/types'

export const chatApi = {
  /**
   * SSE 流式聊天
   * @param data 聊天请求参数
   */
  sseChat: (data: ChatRequestParams) =>
    post<ApiResponse<any>>('/chat/send', data, { responseType: 'stream' }),

  /**
   * 简单文本聊天
   * @param data 聊天请求参数
   */
  simpleChat: (data: ChatRequestParams) => post<ApiResponse<string>>('/chat/simple', data),
}

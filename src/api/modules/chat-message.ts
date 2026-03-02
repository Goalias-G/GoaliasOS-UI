/**
 * 聊天消息 API
 *
 * 功能说明：
 * - 查询消息列表
 * - 根据会话查询消息
 * - 获取消息详情
 * - 新增/修改/删除消息
 */

import { get, post, del } from '@/api'
import type {
  ApiResponse,
  ChatMessage,
  ChatMessageParams,
  ChatMessageUniapp,
  PageQuery,
  PageResult,
} from '@/types'

export const chatMessageApi = {
  /**
   * 查询消息列表（分页）
   * @param params 查询参数
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<ChatMessageParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<ChatMessage>>>('/chat/message/list', { ...params, ...pageQuery }),

  /**
   * 根据会话 ID 查询消息列表（分页）
   * @param sessionId 会话 ID
   * @param pageQuery 分页参数
   */
  listBySession: (sessionId: number, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<ChatMessage>>>(
      `/chat/message/listBySession/${sessionId}`,
      pageQuery,
    ),

  /**
   * 获取消息详情
   * @param id 消息 ID
   */
  getInfo: (id: number) => get<ApiResponse<ChatMessage>>(`/chat/message/${id}`),

  /**
   * 新增消息
   * @param data 消息数据
   */
  add: (data: ChatMessageParams) => post<ApiResponse<number>>('/chat/message', data),

  /**
   * 修改消息
   * @param data 消息数据
   */
  edit: (data: ChatMessageParams) => post<ApiResponse<void>>('/chat/message', data),

  /**
   * 删除消息
   * @param ids 消息 ID 数组
   */
  remove: (ids: number[]) => del<ApiResponse<void>>(`/chat/message/${ids.join(',')}`),
}

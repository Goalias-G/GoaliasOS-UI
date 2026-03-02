/**
 * 会话管理 API
 *
 * 功能说明：
 * - 查询会话列表
 * - 获取会话详情
 * - 新增/修改/删除会话
 */

import { get, post, del, put } from '@/api'
import type { ApiResponse, ChatSession, ChatSessionParams, PageQuery, PageResult } from '@/types'

export const chatSessionApi = {
  /**
   * 查询会话列表（分页）
   * @param params 查询参数
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<ChatSessionParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<ChatSession>>>('/chat/session/list', { ...params, ...pageQuery }),

  /**
   * 获取会话详情
   * @param id 会话 ID
   */
  getInfo: (id: number) => get<ApiResponse<ChatSession>>(`/chat/session/${id}`),

  /**
   * 新增会话
   * @param data 会话数据
   */
  add: (data: ChatSessionParams) => post<ApiResponse<number>>('/chat/session', data),

  /**
   * 修改会话
   * @param data 会话数据
   */
  edit: (data: ChatSessionParams) => put<ApiResponse<void>>('/chat/session', data),

  /**
   * 删除会话
   * @param ids 会话 ID 数组
   */
  remove: (ids: number[]) => del<ApiResponse<void>>(`/chat/session/${ids.join(',')}`),
}

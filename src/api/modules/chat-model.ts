/**
 * 聊天模型 API
 *
 * 功能说明：
 * - 查询聊天模型列表
 * - 查询用户可见模型列表
 * - 获取模型详情
 * - 新增/修改/删除模型
 */

import { get, post, del, put } from '@/api'
import type { ApiResponse, ChatModel, ChatModelParams, PageQuery, PageResult } from '@/types'

export const chatModelApi = {
  /**
   * 查询聊天模型列表（分页）
   * @param params 查询参数
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<ChatModelParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<ChatModel>>>('/chat/model/list', { ...params, ...pageQuery }),

  /**
   * 查询用户可见模型列表（不分页）
   * @param params 查询参数
   */
  modelList: (params?: Partial<ChatModelParams>) =>
    get<ApiResponse<ChatModel[]>>('/chat/model/modelList', params),

  /**
   * 获取聊天模型详情
   * @param id 模型 ID
   */
  getInfo: (id: number) => get<ApiResponse<ChatModel>>(`/chat/model/${id}`),

  /**
   * 新增聊天模型
   * @param data 模型数据
   */
  add: (data: ChatModelParams) => post<ApiResponse<void>>('/chat/model', data),

  /**
   * 修改聊天模型
   * @param data 模型数据
   */
  edit: (data: ChatModelParams) => put<ApiResponse<void>>('/chat/model', data),

  /**
   * 删除聊天模型
   * @param ids 模型 ID 数组
   */
  remove: (ids: number[]) => del<ApiResponse<void>>(`/chat/model/${ids.join(',')}`),
}

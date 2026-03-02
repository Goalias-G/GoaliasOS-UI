/**
 * 提示词模板 API
 *
 * 功能说明：
 * - 查询模板列表
 * - 获取模板详情
 * - 新增/修改/删除模板
 */

import { get, post, del, put } from '@/api'
import type {
  ApiResponse,
  PromptTemplate,
  PromptTemplateParams,
  PageQuery,
  PageResult,
} from '@/types'

export const promptTemplateApi = {
  /**
   * 查询模板列表（分页）
   * @param params 查询参数
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<PromptTemplateParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<PromptTemplate>>>('/chat/promptTemplate/list', {
      ...params,
      ...pageQuery,
    }),

  /**
   * 获取模板详情
   * @param id 模板 ID
   */
  getInfo: (id: number) => get<ApiResponse<PromptTemplate>>(`/chat/promptTemplate/${id}`),

  /**
   * 新增模板
   * @param data 模板数据
   */
  add: (data: PromptTemplateParams) => post<ApiResponse<void>>('/chat/promptTemplate', data),

  /**
   * 修改模板
   * @param data 模板数据
   */
  edit: (data: PromptTemplateParams) => put<ApiResponse<void>>('/chat/promptTemplate', data),

  /**
   * 删除模板
   * @param ids 模板 ID 数组
   */
  remove: (ids: number[]) => del<ApiResponse<void>>(`/chat/promptTemplate/${ids.join(',')}`),
}

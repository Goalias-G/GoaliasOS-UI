/**
 * 聊天配置 API
 *
 * 功能说明：
 * - 查询配置列表
 * - 获取配置详情
 * - 新增/修改/删除配置
 * - 根据键名查询配置值
 * - 查询系统配置
 */

import { get, post, del, put } from '@/api'
import type { ApiResponse, ChatConfig, ChatConfigParams, PageQuery, PageResult } from '@/types'

export const chatConfigApi = {
  /**
   * 查询配置列表（分页）
   * @param params 查询参数
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<ChatConfigParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<ChatConfig>>>('/chat/config/list', { ...params, ...pageQuery }),

  /**
   * 获取配置详情
   * @param id 配置 ID
   */
  getInfo: (id: number) => get<ApiResponse<ChatConfig>>(`/chat/config/${id}`),

  /**
   * 批量新增或修改配置
   * @param data 配置数据数组
   */
  saveOrUpdate: (data: ChatConfigParams[]) =>
    post<ApiResponse<void>>('/chat/config/saveOrUpdate', data),

  /**
   * 修改配置
   * @param data 配置数据
   */
  edit: (data: ChatConfigParams) => put<ApiResponse<void>>('/chat/config', data),

  /**
   * 删除配置
   * @param ids 配置 ID 数组
   */
  remove: (ids: number[]) => del<ApiResponse<void>>(`/chat/config/${ids.join(',')}`),

  /**
   * 根据键名查询配置值
   * @param configKey 配置键名
   */
  getConfigKey: (configKey: string) =>
    get<ApiResponse<string>>(`/chat/config/configKey/${configKey}`),

  /**
   * 查询系统配置
   */
  getSysConfigKey: () => get<ApiResponse<ChatConfig[]>>('/chat/config/sysConfigKey'),
}

/**
 * 生活健康 API
 *
 * 功能说明：
 * - 查询每日健康记录列表
 * - 获取健康记录详情
 * - 新增/修改/删除健康记录
 */

import { get, post, del, put } from '@/api'
import type { ApiResponse, DailyHealth, DailyHealthParams, PageQuery, PageResult } from '@/types'

export const dailyHealthApi = {
  /**
   * 查询每日健康记录列表（分页）
   * @param params 查询参数（支持 healthDate、startTime、endTime 时间条件查询）
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<DailyHealthParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<DailyHealth>>>('/life/health/list', { ...params, ...pageQuery }),

  /**
   * 获取每日健康记录详情
   * @param id 健康记录 ID
   */
  getInfo: (id: number) => get<ApiResponse<DailyHealth>>(`/life/health/${id}`),

  /**
   * 新增每日健康记录
   * @param data 健康记录数据
   */
  add: (data: DailyHealthParams) => post<ApiResponse<void>>('/life/health', data),

  /**
   * 修改每日健康记录
   * @param data 健康记录数据
   */
  edit: (data: DailyHealthParams) => put<ApiResponse<void>>('/life/health', data),

  /**
   * 删除每日健康记录
   * @param ids 健康记录 ID
   */
  remove: (ids: number[]) => del<ApiResponse<void>>(`/life/health/${ids.join(',')}`),
}

/**
 * 每日知识 API
 *
 * 功能说明：
 * - 查询每日知识列表（支持类型筛选、时间条件查询）
 * - 获取知识详情
 * - 新增/修改/删除知识
 */

import type { DailyKnowledge, DailyKnowledgeParams } from '@/types'

export const dailyKnowledgeApi = {
  /**
   * 查询每日知识列表（分页）
   * @param params 查询参数（支持 type、knowledgeDate、startTime、endTime 条件查询）
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<DailyKnowledgeParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<DailyKnowledge>>>('/life/knowledge/list', { ...params, ...pageQuery }),

  /**
   * 获取每日知识详情
   * @param id 知识 ID
   */
  getInfo: (id: number) => get<ApiResponse<DailyKnowledge>>(`/life/knowledge/${id}`),

  /**
   * 新增每日知识
   * @param data 知识数据
   */
  add: (data: DailyKnowledgeParams) => post<ApiResponse<void>>('/life/knowledge', data),

  /**
   * 修改每日知识
   * @param data 知识数据
   */
  edit: (data: DailyKnowledgeParams) => put<ApiResponse<void>>('/life/knowledge', data),

  /**
   * 删除每日知识
   * @param ids 知识 ID 数组
   */
  remove: (ids: number[]) => del<ApiResponse<void>>(`/life/knowledge/${ids.join(',')}`),
}

/**
 * 首页 API
 *
 * 功能说明：
 * - 获取首页信息（天气、问候语、热门看板、AI推荐）
 * - 翻译文本
 */

import type { HomeInfoVo } from '@/types'

export const homeApi = {
  /**
   * 获取首页信息
   * @description 返回天气、问候语、热门看板、AI推荐等内容
   */
  info: () => get<ApiResponse<HomeInfoVo>>('/home/info'),

  /**
   * 翻译文本
   * @param text 要翻译的文本
   * @param toLanguage 目标语言（默认 zh-CHS）
   */
  translate: (text: string, toLanguage?: string) =>
    get<ApiResponse<string>>('/home/translate', { text, toLanguage }),
}

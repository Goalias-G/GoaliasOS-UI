/**
 * 生活记录 API
 *
 * 功能说明：
 * - 查询生活记录列表
 * - 获取记录详情（含图片 URL）
 * - 新增/修改/删除记录
 * - 更新收藏状态
 */

import { get, post, del, put } from '@/api'
import type { ApiResponse, LifeRecord, LifeRecordParams, PageQuery, PageResult } from '@/types'

export const lifeRecordApi = {
  /**
   * 查询生活记录列表（分页）
   * @param params 查询参数（categoryId, favoriteFlag, title）
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<LifeRecordParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<LifeRecord>>>('/life/record/list', { ...params, ...pageQuery }),

  /**
   * 获取生活记录详情
   * @param id 记录 ID
   */
  getInfo: (id: number) => get<ApiResponse<LifeRecord>>(`/life/record/${id}`),

  /**
   * 新增生活记录
   * @param data 记录数据
   */
  add: (data: LifeRecordParams) => post<ApiResponse<void>>('/life/record', data),

  /**
   * 修改生活记录
   * @param data 记录数据
   */
  edit: (data: LifeRecordParams) => put<ApiResponse<void>>('/life/record', data),

  /**
   * 更新收藏状态
   * @param id 记录 ID
   * @param favoriteFlag 收藏状态 (0-否 1-是)
   */
  updateFavorite: (id: number, favoriteFlag: number) =>
    put<ApiResponse<void>>('/life/record/favorite', { id, favoriteFlag }),

  /**
   * 更新收藏状态
   * @param id 记录 ID
   * @param favoriteFlag 打分评级（1-5）
   */
  updateRaing: (id: number, ratingNum: number) =>
    put<ApiResponse<void>>('/life/record/rating', { id, ratingNum }),

  /**
   * 删除生活记录
   * @param ids 记录 ID 数组
   */
  remove: (ids: number[]) => del<ApiResponse<void>>(`/life/record/${ids.join(',')}`),
}

/**
 * 生活分类 API
 *
 * 功能说明：
 * - 查询生活分类列表
 * - 获取分类详情
 * - 新增/修改/删除分类
 * - 更新分类排序
 */

import { get, post, del, put } from '@/api'
import type { ApiResponse, LifeCategory, LifeCategoryParams, PageQuery, PageResult } from '@/types'

export const lifeCategoryApi = {
  /**
   * 查询生活分类列表（分页）
   * @param params 查询参数
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<LifeCategoryParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<LifeCategory>>>('/life/category/list', { ...params, ...pageQuery }),

  /**
   * 获取生活分类详情
   * @param id 分类 ID
   */
  getInfo: (id: number) => get<ApiResponse<LifeCategory>>(`/life/category/${id}`),

  /**
   * 新增生活分类
   * @param data 分类数据
   */
  add: (data: LifeCategoryParams) => post<ApiResponse<void>>('/life/category', data),

  /**
   * 修改生活分类
   * @param data 分类数据
   */
  edit: (data: LifeCategoryParams) => put<ApiResponse<void>>('/life/category', data),

  /**
   * 更新分类排序
   * @param data 分类数据（包含 id 和 order）
   */
  updateOrder: (data: LifeCategoryParams) => put<ApiResponse<void>>('/life/category/order', data),

  /**
   * 删除生活分类
   * @param ids 分类 ID 数组
   */
  remove: (ids: number[]) => del<ApiResponse<void>>(`/life/category/${ids.join(',')}`),
}

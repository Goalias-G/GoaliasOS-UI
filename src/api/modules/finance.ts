/**
 * 财务模块 API
 *
 * 功能说明：
 * - 收支分类 CRUD
 * - 收支流水 CRUD（分页）
 * - 财务概览统计
 * - 月度收支趋势（折线图）
 * - 分类支出占比（饼图）
 */

import { get, post, del, put } from '@/api'
import type {
  ApiResponse,
  PageQuery,
  PageResult,
  FinanceCategory,
  FinanceCategoryParams,
  FinanceTransaction,
  FinanceTransactionParams,
  FinanceTransactionQuery,
  FinanceOverview,
  FinanceTrend,
  FinanceDayTrend,
  FinanceCategoryPie,
} from '@/types'

/** 分类接口统一前缀 */
const CATEGORY_URL = '/finance/categories'
const TRANSACTION_URL = '/finance/transactions'
const STATS_URL = '/finance/stats'

export const financeCategoryApi = {
  /**
   * 获取分类列表（支持 type 筛选）
   * @param type 分类类型 1-支出 2-收入，不传返回全部
   */
  list: (type?: number) => get<ApiResponse<FinanceCategory[]>>(CATEGORY_URL, { type }),

  /**
   * 新增分类
   * @param data 分类数据
   */
  add: (data: FinanceCategoryParams) => post<ApiResponse<void>>(CATEGORY_URL, data),

  /**
   * 修改分类
   * @param id 分类 ID
   * @param data 分类数据
   */
  edit: (id: number, data: FinanceCategoryParams) =>
    put<ApiResponse<void>>(`${CATEGORY_URL}/${id}`, data),

  /**
   * 删除分类
   * @param id 分类 ID
   */
  remove: (id: number) => del<ApiResponse<void>>(`${CATEGORY_URL}/${id}`),
}

export const financeTransactionApi = {
  /**
   * 分页查询流水
   * @param params 查询参数（categoryId, tag, startDate, endDate）
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<FinanceTransactionQuery>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<FinanceTransaction>>>(TRANSACTION_URL, { ...params, ...pageQuery }),

  /**
   * 新增一笔收支
   * @param data 流水数据
   */
  add: (data: FinanceTransactionParams) => post<ApiResponse<void>>(TRANSACTION_URL, data),

  /**
   * 修改流水
   * @param id 流水 ID
   * @param data 流水数据
   */
  edit: (id: number, data: FinanceTransactionParams) =>
    put<ApiResponse<void>>(`${TRANSACTION_URL}/${id}`, data),

  /**
   * 删除流水
   * @param id 流水 ID
   */
  remove: (id: number) => del<ApiResponse<void>>(`${TRANSACTION_URL}/${id}`),
}

export const financeStatsApi = {
  /**
   * 核心财务概览
   */
  overview: () => get<ApiResponse<FinanceOverview>>(`${STATS_URL}/overview`),

  /**
   * 月度收支趋势（折线图）
   * @param year 年份，不传默认当前年
   */
  monthTrend: (year?: number) =>
    get<ApiResponse<FinanceTrend[]>>(`${STATS_URL}/monthTrend`, { year }),

  /**
   * 日度收支趋势（折线图）
   * @param year 年份
   * @param month 月份
   */
  dayTrend: (year: number, month: number) =>
    get<ApiResponse<FinanceDayTrend[]>>(`${STATS_URL}/dayTrend`, { year, month }),

  /**
   * 分类支出占比（饼图）
   * @param startDate 开始日期 yyyy-MM-dd 必传
   * @param endDate 结束日期 yyyy-MM-dd 必传
   */
  categoryPie: (startDate: string, endDate: string) =>
    get<ApiResponse<FinanceCategoryPie[]>>(`${STATS_URL}/category-pie`, { startDate, endDate }),
}

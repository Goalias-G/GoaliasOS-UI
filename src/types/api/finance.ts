/**
 * 财务模块类型定义
 */

/** 财务分类 */
export interface FinanceCategory {
  id: number
  userId: number
  name: string
  /** 分类类型 1-支出 2-收入 */
  type: number
  icon?: string
  createTime?: string
  updateTime?: string
}

/** 财务分类请求参数 */
export interface FinanceCategoryParams {
  id?: number
  name: string
  /** 分类类型 1-支出 2-收入 */
  type: number
  icon?: string
}

/** 财务流水 */
export interface FinanceTransaction {
  id: number
  userId: number
  categoryId: number
  /** 金额（Long，前端展示需处理单位） */
  amount: number
  /** 流水标签 1-必要支出 2-弹性支出 3-工薪收入 4-额外收入 */
  tag: number
  remark?: string
  createTime?: string
  updateTime?: string
  /** 关联分类名称 */
  categoryName?: string
  /** 关联分类类型 1-支出 2-收入 */
  categoryType?: number
}

/** 财务流水请求参数 */
export interface FinanceTransactionParams {
  id?: number
  categoryId: number
  /** 金额（Long，前端展示需处理单位） */
  amount: number
  /** 流水标签 1-必要支出 2-弹性支出 3-工薪收入 4-额外收入 */
  tag: number
  remark?: string
}

/** 财务流水查询参数 */
export interface FinanceTransactionQuery {
  categoryId?: number
  tag?: number
  startDate?: string
  endDate?: string
}

/** 财务概览 */
export interface FinanceOverview {
  totalIncome: number
  totalExpense: number
  balance: number
  monthIncome: number
  monthExpense: number
  monthBalance: number
}

/** 月度收支趋势 */
export interface FinanceTrend {
  /** 月份 "2026-04" */
  month: string
  income: number
  expense: number
}

/** 日度收支趋势 */
export interface FinanceDayTrend {
  /** 日期 "2026-04-01" */
  day: string
  income: number
  expense: number
}

/** 分类支出占比 */
export interface FinanceCategoryPie {
  categoryName: string
  amount: number
  /** 百分比 0-100 */
  percentage: number
}

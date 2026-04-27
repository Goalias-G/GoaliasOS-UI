/**
 * 财务模块 Store
 *
 * 功能说明:
 * - 管理分类列表和流水列表状态
 * - 处理分类和流水的 CRUD 操作
 * - 管理概览统计、趋势和饼图数据
 */

import type {
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
import { financeCategoryApi, financeTransactionApi, financeStatsApi } from '@/api/modules/finance'

export const useFinanceStore = defineStore('finance', () => {
  // ==================== 状态 ====================
  const categories = ref<FinanceCategory[]>([])
  const transactions = ref<FinanceTransaction[]>([])
  const overview = ref<FinanceOverview | null>(null)
  const trendData = ref<FinanceTrend[]>([])
  const dayTrendData = ref<FinanceDayTrend[]>([])
  const pieData = ref<FinanceCategoryPie[]>([])

  const transactionPagination = ref({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  })

  const loading = ref({
    categories: false,
    transactions: false,
    overview: false,
    trend: false,
    pie: false,
  })

  // ==================== 计算属性 ====================
  const expenseCategories = computed(() => categories.value.filter((c) => c.type === 1))
  const incomeCategories = computed(() => categories.value.filter((c) => c.type === 2))

  // ==================== 分类方法 ====================
  async function loadCategories(type?: number): Promise<void> {
    loading.value.categories = true
    try {
      const response = await financeCategoryApi.list(type)
      if (response.code === 200 && response.data) {
        categories.value = response.data
      } else {
        throw new Error(response.message || '加载分类失败')
      }
    } finally {
      loading.value.categories = false
    }
  }

  async function addCategory(data: FinanceCategoryParams): Promise<void> {
    const response = await financeCategoryApi.add(data)
    if (response.code === 200) {
      await loadCategories()
    } else {
      throw new Error(response.message || '新增分类失败')
    }
  }

  async function editCategory(id: number, data: FinanceCategoryParams): Promise<void> {
    const response = await financeCategoryApi.edit(id, data)
    if (response.code === 200) {
      await loadCategories()
    } else {
      throw new Error(response.message || '编辑分类失败')
    }
  }

  async function deleteCategory(id: number): Promise<void> {
    const response = await financeCategoryApi.remove(id)
    if (response.code === 200) {
      await loadCategories()
    } else {
      throw new Error(response.message || '删除分类失败')
    }
  }

  // ==================== 流水方法 ====================
  async function loadTransactions(
    params?: Partial<FinanceTransactionQuery>,
    reset?: boolean,
  ): Promise<void> {
    if (reset) {
      transactionPagination.value.pageNum = 1
    }

    loading.value.transactions = true
    try {
      const response = await financeTransactionApi.list(params, {
        pageNum: transactionPagination.value.pageNum,
        pageSize: transactionPagination.value.pageSize,
      })
      if (response.code === 200 && response.data) {
        transactions.value = response.data.list
        transactionPagination.value.total = response.data.total
      } else {
        throw new Error(response.message || '加载流水失败')
      }
    } finally {
      loading.value.transactions = false
    }
  }

  async function addTransaction(data: FinanceTransactionParams): Promise<void> {
    const response = await financeTransactionApi.add(data)
    if (response.code === 200) {
      await loadTransactions(undefined, true)
    } else {
      throw new Error(response.message || '新增流水失败')
    }
  }

  async function editTransaction(id: number, data: FinanceTransactionParams): Promise<void> {
    const response = await financeTransactionApi.edit(id, data)
    if (response.code === 200) {
      await loadTransactions(undefined, true)
    } else {
      throw new Error(response.message || '编辑流水失败')
    }
  }

  async function deleteTransaction(id: number): Promise<void> {
    const response = await financeTransactionApi.remove(id)
    if (response.code === 200) {
      await loadTransactions(undefined, true)
    } else {
      throw new Error(response.message || '删除流水失败')
    }
  }

  // ==================== 统计方法 ====================
  async function loadOverview(): Promise<void> {
    loading.value.overview = true
    try {
      const response = await financeStatsApi.overview()
      if (response.code === 200 && response.data) {
        overview.value = response.data
      } else {
        throw new Error(response.message || '加载概览失败')
      }
    } finally {
      loading.value.overview = false
    }
  }

  async function loadTrend(year?: number): Promise<void> {
    loading.value.trend = true
    try {
      const response = await financeStatsApi.monthTrend(year)
      if (response.code === 200 && response.data) {
        trendData.value = response.data
      } else {
        throw new Error(response.message || '加载趋势失败')
      }
    } finally {
      loading.value.trend = false
    }
  }

  async function loadDayTrend(year: number, month: number): Promise<void> {
    loading.value.trend = true
    try {
      const response = await financeStatsApi.dayTrend(year, month)
      if (response.code === 200 && response.data) {
        dayTrendData.value = response.data
      } else {
        throw new Error(response.message || '加载日度趋势失败')
      }
    } finally {
      loading.value.trend = false
    }
  }

  async function loadPie(startDate: string, endDate: string): Promise<void> {
    loading.value.pie = true
    try {
      const response = await financeStatsApi.categoryPie(startDate, endDate)
      if (response.code === 200 && response.data) {
        pieData.value = response.data
      } else {
        throw new Error(response.message || '加载饼图数据失败')
      }
    } finally {
      loading.value.pie = false
    }
  }

  // ==================== 辅助方法 ====================
  function setTransactionPage(page: number) {
    transactionPagination.value.pageNum = page
  }

  return {
    // 状态
    categories,
    transactions,
    overview,
    trendData,
    dayTrendData,
    pieData,
    transactionPagination,
    loading,
    // 计算属性
    expenseCategories,
    incomeCategories,
    // 分类方法
    loadCategories,
    addCategory,
    editCategory,
    deleteCategory,
    // 流水方法
    loadTransactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    setTransactionPage,
    // 统计方法
    loadOverview,
    loadTrend,
    loadDayTrend,
    loadPie,
  }
})

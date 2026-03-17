/**
 * 生活记录 Store
 *
 * 功能说明:
 * - 管理分类列表和记录列表状态
 * - 处理分类和记录的 CRUD 操作
 * - 管理当前选中状态
 * - 数据持久化到 localStorage
 */
import { defineStore } from 'pinia'
import type {
  LifeCategory,
  LifeRecord,
  LifeCategoryParams,
  LifeRecordParams,
} from '@/types/api/life'
import { lifeCategoryApi } from '@/api/modules/lifeCategory.api'
import { lifeRecordApi } from '@/api/modules/lifeRecord.api'

export const useLifeRecordStore = defineStore('lifeRecord', () => {
  // ==================== 状态 ====================

  // 分类列表
  const categories = ref<LifeCategory[]>([])

  // 记录列表
  const records = ref<LifeRecord[]>([])

  // 当前选中的分类 ID
  const activeCategoryId = ref<number | null>(null)

  // 当前选中的记录 ID
  const activeRecordId = ref<number | null>(null)

  // 当前记录详情
  const currentRecord = ref<LifeRecord | null>(null)

  // 分页信息
  const pagination = ref({
    pageNum: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,
  })

  // 加载状态
  const loading = ref({
    categories: false,
    records: false,
    detail: false,
  })

  // ==================== 计算属性 ====================

  // 当前激活的分类
  const activeCategory = computed(() =>
    categories.value.find((cat) => cat.id === activeCategoryId.value),
  )

  // 当前激活的记录
  const activeRecord = computed(() => records.value.find((rec) => rec.id === activeRecordId.value))

  // ==================== 分类管理方法 ====================

  // 加载分类列表
  async function loadCategories(): Promise<void> {
    loading.value.categories = true
    try {
      const response = await lifeCategoryApi.list()
      if (response.code === 200 && response.data) {
        categories.value = response.data.list.sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
        )

        // 如果没有选中分类,默认选中第一个
        if (!activeCategoryId.value && categories.value.length > 0) {
          activeCategoryId.value = categories.value[0]!.id!
        }
      } else {
        throw new Error(response.message || '加载分类失败')
      }
    } finally {
      loading.value.categories = false
    }
  }

  // 新增分类
  async function addCategory(data: LifeCategoryParams): Promise<void> {
    const response = await lifeCategoryApi.add(data)
    if (response.code === 200) {
      await loadCategories()
    } else {
      throw new Error(response.message || '新增分类失败')
    }
  }

  // 编辑分类
  async function editCategory(data: LifeCategoryParams): Promise<void> {
    const response = await lifeCategoryApi.edit(data)
    if (response.code === 200) {
      await loadCategories()
    } else {
      throw new Error(response.message || '编辑分类失败')
    }
  }

  // 删除分类
  async function deleteCategory(id: number): Promise<void> {
    const response = await lifeCategoryApi.remove([id])
    if (response.code === 200) {
      await loadCategories()

      // 如果删除的是当前分类,切换到第一个分类
      if (activeCategoryId.value === id && categories.value.length > 0) {
        await switchCategory(categories.value[0]!.id!)
      }
    } else {
      throw new Error(response.message || '删除分类失败')
    }
  }

  // 更新分类排序
  async function updateCategoryOrder(
    updates: Array<{ id: number; sortOrder: number }>,
  ): Promise<void> {
    await Promise.all(updates.map((update) => lifeCategoryApi.updateOrder(update)))
    await loadCategories()
  }

  // 切换分类
  async function switchCategory(id: number): Promise<void> {
    activeCategoryId.value = id
    activeRecordId.value = null
    currentRecord.value = null

    // 保存到 localStorage
    localStorage.setItem('life-record-active-category', String(id))

    // 重新加载记录列表
    await loadRecords({ reset: true })

    // 如果有记录，自动选择第一条
    if (records.value.length > 0) {
      await loadRecordDetail(records.value[0]!.id!)
    }
  }

  // ==================== 记录管理方法 ====================

  // 加载记录列表
  async function loadRecords(params?: { reset?: boolean; search?: string }): Promise<void> {
    if (!activeCategoryId.value) return

    if (params?.reset) {
      pagination.value.pageNum = 1
      records.value = []
    }

    loading.value.records = true
    try {
      const response = await lifeRecordApi.list(
        {
          categoryId: activeCategoryId.value,
          title: params?.search,
        },
        {
          pageNum: pagination.value.pageNum,
          pageSize: pagination.value.pageSize,
        },
      )

      if (response.code === 200 && response.data) {
        const newRecords = response.data.list

        if (params?.reset) {
          records.value = newRecords
        } else {
          records.value.push(...newRecords)
        }

        pagination.value.total = response.data.total
        pagination.value.hasMore = records.value.length < response.data.total
        pagination.value.pageNum++
      } else {
        throw new Error(response.message || '加载记录失败')
      }
    } finally {
      loading.value.records = false
    }
  }

  // 加载记录详情
  async function loadRecordDetail(id: number): Promise<void> {
    loading.value.detail = true
    try {
      const response = await lifeRecordApi.getInfo(id)
      if (response.code === 200 && response.data) {
        currentRecord.value = response.data
        activeRecordId.value = id
      } else {
        throw new Error(response.message || '加载记录详情失败')
      }
    } finally {
      loading.value.detail = false
    }
  }

  // 新增记录
  async function addRecord(data: LifeRecordParams): Promise<void> {
    const response = await lifeRecordApi.add(data)
    if (response.code === 200) {
      await loadRecords({ reset: true })
      await loadCategories() // 重新加载分类以更新 recordCount
    } else {
      throw new Error(response.message || '新增记录失败')
    }
  }

  // 编辑记录
  async function editRecord(data: LifeRecordParams): Promise<void> {
    const response = await lifeRecordApi.edit(data)
    if (response.code === 200) {
      await loadRecords({ reset: true })

      // 如果是当前记录,重新加载详情
      if (activeRecordId.value === data.id) {
        await loadRecordDetail(data.id!)
      }

      // 如果分类发生变化，重新加载分类以更新 recordCount
      const oldRecord = records.value.find((r) => r.id === data.id)
      if (oldRecord && oldRecord.categoryId !== data.categoryId) {
        await loadCategories()
      }
    } else {
      throw new Error(response.message || '编辑记录失败')
    }
  }

  // 删除记录
  async function deleteRecord(id: number): Promise<void> {
    // 获取要删除的记录信息，提取 attachsId
    const record = records.value.find((r) => r.id === id)
    let fileIds: number[] = []

    if (record?.attachsId) {
      try {
        // 将 attachsId 字符串转换为 number 数组
        fileIds = record.attachsId
          .split(',')
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      } catch (error) {
        console.warn('解析 attachsId 失败:', error)
      }
    }

    const response = await lifeRecordApi.remove({
      ids: [id],
      fileIds: fileIds.length > 0 ? fileIds : undefined,
    })

    if (response.code === 200) {
      await loadRecords({ reset: true })
      await loadCategories() // 重新加载分类以更新 recordCount

      // 如果删除的是当前记录,清空详情
      if (activeRecordId.value === id) {
        activeRecordId.value = null
        currentRecord.value = null
      }
    } else {
      throw new Error(response.message || '删除记录失败')
    }
  }

  // 更新收藏状态
  async function toggleFavorite(id: number, favoriteFlag: number): Promise<void> {
    const response = await lifeRecordApi.updateFavorite(id, favoriteFlag)
    if (response.code === 200) {
      // 更新列表中的记录
      const record = records.value.find((r) => r.id === id)
      if (record) {
        record.favoriteFlag = favoriteFlag
      }

      // 更新当前记录
      if (currentRecord.value?.id === id) {
        currentRecord.value.favoriteFlag = favoriteFlag
      }
    } else {
      throw new Error(response.message || '更新收藏状态失败')
    }
  }

  // 更新评分
  async function updateRating(id: number, rating: number): Promise<void> {
    const response = await lifeRecordApi.updateRaing(id, rating)
    if (response.code === 200) {
      // 更新列表中的记录
      const record = records.value.find((r) => r.id === id)
      if (record) {
        record.rating = rating
      }

      // 更新当前记录
      if (currentRecord.value?.id === id) {
        currentRecord.value.rating = rating
      }
    } else {
      throw new Error(response.message || '更新评分失败')
    }
  }

  // ==================== 初始化 ====================

  async function init(): Promise<void> {
    // 从 localStorage 恢复上次选中的分类
    const savedCategoryId = localStorage.getItem('life-record-active-category')
    if (savedCategoryId) {
      activeCategoryId.value = Number(savedCategoryId)
    }

    // 加载分类列表
    await loadCategories()

    // 如果有选中的分类,加载记录列表
    if (activeCategoryId.value) {
      await loadRecords({ reset: true })
    }
  }

  return {
    // 状态
    categories,
    records,
    activeCategoryId,
    activeRecordId,
    currentRecord,
    pagination,
    loading,

    // 计算属性
    activeCategory,
    activeRecord,

    // 方法
    loadCategories,
    loadRecords,
    loadRecordDetail,
    switchCategory,
    addCategory,
    editCategory,
    deleteCategory,
    updateCategoryOrder,
    addRecord,
    editRecord,
    deleteRecord,
    toggleFavorite,
    updateRating,
    init,
  }
})

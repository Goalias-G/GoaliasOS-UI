/**
 * 生活记录 Store
 *
 * 功能说明:
 * - 管理分类列表和记录列表状态
 * - 时间维度筛选（快捷 pill + 自定义区间）
 * - 处理分类和记录的 CRUD 操作
 * - 管理当前选中状态与详情抽屉
 */
import { defineStore } from 'pinia'
import type {
  LifeCategory,
  LifeRecord,
  LifeCategoryParams,
  LifeRecordParams,
  LifeDatePreset,
} from '@/types/api/life'
import { lifeCategoryApi } from '@/api/modules/lifeCategory.api'
import { lifeRecordApi } from '@/api/modules/lifeRecord.api'

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 根据快捷预设计算 begin/end（含当天） */
export function resolveDateRange(
  preset: LifeDatePreset,
  customBegin?: string | null,
  customEnd?: string | null,
): { beginDate?: string; endDate?: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = formatDate(today)

  switch (preset) {
    case 'today':
      return { beginDate: end, endDate: end }
    case 'week': {
      const start = new Date(today)
      const day = start.getDay() || 7 // 周一为一周开始
      start.setDate(start.getDate() - day + 1)
      return { beginDate: formatDate(start), endDate: end }
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return { beginDate: formatDate(start), endDate: end }
    }
    case 'year': {
      const start = new Date(today.getFullYear(), 0, 1)
      return { beginDate: formatDate(start), endDate: end }
    }
    case 'custom':
      return {
        beginDate: customBegin || undefined,
        endDate: customEnd || undefined,
      }
    case 'all':
    default:
      return {}
  }
}

export const useLifeRecordStore = defineStore('lifeRecord', () => {
  const categories = ref<LifeCategory[]>([])
  const records = ref<LifeRecord[]>([])
  /** null = 全部分类 */
  const activeCategoryId = ref<number | null>(null)
  const activeRecordId = ref<number | null>(null)
  const currentRecord = ref<LifeRecord | null>(null)
  const detailOpen = ref(false)

  const searchKeyword = ref('')
  const datePreset = ref<LifeDatePreset>('all')
  const customBeginDate = ref<string | null>(null)
  const customEndDate = ref<string | null>(null)

  const pagination = ref({
    pageNum: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,
  })

  const loading = ref({
    categories: false,
    records: false,
    detail: false,
  })

  const activeCategory = computed(() =>
    categories.value.find((cat) => cat.id === activeCategoryId.value),
  )

  const activeRecord = computed(() => records.value.find((rec) => rec.id === activeRecordId.value))

  /** 按 recordDate 分组（yyyy-MM-dd），组内保持接口返回顺序 */
  const timelineGroups = computed(() => {
    const groups: { date: string; items: LifeRecord[] }[] = []
    const map = new Map<string, LifeRecord[]>()

    for (const record of records.value) {
      const date =
        record.recordDate?.split(' ')[0]?.split('T')[0] ||
        record.createTime?.split(' ')[0]?.split('T')[0] ||
        '未知日期'
      if (!map.has(date)) {
        map.set(date, [])
        groups.push({ date, items: map.get(date)! })
      }
      map.get(date)!.push(record)
    }
    return groups
  })

  async function loadCategories(): Promise<void> {
    loading.value.categories = true
    try {
      const response = await lifeCategoryApi.list()
      if (response.code === 200 && response.data) {
        categories.value = response.data.list.sort(
          (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
        )
      } else {
        throw new Error(response.message || '加载分类失败')
      }
    } finally {
      loading.value.categories = false
    }
  }

  async function addCategory(data: LifeCategoryParams): Promise<void> {
    const response = await lifeCategoryApi.add(data)
    if (response.code === 200) {
      await loadCategories()
    } else {
      throw new Error(response.message || '新增分类失败')
    }
  }

  async function editCategory(data: LifeCategoryParams): Promise<void> {
    const response = await lifeCategoryApi.edit(data)
    if (response.code === 200) {
      await loadCategories()
    } else {
      throw new Error(response.message || '编辑分类失败')
    }
  }

  async function deleteCategory(id: number): Promise<void> {
    const response = await lifeCategoryApi.remove([id])
    if (response.code === 200) {
      await loadCategories()
      if (activeCategoryId.value === id) {
        await switchCategory(null)
      }
    } else {
      throw new Error(response.message || '删除分类失败')
    }
  }

  async function updateCategoryOrder(
    updates: Array<{ id: number; sortOrder: number; name?: string }>,
  ): Promise<void> {
    await Promise.all(updates.map((update) => lifeCategoryApi.updateOrder(update)))
    await loadCategories()
  }

  async function switchCategory(id: number | null): Promise<void> {
    activeCategoryId.value = id
    activeRecordId.value = null
    currentRecord.value = null
    detailOpen.value = false

    if (id === null) {
      localStorage.removeItem('life-record-active-category')
    } else {
      localStorage.setItem('life-record-active-category', String(id))
    }

    await loadRecords({ reset: true })
  }

  async function setDatePreset(preset: LifeDatePreset): Promise<void> {
    datePreset.value = preset
    if (preset !== 'custom') {
      customBeginDate.value = null
      customEndDate.value = null
    }
    await loadRecords({ reset: true })
  }

  async function setCustomDateRange(begin: string, end: string): Promise<void> {
    datePreset.value = 'custom'
    customBeginDate.value = begin
    customEndDate.value = end
    await loadRecords({ reset: true })
  }

  async function setSearchKeyword(keyword: string): Promise<void> {
    searchKeyword.value = keyword
    await loadRecords({ reset: true })
  }

  async function loadRecords(params?: { reset?: boolean }): Promise<void> {
    // 滚动加载时若已在请求中则跳过；筛选/重置允许打断并重新拉第一页
    if (!params?.reset && loading.value.records) return

    if (params?.reset) {
      pagination.value.pageNum = 1
      records.value = []
      pagination.value.hasMore = true
    }

    loading.value.records = true
    try {
      const range = resolveDateRange(
        datePreset.value,
        customBeginDate.value,
        customEndDate.value,
      )

      const response = await lifeRecordApi.list(
        {
          categoryId: activeCategoryId.value ?? undefined,
          title: searchKeyword.value.trim() || undefined,
          beginDate: range.beginDate,
          endDate: range.endDate,
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

  async function loadRecordDetail(id: number, options?: { openDrawer?: boolean }): Promise<void> {
    // 先用列表数据占位，减少空白闪烁
    const cached = records.value.find((r) => r.id === id)
    if (cached) {
      currentRecord.value = { ...cached }
      activeRecordId.value = id
    }

    if (options?.openDrawer !== false) {
      detailOpen.value = true
    }

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

  function closeDetail(): void {
    detailOpen.value = false
  }

  async function addRecord(data: LifeRecordParams): Promise<void> {
    const response = await lifeRecordApi.add(data)
    if (response.code === 200) {
      await loadRecords({ reset: true })
      await loadCategories()
    } else {
      throw new Error(response.message || '新增记录失败')
    }
  }

  async function editRecord(data: LifeRecordParams): Promise<void> {
    const response = await lifeRecordApi.edit(data)
    if (response.code === 200) {
      await loadRecords({ reset: true })
      if (activeRecordId.value === data.id) {
        await loadRecordDetail(data.id!, { openDrawer: detailOpen.value })
      }
      await loadCategories()
    } else {
      throw new Error(response.message || '编辑记录失败')
    }
  }

  async function deleteRecord(id: number): Promise<void> {
    const record =
      records.value.find((r) => r.id === id) ||
      (currentRecord.value?.id === id ? currentRecord.value : null)
    let fileIds: number[] = []

    if (record?.attachsId) {
      try {
        fileIds = record.attachsId
          .split(',')
          .map((fid) => parseInt(fid.trim(), 10))
          .filter((fid) => !isNaN(fid))
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
      await loadCategories()

      if (activeRecordId.value === id) {
        activeRecordId.value = null
        currentRecord.value = null
        detailOpen.value = false
      }
    } else {
      throw new Error(response.message || '删除记录失败')
    }
  }

  async function toggleFavorite(id: number, favoriteFlag: number): Promise<void> {
    const response = await lifeRecordApi.updateFavorite(id, favoriteFlag)
    if (response.code === 200) {
      const record = records.value.find((r) => r.id === id)
      if (record) record.favoriteFlag = favoriteFlag
      if (currentRecord.value?.id === id) {
        currentRecord.value.favoriteFlag = favoriteFlag
      }
    } else {
      throw new Error(response.message || '更新收藏状态失败')
    }
  }

  async function updateRating(id: number, rating: number): Promise<void> {
    const response = await lifeRecordApi.updateRaing(id, rating)
    if (response.code === 200) {
      const record = records.value.find((r) => r.id === id)
      if (record) record.rating = rating
      if (currentRecord.value?.id === id) {
        currentRecord.value.rating = rating
      }
    } else {
      throw new Error(response.message || '更新评分失败')
    }
  }

  async function init(): Promise<void> {
    const savedCategoryId = localStorage.getItem('life-record-active-category')
    if (savedCategoryId) {
      activeCategoryId.value = Number(savedCategoryId)
    } else {
      activeCategoryId.value = null
    }

    await loadCategories()
    await loadRecords({ reset: true })
  }

  return {
    categories,
    records,
    timelineGroups,
    activeCategoryId,
    activeRecordId,
    currentRecord,
    detailOpen,
    searchKeyword,
    datePreset,
    customBeginDate,
    customEndDate,
    pagination,
    loading,
    activeCategory,
    activeRecord,
    loadCategories,
    loadRecords,
    loadRecordDetail,
    closeDetail,
    switchCategory,
    setDatePreset,
    setCustomDateRange,
    setSearchKeyword,
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

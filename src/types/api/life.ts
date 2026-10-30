/**
 * 生活分类类型
 */
export interface LifeCategory {
  id?: number
  userId?: number
  name: string
  sortOrder?: number
  recordCount?: number
  createTime?: string
  updateTime?: string
}

/** 生活分类参数 */
export interface LifeCategoryParams {
  id?: number
  name?: string
  sortOrder?: number
}

/**
 * 生活记录类型
 */
export interface LifeRecord {
  id?: number
  userId?: number
  categoryId?: number
  categoryName?: string
  title?: string
  content?: string
  rating?: number
  recordDate?: string
  attachsId?: string
  attachsUrls?: string[]
  favoriteFlag?: number
  remark?: string
  createTime?: string
  updateTime?: string
}

/** 生活记录参数 */
export interface LifeRecordParams {
  id?: number
  categoryId?: number
  title?: string
  content?: string
  rating?: number
  recordDate?: string
  attachsId?: string
  favoriteFlag?: number
  remark?: string
}

/** 生活记录列表查询参数 */
export interface LifeRecordQuery {
  categoryId?: number
  title?: string
  favoriteFlag?: number
  /** 记录日期起点 yyyy-MM-dd（含） */
  beginDate?: string
  /** 记录日期终点 yyyy-MM-dd（含） */
  endDate?: string
}

/** 时间筛选快捷类型 */
export type LifeDatePreset = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'

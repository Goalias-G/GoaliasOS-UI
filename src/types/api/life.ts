/**
 * 生活分类类型
 */
export interface LifeCategory {
  id?: number
  userId?: number
  name: string
  order?: number
  createTime?: string
  updateTime?: string
}

/** 生活分类参数 */
export interface LifeCategoryParams {
  id?: number
  name?: string
  order?: number
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

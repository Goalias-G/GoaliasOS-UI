/**
 * 菜谱与食材类型（对齐后端 uapi VO，字段保持 snake_case）
 */

/** 菜谱搜索条目 */
export interface RecipeSearchItem {
  /** 含来源前缀，如 xcf: / dg:，详情需原样传递 */
  id: string
  title: string
  cover?: string
}

/** 菜谱搜索结果 */
export interface RecipeSearchVo {
  keyword?: string
  count?: number
  items?: RecipeSearchItem[]
}

/** 菜谱烹饪步骤 */
export interface RecipeStep {
  step?: number
  text?: string
  image?: string
}

/** 菜谱详情 */
export interface RecipeDetailVo {
  id?: string
  title?: string
  cover?: string
  description?: string
  category?: string
  /** 评分（满分 10） */
  rating?: string
  /** 用料列表，如「鸡蛋 4个」 */
  ingredients?: string[]
  steps?: RecipeStep[]
}

/** 食材搜索条目 */
export interface IngredientSearchItem {
  code: string
  name: string
  /** 每 100g 热量 kcal */
  calory?: string
  weight?: string
  /** 健康灯：1 绿 / 2 黄 / 3 红 */
  health_light?: number
  thumb_image_url?: string
  carbohydrate?: number
}

/** 食材搜索结果 */
export interface IngredientSearchVo {
  keyword?: string
  count?: number
  total_pages?: number
  items?: IngredientSearchItem[]
}

/** 食材家用计量单位 */
export interface IngredientUnit {
  amount?: string
  unit?: string
  weight?: string
  calory?: string
}

/** 食材营养详情 */
export interface IngredientDetailVo {
  code?: string
  name?: string
  calory?: string
  calory_kj?: string
  weight?: string
  health_light?: number
  is_liquid?: boolean
  thumb_image_url?: string
  large_image_url?: string
  protein?: string
  fat?: string
  fiber_dietary?: string
  carbohydrate?: string
  natrium?: string
  gi?: string
  gl?: string
  appraise?: string
  units?: IngredientUnit[]
}

/** 健康灯文案映射 */
export const HEALTH_LIGHT_LABEL: Record<number, string> = {
  1: '推荐',
  2: '适量',
  3: '限制',
}

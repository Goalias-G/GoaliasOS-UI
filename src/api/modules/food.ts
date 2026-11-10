/**
 * 菜谱与食材 API
 *
 * 关联关系：
 * - 菜谱搜索 id → 菜谱详情
 * - 菜谱用料名称 → 食材搜索 / 详情
 * - 食材搜索 code/name → 食材详情
 * - 食材名称 → 菜谱搜索（找相关菜）
 */

import { get } from '@/api'
import type {
  ApiResponse,
  IngredientDetailVo,
  IngredientSearchVo,
  RecipeDetailVo,
  RecipeSearchVo,
} from '@/types'

const BASE = '/life/food'

export const foodApi = {
  /** 菜谱搜索 */
  searchRecipe: (keyword: string) =>
    get<ApiResponse<RecipeSearchVo>>(`${BASE}/recipe/search`, { keyword }),

  /** 菜谱详情（id 原样传递） */
  recipeDetail: (id: string) =>
    get<ApiResponse<RecipeDetailVo>>(`${BASE}/recipe/detail`, { id }),

  /** 食材搜索 */
  searchIngredient: (keyword: string, page?: number) =>
    get<ApiResponse<IngredientSearchVo>>(`${BASE}/ingredient/search`, {
      keyword,
      ...(page != null ? { page } : {}),
    }),

  /** 食材营养详情（name / code 至少其一） */
  ingredientDetail: (params: { name?: string; code?: string }) =>
    get<ApiResponse<IngredientDetailVo>>(`${BASE}/ingredient/detail`, params),
}

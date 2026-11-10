/**
 * 菜谱与食材状态
 *
 * 维护搜索列表、详情面板，以及菜谱 ↔ 食材的交叉跳转上下文。
 */

import { foodApi } from '@/api/modules/food'
import type {
  IngredientDetailVo,
  IngredientSearchItem,
  RecipeDetailVo,
  RecipeSearchItem,
} from '@/types'

export type FoodTab = 'recipe' | 'ingredient'

export const useFoodStore = defineStore('food', () => {
  const activeTab = ref<FoodTab>('recipe')

  // ==================== 菜谱 ====================
  const recipeKeyword = ref('')
  const recipeItems = ref<RecipeSearchItem[]>([])
  const recipeDetail = ref<RecipeDetailVo | null>(null)
  const selectedRecipeId = ref<string | null>(null)

  // ==================== 食材 ====================
  const ingredientKeyword = ref('')
  const ingredientItems = ref<IngredientSearchItem[]>([])
  const ingredientPage = ref(1)
  const ingredientTotalPages = ref(1)
  const ingredientDetail = ref<IngredientDetailVo | null>(null)
  const selectedIngredientCode = ref<string | null>(null)

  /** 交叉跳转提示，如「来自菜谱用料：鸡蛋」 */
  const crossHint = ref<string | null>(null)

  const loading = ref({
    recipeSearch: false,
    recipeDetail: false,
    ingredientSearch: false,
    ingredientDetail: false,
  })

  // ==================== 菜谱方法 ====================
  async function searchRecipes(keyword?: string): Promise<void> {
    const kw = (keyword ?? recipeKeyword.value).trim()
    if (!kw) {
      recipeItems.value = []
      return
    }
    recipeKeyword.value = kw
    loading.value.recipeSearch = true
    try {
      const res = await foodApi.searchRecipe(kw)
      if (res.code === 200) {
        recipeItems.value = res.data?.items ?? []
      } else {
        recipeItems.value = []
        throw new Error(res.message || '菜谱搜索失败')
      }
    } finally {
      loading.value.recipeSearch = false
    }
  }

  async function openRecipeDetail(id: string): Promise<void> {
    selectedRecipeId.value = id
    loading.value.recipeDetail = true
    try {
      const res = await foodApi.recipeDetail(id)
      if (res.code === 200) {
        recipeDetail.value = res.data ?? null
      } else {
        recipeDetail.value = null
        throw new Error(res.message || '获取菜谱详情失败')
      }
    } finally {
      loading.value.recipeDetail = false
    }
  }

  function clearRecipeDetail(): void {
    selectedRecipeId.value = null
    recipeDetail.value = null
  }

  // ==================== 食材方法 ====================
  async function searchIngredients(keyword?: string, page = 1): Promise<void> {
    const kw = (keyword ?? ingredientKeyword.value).trim()
    if (!kw) {
      ingredientItems.value = []
      ingredientTotalPages.value = 1
      ingredientPage.value = 1
      return
    }
    ingredientKeyword.value = kw
    ingredientPage.value = page
    loading.value.ingredientSearch = true
    try {
      const res = await foodApi.searchIngredient(kw, page)
      if (res.code === 200) {
        ingredientItems.value = res.data?.items ?? []
        ingredientTotalPages.value = res.data?.total_pages ?? 1
      } else {
        ingredientItems.value = []
        throw new Error(res.message || '食材搜索失败')
      }
    } finally {
      loading.value.ingredientSearch = false
    }
  }

  async function openIngredientDetail(params: { code?: string; name?: string }): Promise<void> {
    selectedIngredientCode.value = params.code ?? null
    loading.value.ingredientDetail = true
    try {
      const res = await foodApi.ingredientDetail(params)
      if (res.code === 200) {
        ingredientDetail.value = res.data ?? null
        if (res.data?.code) selectedIngredientCode.value = res.data.code
      } else {
        ingredientDetail.value = null
        throw new Error(res.message || '获取食材详情失败')
      }
    } finally {
      loading.value.ingredientDetail = false
    }
  }

  function clearIngredientDetail(): void {
    selectedIngredientCode.value = null
    ingredientDetail.value = null
  }

  // ==================== 交叉关联 ====================
  /** 从菜谱用料跳到食材：切 Tab + 搜索 + 尝试打开详情 */
  async function jumpToIngredientFromRecipe(rawIngredient: string): Promise<void> {
    const name = extractIngredientName(rawIngredient)
    if (!name) return
    crossHint.value = `来自菜谱用料：${rawIngredient}`
    activeTab.value = 'ingredient'
    clearIngredientDetail()
    await searchIngredients(name, 1)
    const exact = ingredientItems.value.find((i) => i.name === name)
    const target = exact ?? ingredientItems.value[0]
    if (target) {
      await openIngredientDetail({ code: target.code, name: target.name })
    } else {
      await openIngredientDetail({ name })
    }
  }

  /** 从食材跳到菜谱：用食材名搜索相关菜 */
  async function jumpToRecipeFromIngredient(name: string): Promise<void> {
    const kw = name.trim()
    if (!kw) return
    crossHint.value = `用「${kw}」查找相关菜谱`
    activeTab.value = 'recipe'
    clearRecipeDetail()
    await searchRecipes(kw)
  }

  function clearCrossHint(): void {
    crossHint.value = null
  }

  function switchTab(tab: FoodTab): void {
    activeTab.value = tab
  }

  return {
    activeTab,
    recipeKeyword,
    recipeItems,
    recipeDetail,
    selectedRecipeId,
    ingredientKeyword,
    ingredientItems,
    ingredientPage,
    ingredientTotalPages,
    ingredientDetail,
    selectedIngredientCode,
    crossHint,
    loading,
    searchRecipes,
    openRecipeDetail,
    clearRecipeDetail,
    searchIngredients,
    openIngredientDetail,
    clearIngredientDetail,
    jumpToIngredientFromRecipe,
    jumpToRecipeFromIngredient,
    clearCrossHint,
    switchTab,
  }
})

/** 从「鸡蛋 4个」一类用料文案中提取食材名 */
export function extractIngredientName(raw: string): string {
  const text = raw.trim()
  if (!text) return ''
  // 常见：名称 + 空格 + 用量；或名称+数字
  const spaced = text.split(/\s+/)[0] ?? text
  const withoutAmount = spaced.replace(/[\d./]+.*$/, '').trim()
  return withoutAmount || spaced
}

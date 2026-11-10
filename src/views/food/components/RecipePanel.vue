<script setup lang="ts">
/**
 * 菜谱面板：搜索列表 + 详情；用料可跳转食材
 */
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'

const store = useFoodStore()
const {
  recipeKeyword,
  recipeItems,
  recipeDetail,
  selectedRecipeId,
  loading,
} = storeToRefs(store)

const localKeyword = ref(recipeKeyword.value)
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

const showDetailPane = computed(() => {
  if (!selectedRecipeId.value) return false
  return !isMobile.value || !!recipeDetail.value
})

const handleSearch = useDebounceFn(async (keyword: string) => {
  try {
    await store.searchRecipes(keyword)
  } catch (e: any) {
    showError(e.message || '菜谱搜索失败')
  }
}, 350)

watch(localKeyword, (v) => {
  // 避免交叉跳转/回填 store 时重复打搜索接口
  if (v.trim() === recipeKeyword.value.trim()) return
  handleSearch(v)
})
watch(recipeKeyword, (v) => {
  if (v !== localKeyword.value) localKeyword.value = v
})

async function selectRecipe(id: string) {
  try {
    await store.openRecipeDetail(id)
  } catch (e: any) {
    showError(e.message || '获取菜谱详情失败')
  }
}

function closeDetail() {
  store.clearRecipeDetail()
}

async function onIngredientClick(raw: string) {
  try {
    await store.jumpToIngredientFromRecipe(raw)
  } catch (e: any) {
    showError(e.message || '跳转食材失败')
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[60vh]">
    <!-- 搜索与列表 -->
    <div
      class="lg:col-span-2 clay-card p-4 flex flex-col gap-4"
      :class="{ hidden: isMobile && showDetailPane }"
    >
      <div class="relative">
        <AppIcon
          icon="mdi:magnify"
          :size="18"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-clay-text-muted"
        />
        <input
          v-model="localKeyword"
          type="search"
          maxlength="64"
          placeholder="搜菜名或食材，如：番茄炒蛋、鸡蛋"
          class="clay-input w-full pl-10"
          @keydown.enter.prevent="handleSearch(localKeyword)"
        />
      </div>

      <p class="text-xs text-clay-text-muted">
        支持菜名或食材关键词；从食材详情可一键带回这里找相关菜。
      </p>

      <div v-if="loading.recipeSearch" class="flex-1 flex items-center justify-center py-16">
        <AppIcon icon="mdi:loading" :size="28" class="animate-spin text-clay-primary" />
      </div>

      <div
        v-else-if="!recipeItems.length"
        class="flex-1 flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          class="w-20 h-20 rounded-full bg-clay-bg-elevated shadow-clay-card flex items-center justify-center mb-4"
        >
          <AppIcon icon="hugeicons:restaurant-01" :size="36" class="text-clay-text-muted" />
        </div>
        <p class="text-clay-text-secondary text-sm">
          {{ recipeKeyword ? '未找到相关菜谱' : '输入关键词开始搜索菜谱' }}
        </p>
      </div>

      <ul v-else class="flex-1 overflow-y-auto space-y-2 max-h-[70vh] pr-1">
        <li v-for="item in recipeItems" :key="item.id">
          <button
            type="button"
            class="w-full flex items-center gap-3 p-2.5 rounded-clay-md text-left transition-all"
            :class="
              selectedRecipeId === item.id
                ? 'bg-clay-primary/15 shadow-clay-button ring-1 ring-clay-primary/30'
                : 'hover:bg-clay-bg-base'
            "
            @click="selectRecipe(item.id)"
          >
            <img
              v-if="item.cover"
              :src="item.cover"
              :alt="item.title"
              class="w-14 h-14 rounded-clay-sm object-cover bg-clay-bg-base shrink-0"
              loading="lazy"
            />
            <div
              v-else
              class="w-14 h-14 rounded-clay-sm bg-clay-bg-base flex items-center justify-center shrink-0"
            >
              <AppIcon icon="mdi:food" :size="24" class="text-clay-text-muted" />
            </div>
            <span class="text-sm font-medium text-clay-text-primary line-clamp-2">
              {{ item.title }}
            </span>
          </button>
        </li>
      </ul>
    </div>

    <!-- 详情 -->
    <div
      class="lg:col-span-3 clay-card p-4 md:p-5 overflow-y-auto max-h-[80vh]"
      :class="{ hidden: isMobile && !showDetailPane }"
    >
      <div v-if="loading.recipeDetail" class="flex items-center justify-center py-24">
        <AppIcon icon="mdi:loading" :size="32" class="animate-spin text-clay-primary" />
      </div>

      <div
        v-else-if="!recipeDetail"
        class="flex flex-col items-center justify-center py-24 text-center"
      >
        <AppIcon icon="mdi:book-open-page-variant-outline" :size="48" class="text-clay-text-muted mb-3" />
        <p class="text-clay-text-secondary text-sm">选择一道菜谱查看做法与用料</p>
      </div>

      <div v-else class="space-y-5">
        <div class="flex items-start gap-3">
          <button
            v-if="isMobile"
            type="button"
            class="clay-btn-secondary p-2 shrink-0"
            aria-label="返回列表"
            @click="closeDetail"
          >
            <AppIcon icon="mdi:arrow-left" :size="18" />
          </button>
          <div class="min-w-0 flex-1">
            <h3 class="text-xl font-bold text-clay-text-primary leading-snug">
              {{ recipeDetail.title }}
            </h3>
            <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-clay-text-secondary">
              <span
                v-if="recipeDetail.category"
                class="px-2 py-0.5 rounded-full bg-clay-bg-base"
              >
                {{ recipeDetail.category }}
              </span>
              <span
                v-if="recipeDetail.rating"
                class="inline-flex items-center gap-1 text-amber-600"
              >
                <AppIcon icon="mdi:star" :size="14" />
                {{ recipeDetail.rating }}/10
              </span>
            </div>
          </div>
        </div>

        <img
          v-if="recipeDetail.cover"
          :src="recipeDetail.cover"
          :alt="recipeDetail.title"
          class="w-full max-h-64 object-cover rounded-clay-md"
        />

        <p v-if="recipeDetail.description" class="text-sm text-clay-text-secondary leading-relaxed">
          {{ recipeDetail.description }}
        </p>

        <!-- 用料 → 可跳食材 -->
        <section v-if="recipeDetail.ingredients?.length">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold text-clay-text-primary flex items-center gap-2">
              <AppIcon icon="mdi:carrot" :size="18" />
              用料
            </h4>
            <span class="text-xs text-clay-text-muted">点击用料查看营养</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(ing, idx) in recipeDetail.ingredients"
              :key="idx"
              type="button"
              class="px-3 py-1.5 rounded-clay-sm bg-clay-bg-base text-sm text-clay-text-primary hover:bg-clay-primary/15 hover:text-clay-primary transition-colors"
              @click="onIngredientClick(ing)"
            >
              {{ ing }}
            </button>
          </div>
        </section>

        <!-- 步骤 -->
        <section v-if="recipeDetail.steps?.length">
          <h4 class="font-semibold text-clay-text-primary flex items-center gap-2 mb-3">
            <AppIcon icon="mdi:format-list-numbered" :size="18" />
            做法
          </h4>
          <ol class="space-y-4">
            <li
              v-for="step in recipeDetail.steps"
              :key="step.step"
              class="flex gap-3"
            >
              <span
                class="shrink-0 w-7 h-7 rounded-full bg-clay-primary text-orange-400 text-sm font-bold flex items-center justify-center shadow-clay-button"
              >
                {{ step.step }}
              </span>
              <div class="min-w-0 flex-1 space-y-2">
                <p class="text-sm text-clay-text-primary leading-relaxed">{{ step.text }}</p>
                <img
                  v-if="step.image"
                  :src="step.image"
                  :alt="`步骤 ${step.step}`"
                  class="w-full max-w-sm rounded-clay-sm object-cover"
                  loading="lazy"
                />
              </div>
            </li>
          </ol>
        </section>
      </div>
    </div>
  </div>
</template>

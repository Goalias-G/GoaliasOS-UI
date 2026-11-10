<script setup lang="ts">
/**
 * 食材菜谱主页面
 *
 * - Tab：菜谱搜索 / 食材营养
 * - 菜谱用料 ↔ 食材详情、食材名称 ↔ 相关菜谱 交叉跳转
 */
import { storeToRefs } from 'pinia'
import type { FoodTab } from '@/stores/food'
import RecipePanel from './components/RecipePanel.vue'
import IngredientPanel from './components/IngredientPanel.vue'

const store = useFoodStore()
const { activeTab, crossHint } = storeToRefs(store)

const tabs: { id: FoodTab; label: string; icon: string }[] = [
  { id: 'recipe', label: '菜谱搜索', icon: 'hugeicons:restaurant-01' },
  { id: 'ingredient', label: '食材营养', icon: 'mdi:food-apple-outline' },
]

function switchTab(tab: FoodTab) {
  store.switchTab(tab)
  store.clearCrossHint()
}
</script>

<template>
  <div class="h-full bg-clay-bg-base overflow-auto">
    <div class="mx-auto p-4 md:p-6">
      <div class="mb-5">
        <h2 class="clay-section-title">食材菜谱</h2>
      </div>

      <!-- 交叉跳转提示 -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        leave-active-class="transition-all duration-150 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-if="crossHint"
          class="mb-4 clay-card px-4 py-3 flex items-center gap-3 text-sm text-clay-text-primary"
        >
          <AppIcon icon="mdi:swap-horizontal" :size="18" class="text-clay-primary shrink-0" />
          <span class="flex-1">{{ crossHint }}</span>
          <button
            type="button"
            class="text-clay-text-muted hover:text-clay-text-primary p-1"
            aria-label="关闭提示"
            @click="store.clearCrossHint()"
          >
            <AppIcon icon="mdi:close" :size="16" />
          </button>
        </div>
      </Transition>

      <!-- Tab -->
      <div class="clay-card p-1.5 md:p-2 mb-5" role="tablist">
        <div class="flex gap-1.5 md:gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            role="tab"
            :aria-selected="activeTab === tab.id"
            class="flex-1 px-3 md:px-4 py-2.5 md:py-3 rounded-clay-md font-medium transition-all flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base"
            :class="[
              activeTab === tab.id
                ? 'bg-clay-primary text-orange-400 shadow-clay-button'
                : 'text-clay-text-secondary hover:bg-clay-bg-base hover:text-clay-text-primary',
            ]"
            @click="switchTab(tab.id)"
          >
            <AppIcon :icon="tab.icon" :size="18" />
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <Transition name="fade" mode="out-in">
        <div v-if="activeTab === 'recipe'" key="recipe" role="tabpanel">
          <RecipePanel />
        </div>
        <div v-else key="ingredient" role="tabpanel">
          <IngredientPanel />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
/**
 * 食材面板：分页搜索 + 营养详情；可跳转相关菜谱
 */
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import HealthLightBadge from './HealthLightBadge.vue'

const store = useFoodStore()
const {
  ingredientKeyword,
  ingredientItems,
  ingredientPage,
  ingredientTotalPages,
  ingredientDetail,
  selectedIngredientCode,
  loading,
} = storeToRefs(store)

const localKeyword = ref(ingredientKeyword.value)
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

const handleSearch = useDebounceFn(async (keyword: string) => {
  try {
    await store.searchIngredients(keyword, 1)
  } catch (e: any) {
    showError(e.message || '食材搜索失败')
  }
}, 350)

watch(localKeyword, (v) => {
  if (v.trim() === ingredientKeyword.value.trim()) return
  handleSearch(v)
})
watch(ingredientKeyword, (v) => {
  if (v !== localKeyword.value) localKeyword.value = v
})

async function selectIngredient(code: string, name: string) {
  try {
    await store.openIngredientDetail({ code, name })
  } catch (e: any) {
    showError(e.message || '获取食材详情失败')
  }
}

function closeDetail() {
  store.clearIngredientDetail()
}

async function changePage(delta: number) {
  const next = ingredientPage.value + delta
  if (next < 1 || next > ingredientTotalPages.value) return
  try {
    await store.searchIngredients(undefined, next)
  } catch (e: any) {
    showError(e.message || '翻页失败')
  }
}

async function findRecipes() {
  const name = ingredientDetail.value?.name
  if (!name) return
  try {
    await store.jumpToRecipeFromIngredient(name)
  } catch (e: any) {
    showError(e.message || '查找菜谱失败')
  }
}

const nutritionRows = computed(() => {
  const d = ingredientDetail.value
  if (!d) return []
  return [
    { label: '热量', value: d.calory ? `${d.calory} kcal` : null, sub: d.calory_kj ? `${d.calory_kj} kJ` : null },
    { label: '蛋白质', value: d.protein ? `${d.protein} g` : null },
    { label: '脂肪', value: d.fat ? `${d.fat} g` : null },
    { label: '碳水', value: d.carbohydrate ? `${d.carbohydrate} g` : null },
    { label: '膳食纤维', value: d.fiber_dietary ? `${d.fiber_dietary} g` : null },
    { label: '钠', value: d.natrium ? `${d.natrium} mg` : null },
    { label: 'GI', value: d.gi || null },
    { label: 'GL', value: d.gl || null },
  ].filter((r) => r.value)
})

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
      :class="{ hidden: isMobile && !!(ingredientDetail || loading.ingredientDetail) }"
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
          placeholder="搜食材，如：西兰花、牛奶"
          class="clay-input w-full pl-10"
          @keydown.enter.prevent="handleSearch(localKeyword)"
        />
      </div>

      <p class="text-xs text-clay-text-muted">
        选择食材查看每 100g 营养；也可从菜谱用料跳转至此。
      </p>

      <div v-if="loading.ingredientSearch" class="flex-1 flex items-center justify-center py-16">
        <AppIcon icon="mdi:loading" :size="28" class="animate-spin text-clay-primary" />
      </div>

      <div
        v-else-if="!ingredientItems.length"
        class="flex-1 flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          class="w-20 h-20 rounded-full bg-clay-bg-elevated shadow-clay-card flex items-center justify-center mb-4"
        >
          <AppIcon icon="mdi:food-apple-outline" :size="36" class="text-clay-text-muted" />
        </div>
        <p class="text-clay-text-secondary text-sm">
          {{ ingredientKeyword ? '未找到相关食材' : '输入关键词开始搜索食材' }}
        </p>
      </div>

      <template v-else>
        <ul class="flex-1 overflow-y-auto space-y-2 max-h-[60vh] pr-1">
          <li v-for="item in ingredientItems" :key="item.code">
            <button
              type="button"
              class="w-full flex items-center gap-3 p-2.5 rounded-clay-md text-left transition-all"
              :class="
                selectedIngredientCode === item.code
                  ? 'bg-clay-primary/15 shadow-clay-button ring-1 ring-clay-primary/30'
                  : 'hover:bg-clay-bg-base'
              "
              @click="selectIngredient(item.code, item.name)"
            >
              <img
                v-if="item.thumb_image_url"
                :src="item.thumb_image_url"
                :alt="item.name"
                class="w-12 h-12 rounded-clay-sm object-cover bg-clay-bg-base shrink-0"
                loading="lazy"
              />
              <div
                v-else
                class="w-12 h-12 rounded-clay-sm bg-clay-bg-base flex items-center justify-center shrink-0"
              >
                <AppIcon icon="mdi:leaf" :size="20" class="text-clay-text-muted" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm font-medium text-clay-text-primary truncate">
                    {{ item.name }}
                  </span>
                  <HealthLightBadge :light="item.health_light" />
                </div>
                <p class="text-xs text-clay-text-muted mt-0.5">
                  <template v-if="item.calory">{{ item.calory }} kcal / {{ item.weight || 100 }}g</template>
                  <template v-if="item.carbohydrate != null">
                    · 碳水 {{ item.carbohydrate }}g
                  </template>
                </p>
              </div>
            </button>
          </li>
        </ul>

        <div
          v-if="ingredientTotalPages > 1"
          class="flex items-center justify-between pt-2 border-t border-black/5"
        >
          <button
            type="button"
            class="clay-btn-secondary px-3 py-1.5 text-sm"
            :disabled="ingredientPage <= 1 || loading.ingredientSearch"
            @click="changePage(-1)"
          >
            上一页
          </button>
          <span class="text-xs text-clay-text-secondary">
            {{ ingredientPage }} / {{ ingredientTotalPages }}
          </span>
          <button
            type="button"
            class="clay-btn-secondary px-3 py-1.5 text-sm"
            :disabled="ingredientPage >= ingredientTotalPages || loading.ingredientSearch"
            @click="changePage(1)"
          >
            下一页
          </button>
        </div>
      </template>
    </div>

    <!-- 详情 -->
    <div
      class="lg:col-span-3 clay-card p-4 md:p-5 overflow-y-auto max-h-[80vh]"
      :class="{
        hidden: isMobile && !ingredientDetail && !loading.ingredientDetail,
      }"
    >
      <div v-if="loading.ingredientDetail" class="flex items-center justify-center py-24">
        <AppIcon icon="mdi:loading" :size="32" class="animate-spin text-clay-primary" />
      </div>

      <div
        v-else-if="!ingredientDetail"
        class="flex flex-col items-center justify-center py-24 text-center"
      >
        <AppIcon icon="mdi:nutrition" :size="48" class="text-clay-text-muted mb-3" />
        <p class="text-clay-text-secondary text-sm">选择一种食材查看营养构成</p>
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
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-xl font-bold text-clay-text-primary">
                {{ ingredientDetail.name }}
              </h3>
              <HealthLightBadge :light="ingredientDetail.health_light" />
            </div>
            <p v-if="ingredientDetail.appraise" class="mt-1 text-sm text-clay-text-secondary">
              {{ ingredientDetail.appraise }}
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
          <img
            v-if="ingredientDetail.large_image_url || ingredientDetail.thumb_image_url"
            :src="ingredientDetail.large_image_url || ingredientDetail.thumb_image_url"
            :alt="ingredientDetail.name"
            class="w-full sm:w-40 h-40 object-cover rounded-clay-md bg-clay-bg-base shrink-0"
          />
          <div class="flex-1 space-y-3">
            <p class="text-xs text-clay-text-muted">
              营养基准：每 {{ ingredientDetail.weight || 100 }}g
              <span v-if="ingredientDetail.is_liquid" class="ml-2">· 液体</span>
            </p>
            <button type="button" class="clay-btn px-4 py-2 text-sm inline-flex items-center gap-2" @click="findRecipes">
              <AppIcon icon="hugeicons:restaurant-01" :size="16" />
              用此食材找菜谱
            </button>
          </div>
        </div>

        <section v-if="nutritionRows.length">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              v-for="row in nutritionRows"
              :key="row.label"
              class="rounded-clay-md bg-clay-bg-base p-3"
            >
              <p class="text-xs text-clay-text-muted">{{ row.label }}</p>
              <p class="text-sm font-semibold text-clay-text-primary mt-1">{{ row.value }}</p>
              <p v-if="row.sub" class="text-xs text-clay-text-muted mt-0.5">{{ row.sub }}</p>
            </div>
          </div>
        </section>

        <section v-if="ingredientDetail.units?.length">
          <h4 class="font-semibold text-clay-text-primary mb-3 flex items-center gap-2">
            <AppIcon icon="mdi:cup" :size="18" />
            家用计量
          </h4>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-clay-text-muted border-b border-black/5">
                  <th class="py-2 pr-3 font-medium">计量</th>
                  <th class="py-2 pr-3 font-medium">克重</th>
                  <th class="py-2 font-medium">热量</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(u, i) in ingredientDetail.units"
                  :key="i"
                  class="border-b border-black/5 text-clay-text-primary"
                >
                  <td class="py-2.5 pr-3">{{ u.amount }}{{ u.unit }}</td>
                  <td class="py-2.5 pr-3">{{ u.weight }}g</td>
                  <td class="py-2.5">{{ u.calory }} kcal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

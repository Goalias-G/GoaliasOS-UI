<script setup lang="ts">
/**
 * RecordTabs 组件 - 记录与提升
 *
 * 功能说明：
 * - 提供三个标签页：健康填写进度、历史知识、历史心理学
 * - 管理标签页切换逻辑
 * - 懒加载标签页内容（仅在激活时加载）
 * - 健康填写进度：统计健康数据的填写状态，使用环形进度图展示
 * - 历史知识：展示历史知识记录列表，支持分页和展开/折叠
 * - 历史心理学：展示历史心理学记录列表，支持分页和展开/折叠
 */

import type { DailyHealth, DailyKnowledge } from '@/types'
import { dailyKnowledgeApi } from '@/api/modules/home'

// ==================== 注入父组件提供的 healthData ====================
const healthDataRef = inject<Ref<DailyHealth | null>>('healthData')!

// ==================== 响应式状态 ====================
const activeTab = ref<'progress' | 'knowledge' | 'psychology'>('progress')
const loadedTabs = ref<Set<string>>(new Set(['progress']))

// ==================== 标签页配置 ====================
const tabs = [
  { id: 'progress' as const, label: '生活记录', icon: 'hugeicons:health' },
  { id: 'psychology' as const, label: '每日心理', icon: 'hugeicons:brain-02' },
  { id: 'knowledge' as const, label: '每日知识', icon: 'hugeicons:book-02' },
]

// ==================== 方法 ====================
function switchTab(tab: 'progress' | 'knowledge' | 'psychology') {
  activeTab.value = tab
  // 懒加载：首次切换到标签页时加载数据
  if (!loadedTabs.value.has(tab)) {
    loadedTabs.value.add(tab)
    if (tab === 'knowledge') {
      loadKnowledgeList()
    } else if (tab === 'psychology') {
      loadPsychologyList()
    }
  }
}

// ==================== 健康填写进度子组件 ====================
const healthFields = [
  { key: 'upTime', label: '起床时间', icon: 'mdi:clock-outline' },
  { key: 'sleepTime', label: '睡眠时间', icon: 'mdi:sleep' },
  { key: 'food', label: '饮食分享', icon: 'mdi:food' },
  { key: 'exercise', label: '运动记录', icon: 'mdi:dumbbell' },
  // { key: 'remark', label: '备注信息', icon: 'mdi:text-box-outline' },
]

// 计算健康填写进度
const filledFields = computed(() => {
  if (!healthDataRef.value) return []
  return healthFields.filter((field) => {
    const value = healthDataRef.value?.[field.key as keyof DailyHealth]
    return value !== null && value !== undefined && value !== ''
  })
})

const completionRate = computed(() => {
  if (!healthDataRef.value) return 0
  return Math.round((filledFields.value.length / healthFields.length) * 100)
})

// 判断字段是否已填写
function isFieldFilled(key: string): boolean {
  if (!healthDataRef.value) return false
  const value = healthDataRef.value[key as keyof DailyHealth]
  return value !== null && value !== undefined && value !== ''
}

// ==================== 历史知识子组件 ====================
const knowledgeList = ref<DailyKnowledge[]>([])
const knowledgeLoading = ref(false)
const knowledgePage = ref(1)
const knowledgePageSize = ref(10)
const knowledgeTotal = ref(0)
const expandedKnowledgeItems = ref<Set<number>>(new Set())

async function loadKnowledgeList() {
  if (knowledgeLoading.value) return

  knowledgeLoading.value = true
  try {
    console.log('加载历史知识列表，页码:', knowledgePage.value)
    const response = await dailyKnowledgeApi.list(
      { type: 'knowledge' },
      { pageNum: knowledgePage.value, pageSize: knowledgePageSize.value },
    )
    console.log('历史知识列表响应:', response)
    if (response.code === 200 && response.data) {
      knowledgeList.value = response.data.list
      knowledgeTotal.value = response.data.total
    } else {
      showError('加载知识列表失败')
    }
  } catch (error) {
    console.error('加载知识列表失败:', error)
    showError('加载知识列表失败，请重试')
  } finally {
    knowledgeLoading.value = false
  }
}

// 分页方法
function handleKnowledgePageChange(page: number) {
  knowledgePage.value = page
  loadKnowledgeList()
}

function toggleKnowledgeExpand(id: number) {
  if (expandedKnowledgeItems.value.has(id)) {
    expandedKnowledgeItems.value.delete(id)
  } else {
    expandedKnowledgeItems.value.add(id)
  }
  // 触发响应式更新
  expandedKnowledgeItems.value = new Set(expandedKnowledgeItems.value)
}

// ==================== 历史心理学子组件 ====================
const psychologyList = ref<DailyKnowledge[]>([])
const psychologyLoading = ref(false)
const psychologyPage = ref(1)
const psychologyPageSize = ref(10)
const psychologyTotal = ref(0)
const expandedPsychologyItems = ref<Set<number>>(new Set())

async function loadPsychologyList() {
  if (psychologyLoading.value) return

  psychologyLoading.value = true
  try {
    const response = await dailyKnowledgeApi.list(
      { type: 'psychology' },
      { pageNum: psychologyPage.value, pageSize: psychologyPageSize.value },
    )
    if (response.code === 200 && response.data) {
      psychologyList.value = response.data.list
      psychologyTotal.value = response.data.total
    } else {
      showError('加载心理学列表失败')
    }
  } catch (error) {
    console.error('加载心理学列表失败:', error)
    showError('加载心理学列表失败，请重试')
  } finally {
    psychologyLoading.value = false
  }
}

// 分页方法
function handlePsychologyPageChange(page: number) {
  psychologyPage.value = page
  loadPsychologyList()
}

function togglePsychologyExpand(id: number) {
  if (expandedPsychologyItems.value.has(id)) {
    expandedPsychologyItems.value.delete(id)
  } else {
    expandedPsychologyItems.value.add(id)
  }
  // 触发响应式更新
  expandedPsychologyItems.value = new Set(expandedPsychologyItems.value)
}

// ==================== 生命周期 ====================
// 监听标签页切换，触发懒加载
watch(activeTab, (newTab) => {
  if (newTab === 'knowledge' && !loadedTabs.value.has('knowledge')) {
    loadKnowledgeList()
  } else if (newTab === 'psychology' && !loadedTabs.value.has('psychology')) {
    loadPsychologyList()
  }
})
</script>

<template>
  <div class="record-tabs">
    <!-- 标签页头部 -->
    <div class="clay-card p-2 mb-6" role="tablist" aria-label="记录与提升标签页">
      <div class="flex gap-2 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :aria-controls="`panel-${tab.id}`"
          class="flex-1 min-w-[120px] px-4 py-3 rounded-clay-md font-medium transition-all flex items-center justify-center gap-2"
          :class="[
            activeTab === tab.id
              ? 'bg-clay-primary shadow-clay-button'
              : 'text-clay-text-secondary hover:bg-clay-bg-base hover:text-clay-text-primary',
          ]"
          @click="switchTab(tab.id)"
        >
          <AppIcon :icon="tab.icon" :size="20" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="tab-content">
      <!-- 健康填写进度 -->
      <Transition name="fade" mode="out-in">
        <div
          v-if="activeTab === 'progress'"
          id="panel-progress"
          role="tabpanel"
          :aria-hidden="activeTab !== 'progress'"
          class="clay-card p-6"
        >
          <h3 class="text-lg font-bold text-clay-text-primary mb-6">记录进度</h3>

          <!-- 环形进度图 -->
          <div class="flex justify-center mb-8">
            <div class="relative w-48 h-48">
              <svg class="w-full h-full transform -rotate-90">
                <!-- 背景圆环 -->
                <circle
                  cx="96"
                  cy="96"
                  r="84"
                  stroke="currentColor"
                  stroke-width="12"
                  fill="none"
                  class="text-clay-bg-base"
                />
                <!-- 进度圆环 -->
                <circle
                  cx="96"
                  cy="96"
                  r="84"
                  stroke="currentColor"
                  stroke-width="12"
                  fill="none"
                  stroke-linecap="round"
                  class="text-clay-primary transition-all duration-1000 ease-out"
                  :stroke-dasharray="`${2 * Math.PI * 84}`"
                  :stroke-dashoffset="`${2 * Math.PI * 84 * (1 - completionRate / 100)}`"
                />
              </svg>
              <!-- 中心文字 -->
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <div class="text-4xl font-bold text-clay-text-primary">{{ completionRate }}%</div>
                <div class="text-sm text-clay-text-secondary mt-1">完成度</div>
              </div>
            </div>
          </div>

          <!-- 字段列表 -->
          <div class="space-y-3">
            <div
              v-for="field in healthFields"
              :key="field.key"
              class="flex items-center gap-4 p-4 rounded-clay-sm transition-colors"
              :class="isFieldFilled(field.key) ? 'bg-clay-bg-elevated' : 'bg-clay-bg-base'"
            >
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                :class="isFieldFilled(field.key) ? 'bg-clay-primary/10' : 'bg-clay-text-muted/10'"
              >
                <AppIcon
                  :icon="isFieldFilled(field.key) ? 'mdi:check' : field.icon"
                  :size="20"
                  :class="isFieldFilled(field.key) ? 'text-clay-primary' : 'text-clay-text-muted'"
                />
              </div>
              <div class="flex-1">
                <div
                  class="font-medium"
                  :class="
                    isFieldFilled(field.key) ? 'text-clay-text-primary' : 'text-clay-text-muted'
                  "
                >
                  {{ field.label }}
                </div>
                <div v-if="isFieldFilled(field.key)" class="text-sm text-clay-text-secondary">
                  {{ healthDataRef?.[field.key as keyof DailyHealth] }}
                </div>
                <div v-else class="text-sm text-clay-text-muted">未填写</div>
              </div>
              <div
                class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                :class="
                  isFieldFilled(field.key)
                    ? 'border-clay-primary bg-clay-primary'
                    : 'border-clay-text-muted'
                "
              >
                <AppIcon
                  v-if="isFieldFilled(field.key)"
                  icon="mdi:check"
                  :size="14"
                  class="text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 历史知识 -->
      <Transition name="fade" mode="out-in">
        <div
          v-if="activeTab === 'knowledge'"
          id="panel-knowledge"
          role="tabpanel"
          :aria-hidden="activeTab !== 'knowledge'"
          class="clay-card p-6"
        >
          <h3 class="text-lg font-bold text-clay-text-primary mb-6">历史知识</h3>

          <!-- 加载状态 -->
          <div v-if="knowledgeLoading" class="flex items-center justify-center py-12">
            <div
              class="w-8 h-8 border-4 border-clay-primary/20 border-t-clay-primary rounded-full animate-spin"
            ></div>
          </div>

          <!-- 知识列表 -->
          <div v-else-if="knowledgeList.length > 0" class="space-y-4">
            <div
              v-for="item in knowledgeList"
              :key="item.id"
              class="border border-clay-bg-base rounded-clay-md overflow-hidden transition-shadow hover:shadow-clay-card cursor-pointer"
              @click="toggleKnowledgeExpand(item.id)"
            >
              <div class="flex items-start gap-4 p-4">
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-clay-text-primary mb-2 line-clamp-2">
                    {{ item.title || '无标题' }}
                  </h4>
                  <div v-if="item.createTime" class="text-sm text-clay-text-secondary">
                    {{ item.createTime }}
                  </div>
                </div>
                <AppIcon
                  :icon="
                    expandedKnowledgeItems.has(item.id) ? 'mdi:chevron-up' : 'mdi:chevron-down'
                  "
                  :size="20"
                  class="text-clay-text-secondary shrink-0 mt-1"
                />
              </div>
              <Transition name="expand">
                <div v-if="expandedKnowledgeItems.has(item.id)" class="px-4 pb-4">
                  <div
                    class="pt-4 border-t border-clay-bg-base text-clay-text-primary whitespace-pre-wrap leading-relaxed"
                  >
                    {{ item.content || '暂无内容' }}
                  </div>
                </div>
              </Transition>
            </div>

            <!-- 分页 -->
            <div v-if="knowledgeTotal > knowledgePageSize" class="flex justify-center pt-4">
              <div class="flex items-center gap-2">
                <button
                  @click="handleKnowledgePageChange(knowledgePage - 1)"
                  :disabled="knowledgePage === 1"
                  class="px-4 py-2 rounded-clay-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="
                    knowledgePage === 1
                      ? 'text-clay-text-muted'
                      : 'bg-clay-bg-base text-clay-text-primary hover:bg-clay-primary hover:text-white'
                  "
                >
                  <AppIcon icon="mdi:chevron-left" :size="20" />
                </button>
                <div class="flex items-center gap-1">
                  <button
                    v-for="page in Math.ceil(knowledgeTotal / knowledgePageSize)"
                    :key="page"
                    @click="handleKnowledgePageChange(page)"
                    class="w-10 h-10 rounded-clay-sm transition-colors font-medium"
                    :class="
                      knowledgePage === page
                        ? 'bg-clay-primary text-white shadow-clay-button'
                        : 'bg-clay-bg-base text-clay-text-primary hover:bg-clay-bg-elevated'
                    "
                  >
                    {{ page }}
                  </button>
                </div>
                <button
                  @click="handleKnowledgePageChange(knowledgePage + 1)"
                  :disabled="knowledgePage === Math.ceil(knowledgeTotal / knowledgePageSize)"
                  class="px-4 py-2 rounded-clay-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="
                    knowledgePage === Math.ceil(knowledgeTotal / knowledgePageSize)
                      ? 'text-clay-text-muted'
                      : 'bg-clay-bg-base text-clay-text-primary hover:bg-clay-primary hover:text-white'
                  "
                >
                  <AppIcon icon="mdi:chevron-right" :size="20" />
                </button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="text-center py-12">
            <AppIcon
              icon="mdi:book-open-variant"
              :size="64"
              class="text-clay-text-muted mx-auto mb-4"
            />
            <p class="text-clay-text-secondary">暂无知识记录</p>
          </div>
        </div>
      </Transition>

      <!-- 历史心理学 -->
      <Transition name="fade" mode="out-in">
        <div
          v-if="activeTab === 'psychology'"
          id="panel-psychology"
          role="tabpanel"
          :aria-hidden="activeTab !== 'psychology'"
          class="clay-card p-6"
        >
          <h3 class="text-lg font-bold text-clay-text-primary mb-6">历史心理学</h3>

          <!-- 加载状态 -->
          <div v-if="psychologyLoading" class="flex items-center justify-center py-12">
            <div
              class="w-8 h-8 border-4 border-clay-primary/20 border-t-clay-primary rounded-full animate-spin"
            ></div>
          </div>

          <!-- 心理学列表 -->
          <div v-else-if="psychologyList.length > 0" class="space-y-4">
            <div
              v-for="item in psychologyList"
              :key="item.id"
              class="border border-clay-bg-base rounded-clay-md overflow-hidden transition-shadow hover:shadow-clay-card cursor-pointer"
              @click="togglePsychologyExpand(item.id)"
            >
              <div class="flex items-start gap-4 p-4">
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-clay-text-primary mb-2 line-clamp-2">
                    {{ item.title || '无标题' }}
                  </h4>
                  <div v-if="item.createTime" class="text-sm text-clay-text-secondary">
                    {{ item.createTime }}
                  </div>
                </div>
                <AppIcon
                  :icon="
                    expandedPsychologyItems.has(item.id) ? 'mdi:chevron-up' : 'mdi:chevron-down'
                  "
                  :size="20"
                  class="text-clay-text-secondary shrink-0 mt-1"
                />
              </div>
              <Transition name="expand">
                <div v-if="expandedPsychologyItems.has(item.id)" class="px-4 pb-4">
                  <div
                    class="pt-4 border-t border-clay-bg-base text-clay-text-primary whitespace-pre-wrap leading-relaxed"
                  >
                    {{ item.content || '暂无内容' }}
                  </div>
                </div>
              </Transition>
            </div>

            <!-- 分页 -->
            <div v-if="psychologyTotal > psychologyPageSize" class="flex justify-center pt-4">
              <div class="flex items-center gap-2">
                <button
                  @click="handlePsychologyPageChange(psychologyPage - 1)"
                  :disabled="psychologyPage === 1"
                  class="px-4 py-2 rounded-clay-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="
                    psychologyPage === 1
                      ? 'text-clay-text-muted'
                      : 'bg-clay-bg-base text-clay-text-primary hover:bg-clay-primary hover:text-white'
                  "
                >
                  <AppIcon icon="mdi:chevron-left" :size="20" />
                </button>
                <div class="flex items-center gap-1">
                  <button
                    v-for="page in Math.ceil(psychologyTotal / psychologyPageSize)"
                    :key="page"
                    @click="handlePsychologyPageChange(page)"
                    class="w-10 h-10 rounded-clay-sm transition-colors font-medium"
                    :class="
                      psychologyPage === page
                        ? 'bg-clay-primary text-white shadow-clay-button'
                        : 'bg-clay-bg-base text-clay-text-primary hover:bg-clay-bg-elevated'
                    "
                  >
                    {{ page }}
                  </button>
                </div>
                <button
                  @click="handlePsychologyPageChange(psychologyPage + 1)"
                  :disabled="psychologyPage === Math.ceil(psychologyTotal / psychologyPageSize)"
                  class="px-4 py-2 rounded-clay-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="
                    psychologyPage === Math.ceil(psychologyTotal / psychologyPageSize)
                      ? 'text-clay-text-muted'
                      : 'bg-clay-bg-base text-clay-text-primary hover:bg-clay-primary hover:text-white'
                  "
                >
                  <AppIcon icon="mdi:chevron-right" :size="20" />
                </button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="text-center py-12">
            <AppIcon icon="mdi:brain" :size="64" class="text-clay-text-muted mx-auto mb-4" />
            <p class="text-clay-text-secondary">暂无心理学记录</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 展开/折叠动画 */
.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  overflow: hidden;
}

.expand-enter-active {
  max-height: 1000px;
}

.expand-leave-active {
  max-height: 1000px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 1000px;
  opacity: 1;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

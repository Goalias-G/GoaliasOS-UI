<script setup lang="ts">
/**
 * RecordTabs 组件 - 记录与提升
 *
 * - 生活记录：节假日万年历 + 日心情/备注/任务
 * - 作息趋势 / 每日心理 / 每日知识
 */

import type { DailyKnowledge, HealthSleepChart } from '@/types'
import { dailyKnowledgeApi, dailyHealthApi } from '@/api/modules/home'
import { formatDate } from '@/utils/format'
const LifeCalendar = defineAsyncComponent({
  loader: () => import('./LifeCalendar.vue'),
  delay: 0,
  timeout: 20000,
})
import * as echarts from 'echarts/core'
import type { EChartsOption } from 'echarts'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
])

// ==================== 响应式状态 ====================
const activeTab = ref<'calendar' | 'knowledge' | 'psychology' | 'sleepChart'>('calendar')
const loadedTabs = ref<Set<string>>(new Set(['calendar']))

// ==================== 标签页配置 ====================
const tabs = [
  { id: 'calendar' as const, label: '我的日历', icon: 'hugeicons:calendar-03' },
  { id: 'sleepChart' as const, label: '作息趋势', icon: 'hugeicons:chart-line-data-02' },
  { id: 'psychology' as const, label: '每日心理', icon: 'hugeicons:brain-02' },
  { id: 'knowledge' as const, label: '每日知识', icon: 'hugeicons:book-02' },
]

// ==================== 方法 ====================
function switchTab(tab: 'calendar' | 'knowledge' | 'psychology' | 'sleepChart') {
  activeTab.value = tab

  if (tab === 'sleepChart') {
    loadSleepChart()
    return
  }

  // 其他标签页：懒加载（首次切换时加载数据）
  if (!loadedTabs.value.has(tab)) {
    loadedTabs.value.add(tab)
    if (tab === 'knowledge') {
      loadKnowledgeList()
    } else if (tab === 'psychology') {
      loadPsychologyList()
    }
  }
}

// ==================== 历史知识子组件 ====================
const knowledgeList = ref<DailyKnowledge[]>([])
const knowledgeLoading = ref(false)
const knowledgePage = ref(1)
const knowledgePageSize = ref(5)
const knowledgeTotal = ref(0)
const expandedKnowledgeItems = ref<Set<number>>(new Set())
/** 将记录创建时间压缩为单行日期标签。 */
function formatRecordDate(date?: string): string {
  return date ? formatDate(date, 'YYYY-MM-DD') : ''
}

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

function handleKnowledgePageSizeChange(size: number) {
  knowledgePageSize.value = size
  knowledgePage.value = 1
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

// 删除确认状态
const deletingId = ref<number | null>(null)

async function handleDeleteKnowledge(id: number) {
  deletingId.value = id
  try {
    const response = await dailyKnowledgeApi.remove([id])
    if (response.code === 200) {
      showSuccess('删除成功')
      expandedKnowledgeItems.value.delete(id)

      // 删除当前页最后一条时回退到上一页，再从服务端拉取真实分页结果。
      if (knowledgePage.value > 1 && knowledgeList.value.length === 1) {
        knowledgePage.value -= 1
      }
      await loadKnowledgeList()
    } else {
      showError(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除知识失败:', error)
    showError('删除失败，请重试')
  } finally {
    deletingId.value = null
  }
}

// ==================== 历史心理学子组件 ====================
const psychologyList = ref<DailyKnowledge[]>([])
const psychologyLoading = ref(false)
const psychologyPage = ref(1)
const psychologyPageSize = ref(5)
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

function handlePsychologyPageSizeChange(size: number) {
  psychologyPageSize.value = size
  psychologyPage.value = 1
  loadPsychologyList()
}

async function handleDeletePsychology(id: number) {
  deletingId.value = id
  try {
    const response = await dailyKnowledgeApi.remove([id])
    if (response.code === 200) {
      showSuccess('删除成功')
      expandedPsychologyItems.value.delete(id)

      // 删除当前页最后一条时回退到上一页，再从服务端拉取真实分页结果。
      if (psychologyPage.value > 1 && psychologyList.value.length === 1) {
        psychologyPage.value -= 1
      }
      await loadPsychologyList()
    } else {
      showError(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除心理学记录失败:', error)
    showError('删除失败，请重试')
  } finally {
    deletingId.value = null
  }
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

// ==================== 睡眠趋势图表子组件 ====================
const sleepChartRef = ref<HTMLDivElement | null>(null)
const sleepChartInstance = ref<echarts.ECharts | null>(null)
const sleepChartLoading = ref(false)
const sleepChartData = ref<HealthSleepChart[]>([])
const sleepDays = ref(10)

// 天数选项
const dayOptions = [
  { value: 3, label: '近3天' },
  { value: 7, label: '近7天' },
  { value: 10, label: '近10天' },
  { value: 20, label: '近20天' },
]

// 将时间转换为数值（小时+分钟/60）
function timeToNumber(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null
  const match = String(timeStr).match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!match) return null
  const hours = parseInt(match[1]!, 10)
  const minutes = parseInt(match[2]!, 10)
  return hours + minutes / 60
}

// 将数值转换为时间字符串
function numberToTime(num: number): string {
  const hours = Math.floor(num)
  const minutes = Math.round((num - hours) * 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

async function loadSleepChart() {
  if (sleepChartLoading.value) return

  sleepChartLoading.value = true
  try {
    const response = await dailyHealthApi.getHealthChart(sleepDays.value)
    if (response.code === 200 && response.data) {
      sleepChartData.value = response.data
      // 使用 setTimeout 确保 DOM 已渲染
      setTimeout(() => {
        initSleepChart()
      }, 100)
    } else {
      showError('加载睡眠图表失败')
    }
  } catch (error) {
    console.error('加载睡眠图表失败:', error)
    showError('加载睡眠图表失败，请重试')
  } finally {
    sleepChartLoading.value = false
  }
}

// 监听天数变化，重新加载数据
watch(sleepDays, () => {
  if (activeTab.value === 'sleepChart') {
    loadSleepChart()
  }
})

function initSleepChart() {
  console.log('initSleepChart called, ref:', sleepChartRef.value)
  if (!sleepChartRef.value) {
    console.error('sleepChartRef is null')
    return
  }

  // 如果已存在实例，先销毁
  if (sleepChartInstance.value) {
    sleepChartInstance.value.dispose()
  }

  try {
    const chart = echarts.init(sleepChartRef.value)
    console.log('ECharts initialized:', chart)
    sleepChartInstance.value = chart

    const dates = sleepChartData.value.map((item) => item.date)
    const upTimes = sleepChartData.value.map((item) => timeToNumber(item.upTime ?? null))
    const sleepTimes = sleepChartData.value.map((item) => timeToNumber(item.sleepTime ?? null))

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let result = `<div class="text-sm font-medium">${params[0].axisValue}</div>`
          params.forEach((param: any) => {
            const value = param.value
            if (value !== null && value !== undefined) {
              result += `<div class="flex items-center gap-2 mt-1">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${param.color}"></span>
              <span>${param.seriesName}: ${numberToTime(value)}</span>
            </div>`
            }
          })
          return result
        },
      },
      legend: {
        data: ['起床时间', '睡眠时间'],
        bottom: 0,
        textStyle: {
          color: '#6b7280',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: {
          lineStyle: {
            color: '#e5e7eb',
          },
        },
        axisLabel: {
          color: '#6b7280',
          formatter: (value: string) => {
            // 转换为 MM-DD 格式
            const parts = value.split('-')
            return parts.length >= 2 ? `${parts[1]}-${parts[2]}` : value
          },
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 24,
        interval: 4,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
          },
        },
        axisLabel: {
          color: '#6b7280',
          formatter: (value: number) => `${value}:00`,
        },
      },
      series: [
        {
          name: '起床时间',
          type: 'line',
          data: upTimes,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#4296ed',
            width: 3,
          },
          itemStyle: {
            color: '#4296ed',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(66, 150, 237, 0.3)' },
              { offset: 1, color: 'rgba(66, 150, 237, 0.05)' },
            ]),
          },
        },
        {
          name: '睡眠时间',
          type: 'line',
          data: sleepTimes,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#8b5cf6',
            width: 3,
          },
          itemStyle: {
            color: '#8b5cf6',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.05)' },
            ]),
          },
        },
      ],
    }

    chart.setOption(option)

    // 响应窗口大小变化
    window.addEventListener('resize', () => chart.resize())
  } catch (error) {
    console.error('初始化图表失败:', error)
  }
}

// 组件卸载时销毁图表
onUnmounted(() => {
  if (sleepChartInstance.value) {
    sleepChartInstance.value.dispose()
    window.removeEventListener('resize', () => sleepChartInstance.value?.resize())
  }
})
</script>

<template>
  <div class="record-tabs">
    <!-- 标签页头部 -->
    <div class="clay-card p-2 mb-6" role="tablist" aria-label="记录与提升标签页">
      <div class="tab-scroll flex gap-2 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :aria-controls="`panel-${tab.id}`"
          class="flex-1 min-w-[7.5rem] px-4 py-3 rounded-clay-md font-medium transition-all flex items-center justify-center gap-2 shrink-0"
          :class="[
            activeTab === tab.id
              ? 'bg-clay-bg-elevated text-clay-primary shadow-clay-button'
              : 'text-clay-text-secondary hover:bg-clay-bg-base hover:text-clay-text-primary',
          ]"
          @click="switchTab(tab.id)"
        >
          <AppIcon :icon="tab.icon" :size="20" />
          <span class="whitespace-nowrap">{{ tab.label }}</span>
        </button>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="tab-content">
      <!-- 生活日历 -->
      <Transition name="fade" mode="out-in">
        <div
          v-if="activeTab === 'calendar'"
          id="panel-calendar"
          role="tabpanel"
          :aria-hidden="activeTab !== 'calendar'"
          class="clay-card p-4 sm:p-6"
        >
          <LifeCalendar />
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
          <h3 class="clay-section-title mb-6">历史知识</h3>

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
              class="border border-clay-bg-base rounded-clay-md overflow-hidden transition-shadow hover:shadow-clay-card"
            >
              <div class="flex items-start gap-4 p-4">
                <div class="flex-1 min-w-0 cursor-pointer" @click="toggleKnowledgeExpand(item.id)">
                  <h4 class="font-medium text-clay-text-primary mb-2 line-clamp-2">
                    {{ item.title || '无标题' }}
                  </h4>
                  <div
                    v-if="item.createTime"
                    class="text-sm text-clay-text-secondary whitespace-nowrap"
                  >
                    {{ formatRecordDate(item.createTime) }}
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    @click.stop="handleDeleteKnowledge(item.id)"
                    :disabled="deletingId === item.id"
                    class="p-2 rounded-clay-sm text-clay-text-muted hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="删除"
                  >
                    <AppIcon
                      :icon="deletingId === item.id ? 'mdi:loading' : 'mdi:delete-outline'"
                      :size="18"
                      :class="{ 'animate-spin': deletingId === item.id }"
                    />
                  </button>
                  <AppIcon
                    :icon="
                      expandedKnowledgeItems.has(item.id) ? 'mdi:chevron-up' : 'mdi:chevron-down'
                    "
                    :size="20"
                    class="text-clay-text-secondary shrink-0 mt-1 cursor-pointer"
                    @click="toggleKnowledgeExpand(item.id)"
                  />
                </div>
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
            <Pagination
              v-if="knowledgeTotal > 0"
              :page="knowledgePage"
              :page-size="knowledgePageSize"
              :total="knowledgeTotal"
              :page-size-options="[5, 10, 20, 50]"
              @update:page="handleKnowledgePageChange"
              @update:page-size="handleKnowledgePageSizeChange"
            />
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
          <h3 class="clay-section-title mb-6">历史心理学</h3>

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
              class="border border-clay-bg-base rounded-clay-md overflow-hidden transition-shadow hover:shadow-clay-card"
            >
              <div class="flex items-start gap-4 p-4">
                <div class="flex-1 min-w-0 cursor-pointer" @click="togglePsychologyExpand(item.id)">
                  <h4 class="font-medium text-clay-text-primary mb-2 line-clamp-2">
                    {{ item.title || '无标题' }}
                  </h4>
                  <div
                    v-if="item.createTime"
                    class="text-sm text-clay-text-secondary whitespace-nowrap"
                  >
                    {{ formatRecordDate(item.createTime) }}
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    @click.stop="handleDeletePsychology(item.id)"
                    :disabled="deletingId === item.id"
                    class="p-2 rounded-clay-sm text-clay-text-muted hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="删除"
                  >
                    <AppIcon
                      :icon="deletingId === item.id ? 'mdi:loading' : 'mdi:delete-outline'"
                      :size="18"
                      :class="{ 'animate-spin': deletingId === item.id }"
                    />
                  </button>
                  <AppIcon
                    :icon="
                      expandedPsychologyItems.has(item.id) ? 'mdi:chevron-up' : 'mdi:chevron-down'
                    "
                    :size="20"
                    class="text-clay-text-secondary shrink-0 mt-1 cursor-pointer"
                    @click="togglePsychologyExpand(item.id)"
                  />
                </div>
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
            <Pagination
              v-if="psychologyTotal > 0"
              :page="psychologyPage"
              :page-size="psychologyPageSize"
              :total="psychologyTotal"
              :page-size-options="[5, 10, 20, 50]"
              @update:page="handlePsychologyPageChange"
              @update:page-size="handlePsychologyPageSizeChange"
            />
          </div>

          <!-- 空状态 -->
          <div v-else class="text-center py-12">
            <AppIcon icon="mdi:brain" :size="64" class="text-clay-text-muted mx-auto mb-4" />
            <p class="text-clay-text-secondary">暂无心理学记录</p>
          </div>
        </div>
      </Transition>

      <!-- 睡眠趋势图表 -->
      <Transition name="fade" mode="out-in">
        <div
          v-if="activeTab === 'sleepChart'"
          id="panel-sleepChart"
          role="tabpanel"
          :aria-hidden="activeTab !== 'sleepChart'"
          class="clay-card p-6"
        >
          <div class="flex items-center justify-between mb-6">
            <h3 class="clay-section-title clay-section-title--compact">历日分布</h3>
            <!-- 天数选择 -->
            <select
              v-model="sleepDays"
              class="px-3 py-2 rounded-clay-sm bg-clay-bg-base text-clay-text-primary border border-clay-bg-base focus:outline-none focus:border-clay-primary cursor-pointer"
            >
              <option v-for="option in dayOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- 加载状态 -->
          <div v-if="sleepChartLoading" class="flex items-center justify-center py-12">
            <div
              class="w-8 h-8 border-4 border-clay-primary/20 border-t-clay-primary rounded-full animate-spin"
            ></div>
          </div>

          <!-- 图表 -->
          <div
            v-else-if="sleepChartData.length > 0"
            ref="sleepChartRef"
            class="w-full h-[400px]"
          ></div>

          <!-- 空状态 -->
          <div v-else class="text-center py-12">
            <AppIcon icon="mdi:chart-line" :size="64" class="text-clay-text-muted mx-auto mb-4" />
            <p class="text-clay-text-secondary">暂无睡眠数据</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.tab-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.tab-scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

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

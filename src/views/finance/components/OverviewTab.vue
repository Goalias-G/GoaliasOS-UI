<script setup lang="ts">
/**
 * 收支概览 Tab 组件
 *
 * 功能说明:
 * - 3 张指标卡（本月收入/支出/结余）
 * - 月度收支趋势折线图
 * - 分类占比饼图
 * - ECharts 按需导入
 */

import { storeToRefs } from 'pinia'
import * as echarts from 'echarts/core'
import type { EChartsOption } from 'echarts'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
])

const store = useFinanceStore()
const { overview, trendData, dayTrendData, pieData, loading } = storeToRefs(store)

// ==================== 金额格式化 ====================
function formatAmount(cents: number): string {
  if (!cents && cents !== 0) return '0.00'
  return (cents / 100).toFixed(2)
}

// ==================== 趋势图模式切换 ====================
type TrendMode = 'month' | 'day'
const trendMode = ref<TrendMode>('month')

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const trendYear = ref(currentYear)
const trendMonth = ref(currentMonth)

const yearOptions = computed(() => {
  const years = []
  for (let y = currentYear; y >= currentYear - 5; y--) years.push(y)
  return years
})

const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

// ==================== 日期范围筛选（饼图） ====================
const now = new Date()
const pieStartDate = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)
const pieEndDate = ref(now.toISOString().split('T')[0]!)

// ==================== 图表引用 ====================
const trendChartRef = ref<HTMLDivElement | null>(null)
const trendChartInstance = ref<echarts.ECharts | null>(null)
const pieChartRef = ref<HTMLDivElement | null>(null)
const pieChartInstance = ref<echarts.ECharts | null>(null)

// ==================== 初始化趋势图 ====================
function initTrendChart() {
  const isMonthMode = trendMode.value === 'month'
  const data = isMonthMode ? trendData.value : dayTrendData.value

  if (!trendChartRef.value || data.length === 0) return

  if (trendChartInstance.value) trendChartInstance.value.dispose()

  const chart = echarts.init(trendChartRef.value)
  trendChartInstance.value = chart

  const labels = isMonthMode
    ? trendData.value.map((d) => d.month)
    : dayTrendData.value.map((d) => d.day)
  const incomeData = data.map((d) => d.income / 100)
  const expenseData = data.map((d) => d.expense / 100)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = `<div class="text-sm font-medium">${params[0].axisValue}</div>`
        params.forEach((param: any) => {
          result += `<div class="flex items-center gap-2 mt-1">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${param.color}"></span>
            <span>${param.seriesName}: ¥${param.value.toFixed(2)}</span>
          </div>`
        })
        return result
      },
    },
    legend: {
      data: ['收入', '支出'],
      bottom: 0,
      textStyle: { color: '#6b7280', fontSize: 12 },
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: {
        color: '#6b7280',
        formatter: (value: string) =>
          isMonthMode ? value.split('-')[1] + '月' : value.split('-')[2] + '日',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLabel: { color: '#6b7280', formatter: (v: number) => '¥' + v },
    },
    series: [
      {
        name: '收入',
        type: 'line',
        data: incomeData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#10b981', width: 2.5 },
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.02)' },
          ]),
        },
      },
      {
        name: '支出',
        type: 'line',
        data: expenseData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#ef4444', width: 2.5 },
        itemStyle: { color: '#ef4444' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(239, 68, 68, 0.25)' },
            { offset: 1, color: 'rgba(239, 68, 68, 0.02)' },
          ]),
        },
      },
    ],
  }

  chart.setOption(option)
}

// ==================== 初始化饼图 ====================
function initPieChart() {
  if (!pieChartRef.value || pieData.value.length === 0) return

  if (pieChartInstance.value) pieChartInstance.value.dispose()

  const chart = echarts.init(pieChartRef.value)
  pieChartInstance.value = chart

  const data = pieData.value.map((d) => ({
    name: d.categoryName,
    value: d.amount / 100,
  }))

  const colors = [
    '#4296ed',
    '#ffa6ad',
    '#acffe6',
    '#ffdf95',
    '#a78bfa',
    '#f59e0b',
    '#10b981',
    '#6366f1',
  ]

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) =>
        `${params.name}: ¥${params.value.toFixed(2)} (${params.percent}%)`,
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      textStyle: { color: '#6b7280', fontSize: 12 },
    },
    color: colors,
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fbfcf3',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 11,
          color: '#6b7280',
        },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold' },
        },
        data,
      },
    ],
  }

  chart.setOption(option)
}

// ==================== Resize 处理 ====================
function handleResize() {
  trendChartInstance.value?.resize()
  pieChartInstance.value?.resize()
}

// ==================== 数据加载 ====================
async function loadTrendData() {
  if (trendMode.value === 'month') {
    await store.loadTrend(trendYear.value)
  } else {
    await store.loadDayTrend(trendYear.value, trendMonth.value)
  }
  nextTick(() => initTrendChart())
}

async function loadPieData() {
  if (pieStartDate.value && pieEndDate.value) {
    await store.loadPie(pieStartDate.value, pieEndDate.value)
    nextTick(() => initPieChart())
  }
}

function switchTrendMode(mode: TrendMode) {
  trendMode.value = mode
  loadTrendData()
}

// 年份/月份变化时重新加载趋势
watch(trendYear, () => loadTrendData())
watch(trendMonth, () => {
  if (trendMode.value === 'day') loadTrendData()
})

// 监听数据变化重新初始化图表
watch(trendData, () => {
  if (trendMode.value === 'month') nextTick(() => initTrendChart())
})
watch(dayTrendData, () => {
  if (trendMode.value === 'day') nextTick(() => initTrendChart())
})
watch(pieData, () => nextTick(() => initPieChart()))

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await Promise.all([store.loadOverview(), loadTrendData(), loadPieData()])
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChartInstance.value?.dispose()
  pieChartInstance.value?.dispose()
})
</script>

<template>
  <div class="space-y-5">
    <!-- 指标卡片 -->
    <div class="grid grid-cols-3 gap-4">
      <!-- 本月收入 -->
      <div class="clay-card p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-clay-sm bg-green-50 flex items-center justify-center">
            <AppIcon icon="mdi:arrow-up-bold" :size="20" class="text-green-500" />
          </div>
          <span class="text-sm text-clay-text-secondary">本月收入</span>
        </div>
        <div class="text-2xl font-bold text-green-500 font-heading">
          ¥{{ formatAmount(overview?.monthIncome ?? 0) }}
        </div>
      </div>

      <!-- 本月支出 -->
      <div class="clay-card p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-clay-sm bg-red-50 flex items-center justify-center">
            <AppIcon icon="mdi:arrow-down-bold" :size="20" class="text-red-500" />
          </div>
          <span class="text-sm text-clay-text-secondary">本月支出</span>
        </div>
        <div class="text-2xl font-bold text-red-500 font-heading">
          ¥{{ formatAmount(overview?.monthExpense ?? 0) }}
        </div>
      </div>

      <!-- 本月结余 -->
      <div class="clay-card p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-clay-sm bg-blue-50 flex items-center justify-center">
            <AppIcon icon="mdi:wallet-outline" :size="20" class="text-blue-500" />
          </div>
          <span class="text-sm text-clay-text-secondary">本月结余</span>
        </div>
        <div
          class="text-2xl font-bold font-heading"
          :class="(overview?.monthBalance ?? 0) >= 0 ? 'text-blue-500' : 'text-red-500'"
        >
          ¥{{ formatAmount(overview?.monthBalance ?? 0) }}
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="flex flex-col md:flex-row gap-5">
      <!-- 趋势折线图 -->
      <div class="flex-1 min-w-0 md:basis-3/5 clay-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-base font-semibold text-clay-text-primary font-heading">
            {{ trendMode === 'month' ? '月度' : '日度' }}收支分析
          </h4>
          <div class="flex items-center gap-2">
            <!-- 模式切换 -->
            <div class="clay-card p-0.5 flex">
              <button
                @click="switchTrendMode('month')"
                class="px-3 py-1 rounded-clay-sm text-xs font-medium transition-all"
                :class="
                  trendMode === 'month'
                    ? 'bg-clay-primary text-purple-500 shadow-clay-button'
                    : 'text-clay-text-secondary'
                "
              >
                月度
              </button>
              <button
                @click="switchTrendMode('day')"
                class="px-3 py-1 rounded-clay-sm text-xs font-medium transition-all"
                :class="
                  trendMode === 'day'
                    ? 'bg-clay-primary text-purple-500 shadow-clay-button'
                    : 'text-clay-text-secondary'
                "
              >
                日度
              </button>
            </div>
            <!-- 年份 -->
            <select
              v-model="trendYear"
              class="px-2 py-1 rounded-clay-sm bg-clay-bg-base text-clay-text-primary text-xs border border-transparent focus:outline-none focus:border-clay-primary cursor-pointer"
            >
              <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</option>
            </select>
            <!-- 月份（日度模式） -->
            <select
              v-if="trendMode === 'day'"
              v-model="trendMonth"
              class="px-2 py-1 rounded-clay-sm bg-clay-bg-base text-clay-text-primary text-xs border border-transparent focus:outline-none focus:border-clay-primary cursor-pointer"
            >
              <option v-for="m in monthOptions" :key="m" :value="m">{{ m }}月</option>
            </select>
          </div>
        </div>

        <div v-if="loading.trend" class="flex items-center justify-center py-12">
          <div
            class="w-8 h-8 border-4 border-clay-primary/20 border-t-clay-primary rounded-full animate-spin"
          ></div>
        </div>
        <div
          v-else-if="(trendMode === 'month' ? trendData : dayTrendData).length === 0"
          class="text-center py-12"
        >
          <AppIcon icon="mdi:chart-line" :size="48" class="text-clay-text-muted mx-auto mb-2" />
          <p class="text-sm text-clay-text-muted">暂无趋势数据</p>
        </div>
        <div v-else ref="trendChartRef" class="w-full h-[320px]"></div>
      </div>

      <!-- 分类饼图 -->
      <div class="flex-1 min-w-0 md:basis-2/5 clay-card p-5">
        <div class="flex items-center justify-between mb-4">
          <!-- <h4 class="text-base font-semibold text-clay-text-primary font-heading">分类占比</h4> -->
          <div class="flex items-center gap-2">
            <input
              v-model="pieStartDate"
              type="date"
              class="px-2 py-1 rounded-clay-sm bg-clay-bg-base text-clay-text-primary text-xs border border-transparent focus:outline-none focus:border-clay-primary"
            />
            <span class="text-clay-text-muted text-xs">~</span>
            <input
              v-model="pieEndDate"
              type="date"
              class="px-2 py-1 rounded-clay-sm bg-clay-bg-base text-clay-text-primary text-xs border border-transparent focus:outline-none focus:border-clay-primary"
            />
            <button
              @click="loadPieData"
              class="px-2.5 py-1 rounded-clay-sm bg-clay-primary text-xs font-medium shadow-clay-button hover:shadow-clay-hover transition-all"
            >
              查询
            </button>
          </div>
        </div>

        <div v-if="loading.pie" class="flex items-center justify-center py-12">
          <div
            class="w-8 h-8 border-4 border-clay-primary/20 border-t-clay-primary rounded-full animate-spin"
          ></div>
        </div>
        <div v-else-if="pieData.length === 0" class="text-center py-12">
          <AppIcon icon="mdi:chart-pie" :size="48" class="text-clay-text-muted mx-auto mb-2" />
          <p class="text-sm text-clay-text-muted">暂无分类数据</p>
        </div>
        <div v-else ref="pieChartRef" class="w-full h-[320px]"></div>
      </div>
    </div>
  </div>
</template>

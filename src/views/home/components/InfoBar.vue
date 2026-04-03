<script setup lang="ts">
/**
 * InfoBar 组件 - 顶部信息栏
 *
 * 功能说明：
 * - 展示每日问候语（saying）
 * - 展示天气信息（省市区、天气状况、温度、风向风力、湿度、更新时间）
 * - 展示当前日期（格式：YYYY年MM月DD日 星期X）
 * - 展示当前位置（省市区）
 * - 提供翻译按钮入口
 */

import type { Weather } from '@/types'
import TranslateModal from './TranslateModal.vue'

// ==================== Props ====================
interface Props {
  /** 每日问候语 */
  saying?: string
  /** 天气信息 */
  weather?: Weather
}

const props = defineProps<Props>()

// ==================== 响应式状态 ====================
const showTranslateModal = ref(false)

// ==================== 计算属性 ====================
const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[now.getDay()]

  return `${year}年${month}月${day}日 星期${weekDay}`
})

// 当前位置（省市区）
const currentLocation = computed(() => {
  if (!props.weather) return ''
  const parts = [props.weather.province, props.weather.city, props.weather.district].filter(Boolean)
  return parts.join(' ')
})
</script>

<template>
  <div class="clay-card p-4 md:p-6">
    <!-- 桌面端：单行布局 | 移动端：自适应换行 -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <!-- 左侧：问候语和日期 -->
      <div class="flex-1 min-w-0 md:min-w-[300px] max-w-md">
        <h2
          class="text-lg md:text-xl text-clay-text-primary mb-1 truncate"
          :title="saying || '欢迎使用 GoaliasOS'"
        >
          {{ saying || '欢迎使用 GoaliasOS' }}
        </h2>
        <div class="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-clay-text-secondary">
          <div class="flex items-center gap-1">
            <AppIcon icon="mdi:calendar-today" :size="16" />
            <span class="whitespace-nowrap">{{ currentDate }}</span>
          </div>
          <div v-if="currentLocation" class="flex items-center gap-1">
            <AppIcon icon="mdi:map-marker" :size="16" />
            <span class="whitespace-nowrap">{{ currentLocation }}</span>
          </div>
        </div>
      </div>

      <!-- 中间：天气信息 -->
      <div v-if="weather" class="flex items-center gap-3 md:gap-4 text-sm min-w-0">
        <div class="flex items-center gap-2 shrink-0">
          <AppIcon icon="mdi:weather-partly-cloudy" :size="24" class="text-clay-primary" />
          <div>
            <div class="font-medium text-clay-text-primary whitespace-nowrap">
              {{ weather.weather }}
            </div>
            <div class="text-clay-text-secondary text-xs whitespace-nowrap">
              {{ weather.temperature }}
            </div>
          </div>
        </div>
        <!-- 风向、风力、湿度（移动端也显示） -->
        <div class="flex flex-col text-xs text-clay-text-secondary min-w-0">
          <div class="truncate">{{ weather.wind_direction }} {{ weather.wind_power }}</div>
          <div class="truncate">湿度 {{ weather.humidity }}</div>
        </div>
        <!-- 更新时间（桌面端显示） -->
        <div
          v-if="weather.report_time"
          class="hidden md:block text-xs text-clay-text-muted whitespace-nowrap shrink-0"
        >
          更新于 {{ weather.report_time }}
        </div>
      </div>

      <!-- 右侧：翻译按钮 -->
      <button
        class="clay-btn-secondary flex items-center gap-2 shrink-0"
        aria-label="打开翻译对话框"
        @click="showTranslateModal = true"
      >
        <AppIcon icon="mdi:translate" :size="20" />
        <span class="hidden sm:inline">翻译</span>
      </button>
    </div>

    <!-- 翻译弹窗 -->
    <TranslateModal v-model:visible="showTranslateModal" />
  </div>
</template>

<style scoped>
/* 组件样式（优先使用 Tailwind CSS） */
</style>

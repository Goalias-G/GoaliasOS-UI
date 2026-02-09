<script setup lang="ts">
/**
 * 首页 - Goalias OS 健康生活管理系统
 *
 * 功能说明：
 * - 展示今日健康指标
 * - 显示日程安排
 * - 快捷功能入口
 * - 个性化问候
 */
import { useUserStore } from '@/stores/user'
import type { HealthMetrics, ScheduleItem } from '@/types'

const userStore = useUserStore()

// ==================== 问候语 ====================
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

const greetingIcon = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return 'mdi:weather-night'
  if (hour < 12) return 'mdi:weather-sunny'
  if (hour < 18) return 'mdi:weather-partly-cloudy'
  return 'mdi:weather-night'
})

// ==================== 健康指标 ====================
const healthMetrics = ref<HealthMetrics>({
  sleepHours: 7.5,
  waterIntake: 1200,
  steps: 6543,
  calories: 1850,
  exerciseMinutes: 30,
})

const metricsCards = computed(() => [
  {
    label: '睡眠时长',
    value: `${healthMetrics.value.sleepHours}h`,
    icon: 'mdi:sleep',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    target: '目标: 8h',
    progress: (healthMetrics.value.sleepHours / 8) * 100,
  },
  {
    label: '饮水量',
    value: `${healthMetrics.value.waterIntake}ml`,
    icon: 'mdi:water',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    target: '目标: 2000ml',
    progress: (healthMetrics.value.waterIntake / 2000) * 100,
  },
  {
    label: '步数',
    value: healthMetrics.value.steps.toLocaleString(),
    icon: 'mdi:walk',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    target: '目标: 10000',
    progress: (healthMetrics.value.steps / 10000) * 100,
  },
  {
    label: '卡路里',
    value: healthMetrics.value.calories.toLocaleString(),
    icon: 'mdi:fire',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    target: '目标: 2000',
    progress: (healthMetrics.value.calories / 2000) * 100,
  },
])

// ==================== 今日日程 ====================
const todaySchedule = ref<ScheduleItem[]>([
  {
    id: '1',
    title: '晨间冥想',
    time: '07:00',
    type: 'health',
    completed: true,
  },
  {
    id: '2',
    title: '健康早餐',
    time: '08:00',
    type: 'health',
    completed: true,
  },
  {
    id: '3',
    title: '工作会议',
    time: '10:00',
    type: 'life',
    completed: false,
  },
  {
    id: '4',
    title: '午间运动',
    time: '12:30',
    type: 'exercise',
    completed: false,
  },
  {
    id: '5',
    title: '阅读学习',
    time: '19:00',
    type: 'study',
    completed: false,
  },
])

const scheduleTypeConfig = {
  health: { icon: 'mdi:heart-pulse', color: 'text-red-500', bgColor: 'bg-red-50' },
  life: { icon: 'mdi:calendar-check', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  exercise: { icon: 'mdi:dumbbell', color: 'text-green-500', bgColor: 'bg-green-50' },
  study: { icon: 'mdi:book-open-variant', color: 'text-purple-500', bgColor: 'bg-purple-50' },
}

function toggleSchedule(item: ScheduleItem) {
  item.completed = !item.completed
}

// ==================== 快捷功能 ====================
const quickActions = [
  {
    title: '记录作息',
    description: '记录睡眠和日常作息',
    icon: 'mdi:bed',
    color: 'bg-gradient-to-br from-blue-400 to-blue-600',
    to: '/health/sleep',
  },
  {
    title: '饮食记录',
    description: '记录每日饮食摄入',
    icon: 'mdi:food-apple',
    color: 'bg-gradient-to-br from-green-400 to-green-600',
    to: '/health/diet',
  },
  {
    title: '运动打卡',
    description: '记录运动和体育活动',
    icon: 'mdi:run',
    color: 'bg-gradient-to-br from-orange-400 to-orange-600',
    to: '/health/exercise',
  },
  {
    title: '思维训练',
    description: '提升头脑思维能力',
    icon: 'mdi:brain',
    color: 'bg-gradient-to-br from-purple-400 to-purple-600',
    to: '/improvement/thinking',
  },
]

// ==================== 今日总结 ====================
const todaySummary = computed(() => {
  const completed = todaySchedule.value.filter((item) => item.completed).length
  const total = todaySchedule.value.length
  const completionRate = Math.round((completed / total) * 100)

  return {
    completed,
    total,
    completionRate,
    message:
      completionRate >= 80
        ? '今天表现很棒！'
        : completionRate >= 50
          ? '继续加油！'
          : '还有进步空间',
  }
})
</script>

<template>
  <div class="min-h-screen bg-clay-bg-base p-6">
    <div class="mx-auto space-y-6">
      <!-- 欢迎区域 -->
      <div class="clay-card-hoverable p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-clay-md shadow-clay-card overflow-hidden bg-clay-bg-elevated"
            >
              <img
                v-if="userStore.avatar"
                :src="userStore.avatar"
                alt="avatar"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <AppIcon icon="mdi:account" :size="32" class="text-clay-text-muted" />
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <AppIcon :icon="greetingIcon" :size="24" class="text-clay-primary" />
                <h1 class="text-2xl font-heading font-bold text-clay-text-primary">
                  {{ greeting }}，{{ userStore.nickName }}
                </h1>
              </div>
              <p class="text-clay-text-secondary">
                {{
                  new Date().toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })
                }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-clay-text-muted mb-1">会员计划</div>
            <div class="px-4 py-1.5 bg-clay-primary/10 rounded-clay-sm">
              <span class="text-clay-primary font-medium">{{ userStore.userPlan }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 今日健康指标 -->
      <div>
        <h2 class="text-lg font-heading font-bold text-clay-text-primary mb-4">今日健康指标</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="metric in metricsCards" :key="metric.label" class="clay-card-hoverable p-5">
            <div class="flex items-center justify-between mb-4">
              <div
                :class="[
                  metric.bgColor,
                  'w-12 h-12 rounded-clay-sm flex items-center justify-center',
                ]"
              >
                <AppIcon :icon="metric.icon" :size="24" :class="metric.color" />
              </div>
            </div>
            <div class="mb-3">
              <div class="text-2xl font-bold text-clay-text-primary mb-1">{{ metric.value }}</div>
              <div class="text-sm text-clay-text-secondary">{{ metric.label }}</div>
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs text-clay-text-muted">
                <span>{{ metric.target }}</span>
                <span>{{ Math.round(metric.progress) }}%</span>
              </div>
              <div class="h-2 bg-clay-bg-base rounded-full overflow-hidden">
                <div
                  :class="metric.bgColor"
                  :style="{ width: `${Math.min(metric.progress, 100)}%` }"
                  class="h-full rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 今日日程 -->
        <div class="lg:col-span-2">
          <h2 class="text-lg font-heading font-bold text-clay-text-primary mb-4">今日日程</h2>
          <div class="clay-card p-6 space-y-3">
            <div
              v-for="item in todaySchedule"
              :key="item.id"
              class="flex items-center gap-4 p-3 rounded-clay-sm hover:bg-clay-bg-base transition-colors cursor-pointer"
              @click="toggleSchedule(item)"
            >
              <div
                :class="[
                  scheduleTypeConfig[item.type].bgColor,
                  'w-10 h-10 rounded-clay-sm flex items-center justify-center flex-shrink-0',
                ]"
              >
                <AppIcon
                  :icon="scheduleTypeConfig[item.type].icon"
                  :size="20"
                  :class="scheduleTypeConfig[item.type].color"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <h3
                    :class="[
                      'font-medium',
                      item.completed
                        ? 'text-clay-text-muted line-through'
                        : 'text-clay-text-primary',
                    ]"
                  >
                    {{ item.title }}
                  </h3>
                </div>
                <p class="text-sm text-clay-text-muted">{{ item.time }}</p>
              </div>
              <div
                :class="[
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                  item.completed ? 'bg-clay-primary border-clay-primary' : 'border-clay-text-muted',
                ]"
              >
                <AppIcon v-if="item.completed" icon="mdi:check" :size="16" class="text-white" />
              </div>
            </div>
          </div>
        </div>

        <!-- 今日总结 -->
        <div class="space-y-6">
          <div>
            <h2 class="text-lg font-heading font-bold text-clay-text-primary mb-4">今日总结</h2>
            <div class="clay-card p-6 text-center">
              <div class="relative w-32 h-32 mx-auto mb-4">
                <svg class="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    stroke-width="8"
                    fill="none"
                    class="text-clay-bg-base"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    stroke-width="8"
                    fill="none"
                    class="text-clay-primary transition-all duration-1000"
                    :stroke-dasharray="`${2 * Math.PI * 56}`"
                    :stroke-dashoffset="`${2 * Math.PI * 56 * (1 - todaySummary.completionRate / 100)}`"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div class="text-3xl font-bold text-clay-text-primary">
                      {{ todaySummary.completionRate }}%
                    </div>
                    <div class="text-xs text-clay-text-muted">完成度</div>
                  </div>
                </div>
              </div>
              <p class="text-clay-text-secondary mb-2">
                已完成 {{ todaySummary.completed }} / {{ todaySummary.total }} 项任务
              </p>
              <p class="text-clay-primary font-medium">{{ todaySummary.message }}</p>
            </div>
          </div>

          <!-- 快捷功能 -->
          <div>
            <h2 class="text-lg font-heading font-bold text-clay-text-primary mb-4">快捷功能</h2>
            <div class="space-y-3">
              <RouterLink
                v-for="action in quickActions"
                :key="action.title"
                :to="action.to"
                class="clay-card-clickable p-4 flex items-center gap-3 group"
              >
                <div
                  :class="[
                    action.color,
                    'w-12 h-12 rounded-clay-sm flex items-center justify-center shadow-clay-button',
                  ]"
                >
                  <AppIcon :icon="action.icon" :size="24" class="text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <h3
                    class="font-medium text-clay-text-primary group-hover:text-clay-primary transition-colors"
                  >
                    {{ action.title }}
                  </h3>
                  <p class="text-xs text-clay-text-muted">{{ action.description }}</p>
                </div>
                <AppIcon icon="mdi:chevron-right" :size="20" class="text-clay-text-muted" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

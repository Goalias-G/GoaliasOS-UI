<script setup lang="ts">
/**
 * 首页
 *
 * 功能说明：
 * - PC 端优先的仪表盘设计
 * - 展示基本信息和快捷入口
 */
import { useUserStore } from '@/stores'

const userStore = useUserStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const quickLinks = [
  { title: '组件演示', description: '查看项目中可用的 UI 组件', icon: 'mdi:palette-outline', to: '/demo', color: 'bg-purple-500' },
  { title: '项目文档', description: '了解项目架构和使用方法', icon: 'mdi:book-open-outline', to: '#', color: 'bg-blue-500' },
  { title: '系统设置', description: '配置应用偏好设置', icon: 'mdi:cog-outline', to: '#', color: 'bg-gray-500' },
]

const stats = [
  { label: '总用户', value: '1,234', icon: 'mdi:account-group-outline', trend: '+12%' },
  { label: '活跃项目', value: '56', icon: 'mdi:folder-outline', trend: '+5%' },
  { label: '完成任务', value: '892', icon: 'mdi:check-circle-outline', trend: '+23%' },
  { label: '系统运行', value: '99.9%', icon: 'mdi:server-outline', trend: '稳定' },
]

</script>

<template>
  <div class="p-6">
    <!-- 欢迎区域 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">{{ greeting }}，{{ userStore.username }} 👋</h1>
      <p class="text-gray-500 mt-1">欢迎使用 Vue 项目基础架构模板</p>
      <el-button type="primary" class="mt-34">开始探索</el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label"
        class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <AppIcon :icon="stat.icon" :size="20" class="text-indigo-500" />
          </div>
          <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{{ stat.trend }}</span>
        </div>
        <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        <p class="text-sm text-gray-500 mt-1">{{ stat.label }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 快捷入口 -->
      <div class="lg:col-span-2">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">快捷入口</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RouterLink v-for="link in quickLinks" :key="link.title" :to="link.to"
            class="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all">
            <div :class="[link.color, 'w-12 h-12 rounded-xl flex items-center justify-center shadow-lg mb-4']">
              <AppIcon :icon="link.icon" :size="24" color="white" />
            </div>
            <h3 class="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{{ link.title }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ link.description }}</p>
          </RouterLink>
        </div>
      </div>

      <!-- 项目信息 -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">项目信息</h2>
        <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white h-[calc(100%-2rem)]">
          <h3 class="text-lg font-bold mb-2">Vue 3 基础架构</h3>
          <p class="text-indigo-100 text-sm mb-4">现代化前端项目模板，提供完整的开发工具链配置</p>
          <div class="flex flex-wrap gap-2">
            <span class="px-2 py-1 bg-white/20 rounded text-xs">Vue 3</span>
            <span class="px-2 py-1 bg-white/20 rounded text-xs">TypeScript</span>
            <span class="px-2 py-1 bg-white/20 rounded text-xs">Vite</span>
            <span class="px-2 py-1 bg-white/20 rounded text-xs">Tailwind</span>
            <span class="px-2 py-1 bg-white/20 rounded text-xs">Pinia</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

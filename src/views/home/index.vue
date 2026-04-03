<script setup lang="ts">
/**
 * 首页 - Goalias OS 健康生活管理系统
 *
 * 功能说明：
 * - 展示顶部信息栏（问候语、天气、日期、翻译入口）
 * - 展示今日重点（AI推荐内容）
 * - 展示每日健康快览（健康数据记录）
 * - 展示记录与提升（健康进度、历史知识、历史心理学）
 * - 展示热点资讯（六大平台热点榜）
 */

import type { HomeInfoVo, DailyHealth } from '@/types'
import { homeApi } from '@/api/modules/home'
import { showError } from '@/utils/toast'

// 组件
import InfoBar from './components/InfoBar.vue'
import TodayFocus from './components/TodayFocus.vue'
import HealthOverview from './components/HealthOverview.vue'
import RecordTabs from './components/RecordTabs.vue'
import NewsFlow from './components/NewsFlow.vue'

// ==================== 响应式状态 ====================
const homeInfo = ref<HomeInfoVo | null>(null)
const healthData = ref<DailyHealth | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const lastFetchTime = ref<number>(0)

// 提供 healthData 给子组件
provide('healthData', healthData)

// ==================== 常量 ====================
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

// ==================== 计算属性 ====================
const shouldLoadData = computed(() => {
  if (!homeInfo.value) return true
  const now = Date.now()
  return now - lastFetchTime.value >= CACHE_DURATION
})

// ==================== 方法 ====================
async function loadHomeInfo(forceRefresh = false) {
  // 如果缓存有效且不强制刷新，直接返回
  if (!forceRefresh && !shouldLoadData.value) {
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await homeApi.info()
    if (response.code === 200 && response.data) {
      homeInfo.value = response.data
      lastFetchTime.value = Date.now()
    } else {
      error.value = response.message || '加载失败'
      showError('加载首页信息失败')
    }
  } catch (err: any) {
    console.error('加载首页信息失败:', err)
    if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
      error.value = '网络连接失败，请检查网络设置'
    } else if (err.response?.status >= 500) {
      error.value = '服务暂时不可用，请稍后重试'
    } else {
      error.value = '加载失败，请重试'
    }
  } finally {
    loading.value = false
  }
}

function handleRetry() {
  loadHomeInfo(true)
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadHomeInfo()
})
</script>

<template>
  <div class="min-h-full bg-clay-bg-base relative overflow-hidden">
    <!-- 左侧呼吸泛光 -->
    <div class="side-glow side-glow--left" aria-hidden="true"></div>
    <!-- 右侧呼吸泛光 -->
    <div class="side-glow side-glow--right" aria-hidden="true"></div>

    <div class="container mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
      <!-- 加载状态 -->
      <div v-if="loading && !homeInfo" class="flex items-center justify-center min-h-[60vh]">
        <div class="text-center space-y-4">
          <div class="relative w-20 h-20 mx-auto">
            <div class="w-20 h-20 border-4 border-clay-primary/20 rounded-full"></div>
            <div
              class="absolute top-0 left-0 w-20 h-20 border-4 border-clay-primary border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
          <p class="text-clay-text-secondary">正在加载...</p>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error && !homeInfo" class="flex items-center justify-center min-h-[60vh]">
        <div class="clay-card p-8 md:p-12 text-center max-w-md">
          <AppIcon icon="mdi:alert-circle" :size="64" class="text-red-500 mx-auto mb-6" />
          <h2 class="text-xl font-bold text-clay-text-primary mb-4">加载失败</h2>
          <p class="text-clay-text-secondary mb-8">{{ error }}</p>
          <button @click="handleRetry" class="clay-btn w-full py-3">
            <AppIcon icon="mdi:refresh" :size="20" class="mr-2" />
            重试
          </button>
        </div>
      </div>

      <!-- 正常内容 -->
      <Transition name="fade" mode="out-in">
        <div v-if="homeInfo" class="space-y-6 md:space-y-8">
          <!-- InfoBar: 顶部信息栏 -->
          <Transition name="slide-down">
            <InfoBar :saying="homeInfo?.saying" :weather="homeInfo?.weather" />
          </Transition>

          <!-- 第一行: TodayFocus + HealthOverview -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <!-- TodayFocus: 今日重点 -->
            <Transition name="slide-up" :delay="100">
              <section v-show="true" aria-labelledby="today-focus-title" class="flex flex-col">
                <TodayFocus :aiRecommend="homeInfo?.aiRecommend" />
              </section>
            </Transition>

            <!-- HealthOverview: 每日健康快览 -->
            <Transition name="slide-up" :delay="200">
              <section v-show="true" aria-labelledby="health-overview-title" class="flex flex-col">
                <HealthOverview />
              </section>
            </Transition>
          </div>

          <!-- 第二行: RecordTabs (全宽) -->
          <Transition name="slide-up" :delay="300">
            <section v-show="true" aria-labelledby="record-tabs-title">
              <RecordTabs />
            </section>
          </Transition>

          <!-- 第三行: NewsFlow -->
          <Transition name="slide-up" :delay="400">
            <section v-show="true" aria-labelledby="news-flow-title">
              <h2 id="news-flow-title" class="sr-only">热点资讯</h2>
              <NewsFlow :hotBoards="homeInfo?.hotBoards" />
            </section>
          </Transition>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* 侧边呼吸泛光 */
.side-glow {
  position: fixed;
  top: 2%;
  bottom: 5%;
  width: 150px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
  filter: blur(50px);
  background: radial-gradient(ellipse at center, var(--clay-accent-pink) 0%, transparent 65%);
  animation: sideGlow 5s ease-in-out infinite;
}

.side-glow--left {
  left: 0;
  transform: translateX(-40%);
}

.side-glow--right {
  right: 0;
  transform: translateX(40%);
}

@keyframes sideGlow {
  0%,
  100% {
    opacity: 0.3;
    transform: translateX(-40%) scaleY(0.95);
  }
  50% {
    opacity: 0.6;
    transform: translateX(-40%) scaleY(1.05);
  }
}

.side-glow--right {
  animation-name: sideGlowRight;
}

@keyframes sideGlowRight {
  0%,
  100% {
    opacity: 0.3;
    transform: translateX(40%) scaleY(0.9);
  }
  50% {
    opacity: 0.6;
    transform: translateX(40%) scaleY(1.1);
  }
}

@media (max-width: 768px) {
  .side-glow {
    width: 100px;
    filter: blur(40px);
    opacity: 0.2;
  }
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 向下滑入动画 */
.slide-down-enter-active {
  transition: all 0.5s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

/* 向上滑入动画 */
.slide-up-enter-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>

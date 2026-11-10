<script setup lang="ts">
/**
 * 首页 - Goalias OS 健康生活管理系统
 *
 * - 首屏先出骨架动效，不因 /home/info 阻塞整页空白
 * - 生活日历在 RecordTabs 内异步加载，独立 loading
 */

import type { HomeInfoVo, DailyHealth } from '@/types'
import { homeApi } from '@/api/modules/home'
import { showError } from '@/utils/toast'

import InfoBar from './components/InfoBar.vue'
import TodayFocus from './components/TodayFocus.vue'
import HealthOverview from './components/HealthOverview.vue'
import RecordTabs from './components/RecordTabs.vue'
import NewsFlow from './components/NewsFlow.vue'

const homeInfo = ref<HomeInfoVo | null>(null)
const healthData = ref<DailyHealth | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const lastFetchTime = ref<number>(0)

provide('healthData', healthData)

const CACHE_DURATION = 5 * 60 * 1000

const shouldLoadData = computed(() => {
  if (!homeInfo.value) return true
  return Date.now() - lastFetchTime.value >= CACHE_DURATION
})

/** 有缓存数据时仍可展示内容，后台刷新 */
const showContent = computed(() => !!homeInfo.value)
const showSkeleton = computed(() => loading.value && !homeInfo.value)

async function loadHomeInfo(forceRefresh = false) {
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
      if (!homeInfo.value) showError('加载首页信息失败')
    }
  } catch (err: any) {
    console.error('加载首页信息失败:', err)
    if (!homeInfo.value) {
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        error.value = '网络连接失败，请检查网络设置'
      } else if (err.response?.status >= 500) {
        error.value = '服务暂时不可用，请稍后重试'
      } else {
        error.value = '加载失败，请重试'
      }
    }
  } finally {
    loading.value = false
  }
}

function handleRetry() {
  loadHomeInfo(true)
}

onMounted(() => {
  loadHomeInfo()
})
</script>

<template>
  <div class="min-h-full bg-clay-bg-base relative overflow-hidden">
    <div class="side-glow side-glow--left" aria-hidden="true"></div>
    <div class="side-glow side-glow--right" aria-hidden="true"></div>

    <div class="container mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
      <!-- 首屏骨架：有加载动效，不整页白屏等待 -->
      <div v-if="showSkeleton" class="home-skeleton space-y-6 md:space-y-8" aria-busy="true">
        <div class="clay-card p-4 sm:p-5 overflow-hidden relative">
          <div class="skeleton-shimmer absolute inset-0 pointer-events-none" aria-hidden="true"></div>
          <div class="flex items-center gap-4">
            <div class="h-12 w-12 rounded-full bg-clay-bg-base animate-pulse"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-2/3 max-w-xs rounded bg-clay-bg-base animate-pulse"></div>
              <div class="h-3 w-1/2 max-w-[12rem] rounded bg-clay-bg-base/80 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div class="clay-card p-6 space-y-4 relative overflow-hidden">
            <div class="skeleton-shimmer absolute inset-0 pointer-events-none" aria-hidden="true"></div>
            <div class="h-5 w-28 rounded bg-clay-bg-base animate-pulse"></div>
            <div class="h-24 rounded-clay-md bg-clay-bg-base animate-pulse"></div>
            <div class="h-16 rounded-clay-md bg-clay-bg-base/80 animate-pulse"></div>
          </div>
          <div class="clay-card p-6 space-y-4 relative overflow-hidden">
            <div class="skeleton-shimmer absolute inset-0 pointer-events-none" aria-hidden="true"></div>
            <div class="flex items-center justify-between gap-3">
              <div class="h-5 w-24 rounded bg-clay-bg-base animate-pulse"></div>
              <div class="h-10 w-40 rounded-clay-md bg-clay-bg-base animate-pulse"></div>
            </div>
            <div class="h-12 rounded-clay-md bg-clay-bg-base animate-pulse"></div>
            <div class="h-12 rounded-clay-md bg-clay-bg-base/80 animate-pulse"></div>
            <div class="h-20 rounded-clay-md bg-clay-bg-base/70 animate-pulse"></div>
          </div>
        </div>

        <div class="clay-card p-4 sm:p-6 space-y-4 relative overflow-hidden">
          <div class="skeleton-shimmer absolute inset-0 pointer-events-none" aria-hidden="true"></div>
          <div class="flex gap-2 overflow-hidden">
            <div
              v-for="i in 4"
              :key="i"
              class="h-11 min-w-[6.5rem] flex-1 rounded-clay-md bg-clay-bg-base animate-pulse"
              :style="{ animationDelay: `${i * 80}ms` }"
            ></div>
          </div>
          <div class="h-5 w-28 rounded bg-clay-bg-base animate-pulse"></div>
          <div class="grid grid-cols-7 gap-1.5">
            <div
              v-for="i in 21"
              :key="i"
              class="h-12 sm:h-14 rounded-md bg-clay-bg-base/90 animate-pulse"
              :style="{ animationDelay: `${(i % 7) * 50}ms` }"
            ></div>
          </div>
          <p class="text-center text-sm text-clay-text-secondary pt-2">正在准备首页...</p>
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

      <!-- 正常内容：RecordTabs / 日历自行异步加载 -->
      <Transition name="fade" mode="out-in">
        <div v-if="showContent" class="space-y-6 md:space-y-8">
          <Transition name="slide-down">
            <InfoBar :saying="homeInfo?.saying" :weather="homeInfo?.weather" />
          </Transition>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <Transition name="slide-up">
              <section aria-labelledby="today-focus-title" class="flex flex-col">
                <TodayFocus :aiRecommend="homeInfo?.aiRecommend" />
              </section>
            </Transition>

            <Transition name="slide-up">
              <section aria-labelledby="health-overview-title" class="flex flex-col">
                <HealthOverview />
              </section>
            </Transition>
          </div>

          <Transition name="slide-up">
            <section aria-labelledby="record-tabs-title">
              <RecordTabs />
            </section>
          </Transition>

          <Transition name="slide-up">
            <section aria-labelledby="news-flow-title">
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
.side-glow {
  position: fixed;
  top: 8vh;
  bottom: 8vh;
  width: min(18vw, 240px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.42;
  border-radius: 999px;
  filter: blur(54px) saturate(1.15);
  background: linear-gradient(
    180deg,
    var(--clay-primary),
    var(--clay-accent-pink),
    var(--clay-accent-yellow),
    var(--clay-accent-green),
    var(--clay-primary)
  );
  background-size: 100% 320%;
  will-change: transform, background-position, filter;
}

.side-glow--left {
  left: 0;
  animation: side-light-flow-left 14s ease-in-out infinite;
}

.side-glow--right {
  right: 0;
  animation: side-light-flow-right 17s ease-in-out infinite reverse;
}

@keyframes side-light-flow-left {
  0%,
  100% {
    transform: translateX(-62%) translateY(-3%) rotate(-7deg) scaleY(0.92);
    background-position: 50% 0%;
    filter: blur(54px) saturate(1.05) hue-rotate(0deg);
  }
  50% {
    transform: translateX(-48%) translateY(4%) rotate(8deg) scaleY(1.08);
    background-position: 50% 100%;
    filter: blur(62px) saturate(1.25) hue-rotate(38deg);
  }
}

@keyframes side-light-flow-right {
  0%,
  100% {
    transform: translateX(62%) translateY(5%) rotate(8deg) scaleY(1.08);
    background-position: 50% 100%;
    filter: blur(56px) saturate(1.05) hue-rotate(28deg);
  }
  50% {
    transform: translateX(48%) translateY(-4%) rotate(-7deg) scaleY(0.92);
    background-position: 50% 0%;
    filter: blur(62px) saturate(1.3) hue-rotate(76deg);
  }
}

/* 骨架扫光 */
.skeleton-shimmer {
  background: linear-gradient(
    110deg,
    transparent 25%,
    rgba(255, 255, 255, 0.45) 45%,
    transparent 65%
  );
  background-size: 200% 100%;
  animation: skeleton-shine 1.4s ease-in-out infinite;
}

@keyframes skeleton-shine {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -80% 0;
  }
}

@media (max-width: 768px) {
  .side-glow {
    top: 14vh;
    bottom: 14vh;
    width: 112px;
    opacity: 0.2;
    filter: blur(42px) saturate(1.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .side-glow,
  .skeleton-shimmer {
    animation: none;
  }
}
</style>

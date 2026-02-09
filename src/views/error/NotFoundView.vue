<script setup lang="ts">
/**
 * 404 页面 - Claymorphism 风格
 *
 * 功能说明：
 * - 页面不存在提示
 * - 返回首页/上一页
 */

const router = useRouter()

const suggestions = [
  { title: '返回首页', icon: 'mdi:home', action: () => router.push('/') },
  { title: '返回上页', icon: 'mdi:arrow-left', action: () => router.back() },
]
</script>

<template>
  <div class="relative w-screen h-screen overflow-hidden bg-clay-bg-base">
    <!-- 背景动画 - 设置为绝对定位和低 z-index -->
    <div class="absolute inset-0 z-0">
      <BlackHoleBackground strokeColor="#3B43B8" />
    </div>

    <!-- 404 内容 -->
    <div class="relative z-10 w-full h-full flex items-center justify-center p-4">
      <div class="text-center max-w-lg">
        <!-- 404 数字 -->
        <div class="mb-8 animate-float">
          <div class="relative inline-block">
            <!-- 装饰圆圈 -->
            <div
              class="absolute -top-8 -left-8 w-24 h-24 bg-clay-primary/10 rounded-full blur-xl animate-breathe"
            ></div>
            <div
              class="absolute -bottom-4 -right-4 w-16 h-16 bg-clay-accent-pink/10 rounded-full blur-xl animate-breathe"
              style="animation-delay: 0.5s"
            ></div>

            <!-- 404 文字 -->
            <h1
              class="relative text-[120px] md:text-[160px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-clay-primary via-clay-primary-light to-clay-accent-pink leading-none"
            >
              404
            </h1>
          </div>
        </div>

        <!-- 提示信息卡片 -->
        <div class="clay-card p-8 mb-8">
          <div class="mb-4">
            <div
              class="inline-flex items-center justify-center w-16 h-16 bg-clay-primary/10 rounded-clay-md mb-4"
            >
              <AppIcon icon="mdi:map-marker-question" :size="32" class="text-clay-primary" />
            </div>
          </div>
          <h2 class="text-2xl font-heading font-bold text-clay-text-primary mb-3">
            您访问的页面坠入黑洞了 🙃
          </h2>
          <p class="text-clay-text-secondary mb-6">
            抱歉，您访问的页面可能已被移除、重命名或暂时不可用
          </p>

          <!-- 操作按钮 -->
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion.title"
              @click="suggestion.action"
              class="clay-btn-secondary px-6 py-3 flex items-center justify-center gap-2"
            >
              <AppIcon :icon="suggestion.icon" :size="20" />
              <span>{{ suggestion.title }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

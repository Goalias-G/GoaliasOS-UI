<script setup lang="ts">
/**
 * AI 对话系统主容器
 *
 * 功能说明:
 * - 提供整体布局结构(左右分栏)
 * - 管理响应式布局(移动端抽屉)
 * - 初始化 Session Store
 * - 组合 SessionSidebar 和 ChatArea 组件
 */

import { useSessionStore } from '@/stores/session'

// ==================== 响应式检测 ====================
const isMobile = useMediaQuery('(max-width: 768px)')

// ==================== Store ====================
const sessionStore = useSessionStore()

// ==================== 状态管理 ====================
/** 侧边栏是否展开(移动端) */
const isSidebarOpen = ref(false)

/** 初始化加载状态 */
const isInitializing = ref(true)

/** 初始化错误信息 */
const initError = ref<string | null>(null)

// ==================== 方法 ====================
/**
 * 切换侧边栏显示状态(移动端)
 */
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

/**
 * 关闭侧边栏(移动端选择会话后自动关闭)
 */
function closeSidebar() {
  isSidebarOpen.value = false
}

/**
 * 初始化应用
 */
async function initializeApp() {
  isInitializing.value = true
  initError.value = null

  try {
    // 初始化 Session Store
    // 初始化流程:
    // 1. 恢复 currentSessionId 和 currentModelId
    // 2. 调用 loadSessions() 加载会话列表
    // 3. 调用 loadModels() 加载模型列表
    // 4. 如果有 currentSessionId,调用 loadMessages(currentSessionId)
    // 5. 如果没有会话,自动创建新会话
    await sessionStore.init()

    console.log('AI 对话系统初始化成功')
  } catch (error) {
    console.error('初始化失败:', error)
    initError.value = error instanceof Error ? error.message : '初始化失败,请刷新页面重试'
  } finally {
    isInitializing.value = false
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  initializeApp()
})
</script>

<template>
  <div class="ai-chat-view flex h-full overflow-hidden bg-clay-bg-base">
    <!-- 初始化加载状态 -->
    <div
      v-if="isInitializing"
      class="fixed inset-0 z-50 flex items-center justify-center bg-clay-bg-base"
    >
      <div class="flex flex-col items-center gap-4">
        <AppIcon icon="mdi:loading" :size="48" class="animate-spin text-clay-primary" />
        <span class="text-clay-text-secondary">正在初始化...</span>
      </div>
    </div>

    <!-- 初始化错误状态 -->
    <div
      v-else-if="initError"
      class="fixed inset-0 z-50 flex items-center justify-center bg-clay-bg-base p-4"
    >
      <div class="clay-card shadow-clay-card p-8 max-w-md w-full text-center">
        <AppIcon icon="mdi:alert-circle" :size="64" class="mx-auto mb-4 text-red-500" />
        <h2 class="text-xl font-semibold text-clay-text-primary mb-2">初始化失败</h2>
        <p class="text-clay-text-secondary mb-6">{{ initError }}</p>
        <button class="clay-btn px-6 py-2" @click="initializeApp">重试</button>
      </div>
    </div>

    <!-- 主界面 -->
    <template v-else>
      <!-- 移动端菜单按钮 -->
      <button
        v-if="isMobile"
        class="fixed top-4 left-4 z-50 clay-btn w-12 h-12 flex items-center justify-center shadow-clay-button"
        :class="{ 'left-[calc(85vw+1rem)]': isSidebarOpen }"
        @click="toggleSidebar"
        aria-label="切换侧边栏"
      >
        <AppIcon :icon="isSidebarOpen ? 'mdi:close' : 'mdi:menu'" :size="24" />
      </button>

      <!-- 侧边栏遮罩层(移动端) -->
      <Transition name="fade">
        <div
          v-if="isSidebarOpen && isMobile"
          class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          @click="closeSidebar"
        ></div>
      </Transition>

      <!-- 会话侧边栏 -->
      <SessionSidebar :visible="isSidebarOpen || !isMobile" @close="closeSidebar" />

      <!-- 对话区域 -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <ChatArea />
      </main>
    </template>
  </div>
</template>

<style scoped>
/* ==================== 主容器 ==================== */
.ai-chat-view {
  font-family: var(--font-body);
}

/* ==================== 过渡动画 ==================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ==================== 响应式调整 ==================== */
@media (max-width: 768px) {
  .ai-chat-view {
    position: relative;
  }
}
</style>

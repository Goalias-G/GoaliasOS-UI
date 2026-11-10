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
      <!-- 移动端：左侧中部简约展开箭头（侧栏打开时隐藏） -->
      <button
        v-if="isMobile && !isSidebarOpen"
        type="button"
        class="session-edge-toggle"
        aria-label="展开会话列表"
        @click="toggleSidebar"
      >
        <AppIcon icon="mdi:chevron-right" :size="20" />
      </button>

      <!-- 侧边栏遮罩层(移动端) -->
      <Transition name="fade">
        <div
          v-if="isSidebarOpen && isMobile"
          class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
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
.ai-chat-view {
  font-family: var(--font-body);
}

/* 移动端左侧中部：简约向右箭头入口 */
.session-edge-toggle {
  position: fixed;
  left: 0;
  top: 50%;
  z-index: 45;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.375rem;
  height: 3rem;
  padding: 0;
  border: 1px solid rgba(66, 150, 237, 0.18);
  border-left: none;
  border-radius: 0 var(--radius-clay-sm) var(--radius-clay-sm) 0;
  background: color-mix(in srgb, var(--clay-bg-elevated) 92%, white);
  color: var(--clay-text-secondary);
  box-shadow:
    2px 0 10px rgba(66, 150, 237, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition:
    color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    width var(--duration-fast) var(--ease-out);
}

.session-edge-toggle:hover {
  width: 1.625rem;
  color: var(--clay-primary);
  background: var(--clay-bg-elevated);
  box-shadow:
    3px 0 14px rgba(66, 150, 237, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.session-edge-toggle:active {
  width: 1.25rem;
  box-shadow: var(--shadow-clay-pressed);
}

@media (max-width: 768px) {
  .ai-chat-view {
    position: relative;
  }
}

@media (prefers-reduced-motion: reduce) {
  .session-edge-toggle {
    transition: none;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

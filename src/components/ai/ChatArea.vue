<script setup lang="ts">
/**
 * ChatArea 对话区域组件
 *
 * 功能说明：
 * - 组合 MessageList 和 ChatInput 组件
 * - 实现 Flex 纵向布局（消息列表占据剩余空间）
 * - 处理消息发送事件（调用 Store.sendMessage）
 * - 处理停止生成事件（调用 Store.stopGeneration）
 * - 应用 Claymorphism 样式（bg-clay-bg-base）
 * - 实现加载状态显示
 */

import { useSessionStore } from '@/stores/session'

// ==================== Store ====================
const sessionStore = useSessionStore()
const { isStreaming, loading, isViewingArchivedSession, currentSession } = storeToRefs(sessionStore)

// ==================== 方法 ====================
/**
 * 处理发送消息
 * @param content 消息内容
 */
async function handleSendMessage(content: string) {
  try {
    await sessionStore.sendMessage(content)
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

/**
 * 处理停止生成
 */
async function handleStopGeneration() {
  try {
    await sessionStore.stopGeneration()
  } catch (error) {
    console.error('停止生成失败:', error)
  }
}
</script>

<template>
  <div class="chat-area h-full flex flex-col bg-clay-bg-base">
    <!-- 消息列表（占据剩余空间） -->
    <div class="flex-1 overflow-hidden">
      <MessageList />
    </div>

    <!-- 输入框容器（固定在底部） -->
    <div class="input-wrapper shrink-0 p-4">
      <div
        v-if="isViewingArchivedSession"
        class="clay-card flex items-center gap-3 px-4 py-3 text-sm text-clay-text-secondary"
      >
        <AppIcon icon="mdi:archive-lock-outline" :size="20" class="text-clay-primary" />
        <span
          >正在只读查看已归档会话「{{ currentSession?.sessionTitle || '未命名会话' }}」，不可继续 AI
          聊天。</span
        >
      </div>
      <ChatInput
        v-else
        :is-streaming="isStreaming"
        :disabled="loading.sending"
        @send="handleSendMessage"
        @stop="handleStopGeneration"
      />
    </div>
  </div>
</template>

<style scoped>
.chat-area {
  /* 确保组件占满父元素高度 */
  height: 100%;
  /* 背景色使用 Claymorphism 设计系统变量 */
  background: var(--clay-bg-base);
}

.input-wrapper {
  /* 输入框容器样式 */
  padding: 1rem;
  /* 确保输入框不会被挤压 */
  flex-shrink: 0;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .input-wrapper {
    padding: 0.75rem;
  }
}
</style>

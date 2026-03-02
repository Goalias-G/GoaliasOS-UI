<script setup lang="ts">
/**
 * MessageList 消息列表组件
 *
 * 功能说明：
 * - 展示会话的消息列表（用户消息和 AI 消息）
 * - 从 Store 获取消息列表和流式消息
 * - 实现自动滚动到最新消息
 * - 实现虚拟滚动优化（消息数量 > 100）
 * - 实现向上滚动加载历史消息（IntersectionObserver）
 * - 显示空状态提示和加载状态
 */

import { useSessionStore } from '@/stores/session'
import { useVirtualList, useIntersectionObserver } from '@vueuse/core'
import type { ChatMessage } from '@/types'

// ==================== Store ====================
const sessionStore = useSessionStore()
const { messages, streamingMessage, isStreaming, loading } = storeToRefs(sessionStore)

// ==================== 响应式状态 ====================
/** 消息列表容器引用 */
const containerRef = ref<HTMLElement | null>(null)

/** 加载更多触发器引用（列表顶部元素） */
const loadMoreTriggerRef = ref<HTMLElement | null>(null)

/** 是否应该自动滚动到底部 */
const shouldAutoScroll = ref(true)

/** 上次消息数量（用于检测新消息） */
const lastMessageCount = ref(0)

// ==================== 计算属性 ====================
/** 是否显示空状态 */
const showEmptyState = computed(() => {
  return messages.value.length === 0 && !streamingMessage.value && !loading.value.messages
})

/** 是否启用虚拟滚动（消息数量 > 100） */
const useVirtualScroll = computed(() => {
  return messages.value.length > 100
})

/** 所有消息（包括流式消息） */
const allMessages = computed(() => {
  const result = [...messages.value]

  // 如果有流式消息，添加到列表末尾
  if (streamingMessage.value) {
    result.push({
      id: -1, // 临时 ID
      role: streamingMessage.value.role,
      content: streamingMessage.value.content,
      sessionId: sessionStore.currentSessionId || 0,
      userId: 0,
      deductCost: 0,
      totalTokens: 0,
      modelName: '',
      remark: '',
      createTime: new Date().toISOString(),
    } as ChatMessage)
  }

  return result
})

// ==================== 虚拟滚动 ====================
const {
  list: virtualList,
  containerProps,
  wrapperProps,
} = useVirtualList(allMessages, {
  itemHeight: 100, // 预估消息项高度
  overscan: 5, // 预渲染额外的项数
})

// ==================== 方法 ====================
/**
 * 滚动到底部
 */
function scrollToBottom(smooth = true) {
  if (!containerRef.value) return

  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTo({
        top: containerRef.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
  })
}

/**
 * 处理滚动事件
 */
function handleScroll() {
  if (!containerRef.value) return

  const { scrollTop, scrollHeight, clientHeight } = containerRef.value

  // 判断是否接近底部（距离底部小于 100px）
  const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

  // 更新自动滚动标志
  shouldAutoScroll.value = isNearBottom
}

/**
 * 处理消息删除
 */
async function handleMessageDelete(messageId: number) {
  try {
    await sessionStore.deleteMessage(messageId)
  } catch (error) {
    console.error('删除消息失败:', error)
  }
}

/**
 * 处理消息复制
 */
function handleMessageCopy(content: string) {
  console.log('消息已复制:', content)
}

// ==================== 向上滚动加载历史消息 ====================
const { stop: stopObserver } = useIntersectionObserver(
  loadMoreTriggerRef,
  (entries) => {
    const entry = entries[0]
    // 当触发器进入视口且不在加载中时，加载更多消息
    if (entry && entry.isIntersecting && !loading.value.messages) {
      console.log('触发加载更多消息')
      sessionStore.loadMoreMessages()
    }
  },
  {
    threshold: 0.1, // 触发器 10% 可见时触发
  },
)

// ==================== 监听消息变化 ====================
watch(
  () => allMessages.value.length,
  (newCount) => {
    // 检测到新消息
    if (newCount > lastMessageCount.value) {
      // 如果应该自动滚动，则滚动到底部
      if (shouldAutoScroll.value) {
        scrollToBottom()
      }
    }

    lastMessageCount.value = newCount
  },
)

// ==================== 生命周期 ====================
onMounted(() => {
  // 初始化时滚动到底部
  scrollToBottom(false)

  // 初始化消息数量
  lastMessageCount.value = allMessages.value.length
})

onUnmounted(() => {
  // 清理 IntersectionObserver
  stopObserver()
})
</script>

<template>
  <div class="message-list-container h-full flex flex-col">
    <!-- 空状态提示 -->
    <div
      v-if="showEmptyState"
      class="flex-1 flex flex-col items-center justify-center p-8 text-center"
    >
      <div class="mb-6">
        <AppIcon icon="hugeicons:ai-idea" :size="80" class="text-clay-primary opacity-50" />
      </div>
      <h3 class="text-xl font-bold text-clay-text-primary mb-2">Hi,今天想聊点什么呢？</h3>
      <p class="text-clay-text-secondary max-w-md">输入您的问题或想法，GoaliasOS AI 将会帮助你！</p>
      <div class="mt-6 space-y-2 text-sm text-clay-text-muted">
        <p>💡 提示：您可以使用 Markdown 格式</p>
        <p>⌨️ 快捷键：Enter 发送，Shift + Enter 换行</p>
      </div>
    </div>

    <!-- 消息列表 -->
    <div
      v-else
      ref="containerRef"
      class="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      @scroll="handleScroll"
    >
      <!-- 加载更多触发器（列表顶部） -->
      <div v-if="messages.length > 0" ref="loadMoreTriggerRef" class="flex justify-center py-2">
        <div
          v-if="loading.messages"
          class="clay-card px-4 py-2 animate-breathe flex items-center gap-2"
        >
          <AppIcon icon="mdi:loading" :size="16" class="animate-spin text-clay-primary" />
          <span class="text-sm text-clay-text-secondary">加载中...</span>
        </div>
      </div>

      <!-- 虚拟滚动模式 -->
      <template v-if="useVirtualScroll">
        <div v-bind="containerProps" class="space-y-4">
          <div v-bind="wrapperProps">
            <MessageItem
              v-for="item in virtualList"
              :key="item.data.id"
              :message="item.data"
              @delete="handleMessageDelete"
              @copy="handleMessageCopy"
            />
          </div>
        </div>
      </template>

      <!-- 普通渲染模式 -->
      <template v-else>
        <MessageItem
          v-for="message in messages"
          :key="message.id"
          :message="message"
          @delete="handleMessageDelete"
          @copy="handleMessageCopy"
        />

        <!-- 流式消息 -->
        <div v-if="streamingMessage" class="space-y-3">
          <!-- 工具调用状态 -->
          <ToolCallStatus
            v-if="streamingMessage.toolCalls && streamingMessage.toolCalls.length > 0"
            :tool-calls="streamingMessage.toolCalls"
          />

          <!-- AI 消息内容 -->
          <MessageItem
            v-if="streamingMessage.content"
            :key="-1"
            :message="{
              id: -1,
              role: streamingMessage.role,
              content: streamingMessage.content,
              sessionId: sessionStore.currentSessionId || 0,
              userId: 0,
              deductCost: 0,
              totalTokens: 0,
              modelName: '',
              remark: '',
              createTime: new Date().toISOString(),
            }"
          />
        </div>

        <!-- 流式传输中的加载动画 -->
        <div v-if="isStreaming" class="flex justify-start">
          <div
            class="bg-clay-bg-elevated rounded-clay-md px-4 py-3 shadow-clay-card flex items-center gap-2"
          >
            <div class="animate-breathe">
              <AppIcon icon="mdi:dots-horizontal" :size="24" class="text-clay-primary" />
            </div>
            <span class="text-sm text-clay-text-secondary">OS AI 正在理解...</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.message-list-container {
  /* 确保容器占满父元素高度 */
  height: 100%;
}

/* 滚动条样式 */
.message-list-container :deep(.overflow-y-auto) {
  scrollbar-width: thin;
  scrollbar-color: var(--clay-primary-light) transparent;
}

.message-list-container :deep(.overflow-y-auto::-webkit-scrollbar) {
  width: 8px;
}

.message-list-container :deep(.overflow-y-auto::-webkit-scrollbar-track) {
  background: transparent;
}

.message-list-container :deep(.overflow-y-auto::-webkit-scrollbar-thumb) {
  background: var(--clay-primary-light);
  border-radius: 4px;
}

.message-list-container :deep(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
  background: var(--clay-primary);
}

/* 平滑滚动 */
.overflow-y-auto {
  scroll-behavior: smooth;
}
</style>

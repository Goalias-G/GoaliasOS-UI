<script setup lang="ts">
/**
 * ChatInput 输入框组件
 *
 * 功能说明：
 * - 提供消息输入功能
 * - 支持自动高度调整（最大 5 行）
 * - 支持快捷键（Enter 发送，Shift+Enter 换行）
 * - 根据状态切换发送/停止按钮
 * - 显示联网搜索开关和知识库信息
 * - 应用 Claymorphism 设计风格
 */

import { useSessionStore } from '@/stores/session'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

// ==================== Props 定义 ====================
interface Props {
  /** 是否禁用输入 */
  disabled?: boolean
  /** 是否正在流式传输 */
  isStreaming?: boolean
  /** 输入框占位符 */
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  isStreaming: false,
  placeholder: '...有点什么想法？',
})

// ==================== Emits 定义 ====================
const emit = defineEmits<{
  send: [content: string]
  stop: []
}>()

// ==================== Store ====================
const sessionStore = useSessionStore()
const { currentModel, currentKnowledgeName, enableWebSearch } = storeToRefs(sessionStore)

const userStore = useUserStore()
const { userBalance } = storeToRefs(userStore)

// ==================== 状态 ====================
const inputValue = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isRefreshing = ref(false)

// ==================== 计算属性 ====================
/** 是否可以发送（输入不为空且未禁用） */
const canSend = computed(() => {
  return inputValue.value.trim().length > 0 && !props.disabled && !props.isStreaming
})

/** 输入框是否禁用 */
const isInputDisabled = computed(() => {
  return props.disabled || props.isStreaming
})

/** 当前模型是否支持联网搜索 */
const supportsWebSearch = computed(() => {
  return currentModel.value?.enableSearch === 1
})

// ==================== 方法 ====================
/**
 * 自动调整 textarea 高度
 */
function adjustHeight() {
  if (!textareaRef.value) return

  // 重置高度以获取正确的 scrollHeight
  textareaRef.value.style.height = 'auto'

  // 计算新高度（最大 5 行）
  const lineHeight = 24 // 行高（px）
  const maxLines = 5
  const maxHeight = lineHeight * maxLines

  const newHeight = Math.min(textareaRef.value.scrollHeight, maxHeight)
  textareaRef.value.style.height = `${newHeight}px`
}

/**
 * 处理键盘事件
 */
function handleKeydown(event: KeyboardEvent) {
  // Enter 发送消息，Shift+Enter 换行
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

/**
 * 处理发送消息
 */
function handleSend() {
  if (!canSend.value) return

  const content = inputValue.value.trim()
  if (content) {
    emit('send', content)
    clear()
  }
}

/**
 * 处理停止生成
 */
function handleStop() {
  emit('stop')
}

/**
 * 清空输入框
 */
function clear() {
  inputValue.value = ''
  nextTick(() => {
    adjustHeight()
  })
}

/**
 * 切换联网搜索
 */
function toggleWebSearch() {
  sessionStore.toggleWebSearch()
}

/**
 * 刷新用户余额
 */
async function handleRefreshBalance() {
  if (isRefreshing.value) return

  isRefreshing.value = true
  try {
    await userStore.fetchUserInfo()
  } catch (error) {
    console.error('刷新余额失败:', error)
  } finally {
    isRefreshing.value = false
  }
}

// ==================== 监听输入变化 ====================
watch(inputValue, () => {
  nextTick(() => {
    adjustHeight()
  })
})

// ==================== 生命周期 ====================
onMounted(() => {
  adjustHeight()
})
</script>

<template>
  <div class="chat-input-wrapper bg-clay-bg-elevated rounded-clay-lg shadow-clay-card p-4">
    <div class="flex items-end gap-3">
      <!-- 输入框 -->
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="inputValue"
          :placeholder="isInputDisabled ? '发送中，请稍候...' : placeholder"
          :disabled="isInputDisabled"
          class="clay-input w-full resize-none overflow-y-auto"
          :class="{
            'opacity-50 cursor-not-allowed': isInputDisabled,
          }"
          rows="1"
          @keydown="handleKeydown"
        />
      </div>

      <!-- 发送/停止按钮 -->
      <div class="shrink-0">
        <!-- 停止按钮（流式传输中） -->
        <button
          v-if="isStreaming"
          type="button"
          class="clay-btn-secondary shadow-clay-button hover:shadow-clay-hover active:shadow-clay-pressed transition-all duration-200 px-4 py-2 flex items-center gap-2"
          @click="handleStop"
        >
          <AppIcon icon="mdi:stop-circle-outline" :size="20" />
          <span class="hidden sm:inline">停止</span>
        </button>

        <!-- 发送按钮 -->
        <button
          v-else
          type="button"
          :disabled="!canSend || disabled"
          class="clay-btn shadow-clay-button transition-all duration-200 px-4 py-2 flex items-center gap-2"
          :class="{
            'opacity-50 cursor-not-allowed': !canSend || disabled,
            'hover:shadow-clay-hover active:shadow-clay-pressed': canSend && !disabled,
            'animate-breathe': disabled,
          }"
          @click="handleSend"
        >
          <AppIcon
            :icon="disabled ? 'mdi:loading' : 'mdi:send'"
            :size="20"
            :class="{ 'animate-spin': disabled }"
          />
          <span class="hidden sm:inline">{{ disabled ? '发送中...' : '发送' }}</span>
        </button>
      </div>
    </div>

    <!-- 提示文本和功能区 -->
    <div class="mt-2 flex items-center justify-between gap-4">
      <!-- 左侧：联网搜索和知识库 -->
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- 联网搜索开关 -->
        <button
          v-if="supportsWebSearch"
          :class="[
            'flex items-center gap-1.5 px-2 py-1 rounded-clay-sm text-xs transition-all duration-200',
            enableWebSearch
              ? 'bg-clay-primary/10 text-clay-primary'
              : 'bg-clay-bg-base text-clay-text-secondary hover:bg-clay-primary/5',
          ]"
          @click="toggleWebSearch"
        >
          <AppIcon :icon="enableWebSearch ? 'mdi:web-check' : 'mdi:web'" :size="14" />
          <span>联网搜索</span>
        </button>

        <!-- 联网搜索不支持提示 -->
        <div
          v-else
          class="flex items-center gap-1.5 px-2 py-1 rounded-clay-sm text-xs bg-clay-bg-base text-clay-text-muted opacity-50 cursor-not-allowed"
          title="当前模型不支持联网搜索"
        >
          <AppIcon icon="mdi:web-off" :size="14" />
          <span>联网搜索</span>
        </div>

        <!-- 知识库显示 -->
        <div
          v-if="currentKnowledgeName"
          class="flex items-center gap-1.5 px-2 py-1 rounded-clay-sm text-xs bg-clay-primary/10 text-clay-primary"
        >
          <AppIcon icon="mdi:database" :size="14" />
          <span class="truncate max-w-[120px]">{{ currentKnowledgeName }}</span>
        </div>
      </div>

      <!-- 右侧：用户次数余额 -->
      <div class="flex items-center gap-1.5 text-xs text-clay-text-muted shrink-0">
        <AppIcon icon="mdi:ticket-outline" :size="14" />
        <span
          >剩余额度次数: <span class="font-medium text-clay-primary">{{ userBalance }}</span>
        </span>
        <button
          @click="handleRefreshBalance"
          :disabled="isRefreshing"
          class="ml-1 p-1 rounded-lg hover:bg-clay-bg-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="刷新余额"
        >
          <AppIcon icon="mdi:refresh" :size="14" :class="{ 'animate-spin': isRefreshing }" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-input-wrapper {
  /* 确保组件在底部固定时有合适的间距 */
  width: 100%;
}

.clay-input {
  /* 基础样式 */
  background: var(--clay-bg-base);
  border: 2px solid transparent;
  border-radius: var(--radius-clay-sm);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  line-height: 1.5rem;
  color: var(--clay-text-primary);
  transition: all 0.2s ease;

  /* 最小高度（1 行） */
  min-height: 3rem;

  /* 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: var(--clay-primary-light) transparent;
}

.clay-input::-webkit-scrollbar {
  width: 6px;
}

.clay-input::-webkit-scrollbar-track {
  background: transparent;
}

.clay-input::-webkit-scrollbar-thumb {
  background: var(--clay-primary-light);
  border-radius: 3px;
}

.clay-input:focus {
  outline: none;
  border-color: var(--clay-primary);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.clay-input::placeholder {
  color: var(--clay-text-muted);
}

.clay-input:disabled {
  background: var(--clay-bg-elevated);
  cursor: not-allowed;
}

/* 按钮样式 */
.clay-btn,
.clay-btn-secondary {
  border-radius: var(--radius-clay-sm);
  font-weight: 500;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.clay-btn {
  background: var(--clay-primary);
  color: var(--clay-text-inverse);
}

.clay-btn:hover:not(:disabled) {
  background: var(--clay-primary-dark);
  transform: translateY(-1px);
}

.clay-btn:active:not(:disabled) {
  transform: translateY(0);
}

.clay-btn-secondary {
  background: var(--clay-bg-base);
  color: var(--clay-text-primary);
  border: 2px solid var(--clay-primary-light);
}

.clay-btn-secondary:hover {
  background: var(--clay-primary-light);
  color: var(--clay-text-inverse);
  transform: translateY(-1px);
}

.clay-btn-secondary:active {
  transform: translateY(0);
}
</style>

/** * MessageItem 消息项组件 * * 功能说明： * - 展示单条聊天消息（用户消息或 AI 消息） * -
区分用户消息和 AI 消息样式（左右对齐、不同背景色） * - 集成 Markdown 渲染和代码高亮 * -
提供消息操作功能（复制、删除） * - 应用 Claymorphism 设计系统样式 */
<script setup lang="ts">
import type { ChatMessage } from '@/types'
import { renderMarkdown, initCodeCopy, copyToClipboard } from '@/utils/markdown'

// ==================== Props 定义 ====================
interface Props {
  /** 消息对象 */
  message: ChatMessage
}

const props = defineProps<Props>()

// ==================== Emits 定义 ====================
const emit = defineEmits<{
  /** 删除消息事件 */
  delete: [messageId: number]
  /** 复制消息事件（用于统计） */
  copy: [content: string]
}>()

// ==================== 响应式状态 ====================
/** 是否显示操作按钮 */
/* 复制按钮状态 */
const copyStatus = ref<'idle' | 'success' | 'error'>('idle')

/** 消息内容容器引用 */
const contentRef = ref<HTMLElement | null>(null)

// ==================== 计算属性 ====================
/** 是否为用户消息 */
const isUser = computed(() => props.message.role === 'user')

/** 渲染后的 HTML 内容 */
const renderedContent = computed(() => {
  return renderMarkdown(props.message.content)
})

/** 消息对齐方式 */
const alignmentClass = computed(() => {
  return isUser.value ? 'justify-end' : 'justify-start'
})

/** 消息容器样式类 */
const messageClass = computed(() => {
  return isUser.value
    ? 'bg-clay-primary text-clay-text-inverse'
    : 'bg-clay-bg-elevated text-clay-text-primary'
})

/** 完整的更新时间 */
const formattedTime = computed(() => {
  const sourceTime = props.message.updateTime || props.message.createTime
  if (!sourceTime) return '暂无更新时间'

  const date = new Date(sourceTime)
  if (Number.isNaN(date.getTime())) return sourceTime

  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
})
// ==================== 方法 ====================
/** 复制消息内容 */
async function handleCopy() {
  try {
    await copyToClipboard(props.message.content)
    copyStatus.value = 'success'
    emit('copy', props.message.content)

    // 2 秒后恢复状态
    setTimeout(() => {
      copyStatus.value = 'idle'
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    copyStatus.value = 'error'

    setTimeout(() => {
      copyStatus.value = 'idle'
    }, 2000)
  }
}

/** 删除消息 */
function handleDelete() {
  emit('delete', props.message.id)
}

// ==================== 生命周期 ====================
/** 初始化代码块复制功能 */
onMounted(() => {
  if (contentRef.value) {
    const cleanup = initCodeCopy(contentRef.value)

    // 组件卸载时清理
    onUnmounted(() => {
      cleanup()
    })
  }
})
</script>

<template>
  <div :class="['flex w-full', alignmentClass]">
    <!-- 消息容器 -->
    <div
      :class="[
        'message-item relative max-w-[80%] px-4 py-3 rounded-clay-md shadow-clay-card transition-all duration-normal ease-clay-out',
        messageClass,
      ]"
    >
      <!-- 消息内容 -->
      <div
        ref="contentRef"
        :class="['message-content prose prose-sm max-w-none', isUser ? 'prose-invert' : '']"
        v-html="renderedContent"
      />

      <!-- 消息扩展行：完整更新时间和操作 -->
      <div
        :class="[
          'message-meta mt-3 flex items-center justify-between gap-3 text-xs opacity-70',
          isUser ? 'text-clay-text-inverse' : 'text-clay-text-muted',
        ]"
      >
        <span>{{ formattedTime }}</span>
        <div class="flex items-center gap-1">
          <button
            :class="[
              'action-btn p-1 rounded-clay-sm transition-all duration-fast ease-clay-out',
              isUser
                ? 'hover:bg-white/20 text-clay-text-inverse'
                : 'hover:bg-clay-primary/10 text-clay-text-secondary hover:text-clay-primary',
            ]"
            :title="copyStatus === 'success' ? '已复制' : '复制消息'"
            @click="handleCopy"
          >
            <AppIcon v-if="copyStatus === 'idle'" icon="mdi:content-copy" :size="16" />
            <AppIcon v-else-if="copyStatus === 'success'" icon="mdi:check" :size="16" />
            <AppIcon v-else icon="mdi:alert-circle" :size="16" />
          </button>
          <button
            :class="[
              'action-btn p-1 rounded-clay-sm transition-all duration-fast ease-clay-out',
              isUser
                ? 'hover:bg-red-500/80 text-clay-text-inverse'
                : 'hover:bg-red-500/10 text-clay-text-secondary hover:text-red-500',
            ]"
            title="删除消息"
            @click="handleDelete"
          >
            <AppIcon icon="mdi:delete-outline" :size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ==================== 消息项样式 ==================== */
.message-item {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* ==================== 操作按钮动画 ==================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.action-btn {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.action-btn:active {
  transform: scale(0.95);
}
</style>

<style>
/* ==================== Markdown 内容样式（全局） ==================== */
/* 导入 highlight.js 样式 */
@import 'highlight.js/styles/github-dark.css';

/* Prose 样式覆盖（适配 Claymorphism） */
.message-content.prose {
  font-size: 0.95rem;
  line-height: 1.7;
}

.message-content.prose p {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.message-content.prose p:first-child {
  margin-top: 0;
}

.message-content.prose p:last-child {
  margin-bottom: 0;
}

.message-content.prose code {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 6px;
  font-size: 0.9em;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.message-content.prose-invert code {
  background-color: rgba(255, 255, 255, 0.2);
}

.message-content.prose pre {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 0;
  background-color: transparent;
  border-radius: var(--radius-clay-md);
  overflow: hidden;
}

.message-content.prose pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

/* 代码块容器样式 */
.message-content :deep(.hljs-code-block) {
  position: relative;
  background-color: #1e1e1e;
  border-radius: var(--radius-clay-md);
  overflow: hidden;
  box-shadow: var(--shadow-clay-card);
}

.message-content :deep(.hljs-code-block code) {
  display: block;
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.9em;
  line-height: 1.6;
  color: #d4d4d4;
}

/* 代码块语言标签 */
.message-content :deep(.hljs-code-block::before) {
  content: attr(data-lang);
  position: absolute;
  top: 0.5rem;
  right: 4rem;
  padding: 0.25rem 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  border-radius: 6px;
  text-transform: uppercase;
  font-weight: 600;
  z-index: 1;
}

/* 复制按钮样式 */
.message-content :deep(.copy-code-btn) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.4rem 0.8rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  z-index: 2;
}

.message-content :deep(.copy-code-btn:hover) {
  background-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 1);
}

.message-content :deep(.copy-code-btn.copied) {
  background-color: var(--clay-success);
  color: white;
}

/* 链接样式 */
.message-content.prose a {
  color: var(--clay-primary-light);
  text-decoration: underline;
  transition: color var(--duration-fast) var(--ease-out);
}

.message-content.prose a:hover {
  color: var(--clay-primary);
}

.message-content.prose-invert a {
  color: rgba(255, 255, 255, 0.9);
}

.message-content.prose-invert a:hover {
  color: white;
}

/* 列表样式 */
.message-content.prose ul,
.message-content.prose ol {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
}

.message-content.prose li {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

/* 引用样式 */
.message-content.prose blockquote {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding-left: 1rem;
  border-left: 4px solid var(--clay-primary-light);
  font-style: italic;
  opacity: 0.9;
}

.message-content.prose-invert blockquote {
  border-left-color: rgba(255, 255, 255, 0.5);
}

/* 表格样式 */
.message-content.prose table {
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  border-collapse: collapse;
}

.message-content.prose th,
.message-content.prose td {
  padding: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.message-content.prose-invert th,
.message-content.prose-invert td {
  border-color: rgba(255, 255, 255, 0.2);
}

.message-content.prose th {
  background-color: rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

.message-content.prose-invert th {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 标题样式 */
.message-content.prose h1,
.message-content.prose h2,
.message-content.prose h3,
.message-content.prose h4,
.message-content.prose h5,
.message-content.prose h6 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.message-content.prose h1:first-child,
.message-content.prose h2:first-child,
.message-content.prose h3:first-child,
.message-content.prose h4:first-child,
.message-content.prose h5:first-child,
.message-content.prose h6:first-child {
  margin-top: 0;
}

/* 水平分割线 */
.message-content.prose hr {
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: none;
  border-top: 2px solid rgba(0, 0, 0, 0.1);
}

.message-content.prose-invert hr {
  border-top-color: rgba(255, 255, 255, 0.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .message-item {
    max-width: 90% !important;
  }

  .message-content :deep(.hljs-code-block code) {
    font-size: 0.85em;
  }
}
</style>

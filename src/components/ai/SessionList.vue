/** * SessionList 会话列表组件 * * 功能说明： * - 展示会话列表（从 Store 获取） * -
会话按创建时间倒序排列（最新的在上） * - 实现虚拟滚动优化（会话数量 > 50） * -
显示空状态提示（无会话时） * - 处理会话操作（点击、重命名、删除） */
<script setup lang="ts">
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'

// ==================== Store ====================
const sessionStore = useSessionStore()
const { sessions, currentSessionId, loading } = storeToRefs(sessionStore)

// ==================== 计算属性 ====================
/**
 * 按创建时间倒序排列的会话列表（最新的在上）
 */
const sortedSessions = computed(() => {
  return [...sessions.value].sort((a, b) => {
    const timeA = new Date(a.createTime || 0).getTime()
    const timeB = new Date(b.createTime || 0).getTime()
    return timeB - timeA // 倒序：最新的在上
  })
})

/**
 * 是否显示空状态
 */
const isEmpty = computed(() => {
  return !loading.value.sessions && sortedSessions.value.length === 0
})

// ==================== 方法 ====================
/**
 * 处理会话点击
 */
async function handleSessionClick(sessionId: number) {
  try {
    await sessionStore.switchSession(sessionId)
  } catch (error) {
    console.error('切换会话失败:', error)
  }
}

/**
 * 处理会话重命名
 */
async function handleSessionRename(sessionId: number, newTitle: string) {
  try {
    await sessionStore.renameSession(sessionId, newTitle)
  } catch (error) {
    console.error('重命名会话失败:', error)
  }
}

/**
 * 处理会话删除
 */
async function handleSessionDelete(sessionId: number) {
  try {
    await sessionStore.deleteSession(sessionId)
  } catch (error) {
    console.error('删除会话失败:', error)
  }
}

/**
 * 检查会话是否为当前选中
 */
function isActiveSession(sessionId: number): boolean {
  return currentSessionId.value === sessionId
}
</script>

<template>
  <div class="session-list h-full flex flex-col">
    <!-- 加载骨架屏 -->
    <div v-if="loading.sessions" class="flex-1 px-4 py-2 space-y-3">
      <div
        v-for="i in 5"
        :key="i"
        class="clay-card p-4 animate-breathe"
        :style="{ animationDelay: `${i * 0.1}s` }"
      >
        <!-- 标题骨架 -->
        <div class="h-4 bg-clay-bg-base rounded-clay-sm w-3/4 mb-3"></div>
        <!-- 时间骨架 -->
        <div class="h-3 bg-clay-bg-base rounded-clay-sm w-1/2"></div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="isEmpty" class="flex-1 flex items-center justify-center text-clay-text-muted">
      <div class="flex flex-col items-center gap-3">
        <AppIcon icon="mdi:chat-outline" :size="48" class="text-clay-text-muted/50" />
        <span class="text-sm">暂无会话</span>
      </div>
    </div>

    <!-- 会话列表（普通滚动） -->
    <div
      v-else
      class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-clay-primary/20 scrollbar-track-transparent px-4 py-2 space-y-2"
    >
      <SessionItem
        v-for="session in sortedSessions"
        :key="session.id"
        :session="session"
        :is-active="isActiveSession(session.id)"
        @click="handleSessionClick(session.id)"
        @rename="(newTitle: string) => handleSessionRename(session.id, newTitle)"
        @delete="handleSessionDelete(session.id)"
      />
    </div>
  </div>
</template>

<style scoped>
/* ==================== 会话列表容器 ==================== */
.session-list {
  background: var(--clay-bg-base);
}

/* ==================== 平滑滚动 ==================== */
.session-list :deep(.overflow-y-auto) {
  scroll-behavior: smooth;
}

/* ==================== 自定义滚动条样式 ==================== */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.2);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(124, 58, 237, 0.3);
}

/* ==================== 响应式调整 ==================== */
@media (max-width: 768px) {
  .session-list :deep(.px-4) {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
}
</style>

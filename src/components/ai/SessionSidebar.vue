/** * SessionSidebar 会话侧边栏组件 * * 功能说明: * - 组合
ModelSelector、SessionList、KnowledgeSelector、PromptSelector 组件 * - 实现"新建会话"按钮 * -
实现"知识库"和"提示词"入口按钮 * - 实现响应式布局(桌面端固定,移动端抽屉) */
<script setup lang="ts">
import { useSessionStore } from '@/stores/session'

// ==================== Props ====================
interface Props {
  /** 是否显示侧边栏(移动端) */
  visible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
})

// ==================== Emits ====================
const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

// ==================== Store ====================
const sessionStore = useSessionStore()

// ==================== 状态 ====================
/** 是否显示知识库选择器 */
const showKnowledgeSelector = ref(false)

/** 是否展开底部设置菜单 */
const showSettingsMenu = ref(false)

/** 是否显示已归档会话 */
const showArchivedSessions = ref(false)

/** 是否显示用户画像 */
const showUserProfile = ref(false)

/** 是否显示提示词选择器 */
const showPromptSelector = ref(false)

/** 输入框内容(用于接收提示词) */
const promptContent = ref('')

// ==================== 方法 ====================
/**
 * 处理新建会话
 */
async function handleCreateSession() {
  try {
    await sessionStore.createSession()
  } catch (error) {
    console.error('创建会话失败:', error)
  }
}

/**
 * 打开知识库选择器
 */
function openKnowledgeSelector() {
  showSettingsMenu.value = false
  showKnowledgeSelector.value = true
}

/** 打开已归档会话 */
function openArchivedSessions() {
  showSettingsMenu.value = false
  showArchivedSessions.value = true
}

/** 打开用户画像 */
function openUserProfile() {
  showSettingsMenu.value = false
  showUserProfile.value = true
}
/**
 * 打开提示词选择器
 */
function openPromptSelector() {
  showPromptSelector.value = true
}

/**
 * 处理提示词选择
 */
function handlePromptSelect(content: string) {
  promptContent.value = content
  // 触发事件通知父组件
  emit('update:visible', false)
}

/**
 * 关闭侧边栏(移动端)
 */
function closeSidebar() {
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <div
    class="session-sidebar h-full flex flex-col bg-clay-bg-elevated shadow-clay-card"
    :class="{ 'sidebar-visible': visible }"
  >
    <!-- 侧边栏头部 -->
    <div class="sidebar-header px-4 py-3 border-b border-clay-primary/10">
      <div class="flex items-center justify-between gap-2">
        <!-- 新建会话按钮 -->
        <ShimmerButton
          class="new-session-button flex-1 px-4! py-3! flex items-center justify-center gap-2"
          :shimmer-color="'var(--clay-primary)'"
          :background="'var(--clay-accent-pink)'"
          :border-radius="'var(--radius-clay-md)'"
          :shimmerSize="'0.2em'"
          shimmer-duration="2s"
          @click="handleCreateSession"
        >
          <AppIcon icon="hugeicons:bubble-chat-spark-01" :size="20" />
          <span>新建会话</span>
        </ShimmerButton>

        <!-- 关闭按钮(仅移动端显示) -->
        <button
          class="close-button md:hidden p-2 rounded-full hover:bg-clay-primary/10 transition-colors shrink-0"
          @click="closeSidebar"
        >
          <AppIcon icon="mdi:close" :size="20" class="text-clay-text-secondary" />
        </button>
      </div>
    </div>

    <!-- 模型选择器 -->
    <div class="px-4 py-3 border-b border-clay-primary/10">
      <ModelSelector />
    </div>

    <!-- 会话列表 -->
    <div class="flex-1 overflow-hidden border-b border-clay-primary/10">
      <SessionList />
    </div>

    <!-- 侧边栏底部设置 -->
    <div class="sidebar-footer relative px-4 py-3">
      <Transition name="settings-menu">
        <div
          v-if="showSettingsMenu"
          class="absolute bottom-full left-4 right-4 mb-2 overflow-hidden rounded-clay-md bg-clay-bg-elevated p-2 shadow-clay-card"
        >
          <button
            class="settings-option w-full rounded-clay-sm px-3 py-2.5 text-left text-sm text-clay-text-primary hover:bg-clay-primary/10"
            @click="openKnowledgeSelector"
          >
            <AppIcon icon="mdi:database-outline" :size="18" />
            <span>知识库</span>
          </button>
          <button
            class="settings-option w-full rounded-clay-sm px-3 py-2.5 text-left text-sm text-clay-text-primary hover:bg-clay-primary/10"
            @click="openArchivedSessions"
          >
            <AppIcon icon="mdi:archive-clock-outline" :size="18" />
            <span>已归档会话记录</span>
          </button>
          <button
            class="settings-option w-full rounded-clay-sm px-3 py-2.5 text-left text-sm text-clay-text-primary hover:bg-clay-primary/10"
            @click="openUserProfile"
          >
            <AppIcon icon="mdi:account-details-outline" :size="18" />
            <span>用户画像</span>
          </button>
        </div>
      </Transition>

      <button
        class="w-full clay-btn-secondary px-4 py-2.5 flex items-center justify-center gap-2"
        @click="showSettingsMenu = !showSettingsMenu"
      >
        <AppIcon icon="mdi:cog-outline" :size="18" />
        <span>设置</span>
        <AppIcon :icon="showSettingsMenu ? 'mdi:chevron-down' : 'mdi:chevron-up'" :size="18" />
      </button>
    </div>

    <KnowledgeSelector v-model:visible="showKnowledgeSelector" />
    <ArchivedSessionSelector v-model:visible="showArchivedSessions" />
    <UserProfileViewer v-model:visible="showUserProfile" />
  </div>
</template>

<style scoped>
.settings-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.settings-menu-enter-active,
.settings-menu-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.settings-menu-enter-from,
.settings-menu-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
/* ==================== 侧边栏容器 ==================== */
.session-sidebar {
  border-radius: var(--radius-clay-lg);
  background: var(--clay-bg-elevated);
  width: 320px;
  transition: transform 0.3s ease;
}

/* ==================== 桌面端样式 ==================== */
@media (min-width: 768px) {
  .session-sidebar {
    border-radius: 0;
  }
}

/* ==================== 移动端样式 ==================== */
@media (max-width: 767px) {
  .session-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 85vw;
    max-width: 320px;
    z-index: 1000;
    transform: translateX(-100%);
    border-radius: 0 var(--radius-clay-lg) var(--radius-clay-lg) 0;
  }

  .session-sidebar.sidebar-visible {
    transform: translateX(0);
  }
}

/* ==================== 按钮样式 ==================== */
.new-session-button {
  font-weight: 500;
}

/* ==================== 响应式调整 ==================== */
@media (max-width: 640px) {
  .session-sidebar {
    width: 90vw;
  }
}
</style>

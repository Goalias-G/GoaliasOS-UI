/** * SessionItem 会话列表项组件 * * 功能说明： * - 展示单个会话项（标题和创建时间） * -
实现选中状态样式（高亮显示） * - 实现右键菜单（重命名、删除） * -
实现悬停效果（clay-card-hoverable） * - 应用 Claymorphism 设计系统样式 */
<script setup lang="ts">
import type { ChatSession } from '@/types'

// ==================== Props 定义 ====================
interface Props {
  /** 会话对象 */
  session: ChatSession
  /** 是否为当前选中的会话 */
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})

// ==================== Emits 定义 ====================
const emit = defineEmits<{
  /** 点击会话项 */
  click: []
  /** 重命名会话 */
  rename: [newTitle: string]
  /** 删除会话 */
  delete: []
}>()

// ==================== 响应式状态 ====================
/** 是否显示右键菜单 */
const showContextMenu = ref(false)

/** 右键菜单位置 */
const menuPosition = ref({ x: 0, y: 0 })

/** 是否处于重命名模式 */
const isRenaming = ref(false)

/** 重命名输入框的值 */
const renameValue = ref('')

/** 重命名输入框引用 */
const renameInputRef = ref<HTMLInputElement | null>(null)

// ==================== 计算属性 ====================
/** 会话项容器样式类 */
const containerClass = computed(() => {
  return [
    'session-item relative px-4 py-3 rounded-clay-md cursor-pointer transition-all duration-normal ease-clay-out',
    props.isActive
      ? 'bg-clay-primary text-clay-text-inverse shadow-clay-button'
      : 'bg-clay-bg-elevated text-clay-text-primary shadow-clay-card hover:shadow-clay-hover clay-card-hoverable',
  ]
})

/** 格式化创建时间 */
const formattedTime = computed(() => {
  if (!props.session.createTime) {
    return '刚刚'
  }

  const date = new Date(props.session.createTime)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 小于 1 分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }

  // 小于 1 小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes} 分钟前`
  }

  // 小于 24 小时
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours} 小时前`
  }

  // 小于 7 天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days} 天前`
  }

  // 显示日期
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  })
})

/** 显示的会话标题（截断过长的标题） */
const displayTitle = computed(() => {
  const title = props.session.sessionTitle || '新对话'
  return title.length > 20 ? title.slice(0, 20) + '...' : title
})

// ==================== 方法 ====================
/** 点击会话项 */
function handleClick() {
  if (!isRenaming.value) {
    emit('click')
  }
}

/** 右键点击 */
function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()

  // 获取调整后的菜单位置（防止移动端超出屏幕）
  const adjustedPos = getAdjustedPosition(event.clientX, event.clientY)

  menuPosition.value = {
    x: adjustedPos.x,
    y: adjustedPos.y,
  }

  showContextMenu.value = true
}

/** 开始重命名 */
function startRename() {
  showContextMenu.value = false
  isRenaming.value = true
  renameValue.value = props.session.sessionTitle || '新对话'

  // 等待 DOM 更新后聚焦输入框
  nextTick(() => {
    renameInputRef.value?.focus()
    renameInputRef.value?.select()
  })
}

/** 确认重命名 */
function confirmRename() {
  const newTitle = renameValue.value.trim()

  if (newTitle && newTitle !== props.session.sessionTitle) {
    emit('rename', newTitle)
  }

  isRenaming.value = false
}

/** 取消重命名 */
function cancelRename() {
  isRenaming.value = false
  renameValue.value = ''
}

/** 处理重命名输入框的键盘事件 */
function handleRenameKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    confirmRename()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    cancelRename()
  }
}

/** 删除会话 */
function handleDelete() {
  showContextMenu.value = false
  emit('delete')
}

/** 关闭右键菜单 */
function closeContextMenu() {
  showContextMenu.value = false
}

/** 获取调整后的菜单位置（防止移动端超出屏幕） */
function getAdjustedPosition(x: number, y: number) {
  const menuWidth = 160
  const menuHeight = 100
  const padding = 10

  let adjustedX = x
  let adjustedY = y

  // 获取视口尺寸
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // 水平方向调整
  if (x + menuWidth + padding > viewportWidth) {
    adjustedX = viewportWidth - menuWidth - padding
  }

  // 垂直方向调整
  if (y + menuHeight + padding > viewportHeight) {
    adjustedY = viewportHeight - menuHeight - padding
  }

  return { x: adjustedX, y: adjustedY }
}

// ==================== 生命周期 ====================
/** 监听全局点击事件，关闭右键菜单 */
onMounted(() => {
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})
</script>

<template>
  <div :class="containerClass" @click="handleClick" @contextmenu="handleContextMenu">
    <!-- 正常显示模式 -->
    <div v-if="!isRenaming" class="flex flex-col gap-1">
      <!-- 会话标题 -->
      <div
        :class="[
          'text-sm font-medium truncate',
          isActive ? 'text-clay-text-inverse' : 'text-clay-text-primary',
        ]"
        :title="session.sessionTitle || '新对话'"
      >
        {{ displayTitle }}
      </div>

      <!-- 创建时间 -->
      <div :class="['text-xs', isActive ? 'text-clay-text-inverse/70' : 'text-clay-text-muted']">
        {{ formattedTime }}
      </div>
    </div>

    <!-- 重命名模式 -->
    <div v-else class="flex items-center gap-2" @click.stop>
      <input
        ref="renameInputRef"
        v-model="renameValue"
        type="text"
        class="flex-1 px-2 py-1 text-sm bg-white/90 text-clay-text-primary border border-clay-primary rounded-clay-sm focus:outline-none focus:ring-2 focus:ring-clay-primary"
        @keydown="handleRenameKeydown"
        @blur="confirmRename"
      />
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showContextMenu"
          class="context-menu fixed z-1001 min-w-[160px] bg-clay-bg-elevated rounded-clay-md shadow-clay-card py-2"
          :style="{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
          }"
          @click.stop
        >
          <!-- 重命名选项 -->
          <button
            class="menu-item w-full px-4 py-2 text-left text-sm text-clay-text-primary hover:bg-clay-primary/10 transition-colors duration-fast flex items-center gap-2"
            @click="startRename"
          >
            <AppIcon icon="mdi:pencil-outline" :size="16" />
            <span>重命名</span>
          </button>

          <!-- 分割线 -->
          <div class="h-px bg-clay-text-muted/20 my-1" />

          <!-- 删除选项 -->
          <button
            class="menu-item w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors duration-fast flex items-center gap-2"
            @click="handleDelete"
          >
            <AppIcon icon="mdi:delete-outline" :size="16" />
            <span>删除</span>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ==================== 会话项样式 ==================== */
.session-item {
  user-select: none;
}

.session-item:active {
  transform: scale(0.98);
}

/* ==================== 右键菜单动画 ==================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ==================== 菜单项样式 ==================== */
.menu-item {
  cursor: pointer;
}

.menu-item:active {
  transform: scale(0.98);
}

/* ==================== 响应式调整 ==================== */
@media (max-width: 768px) {
  .session-item {
    padding: 0.875rem 1rem;
  }

  .context-menu {
    min-width: 140px;
  }
}
</style>

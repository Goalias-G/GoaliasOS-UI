/** * Toast 提示组件 * * 功能说明: * - 显示成功、错误、警告、信息提示 * - 自动消失(可配置时长) * -
支持多个 Toast 同时显示 * - 应用 Claymorphism 样式 */
<script setup lang="ts">
import type { ToastType, ToastItem } from '@/types'

// ==================== Props ====================
interface Props {
  /** Toast 列表 */
  toasts: ToastItem[]
}

defineProps<Props>()

// ==================== Emits ====================
const emit = defineEmits<{
  remove: [id: string]
}>()

// ==================== 方法 ====================
/**
 * 获取 Toast 图标
 */
function getToastIcon(type: ToastType): string {
  const iconMap: Record<ToastType, string> = {
    success: 'mdi:check-circle',
    error: 'mdi:alert-circle',
    warning: 'mdi:alert',
    info: 'mdi:information',
  }
  return iconMap[type]
}

/**
 * 获取 Toast 颜色类
 */
function getToastColorClass(type: ToastType): string {
  const colorMap: Record<ToastType, string> = {
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info',
  }
  return colorMap[type]
}

/**
 * 移除 Toast
 */
function handleRemove(id: string) {
  emit('remove', id)
}
</script>

<template>
  <div class="toast-container fixed top-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item px-4 py-3 flex items-center gap-3 min-w-[300px] max-w-[400px] pointer-events-auto overflow-hidden"
        :class="getToastColorClass(toast.type)"
      >
        <!-- 图标 -->
        <AppIcon :icon="getToastIcon(toast.type)" :size="20" class="toast-icon shrink-0" />

        <!-- 内容 -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-clay-text-primary wrap-break-word">
            {{ toast.message }}
          </p>
        </div>

        <!-- 关闭按钮 -->
        <button
          class="toast-close shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
          @click="handleRemove(toast.id)"
        >
          <AppIcon icon="mdi:close" :size="16" class="text-clay-text-secondary" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* ==================== Toast 容器 ==================== */
.toast-container {
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 隐藏滚动条 */
.toast-container::-webkit-scrollbar {
  display: none;
}

.toast-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* ==================== Toast 项 ==================== */
.toast-item {
  border-radius: var(--radius-clay-md);
  background: var(--clay-bg-elevated);
  overflow: hidden;
}

/* ==================== Toast 类型样式 ==================== */
.toast-success .toast-icon {
  color: #10b981;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info .toast-icon {
  color: var(--clay-primary);
}

/* ==================== Toast 动画 ==================== */
.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* ==================== 响应式调整 ==================== */
@media (max-width: 640px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
    top: 1rem;
  }

  .toast-item {
    min-width: auto;
    max-width: none;
  }
}
</style>

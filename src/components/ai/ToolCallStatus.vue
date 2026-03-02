/** * ToolCallStatus 工具调用状态组件 * * 功能说明： * - 展示 Function Call 的执行状态 * -
显示工具调用的进度和结果 * - 应用 Claymorphism 设计系统样式 */
<script setup lang="ts">
import type { ToolCallStatus } from '@/types'

// ==================== Props 定义 ====================
interface Props {
  /** 工具调用状态列表 */
  toolCalls: ToolCallStatus[]
}

const props = defineProps<Props>()

// ==================== 计算属性 ====================
/** 获取状态图标 */
function getStatusIcon(type: string): string {
  switch (type) {
    case 'tool_call_start':
      return 'mdi:tools'
    case 'tool_executing':
      return 'mdi:loading'
    case 'tool_completed':
      return 'mdi:check-circle'
    case 'ai_thinking':
      return 'mdi:brain'
    default:
      return 'mdi:information'
  }
}

/** 获取状态颜色类 */
function getStatusColor(type: string): string {
  switch (type) {
    case 'tool_call_start':
      return 'text-blue-500'
    case 'tool_executing':
      return 'text-yellow-500'
    case 'tool_completed':
      return 'text-green-500'
    case 'ai_thinking':
      return 'text-purple-500'
    default:
      return 'text-gray-500'
  }
}

/** 格式化时间 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>

<template>
  <div v-if="toolCalls && toolCalls.length > 0" class="tool-call-status-container">
    <!-- 工具调用状态列表 -->
    <div class="space-y-2">
      <div
        v-for="(status, index) in toolCalls"
        :key="index"
        class="tool-call-item flex items-start gap-3 p-3 bg-clay-bg-base/50 rounded-clay-sm border border-clay-primary/10"
      >
        <!-- 状态图标 -->
        <div class="flex-shrink-0 mt-0.5">
          <AppIcon
            :icon="getStatusIcon(status.type)"
            :size="20"
            :class="['transition-all duration-normal', getStatusColor(status.type)]"
            :spin="status.type === 'tool_executing'"
          />
        </div>

        <!-- 状态信息 -->
        <div class="flex-1 min-w-0">
          <!-- 消息文本 -->
          <div class="text-sm text-clay-text-primary font-medium">
            {{ status.message }}
          </div>

          <!-- 详细信息 -->
          <div class="mt-1 flex items-center gap-3 text-xs text-clay-text-muted">
            <!-- 工具名称 -->
            <span v-if="status.toolName" class="font-mono bg-clay-bg-elevated px-2 py-0.5 rounded">
              {{ status.toolName }}
            </span>

            <!-- 进度 -->
            <span v-if="status.current && status.total">
              {{ status.current }}/{{ status.total }}
            </span>

            <!-- 执行时间 -->
            <span v-if="status.executionTime"> {{ status.executionTime }}ms </span>

            <!-- 时间戳 -->
            <span class="opacity-70">
              {{ formatTime(status.timestamp) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tool-call-status-container {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.tool-call-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

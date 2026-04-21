/** * ModelSelector 模型选择器组件 * * 功能说明: * - 显示当前选中的模型 * - 下拉菜单展示可用模型列表
* - 显示模型名称、描述和图标 * - 标记当前选中的模型 * - 处理模型切换事件 */
<script setup lang="ts">
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'
import { onClickOutside } from '@vueuse/core'

// ==================== Store ====================
const sessionStore = useSessionStore()
const { models, currentModel } = storeToRefs(sessionStore)

// ==================== 状态 ====================
/** 下拉菜单是否展开 */
const isOpen = ref(false)

/** 下拉菜单容器引用 */
const dropdownRef = ref<HTMLElement | null>(null)

// ==================== 方法 ====================
/**
 * 切换下拉菜单展开状态
 */
function toggleDropdown() {
  isOpen.value = !isOpen.value
}

/**
 * 关闭下拉菜单
 */
function closeDropdown() {
  isOpen.value = false
}

/**
 * 处理模型选择
 */
function handleSelectModel(modelId: number | null) {
  sessionStore.selectModel(modelId)
  closeDropdown()
}

/**
 * 检查模型是否为当前选中
 */
function isActiveModel(modelId: number | null): boolean {
  return currentModel.value?.id === modelId
}

/**
 * 检查是否为自动选择模式
 */
function isAutoSelectMode(): boolean {
  return currentModel.value === undefined || currentModel.value === null
}

/**
 * 获取模型图标
 */
function getModelIcon(modelName: string): string {
  // 根据模型名称返回对应图标
  if (modelName.toLowerCase().includes('kimi')) {
    return 'hugeicons:kimi-ai'
  } else if (modelName.toLowerCase().includes('qwen')) {
    return 'hugeicons:qwen'
  } else if (modelName.toLowerCase().includes('glm')) {
    return 'mdi:brain'
  } else if (modelName.toLowerCase().includes('embedding')) {
    return 'hugeicons:expand-paragraph'
  } else {
    return 'hugeicons:atom-02'
  }
}

// ==================== 生命周期 ====================
/** 点击外部关闭下拉菜单 */
onClickOutside(dropdownRef, closeDropdown)
</script>

<template>
  <div ref="dropdownRef" class="model-selector relative">
    <!-- 当前选中的模型按钮 -->
    <button
      class="model-selector-button w-full clay-card clay-card-hoverable px-4 py-3 flex items-center justify-between gap-3 transition-all duration-200"
      :class="{ 'shadow-clay-hover': isOpen }"
      @click="toggleDropdown"
    >
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <!-- 模型图标 -->
        <AppIcon
          :icon="currentModel ? getModelIcon(currentModel.modelName) : 'mdi:star-outline'"
          :size="24"
          class="text-clay-primary flex-shrink-0"
        />

        <!-- 模型信息 -->
        <div class="flex flex-col items-start flex-1 min-w-0">
          <span class="text-sm font-medium text-clay-text-primary truncate w-full">
            {{ currentModel?.modelName || '自动选择' }}
          </span>
          <span
            v-if="currentModel?.modelDescribe"
            class="text-xs text-clay-text-muted truncate w-full"
          >
            {{ currentModel.modelDescribe }}
          </span>
          <span v-else-if="!currentModel" class="text-xs text-clay-text-muted truncate w-full">
            根据需求自动选择最佳模型
          </span>
        </div>
      </div>

      <!-- 展开图标 -->
      <AppIcon
        icon="mdi:chevron-down"
        :size="20"
        class="text-clay-text-secondary transition-transform duration-200 flex-shrink-0"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- 下拉菜单 -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="model-selector-dropdown absolute top-full left-0 right-0 mt-2 clay-card shadow-clay-card max-h-80 overflow-y-auto scrollbar-hide z-50"
      >
        <!-- 模型列表 -->
        <div class="py-2">
          <!-- 自动选择选项 -->
          <button
            class="model-item w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:bg-clay-primary/5"
            :class="{
              'bg-clay-primary/10': isAutoSelectMode(),
            }"
            @click="handleSelectModel(null)"
          >
            <!-- 自动选择图标 -->
            <AppIcon
              icon="mdi:auto-fix"
              :size="24"
              class="shrink-0"
              :class="isAutoSelectMode() ? 'text-clay-primary' : 'text-clay-text-secondary'"
            />

            <!-- 自动选择信息 -->
            <div class="flex flex-col items-start flex-1 min-w-0">
              <div class="flex items-center gap-2 w-full">
                <span
                  class="text-sm font-medium truncate"
                  :class="isAutoSelectMode() ? 'text-clay-primary' : 'text-clay-text-primary'"
                >
                  自动选择
                </span>
                <!-- 选中标记 -->
                <AppIcon
                  v-if="isAutoSelectMode()"
                  icon="mdi:check-circle"
                  :size="16"
                  class="text-clay-primary shrink-0"
                />
              </div>
              <span class="text-xs text-clay-text-muted truncate w-full">
                根据需求自动选择最佳模型
              </span>
            </div>
          </button>

          <!-- 分隔线 -->
          <div class="my-2 mx-4 border-t border-clay-primary/10"></div>

          <!-- 模型列表 -->
          <button
            v-for="model in models"
            :key="model.id"
            class="model-item w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 hover:bg-clay-primary/5"
            :class="{
              'bg-clay-primary/10': isActiveModel(model.id),
            }"
            @click="handleSelectModel(model.id)"
          >
            <!-- 模型图标 -->
            <AppIcon
              :icon="getModelIcon(model.modelName)"
              :size="24"
              class="shrink-0"
              :class="isActiveModel(model.id) ? 'text-clay-primary' : 'text-clay-text-secondary'"
            />

            <!-- 模型信息 -->
            <div class="flex flex-col items-start flex-1 min-w-0">
              <div class="flex items-center gap-2 w-full">
                <span
                  class="text-sm font-medium truncate"
                  :class="isActiveModel(model.id) ? 'text-clay-primary' : 'text-clay-text-primary'"
                >
                  {{ model.modelName }}
                </span>
                <!-- 联网标记 -->
                <span
                  v-if="model.enableSearch === 1"
                  class="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-green-500/10 text-green-600"
                  title="支持联网搜索"
                >
                  联网
                </span>
                <!-- 选中标记 -->
                <AppIcon
                  v-if="isActiveModel(model.id)"
                  icon="mdi:check-circle"
                  :size="16"
                  class="text-clay-primary shrink-0"
                />
              </div>
              <span v-if="model.modelDescribe" class="text-xs text-clay-text-muted truncate w-full">
                {{ model.modelDescribe }}
              </span>
            </div>
          </button>
        </div>

        <!-- 空状态 -->
        <div
          v-if="models.length === 0"
          class="py-8 flex flex-col items-center gap-2 text-clay-text-muted"
        >
          <AppIcon icon="mdi:robot-off-outline" :size="32" class="text-clay-text-muted/50" />
          <span class="text-sm">暂无可用模型</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ==================== 模型选择器按钮 ==================== */
.model-selector-button {
  cursor: pointer;
  user-select: none;
}

.model-selector-button:active {
  transform: translateY(1px);
}

/* ==================== 下拉菜单 ==================== */
.model-selector-dropdown {
  border-radius: var(--radius-clay-md);
  background: var(--clay-bg-elevated);
}

/* ==================== 模型项 ==================== */
.model-item {
  cursor: pointer;
  user-select: none;
  text-align: left;
}

.model-item:first-child {
  border-radius: var(--radius-clay-md) var(--radius-clay-md) 0 0;
}

.model-item:last-child {
  border-radius: 0 0 var(--radius-clay-md) var(--radius-clay-md);
}

/* ==================== 下拉动画 ==================== */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ==================== 自定义滚动条 ==================== */
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
  .model-selector-dropdown {
    max-height: 60vh;
  }
}
</style>

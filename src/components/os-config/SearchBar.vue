/** * SearchBar 组件 - 搜索栏 * * 功能说明: * - 提供搜索输入框 * - 支持防抖机制(300ms) * -
提供清除按钮 * - 显示搜索图标 * - 使用 Claymorphism 设计风格 */
<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  debounce?: number // 防抖延迟,默认 300ms
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', keyword: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入搜索关键词',
  debounce: 300,
})

const emit = defineEmits<Emits>()

// ==================== 状态 ====================
const inputValue = ref(props.modelValue)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// ==================== 监听 ====================
// 监听外部 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue
  },
)

// ==================== 方法 ====================
/**
 * 处理输入事件
 */
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value

  inputValue.value = value
  emit('update:modelValue', value)

  // 清除之前的定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // 设置新的防抖定时器
  debounceTimer = setTimeout(() => {
    emit('search', value)
  }, props.debounce)
}

/**
 * 处理清除按钮点击
 */
function handleClear() {
  inputValue.value = ''
  emit('update:modelValue', '')
  emit('search', '')

  // 清除防抖定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
}

// ==================== 生命周期 ====================
onUnmounted(() => {
  // 组件卸载时清除定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <div class="search-bar">
    <div class="search-input-wrapper clay-input">
      <!-- 搜索图标 -->
      <AppIcon icon="mdi:magnify" class="search-icon" :size="20" />

      <!-- 搜索输入框 -->
      <input
        :value="inputValue"
        @input="handleInput"
        :placeholder="placeholder"
        type="text"
        class="search-input"
      />

      <!-- 清除按钮 -->
      <button
        v-if="inputValue"
        @click="handleClear"
        type="button"
        class="clear-btn"
        aria-label="清除搜索"
      >
        <AppIcon icon="mdi:close" :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 400px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--clay-bg-elevated);
  border-radius: var(--radius-clay-md);
  box-shadow: var(--shadow-clay-card);
  transition: all var(--duration-normal) var(--ease-out);
}

.search-input-wrapper:focus-within {
  box-shadow: var(--shadow-clay-hover);
}

.search-icon {
  color: var(--clay-text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--clay-text-primary);
  font-size: 0.875rem;
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--clay-text-muted);
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: var(--clay-text-muted);
  cursor: pointer;
  border-radius: var(--radius-clay-full);
  transition: all var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.clear-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--clay-text-primary);
}

.clear-btn:active {
  transform: scale(0.95);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-bar {
    max-width: 100%;
  }

  .search-input-wrapper {
    padding: 0.625rem 0.875rem;
  }

  .search-input {
    font-size: 0.8125rem;
  }
}
</style>

<script setup lang="ts">
/**
 * 分页组件
 *
 * 功能说明：
 * - 显示当前页码、总页数、总记录数
 * - 提供首页、尾页、上一页、下一页按钮
 * - 支持页码跳转
 * - 支持每页数量选择(10、20、50、100)
 * - 使用 Claymorphism 设计风格
 */

interface Props {
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 总记录数 */
  total: number
  /** 每页数量选项 */
  pageSizeOptions?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [10, 20, 50, 100],
})

interface Emits {
  /** 页码变化 */
  'update:page': [page: number]
  /** 每页数量变化 */
  'update:pageSize': [pageSize: number]
}

const emit = defineEmits<Emits>()

// ==================== 计算属性 ====================

/** 总页数 */
const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

/** 是否是第一页 */
const isFirstPage = computed(() => props.page === 1)

/** 是否是最后一页 */
const isLastPage = computed(() => props.page >= totalPages.value)

/** 当前页的起始记录数 */
const startRecord = computed(() => {
  if (props.total === 0) return 0
  return (props.page - 1) * props.pageSize + 1
})

/** 当前页的结束记录数 */
const endRecord = computed(() => {
  const end = props.page * props.pageSize
  return end > props.total ? props.total : end
})

/** 显示的页码列表 */
const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = props.page

  if (total <= 7) {
    // 总页数小于等于7,显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总页数大于7,显示部分页码
    if (current <= 4) {
      // 当前页在前面
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      // 当前页在后面
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

// ==================== 方法 ====================

/** 跳转到指定页 */
function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === props.page) return
  emit('update:page', page)
}

/** 跳转到首页 */
function goToFirstPage() {
  goToPage(1)
}

/** 跳转到尾页 */
function goToLastPage() {
  goToPage(totalPages.value)
}

/** 上一页 */
function goToPrevPage() {
  goToPage(props.page - 1)
}

/** 下一页 */
function goToNextPage() {
  goToPage(props.page + 1)
}

/** 改变每页数量 */
function changePageSize(size: number) {
  emit('update:pageSize', size)
}
</script>

<template>
  <div class="pagination-container">
    <!-- 左侧: 总记录数和当前页信息 -->
    <div class="pagination-info">
      <span class="text-clay-text-secondary text-sm">
        共 <span class="text-clay-text-primary font-medium">{{ total }}</span> 条记录，显示第
        <span class="text-clay-text-primary font-medium">{{ startRecord }}</span> -
        <span class="text-clay-text-primary font-medium">{{ endRecord }}</span> 条
      </span>
    </div>

    <!-- 中间: 页码导航 -->
    <div class="pagination-controls">
      <!-- 首页按钮 -->
      <button
        class="pagination-btn"
        :class="{ disabled: isFirstPage }"
        :disabled="isFirstPage"
        @click="goToFirstPage"
        title="首页"
      >
        <AppIcon icon="mdi:page-first" :size="18" />
      </button>

      <!-- 上一页按钮 -->
      <button
        class="pagination-btn"
        :class="{ disabled: isFirstPage }"
        :disabled="isFirstPage"
        @click="goToPrevPage"
        title="上一页"
      >
        <AppIcon icon="mdi:chevron-left" :size="18" />
      </button>

      <!-- 页码按钮 -->
      <template v-for="(pageNum, index) in pageNumbers" :key="index">
        <!-- 省略号 -->
        <span v-if="pageNum === '...'" class="pagination-ellipsis">...</span>

        <!-- 页码按钮 -->
        <button
          v-else
          class="pagination-btn pagination-number"
          :class="{ active: pageNum === page }"
          @click="goToPage(pageNum as number)"
        >
          {{ pageNum }}
        </button>
      </template>

      <!-- 下一页按钮 -->
      <button
        class="pagination-btn"
        :class="{ disabled: isLastPage }"
        :disabled="isLastPage"
        @click="goToNextPage"
        title="下一页"
      >
        <AppIcon icon="mdi:chevron-right" :size="18" />
      </button>

      <!-- 尾页按钮 -->
      <button
        class="pagination-btn"
        :class="{ disabled: isLastPage }"
        :disabled="isLastPage"
        @click="goToLastPage"
        title="尾页"
      >
        <AppIcon icon="mdi:page-last" :size="18" />
      </button>
    </div>

    <!-- 右侧: 每页数量选择 -->
    <div class="pagination-size">
      <span class="text-clay-text-secondary text-sm mr-2">每页</span>
      <select
        :value="pageSize"
        @change="changePageSize(Number(($event.target as HTMLSelectElement).value))"
        class="pagination-select"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
      <span class="text-clay-text-secondary text-sm ml-2">条</span>
    </div>
  </div>
</template>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  flex-wrap: wrap;
}

.pagination-info {
  flex-shrink: 0;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.pagination-btn {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-clay-sm);
  background: var(--clay-bg-elevated);
  color: var(--clay-text-primary);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  box-shadow: var(--shadow-clay-button);
  font-size: 14px;
  font-weight: 500;
}

.pagination-btn:hover:not(.disabled):not(.active) {
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.pagination-btn:active:not(.disabled):not(.active) {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(0);
}

.pagination-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.pagination-number {
  min-width: 36px;
  padding: 0 8px;
}

.pagination-btn.active {
  background: var(--clay-primary);
  color: var(--clay-text-inverse);
  box-shadow: var(--shadow-clay-button);
}

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  color: var(--clay-text-muted);
  font-weight: 500;
}

.pagination-size {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.pagination-select {
  min-width: 70px;
  height: 36px;
  padding: 0 2rem 0 0.75rem;
  border: 2px solid transparent;
  border-radius: var(--radius-clay-sm);
  background: var(--clay-bg-elevated);
  color: var(--clay-text-primary);
  cursor: pointer;
  box-shadow: var(--shadow-clay-button);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--duration-normal) var(--ease-out);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath fill='%234296ed' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.25rem center;
  background-size: 1.25rem;
}

.pagination-select:hover {
  border-color: var(--clay-primary-light);
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-1px);
}

.pagination-select:focus {
  outline: none;
  border-color: var(--clay-primary);
  box-shadow:
    var(--shadow-clay-hover),
    0 0 0 3px rgba(66, 150, 237, 0.1);
  transform: translateY(-1px);
}

.pagination-select:active {
  transform: translateY(0);
  box-shadow: var(--shadow-clay-pressed);
}

.pagination-select option {
  padding: 0.5rem;
  background: var(--clay-bg-elevated);
  color: var(--clay-text-primary);
}

.pagination-select option:hover {
  background: var(--clay-primary-light);
  color: var(--clay-text-inverse);
}

.pagination-select option:checked {
  background: var(--clay-primary);
  color: var(--clay-text-inverse);
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 0.75rem;
  }

  .pagination-info {
    width: 100%;
    text-align: center;
  }

  .pagination-controls {
    width: 100%;
    justify-content: center;
  }

  .pagination-size {
    width: 100%;
    justify-content: center;
  }

  .pagination-btn {
    min-width: 32px;
    height: 32px;
  }

  .pagination-number {
    min-width: 32px;
  }

  .pagination-ellipsis {
    min-width: 32px;
    height: 32px;
  }

  .pagination-select {
    min-width: 60px;
    height: 32px;
  }
}
</style>

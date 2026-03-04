/** * 数据表格组件 * * 功能说明： * - 支持动态列配置 * - 支持多选功能（复选框、全选） * -
支持加载状态（骨架屏） * - 支持空状态提示 * - 支持操作列插槽 * - 使用 Claymorphism 设计风格 */
<script setup lang="ts">
import type { TableColumn } from '@/types'

/**
 * Props 定义
 */
interface Props {
  /** 表格列配置 */
  columns: TableColumn[]
  /** 表格数据 */
  data: any[]
  /** 是否显示加载状态 */
  loading?: boolean
  /** 是否支持多选 */
  selectable?: boolean
  /** 已选中的行（通过唯一标识） */
  selectedKeys?: (string | number)[]
  /** 行的唯一标识字段名 */
  rowKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  selectable: false,
  selectedKeys: () => [],
  rowKey: 'id',
})

/**
 * Emits 定义
 */
const emit = defineEmits<{
  'update:selectedKeys': [keys: (string | number)[]]
}>()

// ==================== 多选逻辑 ====================
const localSelectedKeys = computed({
  get: () => props.selectedKeys,
  set: (value) => emit('update:selectedKeys', value),
})

/**
 * 是否全选
 */
const isAllSelected = computed(() => {
  if (!props.data.length) return false
  return props.data.every((row) => localSelectedKeys.value.includes(row[props.rowKey]))
})

/**
 * 是否部分选中
 */
const isIndeterminate = computed(() => {
  const selectedCount = props.data.filter((row) =>
    localSelectedKeys.value.includes(row[props.rowKey]),
  ).length
  return selectedCount > 0 && selectedCount < props.data.length
})

/**
 * 切换全选
 */
function toggleSelectAll() {
  if (isAllSelected.value) {
    // 取消全选
    localSelectedKeys.value = []
  } else {
    // 全选
    localSelectedKeys.value = props.data.map((row) => row[props.rowKey])
  }
}

/**
 * 切换单行选中
 */
function toggleRowSelection(rowKey: string | number) {
  const index = localSelectedKeys.value.indexOf(rowKey)
  if (index > -1) {
    // 取消选中
    localSelectedKeys.value = localSelectedKeys.value.filter((key) => key !== rowKey)
  } else {
    // 选中
    localSelectedKeys.value = [...localSelectedKeys.value, rowKey]
  }
}

/**
 * 判断行是否选中
 */
function isRowSelected(rowKey: string | number): boolean {
  return localSelectedKeys.value.includes(rowKey)
}

/**
 * 获取单元格显示值
 */
function getCellValue(row: any, column: TableColumn): string {
  const value = row[column.key]
  if (column.formatter) {
    return column.formatter(value, row)
  }
  return value ?? '-'
}

// ==================== 全选复选框引用 ====================
const selectAllCheckboxRef = ref<HTMLInputElement | null>(null)

/**
 * 监听部分选中状态，更新全选复选框的 indeterminate 属性
 */
watch(isIndeterminate, (value) => {
  if (selectAllCheckboxRef.value) {
    selectAllCheckboxRef.value.indeterminate = value
  }
})
</script>

<template>
  <div class="data-table-wrapper">
    <!-- 桌面端表格布局 (>= 768px) -->
    <div class="table-container clay-card overflow-hidden desktop-table">
      <table class="data-table">
        <!-- 表头 -->
        <thead>
          <tr>
            <!-- 多选列 -->
            <th v-if="selectable" class="checkbox-column">
              <label class="checkbox-wrapper">
                <input
                  ref="selectAllCheckboxRef"
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
              </label>
            </th>

            <!-- 数据列 -->
            <th v-for="column in columns" :key="column.key" :style="{ width: column.width }">
              {{ column.label }}
            </th>

            <!-- 操作列 -->
            <th v-if="$slots.actions" class="actions-column">操作</th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody>
          <!-- 加载状态 -->
          <template v-if="loading">
            <tr v-for="i in 5" :key="`skeleton-${i}`" class="skeleton-row">
              <td v-if="selectable">
                <div class="skeleton skeleton-checkbox"></div>
              </td>
              <td v-for="column in columns" :key="column.key">
                <div class="skeleton skeleton-text"></div>
              </td>
              <td v-if="$slots.actions">
                <div class="skeleton skeleton-actions"></div>
              </td>
            </tr>
          </template>

          <!-- 空状态 -->
          <template v-else-if="!data.length">
            <tr>
              <td :colspan="columns.length + (selectable ? 1 : 0) + ($slots.actions ? 1 : 0)">
                <div class="empty-state">
                  <AppIcon icon="mdi:database-off-outline" :size="48" class="empty-icon" />
                  <p class="empty-text">暂无数据</p>
                </div>
              </td>
            </tr>
          </template>

          <!-- 数据行 -->
          <template v-else>
            <tr
              v-for="row in data"
              :key="row[rowKey]"
              class="data-row"
              :class="{ selected: isRowSelected(row[rowKey]) }"
            >
              <!-- 多选列 -->
              <td v-if="selectable" class="checkbox-column">
                <label class="checkbox-wrapper">
                  <input
                    type="checkbox"
                    :checked="isRowSelected(row[rowKey])"
                    @change="toggleRowSelection(row[rowKey])"
                    class="checkbox-input"
                  />
                  <span class="checkbox-custom"></span>
                </label>
              </td>

              <!-- 数据列 -->
              <td v-for="column in columns" :key="column.key">
                {{ getCellValue(row, column) }}
              </td>

              <!-- 操作列 -->
              <td v-if="$slots.actions" class="actions-column">
                <slot name="actions" :row="row"></slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- 移动端卡片布局 (< 768px) -->
    <div class="card-container mobile-cards">
      <!-- 全选工具栏 -->
      <div v-if="selectable && data.length > 0 && !loading" class="mobile-select-toolbar clay-card">
        <label class="checkbox-wrapper">
          <input
            ref="selectAllCheckboxRef"
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="checkbox-input"
          />
          <span class="checkbox-custom"></span>
        </label>
        <span class="select-text">全选</span>
        <span v-if="localSelectedKeys.length > 0" class="selected-count">
          已选 {{ localSelectedKeys.length }} 项
        </span>
      </div>

      <!-- 加载状态 -->
      <template v-if="loading">
        <div v-for="i in 3" :key="`skeleton-card-${i}`" class="data-card clay-card skeleton-card">
          <div class="skeleton skeleton-card-content"></div>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else-if="!data.length" class="empty-state clay-card">
        <AppIcon icon="mdi:database-off-outline" :size="48" class="empty-icon" />
        <p class="empty-text">暂无数据</p>
      </div>

      <!-- 数据卡片 -->
      <template v-else>
        <div
          v-for="row in data"
          :key="row[rowKey]"
          class="data-card clay-card"
          :class="{ selected: isRowSelected(row[rowKey]) }"
        >
          <!-- 卡片头部：复选框 + 主要信息 -->
          <div class="card-header">
            <label v-if="selectable" class="checkbox-wrapper" @click.stop>
              <input
                type="checkbox"
                :checked="isRowSelected(row[rowKey])"
                @change="toggleRowSelection(row[rowKey])"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
            </label>
            <div class="card-title">
              {{ columns[0] ? getCellValue(row, columns[0]) : '-' }}
            </div>
          </div>

          <!-- 卡片内容：其他字段 -->
          <div class="card-content">
            <div v-for="column in columns.slice(1)" :key="column.key" class="card-field">
              <span class="field-label">{{ column.label }}:</span>
              <span class="field-value">{{ getCellValue(row, column) }}</span>
            </div>
          </div>

          <!-- 卡片底部：操作按钮 -->
          <div v-if="$slots.actions">
            <slot name="actions" :row="row"></slot>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ==================== 表格容器 ==================== */
.data-table-wrapper {
  width: 100%;
}

.table-container {
  width: 100%;
  background: var(--clay-bg-elevated);
  border-radius: var(--radius-clay-md);
}

/* ==================== 表格样式 ==================== */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

/* 表头 */
.data-table thead {
  background: var(--clay-bg-base);
  border-bottom: 2px solid rgba(66, 150, 237, 0.1);
}

.data-table thead th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--clay-text-secondary);
  white-space: nowrap;
}

/* 表体 */
.data-table tbody td {
  padding: 1rem;
  font-size: 0.875rem;
  color: var(--clay-text-primary);
  border-bottom: 1px solid rgba(66, 150, 237, 0.05);
}

/* 数据行 - 添加 Claymorphism 悬停效果 */
.data-row {
  transition: all var(--duration-normal) var(--ease-out);
  cursor: pointer;
}

.data-row:hover {
  background: rgba(66, 150, 237, 0.05);
  box-shadow: 0 2px 8px rgba(66, 150, 237, 0.08);
  transform: translateY(-1px);
}

.data-row.selected {
  background: rgba(66, 150, 237, 0.08);
  box-shadow: 0 0 0 2px rgba(66, 150, 237, 0.2);
}

.data-row.selected:hover {
  background: rgba(66, 150, 237, 0.1);
  box-shadow:
    0 2px 8px rgba(66, 150, 237, 0.12),
    0 0 0 2px rgba(66, 150, 237, 0.3);
}

/* ==================== 复选框列 ==================== */
.checkbox-column {
  width: 48px;
  text-align: center;
}

.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--clay-primary);
  border-radius: var(--radius-clay-sm);
  background: var(--clay-bg-elevated);
  transition: all var(--duration-normal) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--clay-primary);
  border-color: var(--clay-primary);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.checkbox-input:indeterminate + .checkbox-custom {
  background: var(--clay-primary);
  border-color: var(--clay-primary);
}

.checkbox-input:indeterminate + .checkbox-custom::after {
  content: '';
  width: 10px;
  height: 2px;
  background: white;
}

.checkbox-wrapper:hover .checkbox-custom {
  border-color: var(--clay-primary-light);
  box-shadow: 0 0 0 3px rgba(66, 150, 237, 0.1);
}

/* ==================== 操作列 ==================== */
.actions-column {
  width: 120px;
  text-align: right;
}

/* ==================== 加载状态（骨架屏） ==================== */
.skeleton-row td {
  padding: 1rem;
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-checkbox {
  width: 18px;
  height: 18px;
  margin: 0 auto;
}

.skeleton-text {
  height: 16px;
  width: 80%;
}

.skeleton-actions {
  height: 32px;
  width: 100px;
  margin-left: auto;
}

/* ==================== 空状态 ==================== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
}

.empty-icon {
  color: var(--clay-text-muted);
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 0.875rem;
  color: var(--clay-text-muted);
  margin: 0;
}

/* ==================== 响应式设计 ==================== */
/* 默认显示桌面端表格，隐藏移动端卡片 */
.data-table-wrapper .desktop-table {
  display: block !important;
}

.data-table-wrapper .mobile-cards {
  display: none !important;
}

/* 移动端 - 隐藏桌面端表格，显示移动端卡片 */
@media (max-width: 767px) {
  .data-table-wrapper .desktop-table {
    display: none !important;
  }

  .data-table-wrapper .mobile-cards {
    display: flex !important;
  }

  .data-table thead th,
  .data-table tbody td {
    padding: 0.75rem 0.5rem;
    font-size: 0.8125rem;
  }

  .actions-column {
    width: 80px;
  }
}

/* ==================== 移动端卡片布局 ==================== */
.card-container {
  flex-direction: column;
  gap: 1rem;
}

/* 移动端全选工具栏 */
.mobile-select-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--clay-bg-elevated);
  border-radius: var(--radius-clay-md);
}

.select-text {
  font-size: 0.875rem;
  color: var(--clay-text-primary);
  font-weight: 500;
}

.selected-count {
  margin-left: auto;
  font-size: 0.875rem;
  color: var(--clay-primary);
  font-weight: 600;
}

/* 数据卡片 - 添加 Claymorphism 悬停效果 */
.data-card {
  background: var(--clay-bg-elevated);
  border-radius: var(--radius-clay-md);
  padding: 1rem;
  transition: all var(--duration-normal) var(--ease-out);
  cursor: pointer;
}

.data-card:hover {
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.data-card:active {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(1px);
}

.data-card.selected {
  background: rgba(66, 150, 237, 0.08);
  box-shadow: 0 0 0 2px var(--clay-primary);
}

.data-card.selected:hover {
  box-shadow:
    var(--shadow-clay-hover),
    0 0 0 2px var(--clay-primary);
  transform: translateY(-2px);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(66, 150, 237, 0.1);
}

.card-title {
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  color: var(--clay-text-primary);
  line-height: 1.5;
}

/* 卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.card-field {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.field-label {
  color: var(--clay-text-secondary);
  font-weight: 500;
  min-width: 80px;
  flex-shrink: 0;
}

.field-value {
  color: var(--clay-text-primary);
  flex: 1;
  word-break: break-word;
}

/* 骨架屏卡片 */
.skeleton-card {
  padding: 1rem;
}

.skeleton-card-content {
  height: 120px;
  width: 100%;
}

/* 移动端空状态 */
@media (max-width: 768px) {
  .empty-state {
    padding: 2rem 1rem;
  }
}

/* 移动端小屏幕优化 (< 375px) */
@media (max-width: 375px) {
  .card-header {
    gap: 0.5rem;
  }

  .card-title {
    font-size: 0.9375rem;
  }

  .field-label {
    min-width: 70px;
    font-size: 0.8125rem;
  }

  .field-value {
    font-size: 0.8125rem;
  }
}
</style>

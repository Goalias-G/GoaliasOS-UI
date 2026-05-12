<script setup lang="ts">
/**
 * 收支流水 Tab 组件
 *
 * 功能说明:
 * - 筛选栏（分类/标签/日期范围）
 * - 桌面端表格 + 移动端卡片
 * - 分页
 * - 「记一笔」按钮
 */

import { storeToRefs } from 'pinia'
import type { FinanceTransaction } from '@/types'

const emit = defineEmits<{
  add: []
  edit: [transaction: FinanceTransaction]
  delete: [id: number]
}>()

const store = useFinanceStore()
const { transactions, categories, transactionPagination, loading } = storeToRefs(store)

// ==================== 筛选状态 ====================
const filterCategory = ref<number | undefined>(undefined)
const filterTag = ref<number | undefined>(undefined)
const filterStartDate = ref('')
const filterEndDate = ref('')

const tagMap: Record<number, string> = {
  1: '必要支出',
  2: '弹性支出',
  3: '工薪收入',
  4: '额外收入',
}

const tagColor: Record<number, string> = {
  1: 'bg-red-100 text-red-600',
  2: 'bg-orange-100 text-orange-600',
  3: 'bg-green-100 text-green-600',
  4: 'bg-blue-100 text-blue-600',
}

// ==================== 金额格式化 ====================
function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2)
}

// ==================== 筛选操作 ====================
function applyFilter() {
  const params: Record<string, any> = {}
  if (filterCategory.value) params.categoryId = filterCategory.value
  if (filterTag.value) params.tag = filterTag.value
  if (filterStartDate.value) params.startDate = filterStartDate.value
  if (filterEndDate.value) params.endDate = filterEndDate.value
  store.setTransactionPage(1)
  store.loadTransactions(params, true)
}

function resetFilter() {
  filterCategory.value = undefined
  filterTag.value = undefined
  filterStartDate.value = ''
  filterEndDate.value = ''
  store.setTransactionPage(1)
  store.loadTransactions(undefined, true)
}

// ==================== 分页 ====================
const totalPages = computed(() =>
  Math.ceil(transactionPagination.value.total / transactionPagination.value.pageSize),
)

function handlePageChange(page: number) {
  store.setTransactionPage(page)
  const params: Record<string, any> = {}
  if (filterCategory.value) params.categoryId = filterCategory.value
  if (filterTag.value) params.tag = filterTag.value
  if (filterStartDate.value) params.startDate = filterStartDate.value
  if (filterEndDate.value) params.endDate = filterEndDate.value
  store.loadTransactions(params)
}
</script>

<template>
  <div class="space-y-4">
    <!-- 筛选栏 -->
    <div class="clay-card p-4">
      <div class="flex flex-wrap items-end gap-3">
        <!-- 分类筛选 -->
        <div class="flex-1 min-w-[140px]">
          <label class="block text-xs font-medium text-clay-text-secondary mb-1">分类</label>
          <select v-model="filterCategory" class="clay-input w-full px-3 py-2 text-sm">
            <option :value="undefined">全部分类</option>
            <optgroup label="支出">
              <option
                v-for="cat in categories.filter((c) => c.type === 1)"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </optgroup>
            <optgroup label="收入">
              <option
                v-for="cat in categories.filter((c) => c.type === 2)"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- 标签筛选 -->
        <div class="min-w-[120px]">
          <label class="block text-xs font-medium text-clay-text-secondary mb-1">标签</label>
          <select v-model="filterTag" class="clay-input w-full px-3 py-2 text-sm">
            <option :value="undefined">全部</option>
            <option :value="1">必要支出</option>
            <option :value="2">弹性支出</option>
            <option :value="3">工薪收入</option>
            <option :value="4">额外收入</option>
          </select>
        </div>

        <!-- 日期范围 -->
        <div class="min-w-[130px]">
          <label class="block text-xs font-medium text-clay-text-secondary mb-1">开始日期</label>
          <input
            v-model="filterStartDate"
            type="date"
            class="clay-input w-full px-3 py-2 text-sm"
          />
        </div>
        <div class="min-w-[130px]">
          <label class="block text-xs font-medium text-clay-text-secondary mb-1">结束日期</label>
          <input v-model="filterEndDate" type="date" class="clay-input w-full px-3 py-2 text-sm" />
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-2">
          <button @click="applyFilter" class="clay-btn px-4 py-2 text-sm">查询</button>
          <button @click="resetFilter" class="clay-btn-secondary px-4 py-2 text-sm">重置</button>
        </div>

        <!-- 记一笔按钮 -->
        <div class="ml-auto">
          <button @click="emit('add')" class="clay-btn px-4 py-2 text-sm flex items-center gap-1.5">
            <AppIcon icon="mdi:plus" :size="16" />
            记一笔
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading.transactions" class="flex items-center justify-center py-12">
      <div
        class="w-8 h-8 border-4 border-clay-primary/20 border-t-clay-primary rounded-full animate-spin"
      ></div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="transactions.length === 0" class="clay-card p-12 text-center">
      <AppIcon
        icon="mdi:receipt-text-outline"
        :size="56"
        class="text-clay-text-muted mx-auto mb-3"
      />
      <p class="text-clay-text-secondary">暂无流水记录</p>
      <button @click="emit('add')" class="clay-btn px-5 py-2.5 text-sm mt-4">记第一笔</button>
    </div>

    <!-- 桌面端表格 -->
    <template v-else>
      <div class="hidden md:block clay-card overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-clay-bg-base border-b border-gray-100">
              <th class="px-4 py-3 text-left text-xs font-semibold text-clay-text-secondary">
                日期
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-clay-text-secondary">
                分类
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-clay-text-secondary">
                标签
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-clay-text-secondary">
                金额
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-clay-text-secondary">
                备注
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-clay-text-secondary">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in transactions"
              :key="tx.id"
              class="border-b border-gray-50 hover:bg-clay-bg-base/50 transition-colors"
            >
              <td class="px-4 py-3 text-sm text-clay-text-secondary">
                {{ tx.createTime?.split(' ')[0] || '-' }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <AppIcon
                    :icon="
                      categories.find((c) => c.id === tx.categoryId)?.icon || 'mdi:circle-outline'
                    "
                    :size="16"
                    :class="tx.categoryType === 1 ? 'text-red-400' : 'text-green-400'"
                  />
                  <span class="text-sm text-clay-text-primary">{{ tx.categoryName || '-' }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  v-if="tx.tag"
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="tagColor[tx.tag]"
                >
                  {{ tagMap[tx.tag] }}
                </span>
              </td>
              <td
                class="px-4 py-3 text-sm font-semibold text-right"
                :class="tx.categoryType === 1 ? 'text-red-500' : 'text-green-500'"
              >
                {{ tx.categoryType === 1 ? '-' : '+' }}{{ formatAmount(tx.amount) }}
              </td>
              <td class="px-4 py-3 text-sm text-clay-text-muted max-w-[200px] truncate">
                {{ tx.remark || '-' }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="emit('edit', tx)"
                    class="p-1.5 rounded-clay-sm text-clay-text-muted hover:text-clay-primary hover:bg-clay-primary/5 transition-colors"
                    title="编辑"
                  >
                    <AppIcon icon="mdi:pencil-outline" :size="15" />
                  </button>
                  <button
                    @click="emit('delete', tx.id)"
                    class="p-1.5 rounded-clay-sm text-clay-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="删除"
                  >
                    <AppIcon icon="mdi:delete-outline" :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 移动端卡片列表 -->
      <div class="md:hidden space-y-3">
        <div v-for="tx in transactions" :key="tx.id" class="clay-card p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <AppIcon
                :icon="categories.find((c) => c.id === tx.categoryId)?.icon || 'mdi:circle-outline'"
                :size="18"
                :class="tx.categoryType === 1 ? 'text-red-400' : 'text-green-400'"
              />
              <span class="font-medium text-clay-text-primary text-sm">{{
                tx.categoryName || '-'
              }}</span>
            </div>
            <span
              class="text-sm font-semibold"
              :class="tx.categoryType === 1 ? 'text-red-500' : 'text-green-500'"
            >
              {{ tx.categoryType === 1 ? '-' : '+' }}{{ formatAmount(tx.amount) }}
            </span>
          </div>
          <div class="flex items-center justify-between text-xs text-clay-text-muted">
            <div class="flex items-center gap-2">
              <span
                v-if="tx.tag"
                class="px-1.5 py-0.5 rounded-full text-xs font-medium"
                :class="tagColor[tx.tag]"
              >
                {{ tagMap[tx.tag] }}
              </span>
              <span>{{ tx.createTime?.split(' ')[0] || '-' }}</span>
            </div>
            <div class="flex gap-1">
              <button
                @click="emit('edit', tx)"
                class="p-1.5 text-clay-text-muted hover:text-clay-primary"
              >
                <AppIcon icon="mdi:pencil-outline" :size="15" />
              </button>
              <button
                @click="emit('delete', tx.id)"
                class="p-1.5 text-clay-text-muted hover:text-red-500"
              >
                <AppIcon icon="mdi:delete-outline" :size="15" />
              </button>
            </div>
          </div>
          <p v-if="tx.remark" class="text-xs text-clay-text-muted mt-1.5 truncate">
            {{ tx.remark }}
          </p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="flex justify-center pt-2">
        <div class="flex items-center gap-2">
          <button
            @click="handlePageChange(transactionPagination.pageNum - 1)"
            :disabled="transactionPagination.pageNum === 1"
            class="px-3 py-2 rounded-clay-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="
              transactionPagination.pageNum === 1
                ? 'text-clay-text-muted'
                : 'bg-clay-bg-base text-clay-text-primary hover:bg-clay-primary hover:bg-purple-500'
            "
          >
            <AppIcon icon="mdi:chevron-left" :size="20" />
          </button>
          <div class="flex items-center gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="handlePageChange(page)"
              class="w-9 h-9 rounded-clay-sm text-sm transition-colors font-medium"
              :class="
                transactionPagination.pageNum === page
                  ? 'bg-clay-primary text-purple-500 shadow-clay-button'
                  : 'bg-clay-bg-base text-clay-text-primary hover:bg-clay-bg-elevated'
              "
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="handlePageChange(transactionPagination.pageNum + 1)"
            :disabled="transactionPagination.pageNum === totalPages"
            class="px-3 py-2 rounded-clay-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="
              transactionPagination.pageNum === totalPages
                ? 'text-clay-text-muted'
                : 'bg-clay-bg-base text-clay-text-primary hover:bg-clay-primary hover:bg-purple-500'
            "
          >
            <AppIcon icon="mdi:chevron-right" :size="20" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

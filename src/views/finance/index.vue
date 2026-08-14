<script setup lang="ts">
/**
 * 财务流水主页面
 *
 * 功能说明:
 * - 三个 Tab 页签（收支概览/收支流水/分类管理）
 * - 懒加载 Tab 数据
 * - 对话框协调（分类弹窗/流水弹窗/删除确认）
 * - 响应式布局
 */

import { storeToRefs } from 'pinia'
import type {
  FinanceCategory,
  FinanceCategoryParams,
  FinanceTransaction,
  FinanceTransactionParams,
} from '@/types'

import OverviewTab from './components/OverviewTab.vue'
import TransactionTab from './components/TransactionTab.vue'
import CategoryManage from './components/CategoryManage.vue'
import CategoryDialog from './components/CategoryDialog.vue'
import TransactionDialog from './components/TransactionDialog.vue'

// ==================== Store ====================
const store = useFinanceStore()
const { categories } = storeToRefs(store)

// ==================== Tab 管理 ====================
type TabId = 'overview' | 'transactions' | 'categories'

const tabs = [
  { id: 'overview' as const, label: '收支概览', icon: 'hugeicons:chart-line-data-02' },
  { id: 'transactions' as const, label: '收支流水', icon: 'hugeicons:transaction' },
  { id: 'categories' as const, label: '收支分类', icon: 'hugeicons:block-game' },
]

const activeTab = ref<TabId>('overview')
const loadedTabs = ref<Set<string>>(new Set(['overview']))

function switchTab(tab: TabId) {
  activeTab.value = tab
  if (!loadedTabs.value.has(tab)) {
    loadedTabs.value.add(tab)
    if (tab === 'transactions') store.loadTransactions(undefined, true)
    else if (tab === 'categories') store.loadCategories()
  }
}

// ==================== 响应式 ====================
const isMobile = ref(false)
function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

// ==================== 分类弹窗 ====================
const showCategoryDialog = ref(false)
const editingCategory = ref<FinanceCategory | null>(null)
const categoryDefaultType = ref(1)

function handleCategoryAdd(type: number) {
  editingCategory.value = null
  categoryDefaultType.value = type
  showCategoryDialog.value = true
}

function handleCategoryEdit(category: FinanceCategory) {
  editingCategory.value = category
  showCategoryDialog.value = true
}

async function handleCategorySave(data: FinanceCategoryParams) {
  try {
    if (data.id) {
      await store.editCategory(data.id, data)
      showSuccess('分类编辑成功')
    } else {
      await store.addCategory(data)
      showSuccess('分类创建成功')
    }
  } catch (error: any) {
    showError(error.message || '操作失败')
  }
}

// ==================== 流水弹窗 ====================
const showTransactionDialog = ref(false)
const editingTransaction = ref<FinanceTransaction | null>(null)

function handleTransactionAdd() {
  editingTransaction.value = null
  showTransactionDialog.value = true
}

function handleTransactionEdit(transaction: FinanceTransaction) {
  editingTransaction.value = transaction
  showTransactionDialog.value = true
}

async function handleTransactionSave(data: FinanceTransactionParams) {
  try {
    if (data.id) {
      await store.editTransaction(data.id, data)
      showSuccess('流水编辑成功')
    } else {
      await store.addTransaction(data)
      showSuccess('流水创建成功')
    }
  } catch (error: any) {
    showError(error.message || '操作失败')
  }
}

// ==================== 删除确认 ====================
const showDeleteConfirm = ref(false)
const deleteTarget = ref<{ type: 'category' | 'transaction'; id: number; name: string } | null>(
  null,
)
const isDeleting = ref(false)

function showCategoryDeleteConfirm(id: number) {
  const cat = store.categories.find((c) => c.id === id)
  deleteTarget.value = { type: 'category', id, name: cat?.name || '' }
  showDeleteConfirm.value = true
}

function showTransactionDeleteConfirm(id: number) {
  const tx = store.transactions.find((t) => t.id === id)
  deleteTarget.value = {
    type: 'transaction',
    id,
    name: tx?.categoryName || '',
  }
  showDeleteConfirm.value = true
}

async function handleDeleteConfirm() {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    if (deleteTarget.value.type === 'category') {
      await store.deleteCategory(deleteTarget.value.id)
    } else {
      await store.deleteTransaction(deleteTarget.value.id)
    }
    showDeleteConfirm.value = false
    deleteTarget.value = null
    showSuccess('删除成功')
  } catch (error: any) {
    showError(error.message || '删除失败')
  } finally {
    isDeleting.value = false
  }
}

function handleDeleteCancel() {
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

// ==================== 生命周期 ====================
onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  await store.loadCategories()
  // overview tab 的数据由 OverviewTab 组件自行加载
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="h-full bg-clay-bg-base overflow-auto">
    <div class="mx-auto p-4 md:p-6">
      <!-- 页面标题 -->
      <div class="mb-5">
        <h2 class="clay-section-title">财务收支明细</h2>
      </div>

      <!-- Tab 导航 -->
      <div class="clay-card p-1.5 md:p-2 mb-5" role="tablist">
        <div class="flex gap-1.5 md:gap-2 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            role="tab"
            :aria-selected="activeTab === tab.id"
            class="flex-1 min-w-[100px] md:min-w-[120px] px-3 md:px-4 py-2.5 md:py-3 rounded-clay-md font-medium transition-all flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base"
            :class="[
              activeTab === tab.id
                ? 'bg-clay-primary text-orange-400 shadow-clay-button'
                : 'text-clay-text-secondary hover:bg-clay-bg-base hover:text-clay-text-primary',
            ]"
            @click="switchTab(tab.id)"
          >
            <AppIcon :icon="tab.icon" :size="18" />
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Tab 内容 -->
      <Transition name="fade" mode="out-in">
        <!-- 收支概览 -->
        <div v-if="activeTab === 'overview'" key="overview" role="tabpanel">
          <OverviewTab />
        </div>

        <!-- 收支流水 -->
        <div v-else-if="activeTab === 'transactions'" key="transactions" role="tabpanel">
          <TransactionTab
            @add="handleTransactionAdd"
            @edit="handleTransactionEdit"
            @delete="showTransactionDeleteConfirm"
          />
        </div>

        <!-- 分类管理 -->
        <div v-else-if="activeTab === 'categories'" key="categories" role="tabpanel">
          <CategoryManage
            @add="handleCategoryAdd"
            @edit="handleCategoryEdit"
            @delete="showCategoryDeleteConfirm"
          />
        </div>
      </Transition>
    </div>

    <!-- 分类弹窗 -->
    <CategoryDialog
      v-model="showCategoryDialog"
      :category="editingCategory || undefined"
      :default-type="categoryDefaultType"
      @save="handleCategorySave"
    />

    <!-- 流水弹窗 -->
    <TransactionDialog
      v-model="showTransactionDialog"
      :transaction="editingTransaction || undefined"
      :categories="categories"
      @save="handleTransactionSave"
    />

    <!-- 删除确认弹窗 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="handleDeleteCancel"
        >
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="showDeleteConfirm"
              class="w-full max-w-md bg-clay-bg-elevated rounded-clay-lg shadow-clay-card p-6"
              role="dialog"
              aria-modal="true"
            >
              <div
                class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full"
              >
                <AppIcon icon="mdi:alert" :size="24" class="text-red-600" />
              </div>
              <div class="text-center mb-6">
                <h3 class="text-lg font-semibold text-clay-text-primary mb-2">
                  确认删除{{ deleteTarget?.type === 'category' ? '分类' : '流水' }}
                </h3>
                <p class="text-clay-text-secondary">
                  您确定要删除"<span class="font-medium">{{ deleteTarget?.name }}</span
                  >"吗？
                </p>
                <p class="text-sm text-red-600 mt-2">
                  <AppIcon icon="mdi:alert-circle" :size="14" class="inline mr-1" />
                  删除后无法恢复
                </p>
              </div>
              <div class="flex items-center gap-3 justify-center">
                <button
                  @click="handleDeleteCancel"
                  :disabled="isDeleting"
                  class="clay-btn-secondary px-4 py-2"
                  :class="{ 'opacity-50 cursor-not-allowed': isDeleting }"
                >
                  取消
                </button>
                <button
                  @click="handleDeleteConfirm"
                  :disabled="isDeleting"
                  class="px-4 py-2 clay-btn flex items-center gap-2"
                  :class="{ 'opacity-75 cursor-not-allowed': isDeleting }"
                >
                  <AppIcon v-if="isDeleting" icon="mdi:loading" :size="16" class="animate-spin" />
                  {{ isDeleting ? '删除中...' : '确认删除' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

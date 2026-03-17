/** * LifeRecordScene 页面容器 - 生活记录场景管理页面 * * 功能说明： * - 页面布局管理和组件协调 * -
响应式布局适配(桌面端三栏/移动端单栏) * - 对话框管理和事件处理 * - 删除确认逻辑 */
<script setup lang="ts">
import { useLifeRecordStore } from '@/stores/lifeRecord'
import { storeToRefs } from 'pinia'
import { showSuccess, showError } from '@/utils/toast'
import type {
  LifeCategory,
  LifeRecord,
  LifeCategoryParams,
  LifeRecordParams,
} from '@/types/api/life'

// 组件导入
import CategoryTab from './components/CategoryTab.vue'
import RecordList from './components/RecordList.vue'
import RecordDetail from './components/RecordDetail.vue'
import CategoryDialog from './components/CategoryDialog.vue'
import RecordDialog from './components/RecordDialog.vue'

// ==================== Store ====================
const store = useLifeRecordStore()
const { currentRecord, loading } = storeToRefs(store)

// ==================== 页面状态 ====================
const isMobile = ref(false)
const showDetail = ref(false)
const showCategoryDialog = ref(false)
const showRecordDialog = ref(false)
const editingCategory = ref<LifeCategory | null>(null)
const editingRecord = ref<LifeRecord | null>(null)

// 删除确认对话框状态
const showDeleteConfirm = ref(false)
const deleteTarget = ref<{
  type: 'category' | 'record'
  id: number
  name: string
} | null>(null)
const isDeleting = ref(false) // 添加删除 loading 状态

// ==================== 响应式检测 ====================
function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

// ==================== 分类对话框处理 ====================
function openCategoryDialog(category?: LifeCategory) {
  editingCategory.value = category || null
  showCategoryDialog.value = true
}

async function handleCategorySave(data: LifeCategoryParams) {
  try {
    if (editingCategory.value) {
      await store.editCategory(data)
      showSuccess('分类编辑成功')
    } else {
      await store.addCategory(data)
      showSuccess('分类创建成功')
    }
  } catch (error: any) {
    showError(error.message || '操作失败')
  }
}

// ==================== 记录对话框处理 ====================
function openRecordDialog(record?: LifeRecord) {
  editingRecord.value = record || null
  showRecordDialog.value = true
}

async function handleRecordSave(data: LifeRecordParams) {
  try {
    if (editingRecord.value) {
      await store.editRecord(data)
      showSuccess('记录编辑成功')
    } else {
      await store.addRecord(data)
      showSuccess('记录创建成功')
    }
  } catch (error: any) {
    showError(error.message || '操作失败')
  }
}

// ==================== 删除确认处理 ====================
function showCategoryDeleteConfirm(category: LifeCategory) {
  deleteTarget.value = {
    type: 'category',
    id: category.id!,
    name: category.name || '',
  }
  showDeleteConfirm.value = true
}

function showRecordDeleteConfirm(record: LifeRecord) {
  deleteTarget.value = {
    type: 'record',
    id: record.id!,
    name: record.title || '',
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
      await store.deleteRecord(deleteTarget.value.id)
    }

    const targetType = deleteTarget.value.type
    showDeleteConfirm.value = false
    deleteTarget.value = null
    showSuccess(`${targetType === 'category' ? '分类' : '记录'}删除成功`)
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

// ==================== 移动端详情页控制 ====================
function showRecordDetail() {
  if (isMobile.value) {
    showDetail.value = true
  }
}

function hideRecordDetail() {
  showDetail.value = false
}

// ==================== 事件处理器 ====================
// 分类事件
function handleCategoryAdd() {
  openCategoryDialog()
}

function handleCategoryEdit(category: LifeCategory) {
  openCategoryDialog(category)
}

function handleCategoryDelete(id: number) {
  const category = store.categories.find((c) => c.id === id)
  if (category) {
    showCategoryDeleteConfirm(category)
  }
}

// 记录事件
function handleRecordAdd() {
  openRecordDialog()
}

function handleRecordEdit(record?: LifeRecord) {
  const targetRecord = record || currentRecord.value
  if (targetRecord) {
    openRecordDialog(targetRecord)
  }
}

function handleRecordDelete(id: number) {
  const targetRecord = store.records.find((r) => r.id === id) || currentRecord.value
  if (targetRecord) {
    showRecordDeleteConfirm(targetRecord)
  }
}

function handleRecordDeleteFromDetail() {
  if (currentRecord.value) {
    showRecordDeleteConfirm(currentRecord.value)
  }
}

function handleRecordSelect(record: LifeRecord) {
  store.loadRecordDetail(record.id!)
  if (isMobile.value) {
    showRecordDetail()
  }
}

// ==================== 生命周期 ====================
onMounted(async () => {
  // 初始化响应式检测
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // 初始化 Store
  await store.init()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// ==================== 监听当前记录变化 ====================
watch(currentRecord, (record) => {
  if (record && isMobile.value) {
    showRecordDetail()
  }
})
</script>

<template>
  <div class="life-record-scene h-full bg-clay-bg-base overflow-hidden">
    <!-- 桌面端: 三栏布局 -->
    <div v-if="!isMobile" class="desktop-layout h-full flex flex-col">
      <!-- 顶部分类标签页 -->
      <div class="category-section shrink-0 p-4">
        <CategoryTab
          @add="handleCategoryAdd"
          @edit="handleCategoryEdit"
          @delete="handleCategoryDelete"
        />
      </div>

      <!-- 内容区域 -->
      <div class="content-section flex-1 flex gap-4 p-4 pt-0 min-h-0">
        <!-- 左侧记录列表 -->
        <div class="record-list w-1/3 min-w-0">
          <RecordList
            @add="handleRecordAdd"
            @select="handleRecordSelect"
            @delete="handleRecordDelete"
          />
        </div>

        <!-- 右侧记录详情 -->
        <div class="record-detail flex-1 min-w-0">
          <RecordDetail @edit="handleRecordEdit" @delete="handleRecordDeleteFromDetail" />
        </div>
      </div>
    </div>

    <!-- 移动端: 单栏布局 -->
    <div v-else class="mobile-layout h-full flex flex-col">
      <!-- 分类标签页和记录列表 -->
      <div v-show="!showDetail" class="flex-1 flex flex-col min-h-0">
        <!-- 分类标签页 -->
        <div class="category-section shrink-0 p-4">
          <CategoryTab
            @add="handleCategoryAdd"
            @edit="handleCategoryEdit"
            @delete="handleCategoryDelete"
          />
        </div>

        <!-- 记录列表 -->
        <div class="record-list flex-1 p-4 pt-0 min-h-0">
          <RecordList
            @add="handleRecordAdd"
            @select="handleRecordSelect"
            @delete="handleRecordDelete"
          />
        </div>
      </div>

      <!-- 记录详情 -->
      <div v-show="showDetail" class="flex-1 flex flex-col min-h-0">
        <!-- 返回按钮 -->
        <div class="shrink-0 p-4 border-b border-gray-200 bg-white">
          <button
            @click="hideRecordDetail"
            class="flex items-center gap-2 text-clay-text-primary hover:text-clay-primary transition-colors"
          >
            <AppIcon icon="mdi:arrow-left" :size="20" />
            <span>返回列表</span>
          </button>
        </div>

        <!-- 详情内容 -->
        <div class="flex-1 p-4 min-h-0">
          <RecordDetail @edit="handleRecordEdit" @delete="handleRecordDeleteFromDetail" />
        </div>
      </div>
    </div>

    <!-- 分类编辑对话框 -->
    <CategoryDialog
      v-model="showCategoryDialog"
      :category="editingCategory || undefined"
      @save="handleCategorySave"
    />

    <!-- 记录编辑对话框 -->
    <RecordDialog
      v-model="showRecordDialog"
      :record="editingRecord || undefined"
      :category-id="store.activeCategoryId || undefined"
      @save="handleRecordSave"
    />

    <!-- 删除确认对话框 -->
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
              <!-- 警告图标 -->
              <div
                class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full"
              >
                <AppIcon icon="mdi:alert" :size="24" class="text-red-600" />
              </div>

              <!-- 标题和内容 -->
              <div class="text-center mb-6">
                <h3 class="text-lg font-semibold text-clay-text-primary mb-2">
                  确认删除{{ deleteTarget?.type === 'category' ? '分类' : '记录' }}
                </h3>
                <p class="text-clay-text-secondary">
                  您确定要删除"<span class="font-medium">{{ deleteTarget?.name }}</span
                  >"吗？
                </p>
                <p class="text-sm text-red-600 mt-2">
                  <AppIcon icon="mdi:alert-circle" :size="16" class="inline mr-1" />
                  删除后无法恢复
                </p>
              </div>

              <!-- 操作按钮 -->
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
/* 确保布局不会溢出 */
.desktop-layout,
.mobile-layout {
  max-height: 100vh;
}

.content-section {
  min-height: 0; /* 允许 flex 子项收缩 */
}

.record-list,
.record-detail {
  min-height: 0; /* 允许 flex 子项收缩 */
}
</style>

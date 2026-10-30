/**
 * 生活记录 - 时间线主视图
 * PC：左时间线 + 右详情常驻；移动端：时间线 + 详情抽屉
 */
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

import CategoryTab from './components/CategoryTab.vue'
import DateFilterBar from './components/DateFilterBar.vue'
import RecordList from './components/RecordList.vue'
import RecordDetail from './components/RecordDetail.vue'
import CategoryDialog from './components/CategoryDialog.vue'
import RecordDialog from './components/RecordDialog.vue'

const store = useLifeRecordStore()
const { currentRecord, detailOpen, activeCategoryId, records, activeRecordId } =
  storeToRefs(store)

const isMobile = ref(false)
const showCategoryDialog = ref(false)
const showRecordDialog = ref(false)
const editingCategory = ref<LifeCategory | null>(null)
const editingRecord = ref<LifeRecord | null>(null)

const showDeleteConfirm = ref(false)
const deleteTarget = ref<{
  type: 'category' | 'record'
  id: number
  name: string
} | null>(null)
const isDeleting = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

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

function handleCategoryAdd() {
  openCategoryDialog()
}

function handleCategoryEdit(category: LifeCategory) {
  openCategoryDialog(category)
}

function handleCategoryDelete(id: number) {
  const category = store.categories.find((c) => c.id === id)
  if (category) showCategoryDeleteConfirm(category)
}

function handleRecordAdd() {
  openRecordDialog()
}

function handleRecordEdit(record?: LifeRecord) {
  const targetRecord = record || currentRecord.value
  if (targetRecord) openRecordDialog(targetRecord)
}

function handleRecordDelete(id: number) {
  const targetRecord = store.records.find((r) => r.id === id) || currentRecord.value
  if (targetRecord) showRecordDeleteConfirm(targetRecord)
}

function handleRecordDeleteFromDetail() {
  if (currentRecord.value) showRecordDeleteConfirm(currentRecord.value)
}

function handleCloseDetail() {
  store.closeDetail()
}

/** PC 端列表有数据且未选中时，自动打开第一条到右侧详情 */
async function ensureDesktopSelection() {
  if (isMobile.value) return
  if (records.value.length === 0) return
  if (activeRecordId.value != null) return
  await store.loadRecordDetail(records.value[0]!.id!, { openDrawer: false })
}

watch(records, () => {
  void ensureDesktopSelection()
})

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  await store.init()
  await ensureDesktopSelection()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="life-record-scene h-full bg-clay-bg-base overflow-hidden relative">
    <div class="h-full flex flex-col min-h-0">
      <!-- 紧凑顶栏 -->
      <div
        class="shrink-0 px-3 pt-3 pb-2 space-y-2 border-b border-black/5 bg-clay-bg-elevated/80 backdrop-blur-sm"
      >
        <CategoryTab
          @add="handleCategoryAdd"
          @edit="handleCategoryEdit"
          @delete="handleCategoryDelete"
        />
        <DateFilterBar />
      </div>

      <!-- 主内容：PC 双栏 / 移动单栏 -->
      <div class="flex-1 min-h-0 px-3 py-3 flex gap-3">
        <!-- 时间线 -->
        <div
          class="h-full min-w-0 flex flex-col bg-clay-bg-elevated rounded-clay-lg border border-black/5 shadow-clay-card px-3 py-2"
          :class="isMobile ? 'w-full' : 'w-full max-w-md lg:max-w-lg shrink-0'"
        >
          <RecordList @add="handleRecordAdd" @delete="handleRecordDelete" />
        </div>

        <!-- PC 右侧详情常驻 -->
        <div
          v-if="!isMobile"
          class="flex-1 min-w-0 h-full rounded-clay-lg overflow-hidden border border-black/5 shadow-clay-card"
        >
          <RecordDetail
            @edit="handleRecordEdit()"
            @delete="handleRecordDeleteFromDetail"
          />
        </div>
      </div>
    </div>

    <!-- 仅移动端：全屏抽屉详情 -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div
          v-if="detailOpen && isMobile"
          class="fixed inset-0 z-40 bg-clay-bg-base flex flex-col"
        >
          <RecordDetail
            show-close
            class="flex-1 min-h-0"
            @edit="handleRecordEdit()"
            @delete="handleRecordDeleteFromDetail"
            @close="handleCloseDetail"
          />
        </div>
      </Transition>
    </Teleport>

    <CategoryDialog
      v-model="showCategoryDialog"
      :category="editingCategory || undefined"
      @save="handleCategorySave"
    />

    <RecordDialog
      v-model="showRecordDialog"
      :record="editingRecord || undefined"
      :category-id="activeCategoryId || undefined"
      @save="handleRecordSave"
    />

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
          <div
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
                确认删除{{ deleteTarget?.type === 'category' ? '分类' : '记录' }}
              </h3>
              <p class="text-clay-text-secondary">
                您确定要删除「<span class="font-medium">{{ deleteTarget?.name }}</span
                >」吗？
              </p>
              <p class="text-sm text-red-600 mt-2">删除后无法恢复</p>
            </div>
            <div class="flex items-center gap-3 justify-center">
              <button
                type="button"
                class="clay-btn-secondary px-4 py-2"
                :disabled="isDeleting"
                @click="handleDeleteCancel"
              >
                取消
              </button>
              <button
                type="button"
                class="px-4 py-2 clay-btn flex items-center gap-2"
                :disabled="isDeleting"
                @click="handleDeleteConfirm"
              >
                <AppIcon v-if="isDeleting" icon="mdi:loading" :size="16" class="animate-spin" />
                {{ isDeleting ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
</style>

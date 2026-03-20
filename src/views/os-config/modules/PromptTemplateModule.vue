<script setup lang="ts">
/**
 * 提示词模板管理模块
 *
 * 功能说明：
 * - 显示提示词模板列表
 * - 支持搜索、新增、编辑、删除操作
 * - 支持分页浏览
 */
import { promptTemplateApi } from '@/api/modules/prompt-template'
import type { FormField, TableColumn, PromptTemplate } from '@/types'

// ==================== 状态 ====================
const loading = ref(false)
const dataList = ref<PromptTemplate[]>([])
const searchKeyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const modalLoading = ref(false)
const formData = ref<any>({})

// 批量选择状态
const selectedKeys = ref<(string | number)[]>([])

// 删除loading状态（记录正在删除的行ID）
const deletingIds = ref<Set<number>>(new Set())

// ==================== 批量操作 ====================
const showBatchToolbar = computed(() => selectedKeys.value.length > 0)

async function handleBatchDelete() {
  const count = selectedKeys.value.length
  if (!confirm(`确定要批量删除选中的 ${count} 个模板吗？此操作不可恢复。`)) {
    return
  }

  try {
    const ids = selectedKeys.value.map((key) => Number(key))
    const response = await promptTemplateApi.remove(ids)
    if (response.code === 200) {
      showSuccess(`成功删除 ${count} 个模板`)
      selectedKeys.value = []
      loadData()
    } else {
      showError(`批量删除失败: ${response.message}`)
    }
  } catch (error) {
    console.error('批量删除出错:', error)
    showError('批量删除失败，请稍后重试')
  }
}

// ==================== 表格列配置 ====================
const columns: TableColumn[] = [
  { key: 'templateName', label: '模板名称', width: '200px' },
  {
    key: 'templateContent',
    label: '模板内容预览',
    width: '350px',
    formatter: (value: string) => {
      if (!value) return '-'
      return value.length > 100 ? value.substring(0, 100) + '...' : value
    },
  },
  {
    key: 'category',
    label: '分类',
    width: '120px',
    formatter: (value: string) => value || '-',
  },
  {
    key: 'createTime',
    label: '创建时间',
    width: '180px',
    formatter: (value: string) => value || '-',
  },
]

// ==================== 表单字段配置 ====================
const formFields: FormField[] = [
  {
    key: 'templateName',
    label: '模板名称',
    type: 'text',
    required: true,
    placeholder: '请输入模板名称',
    validator: (value: string) => {
      if (value.length > 100) {
        return '模板名称不能超过100个字符'
      }
      return null
    },
  },
  {
    key: 'templateContent',
    label: '模板内容',
    type: 'textarea',
    required: true,
    placeholder: '请输入模板内容',
  },
  {
    key: 'category',
    label: '分类',
    type: 'text',
    placeholder: '请输入分类',
    required: true,
  },
  {
    key: 'remark',
    label: '描述',
    type: 'textarea',
    placeholder: '请输入描述信息',
  },
  {
    key: 'priority',
    label: '优先级',
    type: 'number',
    placeholder: '请输入优先级（数字越大优先级越高）',
  },
]

// ==================== 数据加载 ====================
async function loadData() {
  try {
    loading.value = true
    const response = await promptTemplateApi.list(
      searchKeyword.value ? { templateName: searchKeyword.value } : {},
      { pageNum: page.value, pageSize: pageSize.value },
    )

    if (response.code === 200 && response.data) {
      dataList.value = response.data.list || []
      total.value = response.data.total || 0
    } else {
      console.error('加载数据失败:', response.message)
      dataList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载数据出错:', error)
    dataList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// ==================== 搜索 ====================
function handleSearch(keyword: string) {
  searchKeyword.value = keyword
  page.value = 1
  loadData()
}

// ==================== 分页 ====================
function handlePageChange(newPage: number) {
  page.value = newPage
  loadData()
}

function handlePageSizeChange(newPageSize: number) {
  pageSize.value = newPageSize
  page.value = 1
  loadData()
}

// ==================== CRUD 操作 ====================
function handleAdd() {
  modalMode.value = 'add'
  formData.value = { priority: 0 }
  modalVisible.value = true
}

function handleEdit(row: PromptTemplate) {
  modalMode.value = 'edit'
  formData.value = { ...row }
  modalVisible.value = true
}

async function handleDelete(row: PromptTemplate) {
  if (!confirm(`确定要删除模板 "${row.templateName}" 吗？`)) {
    return
  }

  try {
    deletingIds.value.add(row.id)
    const response = await promptTemplateApi.remove([row.id])
    if (response.code === 200) {
      showSuccess('删除成功')
      loadData()
    } else {
      showError(`删除失败: ${response.message}`)
    }
  } catch (error) {
    console.error('删除出错:', error)
    showError('删除失败，请稍后重试')
  } finally {
    deletingIds.value.delete(row.id)
  }
}

/**
 * 判断某行是否正在删除
 */
function isDeleting(id: number): boolean {
  return deletingIds.value.has(id)
}

async function handleSubmit(data: any) {
  try {
    modalLoading.value = true
    const response =
      modalMode.value === 'add'
        ? await promptTemplateApi.add(data)
        : await promptTemplateApi.edit(data)

    if (response.code === 200) {
      showSuccess(`${modalMode.value === 'add' ? '新增' : '编辑'}成功`)
      modalVisible.value = false
      loadData()
    } else {
      showError(`操作失败: ${response.message}`)
    }
  } catch (error) {
    console.error('提交出错:', error)
    showError('操作失败，请稍后重试')
  } finally {
    modalLoading.value = false
  }
}

function handleCancel() {
  modalVisible.value = false
}

// ==================== 初始化 ====================
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="prompt-template-module">
    <!-- 搜索栏 -->
    <div class="mb-4">
      <SearchBar :model-value="searchKeyword" placeholder="搜索模板名称" @search="handleSearch" />
    </div>

    <!-- 操作栏 -->
    <div class="mb-4 flex justify-between items-center">
      <button @click="handleAdd" class="clay-btn">
        <AppIcon icon="mdi:plus" class="mr-2" />
        新增模板
      </button>

      <!-- 批量操作工具栏 -->
      <div v-if="showBatchToolbar" class="batch-toolbar">
        <span class="batch-info">已选中 {{ selectedKeys.length }} 项</span>
        <button @click="handleBatchDelete" class="batch-delete-btn">
          <AppIcon icon="mdi:delete-outline" class="mr-1" />
          批量删除
        </button>
      </div>
    </div>

    <!-- 数据表格 -->
    <DataTable
      :columns="columns"
      :data="dataList"
      :loading="loading"
      :selectable="true"
      v-model:selected-keys="selectedKeys"
      row-key="id"
    >
      <template #actions="{ row }">
        <button @click="handleEdit(row)" class="action-btn edit-btn" :disabled="isDeleting(row.id)">
          <AppIcon icon="mdi:pencil" />
          编辑
        </button>
        <button
          @click="handleDelete(row)"
          class="action-btn delete-btn"
          :class="{ loading: isDeleting(row.id) }"
          :disabled="isDeleting(row.id)"
        >
          <AppIcon v-if="!isDeleting(row.id)" icon="mdi:delete" />
          <AppIcon v-else icon="mdi:loading" class="animate-spin" />
          {{ isDeleting(row.id) ? '删除中...' : '删除' }}
        </button>
      </template>
    </DataTable>

    <!-- 分页 -->
    <div class="mt-4">
      <Pagination
        :page="page"
        :page-size="pageSize"
        :total="total"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>

    <!-- 表单弹窗 -->
    <FormModal
      v-model:visible="modalVisible"
      :title="modalMode === 'add' ? '新增提示词模板' : '编辑提示词模板'"
      :mode="modalMode"
      :form-data="formData"
      :fields="formFields"
      :loading="modalLoading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.prompt-template-module {
  padding: 1.5rem;
}

.clay-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-clay-sm);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  background: var(--clay-primary);
  color: var(--clay-text-inverse);
  box-shadow: var(--shadow-clay-button);
}

.clay-btn:hover {
  background: var(--clay-primary-dark);
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.clay-btn:active {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(1px);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border: none;
  border-radius: var(--radius-clay-sm);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  margin-right: 0.5rem;
}

.edit-btn {
  background: var(--clay-primary);
  color: var(--clay-text-inverse);
  box-shadow: var(--shadow-clay-button);
}

.edit-btn:hover {
  background: var(--clay-primary-dark);
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.edit-btn:active {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(1px);
}

.delete-btn {
  background: #ef4444;
  color: white;
  box-shadow: var(--shadow-clay-button);
}

.delete-btn:hover {
  background: #dc2626;
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.delete-btn:active {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(1px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn.loading {
  position: relative;
}

/* 旋转动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* ==================== 批量操作工具栏 ==================== */
.batch-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(124, 58, 237, 0.05);
  border-radius: var(--radius-clay-sm);
  box-shadow: var(--shadow-clay-card);
  animation: slideIn 0.3s var(--ease-out);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.batch-info {
  font-size: 0.875rem;
  color: var(--clay-text-secondary);
  font-weight: 500;
}

.batch-delete-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-clay-sm);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  background: #ef4444;
  color: white;
  box-shadow: var(--shadow-clay-button);
}

.batch-delete-btn:hover {
  background: #dc2626;
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.batch-delete-btn:active {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(1px);
}
</style>

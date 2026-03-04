<script setup lang="ts">
/**
 * 知识库附件管理页面
 *
 * 功能说明：
 * - 显示知识库附件列表
 * - 支持上传附件
 * - 支持删除附件
 */
import { knowledgeApi } from '@/api/modules/knowledge'
import type { TableColumn, KnowledgeAttach } from '@/types'

const router = useRouter()
const route = useRoute()

// ==================== 状态 ====================
const kid = computed(() => route.params.kid as string)
const loading = ref(false)
const dataList = ref<KnowledgeAttach[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const uploading = ref(false)

// ==================== 表格列配置 ====================
const columns: TableColumn[] = [
  { key: 'docName', label: '文件名', width: '300px' },
  { key: 'docType', label: '文件类型', width: '120px' },
  {
    key: 'vectorStatus',
    label: '状态',
    width: '100px',
    formatter: (value: number) => {
      const statusMap: Record<number, string> = {
        0: '待处理',
        1: '处理中',
        2: '已完成',
        3: '失败',
      }
      return statusMap[value] || '未知'
    },
  },
  {
    key: 'createTime',
    label: '上传时间',
    width: '180px',
    formatter: (value: string) => value || '-',
  },
]

// ==================== 数据加载 ====================
async function loadData() {
  try {
    loading.value = true
    const response = await knowledgeApi.attachList(
      kid.value,
      {},
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

// ==================== 文件上传 ====================
async function handleUpload(file: File) {
  if (!file) return

  try {
    uploading.value = true
    const response = await knowledgeApi.uploadAttach({ file, kid: kid.value })

    if (response.code === 200) {
      showSuccess('上传成功')
      loadData()
    } else {
      showError(`上传失败: ${response.message}`)
    }
  } catch (error) {
    console.error('上传出错:', error)
    showError('上传失败，请稍后重试')
  } finally {
    uploading.value = false
  }
}

// ==================== 删除附件 ====================
async function handleDelete(row: KnowledgeAttach) {
  try {
    const response = await knowledgeApi.removeAttach(row.docId)
    if (response.code === 200) {
      showSuccess('删除成功')
      loadData()
    } else {
      showError(`删除失败: ${response.message}`)
    }
  } catch (error) {
    console.error('删除出错:', error)
    showError('删除失败，请稍后重试')
  }
}

// ==================== 返回 ====================
function handleBack() {
  router.push('/os-config/knowledge')
}

// ==================== 初始化 ====================
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="knowledge-attach-view">
    <!-- 头部 -->
    <div class="mb-4 flex items-center gap-4">
      <button @click="handleBack" class="back-btn">
        <AppIcon icon="mdi:arrow-left" class="mr-2" />
        返回
      </button>
      <h2 class="text-xl font-bold text-clay-text-primary">附件管理</h2>
    </div>

    <!-- 文件上传 -->
    <div class="mb-6">
      <FileUpload
        accept=".txt,.pdf,.doc,.docx,.md"
        :max-size="1024 * 1024 * 1536"
        @upload="handleUpload"
      />
    </div>

    <!-- 数据表格 -->
    <DataTable :columns="columns" :data="dataList" :loading="loading || uploading">
      <template #actions="{ row }">
        <button @click="handleDelete(row)" class="action-btn delete-btn">
          <AppIcon icon="mdi:delete" />
          删除
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
  </div>
</template>

<style scoped>
.knowledge-attach-view {
  padding: 1.5rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-clay-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--clay-bg-base);
  color: var(--clay-text-primary);
  box-shadow: var(--shadow-clay-button);
}

.back-btn:hover {
  background: #e5e7eb;
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-1px);
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
  transition: all 0.2s ease;
}

.delete-btn {
  background: #ef4444;
  color: white;
  box-shadow: var(--shadow-clay-button);
}

.delete-btn:hover {
  background: #dc2626;
  box-shadow: var(--shadow-clay-hover);
}
</style>

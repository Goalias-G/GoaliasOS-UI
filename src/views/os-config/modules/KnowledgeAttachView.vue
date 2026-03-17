<script setup lang="ts">
/**
 * 知识库附件管理页面
 *
 * 功能说明：
 * - 显示知识库附件列表
 * - 支持上传附件
 * - 支持删除附件
 * - 查看文档内容
 * - 查看切分内容
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

// 文档内容查看
const showContentModal = ref(false)
const currentContent = ref('')
const contentLoading = ref(false)

// 切分内容查看
const showFragmentModal = ref(false)
const fragmentList = ref<any[]>([])
const fragmentLoading = ref(false)
const fragmentPage = ref(1)
const fragmentPageSize = ref(10)
const fragmentTotal = ref(0)
const currentDocId = ref('')

// ==================== 表格列配置 ====================
const columns: TableColumn[] = [
  { key: 'docName', label: '文件名', width: '300px' },
  { key: 'docType', label: '文件类型', width: '120px' },
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

// ==================== 查看文档内容 ====================
async function handleViewContent(row: KnowledgeAttach) {
  currentContent.value = row.content
  showContentModal.value = true
}

function closeContentModal() {
  showContentModal.value = false
  currentContent.value = ''
}

// ==================== 查看切分内容 ====================
async function handleViewFragments(row: KnowledgeAttach) {
  currentDocId.value = row.docId
  fragmentPage.value = 1
  showFragmentModal.value = true
  loadFragments()
}

async function loadFragments() {
  try {
    fragmentLoading.value = true
    const response = await knowledgeApi.fragmentList(
      currentDocId.value,
      {},
      { pageNum: fragmentPage.value, pageSize: fragmentPageSize.value },
    )

    if (response.code === 200 && response.data) {
      fragmentList.value = response.data.list || []
      fragmentTotal.value = response.data.total || 0
    } else {
      console.error('加载切分内容失败:', response.message)
      fragmentList.value = []
      fragmentTotal.value = 0
      showError(`加载失败: ${response.message}`)
    }
  } catch (error) {
    console.error('加载切分内容出错:', error)
    fragmentList.value = []
    fragmentTotal.value = 0
    showError('加载失败，请稍后重试')
  } finally {
    fragmentLoading.value = false
  }
}

function handleFragmentPageChange(newPage: number) {
  fragmentPage.value = newPage
  loadFragments()
}

function closeFragmentModal() {
  showFragmentModal.value = false
  fragmentList.value = []
  currentDocId.value = ''
  fragmentPage.value = 1
  fragmentTotal.value = 0
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
      <FileUpload :max-size="1536" @upload="handleUpload" />
    </div>

    <!-- 数据表格 -->
    <DataTable :columns="columns" :data="dataList" :loading="loading || uploading">
      <template #actions="{ row }">
        <button @click="handleViewContent(row)" class="action-btn view-btn">
          <AppIcon icon="mdi:file-document-outline" />
          查看内容
        </button>
        <button @click="handleViewFragments(row)" class="action-btn fragment-btn">
          <AppIcon icon="mdi:file-tree-outline" />
          切分内容
        </button>
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

    <!-- 文档内容查看模态框 -->
    <Teleport to="body">
      <div v-if="showContentModal" class="modal-overlay" @click="closeContentModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">文档内容</h3>
            <button @click="closeContentModal" class="modal-close-btn">
              <AppIcon icon="mdi:close" :size="24" />
            </button>
          </div>
          <div class="modal-body">
            <div class="content-display">
              <pre class="content-text">{{ currentContent }}</pre>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 切分内容查看模态框 -->
    <Teleport to="body">
      <div v-if="showFragmentModal" class="modal-overlay" @click="closeFragmentModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">切分内容列表</h3>
            <button @click="closeFragmentModal" class="modal-close-btn">
              <AppIcon icon="mdi:close" :size="24" />
            </button>
          </div>
          <div class="modal-body">
            <div v-if="fragmentLoading" class="loading-state">
              <AppIcon icon="mdi:loading" :size="32" class="animate-spin" />
              <p>加载中...</p>
            </div>
            <div v-else-if="fragmentList.length === 0" class="empty-state">
              <AppIcon icon="mdi:file-outline" :size="48" class="text-gray-400" />
              <p class="text-gray-500 mt-2">暂无切分内容</p>
            </div>
            <div v-else class="fragment-list">
              <div v-for="fragment in fragmentList" :key="fragment.id" class="fragment-item">
                <div class="fragment-header">
                  <span class="fragment-index">片段 {{ fragment.idx }}</span>
                  <span class="fragment-time">{{ fragment.createTime || '-' }}</span>
                </div>
                <pre class="fragment-content">{{ fragment.content }}</pre>
              </div>
            </div>
          </div>
          <div v-if="fragmentTotal > fragmentPageSize" class="modal-footer">
            <Pagination
              :page="fragmentPage"
              :page-size="fragmentPageSize"
              :total="fragmentTotal"
              @update:page="handleFragmentPageChange"
            />
          </div>
        </div>
      </div>
    </Teleport>
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
  margin-right: 0.5rem;
}

.view-btn {
  background: var(--clay-primary);
  color: white;
  box-shadow: var(--shadow-clay-button);
}

.view-btn:hover {
  background: var(--clay-primary-dark);
  box-shadow: var(--shadow-clay-hover);
}

.fragment-btn {
  background: #10b981;
  color: white;
  box-shadow: var(--shadow-clay-button);
}

.fragment-btn:hover {
  background: #059669;
  box-shadow: var(--shadow-clay-hover);
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

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--clay-bg-elevated);
  border-radius: var(--radius-clay-md);
  box-shadow: var(--shadow-clay-card);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--clay-text-primary);
  margin: 0;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  color: var(--clay-text-secondary);
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: #f3f4f6;
  color: var(--clay-text-primary);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--clay-text-secondary);
}

.loading-state p {
  margin-top: 1rem;
  font-size: 0.875rem;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

/* 文档内容显示 */
.content-display {
  background: #f9fafb;
  border-radius: var(--radius-clay-sm);
  padding: 1rem;
  min-height: 200px;
}

.content-text {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--clay-text-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

/* 切分内容列表 */
.fragment-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fragment-item {
  background: #f9fafb;
  border-radius: var(--radius-clay-sm);
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.fragment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.fragment-index {
  font-weight: 600;
  color: var(--clay-primary);
  font-size: 0.875rem;
}

.fragment-time {
  font-size: 0.75rem;
  color: var(--clay-text-muted);
}

.fragment-content {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--clay-text-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.125rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 0.75rem 1rem;
  }

  .action-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    margin-right: 0.25rem;
  }

  .content-text,
  .fragment-content {
    font-size: 0.8125rem;
  }

  .fragment-item {
    padding: 0.75rem;
  }

  .fragment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

/* 滚动条样式 */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

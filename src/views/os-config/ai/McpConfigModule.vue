<script setup lang="ts">
/**
 * MCP 配置模块
 *
 * 功能说明：
 * - 外部 MCP Server（HTTP Streamable）CRUD 与启停
 * - 同步 / 探测远端 tools
 * - 工具列表预览与自定义启停
 */
import { mcpClientServerApi, mcpClientToolApi } from '@/api/modules/mcp'
import type {
  FormField,
  McpClientServer,
  McpClientTool,
  McpStatus,
  TableColumn,
} from '@/types'

// ==================== Server 列表状态 ====================
const loading = ref(false)
const dataList = ref<McpClientServer[]>([])
const searchKeyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedKeys = ref<(string | number)[]>([])
const deletingIds = ref<Set<number>>(new Set())
const statusChangingIds = ref<Set<number>>(new Set())
const syncingIds = ref<Set<number>>(new Set())
const testingIds = ref<Set<number>>(new Set())

const showBatchToolbar = computed(() => selectedKeys.value.length > 0)

// ==================== Server 表单 ====================
const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const modalLoading = ref(false)
const formData = ref<Record<string, unknown>>({})

// ==================== 工具预览弹窗 ====================
const toolModalVisible = ref(false)
const toolModalTitle = ref('工具预览')
const toolLoading = ref(false)
const toolList = ref<McpClientTool[]>([])
const toolPage = ref(1)
const toolPageSize = ref(10)
const toolTotal = ref(0)
const currentServerId = ref<number | null>(null)
const toolStatusChangingIds = ref<Set<number>>(new Set())
/** test 模式仅展示探测结果，不可启停 */
const toolModalReadonly = ref(false)

const columns: TableColumn[] = [
  { key: 'serverName', label: '名称', width: '140px' },
  { key: 'serverCode', label: '短码', width: '110px' },
  {
    key: 'endpointUrl',
    label: 'Endpoint',
    width: '240px',
    formatter: (value: string) => {
      if (!value) return '-'
      return value.length > 48 ? `${value.slice(0, 48)}...` : value
    },
  },
  {
    key: 'status',
    label: '状态',
    width: '90px',
    formatter: (value: string) => (value === '1' ? '启用' : '停用'),
  },
  {
    key: 'lastSyncTime',
    label: '最近同步',
    width: '160px',
    formatter: (value: string) => value || '-',
  },
  {
    key: 'lastError',
    label: '最近错误',
    width: '180px',
    formatter: (value: string) => {
      if (!value) return '-'
      return value.length > 40 ? `${value.slice(0, 40)}...` : value
    },
  },
]

const formFields: FormField[] = [
  {
    key: 'serverName',
    label: 'Server 名称',
    type: 'text',
    required: true,
    placeholder: '例如：高德地图 MCP',
    validator: (value: string) => (value.length > 64 ? '名称不能超过64个字符' : null),
  },
  {
    key: 'serverCode',
    label: '短码（工具名前缀）',
    type: 'text',
    required: true,
    placeholder: '字母开头，如 amap',
    validator: (value: string) => {
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
        return '短码需以字母开头，仅含字母数字下划线'
      }
      if (value.length > 32) return '短码不能超过32个字符'
      return null
    },
  },
  {
    key: 'endpointUrl',
    label: 'Endpoint URL',
    type: 'text',
    required: true,
    placeholder: 'https://example.com/mcp',
    validator: (value: string) => {
      if (!/^https?:\/\//.test(value)) return '必须以 http:// 或 https:// 开头'
      return null
    },
  },
  {
    key: 'transportType',
    label: '传输类型',
    type: 'select',
    required: true,
    options: [{ label: 'HTTP Streamable', value: 'http_streamable' }],
  },
  {
    key: 'apiKey',
    label: 'API Key（可选）',
    type: 'text',
    placeholder: 'Bearer Token，可不填',
  },
  {
    key: 'headersJson',
    label: '自定义 Headers（JSON）',
    type: 'textarea',
    placeholder: '{"X-Custom":"value"}',
    validator: (value: string) => {
      if (!value) return null
      try {
        const parsed = JSON.parse(value)
        if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
          return 'headers 必须是 JSON 对象'
        }
        return null
      } catch {
        return 'headers 不是合法 JSON'
      }
    },
  },
  {
    key: 'connectTimeoutMs',
    label: '连接超时（毫秒）',
    type: 'number',
    placeholder: '默认 10000',
  },
  {
    key: 'requestTimeoutMs',
    label: '请求超时（毫秒）',
    type: 'number',
    placeholder: '默认 30000',
  },
  {
    key: 'status',
    label: '初始状态',
    type: 'select',
    required: true,
    options: [
      { label: '停用', value: '0' },
      { label: '启用', value: '1' },
    ],
  },
  {
    key: 'remark',
    label: '备注',
    type: 'textarea',
    placeholder: '可选备注',
  },
]

const toolColumns: TableColumn[] = [
  { key: 'exposedName', label: '暴露名', width: '180px' },
  { key: 'remoteToolName', label: '远端名', width: '140px' },
  {
    key: 'description',
    label: '描述',
    width: '260px',
    formatter: (value: string) => {
      if (!value) return '-'
      return value.length > 80 ? `${value.slice(0, 80)}...` : value
    },
  },
  {
    key: 'status',
    label: '状态',
    width: '90px',
    formatter: (value: string) => (value === '1' ? '启用' : '停用'),
  },
]

async function loadData() {
  try {
    loading.value = true
    const response = await mcpClientServerApi.list(
      searchKeyword.value ? { serverName: searchKeyword.value } : {},
      { pageNum: page.value, pageSize: pageSize.value },
    )
    if (response.code === 200 && response.data) {
      dataList.value = response.data.list || []
      total.value = response.data.total || 0
    } else {
      dataList.value = []
      total.value = 0
      showError(response.message || '加载 MCP Server 失败')
    }
  } catch (error) {
    console.error('加载 MCP Server 出错:', error)
    dataList.value = []
    total.value = 0
    showError('加载 MCP Server 失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function handleSearch(keyword: string) {
  searchKeyword.value = keyword
  page.value = 1
  loadData()
}

function handlePageChange(newPage: number) {
  page.value = newPage
  loadData()
}

function handlePageSizeChange(newPageSize: number) {
  pageSize.value = newPageSize
  page.value = 1
  loadData()
}

function handleAdd() {
  modalMode.value = 'add'
  formData.value = {
    transportType: 'http_streamable',
    status: '0',
    connectTimeoutMs: 10000,
    requestTimeoutMs: 30000,
  }
  modalVisible.value = true
}

function handleEdit(row: McpClientServer) {
  modalMode.value = 'edit'
  formData.value = {
    ...row,
    transportType: row.transportType || 'http_streamable',
    status: row.status || '0',
  }
  modalVisible.value = true
}

async function handleSubmit(data: Record<string, unknown>) {
  try {
    modalLoading.value = true
    const payload = {
      ...data,
      transportType: 'http_streamable',
      connectTimeoutMs: Number(data.connectTimeoutMs || 10000),
      requestTimeoutMs: Number(data.requestTimeoutMs || 30000),
    }
    const response =
      modalMode.value === 'add'
        ? await mcpClientServerApi.add(payload as never)
        : await mcpClientServerApi.edit(payload as never)

    if (response.code === 200) {
      showSuccess(`${modalMode.value === 'add' ? '新增' : '编辑'}成功`)
      modalVisible.value = false
      loadData()
    } else {
      showError(`操作失败: ${response.message}`)
    }
  } catch (error) {
    console.error('提交 MCP Server 出错:', error)
    showError('操作失败，请稍后重试')
  } finally {
    modalLoading.value = false
  }
}

function handleCancel() {
  modalVisible.value = false
}

async function handleDelete(row: McpClientServer) {
  if (!row.id) return
  if (!confirm(`确定删除 MCP Server「${row.serverName}」吗？关联工具缓存也会删除。`)) {
    return
  }
  try {
    deletingIds.value.add(row.id)
    const response = await mcpClientServerApi.remove([row.id])
    if (response.code === 200) {
      showSuccess('删除成功')
      loadData()
    } else {
      showError(`删除失败: ${response.message}`)
    }
  } catch (error) {
    console.error('删除 MCP Server 出错:', error)
    showError('删除失败，请稍后重试')
  } finally {
    deletingIds.value.delete(row.id)
  }
}

async function handleBatchDelete() {
  const count = selectedKeys.value.length
  if (!confirm(`确定批量删除选中的 ${count} 个 MCP Server 吗？`)) return
  try {
    const ids = selectedKeys.value.map((key) => Number(key))
    const response = await mcpClientServerApi.remove(ids)
    if (response.code === 200) {
      showSuccess(`成功删除 ${count} 个 Server`)
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

async function handleToggleStatus(row: McpClientServer) {
  if (!row.id) return
  const next: McpStatus = row.status === '1' ? '0' : '1'
  try {
    statusChangingIds.value.add(row.id)
    const response = await mcpClientServerApi.changeStatus({ id: row.id, status: next })
    if (response.code === 200) {
      showSuccess(next === '1' ? '已启用' : '已停用')
      loadData()
    } else {
      showError(`状态变更失败: ${response.message}`)
    }
  } catch (error) {
    console.error('启停 MCP Server 出错:', error)
    showError('状态变更失败，请稍后重试')
  } finally {
    statusChangingIds.value.delete(row.id)
  }
}

async function handleSyncTools(row: McpClientServer) {
  if (!row.id) return
  try {
    syncingIds.value.add(row.id)
    const response = await mcpClientServerApi.syncTools(row.id)
    if (response.code === 200) {
      const count = response.data?.toolCount ?? 0
      showSuccess(`同步成功，共 ${count} 个工具`)
      loadData()
    } else {
      showError(`同步失败: ${response.message}`)
    }
  } catch (error) {
    console.error('同步工具出错:', error)
    showError('同步失败，请稍后重试')
  } finally {
    syncingIds.value.delete(row.id)
  }
}

async function handleTest(row: McpClientServer) {
  if (!row.id) return
  try {
    testingIds.value.add(row.id)
    const response = await mcpClientServerApi.test(row.id)
    if (response.code === 200) {
      toolModalReadonly.value = true
      toolModalTitle.value = `连通性探测 · ${row.serverName}`
      currentServerId.value = row.id
      toolList.value = response.data || []
      toolTotal.value = toolList.value.length
      toolPage.value = 1
      toolModalVisible.value = true
      showSuccess(`探测成功，发现 ${toolList.value.length} 个工具`)
    } else {
      showError(`探测失败: ${response.message}`)
    }
  } catch (error) {
    console.error('连通性探测出错:', error)
    showError('探测失败，请稍后重试')
  } finally {
    testingIds.value.delete(row.id)
  }
}

async function openToolPreview(row: McpClientServer) {
  if (!row.id) return
  toolModalReadonly.value = false
  toolModalTitle.value = `工具预览 · ${row.serverName}`
  currentServerId.value = row.id
  toolPage.value = 1
  toolModalVisible.value = true
  await loadTools()
}

async function loadTools() {
  if (!currentServerId.value || toolModalReadonly.value) return
  try {
    toolLoading.value = true
    const response = await mcpClientToolApi.list(
      { serverId: currentServerId.value },
      { pageNum: toolPage.value, pageSize: toolPageSize.value },
    )
    if (response.code === 200 && response.data) {
      toolList.value = response.data.list || []
      toolTotal.value = response.data.total || 0
    } else {
      toolList.value = []
      toolTotal.value = 0
      showError(response.message || '加载工具失败')
    }
  } catch (error) {
    console.error('加载工具出错:', error)
    toolList.value = []
    toolTotal.value = 0
    showError('加载工具失败，请稍后重试')
  } finally {
    toolLoading.value = false
  }
}

function handleToolPageChange(newPage: number) {
  toolPage.value = newPage
  loadTools()
}

function handleToolPageSizeChange(newSize: number) {
  toolPageSize.value = newSize
  toolPage.value = 1
  loadTools()
}

async function handleToggleToolStatus(row: McpClientTool) {
  if (!row.id || toolModalReadonly.value) return
  const next: McpStatus = row.status === '1' ? '0' : '1'
  try {
    toolStatusChangingIds.value.add(row.id)
    const response = await mcpClientToolApi.changeStatus({ id: row.id, status: next })
    if (response.code === 200) {
      showSuccess(next === '1' ? '工具已启用' : '工具已停用')
      await loadTools()
    } else {
      showError(`工具状态变更失败: ${response.message}`)
    }
  } catch (error) {
    console.error('启停工具出错:', error)
    showError('工具状态变更失败，请稍后重试')
  } finally {
    toolStatusChangingIds.value.delete(row.id)
  }
}

function closeToolModal() {
  toolModalVisible.value = false
  toolList.value = []
  currentServerId.value = null
  toolModalReadonly.value = false
}

function isDeleting(id?: number) {
  return !!id && deletingIds.value.has(id)
}
function isStatusChanging(id?: number) {
  return !!id && statusChangingIds.value.has(id)
}
function isSyncing(id?: number) {
  return !!id && syncingIds.value.has(id)
}
function isTesting(id?: number) {
  return !!id && testingIds.value.has(id)
}
function isToolStatusChanging(id?: number) {
  return !!id && toolStatusChangingIds.value.has(id)
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="mcp-config-module">
    <div class="mb-4">
      <SearchBar :model-value="searchKeyword" placeholder="搜索 Server 名称" @search="handleSearch" />
    </div>

    <div class="mb-4 flex justify-between items-center flex-wrap gap-3">
      <button type="button" class="clay-btn" @click="handleAdd">
        <AppIcon icon="mdi:plus" class="mr-2" />
        新增 MCP Server
      </button>

      <div v-if="showBatchToolbar" class="batch-toolbar">
        <span class="batch-info">已选中 {{ selectedKeys.length }} 项</span>
        <button type="button" class="batch-delete-btn" @click="handleBatchDelete">
          <AppIcon icon="mdi:delete-outline" class="mr-1" />
          批量删除
        </button>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :data="dataList"
      :loading="loading"
      :selectable="true"
      v-model:selected-keys="selectedKeys"
      row-key="id"
    >
      <template #actions="{ row }">
        <button
          type="button"
          class="action-btn"
          :class="row.status === '1' ? 'pause-btn' : 'play-btn'"
          :disabled="isStatusChanging(row.id)"
          @click="handleToggleStatus(row)"
        >
          <AppIcon
            :icon="
              isStatusChanging(row.id)
                ? 'mdi:loading'
                : row.status === '1'
                  ? 'mdi:pause-circle-outline'
                  : 'mdi:play-circle-outline'
            "
            :class="{ 'animate-spin': isStatusChanging(row.id) }"
          />
          {{ row.status === '1' ? '停用' : '启用' }}
        </button>
        <button
          type="button"
          class="action-btn sync-btn"
          :disabled="isSyncing(row.id)"
          @click="handleSyncTools(row)"
        >
          <AppIcon
            :icon="isSyncing(row.id) ? 'mdi:loading' : 'mdi:sync'"
            :class="{ 'animate-spin': isSyncing(row.id) }"
          />
          同步
        </button>
        <button
          type="button"
          class="action-btn test-btn"
          :disabled="isTesting(row.id)"
          @click="handleTest(row)"
        >
          <AppIcon
            :icon="isTesting(row.id) ? 'mdi:loading' : 'mdi:connection'"
            :class="{ 'animate-spin': isTesting(row.id) }"
          />
          探测
        </button>
        <button type="button" class="action-btn tools-btn" @click="openToolPreview(row)">
          <AppIcon icon="mdi:tools" />
          工具
        </button>
        <button
          type="button"
          class="action-btn edit-btn"
          :disabled="isDeleting(row.id)"
          @click="handleEdit(row)"
        >
          <AppIcon icon="mdi:pencil" />
          编辑
        </button>
        <button
          type="button"
          class="action-btn delete-btn"
          :class="{ loading: isDeleting(row.id) }"
          :disabled="isDeleting(row.id)"
          @click="handleDelete(row)"
        >
          <AppIcon v-if="!isDeleting(row.id)" icon="mdi:delete" />
          <AppIcon v-else icon="mdi:loading" class="animate-spin" />
          {{ isDeleting(row.id) ? '删除中' : '删除' }}
        </button>
      </template>
    </DataTable>

    <div class="mt-4">
      <Pagination
        :page="page"
        :page-size="pageSize"
        :total="total"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>

    <FormModal
      v-model:visible="modalVisible"
      :title="modalMode === 'add' ? '新增 MCP Server' : '编辑 MCP Server'"
      :mode="modalMode"
      :form-data="formData"
      :fields="formFields"
      :loading="modalLoading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />

    <!-- 工具预览弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="toolModalVisible" class="modal-overlay" @click.self="closeToolModal">
          <div class="modal-container clay-card">
            <div class="modal-header">
              <h3 class="modal-title">{{ toolModalTitle }}</h3>
              <button type="button" class="close-btn" @click="closeToolModal">
                <AppIcon icon="mdi:close" :size="20" />
              </button>
            </div>

            <div class="modal-body">
              <p v-if="toolModalReadonly" class="hint-text mb-3">
                探测结果仅预览，不会写入数据库。请使用「同步」落库后再自定义启停。
              </p>

              <DataTable
                :columns="toolColumns"
                :data="toolList"
                :loading="toolLoading"
                row-key="exposedName"
              >
                <template #actions="{ row }">
                  <button
                    v-if="!toolModalReadonly"
                    type="button"
                    class="action-btn"
                    :class="row.status === '1' ? 'pause-btn' : 'play-btn'"
                    :disabled="isToolStatusChanging(row.id)"
                    @click="handleToggleToolStatus(row)"
                  >
                    <AppIcon
                      :icon="
                        isToolStatusChanging(row.id)
                          ? 'mdi:loading'
                          : row.status === '1'
                            ? 'mdi:pause-circle-outline'
                            : 'mdi:play-circle-outline'
                      "
                      :class="{ 'animate-spin': isToolStatusChanging(row.id) }"
                    />
                    {{ row.status === '1' ? '停用' : '启用' }}
                  </button>
                  <span v-else class="text-clay-text-secondary text-sm">仅预览</span>
                </template>
              </DataTable>

              <div v-if="!toolModalReadonly" class="mt-4">
                <Pagination
                  :page="toolPage"
                  :page-size="toolPageSize"
                  :total="toolTotal"
                  @update:page="handleToolPageChange"
                  @update:page-size="handleToolPageSizeChange"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mcp-config-module {
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
  font-size: 0.8125rem;
  border: none;
  border-radius: var(--radius-clay-sm);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  margin-right: 0.35rem;
  margin-bottom: 0.25rem;
  color: white;
  box-shadow: var(--shadow-clay-button);
}

.action-btn:hover {
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.action-btn:active {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(1px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.play-btn {
  background: #16a34a;
}

.pause-btn {
  background: #ca8a04;
}

.sync-btn {
  background: #0ea5e9;
}

.test-btn {
  background: #6366f1;
}

.tools-btn {
  background: #8b5cf6;
}

.edit-btn {
  background: var(--clay-primary);
}

.delete-btn {
  background: #ef4444;
}

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

.batch-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(124, 58, 237, 0.05);
  border-radius: var(--radius-clay-sm);
  box-shadow: var(--shadow-clay-card);
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
  background: #ef4444;
  color: white;
  box-shadow: var(--shadow-clay-button);
}

.batch-delete-btn:hover {
  background: #dc2626;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.45);
}

.modal-container {
  width: min(960px, 100%);
  max-height: 85vh;
  overflow: auto;
  padding: 0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--clay-text-primary);
}

.close-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--clay-text-secondary);
  padding: 0.25rem;
  border-radius: var(--radius-clay-sm);
}

.close-btn:hover {
  background: var(--clay-bg-elevated);
}

.modal-body {
  padding: 1.25rem;
}

.hint-text {
  font-size: 0.875rem;
  color: var(--clay-text-secondary);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .action-btn,
  .clay-btn,
  .modal-enter-active,
  .modal-leave-active,
  .animate-spin {
    transition: none !important;
    animation: none !important;
  }
}
</style>

<script setup lang="ts">
/**
 * 动态调度任务管理模块
 *
 * 功能说明：
 * - 显示动态任务列表，支持分页、按任务名/类型/状态筛选
 * - 任务启停、立即执行、编辑、删除（带二次确认）
 * - 新增/编辑任务时，taskType 切换 FINANCE / EMAIL_CHAT 表单随之切换
 * - FINANCE 与 EMAIL_CHAT 自定义参数按 taskType 序列化为 taskParams JSON
 * - 编辑时反序列化 taskParams 回填到对应子结构
 * - cron 表达式非法前端拦截，不发请求
 * - 执行日志分页查询，支持多条件（taskId / 任务名 / 类型 / 状态 / 来源 / 时间范围）
 * - 日志批量删除、一键清空（双重确认）
 */
import { sysScheduledTaskApi, sysScheduledTaskLogApi } from '@/api/modules/scheduled-task'
import { financeCategoryApi } from '@/api/modules/finance'
import type {
  FormField,
  TableColumn,
  SysScheduledTask,
  SysScheduledTaskLog,
  TaskExecuteResult,
  TaskType,
  FinanceCategory,
} from '@/types'

// ==================== Tab ====================
type TabKey = 'task' | 'log'
const activeTab = ref<TabKey>('task')
const loadedTabs = ref<Set<TabKey>>(new Set())

// ==================== 任务列表状态 ====================
const taskLoading = ref(false)
const taskList = ref<SysScheduledTask[]>([])
const taskSearchKeyword = ref('')
const taskTypeFilter = ref<'' | TaskType>('')
const taskStatusFilter = ref<'' | '0' | '1'>('')
const taskPage = ref(1)
const taskPageSize = ref(10)
const taskTotal = ref(0)
const taskSelectedKeys = ref<(string | number)[]>([])
const taskDeletingIds = ref<Set<number>>(new Set())
const taskChangingIds = ref<Set<number>>(new Set())
const taskRunningIds = ref<Set<number>>(new Set())

// ==================== 任务编辑弹窗状态 ====================
const taskModalVisible = ref(false)
const taskModalMode = ref<'add' | 'edit'>('add')
const taskModalLoading = ref(false)
const taskFormData = ref<any>({})
const taskFormErrors = ref<Record<string, string>>({})
const cronHint = ref('')

const financeCategories = ref<FinanceCategory[]>([])

const emptyFinanceParams = () => ({
  categoryId: undefined as number | undefined,
  amount: 0,
  tag: 2 as 1 | 2 | 3 | 4,
  remark: '',
})
const emptyEmailParams = () => ({
  prompt: '',
  recipient: '',
  subject: '',
})

// ==================== 立即执行结果弹窗 ====================
const resultModalVisible = ref(false)
const resultRow = ref<SysScheduledTask | null>(null)
const resultData = ref<TaskExecuteResult | null>(null)

// ==================== 日志状态 ====================
const logLoading = ref(false)
const logList = ref<SysScheduledTaskLog[]>([])
const logPage = ref(1)
const logPageSize = ref(10)
const logTotal = ref(0)
const logSelectedKeys = ref<(string | number)[]>([])
const logDeletingIds = ref<Set<number>>(new Set())
const logFilters = ref({
  taskId: '' as number | '',
  taskName: '',
  taskType: '' as '' | TaskType,
  status: '' as '' | '0' | '1',
  source: '' as '' | 'SCHEDULE' | 'MANUAL',
  beginTime: '',
  endTime: '',
})

// ==================== 常量 ====================
const TASK_TYPE_OPTIONS: { label: string; value: TaskType }[] = [
  { label: '财务任务', value: 'FINANCE' },
  { label: 'AI 邮件对话', value: 'EMAIL_CHAT' },
]

const FINANCE_TAG_OPTIONS = [
  { label: '必要支出', value: 1 },
  { label: '弹性支出', value: 2 },
  { label: '工薪收入', value: 3 },
  { label: '额外收入', value: 4 },
]

const STATUS_OPTIONS = [
  { label: '暂停', value: '0' },
  { label: '运行', value: '1' },
]

const LOG_STATUS_OPTIONS = [
  { label: '失败', value: '0' },
  { label: '成功', value: '1' },
]

const SOURCE_OPTIONS = [
  { label: '调度触发', value: 'SCHEDULE' },
  { label: '手动触发', value: 'MANUAL' },
]

// ==================== 格式化 ====================
function formatTaskType(type: TaskType | string): string {
  const map: Record<string, string> = {
    FINANCE: '财务任务',
    EMAIL_CHAT: 'AI 邮件对话',
    LIFE: '生活任务',
    CHAT: '对话任务',
  }
  return map[type] || (type as string) || '-'
}

function formatStatus(status: string): string {
  return status === '1' ? '运行' : '暂停'
}

function formatExecStatus(status: string): string {
  return status === '1' ? '成功' : '失败'
}

function formatSource(source: string): string {
  return source === 'MANUAL' ? '手动触发' : '调度触发'
}

function formatDuration(ms?: number): string {
  if (ms === undefined || ms === null) return '-'
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(3)} s`
}

// ==================== 任务列表列 ====================
const taskColumns: TableColumn[] = [
  { key: 'id', label: 'ID', width: '70px' },
  { key: 'taskName', label: '任务名称', width: '180px' },
  {
    key: 'taskType',
    label: '类型',
    width: '110px',
    formatter: (v: string) => formatTaskType(v),
  },
  {
    key: 'cronExpression',
    label: 'Cron',
    width: '160px',
    formatter: (v: string) => v || '-',
  },
  {
    key: 'status',
    label: '状态',
    width: '80px',
    formatter: (v: string) => formatStatus(v),
  },
  {
    key: 'lastExecuteTime',
    label: '上次执行',
    width: '170px',
    formatter: (v: string) => v || '-',
  },
  {
    key: 'lastExecuteStatus',
    label: '上次结果',
    width: '90px',
    formatter: (v: string) => (v ? formatExecStatus(v) : '-'),
  },
  {
    key: 'executeCount',
    label: '执行次数',
    width: '90px',
    formatter: (v: number) => (v ?? 0).toString(),
  },
  {
    key: 'nextExecuteTime',
    label: '下次执行',
    width: '170px',
    formatter: (v: string) => v || '-',
  },
  {
    key: 'remark',
    label: '描述',
    width: '180px',
    formatter: (v: string) => v || '-',
  },
]

// ==================== 日志列表列 ====================
const logColumns: TableColumn[] = [
  { key: 'taskId', label: '任务ID', width: '80px' },
  { key: 'taskName', label: '任务名', width: '160px' },
  {
    key: 'taskType',
    label: '类型',
    width: '100px',
    formatter: (v: string) => formatTaskType(v),
  },
  {
    key: 'source',
    label: '来源',
    width: '100px',
    formatter: (v: string) => formatSource(v),
  },
  {
    key: 'startTime',
    label: '开始时间',
    width: '170px',
    formatter: (v: string) => v || '-',
  },
  {
    key: 'endTime',
    label: '结束时间',
    width: '170px',
    formatter: (v: string) => v || '-',
  },
  {
    key: 'durationMs',
    label: '耗时',
    width: '100px',
    formatter: (v: number) => formatDuration(v),
  },
  {
    key: 'status',
    label: '结果',
    width: '80px',
    formatter: (v: string) => formatExecStatus(v),
  },
  {
    key: 'resultMessage',
    label: '结果消息',
    width: '220px',
    formatter: (v: string) => v || '-',
  },
  {
    key: 'errorMessage',
    label: '错误信息',
    width: '220px',
    formatter: (v: string) => v || '-',
  },
]

// ==================== 财务分类下拉选项 ====================
const financeCategoryOptions = computed(() =>
  financeCategories.value.map((c) => ({
    label: `${c.name}（${c.type === 1 ? '支出' : '收入'}）`,
    value: c.id,
  })),
)

// ==================== 任务表单字段（基础 + 动态） ====================
const baseTaskFields: FormField[] = [
  {
    key: 'taskName',
    label: '任务名称',
    type: 'text',
    required: true,
    placeholder: '请输入任务名称',
    validator: (v: string) => (v && v.length > 100 ? '任务名称不能超过100个字符' : null),
  },
  {
    key: 'taskType',
    label: '任务类型',
    type: 'select',
    required: true,
    options: TASK_TYPE_OPTIONS,
  },
  {
    key: 'cronExpression',
    label: 'Cron 表达式',
    type: 'text',
    required: true,
    placeholder: '例如：1 2 * * * （每天每时2分1秒）',
  },
  {
    key: 'description',
    label: '任务描述',
    type: 'text',
    placeholder: '请输入任务描述',
  },
  {
    key: 'status',
    label: '初始状态',
    type: 'select',
    options: STATUS_OPTIONS,
  },
  {
    key: 'remark',
    label: '备注',
    type: 'textarea',
    placeholder: '请输入备注信息',
  },
]

const financeParamFields: FormField[] = [
  {
    key: 'financeParams.categoryId',
    label: '财务分类',
    type: 'select',
    required: true,
    options: [],
    placeholder: '请选择财务分类',
  },
  {
    key: 'financeParams.amount',
    label: '金额（元）',
    type: 'number',
    placeholder: '默认 0',
    validator: (v: any) => {
      if (v === undefined || v === null || v === '') return null
      if (Number.isNaN(Number(v))) return '金额必须为数字'
      return null
    },
  },
  {
    key: 'financeParams.tag',
    label: '流水标签',
    type: 'select',
    options: FINANCE_TAG_OPTIONS,
  },
  {
    key: 'financeParams.remark',
    label: '流水备注',
    type: 'textarea',
    placeholder: '默认 "[自动] 定时任务生成"',
  },
]

const emailParamFields: FormField[] = [
  {
    key: 'emailParams.prompt',
    label: '用户原文（prompt）',
    type: 'textarea',
    required: true,
    placeholder: '将作为用户原文发送给 AI',
  },
  {
    key: 'emailParams.recipient',
    label: '收件人邮箱',
    type: 'text',
    required: true,
    placeholder: '多个邮箱以英文逗号分隔',
  },
  {
    key: 'emailParams.subject',
    label: '邮件主题',
    type: 'text',
    placeholder: '可空，默认 "Goalias AI 提醒 yyyy-MM-dd HH:mm"',
  },
]

const taskFormFields = computed<FormField[]>(() => {
  const currentType = taskFormData.value?.taskType as TaskType | undefined
  if (currentType === 'FINANCE') {
    const fields = baseTaskFields.map((f) => ({ ...f }))
    const financeFields = financeParamFields.map((f, idx) => {
      if (idx === 0) {
        return { ...f, options: financeCategoryOptions.value }
      }
      return { ...f }
    })
    return [...fields, ...financeFields]
  }
  if (currentType === 'EMAIL_CHAT') {
    return [...baseTaskFields.map((f) => ({ ...f })), ...emailParamFields.map((f) => ({ ...f }))]
  }
  return baseTaskFields.map((f) => ({ ...f }))
})

// ==================== 任务列表加载 ====================
async function loadTasks() {
  try {
    taskLoading.value = true
    const params: Record<string, any> = {}
    if (taskSearchKeyword.value) params.taskName = taskSearchKeyword.value
    if (taskTypeFilter.value) params.taskType = taskTypeFilter.value
    if (taskStatusFilter.value) params.status = taskStatusFilter.value

    const response = await sysScheduledTaskApi.list(params, {
      pageNum: taskPage.value,
      pageSize: taskPageSize.value,
    })

    if (response.code === 200 && response.data) {
      taskList.value = response.data.list || []
      taskTotal.value = response.data.total || 0
    } else {
      console.error('加载任务失败:', response.message)
      taskList.value = []
      taskTotal.value = 0
    }
  } catch (error) {
    console.error('加载任务出错:', error)
    taskList.value = []
    taskTotal.value = 0
  } finally {
    taskLoading.value = false
  }
}

function handleTaskSearch(keyword: string) {
  taskSearchKeyword.value = keyword
  taskPage.value = 1
  loadTasks()
}

function handleTaskTypeFilterChange() {
  taskPage.value = 1
  loadTasks()
}

function handleTaskStatusFilterChange() {
  taskPage.value = 1
  loadTasks()
}

function handleTaskPageChange(p: number) {
  taskPage.value = p
  loadTasks()
}

function handleTaskPageSizeChange(s: number) {
  taskPageSize.value = s
  taskPage.value = 1
  loadTasks()
}

// ==================== 任务批量删除 ====================
const showTaskBatchToolbar = computed(() => taskSelectedKeys.value.length > 0)

async function handleTaskBatchDelete() {
  const count = taskSelectedKeys.value.length
  if (
    !confirm(`确定要批量删除选中的 ${count} 个任务吗？此操作不可恢复，关联的执行日志不会被删除。`)
  ) {
    return
  }
  try {
    const ids = taskSelectedKeys.value.map((k) => Number(k))
    const response = await sysScheduledTaskApi.remove(ids)
    if (response.code === 200) {
      showSuccess(`成功删除 ${count} 个任务`)
      taskSelectedKeys.value = []
      loadTasks()
    } else {
      showError(`批量删除失败: ${response.message}`)
    }
  } catch (error) {
    console.error('批量删除出错:', error)
    showError('批量删除失败，请稍后重试')
  }
}

function isTaskDeleting(id: number): boolean {
  return taskDeletingIds.value.has(id)
}

function isTaskChanging(id: number): boolean {
  return taskChangingIds.value.has(id)
}

function isTaskRunning(id: number): boolean {
  return taskRunningIds.value.has(id)
}

async function handleTaskDelete(row: SysScheduledTask) {
  if (!confirm(`确定要删除任务 "${row.taskName}" 吗？`)) {
    return
  }
  try {
    taskDeletingIds.value.add(row.id!)
    const response = await sysScheduledTaskApi.remove([row.id!])
    if (response.code === 200) {
      showSuccess('删除成功')
      loadTasks()
    } else {
      showError(`删除失败: ${response.message}`)
    }
  } catch (error) {
    console.error('删除出错:', error)
    showError('删除失败，请稍后重试')
  } finally {
    taskDeletingIds.value.delete(row.id!)
  }
}

// ==================== 启停 ====================
async function handleToggleStatus(row: SysScheduledTask) {
  const next = row.status === '1' ? '0' : '1'
  const action = next === '1' ? '启动' : '暂停'
  if (!confirm(`确定要${action}任务 "${row.taskName}" 吗？`)) return
  try {
    taskChangingIds.value.add(row.id!)
    const response = await sysScheduledTaskApi.changeStatus({ id: row.id!, status: next })
    if (response.code === 200) {
      showSuccess(`${action}成功`)
      await loadTasks()
    } else {
      showError(`${action}失败: ${response.message}`)
    }
  } catch (error) {
    console.error(`${action}出错:`, error)
    showError(`${action}失败，请稍后重试`)
  } finally {
    taskChangingIds.value.delete(row.id!)
  }
}

// ==================== 立即执行 ====================
async function handleRunOnce(row: SysScheduledTask) {
  if (!confirm(`确定要立即执行任务 "${row.taskName}" 吗？`)) return
  try {
    taskRunningIds.value.add(row.id!)
    const response = await sysScheduledTaskApi.runOnce(row.id!)
    if (response.code === 200 && response.data) {
      resultRow.value = row
      resultData.value = response.data
      resultModalVisible.value = true
      loadTasks()
    } else {
      showError(`执行失败: ${response.message}`)
    }
  } catch (error) {
    console.error('立即执行出错:', error)
    showError('立即执行失败，请稍后重试')
  } finally {
    taskRunningIds.value.delete(row.id!)
  }
}

function closeResultModal() {
  resultModalVisible.value = false
  resultData.value = null
  resultRow.value = null
}

// ==================== 加载财务分类 ====================
const financeCategoriesLoaded = ref(false)
/** 正在进行的 loadFinanceCategories Promise，供并发调用 await 复用 */
let financeCategoriesPromise: Promise<void> | null = null
async function loadFinanceCategories() {
  if (financeCategoriesLoaded.value) return
  if (financeCategoriesPromise) return financeCategoriesPromise
  financeCategoriesPromise = (async () => {
    try {
      const res = await financeCategoryApi.list()
      if (res.code === 200 && res.data) {
        financeCategories.value = res.data
        financeCategoriesLoaded.value = true
      }
    } catch (error) {
      console.error('加载财务分类失败:', error)
    } finally {
      financeCategoriesPromise = null
    }
  })()
  return financeCategoriesPromise
}

// ==================== 新增 / 编辑 ====================
function buildDefaultForm() {
  return {
    taskName: '',
    taskType: 'FINANCE' as TaskType,
    cronExpression: '',
    description: '',
    status: '0',
    remark: '',
    financeParams: emptyFinanceParams(),
    emailParams: emptyEmailParams(),
  }
}

async function handleAddTask() {
  taskModalMode.value = 'add'
  taskFormData.value = buildDefaultForm()
  taskFormErrors.value = {}
  cronHint.value = ''
  // 等待财务分类加载完成，确保弹窗打开时下拉 options 已就绪，
  // 避免 select 在 options 为空时被赋值导致回显丢失
  await loadFinanceCategories()
  taskModalVisible.value = true
}

async function handleEditTask(row: SysScheduledTask) {
  taskModalMode.value = 'edit'
  const base = {
    id: row.id,
    taskName: row.taskName,
    taskType: row.taskType,
    cronExpression: row.cronExpression,
    description: row.description || '',
    status: row.status,
    remark: row.remark || '',
    financeParams: emptyFinanceParams(),
    emailParams: emptyEmailParams(),
  }
  if (row.params) {
    try {
      const parsed = JSON.parse(row.params)
      if (row.taskType === 'FINANCE') {
        base.financeParams = {
          categoryId: parsed.categoryId,
          amount: parsed.amount ? Number((Number(parsed.amount) / 100).toFixed(2)) : 0,
          tag: parsed.tag ?? 2,
          remark: parsed.remark ?? '',
        }
      } else if (row.taskType === 'EMAIL_CHAT') {
        base.emailParams = {
          prompt: parsed.prompt || '',
          recipient: parsed.recipient || '',
          subject: parsed.subject || '',
        }
      }
    } catch (e) {
      console.warn('taskParams 解析失败', e)
    }
  }
  // 先加载财务分类再赋值/打开弹窗，
  // 避免 financeParams.categoryId 在 options 未就绪时被 select 吞掉
  if (row.taskType === 'FINANCE') {
    await loadFinanceCategories()
  }
  taskFormData.value = base
  taskFormErrors.value = {}
  cronHint.value = isValidCron(row.cronExpression) ? describeCron(row.cronExpression) : ''
  taskModalVisible.value = true
}

function handleCancelTask() {
  taskModalVisible.value = false
}

watch(
  () => taskFormData.value?.cronExpression,
  (v: string) => {
    cronHint.value = isValidCron(v) ? describeCron(v) : v ? 'cron 表达式非法' : ''
  },
)

watch(
  () => taskFormData.value?.taskType,
  () => {
    if (taskModalMode.value === 'add') {
      taskFormData.value.financeParams = emptyFinanceParams()
      taskFormData.value.emailParams = emptyEmailParams()
    }
    if (taskFormData.value?.taskType === 'FINANCE') {
      loadFinanceCategories()
    }
  },
)

function setNestedValue(obj: any, path: string, value: any) {
  const keys = path.split('.')
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i] as string
    if (cur[k] === undefined) cur[k] = {}
    cur = cur[k]
  }
  cur[keys[keys.length - 1] as string] = value
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}

function validateTaskForm(): boolean {
  const errors: Record<string, string> = {}
  for (const field of taskFormFields.value) {
    const value = getNestedValue(taskFormData.value, field.key)
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.key] = `${field.label}不能为空`
      continue
    }
    if (field.validator && value !== undefined && value !== null && value !== '') {
      const msg = field.validator(value)
      if (msg) errors[field.key] = msg
    }
  }
  if (!isValidCron(taskFormData.value.cronExpression)) {
    errors['cronExpression'] = 'cron 表达式非法'
  }
  taskFormErrors.value = errors
  return Object.keys(errors).length === 0
}

async function handleTaskSubmit() {
  if (!validateTaskForm()) {
    showError('请修正表单中的错误')
    return
  }

  const type = taskFormData.value.taskType as TaskType
  let taskParamsJson = ''
  if (type === 'FINANCE') {
    const fp = taskFormData.value.financeParams
    if (fp.categoryId === undefined || fp.categoryId === null || fp.categoryId === '') {
      taskFormErrors.value['financeParams.categoryId'] = '财务分类不能为空'
      showError('请选择财务分类')
      return
    }
    const amount = fp.amount === '' || fp.amount === undefined ? 0 : Number(fp.amount)
    taskParamsJson = JSON.stringify({
      categoryId: Number(fp.categoryId),
      amount: Math.round(Math.abs(Number(amount)) * 100),
      tag: Number(fp.tag) || 2,
      remark: fp.remark || undefined,
    })
  } else if (type === 'EMAIL_CHAT') {
    const ep = taskFormData.value.emailParams
    if (!ep.prompt || !ep.recipient) {
      showError('prompt 与 recipient 均为必填')
      return
    }
    taskParamsJson = JSON.stringify({
      prompt: ep.prompt,
      recipient: ep.recipient,
      subject: ep.subject || undefined,
    })
  }

  const payload: any = {
    id: taskFormData.value.id,
    taskName: taskFormData.value.taskName,
    taskType: type,
    cronExpression: taskFormData.value.cronExpression,
    description: taskFormData.value.description || undefined,
    status: taskFormData.value.status || '0',
    remark: taskFormData.value.remark || undefined,
    taskParams: taskParamsJson || undefined,
  }

  try {
    taskModalLoading.value = true
    const response =
      taskModalMode.value === 'add'
        ? await sysScheduledTaskApi.add(payload)
        : await sysScheduledTaskApi.edit(payload)
    if (response.code === 200) {
      showSuccess(`${taskModalMode.value === 'add' ? '新增' : '编辑'}成功`)
      taskModalVisible.value = false
      loadTasks()
    } else {
      showError(`操作失败: ${response.message}`)
    }
  } catch (error) {
    console.error('提交出错:', error)
    showError('操作失败，请稍后重试')
  } finally {
    taskModalLoading.value = false
  }
}

// ==================== 日志加载 ====================
async function loadLogs() {
  try {
    logLoading.value = true
    const params: Record<string, any> = {}
    if (logFilters.value.taskId !== '' && logFilters.value.taskId !== undefined) {
      params.taskId = Number(logFilters.value.taskId)
    }
    if (logFilters.value.taskName) params.taskName = logFilters.value.taskName
    if (logFilters.value.taskType) params.taskType = logFilters.value.taskType
    if (logFilters.value.status) params.status = logFilters.value.status
    if (logFilters.value.source) params.source = logFilters.value.source
    if (logFilters.value.beginTime) params.beginTime = logFilters.value.beginTime
    if (logFilters.value.endTime) params.endTime = logFilters.value.endTime

    const response = await sysScheduledTaskLogApi.list(params, {
      pageNum: logPage.value,
      pageSize: logPageSize.value,
    })
    if (response.code === 200 && response.data) {
      logList.value = response.data.list || []
      logTotal.value = response.data.total || 0
    } else {
      console.error('加载日志失败:', response.message)
      logList.value = []
      logTotal.value = 0
    }
  } catch (error) {
    console.error('加载日志出错:', error)
    logList.value = []
    logTotal.value = 0
  } finally {
    logLoading.value = false
  }
}

function handleLogSearch() {
  logPage.value = 1
  loadLogs()
}

function handleLogReset() {
  logFilters.value = {
    taskId: '',
    taskName: '',
    taskType: '',
    status: '',
    source: '',
    beginTime: '',
    endTime: '',
  }
  logPage.value = 1
  loadLogs()
}

function handleLogPageChange(p: number) {
  logPage.value = p
  loadLogs()
}

function handleLogPageSizeChange(s: number) {
  logPageSize.value = s
  logPage.value = 1
  loadLogs()
}

const showLogBatchToolbar = computed(() => logSelectedKeys.value.length > 0)

async function handleLogBatchDelete() {
  const count = logSelectedKeys.value.length
  if (!confirm(`确定要批量删除选中的 ${count} 条日志吗？此操作不可恢复。`)) {
    return
  }
  try {
    const ids = logSelectedKeys.value.map((k) => Number(k))
    const response = await sysScheduledTaskLogApi.remove(ids)
    if (response.code === 200) {
      showSuccess(`成功删除 ${count} 条日志`)
      logSelectedKeys.value = []
      loadLogs()
    } else {
      showError(`批量删除失败: ${response.message}`)
    }
  } catch (error) {
    console.error('批量删除日志出错:', error)
    showError('批量删除失败，请稍后重试')
  }
}

async function handleLogClean() {
  if (!confirm('确定要清空所有任务执行日志吗？此操作不可恢复。')) return
  try {
    const response = await sysScheduledTaskLogApi.clean()
    if (response.code === 200) {
      showSuccess('日志已清空')
      logSelectedKeys.value = []
      loadLogs()
    } else {
      showError(`清空失败: ${response.message}`)
    }
  } catch (error) {
    console.error('清空日志出错:', error)
    showError('清空失败，请稍后重试')
  }
}

function isLogDeleting(id: number): boolean {
  return logDeletingIds.value.has(id)
}

async function handleLogDelete(row: SysScheduledTaskLog) {
  if (!confirm(`确定要删除日志 #${row.id} 吗？`)) return
  try {
    logDeletingIds.value.add(row.id!)
    const response = await sysScheduledTaskLogApi.remove([row.id!])
    if (response.code === 200) {
      showSuccess('删除成功')
      loadLogs()
    } else {
      showError(`删除失败: ${response.message}`)
    }
  } catch (error) {
    console.error('删除日志出错:', error)
    showError('删除失败，请稍后重试')
  } finally {
    logDeletingIds.value.delete(row.id!)
  }
}

// ==================== 键盘快捷键 ====================
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (resultModalVisible.value) {
      closeResultModal()
      return
    }
    if (taskModalVisible.value && !taskModalLoading.value) {
      handleCancelTask()
      return
    }
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    if (taskModalVisible.value && !taskModalLoading.value) {
      const target = e.target as HTMLElement
      if (target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        handleTaskSubmit()
      }
    }
  }
}

// ==================== 初始化 ====================
// Tab 懒加载：首次进入对应 tab 时才拉取该 tab 的列表
watch(activeTab, (tab) => {
  if (loadedTabs.value.has(tab)) return
  loadedTabs.value.add(tab)
  if (tab === 'task') {
    loadTasks()
  } else if (tab === 'log') {
    loadLogs()
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)

  // 进入页面时若默认 tab 仍为 'task'，先做一次首次加载
  if (activeTab.value === 'task') {
    loadedTabs.value.add('task')
    loadTasks()
  } else if (activeTab.value === 'log') {
    loadedTabs.value.add('log')
    loadLogs()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="scheduled-task-module">
    <!-- 顶部 Tab 切换 -->
    <div class="tab-bar clay-card mb-4">
      <button class="tab-btn" :class="{ active: activeTab === 'task' }" @click="activeTab = 'task'">
        <AppIcon icon="mdi:clipboard-list-outline" class="mr-2" />
        任务列表
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'log' }" @click="activeTab = 'log'">
        <AppIcon icon="mdi:history" class="mr-2" />
        执行日志
      </button>
    </div>

    <!-- 任务列表 Tab -->
    <div v-show="activeTab === 'task'">
      <!-- 筛选区 -->
      <div class="filter-bar clay-card mb-4">
        <div class="filter-item filter-search">
          <label class="filter-label">任务名</label>
          <SearchBar
            :model-value="taskSearchKeyword"
            placeholder="搜索任务名称"
            @search="handleTaskSearch"
          />
        </div>
        <div class="filter-item">
          <label class="filter-label">类型</label>
          <select v-model="taskTypeFilter" class="clay-select" @change="handleTaskTypeFilterChange">
            <option value="">全部</option>
            <option v-for="opt in TASK_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">状态</label>
          <select
            v-model="taskStatusFilter"
            class="clay-select"
            @change="handleTaskStatusFilterChange"
          >
            <option value="">全部</option>
            <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="mb-4 flex justify-between items-center">
        <button @click="handleAddTask" class="clay-btn">
          <AppIcon icon="mdi:plus" class="mr-2" />
          新增任务
        </button>

        <div v-if="showTaskBatchToolbar" class="batch-toolbar">
          <span class="batch-info">已选中 {{ taskSelectedKeys.length }} 项</span>
          <button @click="handleTaskBatchDelete" class="batch-delete-btn">
            <AppIcon icon="mdi:delete-outline" class="mr-1" />
            批量删除
          </button>
        </div>
      </div>

      <!-- 数据表格 -->
      <DataTable
        :columns="taskColumns"
        :data="taskList"
        :loading="taskLoading"
        :selectable="true"
        v-model:selected-keys="taskSelectedKeys"
        row-key="id"
      >
        <template #actions="{ row }">
          <button
            v-if="row.status === '1'"
            class="action-btn pause-btn"
            :disabled="isTaskChanging(row.id) || isTaskRunning(row.id)"
            @click="handleToggleStatus(row)"
          >
            <AppIcon icon="mdi:pause-circle-outline" />
            暂停
          </button>
          <button
            v-else
            class="action-btn play-btn"
            :disabled="isTaskChanging(row.id) || isTaskRunning(row.id)"
            @click="handleToggleStatus(row)"
          >
            <AppIcon icon="mdi:play-circle-outline" />
            启动
          </button>
          <button
            class="action-btn run-btn"
            :disabled="isTaskRunning(row.id) || isTaskChanging(row.id)"
            @click="handleRunOnce(row)"
          >
            <AppIcon v-if="!isTaskRunning(row.id)" icon="mdi:flash" />
            <AppIcon v-else icon="mdi:loading" class="animate-spin" />
            {{ isTaskRunning(row.id) ? '执行中' : '立即执行' }}
          </button>
          <button
            class="action-btn edit-btn"
            :disabled="isTaskDeleting(row.id) || isTaskRunning(row.id)"
            @click="handleEditTask(row)"
          >
            <AppIcon icon="mdi:pencil" />
            编辑
          </button>
          <button
            class="action-btn delete-btn"
            :class="{ loading: isTaskDeleting(row.id) }"
            :disabled="isTaskDeleting(row.id) || isTaskRunning(row.id)"
            @click="handleTaskDelete(row)"
          >
            <AppIcon v-if="!isTaskDeleting(row.id)" icon="mdi:delete" />
            <AppIcon v-else icon="mdi:loading" class="animate-spin" />
            {{ isTaskDeleting(row.id) ? '删除中' : '删除' }}
          </button>
        </template>
      </DataTable>

      <!-- 分页 -->
      <div class="mt-4">
        <Pagination
          :page="taskPage"
          :page-size="taskPageSize"
          :total="taskTotal"
          @update:page="handleTaskPageChange"
          @update:page-size="handleTaskPageSizeChange"
        />
      </div>
    </div>

    <!-- 执行日志 Tab -->
    <div v-show="activeTab === 'log'">
      <!-- 筛选区 -->
      <div class="log-filter clay-card mb-4">
        <div class="filter-row">
          <div class="filter-item">
            <label class="filter-label">任务ID</label>
            <input
              v-model.number="logFilters.taskId"
              type="number"
              class="clay-input"
              placeholder="可选"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">任务名</label>
            <input
              v-model="logFilters.taskName"
              type="text"
              class="clay-input"
              placeholder="可选"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">类型</label>
            <select v-model="logFilters.taskType" class="clay-select">
              <option value="">全部</option>
              <option v-for="opt in TASK_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="filter-item">
            <label class="filter-label">状态</label>
            <select v-model="logFilters.status" class="clay-select">
              <option value="">全部</option>
              <option v-for="opt in LOG_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="filter-item">
            <label class="filter-label">来源</label>
            <select v-model="logFilters.source" class="clay-select">
              <option value="">全部</option>
              <option v-for="opt in SOURCE_OPTIONS" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-item">
            <label class="filter-label">开始时间起</label>
            <input v-model="logFilters.beginTime" type="datetime-local" class="clay-input" />
          </div>
          <div class="filter-item">
            <label class="filter-label">开始时间止</label>
            <input v-model="logFilters.endTime" type="datetime-local" class="clay-input" />
          </div>
          <div class="filter-actions">
            <button class="clay-btn-secondary" @click="handleLogReset">
              <AppIcon icon="mdi:refresh" class="mr-1" />
              重置
            </button>
            <button class="clay-btn" @click="handleLogSearch">
              <AppIcon icon="mdi:magnify" class="mr-1" />
              查询
            </button>
          </div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="mb-4 flex justify-between items-center">
        <button @click="handleLogClean" class="clay-btn-danger">
          <AppIcon icon="mdi:broom" class="mr-2" />
          一键清空
        </button>

        <div v-if="showLogBatchToolbar" class="batch-toolbar">
          <span class="batch-info">已选中 {{ logSelectedKeys.length }} 项</span>
          <button @click="handleLogBatchDelete" class="batch-delete-btn">
            <AppIcon icon="mdi:delete-outline" class="mr-1" />
            批量删除
          </button>
        </div>
      </div>

      <!-- 数据表格 -->
      <DataTable
        :columns="logColumns"
        :data="logList"
        :loading="logLoading"
        :selectable="true"
        v-model:selected-keys="logSelectedKeys"
        row-key="id"
      >
        <template #actions="{ row }">
          <button
            class="action-btn delete-btn"
            :class="{ loading: isLogDeleting(row.id) }"
            :disabled="isLogDeleting(row.id)"
            @click="handleLogDelete(row)"
          >
            <AppIcon v-if="!isLogDeleting(row.id)" icon="mdi:delete" />
            <AppIcon v-else icon="mdi:loading" class="animate-spin" />
            {{ isLogDeleting(row.id) ? '删除中' : '删除' }}
          </button>
        </template>
      </DataTable>

      <!-- 分页 -->
      <div class="mt-4">
        <Pagination
          :page="logPage"
          :page-size="logPageSize"
          :total="logTotal"
          @update:page="handleLogPageChange"
          @update:page-size="handleLogPageSizeChange"
        />
      </div>
    </div>

    <!-- 任务新增/编辑弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="taskModalVisible"
          class="modal-overlay"
        >
          <div class="modal-container clay-card">
            <div class="modal-header">
              <h3 class="modal-title">
                {{ taskModalMode === 'add' ? '新增定时任务' : '编辑定时任务' }}
              </h3>
              <button
                type="button"
                :disabled="taskModalLoading"
                class="close-btn"
                @click="handleCancelTask"
              >
                <AppIcon icon="mdi:close" :size="20" />
              </button>
            </div>

            <form class="modal-body" @submit.prevent="handleTaskSubmit">
              <div v-for="field in taskFormFields" :key="field.key" class="form-field">
                <label class="form-label" :class="{ required: field.required }">
                  {{ field.label }}
                </label>

                <input
                  v-if="field.type === 'text'"
                  :value="getNestedValue(taskFormData, field.key)"
                  @input="
                    setNestedValue(
                      taskFormData,
                      field.key,
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                  type="text"
                  :placeholder="field.placeholder"
                  :class="['clay-input', { error: taskFormErrors[field.key] }]"
                />

                <input
                  v-else-if="field.type === 'number'"
                  :value="getNestedValue(taskFormData, field.key)"
                  @input="
                    setNestedValue(
                      taskFormData,
                      field.key,
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                  type="number"
                  :placeholder="field.placeholder"
                  :class="['clay-input', { error: taskFormErrors[field.key] }]"
                />

                <textarea
                  v-else-if="field.type === 'textarea'"
                  :value="getNestedValue(taskFormData, field.key)"
                  @input="
                    setNestedValue(
                      taskFormData,
                      field.key,
                      ($event.target as HTMLTextAreaElement).value,
                    )
                  "
                  :placeholder="field.placeholder"
                  :class="['clay-input', { error: taskFormErrors[field.key] }]"
                  rows="4"
                />

                <select
                  v-else-if="field.type === 'select'"
                  :key="field.key + '-' + (field.options?.length ?? 0)"
                  :value="getNestedValue(taskFormData, field.key)"
                  @change="
                    setNestedValue(
                      taskFormData,
                      field.key,
                      ($event.target as HTMLSelectElement).value,
                    )
                  "
                  :class="['clay-select', { error: taskFormErrors[field.key] }]"
                >
                  <option v-for="opt in field.options" :key="String(opt.value)" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>

                <span v-if="field.key === 'cronExpression' && cronHint" class="cron-hint">
                  <AppIcon icon="mdi:information-outline" :size="14" class="mr-1" />
                  {{ cronHint }}
                </span>

                <span v-if="taskFormErrors[field.key]" class="error-message">
                  {{ taskFormErrors[field.key] }}
                </span>
              </div>
            </form>

            <div class="modal-footer">
              <button
                type="button"
                :disabled="taskModalLoading"
                class="clay-btn-secondary"
                @click="handleCancelTask"
              >
                取消
              </button>
              <button
                type="button"
                :disabled="taskModalLoading"
                class="clay-btn"
                @click="handleTaskSubmit"
              >
                <span v-if="taskModalLoading">提交中...</span>
                <span v-else>{{ taskModalMode === 'add' ? '新增' : '保存' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 立即执行结果弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="resultModalVisible" class="modal-overlay">
          <div class="modal-container result-modal clay-card">
            <div class="modal-header">
              <h3 class="modal-title">执行结果 - {{ resultRow?.taskName }}</h3>
              <button type="button" class="close-btn" @click="closeResultModal">
                <AppIcon icon="mdi:close" :size="20" />
              </button>
            </div>
            <div class="modal-body">
              <div class="result-status-row">
                <span
                  class="status-badge"
                  :class="resultData?.success ? 'status-success' : 'status-fail'"
                >
                  <AppIcon
                    :icon="resultData?.success ? 'mdi:check-circle' : 'mdi:close-circle'"
                    :size="16"
                    class="mr-1"
                  />
                  {{ resultData?.success ? '执行成功' : '执行失败' }}
                </span>
                <span class="duration-label">
                  耗时
                  <span class="duration-value">{{ formatDuration(resultData?.durationMs) }}</span>
                </span>
              </div>
              <div class="result-grid">
                <div class="result-item">
                  <span class="result-key">开始时间</span>
                  <span class="result-val">{{ resultData?.startTime || '-' }}</span>
                </div>
                <div class="result-item">
                  <span class="result-key">结束时间</span>
                  <span class="result-val">{{ resultData?.endTime || '-' }}</span>
                </div>
              </div>
              <div v-if="resultData?.errorMessage" class="result-message-block error">
                <div class="result-key">错误信息</div>
                <pre class="result-pre">{{ resultData.errorMessage }}</pre>
              </div>
              <div v-if="resultData?.message" class="result-message-block">
                <div class="result-key">附加信息</div>
                <pre class="result-pre">{{ resultData.message }}</pre>
              </div>
            </div>
            <div class="modal-footer">
              <button class="clay-btn" @click="closeResultModal">关闭</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.scheduled-task-module {
  padding: 1.5rem;
}

/* ==================== Tab 切换 ==================== */
.tab-bar {
  display: inline-flex;
  padding: 0.5rem;
  gap: 0.5rem;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-clay-sm);
  cursor: pointer;
  background: transparent;
  color: var(--clay-text-secondary);
  transition: all var(--duration-normal) var(--ease-out);
}

.tab-btn:hover {
  color: var(--clay-text-primary);
  background: rgba(66, 150, 237, 0.05);
}

.tab-btn.active {
  background: var(--clay-primary);
  color: var(--clay-text-inverse);
  box-shadow: var(--shadow-clay-button);
}

/* ==================== 筛选区 ==================== */
.filter-bar,
.log-filter {
  padding: 1rem 1.25rem;
}

.filter-bar {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.log-filter {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  min-width: 180px;
}

.filter-search {
  flex: 1;
  min-width: 260px;
}

.filter-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--clay-text-secondary);
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-left: auto;
}

/* ==================== 输入控件 ==================== */
.clay-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: var(--clay-text-primary);
  background: var(--clay-bg-base);
  border: 1px solid transparent;
  border-radius: var(--radius-clay-sm);
  transition: all var(--duration-normal) var(--ease-out);
  font-family: inherit;
}

.clay-input:focus {
  outline: none;
  border-color: var(--clay-primary);
  background: var(--clay-bg-elevated);
}

.clay-input.error {
  border-color: #ef4444;
}

.clay-select {
  width: 100%;
  padding: 0.625rem 2.25rem 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: var(--clay-text-primary);
  background: var(--clay-bg-base);
  border: 1px solid transparent;
  border-radius: var(--radius-clay-sm);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%234296ed' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.25rem;
  transition: all var(--duration-normal) var(--ease-out);
  font-family: inherit;
}

.clay-select:focus {
  outline: none;
  border-color: var(--clay-primary);
  background-color: var(--clay-bg-elevated);
}

.clay-select.error {
  border-color: #ef4444;
}

.cron-hint {
  display: inline-flex;
  align-items: center;
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: var(--clay-primary);
}

/* ==================== 按钮 ==================== */
.clay-btn,
.clay-btn-secondary,
.clay-btn-danger {
  display: inline-flex;
  align-items: center;
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-clay-sm);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  font-family: inherit;
}

.clay-btn {
  background: var(--clay-primary);
  color: var(--clay-text-inverse);
  box-shadow: var(--shadow-clay-button);
}

.clay-btn:hover:not(:disabled) {
  background: var(--clay-primary-dark);
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.clay-btn:active:not(:disabled) {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(1px);
}

.clay-btn-secondary {
  background: var(--clay-bg-base);
  color: var(--clay-text-primary);
  box-shadow: var(--shadow-clay-button);
}

.clay-btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.clay-btn-secondary:active:not(:disabled) {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(1px);
}

.clay-btn-danger {
  background: #ef4444;
  color: white;
  box-shadow: var(--shadow-clay-button);
}

.clay-btn-danger:hover:not(:disabled) {
  background: #dc2626;
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.clay-btn-danger:active:not(:disabled) {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(1px);
}

.clay-btn:disabled,
.clay-btn-secondary:disabled,
.clay-btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* ==================== 表格内操作按钮 ==================== */
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
  margin-right: 0.375rem;
  font-family: inherit;
}

.action-btn:last-child {
  margin-right: 0;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.play-btn {
  background: #10b981;
  color: white;
  box-shadow: var(--shadow-clay-button);
}

.play-btn:hover:not(:disabled) {
  background: #059669;
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.pause-btn {
  background: #f59e0b;
  color: white;
  box-shadow: var(--shadow-clay-button);
}

.pause-btn:hover:not(:disabled) {
  background: #d97706;
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.run-btn {
  background: #8b5cf6;
  color: white;
  box-shadow: var(--shadow-clay-button);
}

.run-btn:hover:not(:disabled) {
  background: #7c3aed;
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.edit-btn {
  background: var(--clay-primary);
  color: var(--clay-text-inverse);
  box-shadow: var(--shadow-clay-button);
}

.edit-btn:hover:not(:disabled) {
  background: var(--clay-primary-dark);
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.delete-btn {
  background: #ef4444;
  color: white;
  box-shadow: var(--shadow-clay-button);
}

.delete-btn:hover:not(:disabled) {
  background: #dc2626;
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.action-btn.loading {
  position: relative;
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

/* ==================== 批量操作 ==================== */
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
  background: #ef4444;
  color: white;
  box-shadow: var(--shadow-clay-button);
  font-family: inherit;
}

.batch-delete-btn:hover {
  background: #dc2626;
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

/* ==================== 弹窗 ==================== */
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
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--clay-bg-elevated);
  border-radius: var(--radius-clay-md);
  box-shadow: var(--shadow-clay-card);
  overflow: hidden;
}

.result-modal {
  max-width: 560px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--clay-text-primary);
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  color: var(--clay-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-clay-sm);
  transition: all var(--duration-normal) var(--ease-out);
}

.close-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
  color: var(--clay-text-primary);
  transform: rotate(90deg);
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  min-height: 0;
}

.form-field {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
}

.form-field:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--clay-text-primary);
  margin-bottom: 0.375rem;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.error-message {
  display: block;
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
}

textarea.clay-input {
  resize: vertical;
  min-height: 90px;
  font-family: inherit;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

/* ==================== 结果弹窗内部 ==================== */
.result-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius-clay-full);
}

.status-success {
  color: #047857;
  background: rgba(172, 255, 230, 0.6);
}

.status-fail {
  color: #b91c1c;
  background: rgba(254, 202, 202, 0.6);
}

.duration-label {
  font-size: 0.875rem;
  color: var(--clay-text-secondary);
}

.duration-value {
  margin-left: 0.375rem;
  font-weight: 600;
  color: var(--clay-text-primary);
  font-family: 'Consolas', 'Monaco', monospace;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--clay-bg-base);
  border-radius: var(--radius-clay-sm);
}

.result-key {
  font-size: 0.75rem;
  color: var(--clay-text-secondary);
  font-weight: 500;
}

.result-val {
  font-size: 0.8125rem;
  color: var(--clay-text-primary);
  word-break: break-all;
}

.result-message-block {
  padding: 0.75rem;
  background: var(--clay-bg-base);
  border-radius: var(--radius-clay-sm);
  margin-bottom: 0.75rem;
}

.result-message-block.error {
  background: rgba(254, 202, 202, 0.3);
}

.result-pre {
  margin: 0.375rem 0 0 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.8125rem;
  color: var(--clay-text-primary);
  font-family: 'Consolas', 'Monaco', monospace;
}

/* ==================== 弹窗动画 ==================== */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.96) translateY(10px);
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .scheduled-task-module {
    padding: 1rem;
  }

  .filter-bar,
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    min-width: 0;
  }

  .filter-actions {
    margin-left: 0;
    justify-content: flex-end;
  }

  .modal-overlay {
    padding: 0;
    align-items: stretch;
  }

  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    max-height: 100dvh;
    height: 100vh;
    height: 100dvh;
    border-radius: 0;
  }

  .modal-footer {
    padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
  }

  .result-grid {
    grid-template-columns: 1fr;
  }
}
</style>

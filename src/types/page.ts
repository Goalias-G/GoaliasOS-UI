/**
 * 页面状态类型定义
 *
 * 功能说明：
 * - 定义页面组件的状态和数据类型
 * - 包含表单数据、验证错误、加载状态等
 */

/**
 * 登录表单数据
 */
export interface LoginFormData {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
}

/**
 * 注册表单数据
 */
export interface RegisterFormData {
  /** 用户名 */
  username: string
  /** 邮箱 */
  email: string
  /** 密码 */
  password: string
  /** 确认密码 */
  confirmPassword: string
}

/**
 * 表单验证错误
 */
export interface FormErrors {
  /** 字段名到错误信息的映射 */
  [key: string]: string | undefined
}

/**
 * 加载状态
 */
export interface LoadingState {
  /** 是否正在加载 */
  isLoading: boolean
  /** 加载提示信息 */
  message?: string
}

/**
 * 表单验证规则
 */
export interface ValidationRule {
  /** 验证函数 */
  validator: (value: string) => boolean
  /** 错误信息 */
  message: string
}

/**
 * 页面状态
 */
export interface PageState {
  /** 是否正在加载 */
  loading: boolean
  /** 错误信息 */
  error: string | null
  /** 成功信息 */
  success: string | null
}

/**
 * 分页配置
 */
export interface PaginationConfig {
  /** 当前页码 */
  currentPage: number
  /** 每页条数 */
  pageSize: number
  /** 总条数 */
  total: number
}

/**
 * 排序配置
 */
export interface SortConfig {
  /** 排序字段 */
  field: string
  /** 排序方向 */
  order: 'asc' | 'desc'
}

/**
 * 筛选配置
 */
export interface FilterConfig {
  /** 筛选字段 */
  field: string
  /** 筛选值 */
  value: any
  /** 筛选操作符 */
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in'
}

/**
 * 列表查询参数
 */
export interface ListQueryParams {
  /** 分页配置 */
  pagination?: PaginationConfig
  /** 排序配置 */
  sort?: SortConfig
  /** 筛选配置 */
  filters?: FilterConfig[]
  /** 搜索关键词 */
  search?: string
}

/**
 * 模态框状态
 */
export interface ModalState {
  /** 是否显示 */
  visible: boolean
  /** 模态框标题 */
  title?: string
  /** 模态框数据 */
  data?: any
}

/**
 * 通知消息
 */
export interface NotificationMessage {
  /** 消息 ID */
  id: string
  /** 消息类型 */
  type: 'success' | 'warning' | 'error' | 'info'
  /** 消息标题 */
  title?: string
  /** 消息内容 */
  message: string
  /** 持续时间（毫秒），0 表示不自动关闭 */
  duration?: number
  /** 是否可关闭 */
  closable?: boolean
}

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  /** 显示文本 */
  label: string
  /** 路由路径 */
  path?: string
  /** 是否为当前页 */
  active?: boolean
}

/**
 * 标签页项
 */
export interface TabItem {
  /** 标签页 ID */
  id: string
  /** 显示文本 */
  label: string
  /** 图标 */
  icon?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 徽章数量 */
  badge?: number
}

/**
 * 菜单项
 */
export interface MenuItem {
  /** 菜单项 ID */
  id: string
  /** 显示文本 */
  label: string
  /** 图标 */
  icon?: string
  /** 路由路径 */
  path?: string
  /** 子菜单 */
  children?: MenuItem[]
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示 */
  visible?: boolean
}

/**
 * 用户配置
 */
export interface UserPreferences {
  /** 主题 */
  theme: 'light' | 'dark'
  /** 语言 */
  language: string
  /** 是否启用动画 */
  enableAnimations: boolean
  /** 侧边栏是否折叠 */
  sidebarCollapsed: boolean
}

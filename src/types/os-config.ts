/**
 * OS 配置管理类型定义
 *
 * 功能说明：
 * - 定义 OS 配置管理模块的通用类型
 * - 包括表格、分页、搜索、模态框、表单等类型
 */

/**
 * 表格列配置
 */
export interface TableColumn {
  /** 列的唯一标识 */
  key: string
  /** 列的显示标签 */
  label: string
  /** 列宽度 */
  width?: string
  /** 是否支持排序 */
  sortable?: boolean
  /** 自定义格式化函数 */
  formatter?: (value: any, row: any) => string
}

/**
 * 分页状态
 */
export interface PaginationState {
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 总记录数 */
  total: number
}

/**
 * 搜索参数
 */
export interface SearchParams {
  /** 搜索关键词 */
  keyword: string
  /** 其他搜索参数 */
  [key: string]: any
}

/**
 * 表单模态框状态
 */
export interface FormModalState {
  /** 是否显示 */
  visible: boolean
  /** 模式: 新增或编辑 */
  mode: 'add' | 'edit'
  /** 表单数据 */
  data: any | null
}

/**
 * 表单字段配置
 */
export interface FormField {
  /** 字段的唯一标识 */
  key: string
  /** 字段的显示标签 */
  label: string
  /** 字段类型 */
  type: 'text' | 'textarea' | 'number' | 'select'
  /** 是否必填 */
  required?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 下拉选项 (用于 select 类型) */
  options?: { label: string; value: any }[]
  /** 自定义验证器,返回错误信息或 null */
  validator?: (value: any) => string | null
}

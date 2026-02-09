/**
 * 路由类型定义
 */

/** 路由元信息类型 */
export interface AppRouteMeta {
  /** 页面标题 */
  title?: string
  /** 导航图标（Iconify 图标名） */
  icon?: string
  /** 是否在导航中隐藏 */
  hidden?: boolean
  /** 是否缓存页面 */
  keepAlive?: boolean
  /** 允许访问的角色 */
  roles?: string[]
  /** 模块名称（用于分组） */
  module?: string
  /** 索引签名，兼容 Vue Router 类型 */
  [key: string]: unknown
  [key: symbol]: unknown
}

/**
 * 路由配置表
 *
 * 功能说明：
 * - 自动聚合各模块路由
 * - 支持路由元信息（标题、权限、图标等）
 * - 支持路由懒加载
 * - 支持嵌套路由
 * - 模块化管理，便于扩展
 */

import type { RouteRecordRaw } from 'vue-router'

// 导出类型定义
export type { AppRouteMeta } from './types'

// 导入各模块路由
import { authRoutes } from '@/views/auth/routes'
import { errorRoutes } from '@/views/error/routes'
import { homeRoutes } from '@/views/home/routes'
import { demoRoutes } from '@/views/demo/routes'
import { styleTestRoutes } from '@/views/styleTest/routes'


/**
 * 主布局下的路由
 * 自动聚合各功能模块的路由
 */
export const mainRoutes: RouteRecordRaw[] = [
  ...homeRoutes,
  ...demoRoutes,
  ...styleTestRoutes,
  // 在这里添加新的模块路由
]

/**
 * 认证相关路由（独立布局）
 */
export { authRoutes }

/**
 * 错误页面路由
 */
export { errorRoutes }

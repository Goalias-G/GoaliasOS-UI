/**
 * 路由配置表
 *
 * 功能说明：
 * - 定义应用所有路由
 * - 支持路由元信息（标题、权限、图标等）
 * - 支持路由懒加载
 * - 支持嵌套路由
 */

import type { RouteRecordRaw } from 'vue-router'

/** 路由元信息类型 */
export interface AppRouteMeta {
  /** 页面标题 */
  title?: string
  /** 是否需要登录 */
  requiresAuth?: boolean
  /** 导航图标（Iconify 图标名） */
  icon?: string
  /** 是否在导航中隐藏 */
  hidden?: boolean
  /** 是否缓存页面 */
  keepAlive?: boolean
  /** 允许访问的角色 */
  roles?: string[]
  /** 索引签名，兼容 Vue Router 类型 */
  [key: string]: unknown
  [key: symbol]: unknown
}

/** 主布局下的路由 */
export const mainRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: '首页',
      icon: 'mdi:home',
      requiresAuth: true,
    } as AppRouteMeta,
  },
  {
    path: 'demo',
    name: 'Demo',
    component: () => import('@/views/DemoView.vue'),
    meta: {
      title: 'Demo演示',
      icon: 'mdi:palette',
      requiresAuth: true,
    } as AppRouteMeta,
  },
  {
    path: 'about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      title: '关于',
      icon: 'mdi:information-outline',
      requiresAuth: true,
    } as AppRouteMeta,
  },
]

/** 认证相关路由（独立布局） */
export const authRoutes: RouteRecordRaw[] = [
  {
    path: 'login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
    } as AppRouteMeta,
  },
]

/** 错误页面路由 */
export const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '页面不存在',
      hidden: true,
    } as AppRouteMeta,
  },
]

/**
 * 路由实例和守卫
 *
 * 功能说明：
 * - 创建路由实例
 * - 配置路由守卫（认证检查、页面标题）
 * - 处理路由跳转逻辑
 */

import { createRouter, createWebHistory } from 'vue-router'
import { mainRoutes, authRoutes, errorRoutes, type AppRouteMeta } from './routes'
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 主布局路由（需要导航栏）
    {
      path: '/',
      component: MainLayout,
      children: mainRoutes,
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: authRoutes,
    },
    // 登录页直接访问（兼容 /login 路径）
    {
      path: '/login',
      redirect: '/auth/login',
    },
    // 错误页面
    ...errorRoutes,
  ],
  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

// ==================== 路由守卫 ====================

// 前置守卫
router.beforeEach((to, from, next) => {
  // 获取路由元信息
  const meta = to.meta as AppRouteMeta

  // 设置页面标题
  const title = meta?.title
  document.title = title
    ? `${title} - ${import.meta.env.VITE_APP_TITLE}`
    : import.meta.env.VITE_APP_TITLE

  // 认证检查
  const token = localStorage.getItem('token')
  const isAuthPage = to.path.startsWith('/auth') || to.path === '/login'
  const isErrorPage = to.path.startsWith('/404') || to.name === 'NotFound'

  // 如果是错误页面，直接放行
  if (isErrorPage) {
    next()
    return
  }

  // 如果未登录且不是认证页面，跳转到登录页
  if (!token && !isAuthPage) {
    next({ path: '/auth/login', query: { redirect: to.fullPath } })
    return
  }

  // 如果已登录且访问认证页面，跳转到首页
  if (token && isAuthPage) {
    next({ path: '/' })
    return
  }

  // 其他情况正常放行
  next()
})

export default router

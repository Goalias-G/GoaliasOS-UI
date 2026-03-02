/**
 * AI 对话模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import type { AppRouteMeta } from '@/router/types'

export const aiRoutes: RouteRecordRaw[] = [
  {
    path: 'ai',
    name: 'AI',
    component: () => import('./index.vue'),
    meta: {
      title: 'OS AI',
      icon: 'hugeicons:artificial-intelligence-01',
      hidden: false,
      requiresAdmin: false, // 管理员权限配置
      module: 'ai',
    } as AppRouteMeta,
  },
]

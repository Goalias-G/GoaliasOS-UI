/**
 * 错误页面模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import type { AppRouteMeta } from '@/router/types'

export const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./NotFoundView.vue'),
    meta: {
      title: '页面不存在',
      module: 'error',
    } as AppRouteMeta,
  },
]

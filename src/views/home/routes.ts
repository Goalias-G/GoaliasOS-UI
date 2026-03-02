/**
 * 首页模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import type { AppRouteMeta } from '@/router/types'

export const homeRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'Home',
    component: () => import('./index.vue'),
    meta: {
      title: '首页',
      icon: 'hugeicons:home-11',
      module: 'home',
    } as AppRouteMeta,
  },
]

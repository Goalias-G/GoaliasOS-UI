/**
 * 样式测试模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import type { AppRouteMeta } from '@/router/types'

export const styleTestRoutes: RouteRecordRaw[] = [
  {
    path: 'clay-demo',
    name: 'ClayDemo',
    component: () => import('./ClayDemoView.vue'),
    meta: {
      title: 'Clay 风格演示',
      icon: 'hugeicons:tailwindcss',
      module: 'styleTest',
    } as AppRouteMeta,
  },
  {
    path: 'style-test',
    name: 'StyleTest',
    component: () => import('./StyleTestView.vue'),
    meta: {
      title: '样式测试',
      module: 'styleTest',
      hidden: true,
    } as AppRouteMeta,
  },
  {
    path: 'tailwind-test',
    name: 'TailwindTest',
    component: () => import('./TailwindTest.vue'),
    meta: {
      title: 'Tailwind 配置测试',
      module: 'styleTest',
      hidden: true, // 在导航中隐藏
    } as AppRouteMeta,
  },
]

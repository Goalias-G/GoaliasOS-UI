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
            title: 'Clay 工具类演示',
            icon: 'mdi:palette-advanced',
            module: 'styleTest',
        } as AppRouteMeta,
    },
    {
        path: 'style-test',
        name: 'StyleTest',
        component: () => import('./StyleTestView.vue'),
        meta: {
            title: '样式测试',
            icon: 'mdi:palette-swatch',
            module: 'styleTest',
            hidden: true, // 在导航中隐藏
        } as AppRouteMeta,
    },
    {
        path: 'tailwind-test',
        name: 'TailwindTest',
        component: () => import('./TailwindTest.vue'),
        meta: {
            title: 'Tailwind 配置测试',
            icon: 'mdi:tailwind',
            module: 'styleTest',
            hidden: true, // 在导航中隐藏
        } as AppRouteMeta,
    },
]

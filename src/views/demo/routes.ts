/**
 * 演示模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import type { AppRouteMeta } from '@/router/types'

export const demoRoutes: RouteRecordRaw[] = [
    {
        path: 'demo',
        name: 'Demo',
        component: () => import('./index.vue'),
        meta: {
            title: 'Demo演示',
            icon: 'mdi:palette',
            module: 'demo',
        } as AppRouteMeta,
    },
]

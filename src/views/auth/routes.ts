/**
 * 认证模块路由
 */
import type { RouteRecordRaw } from 'vue-router'
import type { AppRouteMeta } from '@/router/types'

export const authRoutes: RouteRecordRaw[] = [
    {
        path: 'login',
        name: 'Login',
        component: () => import('./LoginView.vue'),
        meta: {
            title: '登录',
            module: 'auth',
        } as AppRouteMeta,
    },
]

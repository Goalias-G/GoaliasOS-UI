/**
 * 路由配置表
 *
 * 功能说明：
 * - 集中定义所有路由配置
 * - 支持路由元信息（标题、权限、图标等）
 * - 支持路由懒加载
 * - 支持嵌套路由
 * - 避免循环依赖：所有路由直接在此定义，不导入视图模块的 routes 文件
 */

import type { RouteRecordRaw } from 'vue-router'

// 导出类型定义
export type { AppRouteMeta } from './types'

/**
 * 主布局下的路由
 */
export const mainRoutes: RouteRecordRaw[] = [
  // ==================== 首页 ====================
  {
    path: '',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '首页',
      icon: 'hugeicons:home-11',
      module: 'home',
    },
  },

  // ==================== AI 对话 ====================
  {
    path: 'ai',
    name: 'AI',
    component: () => import('@/views/ai/index.vue'),
    meta: {
      title: 'OS AI',
      icon: 'hugeicons:artificial-intelligence-01',
      hidden: false,
      requiresAdmin: false,
      module: 'ai',
    },
  },

  // ==================== 生活记录场景 ====================
  {
    path: 'lifeRecord',
    name: 'LifeRecordScene',
    component: () => import('@/views/lifeRecord/index.vue'),
    meta: {
      title: '生活记录',
      icon: 'hugeicons:note-02',
      requiresAuth: false,
      hidden: false,
      module: 'lifeRecord',
    },
  },

  // ==================== OS 配置管理 ====================
  {
    path: 'os-config',
    name: 'OSConfig',
    component: () => import('@/views/os-config/index.vue'),
    meta: {
      title: 'OS 配置',
      icon: 'hugeicons:ai-setting',
      requiresAdmin: false,
    },
    redirect: '/os-config/knowledge',
    children: [
      {
        path: 'chat-model',
        name: 'OSConfigChatModel',
        component: () => import('@/views/os-config/modules/ChatModelModule.vue'),
        meta: {
          title: '聊天模型',
          requiresAdmin: true,
        },
      },
      {
        path: 'knowledge',
        name: 'OSConfigKnowledge',
        component: () => import('@/views/os-config/modules/KnowledgeModule.vue'),
        meta: {
          title: '知识库',
          requiresAdmin: false,
        },
      },
      {
        path: 'knowledge/:kid/attachments',
        name: 'OSConfigKnowledgeAttach',
        component: () => import('@/views/os-config/modules/KnowledgeAttachView.vue'),
        meta: {
          title: '附件管理',
          requiresAdmin: false,
          hidden: true,
        },
      },
      {
        path: 'prompt-template',
        name: 'OSConfigPromptTemplate',
        component: () => import('@/views/os-config/modules/PromptTemplateModule.vue'),
        meta: {
          title: '提示词模板',
          requiresAdmin: true,
        },
      },
    ],
  },
]

/**
 * 认证相关路由（独立布局）
 */
export const authRoutes: RouteRecordRaw[] = [
  {
    path: 'login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: '登录',
      module: 'auth',
    },
  },
]

/**
 * 错误页面路由
 */
export const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: {
      title: '页面不存在',
      module: 'error',
    },
  },
]

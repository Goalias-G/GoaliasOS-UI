/**
 * OS 配置管理路由配置
 *
 * 功能说明：
 * - 定义 OS 配置管理的路由结构
 * - 包含聊天模型、知识库、提示词模板三个子模块
 * - 支持知识库附件管理子页面
 * - 需要管理员权限访问
 */

import type { RouteRecordRaw } from 'vue-router'

export const osConfigRoutes: RouteRecordRaw[] = [
  {
    path: 'os-config',
    name: 'OSConfig',
    component: () => import('./index.vue'),
    meta: {
      title: 'OS 配置',
      icon: 'hugeicons:ai-setting',
      requiresAdmin: false,
    },
    redirect: '/os-config/knowledge', //首先导航到知识库 （公共可见路由）
    children: [
      {
        path: 'chat-model',
        name: 'OSConfigChatModel',
        component: () => import('./modules/ChatModelModule.vue'),
        meta: {
          title: '聊天模型',
          requiresAdmin: true,
        },
      },
      {
        path: 'knowledge',
        name: 'OSConfigKnowledge',
        component: () => import('./modules/KnowledgeModule.vue'),
        meta: {
          title: '知识库',
          requiresAdmin: false,
        },
      },
      {
        path: 'knowledge/:kid/attachments',
        name: 'OSConfigKnowledgeAttach',
        component: () => import('./modules/KnowledgeAttachView.vue'),
        meta: {
          title: '附件管理',
          requiresAdmin: false,
          hidden: true, // 不在导航中显示
        },
      },
      {
        path: 'prompt-template',
        name: 'OSConfigPromptTemplate',
        component: () => import('./modules/PromptTemplateModule.vue'),
        meta: {
          title: '提示词模板',
          requiresAdmin: true,
        },
      },
    ],
  },
]

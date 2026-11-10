/**
 * OS 配置侧栏导航
 *
 * 顺序：知识库 → OS AI（二级）→ 定时任务
 */
import type { OsConfigNavItem } from '@/types'

export const OS_CONFIG_NAV_ITEMS: OsConfigNavItem[] = [
  {
    path: '/os-config/knowledge',
    label: '知识库',
    icon: 'mdi:book-outline',
  },
  {
    id: 'os-ai',
    label: 'OS AI',
    icon: 'mdi:creation-outline',
    defaultExpanded: true,
    children: [
      {
        path: '/os-config/chat-model',
        label: 'AI模型',
        icon: 'mdi:robot-outline',
      },
      {
        path: '/os-config/prompt-template',
        label: '提示词模板',
        icon: 'mdi:file-document-outline',
      },
      {
        path: '/os-config/mcp-config',
        label: 'MCP配置',
        icon: 'mdi:plug',
      },
    ],
  },
  {
    path: '/os-config/scheduled-task',
    label: '定时任务',
    icon: 'mdi:clock-time-five-outline',
  },
]

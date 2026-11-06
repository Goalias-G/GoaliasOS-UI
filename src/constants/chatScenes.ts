/**
 * AI 聊天快捷指令场景
 * scene 值与后端 PromptTemplateEnum.desc / DB prompt_template.category 对齐
 */

export interface ChatSceneOption {
  /** 对应后端 PromptTemplateEnum.desc；null 表示默认 chat（不在菜单中展示） */
  scene: string | null
  label: string
  icon: string
  description: string
  /** 图标强调色（Tailwind text class） */
  accentClass: string
  /** 是否允许上传附件（仅生活记录） */
  allowUpload: boolean
}

export const LIFE_RECORD_SCENE = 'lifeRecord'

/** 默认对话（不进快捷指令菜单，关闭标签后回到此状态） */
export const DEFAULT_CHAT_SCENE: ChatSceneOption = {
  scene: null,
  label: '默认对话',
  icon: 'mdi:chat-outline',
  description: '日常问答与助手对话',
  accentClass: 'text-clay-text-secondary',
  allowUpload: false,
}

/** 可选择的快捷指令（不含默认对话） */
export const CHAT_SCENE_OPTIONS: ChatSceneOption[] = [
  {
    scene: LIFE_RECORD_SCENE,
    label: '生活记录',
    icon: 'mdi:notebook-outline',
    description: '识别生活事件并自动落库，可附带图片/视频',
    accentClass: 'text-amber-500',
    allowUpload: true,
  },
  {
    scene: 'portrait',
    label: '画像更新',
    icon: 'mdi:account-edit-outline',
    description: '提炼个人背景并更新用户画像',
    accentClass: 'text-emerald-500',
    allowUpload: false,
  },
]

export function getChatSceneOption(scene: string | null): ChatSceneOption {
  if (!scene) return DEFAULT_CHAT_SCENE
  return CHAT_SCENE_OPTIONS.find((item) => item.scene === scene) ?? DEFAULT_CHAT_SCENE
}

/** ChatInput / session 发送载荷 */
export interface ChatSendPayload {
  content: string
  scene?: string | null
  fileIds?: number[]
}

/**
 * 组件 Props 类型定义
 *
 * 功能说明：
 * - 定义 Clay 组件的 Props 接口
 * - 提供统一的类型约束和代码提示
 */

/**
 * 组件尺寸
 */
export type ComponentSize = 'sm' | 'md' | 'lg'

/**
 * 组件变体
 */
export type ComponentVariant = 'primary' | 'secondary' | 'ghost' | 'outline'

/**
 * 徽章变体
 */
export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

/**
 * 输入框类型
 */
export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'

/**
 * 头像形状
 */
export type AvatarShape = 'circle' | 'square'

/**
 * 内边距大小
 */
export type PaddingSize = 'none' | 'sm' | 'md' | 'lg'

/**
 * 圆角大小
 */
export type RoundedSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * 模糊强度
 */
export type BlurStrength = 'sm' | 'md' | 'lg'

/**
 * ClayButton 组件 Props
 */
export interface ClayButtonProps {
  /** 变体类型 */
  variant?: ComponentVariant
  /** 尺寸 */
  size?: ComponentSize
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 是否全宽 */
  fullWidth?: boolean
  /** 图标（左侧） */
  iconLeft?: string
  /** 图标（右侧） */
  iconRight?: string
  /** HTML 按钮类型 */
  type?: 'button' | 'submit' | 'reset'
  /** 自定义类名 */
  class?: string
}

/**
 * ClayCard 组件 Props
 */
export interface ClayCardProps {
  /** 是否可悬停（悬停时提升） */
  hoverable?: boolean
  /** 是否可点击 */
  clickable?: boolean
  /** 内边距大小 */
  padding?: PaddingSize
  /** 圆角大小 */
  rounded?: RoundedSize
  /** 自定义类名 */
  class?: string
}

/**
 * ClayInput 组件 Props
 */
export interface ClayInputProps {
  /** v-model 绑定值 */
  modelValue?: string | number
  /** 输入类型 */
  type?: InputType
  /** 占位符 */
  placeholder?: string
  /** 标签 */
  label?: string
  /** 错误信息 */
  error?: string
  /** 帮助文本 */
  hint?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否必填 */
  required?: boolean
  /** 左侧图标 */
  iconLeft?: string
  /** 右侧图标 */
  iconRight?: string
  /** 尺寸 */
  size?: ComponentSize
  /** 自定义类名 */
  class?: string
}

/**
 * ClayBadge 组件 Props
 */
export interface ClayBadgeProps {
  /** 变体类型 */
  variant?: BadgeVariant
  /** 尺寸 */
  size?: ComponentSize
  /** 是否为圆点样式 */
  dot?: boolean
  /** 自定义类名 */
  class?: string
}

/**
 * ClayAvatar 组件 Props
 */
export interface ClayAvatarProps {
  /** 图片 URL */
  src?: string
  /** 替代文本 */
  alt?: string
  /** 显示文字（当无图片时） */
  text?: string
  /** 尺寸 */
  size?: ComponentSize | 'xl'
  /** 形状 */
  shape?: AvatarShape
  /** 自定义类名 */
  class?: string
}

/**
 * ClayBackground 组件 Props
 */
export interface ClayBackgroundProps {
  /** Blob 数量 */
  blobCount?: number
  /** 动画速度（秒） */
  animationDuration?: number
  /** Blob 颜色数组 */
  colors?: string[]
  /** 是否启用动画 */
  animated?: boolean
  /** 自定义类名 */
  class?: string
}

/**
 * Blob 元素配置
 */
export interface Blob {
  /** 唯一标识 */
  id: number
  /** 水平位置（百分比） */
  x: number
  /** 垂直位置（百分比） */
  y: number
  /** 尺寸（像素） */
  size: number
  /** 颜色 */
  color: string
  /** 动画时长（秒） */
  duration: number
  /** 动画延迟（秒） */
  delay: number
}

/**
 * GlassCard 组件 Props
 */
export interface GlassCardProps {
  /** 模糊强度 */
  blur?: BlurStrength
  /** 透明度（0-1） */
  opacity?: number
  /** 内边距 */
  padding?: PaddingSize
  /** 圆角 */
  rounded?: RoundedSize
  /** 自定义类名 */
  class?: string
}

/**
 * ClayTooltip 组件 Props
 */
export interface ClayTooltipProps {
  /** 提示内容 */
  content?: string
  /** 位置 */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义类名 */
  class?: string
}

/**
 * ClayDialog 组件 Props
 */
export interface ClayDialogProps {
  /** 是否显示 */
  open?: boolean
  /** 标题 */
  title?: string
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否点击遮罩关闭 */
  closeOnClickOutside?: boolean
  /** 自定义类名 */
  class?: string
}

/**
 * ClayDropdown 组件 Props
 */
export interface ClayDropdownProps {
  /** 是否显示 */
  open?: boolean
  /** 位置 */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  /** 触发方式 */
  trigger?: 'click' | 'hover'
  /** 自定义类名 */
  class?: string
}

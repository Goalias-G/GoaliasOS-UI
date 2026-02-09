<script setup lang="ts">
/**
 * 统一图标组件封装
 *
 * 基于 @iconify/vue 封装，提供统一的图标使用方式
 *
 * 使用示例：
 * <AppIcon icon="mdi:home" />
 * <AppIcon icon="mdi:user" :size="24" color="#6366f1" />
 * <AppIcon icon="mdi:settings" class="text-gray-500" />
 *
 * 图标查找：https://icon-sets.iconify.design/
 * 推荐图标集：mdi（Material Design Icons）、lucide、heroicons
 */
import { Icon } from '@iconify/vue'

interface Props {
  /** 图标名称，格式：图标集:图标名，如 mdi:home */
  icon: string
  /** 图标大小（像素），默认 20 */
  size?: number | string
  /** 图标颜色，支持 CSS 颜色值 */
  color?: string
  /** 是否内联显示 */
  inline?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 20,
  inline: false,
})
</script>

<template>
  <Icon
    :icon="icon"
    :width="size"
    :height="size"
    :color="color"
    :inline="inline"
    class="app-icon"
  />
</template>

<style scoped>
.app-icon {
  flex-shrink: 0;
  display: inline-flex;
  vertical-align: middle;
}
</style>

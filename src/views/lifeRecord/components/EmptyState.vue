<script setup lang="ts">
/**
 * 空状态组件
 *
 * 功能说明:
 * - 显示不同类型的空状态提示
 * - 提供快速创建按钮
 * - 支持搜索无结果提示
 */

interface Props {
  type: 'category' | 'record'
  searchText?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  create: []
}>()

// 根据类型生成提示文案
const emptyConfig = computed(() => {
  if (props.searchText) {
    return {
      icon: 'mdi:magnify',
      title: '未找到匹配结果',
    }
  }

  if (props.type === 'category') {
    return {
      icon: 'mdi:folder-outline',
      title: '暂无分类',
    }
  }

  return {
    icon: 'mdi:notebook-outline',
    title: '暂无记录',
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-6">
    <!-- 图标 -->
    <div
      class="w-24 h-24 rounded-full bg-clay-bg-elevated shadow-clay-card flex items-center justify-center mb-6"
    >
      <AppIcon :icon="emptyConfig.icon" :size="48" class="text-clay-text-muted" />
    </div>

    <!-- 标题 -->
    <h3 class="text-xl font-bold text-clay-text-primary mb-2">
      {{ emptyConfig.title }}
    </h3>
  </div>
</template>

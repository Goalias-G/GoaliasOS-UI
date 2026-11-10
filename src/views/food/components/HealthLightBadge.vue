<script setup lang="ts">
/**
 * 食材健康灯：1 绿推荐 / 2 黄适量 / 3 红限制
 */
import { HEALTH_LIGHT_LABEL } from '@/types'

const props = defineProps<{
  light?: number | null
}>()

const config = computed(() => {
  const light = props.light
  if (light === 1) {
    return {
      label: HEALTH_LIGHT_LABEL[1],
      class: 'bg-emerald-100 text-emerald-700',
      icon: 'mdi:leaf',
    }
  }
  if (light === 2) {
    return {
      label: HEALTH_LIGHT_LABEL[2],
      class: 'bg-amber-100 text-amber-700',
      icon: 'mdi:scale-balance',
    }
  }
  if (light === 3) {
    return {
      label: HEALTH_LIGHT_LABEL[3],
      class: 'bg-rose-100 text-rose-700',
      icon: 'mdi:alert-circle-outline',
    }
  }
  return null
})
</script>

<template>
  <span
    v-if="config"
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
    :class="config.class"
  >
    <AppIcon :icon="config.icon" :size="12" />
    {{ config.label }}
  </span>
</template>

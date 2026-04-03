<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

interface FlipCardProps {
  rotate?: 'x' | 'y'
  class?: string
}

const props = withDefaults(defineProps<FlipCardProps>(), {
  rotate: 'y',
})

const isFlipped = ref(false)
const isHovered = ref(false)
const isTouchDevice = ref(false)

const rotateAxis = computed(() => (props.rotate === 'x' ? 'rotateX' : 'rotateY'))

const shouldFlip = computed(() => {
  if (isTouchDevice.value) {
    return isFlipped.value
  }
  return isHovered.value || isFlipped.value
})

const containerRotation = computed(() =>
  shouldFlip.value ? `[transform:${rotateAxis.value}(180deg)]` : '',
)

function toggleFlip() {
  isFlipped.value = !isFlipped.value
}

function handleMouseEnter() {
  if (!isTouchDevice.value) {
    isHovered.value = true
  }
}

function handleMouseLeave() {
  if (!isTouchDevice.value) {
    isHovered.value = false
  }
}

function checkTouchDevice() {
  isTouchDevice.value =
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768
}

onMounted(() => {
  checkTouchDevice()
  window.addEventListener('resize', checkTouchDevice)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkTouchDevice)
})
</script>

<template>
  <div
    class="group w-full cursor-pointer"
    :class="[props.class]"
    @click="toggleFlip"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 桌面端：3D 翻转 -->
    <div
      v-if="!isTouchDevice"
      class="relative h-full w-full rounded-clay-lg transition-all duration-500 [perspective:1000px] [transform-style:preserve-3d]"
      :class="[containerRotation]"
    >
      <!-- Front -->
      <div
        class="absolute inset-0 overflow-hidden rounded-clay-lg shadow-clay-card bg-clay-bg-elevated [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
      >
        <slot />
      </div>

      <!-- Back -->
      <div
        class="absolute inset-0 overflow-y-auto rounded-clay-lg shadow-clay-card bg-clay-bg-elevated p-4 text-clay-text-primary [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]"
      >
        <slot name="back" />
      </div>
    </div>

    <!-- 移动端：透明度切换（避免 3D 变换导致的模糊） -->
    <div v-else class="relative h-full w-full">
      <!-- Front -->
      <div
        class="absolute inset-0 overflow-hidden rounded-clay-lg shadow-clay-card bg-clay-bg-elevated transition-opacity duration-300"
        :class="shouldFlip ? 'pointer-events-none opacity-0' : 'opacity-100'"
      >
        <slot />
      </div>

      <!-- Back -->
      <div
        class="absolute inset-0 overflow-y-auto rounded-clay-lg shadow-clay-card bg-clay-bg-elevated p-4 text-clay-text-primary transition-opacity duration-300 scrollbar-hide"
        :class="shouldFlip ? 'opacity-100' : 'pointer-events-none opacity-0'"
      >
        <slot name="back" />
      </div>
    </div>
  </div>
</template>

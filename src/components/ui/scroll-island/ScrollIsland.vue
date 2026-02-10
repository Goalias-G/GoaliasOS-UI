<script lang="ts" setup>
import NumberFlow from '@number-flow/vue'
import { useColorMode } from '@vueuse/core'
import { motion, MotionConfig } from 'motion-v'
import { computed, onMounted, onUnmounted, ref, useSlots, watch } from 'vue'

interface Props {
  class?: string
  title?: string
  height?: number
  scrollContainer?: HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  title: 'Progress',
  height: 44,
  scrollContainer: null,
})

const open = ref(false)
const slots = useSlots()

const scrollPercentage = ref(0)

const isDark = computed(() => useColorMode().value == 'dark')
const isSlotAvailable = computed(() => !!slots.default)
const borderRadius = computed(() => `${props.height / 2}px`)

let currentContainer: HTMLElement | Window | null = null

onMounted(() => {
  if (typeof window === 'undefined') return

  // 如果传入了容器，等待它可用
  if (props.scrollContainer) {
    setupScrollListener(props.scrollContainer)
  } else {
    setupScrollListener(window)
  }
})

// 监听 scrollContainer 变化（处理延迟绑定的情况）
watch(
  () => props.scrollContainer,
  (newContainer, oldContainer) => {
    if (oldContainer) {
      oldContainer.removeEventListener('scroll', updatePageScroll)
    }
    if (newContainer) {
      setupScrollListener(newContainer)
    }
  },
  { immediate: false },
)

function setupScrollListener(container: HTMLElement | Window) {
  currentContainer = container
  container.addEventListener('scroll', updatePageScroll)
  updatePageScroll()
}

function updatePageScroll() {
  const container = currentContainer
  if (!container) {
    scrollPercentage.value = 0
    return
  }

  if (container instanceof HTMLElement) {
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight - container.clientHeight
    scrollPercentage.value = scrollHeight > 0 ? scrollTop / scrollHeight : 0
  } else {
    scrollPercentage.value = window.scrollY / (document.body.scrollHeight - window.innerHeight)
  }
}

onUnmounted(() => {
  if (currentContainer) {
    currentContainer.removeEventListener('scroll', updatePageScroll)
  }
})
</script>

<template>
  <MotionConfig
    :transition="{
      duration: 0.7,
      type: 'spring',
      bounce: 0.5,
    }"
  >
    <div
      class="border-radius fixed top-15 left-1/2 z-999 -translate-x-1/2 backdrop-blur-lg"
      :class="[$props.class]"
      @click="() => (open = !open)"
    >
      <motion.div
        id="motion-id"
        layout
        :initial="{
          height: props.height,
          width: 0,
        }"
        :animate="{
          height: open && isSlotAvailable ? 'auto' : props.height,
          width: open && isSlotAvailable ? 320 : 260,
        }"
        class="clay-text-secondary relative overflow-hidden"
      >
        <header class="gray- flex h-11 cursor-pointer items-center gap-2 px-4">
          <AnimatedCircularProgressBar
            :value="scrollPercentage * 100"
            :min="0"
            :max="100"
            :circle-stroke-width="10"
            class="w-6"
            :show-percentage="false"
            :duration="0.3"
            :gauge-secondary-color="isDark ? '#6b728055' : '#6b728099'"
            :gauge-primary-color="isDark ? 'black' : 'white'"
          />
          <h1 class="grow text-center font-bold">{{ title }}</h1>
          <NumberFlow
            :value="scrollPercentage"
            :format="{
              style: 'percent',
            }"
            locales="en-US"
          />
        </header>
        <motion.div
          v-if="isSlotAvailable"
          class="mb-2 flex h-full max-h-60 flex-col gap-1 overflow-y-auto px-4 text-sm"
        >
          <slot />
        </motion.div>
      </motion.div>
    </div>
  </MotionConfig>
</template>

<style scoped>
.border-radius {
  border-radius: v-bind(borderRadius);
}
</style>

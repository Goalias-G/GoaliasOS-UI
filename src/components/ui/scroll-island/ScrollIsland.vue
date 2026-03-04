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
      class="scroll-island-wrapper border-radius fixed top-15 left-1/2 z-999 -translate-x-1/2"
      :class="[$props.class]"
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
        class="scroll-island-content relative overflow-hidden"
      >
        <header
          class="scroll-island-header flex h-11 cursor-pointer items-center gap-2 px-4"
          @click="() => (open = !open)"
        >
          <AnimatedCircularProgressBar
            :value="scrollPercentage * 100"
            :min="0"
            :max="100"
            :circle-stroke-width="10"
            class="w-6"
            :show-percentage="false"
            :duration="0.3"
            :gauge-secondary-color="'rgba(255, 255, 255, 0.2)'"
            :gauge-primary-color="'rgba(255, 255, 255, 0.9)'"
          />
          <h1 class="grow text-center font-bold text-white drop-shadow-lg">{{ title }}</h1>
          <NumberFlow
            :value="scrollPercentage"
            :format="{
              style: 'percent',
            }"
            locales="en-US"
            class="text-white font-semibold drop-shadow-lg"
          />
        </header>
        <motion.div
          v-if="isSlotAvailable"
          class="scroll-island-body mb-2 flex h-full max-h-60 flex-col gap-1 overflow-y-auto px-4 text-sm"
          @click.stop
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

/* Clay 风格的 ScrollIsland 样式 */
.scroll-island-wrapper {
  /* Clay 玻璃态效果 + 更强的背景 */
  background: linear-gradient(
    135deg,
    rgba(124, 58, 237, 0.85) 0%,
    rgba(167, 139, 250, 0.75) 50%,
    rgba(124, 58, 237, 0.85) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* Clay 阴影效果 */
  box-shadow:
    0 8px 32px rgba(124, 58, 237, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);

  /* 边框 */
  border: 1px solid rgba(255, 255, 255, 0.2);

  /* 过渡效果 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-island-wrapper:hover {
  box-shadow:
    0 12px 40px rgba(124, 58, 237, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

.scroll-island-content {
  /* 确保内容清晰可见 */
  position: relative;
  z-index: 1;
}

.scroll-island-header {
  /* 头部样式增强 */
  position: relative;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.scroll-island-body {
  /* 内容区域样式 */
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.1) 100%);

  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.scroll-island-body::-webkit-scrollbar {
  width: 6px;
}

.scroll-island-body::-webkit-scrollbar-track {
  background: transparent;
}

.scroll-island-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  transition: background 0.2s;
}

.scroll-island-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .scroll-island-wrapper {
    top: 12px;
  }
}
</style>

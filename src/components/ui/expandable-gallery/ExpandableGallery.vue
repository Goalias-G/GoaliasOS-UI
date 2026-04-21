<script lang="ts" setup>
import { ref } from 'vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils.ts'

interface Props {
  images: string[]
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const expandedIndex = ref<number | null>(null)

function handleClick(index: number) {
  if (window.innerWidth >= 768) return
  expandedIndex.value = expandedIndex.value === index ? null : index
}
</script>

<template>
  <div :class="cn(`flex h-96 w-full gap-2`, props.class)">
    <div
      v-for="(image, index) in images"
      :key="image"
      :class="
        cn(
          'relative flex h-full flex-1 cursor-pointer overflow-hidden rounded-xl transition-all duration-500 ease-in-out',
          'md:hover:flex-3',
          expandedIndex === index && 'flex-3',
        )
      "
      @click="handleClick(index)"
    >
      <img class="relative h-full object-cover" :src="image" :alt="image" />
    </div>
  </div>
</template>

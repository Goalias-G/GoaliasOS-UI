<template>
  <div class="relative h-96 w-full">
    <ShimmerButton class="shadow-2xl" shimmer-size="2px" @click="handleClick">
      <span
        class="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-red-500 lg:text-lg dark:from-white dark:to-slate-900/10">
        Cool Button
      </span>
    </ShimmerButton>
    <BlackHoleBackground class="absolute inset-0 flex items-center justify-center rounded-xl">
    </BlackHoleBackground>
    <!-- <div class="relative flex h-96 flex-col items-center justify-center">
      <FallingStarsBg class="bg-white dark:bg-black" :color="isDark ? '#8C2626' : '#FFF'" />
      <div class="z-[1] flex items-center">
        <span class="text-6xl font-bold text-black dark:text-white">Inspira UI</span>
      </div>
    </div> -->
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue"//TODO 需全局导入

import { BlackHoleBackground } from "@/components/ui/bg-black-hole/index"
import { ShimmerButton } from "@/components/ui/shimmer-button/index"
import { FallingStarsBg } from "@/components/ui/bg-falling-stars/index"

const count = ref(0)
const isDark = ref(true)



function handleClick() {
  count.value++
  console.log(count.value)
}
</script>
<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>

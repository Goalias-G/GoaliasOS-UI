<script setup lang="ts">
/**
 * 404 页面 - 占满整个视口
 */
import { useRouter } from 'vue-router'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
</script>

<template>
    <div class="w-screen h-screen flex items-center justify-center bg-gray-50">
        <div class="text-center max-w-lg px-8">
            <div class="relative mb-8">
                <div class="absolute -top-4 -left-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50"></div>
                <div class="absolute -bottom-2 -right-2 w-16 h-16 bg-purple-100 rounded-full opacity-50"></div>
                <h1
                    class="relative text-[140px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 leading-none">
                    404</h1>
            </div>

            <h2 class="text-2xl font-bold text-gray-900 mb-3">页面不存在</h2>
            <p class="text-gray-500 mb-8">抱歉，您访问的页面可能已被移除或暂时不可用。</p>

            <div class="flex justify-center gap-4">
                <button @click="router.push('/')"
                    class="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/25">
                    <AppIcon icon="mdi:home" :size="20" />
                    返回首页
                </button>
                <button @click="router.back()"
                    class="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200">
                    <AppIcon icon="mdi:arrow-left" :size="20" />
                    返回上页
                </button>
            </div>
        </div>
    </div>
</template>

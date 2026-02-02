<script setup lang="ts">
/**
 * 组件演示页面
 *
 * 功能说明：
 * - PC 端优先的组件展示设计
 * - 展示项目中已有的 UI 组件
 *
 * 需求: 8.1, 8.2, 8.3
 */

// 当前展示的背景组件
const activeBackground = ref<'none' | 'blackhole' | 'stars'>('none')

// 背景标题
const backgroundTitle = computed(() => {
    if (activeBackground.value === 'none') return '选择一个背景'
    if (activeBackground.value === 'blackhole') return 'BlackHole 效果'
    return 'FallingStars 效果'
})

// 背景描述
const backgroundDesc = computed(() => {
    if (activeBackground.value === 'none') return '点击上方按钮预览背景动画'
    return '适用于登录页、落地页等场景'
})

// 组件列表
const components = [
    { name: 'ShimmerButton', description: '带有闪烁动画效果的按钮', category: '按钮' },
    { name: 'BlackHoleBackground', description: '黑洞效果背景动画', category: '背景' },
    { name: 'FallingStarsBg', description: '流星雨效果背景动画', category: '背景' },
    { name: 'AppIcon', description: '统一图标组件', category: '基础' },
]

// 图标示例
const iconExamples = [
    { icon: 'mdi:home', label: '首页' },
    { icon: 'mdi:account', label: '用户' },
    { icon: 'mdi:cog', label: '设置' },
    { icon: 'mdi:bell', label: '通知' },
    { icon: 'mdi:heart', label: '收藏' },
    { icon: 'mdi:star', label: '星标' },
    { icon: 'mdi:search', label: '搜索' },
    { icon: 'mdi:plus', label: '添加' },
]

// 背景选项
const bgOptions = [
    { key: 'none', label: '无背景' },
    { key: 'blackhole', label: 'BlackHole' },
    { key: 'stars', label: 'FallingStars' }
]

function setBackground(key: string) {
    activeBackground.value = key as 'none' | 'blackhole' | 'stars'
}
</script>

<template>
    <div class="p-6">
        <!-- 页面标题 -->
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900">组件演示</h1>
            <p class="text-gray-500 mt-1">展示项目中可用的 UI 组件及使用示例</p>
        </div>

        <!-- 组件概览 -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div v-for="comp in components" :key="comp.name"
                class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <span class="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                    {{ comp.category }}
                </span>
                <h3 class="font-medium text-gray-900 mt-3">{{ comp.name }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ comp.description }}</p>
            </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <!-- ShimmerButton 演示 -->
            <section class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b border-gray-100">
                    <h2 class="font-semibold text-gray-900 flex items-center gap-2">
                        <AppIcon icon="mdi:button-cursor" :size="20" class="text-indigo-500" />
                        ShimmerButton 闪烁按钮
                    </h2>
                </div>
                <div class="bg-gray-900 p-8">
                    <div class="flex flex-wrap items-center justify-center gap-4">
                        <ShimmerButton>
                            <span class="text-white font-medium">默认按钮</span>
                        </ShimmerButton>
                        <ShimmerButton shimmer-color="#a855f7" background="rgba(88, 28, 135, 0.9)">
                            <span class="text-white font-medium">紫色主题</span>
                        </ShimmerButton>
                        <ShimmerButton shimmer-color="#22c55e" background="rgba(22, 101, 52, 0.9)">
                            <span class="flex items-center gap-2 text-white font-medium">
                                <AppIcon icon="mdi:rocket-launch" :size="18" />
                                开始使用
                            </span>
                        </ShimmerButton>
                    </div>
                </div>
                <div class="p-4 bg-gray-50">
                    <pre class="text-xs text-gray-600 overflow-x-auto"><code>&lt;ShimmerButton shimmer-color="#a855f7"&gt;
  &lt;span class="text-white"&gt;按钮文字&lt;/span&gt;
&lt;/ShimmerButton&gt;</code></pre>
                </div>
            </section>

            <!-- AppIcon 演示 -->
            <section class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-4 border-b border-gray-100">
                    <h2 class="font-semibold text-gray-900 flex items-center gap-2">
                        <AppIcon icon="mdi:shape-outline" :size="20" class="text-indigo-500" />
                        AppIcon 图标组件
                    </h2>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                        <div v-for="item in iconExamples" :key="item.icon"
                            class="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <AppIcon :icon="item.icon" :size="24" class="text-gray-700" />
                            <span class="text-xs text-gray-500">{{ item.label }}</span>
                        </div>
                    </div>
                    <div class="flex items-end gap-4 pt-4 border-t border-gray-100">
                        <div v-for="size in [16, 20, 24, 32, 48]" :key="size" class="text-center">
                            <AppIcon icon="mdi:star" :size="size" class="text-yellow-500" />
                            <p class="text-xs text-gray-400 mt-1">{{ size }}px</p>
                        </div>
                    </div>
                </div>
                <div class="p-4 bg-gray-50">
                    <pre class="text-xs text-gray-600 overflow-x-auto"><code>&lt;AppIcon icon="mdi:home" :size="24" color="#6366f1" /&gt;
&lt;!-- 图标查找：https://icon-sets.iconify.design/ --&gt;</code></pre>
                </div>
            </section>
        </div>

        <!-- 背景组件演示 -->
        <section class="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 class="font-semibold text-gray-900 flex items-center gap-2">
                    <AppIcon icon="mdi:image-filter-hdr" :size="20" class="text-indigo-500" />
                    背景动画组件
                </h2>
                <div class="flex gap-2">
                    <button v-for="bg in bgOptions" :key="bg.key" @click="setBackground(bg.key)" :class="[
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        activeBackground === bg.key
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    ]">
                        {{ bg.label }}
                    </button>
                </div>
            </div>
            <div class="relative h-80 bg-gray-900">
                <BlackHoleBackground v-if="activeBackground === 'blackhole'" class="absolute inset-0" />
                <FallingStarsBg v-if="activeBackground === 'stars'" color="#FFF" :count="150" />
                <div class="relative z-10 h-full flex items-center justify-center">
                    <div class="text-center">
                        <h3 class="text-2xl font-bold text-white mb-2">{{ backgroundTitle }}</h3>
                        <p class="text-gray-400">{{ backgroundDesc }}</p>
                    </div>
                </div>
            </div>
            <div class="p-4 bg-gray-50">
                <pre class="text-xs text-gray-600 overflow-x-auto"><code>&lt;div class="relative h-screen"&gt;
  &lt;BlackHoleBackground class="absolute inset-0" /&gt;
  &lt;div class="relative z-10"&gt;内容&lt;/div&gt;
&lt;/div&gt;</code></pre>
            </div>
        </section>
    </div>
</template>

<!--
  Tailwind CSS 配置测试组件
  用于验证 Claymorphism 设计系统的 Tailwind 扩展是否正常工作
-->
<template>
    <div class="p-8 space-y-6">
        <h2 class="font-heading text-2xl text-clay-text-primary">
            Tailwind CSS 配置测试
        </h2>

        <!-- 颜色测试 -->
        <div class="space-y-2">
            <h3 class="font-heading text-lg">颜色系统</h3>
            <div class="flex gap-4 flex-wrap">
                <div class="w-20 h-20 bg-clay-primary rounded-clay-sm"></div>
                <div class="w-20 h-20 bg-clay-primary-light rounded-clay-sm"></div>
                <div class="w-20 h-20 bg-clay-primary-dark rounded-clay-sm"></div>
                <div class="w-20 h-20 bg-clay-accent-pink rounded-clay-sm"></div>
                <div class="w-20 h-20 bg-clay-accent-cyan rounded-clay-sm"></div>
                <div class="w-20 h-20 bg-clay-accent-yellow rounded-clay-sm"></div>
            </div>
        </div>

        <!-- 阴影测试 -->
        <div class="space-y-2">
            <h3 class="font-heading text-lg">阴影系统</h3>
            <div class="flex gap-4 flex-wrap">
                <div
                    class="w-32 h-32 bg-clay-bg-elevated shadow-clay-card rounded-clay-md flex items-center justify-center">
                    <span class="text-sm">card</span>
                </div>
                <div
                    class="w-32 h-32 bg-clay-bg-elevated shadow-clay-button rounded-clay-md flex items-center justify-center">
                    <span class="text-sm">button</span>
                </div>
                <div
                    class="w-32 h-32 bg-clay-bg-elevated shadow-clay-hover rounded-clay-md flex items-center justify-center">
                    <span class="text-sm">hover</span>
                </div>
                <div
                    class="w-32 h-32 bg-clay-bg-elevated shadow-clay-pressed rounded-clay-md flex items-center justify-center">
                    <span class="text-sm">pressed</span>
                </div>
            </div>
        </div>

        <!-- 圆角测试 -->
        <div class="space-y-2">
            <h3 class="font-heading text-lg">圆角系统</h3>
            <div class="flex gap-4 flex-wrap">
                <div
                    class="w-24 h-24 bg-clay-primary rounded-clay-sm flex items-center justify-center text-white text-xs">
                    sm (20px)
                </div>
                <div
                    class="w-24 h-24 bg-clay-primary rounded-clay-md flex items-center justify-center text-white text-xs">
                    md (28px)
                </div>
                <div
                    class="w-24 h-24 bg-clay-primary rounded-clay-lg flex items-center justify-center text-white text-xs">
                    lg (36px)
                </div>
                <div
                    class="w-24 h-24 bg-clay-primary rounded-clay-xl flex items-center justify-center text-white text-xs">
                    xl (48px)
                </div>
            </div>
        </div>

        <!-- 动画测试 -->
        <div class="space-y-2">
            <h3 class="font-heading text-lg">动画系统</h3>
            <div class="flex gap-4 flex-wrap">
                <div
                    class="w-24 h-24 bg-clay-accent-pink rounded-clay-md animate-float flex items-center justify-center text-white text-xs">
                    float
                </div>
                <div
                    class="w-24 h-24 bg-clay-accent-cyan rounded-clay-md animate-breathe flex items-center justify-center text-white text-xs">
                    breathe
                </div>
            </div>
        </div>

        <!-- 字体测试 -->
        <div class="space-y-2">
            <h3 class="font-heading text-lg">字体系统</h3>
            <p class="font-heading text-clay-text-primary">
                这是 Nunito 标题字体 (font-heading)
            </p>
            <p class="font-body text-clay-text-secondary">
                这是 DM Sans 正文字体 (font-body)
            </p>
        </div>

        <!-- 文本颜色测试 -->
        <div class="space-y-2">
            <h3 class="font-heading text-lg">文本颜色</h3>
            <p class="text-clay-text-primary">主要文本 (text-primary)</p>
            <p class="text-clay-text-secondary">次要文本 (text-secondary)</p>
            <p class="text-clay-text-muted">弱化文本 (text-muted)</p>
            <div class="bg-clay-primary p-2 rounded-clay-sm">
                <p class="text-clay-text-inverse">反色文本 (text-inverse)</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// 这个组件仅用于测试 Tailwind 配置
</script>

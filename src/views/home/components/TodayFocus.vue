<script setup lang="ts">
/**
 * TodayFocus 组件 - 今日重点
 *
 * 功能说明：
 * - 展示 AI 问候语（aiRecommend.greeting）
 * - 展示心理学知识（psychology.title 和 content）
 * - 展示每日知识（knowledge.title 和 content）
 * - 展示近三天健康分析与今日推荐（lifeAnalysis）
 * - 支持内容折叠/展开功能
 */

import type { AiRecommend } from '@/types'

// ==================== Props ====================
interface Props {
  /** AI 推荐数据 */
  aiRecommend?: AiRecommend
}

const props = defineProps<Props>()

// ==================== 响应式状态 ====================
const expandedSections = ref<Set<string>>(new Set(['greeting', 'lifeAnalysis']))

// ==================== 方法 ====================
function toggleSection(section: string) {
  if (expandedSections.value.has(section)) {
    expandedSections.value.delete(section)
  } else {
    expandedSections.value.add(section)
  }
  // 触发响应式更新
  expandedSections.value = new Set(expandedSections.value)
}

function isExpanded(section: string): boolean {
  return expandedSections.value.has(section)
}
</script>

<template>
  <div class="today-focus space-y-4">
    <div v-if="aiRecommend?.greeting" class="clay-card p-6">
      <div
        class="flex items-center justify-between cursor-pointer"
        @click="toggleSection('greeting')"
      >
        <h3 class="clay-section-title clay-section-title--compact gap-2">
          <AppIcon icon="hugeicons:task-daily-01" :size="24" class="text-clay-primary" />
          OS 今日问候
        </h3>
        <AppIcon
          :icon="isExpanded('greeting') ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          :size="24"
          class="text-clay-text-secondary transition-transform"
        />
      </div>
      <Transition name="expand">
        <div v-if="isExpanded('greeting')" class="mt-4 text-clay-text-primary leading-relaxed">
          {{ aiRecommend.greeting }}
        </div>
      </Transition>
    </div>

    <!-- 心理学知识 -->
    <FlipCard v-if="aiRecommend?.psychology" class="h-48">
      <template #default>
        <div class="flex flex-col items-center justify-center h-full">
          <AppIcon icon="hugeicons:brain-02" :size="48" class="text-clay-accent-pink mb-4" />
          <h3 class="clay-section-title clay-section-title--compact text-center">
            {{ aiRecommend.psychology.title }}
          </h3>
        </div>
      </template>
      <template #back>
        <div class="flex min-h-full flex-col gap-2 p-4">
          <h1 class="clay-section-title clay-section-title--compact">
            {{ aiRecommend.psychology.title }}
          </h1>
          <p
            class="mt-2 border-t border-clay-primary/20 pt-3 text-sm leading-relaxed text-clay-text-primary whitespace-pre-wrap overflow-y-auto"
          >
            {{ aiRecommend.psychology.content }}
          </p>
        </div>
      </template>
    </FlipCard>

    <!-- 每日知识 -->
    <FlipCard v-if="aiRecommend?.knowledge" class="h-48">
      <template #default>
        <div class="flex flex-col items-center justify-center h-full">
          <AppIcon icon="hugeicons:book-02" :size="48" class="text-clay-accent-pink mb-4" />
          <h3 class="clay-section-title clay-section-title--compact text-center">
            {{ aiRecommend.knowledge.title || '每日知识' }}
          </h3>
        </div>
      </template>
      <template #back>
        <div class="flex min-h-full flex-col gap-2 p-4">
          <h1 class="clay-section-title clay-section-title--compact">
            {{ aiRecommend.knowledge.title || '每日知识' }}
          </h1>
          <p
            class="mt-2 border-t border-clay-primary/20 pt-3 text-sm leading-relaxed text-clay-text-primary whitespace-pre-wrap overflow-y-auto"
          >
            {{ aiRecommend.knowledge.content }}
          </p>
        </div>
      </template>
    </FlipCard>

    <!-- 健康分析 -->
    <div v-if="aiRecommend?.lifeAnalysis" class="clay-card p-6">
      <div
        class="flex items-center justify-between cursor-pointer"
        @click="toggleSection('lifeAnalysis')"
      >
        <h3 class="clay-section-title clay-section-title--compact gap-2">
          <AppIcon icon="hugeicons:health" :size="24" class="text-clay-primary" />
          OS AI 三日记录回顾
        </h3>
        <AppIcon
          :icon="isExpanded('lifeAnalysis') ? 'mdi:chevron-up' : 'mdi:chevron-down'"
          :size="24"
          class="text-clay-text-secondary transition-transform"
        />
      </div>
      <Transition name="expand">
        <div
          v-if="isExpanded('lifeAnalysis')"
          class="mt-4 text-clay-text-primary leading-relaxed whitespace-pre-wrap"
        >
          {{ aiRecommend.lifeAnalysis }}
        </div>
      </Transition>
    </div>

    <!-- 空状态 -->
    <div v-if="!aiRecommend" class="clay-card p-12 text-center">
      <AppIcon icon="mdi:inbox" :size="64" class="text-clay-text-muted mx-auto mb-4" />
      <h3 class="text-lg font-bold text-clay-text-primary mb-2">暂无推荐内容</h3>
    </div>
  </div>
</template>

<style scoped>
/* 展开/折叠动画 */
.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  overflow: hidden;
}

.expand-enter-active {
  max-height: 1000px;
}

.expand-leave-active {
  max-height: 1000px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 1000px;
  opacity: 1;
}
</style>

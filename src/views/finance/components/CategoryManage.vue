<script setup lang="ts">
/**
 * 分类管理组件
 *
 * 功能说明:
 * - 左右双栏展示支出/收入分类
 * - 移动端子 tab 切换
 * - 每条分类支持编辑/删除
 */

import { storeToRefs } from 'pinia'
import type { FinanceCategory } from '@/types'

defineEmits<{
  add: [type: number]
  edit: [category: FinanceCategory]
  delete: [id: number]
}>()

const store = useFinanceStore()
const { expenseCategories, incomeCategories, loading } = storeToRefs(store)

// 移动端子 tab
const mobileTab = ref<1 | 2>(1)
</script>

<template>
  <div>
    <!-- 移动端类型切换 -->
    <div class="md:hidden mb-4">
      <div class="clay-card p-1.5 flex gap-1.5">
        <button
          @click="mobileTab = 1"
          class="flex-1 py-2.5 rounded-clay-sm text-sm font-medium transition-all"
          :class="
            mobileTab === 1
              ? 'bg-clay-primary text-purple-500 shadow-clay-button'
              : 'text-clay-text-secondary'
          "
        >
          支出分类
        </button>
        <button
          @click="mobileTab = 2"
          class="flex-1 py-2.5 rounded-clay-sm text-sm font-medium transition-all"
          :class="
            mobileTab === 2
              ? 'bg-clay-primary text-purple-500 shadow-clay-button'
              : 'text-clay-text-secondary'
          "
        >
          收入分类
        </button>
      </div>
    </div>

    <!-- 桌面端: 双栏布局 -->
    <div class="hidden md:grid grid-cols-2 gap-6">
      <!-- 支出分类 -->
      <div class="clay-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h4
            class="text-base font-semibold text-clay-text-primary font-heading flex items-center gap-2"
          >
            <AppIcon icon="mdi:arrow-down-bold" :size="18" class="text-red-500" />
            支出分类
          </h4>
          <button
            @click="$emit('add', 1)"
            class="clay-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
          >
            <AppIcon icon="mdi:plus" :size="14" />
            新增
          </button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading.categories" class="flex justify-center py-8">
          <div
            class="w-6 h-6 border-3 border-clay-primary/20 border-t-clay-primary rounded-full animate-spin"
          ></div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="expenseCategories.length === 0" class="text-center py-8">
          <AppIcon
            icon="mdi:folder-open-outline"
            :size="40"
            class="text-clay-text-muted mx-auto mb-2"
          />
          <p class="text-sm text-clay-text-muted">暂无支出分类</p>
        </div>

        <!-- 分类列表 -->
        <div v-else class="space-y-2">
          <div
            v-for="cat in expenseCategories"
            :key="cat.id"
            class="flex items-center justify-between p-3 rounded-clay-sm bg-clay-bg-base transition-all hover:shadow-clay-card group"
          >
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-clay-sm bg-red-50 flex items-center justify-center">
                <AppIcon :icon="cat.icon || 'mdi:circle-outline'" :size="20" class="text-red-500" />
              </div>
              <span class="font-medium text-clay-text-primary text-sm">{{ cat.name }}</span>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="$emit('edit', cat)"
                class="p-1.5 rounded-clay-sm text-clay-text-muted hover:text-clay-primary hover:bg-clay-primary/5 transition-colors"
                title="编辑"
              >
                <AppIcon icon="mdi:pencil-outline" :size="16" />
              </button>
              <button
                @click="$emit('delete', cat.id)"
                class="p-1.5 rounded-clay-sm text-clay-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                title="删除"
              >
                <AppIcon icon="mdi:delete-outline" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 收入分类 -->
      <div class="clay-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h4
            class="text-base font-semibold text-clay-text-primary font-heading flex items-center gap-2"
          >
            <AppIcon icon="mdi:arrow-up-bold" :size="18" class="text-green-500" />
            收入分类
          </h4>
          <button
            @click="$emit('add', 2)"
            class="clay-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
          >
            <AppIcon icon="mdi:plus" :size="14" />
            新增
          </button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading.categories" class="flex justify-center py-8">
          <div
            class="w-6 h-6 border-3 border-clay-primary/20 border-t-clay-primary rounded-full animate-spin"
          ></div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="incomeCategories.length === 0" class="text-center py-8">
          <AppIcon
            icon="mdi:folder-open-outline"
            :size="40"
            class="text-clay-text-muted mx-auto mb-2"
          />
          <p class="text-sm text-clay-text-muted">暂无收入分类</p>
        </div>

        <!-- 分类列表 -->
        <div v-else class="space-y-2">
          <div
            v-for="cat in incomeCategories"
            :key="cat.id"
            class="flex items-center justify-between p-3 rounded-clay-sm bg-clay-bg-base transition-all hover:shadow-clay-card group"
          >
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-clay-sm bg-green-50 flex items-center justify-center">
                <AppIcon
                  :icon="cat.icon || 'mdi:circle-outline'"
                  :size="20"
                  class="text-green-500"
                />
              </div>
              <span class="font-medium text-clay-text-primary text-sm">{{ cat.name }}</span>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="$emit('edit', cat)"
                class="p-1.5 rounded-clay-sm text-clay-text-muted hover:text-clay-primary hover:bg-clay-primary/5 transition-colors"
                title="编辑"
              >
                <AppIcon icon="mdi:pencil-outline" :size="16" />
              </button>
              <button
                @click="$emit('delete', cat.id)"
                class="p-1.5 rounded-clay-sm text-clay-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                title="删除"
              >
                <AppIcon icon="mdi:delete-outline" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端: 单栏切换 -->
    <div class="md:hidden">
      <!-- 支出分类 -->
      <div v-show="mobileTab === 1" class="clay-card p-4">
        <div class="flex items-center justify-between mb-4">
          <h4
            class="text-base font-semibold text-clay-text-primary font-heading flex items-center gap-2"
          >
            <AppIcon icon="mdi:arrow-down-bold" :size="18" class="text-red-500" />
            支出分类
          </h4>
          <button
            @click="$emit('add', 1)"
            class="clay-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
          >
            <AppIcon icon="mdi:plus" :size="14" />
            新增
          </button>
        </div>

        <div v-if="loading.categories" class="flex justify-center py-8">
          <div
            class="w-6 h-6 border-3 border-clay-primary/20 border-t-clay-primary rounded-full animate-spin"
          ></div>
        </div>
        <div v-else-if="expenseCategories.length === 0" class="text-center py-8">
          <AppIcon
            icon="mdi:folder-open-outline"
            :size="40"
            class="text-clay-text-muted mx-auto mb-2"
          />
          <p class="text-sm text-clay-text-muted">暂无支出分类</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="cat in expenseCategories"
            :key="cat.id"
            class="flex items-center justify-between p-3 rounded-clay-sm bg-clay-bg-base"
          >
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-clay-sm bg-red-50 flex items-center justify-center">
                <AppIcon :icon="cat.icon || 'mdi:circle-outline'" :size="20" class="text-red-500" />
              </div>
              <span class="font-medium text-clay-text-primary text-sm">{{ cat.name }}</span>
            </div>
            <div class="flex gap-1">
              <button
                @click="$emit('edit', cat)"
                class="p-2 text-clay-text-muted hover:text-clay-primary"
              >
                <AppIcon icon="mdi:pencil-outline" :size="16" />
              </button>
              <button
                @click="$emit('delete', cat.id)"
                class="p-2 text-clay-text-muted hover:text-red-500"
              >
                <AppIcon icon="mdi:delete-outline" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 收入分类 -->
      <div v-show="mobileTab === 2" class="clay-card p-4">
        <div class="flex items-center justify-between mb-4">
          <h4
            class="text-base font-semibold text-clay-text-primary font-heading flex items-center gap-2"
          >
            <AppIcon icon="mdi:arrow-up-bold" :size="18" class="text-green-500" />
            收入分类
          </h4>
          <button
            @click="$emit('add', 2)"
            class="clay-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
          >
            <AppIcon icon="mdi:plus" :size="14" />
            新增
          </button>
        </div>

        <div v-if="loading.categories" class="flex justify-center py-8">
          <div
            class="w-6 h-6 border-3 border-clay-primary/20 border-t-clay-primary rounded-full animate-spin"
          ></div>
        </div>
        <div v-else-if="incomeCategories.length === 0" class="text-center py-8">
          <AppIcon
            icon="mdi:folder-open-outline"
            :size="40"
            class="text-clay-text-muted mx-auto mb-2"
          />
          <p class="text-sm text-clay-text-muted">暂无收入分类</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="cat in incomeCategories"
            :key="cat.id"
            class="flex items-center justify-between p-3 rounded-clay-sm bg-clay-bg-base"
          >
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-clay-sm bg-green-50 flex items-center justify-center">
                <AppIcon
                  :icon="cat.icon || 'mdi:circle-outline'"
                  :size="20"
                  class="text-green-500"
                />
              </div>
              <span class="font-medium text-clay-text-primary text-sm">{{ cat.name }}</span>
            </div>
            <div class="flex gap-1">
              <button
                @click="$emit('edit', cat)"
                class="p-2 text-clay-text-muted hover:text-clay-primary"
              >
                <AppIcon icon="mdi:pencil-outline" :size="16" />
              </button>
              <button
                @click="$emit('delete', cat.id)"
                class="p-2 text-clay-text-muted hover:text-red-500"
              >
                <AppIcon icon="mdi:delete-outline" :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

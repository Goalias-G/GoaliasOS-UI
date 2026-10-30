<script setup lang="ts">
/**
 * 时间筛选：快捷 pill + 自定义日期区间
 */
import { useLifeRecordStore } from '@/stores/lifeRecord'
import { storeToRefs } from 'pinia'
import type { LifeDatePreset } from '@/types/api/life'

const store = useLifeRecordStore()
const { datePreset, customBeginDate, customEndDate } = storeToRefs(store)

const showCustom = ref(false)
const draftBegin = ref('')
const draftEnd = ref('')

const pills: { key: LifeDatePreset; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'today', label: '今天' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '今年' },
]

async function selectPill(key: LifeDatePreset) {
  showCustom.value = false
  await store.setDatePreset(key)
}

function openCustom() {
  showCustom.value = !showCustom.value
  draftBegin.value = customBeginDate.value || ''
  draftEnd.value = customEndDate.value || ''
}

async function applyCustom() {
  if (!draftBegin.value || !draftEnd.value) return
  if (draftBegin.value > draftEnd.value) {
    const tmp = draftBegin.value
    draftBegin.value = draftEnd.value
    draftEnd.value = tmp
  }
  await store.setCustomDateRange(draftBegin.value, draftEnd.value)
  showCustom.value = false
}
</script>

<template>
  <div class="date-filter flex flex-col gap-2 min-w-0">
    <div class="flex items-center gap-1.5 flex-wrap">
      <button
        v-for="pill in pills"
        :key="pill.key"
        type="button"
        class="px-2.5 py-1 rounded-full text-xs transition-colors whitespace-nowrap"
        :class="
          datePreset === pill.key
            ? 'bg-clay-primary/15 text-clay-primary ring-1 ring-clay-primary/40 font-medium'
            : 'bg-clay-bg-base text-clay-text-secondary hover:bg-clay-primary/10'
        "
        @click="selectPill(pill.key)"
      >
        {{ pill.label }}
      </button>
      <button
        type="button"
        class="px-2.5 py-1 rounded-full text-xs transition-colors whitespace-nowrap inline-flex items-center gap-1"
        :class="
          datePreset === 'custom'
            ? 'bg-clay-primary/15 text-clay-primary ring-1 ring-clay-primary/40 font-medium'
            : 'bg-clay-bg-base text-clay-text-secondary hover:bg-clay-primary/10'
        "
        @click="openCustom"
      >
        <AppIcon icon="mdi:calendar-range" :size="14" />
        <span>自定义</span>
      </button>
      <span
        v-if="datePreset === 'custom' && customBeginDate && customEndDate"
        class="text-[11px] text-clay-text-muted truncate"
      >
        {{ customBeginDate }} ~ {{ customEndDate }}
      </span>
    </div>

    <div
      v-if="showCustom"
      class="flex flex-wrap items-end gap-2 p-2 rounded-clay-sm bg-clay-bg-base"
    >
      <label class="flex flex-col gap-1 text-xs text-clay-text-secondary">
        开始
        <input v-model="draftBegin" type="date" class="clay-input h-9 text-sm px-2" />
      </label>
      <label class="flex flex-col gap-1 text-xs text-clay-text-secondary">
        结束
        <input v-model="draftEnd" type="date" class="clay-input h-9 text-sm px-2" />
      </label>
      <button
        type="button"
        class="clay-btn h-9 px-3 text-sm"
        :disabled="!draftBegin || !draftEnd"
        @click="applyCustom"
      >
        应用
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 时间线记录列表：按日期分组，无限滚动
 */
import { useLifeRecordStore } from '@/stores/lifeRecord'
import { storeToRefs } from 'pinia'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'
import EmptyState from './EmptyState.vue'

const store = useLifeRecordStore()
const {
  records,
  timelineGroups,
  loading,
  pagination,
  activeRecordId,
  searchKeyword,
  categories,
} = storeToRefs(store)

const localSearch = ref(searchKeyword.value)
const listRef = ref<HTMLElement | null>(null)

const isEmpty = computed(() => !loading.value.records && records.value.length === 0)
const hasMore = computed(() => pagination.value.hasMore)

const categoryNameMap = computed(() => {
  const map = new Map<number, string>()
  for (const cat of categories.value) {
    if (cat.id != null) map.set(cat.id, cat.name)
  }
  return map
})

const handleSearch = useDebounceFn(async (keyword: string) => {
  await store.setSearchKeyword(keyword)
}, 300)

watch(localSearch, (v) => handleSearch(v))
watch(searchKeyword, (v) => {
  if (v !== localSearch.value) localSearch.value = v
})

const handleScroll = useThrottleFn((event: Event) => {
  const target = event.target as HTMLElement
  if (
    target.scrollHeight - target.scrollTop - target.clientHeight < 120 &&
    hasMore.value &&
    !loading.value.records
  ) {
    store.loadRecords()
  }
}, 200)

function selectRecord(recordId: number) {
  store.loadRecordDetail(recordId)
}

function formatGroupLabel(date: string): string {
  if (date === '未知日期') return date
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const todayStr = `${y}-${m}-${d}`
  if (date === todayStr) return `今天 · ${date}`

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  if (date === yStr) return `昨天 · ${date}`
  return date
}

const emit = defineEmits<{
  add: []
  delete: [id: number]
}>()
</script>

<template>
  <div class="record-list-container h-full flex flex-col min-h-0">
    <div class="shrink-0 flex items-center gap-2 pb-3">
      <div class="relative flex-1 min-w-0">
        <input
          v-model="localSearch"
          type="text"
          placeholder="搜索标题..."
          class="clay-input h-9 w-full pl-9 pr-8 text-sm"
        />
        <AppIcon
          icon="mdi:magnify"
          :size="16"
          class="absolute left-2.5 top-1/2 -translate-y-1/2 text-clay-text-muted"
        />
        <button
          v-if="localSearch"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-clay-text-muted hover:text-clay-text-primary"
          aria-label="清除搜索"
          @click="localSearch = ''"
        >
          <AppIcon icon="mdi:close" :size="16" />
        </button>
      </div>
      <button
        type="button"
        class="clay-btn h-9 px-3 text-sm gap-1 shrink-0"
        @click="emit('add')"
      >
        <AppIcon icon="mdi:plus" :size="16" />
        <span>新增</span>
      </button>
    </div>

    <div
      ref="listRef"
      class="timeline flex-1 overflow-y-auto min-h-0 pr-1 space-y-4"
      @scroll="handleScroll"
    >
      <template v-if="loading.records && records.length === 0">
        <div v-for="i in 6" :key="i" class="animate-pulse space-y-2">
          <div class="h-4 w-28 bg-gray-200 rounded" />
          <div class="h-14 bg-gray-200 rounded-clay-md" />
        </div>
      </template>

      <template v-else-if="timelineGroups.length > 0">
        <section v-for="group in timelineGroups" :key="group.date" class="timeline-group">
          <div
            class="sticky top-0 z-[1] flex items-center gap-2 py-1.5 mb-1.5 bg-clay-bg-elevated/95 backdrop-blur-sm"
          >
            <span class="w-2 h-2 rounded-full bg-clay-primary shrink-0" />
            <h3 class="text-xs font-semibold text-clay-text-secondary tracking-wide">
              {{ formatGroupLabel(group.date) }}
            </h3>
            <span class="text-[10px] text-clay-text-muted">{{ group.items.length }}</span>
          </div>

          <div class="space-y-1.5 pl-4">
            <button
              v-for="record in group.items"
              :key="record.id"
              type="button"
              class="record-item w-full text-left px-3 py-2.5 rounded-clay-md transition-all text-clay-text-primary"
              :class="{
                'bg-clay-primary/10 ring-1 ring-clay-primary/50 shadow-sm':
                  record.id === activeRecordId,
                'bg-clay-bg-base hover:bg-clay-primary/5 hover:shadow-clay-hover':
                  record.id !== activeRecordId,
                'border border-yellow-300': (record.rating || 0) === 5,
              }"
              @click="selectRecord(record.id!)"
            >
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-sm font-medium text-clay-text-primary line-clamp-1 flex-1">
                  {{ record.title }}
                </h4>
                <AppIcon
                  v-if="record.favoriteFlag === 1"
                  icon="mdi:heart"
                  :size="14"
                  class="text-red-500 shrink-0"
                />
              </div>
              <div class="mt-1 flex items-center gap-2 text-[11px] text-clay-text-muted">
                <span
                  v-if="record.categoryId && categoryNameMap.get(record.categoryId)"
                  class="px-1.5 py-0.5 rounded bg-clay-primary/10 text-clay-primary"
                >
                  {{ categoryNameMap.get(record.categoryId) }}
                </span>
                <span v-if="record.rating && record.rating > 0" class="inline-flex items-center gap-0.5">
                  <AppIcon
                    v-for="star in record.rating"
                    :key="star"
                    icon="mdi:star"
                    :size="11"
                    class="text-yellow-400"
                  />
                </span>
                <span v-if="record.content" class="truncate flex-1 opacity-80">
                  {{ record.content }}
                </span>
              </div>
            </button>
          </div>
        </section>
      </template>

      <EmptyState
        v-else-if="isEmpty"
        type="category"
        :search-text="localSearch"
        @create="emit('add')"
      />

      <div v-if="loading.records && records.length > 0" class="flex justify-center py-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-clay-primary" />
      </div>
      <div
        v-if="!hasMore && records.length > 0"
        class="text-center py-3 text-clay-text-muted text-xs"
      >
        没有更多了
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline::-webkit-scrollbar {
  width: 5px;
}
.timeline::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 3px;
}
</style>

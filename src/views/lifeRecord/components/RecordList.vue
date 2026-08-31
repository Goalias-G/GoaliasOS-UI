/** * RecordList 组件 - 记录列表 * * 功能说明: * - 展示当前分类下的记录列表 * - 支持搜索过滤 * -
支持无限滚动分页加载 * - 支持快捷键导航 * - 提供新增记录入口 */
<script setup lang="ts">
import { useLifeRecordStore } from '@/stores/lifeRecord'
import { storeToRefs } from 'pinia'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'
import EmptyState from './EmptyState.vue'

// ==================== Store ====================
const store = useLifeRecordStore()
const { records, loading, pagination, activeCategoryId } = storeToRefs(store)

// ==================== 状态 ====================
const searchText = ref('')
const selectedIndex = ref(0)
const listRef = ref<HTMLElement | null>(null)

// ==================== 计算属性 ====================
const isEmpty = computed(() => !loading.value.records && records.value.length === 0)

const hasMore = computed(() => pagination.value.hasMore)

// ==================== 搜索功能 ====================
const handleSearch = useDebounceFn(async (keyword: string) => {
  await store.loadRecords({ reset: true, search: keyword })
  selectedIndex.value = 0
}, 300)

watch(searchText, (newValue) => {
  handleSearch(newValue)
})

// ==================== 滚动加载 ====================
const handleScroll = useThrottleFn((event: Event) => {
  const target = event.target as HTMLElement
  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  // 滚动到底部时加载更多
  if (scrollHeight - scrollTop - clientHeight < 100 && hasMore.value && !loading.value.records) {
    store.loadRecords()
  }
}, 200)

// ==================== 记录选择 ====================
function selectRecord(index: number, recordId: number) {
  selectedIndex.value = index
  store.loadRecordDetail(recordId)
}

// ==================== 快捷键导航 ====================
function handleKeydown(event: KeyboardEvent) {
  if (!records.value.length) return

  const tag = (event.target as HTMLElement).tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      if (selectedIndex.value > 0) {
        selectedIndex.value--
        selectRecord(selectedIndex.value, records.value[selectedIndex.value]!.id!)
        scrollToSelected()
      }
      break
    case 'ArrowDown':
      event.preventDefault()
      if (selectedIndex.value < records.value.length - 1) {
        selectedIndex.value++
        selectRecord(selectedIndex.value, records.value[selectedIndex.value]!.id!)
        scrollToSelected()
      }
      break
    case 'n':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        emit('add')
      }
      break
    case 'Delete':
      event.preventDefault()
      if (records.value[selectedIndex.value]) {
        emit('delete', records.value[selectedIndex.value]!.id!)
      }
      break
  }
}

function scrollToSelected() {
  nextTick(() => {
    const selectedElement = listRef.value?.querySelector('.record-item.selected')
    if (selectedElement) {
      selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  })
}

// ==================== Emits ====================
const emit = defineEmits<{
  add: []
  delete: [id: number]
}>()

// ==================== 生命周期 ====================
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// 监听分类切换,重置选中索引
watch(activeCategoryId, () => {
  selectedIndex.value = 0
})
</script>

<template>
  <div
    class="record-list-container h-full flex flex-col bg-clay-bg-elevated rounded-clay-lg shadow-clay-card"
  >
    <!-- 搜索与新增：桌面及移动端均保持 2:1 同行比例。 -->
    <div
      class="record-toolbar grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-2 border-b border-gray-200 p-4"
    >
      <div class="relative min-w-0">
        <input
          v-model="searchText"
          type="text"
          placeholder="搜索记录标题..."
          class="clay-input h-11 w-full pl-10 pr-10"
        />
        <AppIcon
          icon="mdi:magnify"
          :size="20"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-clay-text-muted"
        />
        <button
          v-if="searchText"
          @click="searchText = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-clay-text-muted hover:text-clay-text-primary transition-colors"
          aria-label="清除搜索"
        >
          <AppIcon icon="mdi:close" :size="20" />
        </button>
      </div>
      <button
        @click="emit('add')"
        class="clay-btn h-11 min-w-0 justify-center gap-1.5 px-3 text-sm sm:gap-2 sm:px-4"
      >
        <AppIcon icon="mdi:plus" :size="15" class="shrink-0" />
        <span class="truncate">新增</span>
      </button>
    </div>

    <!-- 记录列表 -->
    <div
      ref="listRef"
      class="record-list flex-1 overflow-y-auto p-4 space-y-3"
      @scroll="handleScroll"
    >
      <!-- 加载骨架屏 -->
      <template v-if="loading.records && records.length === 0">
        <div v-for="i in 5" :key="i" class="animate-pulse bg-gray-200 rounded-clay-md h-24" />
      </template>

      <!-- 记录列表项 -->
      <template v-else-if="records.length > 0">
        <div
          v-for="(record, index) in records"
          :key="record.id"
          :class="[
            'record-item p-4 rounded-clay-md cursor-pointer transition-all duration-200',
            'bg-white hover:shadow-clay-hover',
            {
              'selected shadow-clay-card ring-2 ring-clay-primary': index === selectedIndex,
              'border-2 border-yellow-400': (record.rating || 0) === 5,
            },
          ]"
          @click="selectRecord(index, record.id!)"
        >
          <!-- 标题和日期 -->
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-base font-semibold text-clay-text-primary flex-1 line-clamp-1">
              {{ record.title }}
            </h3>
            <AppIcon
              v-if="record.favoriteFlag === 1"
              icon="mdi:heart"
              :size="18"
              class="text-red-500 ml-2 flex-shrink-0 animate-pulse"
            />
          </div>

          <!-- 日期 -->
          <div class="flex items-center gap-2 text-sm text-clay-text-secondary mb-2">
            <AppIcon icon="mdi:calendar" :size="16" />
            <span>{{ record.recordDate?.split(' ')[0] }}</span>
          </div>

          <!-- 评分 -->
          <div v-if="record.rating && record.rating > 0" class="flex items-center gap-1">
            <AppIcon
              v-for="star in 5"
              :key="star"
              icon="mdi:star"
              :size="16"
              :class="star <= record.rating ? 'text-yellow-400' : 'text-gray-300'"
            />
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <EmptyState
        v-else-if="isEmpty"
        type="category"
        :search-text="searchText"
        @create="emit('add')"
      />

      <!-- 加载更多指示器 -->
      <div
        v-if="loading.records && records.length > 0"
        class="flex items-center justify-center py-4"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-clay-primary" />
      </div>

      <!-- 没有更多数据 -->
      <div
        v-if="!hasMore && records.length > 0"
        class="text-center py-4 text-clay-text-muted text-sm"
      >
        没有更多数据
      </div>
    </div>
  </div>
</template>

<style scoped>
.record-list::-webkit-scrollbar {
  width: 6px;
}

.record-list::-webkit-scrollbar-track {
  background: transparent;
}

.record-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.record-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>

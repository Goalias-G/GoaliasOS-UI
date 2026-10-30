<script setup lang="ts">
/**
 * 紧凑分类 chip 栏：全部 + 分类标签，右键管理
 */
import { useLifeRecordStore } from '@/stores/lifeRecord'
import { storeToRefs } from 'pinia'
import { showSuccess } from '@/utils/toast'

const emit = defineEmits<{
  add: []
  edit: [category: any]
  delete: [id: number]
}>()

const store = useLifeRecordStore()
const { categories, activeCategoryId, loading } = storeToRefs(store)

const isDragging = ref(false)
const draggedIndex = ref(-1)
const dragOverIndex = ref(-1)
const clickDetection = ref({
  isDetecting: false,
  startX: 0,
  startY: 0,
  targetIndex: -1,
})

const showContextMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const contextMenuCategory = ref<any>(null)

function selectCategory(id: number | null) {
  store.switchCategory(id)
}

function handleDragStart(index: number, event: DragEvent) {
  isDragging.value = true
  draggedIndex.value = index
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function handleDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  dragOverIndex.value = index
}

async function handleDragEnd() {
  if (draggedIndex.value === -1 || dragOverIndex.value === -1) {
    isDragging.value = false
    draggedIndex.value = -1
    dragOverIndex.value = -1
    return
  }
  if (draggedIndex.value === dragOverIndex.value) {
    isDragging.value = false
    draggedIndex.value = -1
    dragOverIndex.value = -1
    return
  }
  const items = [...categories.value]
  const [removed] = items.splice(draggedIndex.value, 1)
  items.splice(dragOverIndex.value, 0, removed!)
  const updates = items.map((item, index) => ({
    id: item.id!,
    sortOrder: index + 1,
    name: item.name,
  }))
  await store.updateCategoryOrder(updates)
  showSuccess('排序成功')
  isDragging.value = false
  draggedIndex.value = -1
  dragOverIndex.value = -1
}

function handleMouseDown(index: number, _id: number, event: MouseEvent) {
  if (event.button !== 0) return
  clickDetection.value = {
    isDetecting: true,
    startX: event.clientX,
    startY: event.clientY,
    targetIndex: index,
  }
}

function handleMouseUp(index: number, id: number, event: MouseEvent) {
  if (!clickDetection.value.isDetecting) return
  const dx = Math.abs(event.clientX - clickDetection.value.startX)
  const dy = Math.abs(event.clientY - clickDetection.value.startY)
  clickDetection.value.isDetecting = false
  if (dx < 5 && dy < 5 && !isDragging.value) {
    selectCategory(id)
  }
}

function handleContextMenu(category: any, event: MouseEvent) {
  event.preventDefault()
  contextMenuCategory.value = category
  menuPosition.value = { x: event.clientX, y: event.clientY }
  showContextMenu.value = true
}

function handleEdit() {
  if (contextMenuCategory.value) emit('edit', contextMenuCategory.value)
  closeContextMenu()
}

function handleDelete() {
  if (contextMenuCategory.value) emit('delete', contextMenuCategory.value.id)
  closeContextMenu()
}

function closeContextMenu() {
  showContextMenu.value = false
  contextMenuCategory.value = null
}

function getCategoryCount(categoryId: number): number {
  return categories.value.find((cat) => cat.id === categoryId)?.recordCount || 0
}

onMounted(() => document.addEventListener('click', closeContextMenu))
onUnmounted(() => document.removeEventListener('click', closeContextMenu))
</script>

<template>
  <div class="category-tab flex items-center gap-2 min-w-0">
    <div
      v-if="loading.categories"
      class="flex gap-1.5 overflow-x-auto flex-1 min-w-0 scrollbar-hide"
    >
      <div v-for="i in 4" :key="i" class="h-8 w-16 bg-clay-bg-base rounded-full animate-pulse" />
    </div>
    <div v-else class="flex gap-1.5 overflow-x-auto flex-1 min-w-0 scrollbar-hide py-0.5">
      <button
        type="button"
        class="shrink-0 px-3 py-1.5 rounded-full text-xs transition-all whitespace-nowrap"
        :class="
          activeCategoryId === null
            ? 'bg-clay-primary/15 text-clay-primary ring-1 ring-clay-primary/40 font-medium'
            : 'bg-clay-bg-base text-clay-text-primary hover:bg-clay-primary/10'
        "
        @click="selectCategory(null)"
      >
        全部
      </button>
      <div
        v-for="(category, index) in categories"
        :key="category.id"
        draggable="true"
        :class="[
          'category-tag shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all text-xs whitespace-nowrap select-none',
          {
            'bg-clay-primary/15 text-clay-primary ring-1 ring-clay-primary/40 font-medium':
              category.id === activeCategoryId,
            'bg-clay-bg-base text-clay-text-primary hover:bg-clay-primary/10':
              category.id !== activeCategoryId,
            'opacity-50': isDragging && index === draggedIndex,
            'ring-2 ring-clay-primary': isDragging && index === dragOverIndex,
          },
        ]"
        @mousedown="handleMouseDown(index, category.id!, $event)"
        @mouseup="handleMouseUp(index, category.id!, $event)"
        @contextmenu="handleContextMenu(category, $event)"
        @dragstart="handleDragStart(index, $event)"
        @dragover="handleDragOver(index, $event)"
        @dragend="handleDragEnd"
      >
        <span>{{ category.name }}</span>
        <span
          v-if="getCategoryCount(category.id!) > 0"
          class="px-1.5 py-0.5 rounded-full text-[10px] bg-clay-primary/10 text-clay-primary"
        >
          {{ getCategoryCount(category.id!) }}
        </span>
      </div>
    </div>

    <button
      type="button"
      class="shrink-0 w-8 h-8 rounded-full bg-clay-primary text-clay-text-primary flex items-center justify-center shadow-clay-button hover:shadow-clay-hover"
      title="新增分类"
      @click="emit('add')"
    >
      <AppIcon icon="mdi:plus" :size="18" />
    </button>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showContextMenu"
          class="fixed z-50 min-w-[140px] bg-clay-bg-elevated rounded-clay-md shadow-clay-card py-1"
          :style="{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px` }"
          @click.stop
        >
          <button
            class="w-full px-3 py-2 text-left text-sm text-clay-text-primary hover:bg-clay-primary/10 flex items-center gap-2"
            @click="handleEdit"
          >
            <AppIcon icon="mdi:pencil-outline" :size="16" />
            编辑
          </button>
          <div class="h-px bg-clay-text-muted/20 my-0.5" />
          <button
            class="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
            @click="handleDelete"
          >
            <AppIcon icon="mdi:delete-outline" :size="16" />
            删除
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

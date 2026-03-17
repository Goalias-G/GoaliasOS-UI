<script setup lang="ts">
/**
 * 分类标签页组件
 *
 * 功能说明:
 * - 展示所有分类标签
 * - 支持分类切换
 * - 支持分类搜索
 * - 支持分类管理(新增、编辑、删除)
 * - 支持拖拽排序
 */
import { useLifeRecordStore } from '@/stores/lifeRecord'
import { storeToRefs } from 'pinia'
import EmptyState from './EmptyState.vue'

const emit = defineEmits<{
  add: []
  edit: [category: any]
  delete: [id: number]
}>()

const store = useLifeRecordStore()
const { categories, activeCategoryId, loading } = storeToRefs(store)

// 搜索文本
const searchText = ref('')

// 拖拽状态
const isDragging = ref(false)
const draggedIndex = ref(-1)
const dragOverIndex = ref(-1)

// 右键菜单状态
const showContextMenu = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const contextMenuCategory = ref<any>(null)

// 过滤后的分类列表
const filteredCategories = computed(() => {
  if (!searchText.value) return categories.value
  return categories.value.filter((cat) =>
    cat.name.toLowerCase().includes(searchText.value.toLowerCase()),
  )
})

// 选择分类
function selectCategory(id: number) {
  store.switchCategory(id)
}

// 开始拖拽
function handleDragStart(index: number, event: DragEvent) {
  isDragging.value = true
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

// 拖拽经过
function handleDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  dragOverIndex.value = index
}

// 结束拖拽
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

  // 计算新的排序
  const items = [...categories.value]
  const [removed] = items.splice(draggedIndex.value, 1)
  items.splice(dragOverIndex.value, 0, removed!)

  // 更新 order 值
  const updates = items.map((item, index) => ({
    id: item.id!,
    sortOrder: index + 1,
  }))

  await store.updateCategoryOrder(updates)

  isDragging.value = false
  draggedIndex.value = -1
  dragOverIndex.value = -1
}

// 显示右键菜单
function handleContextMenu(category: any, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()

  // 设置菜单位置
  menuPosition.value = {
    x: event.clientX,
    y: event.clientY,
  }

  contextMenuCategory.value = category
  showContextMenu.value = true
}

// 编辑分类
function handleEdit() {
  if (contextMenuCategory.value) {
    emit('edit', contextMenuCategory.value)
  }
  closeContextMenu()
}

// 删除分类
function handleDelete() {
  if (contextMenuCategory.value) {
    emit('delete', contextMenuCategory.value.id)
  }
  closeContextMenu()
}

// 关闭右键菜单
function closeContextMenu() {
  showContextMenu.value = false
  contextMenuCategory.value = null
}

// 获取分类记录数量（使用 API 返回的 recordCount）
function getCategoryCount(categoryId: number): number {
  const category = categories.value.find((cat) => cat.id === categoryId)
  return category?.recordCount || 0
}

// ==================== 生命周期 ====================
onMounted(() => {
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})
</script>

<template>
  <div class="category-tab bg-clay-bg-elevated rounded-clay-lg shadow-clay-card p-4">
    <!-- 顶部操作栏 -->
    <div class="flex items-center gap-4 mb-4">
      <!-- 搜索框 -->
      <div class="flex-1 relative">
        <input
          v-model="searchText"
          type="text"
          placeholder="搜索分类..."
          class="w-full px-4 py-2 pl-10 bg-clay-bg-base rounded-full text-clay-text-primary placeholder-clay-text-muted focus:outline-none focus:ring-2 focus:ring-clay-primary"
        />
        <AppIcon
          icon="mdi:magnify"
          :size="20"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-clay-text-muted"
        />
      </div>

      <!-- 新增按钮 -->
      <button
        class="px-4 py-2 bg-clay-primary rounded-full shadow-clay-button hover:shadow-clay-hover active:shadow-clay-pressed transition-all duration-200 flex items-center gap-2"
        @click="emit('add')"
      >
        <AppIcon icon="mdi:plus" :size="20" />
        <span>新增分类</span>
      </button>
    </div>

    <!-- 分类标签列表 -->
    <div v-if="loading.categories" class="flex gap-2 overflow-x-auto pb-2">
      <!-- 加载骨架屏 -->
      <div
        v-for="i in 5"
        :key="i"
        class="h-10 w-24 bg-clay-bg-base rounded-full animate-pulse"
      ></div>
    </div>

    <div
      v-else-if="filteredCategories.length > 0"
      class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
    >
      <div
        v-for="(category, index) in filteredCategories"
        :key="category.id"
        :draggable="!searchText"
        :class="[
          'category-tag flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-200 whitespace-nowrap',
          {
            'bg-clay-primary text-white shadow-clay-pressed': category.id === activeCategoryId,
            'bg-clay-bg-base text-clay-text-primary hover:shadow-clay-hover':
              category.id !== activeCategoryId,
            'opacity-50': isDragging && index === draggedIndex,
            'border-2 border-clay-primary': isDragging && index === dragOverIndex,
          },
        ]"
        @click="selectCategory(category.id!)"
        @contextmenu="handleContextMenu(category, $event)"
        @dragstart="handleDragStart(index, $event)"
        @dragover="handleDragOver(index, $event)"
        @dragend="handleDragEnd"
      >
        <span>{{ category.name }}</span>
        <span
          v-if="getCategoryCount(category.id!) > 0"
          :class="[
            'px-2 py-0.5 rounded-full text-xs',
            category.id === activeCategoryId
              ? 'bg-white/20 text-white'
              : 'bg-clay-primary/10 text-clay-primary',
          ]"
        >
          {{ getCategoryCount(category.id!) }}
        </span>
      </div>
    </div>

    <!-- 空状态 -->
    <EmptyState v-else type="category" :search-text="searchText" @create="emit('add')" />

    <!-- 右键菜单 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showContextMenu"
          class="context-menu fixed z-50 min-w-[160px] bg-clay-bg-elevated rounded-clay-md shadow-clay-card py-2"
          :style="{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
          }"
          @click.stop
        >
          <!-- 编辑选项 -->
          <button
            class="menu-item w-full px-4 py-2 text-left text-sm text-clay-text-primary hover:bg-clay-primary/10 transition-colors duration-fast flex items-center gap-2"
            @click="handleEdit"
          >
            <AppIcon icon="mdi:pencil-outline" :size="16" />
            <span>编辑</span>
          </button>

          <!-- 分割线 -->
          <div class="h-px bg-clay-text-muted/20 my-1" />

          <!-- 删除选项 -->
          <button
            class="menu-item w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors duration-fast flex items-center gap-2"
            @click="handleDelete"
          >
            <AppIcon icon="mdi:delete-outline" :size="16" />
            <span>删除</span>
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

/* 右键菜单动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 菜单项样式 */
.menu-item {
  cursor: pointer;
}

.menu-item:active {
  transform: scale(0.98);
}
</style>

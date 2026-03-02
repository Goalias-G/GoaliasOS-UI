/** * KnowledgeSelector 知识库选择器组件 * * 功能说明: * - 对话框形式展示知识库列表 * -
支持搜索功能(防抖优化 300ms) * - 支持分页加载(每页 20 条) * - 显示已关联的知识库标签 * -
处理选择和取消关联事件 */
<script setup lang="ts">
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import type { Knowledge } from '@/types'

// ==================== Props ====================
interface Props {
  /** 是否显示对话框 */
  visible: boolean
}

const props = defineProps<Props>()

// ==================== Emits ====================
const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

// ==================== Store ====================
const sessionStore = useSessionStore()
const { currentKnowledgeId } = storeToRefs(sessionStore)

// ==================== 状态 ====================
/** 知识库列表 */
const knowledgeList = ref<Knowledge[]>([])

/** 搜索关键词 */
const searchKeyword = ref('')

/** 加载状态 */
const loading = ref(false)

/** 分页信息 */
const pagination = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0,
})

/** 是否还有更多数据 */
const hasMore = computed(() => {
  return knowledgeList.value.length < pagination.value.total
})

/** 当前选中的知识库信息 */
const currentKnowledge = computed(() => {
  if (!currentKnowledgeId.value) return null
  return knowledgeList.value.find((k) => k.kid === currentKnowledgeId.value)
})

// ==================== 方法 ====================
/**
 * 加载知识库列表
 */
async function loadKnowledgeList(reset = false) {
  if (loading.value) return

  loading.value = true

  try {
    // 如果是重置,从第一页开始
    if (reset) {
      pagination.value.pageNum = 1
      knowledgeList.value = []
    }

    const response = searchKeyword.value
      ? await sessionStore.searchKnowledge(searchKeyword.value, {
          pageNum: pagination.value.pageNum,
          pageSize: pagination.value.pageSize,
        })
      : await sessionStore.loadKnowledgeList({
          pageNum: pagination.value.pageNum,
          pageSize: pagination.value.pageSize,
        })

    if (reset) {
      knowledgeList.value = response.list
    } else {
      knowledgeList.value.push(...response.list)
    }

    pagination.value.total = response.total
  } catch (error) {
    console.error('加载知识库列表失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 加载更多知识库
 */
function loadMore() {
  if (!hasMore.value || loading.value) return

  pagination.value.pageNum++
  loadKnowledgeList()
}

/**
 * 搜索知识库(防抖优化 300ms)
 */
const handleSearch = useDebounceFn(() => {
  loadKnowledgeList(true)
}, 300)

/**
 * 处理搜索输入
 */
function onSearchInput() {
  handleSearch()
}

/**
 * 处理知识库选择
 */
function handleSelectKnowledge(knowledge: Knowledge) {
  sessionStore.selectKnowledge(knowledge.kid, knowledge.kname)
  closeDialog()
}

/**
 * 处理取消关联
 */
function handleClearKnowledge() {
  sessionStore.selectKnowledge(null)
  closeDialog()
}

/**
 * 检查知识库是否为当前选中
 */
function isActiveKnowledge(knowledgeId: string): boolean {
  return currentKnowledgeId.value === knowledgeId
}

/**
 * 关闭对话框
 */
function closeDialog() {
  emit('update:visible', false)
  emit('close')
}

/**
 * 处理 Escape 键关闭
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeDialog()
  }
}

// ==================== 生命周期 ====================
/** 监听对话框显示状态 */
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      // 对话框打开时加载知识库列表
      loadKnowledgeList(true)
      // 添加键盘事件监听
      window.addEventListener('keydown', handleKeydown)
    } else {
      // 对话框关闭时清空搜索关键词
      searchKeyword.value = ''
      // 移除键盘事件监听
      window.removeEventListener('keydown', handleKeydown)
    }
  },
)

/** 组件卸载时清理 */
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <!-- 遮罩层 -->
  <Transition name="overlay">
    <div
      v-if="visible"
      class="knowledge-selector-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeDialog"
    >
      <!-- 对话框 -->
      <Transition name="dialog">
        <div
          v-if="visible"
          class="knowledge-selector-dialog clay-card shadow-clay-card w-full max-w-2xl max-h-[80vh] flex flex-col"
        >
          <!-- 对话框头部 -->
          <div class="dialog-header px-6 py-4 border-b border-clay-primary/10">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-clay-text-primary">选择知识库</h2>
              <button
                class="close-button p-2 rounded-full hover:bg-clay-primary/10 transition-colors"
                @click="closeDialog"
              >
                <AppIcon icon="mdi:close" :size="20" class="text-clay-text-secondary" />
              </button>
            </div>

            <!-- 搜索框 -->
            <div class="mt-4 relative">
              <AppIcon
                icon="mdi:magnify"
                :size="20"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-clay-text-muted"
              />
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索知识库..."
                class="clay-input w-full pl-10 pr-4 py-2"
                @input="onSearchInput"
              />
            </div>

            <!-- 当前选中的知识库 -->
            <div v-if="currentKnowledge" class="mt-3 flex items-center gap-2">
              <span class="text-xs text-clay-text-muted">当前关联:</span>
              <div
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-clay-primary/10 text-clay-primary text-xs"
              >
                <AppIcon icon="mdi:database" :size="14" />
                <span>{{ currentKnowledge.kname }}</span>
                <button
                  class="hover:bg-clay-primary/20 rounded-full p-0.5 transition-colors"
                  @click="handleClearKnowledge"
                >
                  <AppIcon icon="mdi:close" :size="12" />
                </button>
              </div>
            </div>
          </div>

          <!-- 对话框内容 -->
          <div
            class="dialog-content flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-clay-primary/20 scrollbar-track-transparent px-6 py-4"
          >
            <!-- 加载状态 -->
            <div
              v-if="loading && knowledgeList.length === 0"
              class="flex items-center justify-center py-12"
            >
              <div class="flex flex-col items-center gap-3">
                <AppIcon icon="mdi:loading" :size="32" class="animate-spin text-clay-primary" />
                <span class="text-sm text-clay-text-muted">加载中...</span>
              </div>
            </div>

            <!-- 空状态 -->
            <div
              v-else-if="knowledgeList.length === 0"
              class="flex items-center justify-center py-12"
            >
              <div class="flex flex-col items-center gap-3">
                <AppIcon icon="mdi:database-off" :size="48" class="text-clay-text-muted/50" />
                <span class="text-sm text-clay-text-muted">
                  {{ searchKeyword ? '未找到相关知识库' : '暂无知识库' }}
                </span>
              </div>
            </div>

            <!-- 知识库列表 -->
            <div v-else class="space-y-2">
              <button
                v-for="knowledge in knowledgeList"
                :key="knowledge.kid"
                class="knowledge-item w-full clay-card clay-card-hoverable px-4 py-3 flex items-center gap-3 transition-all duration-200"
                :class="{
                  'ring-2 ring-clay-primary shadow-clay-hover': isActiveKnowledge(knowledge.kid),
                }"
                @click="handleSelectKnowledge(knowledge)"
              >
                <!-- 知识库图标 -->
                <AppIcon
                  icon="mdi:database"
                  :size="24"
                  class="flex-shrink-0"
                  :class="
                    isActiveKnowledge(knowledge.kid)
                      ? 'text-clay-primary'
                      : 'text-clay-text-secondary'
                  "
                />

                <!-- 知识库信息 -->
                <div class="flex flex-col items-start flex-1 min-w-0">
                  <div class="flex items-center gap-2 w-full">
                    <span
                      class="text-sm font-medium truncate"
                      :class="
                        isActiveKnowledge(knowledge.kid)
                          ? 'text-clay-primary'
                          : 'text-clay-text-primary'
                      "
                    >
                      {{ knowledge.kname }}
                    </span>
                    <!-- 选中标记 -->
                    <AppIcon
                      v-if="isActiveKnowledge(knowledge.kid)"
                      icon="mdi:check-circle"
                      :size="16"
                      class="text-clay-primary flex-shrink-0"
                    />
                  </div>
                  <span
                    v-if="knowledge.description"
                    class="text-xs text-clay-text-muted truncate w-full"
                  >
                    {{ knowledge.description }}
                  </span>
                </div>
              </button>

              <!-- 加载更多按钮 -->
              <button
                v-if="hasMore"
                class="w-full py-3 text-sm text-clay-primary hover:bg-clay-primary/5 rounded-clay-md transition-colors"
                :disabled="loading"
                @click="loadMore"
              >
                <span v-if="loading" class="flex items-center justify-center gap-2">
                  <AppIcon icon="mdi:loading" :size="16" class="animate-spin" />
                  加载中...
                </span>
                <span v-else>加载更多</span>
              </button>
            </div>
          </div>

          <!-- 对话框底部 -->
          <div class="dialog-footer px-6 py-4 border-t border-clay-primary/10">
            <div class="flex items-center justify-between">
              <span class="text-xs text-clay-text-muted"> 共 {{ pagination.total }} 个知识库 </span>
              <button class="clay-btn-secondary px-4 py-2" @click="closeDialog">关闭</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
/* ==================== 对话框 ==================== */
.knowledge-selector-dialog {
  border-radius: var(--radius-clay-lg);
  background: var(--clay-bg-elevated);
}

/* ==================== 知识库项 ==================== */
.knowledge-item {
  cursor: pointer;
  user-select: none;
  text-align: left;
}

/* ==================== 遮罩层动画 ==================== */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* ==================== 对话框动画 ==================== */
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.dialog-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

/* ==================== 自定义滚动条 ==================== */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.2);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(124, 58, 237, 0.3);
}

/* ==================== 响应式调整 ==================== */
@media (max-width: 768px) {
  .knowledge-selector-dialog {
    max-height: 90vh;
  }
}
</style>

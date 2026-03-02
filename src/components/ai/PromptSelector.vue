/** * PromptSelector 提示词选择器组件 * * 功能说明: * - 对话框形式展示提示词模板列表 * -
按分类展示模板 * - 显示模板标题、描述和预览 * - 支持搜索功能(防抖优化 300ms) * - 处理模板选择事件(将
content 填充到输入框) */
<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import type { PromptTemplate } from '@/types'

// ==================== Props ====================
interface Props {
  /** 是否显示对话框 */
  visible: boolean
}

const props = defineProps<Props>()

// ==================== Emits ====================
const emit = defineEmits<{
  'update:visible': [value: boolean]
  select: [content: string]
  close: []
}>()

// ==================== 状态 ====================
/** 提示词模板列表 */
const templateList = ref<PromptTemplate[]>([])

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

/** 当前选中的分类 */
const selectedCategory = ref<string | null>(null)

/** 是否还有更多数据 */
const hasMore = computed(() => {
  return templateList.value.length < pagination.value.total
})

/** 按分类分组的模板列表 */
const groupedTemplates = computed(() => {
  const groups: Record<string, PromptTemplate[]> = {}

  templateList.value.forEach((template) => {
    const category = template.category || '未分类'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category]!.push(template)
  })

  return groups
})

/** 分类列表 */
const categories = computed(() => {
  return Object.keys(groupedTemplates.value)
})

/** 当前显示的模板列表 */
const displayTemplates = computed(() => {
  if (selectedCategory.value) {
    return groupedTemplates.value[selectedCategory.value] || []
  }
  return templateList.value
})

// ==================== 方法 ====================
/**
 * 加载提示词模板列表
 */
async function loadTemplateList(reset = false) {
  if (loading.value) return

  loading.value = true

  try {
    // 如果是重置,从第一页开始
    if (reset) {
      pagination.value.pageNum = 1
      templateList.value = []
    }

    // 动态导入 API 模块
    const { promptTemplateApi } = await import('@/api/modules/prompt-template')

    const response = searchKeyword.value
      ? await promptTemplateApi.list({ keyword: searchKeyword.value } as any, {
          pageNum: pagination.value.pageNum,
          pageSize: pagination.value.pageSize,
        })
      : await promptTemplateApi.list(undefined, {
          pageNum: pagination.value.pageNum,
          pageSize: pagination.value.pageSize,
        })

    if (response.code === 200) {
      if (reset) {
        templateList.value = response.data.list
      } else {
        templateList.value.push(...response.data.list)
      }

      pagination.value.total = response.data.total
    } else {
      throw new Error(response.message || '加载提示词模板失败')
    }
  } catch (error) {
    console.error('加载提示词模板失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 加载更多模板
 */
function loadMore() {
  if (!hasMore.value || loading.value) return

  pagination.value.pageNum++
  loadTemplateList()
}

/**
 * 搜索模板(防抖优化 300ms)
 */
const handleSearch = useDebounceFn(() => {
  loadTemplateList(true)
}, 300)

/**
 * 处理搜索输入
 */
function onSearchInput() {
  handleSearch()
}

/**
 * 处理模板选择
 */
function handleSelectTemplate(template: PromptTemplate) {
  emit('select', template.templateContent)
  closeDialog()
}

/**
 * 处理分类选择
 */
function handleSelectCategory(category: string | null) {
  selectedCategory.value = category
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

/**
 * 截断文本
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// ==================== 生命周期 ====================
/** 监听对话框显示状态 */
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      // 对话框打开时加载模板列表
      loadTemplateList(true)
      // 添加键盘事件监听
      window.addEventListener('keydown', handleKeydown)
    } else {
      // 对话框关闭时清空搜索关键词和分类选择
      searchKeyword.value = ''
      selectedCategory.value = null
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
      class="prompt-selector-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="closeDialog"
    >
      <!-- 对话框 -->
      <Transition name="dialog">
        <div
          v-if="visible"
          class="prompt-selector-dialog clay-card shadow-clay-card w-full max-w-4xl max-h-[85vh] flex flex-col"
        >
          <!-- 对话框头部 -->
          <div class="dialog-header px-6 py-4 border-b border-clay-primary/10">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-clay-text-primary">选择提示词模板</h2>
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
                placeholder="搜索提示词模板..."
                class="clay-input w-full pl-10 pr-4 py-2"
                @input="onSearchInput"
              />
            </div>

            <!-- 分类标签 -->
            <div v-if="categories.length > 0 && !searchKeyword" class="mt-3 flex flex-wrap gap-2">
              <button
                class="category-tag px-3 py-1 rounded-full text-xs transition-all duration-200"
                :class="
                  selectedCategory === null
                    ? 'bg-clay-primary text-white'
                    : 'bg-clay-primary/10 text-clay-primary hover:bg-clay-primary/20'
                "
                @click="handleSelectCategory(null)"
              >
                全部
              </button>
              <button
                v-for="category in categories"
                :key="category"
                class="category-tag px-3 py-1 rounded-full text-xs transition-all duration-200"
                :class="
                  selectedCategory === category
                    ? 'bg-clay-primary text-white'
                    : 'bg-clay-primary/10 text-clay-primary hover:bg-clay-primary/20'
                "
                @click="handleSelectCategory(category)"
              >
                {{ category }}
              </button>
            </div>
          </div>

          <!-- 对话框内容 -->
          <div
            class="dialog-content flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-clay-primary/20 scrollbar-track-transparent px-6 py-4"
          >
            <!-- 加载状态 -->
            <div
              v-if="loading && templateList.length === 0"
              class="flex items-center justify-center py-12"
            >
              <div class="flex flex-col items-center gap-3">
                <AppIcon icon="mdi:loading" :size="32" class="animate-spin text-clay-primary" />
                <span class="text-sm text-clay-text-muted">加载中...</span>
              </div>
            </div>

            <!-- 空状态 -->
            <div
              v-else-if="displayTemplates.length === 0"
              class="flex items-center justify-center py-12"
            >
              <div class="flex flex-col items-center gap-3">
                <AppIcon
                  icon="mdi:text-box-remove-outline"
                  :size="48"
                  class="text-clay-text-muted/50"
                />
                <span class="text-sm text-clay-text-muted">
                  {{ searchKeyword ? '未找到相关模板' : '暂无提示词模板' }}
                </span>
              </div>
            </div>

            <!-- 模板列表 -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                v-for="template in displayTemplates"
                :key="template.id"
                class="template-item clay-card clay-card-hoverable p-4 flex flex-col gap-3 text-left transition-all duration-200"
                @click="handleSelectTemplate(template)"
              >
                <!-- 模板头部 -->
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <AppIcon
                      icon="mdi:text-box-outline"
                      :size="20"
                      class="text-clay-primary flex-shrink-0"
                    />
                    <span class="text-sm font-medium text-clay-text-primary truncate">
                      {{ template.templateName }}
                    </span>
                  </div>
                  <span
                    v-if="template.category"
                    class="text-xs px-2 py-0.5 rounded-full bg-clay-primary/10 text-clay-primary flex-shrink-0"
                  >
                    {{ template.category }}
                  </span>
                </div>

                <!-- 模板描述 -->
                <p v-if="template.remark" class="text-xs text-clay-text-muted line-clamp-2">
                  {{ template.remark }}
                </p>

                <!-- 模板预览 -->
                <div
                  class="template-preview mt-2 p-3 rounded-clay-sm bg-clay-bg-base text-xs text-clay-text-secondary font-mono line-clamp-3"
                >
                  {{ truncateText(template.templateContent, 150) }}
                </div>

                <!-- 使用按钮 -->
                <div class="flex items-center justify-end mt-2">
                  <span class="text-xs text-clay-primary flex items-center gap-1">
                    使用此模板
                    <AppIcon icon="mdi:arrow-right" :size="14" />
                  </span>
                </div>
              </button>

              <!-- 加载更多按钮 -->
              <div v-if="hasMore" class="col-span-full">
                <button
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
          </div>

          <!-- 对话框底部 -->
          <div class="dialog-footer px-6 py-4 border-t border-clay-primary/10">
            <div class="flex items-center justify-between">
              <span class="text-xs text-clay-text-muted"> 共 {{ pagination.total }} 个模板 </span>
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
.prompt-selector-dialog {
  border-radius: var(--radius-clay-lg);
  background: var(--clay-bg-elevated);
}

/* ==================== 分类标签 ==================== */
.category-tag {
  cursor: pointer;
  user-select: none;
}

/* ==================== 模板项 ==================== */
.template-item {
  cursor: pointer;
  user-select: none;
}

.template-item:hover .template-preview {
  background: var(--clay-bg-elevated);
}

/* ==================== 模板预览 ==================== */
.template-preview {
  transition: background-color 0.2s ease;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ==================== 行数限制 ==================== */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  .prompt-selector-dialog {
    max-height: 90vh;
  }

  .dialog-content :deep(.grid) {
    grid-template-columns: 1fr;
  }
}
</style>

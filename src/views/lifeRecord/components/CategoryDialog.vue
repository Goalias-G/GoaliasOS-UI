/** * CategoryDialog 组件 - 分类编辑对话框 * * 功能说明： * - 支持新增和编辑分类 * - 表单验证和提交
* - Claymorphism 风格的对话框样式 */
<script setup lang="ts">
import type { LifeCategory, LifeCategoryParams } from '@/types/api/life'

// ==================== Props ====================
interface Props {
  modelValue: boolean
  category?: LifeCategory
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

// ==================== Emits ====================
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: LifeCategoryParams]
}>()

// ==================== 表单状态 ====================
const formData = ref<{
  name: string
}>({
  name: '',
})

const errors = ref<{
  name?: string
}>({})

const isSubmitting = ref(false)

// ==================== 计算属性 ====================
const isEditing = computed(() => !!props.category)

const dialogTitle = computed(() => (isEditing.value ? '编辑分类' : '新增分类'))

// ==================== 表单验证 ====================
function validateForm(): boolean {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = '分类名称不能为空'
    return false
  }

  if (formData.value.name.trim().length > 50) {
    errors.value.name = '分类名称不能超过50个字符'
    return false
  }

  return true
}

// ==================== 表单提交 ====================
async function handleSubmit() {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const submitData: LifeCategoryParams = {
      name: formData.value.name.trim(),
    }

    // 如果是编辑模式，添加 ID
    if (isEditing.value && props.category) {
      submitData.id = props.category.id
    }

    emit('save', submitData)
    handleClose()
  } finally {
    isSubmitting.value = false
  }
}

// ==================== 对话框控制 ====================
function handleClose() {
  emit('update:modelValue', false)
  resetForm()
}

function resetForm() {
  formData.value = {
    name: '',
  }
  errors.value = {}
}

// ==================== 监听器 ====================
watch(
  () => props.modelValue,
  (visible) => {
    if (visible && props.category) {
      // 编辑模式，填充表单数据
      formData.value = {
        name: props.category.name || '',
      }
    } else if (visible) {
      // 新增模式，重置表单
      resetForm()
    }
  },
  { immediate: true },
)

// ==================== 键盘事件 ====================
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleClose()
  } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    handleSubmit()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="modelValue"
            class="w-full max-w-md bg-clay-bg-elevated rounded-clay-lg shadow-clay-card overflow-hidden"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="dialogTitle"
          >
            <!-- 对话框头部 -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 class="text-xl font-bold text-clay-text-primary">{{ dialogTitle }}</h2>
              <button
                @click="handleClose"
                class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="关闭对话框"
              >
                <AppIcon icon="mdi:close" :size="20" class="text-clay-text-secondary" />
              </button>
            </div>

            <!-- 表单内容 -->
            <form @submit.prevent="handleSubmit" class="p-6">
              <!-- 分类名称 -->
              <div>
                <label
                  for="categoryName"
                  class="block text-sm font-medium text-clay-text-primary mb-2"
                >
                  分类名称 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  placeholder="请输入分类名称"
                  :class="[
                    'clay-input w-full',
                    errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : '',
                  ]"
                  maxlength="50"
                  required
                  autofocus
                />
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
              </div>
            </form>

            <!-- 操作按钮 -->
            <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                type="button"
                @click="handleClose"
                class="clay-btn-secondary px-6 py-2.5 text-sm font-medium"
                :disabled="isSubmitting"
              >
                取消
              </button>
              <button
                @click="handleSubmit"
                class="clay-btn px-6 py-2.5 text-sm font-medium flex items-center gap-2"
                :disabled="isSubmitting"
              >
                <AppIcon v-if="isSubmitting" icon="mdi:loading" :size="16" class="animate-spin" />
                <span>{{ isEditing ? '保存' : '创建' }}</span>
              </button>
            </div>

            <!-- 快捷键提示 -->
            <div class="px-6 pb-4">
              <p class="text-xs text-clay-text-muted">
                快捷键：<kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> 关闭，
                <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> 提交
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
kbd {
  font-family:
    ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
}
</style>

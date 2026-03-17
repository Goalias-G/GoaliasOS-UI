/** * RecordDialog 组件 - 记录编辑对话框 * * 功能说明： * - 支持新增和编辑记录 * - 使用 FileUpload
组件进行图片上传 * - 编辑时展示已有图片，支持删除 * - 表单验证和提交 * - Claymorphism
风格的对话框样式 */
<script setup lang="ts">
import type { LifeRecord, LifeRecordParams } from '@/types/api/life'
import { useLifeRecordStore } from '@/stores/lifeRecord'
import { storeToRefs } from 'pinia'
import FileUpload from '@/components/os-config/FileUpload.vue'
import { ossApi } from '@/api/modules/oss-file'
import { showSuccess, showError } from '@/utils/toast'

// ==================== Props ====================
interface Props {
  modelValue: boolean
  record?: LifeRecord
  categoryId?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

// ==================== Emits ====================
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// ==================== Store ====================
const store = useLifeRecordStore()
const { categories } = storeToRefs(store)

// ==================== 表单状态 ====================
const formData = ref<{
  categoryId: number | null
  title: string
  content: string
  recordDate: string
  attachsId?: string
  remark?: string
}>({
  categoryId: null,
  title: '',
  content: '',
  recordDate: new Date().toISOString().split('T')[0]!,
  remark: '',
})

// 已上传的新文件 ID（本次上传的）
const newUploadedFileIds = ref<string[]>([])

// 原有的文件 ID（编辑模式下从记录中获取）
const originalFileIds = ref<string[]>([])

// 已删除的原有文件 ID
const deletedOriginalFileIds = ref<string[]>([])

// 已上传的文件信息（用于显示）
const uploadedFiles = ref<Array<{ id: string; url: string; name: string }>>([])

const errors = ref<{
  categoryId?: string
  title?: string
  content?: string
}>({})

const isSubmitting = ref(false)

// ==================== 计算属性 ====================
const isEditing = computed(() => !!props.record)

const dialogTitle = computed(() => (isEditing.value ? '编辑记录' : '新增记录'))

const contentLength = computed(() => formData.value.content.length)

const maxContentLength = 5000

// 最终的文件 ID 列表（原有的 - 已删除的 + 新上传的）
const finalFileIds = computed(() => {
  const remaining = originalFileIds.value.filter((id) => !deletedOriginalFileIds.value.includes(id))
  return [...remaining, ...newUploadedFileIds.value]
})

// ==================== 表单验证 ====================
function validateForm(): boolean {
  errors.value = {}

  if (!formData.value.categoryId) {
    errors.value.categoryId = '请选择分类'
    return false
  }

  if (!formData.value.title.trim()) {
    errors.value.title = '标题不能为空'
    return false
  }

  if (formData.value.title.trim().length > 100) {
    errors.value.title = '标题不能超过100个字符'
    return false
  }

  if (!formData.value.content.trim()) {
    errors.value.content = '内容不能为空'
    return false
  }

  if (formData.value.content.trim().length > maxContentLength) {
    errors.value.content = `内容不能超过${maxContentLength}个字符`
    return false
  }

  return true
}

// ==================== 文件上传处理 ====================
async function handleFileUpload(file: File): Promise<void> {
  try {
    const response = await ossApi.upload(file)
    if (response.code === 200 && response.data) {
      const fileId = response.data.ossId.toString()
      const fileUrl = response.data.url || URL.createObjectURL(file)

      // 保存新上传的文件 ID
      newUploadedFileIds.value.push(fileId)

      // 添加到显示列表
      uploadedFiles.value.push({
        id: fileId,
        url: fileUrl,
        name: file.name,
      })
    } else {
      throw new Error(response.message || '文件上传失败')
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    showError('文件上传失败')
    throw error
  }
}

// 删除已上传的文件
async function handleRemoveFile(fileId: string): Promise<void> {
  try {
    // 如果是原有文件，标记为已删除
    if (originalFileIds.value.includes(fileId)) {
      deletedOriginalFileIds.value.push(fileId)
    }
    // 如果是新上传的文件，从列表中移除并删除
    else if (newUploadedFileIds.value.includes(fileId)) {
      const response = await ossApi.remove([Number(fileId)])
      if (response.code === 200) {
        newUploadedFileIds.value = newUploadedFileIds.value.filter((id) => id !== fileId)
      } else {
        throw new Error(response.message || '删除文件失败')
      }
    }

    // 从显示列表中移除
    uploadedFiles.value = uploadedFiles.value.filter((f) => f.id !== fileId)
  } catch (error) {
    console.error('删除文件失败:', error)
    showError('删除文件失败')
  }
}

// ==================== 表单提交 ====================
async function handleSubmit() {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const submitData: LifeRecordParams = {
      categoryId: formData.value.categoryId!,
      title: formData.value.title.trim(),
      content: formData.value.content.trim(),
      recordDate: formData.value.recordDate,
    }

    // 如果是编辑模式，添加 ID
    if (isEditing.value && props.record) {
      submitData.id = props.record.id
    }

    // 添加附件 ID（多个以英文逗号分隔）
    if (finalFileIds.value.length > 0) {
      submitData.attachsId = finalFileIds.value.join(',')
    }

    // 添加备注
    if (formData.value.remark?.trim()) {
      submitData.remark = formData.value.remark.trim()
    }

    // 调用 store 方法
    if (isEditing.value) {
      await store.editRecord(submitData)
      showSuccess('记录更新成功')
    } else {
      await store.addRecord(submitData)
      showSuccess('记录创建成功')
    }

    handleClose()
  } catch (error: any) {
    showError(error.message || '操作失败')
  } finally {
    isSubmitting.value = false
  }
}

// ==================== 对话框控制 ====================
async function handleClose() {
  // 如果是新增模式且有未保存的上传文件，删除它们
  if (!isEditing.value && newUploadedFileIds.value.length > 0) {
    try {
      const fileIds = newUploadedFileIds.value.map((id) => Number(id))
      await ossApi.remove(fileIds)
    } catch (error) {
      console.error('清理上传文件失败:', error)
    }
  }

  emit('update:modelValue', false)
  resetForm()
}

function resetForm() {
  formData.value = {
    categoryId: props.categoryId || null,
    title: '',
    content: '',
    recordDate: new Date().toISOString().split('T')[0]!,
    remark: '',
  }
  newUploadedFileIds.value = []
  originalFileIds.value = []
  deletedOriginalFileIds.value = []
  uploadedFiles.value = []
  errors.value = {}
}

// ==================== 监听器 ====================
watch(
  () => props.modelValue,
  (visible) => {
    if (visible && props.record) {
      // 编辑模式，填充表单数据
      formData.value = {
        categoryId: props.record.categoryId || null,
        title: props.record.title || '',
        content: props.record.content || '',
        recordDate:
          props.record.recordDate?.split(' ')[0]?.split('T')[0] ||
          new Date().toISOString().split('T')[0]!,
        remark: props.record.remark || '',
      }

      // 加载原有的附件
      if (props.record.attachsId) {
        originalFileIds.value = props.record.attachsId.split(',').filter((id) => id.trim())

        // 如果有 attachsUrls，使用它们来显示图片
        if (props.record.attachsUrls && props.record.attachsUrls.length > 0) {
          uploadedFiles.value = originalFileIds.value.map((id, index) => ({
            id,
            url: props.record!.attachsUrls![index] || '',
            name: `图片 ${index + 1}`,
          }))
        }
      }

      // 清空新上传和删除的记录
      newUploadedFileIds.value = []
      deletedOriginalFileIds.value = []
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
            class="w-full max-w-2xl max-h-[90vh] bg-clay-bg-elevated rounded-clay-lg shadow-clay-card flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="dialogTitle"
          >
            <!-- 对话框头部 -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
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
            <div class="flex-1 overflow-y-auto min-h-0">
              <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
                <!-- 分类选择 -->
                <div>
                  <label
                    for="recordCategory"
                    class="block text-sm font-medium text-clay-text-primary mb-2"
                  >
                    分类 <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="formData.categoryId"
                    :class="[
                      'clay-input w-full',
                      errors.categoryId
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : '',
                    ]"
                    required
                  >
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                  <p v-if="errors.categoryId" class="mt-1 text-sm text-red-600">
                    {{ errors.categoryId }}
                  </p>
                </div>

                <!-- 标题 -->
                <div>
                  <label
                    for="recordTitle"
                    class="block text-sm font-medium text-clay-text-primary mb-2"
                  >
                    标题 <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.title"
                    type="text"
                    placeholder="请输入记录标题"
                    :class="[
                      'clay-input w-full',
                      errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : '',
                    ]"
                    maxlength="100"
                    required
                  />
                  <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
                </div>

                <!-- 记录日期 -->
                <div>
                  <label
                    for="recordDate"
                    class="block text-sm font-medium text-clay-text-primary mb-2"
                  >
                    记录日期
                  </label>
                  <input v-model="formData.recordDate" type="date" class="clay-input w-full" />
                </div>

                <!-- 内容 -->
                <div>
                  <label
                    for="recordContent"
                    class="block text-sm font-medium text-clay-text-primary mb-2"
                  >
                    内容 <span class="text-red-500">*</span>
                    <span class="text-clay-text-muted font-normal">
                      ({{ contentLength }}/{{ maxContentLength }})
                    </span>
                  </label>
                  <textarea
                    v-model="formData.content"
                    placeholder="请输入记录内容..."
                    :class="[
                      'clay-input w-full resize-none',
                      errors.content
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : '',
                    ]"
                    rows="6"
                    :maxlength="maxContentLength"
                    required
                  />
                  <p v-if="errors.content" class="mt-1 text-sm text-red-600">
                    {{ errors.content }}
                  </p>
                </div>

                <!-- 图片上传 -->
                <div>
                  <label class="block text-sm font-medium text-clay-text-primary mb-2">
                    图片 <span class="text-clay-text-muted font-normal">(可选)</span>
                  </label>

                  <!-- 已上传的图片列表 -->
                  <div v-if="uploadedFiles.length > 0" class="mb-4 grid grid-cols-3 gap-3">
                    <div
                      v-for="file in uploadedFiles"
                      :key="file.id"
                      class="relative group aspect-square rounded-clay-sm overflow-hidden bg-gray-100"
                    >
                      <img :src="file.url" :alt="file.name" class="w-full h-full object-cover" />
                      <button
                        type="button"
                        @click="handleRemoveFile(file.id)"
                        class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        title="删除图片"
                      >
                        <AppIcon icon="mdi:close" :size="14" />
                      </button>
                    </div>
                  </div>

                  <!-- 文件上传组件 -->
                  <FileUpload
                    accept="image/*"
                    :multiple="true"
                    :max-size="10"
                    @upload="handleFileUpload"
                  />
                </div>

                <!-- 备注 -->
                <div>
                  <label
                    for="recordRemark"
                    class="block text-sm font-medium text-clay-text-primary mb-2"
                  >
                    备注 <span class="text-clay-text-muted font-normal">(可选)</span>
                  </label>
                  <textarea
                    v-model="formData.remark"
                    placeholder="添加备注信息..."
                    class="clay-input w-full resize-none"
                    rows="3"
                    maxlength="500"
                  />
                </div>
              </form>
            </div>

            <!-- 操作按钮 -->
            <div
              class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 shrink-0 bg-clay-bg-elevated"
            >
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
            <div class="px-6 pb-4 shrink-0 bg-clay-bg-elevated">
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

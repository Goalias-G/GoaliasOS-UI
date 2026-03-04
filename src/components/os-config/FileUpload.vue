<script setup lang="ts">
/**
 * 文件上传组件
 *
 * 功能说明：
 * - 支持拖拽上传和点击选择文件
 * - 文件类型验证（.txt, .pdf, .doc, .docx, .md）
 * - 文件大小验证（最大 1.5GB）
 * - 显示文件名和大小
 * - 显示上传进度条
 * - 使用 Claymorphism 设计风格
 */

interface Props {
  /** 是否正在上传 */
  uploading?: boolean
  /** 上传进度 (0-100) */
  progress?: number
  /** 最大文件大小（字节），默认 10MB */
  maxSize?: number
  /** 允许的文件类型 */
  acceptTypes?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  uploading: false,
  progress: 0,
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptTypes: () => ['.txt', '.pdf', '.doc', '.docx', '.md'],
})

const emit = defineEmits<{
  upload: [file: File]
}>()

// ==================== 状态 ====================
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const errorMessage = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// ==================== 计算属性 ====================
const acceptString = computed(() => props.acceptTypes.join(','))

const formattedFileSize = computed(() => {
  if (!selectedFile.value) return ''
  return formatFileSize(selectedFile.value.size)
})

// ==================== 方法 ====================
/**
 * 格式化文件大小
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 验证文件
 */
function validateFile(file: File): boolean {
  errorMessage.value = ''

  // 验证文件大小
  if (file.size > props.maxSize) {
    errorMessage.value = `文件大小不能超过 ${formatFileSize(props.maxSize)}`
    return false
  }

  // 验证文件类型
  const fileName = file.name.toLowerCase()
  const isValidType = props.acceptTypes.some((type) => fileName.endsWith(type))
  if (!isValidType) {
    errorMessage.value = `只支持以下文件类型: ${props.acceptTypes.join(', ')}`
    return false
  }

  return true
}

/**
 * 处理文件选择
 */
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && validateFile(file)) {
    selectedFile.value = file
    emit('upload', file)
  }
  // 清空 input 值，允许重复选择同一文件
  if (target) {
    target.value = ''
  }
}

/**
 * 处理拖拽进入
 */
function handleDragEnter(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

/**
 * 处理拖拽离开
 */
function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
}

/**
 * 处理拖拽悬停
 */
function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

/**
 * 处理文件拖放
 */
function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files[0]
  if (file && validateFile(file)) {
    selectedFile.value = file
    emit('upload', file)
  }
}

/**
 * 触发文件选择
 */
function triggerFileSelect() {
  fileInputRef.value?.click()
}

/**
 * 清除选中的文件
 */
function clearFile() {
  selectedFile.value = null
  errorMessage.value = ''
}

// 监听上传状态，上传完成后清除文件
watch(
  () => props.uploading,
  (newVal, oldVal) => {
    // 从上传中变为非上传中，且进度为 100，说明上传完成
    if (oldVal && !newVal && props.progress === 100) {
      clearFile()
    }
  },
)
</script>

<template>
  <div class="file-upload-container">
    <!-- 拖拽上传区域 -->
    <div
      :class="[
        'upload-area',
        'bg-clay-bg-elevated',
        'rounded-clay-md',
        'shadow-clay-card',
        'border-2 border-dashed',
        'transition-all duration-300',
        {
          'border-clay-primary bg-clay-primary/5': isDragging,
          'border-gray-300': !isDragging && !errorMessage,
          'border-red-400 bg-red-50': errorMessage,
        },
      ]"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @click="triggerFileSelect"
    >
      <div class="upload-content">
        <!-- 上传图标 -->
        <div class="upload-icon">
          <AppIcon
            :icon="errorMessage ? 'mdi:alert-circle' : 'mdi:cloud-upload'"
            :size="48"
            :class="errorMessage ? 'text-red-500' : 'text-clay-primary'"
          />
        </div>

        <!-- 上传提示文本 -->
        <div class="upload-text">
          <p class="text-lg font-medium text-clay-text-primary">
            {{ isDragging ? '释放以上传文件' : '拖拽文件到此处或点击选择' }}
          </p>
          <p class="text-sm text-clay-text-muted mt-2">支持格式: {{ acceptTypes.join(', ') }}</p>
          <p class="text-sm text-clay-text-muted">最大文件大小: {{ formatFileSize(maxSize) }}</p>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
          <p class="text-sm text-red-600 font-medium">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- 隐藏的文件输入框 -->
      <input
        ref="fileInputRef"
        type="file"
        :accept="acceptString"
        class="hidden"
        @change="handleFileSelect"
      />
    </div>

    <!-- 已选择的文件信息 -->
    <div v-if="selectedFile" class="file-info bg-clay-bg-elevated rounded-clay-md shadow-clay-card">
      <div class="file-details">
        <AppIcon icon="mdi:file-document" :size="24" class="text-clay-primary" />
        <div class="file-meta">
          <p class="text-sm font-medium text-clay-text-primary">{{ selectedFile.name }}</p>
          <p class="text-xs text-clay-text-muted">{{ formattedFileSize }}</p>
        </div>
        <button
          v-if="!uploading"
          type="button"
          class="clear-button"
          @click.stop="clearFile"
          aria-label="清除文件"
        >
          <AppIcon icon="mdi:close" :size="20" class="text-clay-text-muted hover:text-red-500" />
        </button>
      </div>

      <!-- 上传进度条 -->
      <div v-if="uploading" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <p class="text-xs text-clay-text-muted text-center mt-2">上传中... {{ progress }}%</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-upload-container {
  width: 100%;
}

.upload-area {
  padding: 3rem 2rem;
  cursor: pointer;
  user-select: none;
}

.upload-area:hover {
  border-color: var(--clay-primary);
  background-color: rgba(124, 58, 237, 0.02);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  pointer-events: none;
}

.upload-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-text {
  text-align: center;
}

.error-message {
  margin-top: 0.5rem;
}

.file-info {
  margin-top: 1rem;
  padding: 1rem;
}

.file-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-meta {
  flex: 1;
  min-width: 0;
}

.file-meta p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-button {
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.clear-button:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.progress-container {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--clay-bg-base);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--clay-primary), var(--clay-primary-light));
  border-radius: 9999px;
  transition: width 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-area {
    padding: 2rem 1rem;
  }

  .upload-text p:first-child {
    font-size: 1rem;
  }
}
</style>

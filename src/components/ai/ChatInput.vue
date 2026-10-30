<script setup lang="ts">
/**
 * ChatInput 输入框组件
 *
 * 功能说明：
 * - Composer 风格：框内「+」打开快捷指令菜单
 * - 选中场景后显示可关闭标签；关闭后回到默认对话（菜单不展示默认项）
 * - 生活记录场景额外显示附件按钮，支持多文件上传
 * - Enter 发送，Shift+Enter 换行；Claymorphism 设计
 */

import { onClickOutside } from '@vueuse/core'
import { useSessionStore } from '@/stores/session'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { ossApi } from '@/api/modules/oss-file'
import { showError, showWarning } from '@/utils/toast'
import {
  CHAT_SCENE_OPTIONS,
  LIFE_RECORD_SCENE,
  getChatSceneOption,
  type ChatSendPayload,
} from '@/constants/chatScenes'

// ==================== Props 定义 ====================
interface Props {
  disabled?: boolean
  isStreaming?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  isStreaming: false,
  placeholder: '...有点什么想法？',
})

// ==================== Emits 定义 ====================
const emit = defineEmits<{
  send: [payload: ChatSendPayload]
  stop: []
}>()

// ==================== Store ====================
const sessionStore = useSessionStore()
const { currentModel, currentKnowledgeName, enableWebSearch } = storeToRefs(sessionStore)

const userStore = useUserStore()
const { userBalance } = storeToRefs(userStore)

// ==================== 状态 ====================
const inputValue = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isRefreshing = ref(false)

const selectedScene = ref<string | null>(null)
const sceneMenuOpen = ref(false)
const sceneMenuRef = ref<HTMLElement | null>(null)

interface UploadedFileItem {
  id: number
  url: string
  name: string
  type: 'image' | 'video'
}

const uploadedFiles = ref<UploadedFileItem[]>([])
const isUploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// ==================== 计算属性 ====================
const currentSceneOption = computed(() => getChatSceneOption(selectedScene.value))

const allowUpload = computed(() => currentSceneOption.value.allowUpload)

const canSend = computed(() => {
  return (
    inputValue.value.trim().length > 0 &&
    !props.disabled &&
    !props.isStreaming &&
    !isUploading.value
  )
})

const isInputDisabled = computed(() => props.disabled || props.isStreaming)

const supportsWebSearch = computed(() => currentModel.value?.enableSearch === 1)

const scenePlaceholder = computed(() => {
  if (isInputDisabled.value) return '发送中，请稍候...'
  if (selectedScene.value === LIFE_RECORD_SCENE) {
    return '描述要记录的生活事件，可附带图片/视频...'
  }
  if (selectedScene.value) {
    return `${currentSceneOption.value.description}`
  }
  return props.placeholder
})

// ==================== 方法 ====================
function adjustHeight() {
  if (!textareaRef.value) return
  textareaRef.value.style.height = 'auto'
  const maxHeight = 24 * 5
  textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, maxHeight)}px`
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleSend() {
  if (!canSend.value) return
  const content = inputValue.value.trim()
  if (!content) return

  emit('send', {
    content,
    scene: selectedScene.value,
    fileIds:
      allowUpload.value && uploadedFiles.value.length > 0
        ? uploadedFiles.value.map((f) => f.id)
        : undefined,
  })
  clear()
  clearUploadedFiles()
}

function handleStop() {
  emit('stop')
}

function clear() {
  inputValue.value = ''
  nextTick(() => adjustHeight())
}

function clearUploadedFiles() {
  uploadedFiles.value = []
}

function toggleWebSearch() {
  sessionStore.toggleWebSearch()
}

async function handleRefreshBalance() {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await userStore.fetchUserInfo()
    const sessionId = sessionStore.currentSessionId
    if (sessionId !== null) {
      sessionStore.clearMessageCache(sessionId)
      await sessionStore.loadMessages(sessionId)
    }
  } catch (error) {
    console.error('刷新余额或当前会话失败:', error)
  } finally {
    isRefreshing.value = false
  }
}

function toggleSceneMenu() {
  if (isInputDisabled.value) return
  sceneMenuOpen.value = !sceneMenuOpen.value
}

function selectScene(scene: string) {
  const prevAllowUpload = allowUpload.value
  selectedScene.value = scene
  sceneMenuOpen.value = false
  if (prevAllowUpload && !getChatSceneOption(scene).allowUpload) {
    void discardUploadedFiles()
  }
}

/** 关闭场景标签 → 回到默认对话 */
function clearScene() {
  selectedScene.value = null
  sceneMenuOpen.value = false
  void discardUploadedFiles()
}

async function discardUploadedFiles() {
  if (uploadedFiles.value.length === 0) return
  const ids = uploadedFiles.value.map((f) => f.id)
  try {
    await ossApi.remove(ids)
  } catch (error) {
    console.error('清理未发送附件失败:', error)
  } finally {
    uploadedFiles.value = []
  }
}

function triggerFilePick() {
  if (!allowUpload.value || isInputDisabled.value || isUploading.value) return
  fileInputRef.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return
  for (const file of Array.from(files)) {
    await uploadOneFile(file)
  }
  input.value = ''
}

async function uploadOneFile(file: File) {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')
  if (!isImage && !isVideo) {
    showWarning('仅支持图片或 MP4 视频')
    return
  }
  const maxMb = isVideo ? 500 : 20
  if (file.size > maxMb * 1024 * 1024) {
    showWarning(`文件过大，上限 ${maxMb}MB`)
    return
  }

  isUploading.value = true
  try {
    const response = await ossApi.upload(file)
    if (response.code === 200 && response.data) {
      uploadedFiles.value.push({
        id: response.data.ossId,
        url: response.data.url || URL.createObjectURL(file),
        name: file.name,
        type: isVideo ? 'video' : 'image',
      })
    } else {
      throw new Error(response.message || '文件上传失败')
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    showError('文件上传失败')
  } finally {
    isUploading.value = false
  }
}

async function handleRemoveFile(fileId: number) {
  try {
    await ossApi.remove([fileId])
  } catch (error) {
    console.error('删除附件失败:', error)
  } finally {
    uploadedFiles.value = uploadedFiles.value.filter((f) => f.id !== fileId)
  }
}

onClickOutside(sceneMenuRef, () => {
  sceneMenuOpen.value = false
})

watch(inputValue, () => nextTick(() => adjustHeight()))
onMounted(() => adjustHeight())
</script>

<template>
  <div class="chat-input-wrapper">
    <!-- Composer 主容器 -->
    <div
      class="composer bg-clay-bg-elevated rounded-clay-lg shadow-clay-card border border-transparent focus-within:border-clay-primary/30 transition-colors"
    >
      <!-- 附件预览 -->
      <div
        v-if="allowUpload && uploadedFiles.length > 0"
        class="px-3 pt-3 flex flex-wrap gap-2.5"
      >
        <div
          v-for="file in uploadedFiles"
          :key="file.id"
          class="relative w-14 h-14"
        >
          <div
            class="w-full h-full rounded-lg overflow-hidden bg-clay-bg-base ring-1 ring-black/10"
          >
            <img
              v-if="file.type === 'image'"
              :src="file.url"
              :alt="file.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <AppIcon icon="mdi:video" :size="22" class="text-clay-text-muted" />
            </div>
          </div>
          <button
            type="button"
            class="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-white text-clay-text-secondary shadow-md ring-1 ring-black/10 flex items-center justify-center hover:bg-red-500 hover:text-red-400 hover:ring-red-500 transition-colors"
            title="删除附件"
            @click="handleRemoveFile(file.id)"
          >
            <AppIcon icon="mdi:close" :size="14" />
          </button>
        </div>
      </div>

      <!-- 已选场景标签 -->
      <div v-if="selectedScene" class="px-3 pt-3 flex items-center">
        <span
          class="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-full text-xs font-medium bg-clay-primary/10 text-clay-primary max-w-full"
        >
          <AppIcon
            :icon="currentSceneOption.icon"
            :size="14"
            :class="currentSceneOption.accentClass"
            class="shrink-0"
          />
          <span class="truncate">{{ currentSceneOption.label }}</span>
          <button
            type="button"
            class="shrink-0 w-4 h-4 rounded-full flex items-center justify-center hover:bg-clay-primary/20 transition-colors"
            title="取消快捷指令"
            :disabled="isInputDisabled"
            @click="clearScene"
          >
            <AppIcon icon="mdi:close" :size="12" />
          </button>
        </span>
      </div>

      <!-- 文本输入 -->
      <div class="px-3 pt-2">
        <textarea
          ref="textareaRef"
          v-model="inputValue"
          :placeholder="scenePlaceholder"
          :disabled="isInputDisabled"
          class="composer-textarea w-full resize-none bg-transparent border-0 outline-none text-sm text-clay-text-primary placeholder:text-clay-text-muted"
          :class="{ 'opacity-50 cursor-not-allowed': isInputDisabled }"
          rows="1"
          @keydown="handleKeydown"
        />
      </div>

      <!-- 底部工具栏：+ / 附件 / 发送 -->
      <div class="px-2 pb-2 pt-1 flex items-center justify-between gap-2">
        <div ref="sceneMenuRef" class="relative flex items-center gap-0.5">
          <!-- 「+」快捷指令 -->
          <button
            type="button"
            class="composer-icon-btn"
            :class="{ 'bg-clay-primary/10 text-clay-primary': sceneMenuOpen }"
            :disabled="isInputDisabled"
            title="快捷指令"
            @click="toggleSceneMenu"
          >
            <AppIcon icon="mdi:plus" :size="20" />
          </button>

          <!-- 生活记录：附件（多文件） -->
          <button
            v-if="allowUpload"
            type="button"
            class="composer-icon-btn"
            :disabled="isInputDisabled || isUploading"
            title="添加附件"
            @click="triggerFilePick"
          >
            <AppIcon
              :icon="isUploading ? 'mdi:loading' : 'mdi:paperclip'"
              :size="18"
              :class="{ 'animate-spin': isUploading }"
            />
          </button>

          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            accept="image/*,video/mp4"
            multiple
            @change="handleFileChange"
          />

          <!-- 弹出菜单（不含默认对话） -->
          <div
            v-if="sceneMenuOpen"
            class="absolute bottom-full left-0 mb-2 w-72 clay-card shadow-clay-hover z-20 py-1.5 max-h-80 overflow-y-auto"
          >
            <p class="px-3 py-1.5 text-[11px] uppercase tracking-wide text-clay-text-muted">
              快捷指令
            </p>
            <button
              v-for="option in CHAT_SCENE_OPTIONS"
              :key="option.scene!"
              type="button"
              class="w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-clay-primary/5 transition-colors"
              :class="{ 'bg-clay-primary/10': selectedScene === option.scene }"
              @click="selectScene(option.scene!)"
            >
              <span
                class="w-8 h-8 rounded-lg bg-clay-bg-base flex items-center justify-center shrink-0"
              >
                <AppIcon :icon="option.icon" :size="18" :class="option.accentClass" />
              </span>
              <span class="min-w-0">
                <span class="block text-sm font-medium text-clay-text-primary">{{
                  option.label
                }}</span>
                <span class="block text-xs text-clay-text-muted leading-snug truncate">{{
                  option.description
                }}</span>
              </span>
            </button>
          </div>
        </div>

        <!-- 发送 / 停止 -->
        <div class="shrink-0">
          <button
            v-if="isStreaming"
            type="button"
            class="composer-send-btn composer-send-btn--stop"
            @click="handleStop"
          >
            <AppIcon icon="mdi:stop" :size="18" />
          </button>
          <button
            v-else
            type="button"
            class="composer-send-btn"
            :disabled="!canSend || disabled"
            :class="{
              'opacity-40 cursor-not-allowed': !canSend || disabled,
              'animate-breathe': disabled,
            }"
            @click="handleSend"
          >
            <AppIcon
              :icon="disabled ? 'mdi:loading' : 'mdi:arrow-up'"
              :size="18"
              :class="{ 'animate-spin': disabled }"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- 底部辅助信息 -->
    <div class="mt-2 flex items-center justify-between gap-4 px-1">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <button
          v-if="supportsWebSearch"
          :class="[
            'flex items-center gap-1.5 px-2 py-1 rounded-clay-sm text-xs transition-all duration-200',
            enableWebSearch
              ? 'bg-clay-primary/10 text-clay-primary'
              : 'bg-clay-bg-base text-clay-text-secondary hover:bg-clay-primary/5',
          ]"
          @click="toggleWebSearch"
        >
          <AppIcon :icon="enableWebSearch ? 'mdi:web-check' : 'mdi:web'" :size="14" />
          <span>联网搜索</span>
        </button>
        <div
          v-else
          class="flex items-center gap-1.5 px-2 py-1 rounded-clay-sm text-xs bg-clay-bg-base text-clay-text-muted opacity-50 cursor-not-allowed"
          title="当前模型不支持联网搜索"
        >
          <AppIcon icon="mdi:web-off" :size="14" />
          <span>联网搜索</span>
        </div>

        <div
          v-if="currentKnowledgeName"
          class="flex items-center gap-1.5 px-2 py-1 rounded-clay-sm text-xs bg-clay-primary/10 text-clay-primary"
        >
          <AppIcon icon="mdi:database" :size="14" />
          <span class="truncate max-w-[120px]">{{ currentKnowledgeName }}</span>
        </div>
      </div>

      <div class="flex items-center gap-1.5 text-xs text-clay-text-muted shrink-0">
        <AppIcon icon="mdi:ticket-outline" :size="14" />
        <span
          >剩余额度次数:
          <span class="font-medium text-clay-primary">{{ userBalance }}</span></span
        >
        <button
          class="ml-1 p-1 rounded-lg hover:bg-clay-bg-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="刷新余额"
          :disabled="isRefreshing"
          @click="handleRefreshBalance"
        >
          <AppIcon icon="mdi:refresh" :size="14" :class="{ 'animate-spin': isRefreshing }" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-input-wrapper {
  width: 100%;
}

.composer-textarea {
  min-height: 1.5rem;
  line-height: 1.5rem;
  padding: 0.25rem 0.25rem 0.5rem;
  scrollbar-width: none;
}

.composer-textarea::-webkit-scrollbar {
  display: none;
}

.composer-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  color: var(--clay-text-secondary);
  transition: background-color 0.15s ease, color 0.15s ease;
}

.composer-icon-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--clay-primary) 8%, transparent);
  color: var(--clay-primary);
}

.composer-icon-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.composer-send-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: var(--clay-primary);
  color: var(--clay-text-inverse);
  transition: transform 0.15s ease, opacity 0.15s ease, background-color 0.15s ease;
}

.composer-send-btn:hover:not(:disabled) {
  background: var(--clay-primary-dark);
  transform: translateY(-1px);
}

.composer-send-btn--stop {
  background: var(--clay-bg-base);
  color: var(--clay-text-primary);
  border: 1px solid color-mix(in srgb, var(--clay-primary) 35%, transparent);
}

.composer-send-btn--stop:hover {
  background: color-mix(in srgb, var(--clay-primary) 12%, transparent);
}
</style>

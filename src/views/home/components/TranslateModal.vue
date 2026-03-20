<script setup lang="ts">
/**
 * TranslateModal 组件 - 翻译弹窗
 *
 * 功能说明：
 * - 提供文本输入框（最大 1000 字符）
 * - 提供目标语言选择器（中文简体、英语、日语、韩语）
 * - 调用翻译 API 并展示结果
 * - 提供复制翻译结果功能
 * - 处理翻译错误
 * - 支持键盘操作（Enter 提交、Esc 关闭）
 */

import { homeApi } from '@/api/modules/home'

// ==================== Props 和 Emits ====================
interface Props {
  /** 是否显示弹窗 */
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

// ==================== 响应式状态 ====================
const inputText = ref('')
const targetLanguage = ref('zh-CHS')
const translatedText = ref('')
const translating = ref(false)
const translateError = ref<string | null>(null)

// ==================== 计算属性 ====================
const inputLength = computed(() => inputText.value.length)
const canTranslate = computed(() => inputText.value.trim().length > 0 && !translating.value)

// ==================== 语言选项 ====================
const languageOptions = [
  { value: 'zh-CHS', label: '中文简体' },
  { value: 'en', label: '英语' },
  { value: 'ja', label: '日语' },
  { value: 'ko', label: '韩语' },
]

// ==================== 方法 ====================
async function handleTranslate() {
  if (!canTranslate.value) return

  translating.value = true
  translateError.value = null
  translatedText.value = ''

  try {
    const response = await homeApi.translate(inputText.value.trim(), targetLanguage.value)
    if (response.code === 200 && response.data) {
      translatedText.value = response.data
    } else {
      translateError.value = response.message || '翻译失败，请稍后重试'
    }
  } catch (error: any) {
    console.error('翻译失败:', error)
    translateError.value = error.message || '网络错误，请检查网络连接后重试'
  } finally {
    translating.value = false
  }
}

function handleClose() {
  emit('update:visible', false)
  // 清空状态
  setTimeout(() => {
    inputText.value = ''
    translatedText.value = ''
    translateError.value = null
  }, 300)
}

async function handleCopy() {
  if (!translatedText.value) return

  try {
    await navigator.clipboard.writeText(translatedText.value)
    showSuccess('复制成功')
  } catch (error) {
    console.error('复制失败:', error)
    showError('复制失败，请手动复制')
  }
}

// ==================== 键盘事件 ====================
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleClose()
  } else if (event.key === 'Enter' && event.ctrlKey && canTranslate.value) {
    handleTranslate()
  }
}

// ==================== 生命周期 ====================
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      window.addEventListener('keydown', handleKeydown)
    } else {
      window.removeEventListener('keydown', handleKeydown)
    }
  },
)

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <!-- 遮罩层 -->
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="handleClose"
    >
      <!-- 弹窗容器 -->
      <Transition name="scale">
        <div
          v-if="visible"
          class="clay-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="translate-modal-title"
        >
          <!-- 标题栏 -->
          <div class="flex items-center justify-between p-6 border-b border-clay-bg-base">
            <h2 id="translate-modal-title" class="text-xl font-bold text-clay-text-primary">
              快捷翻译
            </h2>
            <button
              @click="handleClose"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-clay-bg-base transition-colors"
              aria-label="关闭对话框"
            >
              <AppIcon icon="mdi:close" :size="20" class="text-clay-text-secondary" />
            </button>
          </div>

          <!-- 内容区域 -->
          <div class="p-6 space-y-6">
            <!-- 输入区域 -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label for="translate-input" class="text-sm font-medium text-clay-text-primary">
                  输入文本
                </label>
                <span
                  class="text-sm"
                  :class="
                    inputLength > 1000 ? 'text-red-500 font-medium' : 'text-clay-text-secondary'
                  "
                >
                  {{ inputLength }} / 1000
                </span>
              </div>
              <textarea
                id="translate-input"
                v-model="inputText"
                class="clay-input w-full resize-none"
                rows="6"
                maxlength="1000"
                placeholder="请输入要翻译的文本（最多 1000 字符）"
                aria-describedby="translate-input-hint"
              ></textarea>
              <p id="translate-input-hint" class="text-xs text-clay-text-muted">
                提示：按 Ctrl+Enter 快速翻译，按 Esc 关闭对话框
              </p>
            </div>

            <!-- 语言选择器 -->
            <div class="space-y-3">
              <label for="target-language" class="text-sm font-medium text-clay-text-primary">
                目标语言
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  v-for="option in languageOptions"
                  :key="option.value"
                  @click="targetLanguage = option.value"
                  class="py-3 px-4 rounded-clay-md transition-all font-medium"
                  :class="[
                    targetLanguage === option.value
                      ? 'clay-btn text-white scale-105'
                      : 'clay-btn-secondary text-clay-text-secondary hover:text-clay-primary',
                  ]"
                  :aria-pressed="targetLanguage === option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <!-- 翻译按钮 -->
            <button
              @click="handleTranslate"
              :disabled="!canTranslate"
              class="clay-btn w-full py-3 flex items-center justify-center gap-2"
              :class="{ 'opacity-50 cursor-not-allowed': !canTranslate }"
            >
              <AppIcon v-if="translating" icon="mdi:loading" :size="20" class="animate-spin" />
              <AppIcon v-else icon="mdi:translate" :size="20" />
              <span>{{ translating ? '翻译中...' : '开始翻译' }}</span>
            </button>

            <!-- 错误提示 -->
            <div
              v-if="translateError"
              class="flex items-start gap-3 p-4 bg-red-50 rounded-clay-md border border-red-200"
              role="alert"
            >
              <AppIcon icon="mdi:alert-circle" :size="20" class="text-red-500 shrink-0 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm font-medium text-red-800">翻译失败</p>
                <p class="text-sm text-red-600 mt-1">{{ translateError }}</p>
              </div>
            </div>

            <!-- 翻译结果 -->
            <div v-if="translatedText" class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-clay-text-primary">翻译结果</label>
                <button
                  @click="handleCopy"
                  class="flex items-center gap-2 px-3 py-1.5 text-sm text-clay-primary hover:bg-clay-bg-base rounded-clay-sm transition-colors"
                  aria-label="复制翻译结果"
                >
                  <AppIcon icon="mdi:content-copy" :size="16" />
                  <span>复制</span>
                </button>
              </div>
              <div
                class="clay-input w-full min-h-[150px] whitespace-pre-wrap bg-clay-bg-base"
                role="region"
                aria-label="翻译结果"
              >
                {{ translatedText }}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 缩放动画 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

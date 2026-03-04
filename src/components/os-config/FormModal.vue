<script setup lang="ts">
/**
 * 表单弹窗组件
 *
 * 功能说明：
 * - 通用表单弹窗,支持新增和编辑模式
 * - 动态表单渲染(基于 fields 配置)
 * - 支持文本、多行文本、数字、下拉选择字段类型
 * - 表单验证逻辑
 * - Claymorphism 样式和动画
 */
import type { FormField } from '@/types'

interface Props {
  /** 是否显示弹窗 */
  visible: boolean
  /** 弹窗标题 */
  title: string
  /** 模式: 新增或编辑 */
  mode: 'add' | 'edit'
  /** 表单数据 */
  formData: any
  /** 表单字段配置 */
  fields: FormField[]
  /** 是否正在提交 */
  loading?: boolean
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'submit', formData: any): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

// ==================== 状态 ====================
const localFormData = ref<any>({})
const errors = ref<Record<string, string>>({})

// ==================== 监听 ====================
// 当弹窗打开或表单数据变化时,重置本地表单数据
watch(
  () => [props.visible, props.formData],
  () => {
    if (props.visible) {
      // 深拷贝表单数据
      localFormData.value = props.formData ? JSON.parse(JSON.stringify(props.formData)) : {}
      // 清空错误信息
      errors.value = {}
    }
  },
  { immediate: true },
)

// ==================== 方法 ====================
/**
 * 表单验证
 */
function validateForm(): boolean {
  errors.value = {}
  let isValid = true

  props.fields.forEach((field) => {
    const value = localFormData.value[field.key]

    // 必填验证
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.value[field.key] = `${field.label}不能为空`
      isValid = false
      return
    }

    // 自定义验证器
    if (field.validator && value !== undefined && value !== null && value !== '') {
      const error = field.validator(value)
      if (error) {
        errors.value[field.key] = error
        isValid = false
      }
    }
  })

  return isValid
}

/**
 * 处理提交
 */
function handleSubmit() {
  if (!validateForm()) {
    return
  }
  emit('submit', localFormData.value)
}

/**
 * 处理取消
 */
function handleCancel() {
  emit('update:visible', false)
  emit('cancel')
}

/**
 * 处理遮罩层点击
 */
function handleOverlayClick() {
  if (!props.loading) {
    handleCancel()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="handleOverlayClick">
        <div class="modal-container clay-card">
          <!-- 标题栏 -->
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button
              type="button"
              @click="handleCancel"
              :disabled="loading"
              class="close-btn"
              aria-label="关闭"
            >
              <AppIcon icon="mdi:close" :size="20" />
            </button>
          </div>

          <!-- 表单内容 -->
          <form @submit.prevent="handleSubmit" class="modal-body">
            <div v-for="field in fields" :key="field.key" class="form-field">
              <label :class="{ required: field.required }" class="form-label">
                {{ field.label }}
              </label>

              <!-- 文本输入 -->
              <input
                v-if="field.type === 'text'"
                v-model="localFormData[field.key]"
                type="text"
                :placeholder="field.placeholder"
                :class="{ error: errors[field.key] }"
                class="clay-input"
              />

              <!-- 数字输入 -->
              <input
                v-else-if="field.type === 'number'"
                v-model.number="localFormData[field.key]"
                type="number"
                :placeholder="field.placeholder"
                :class="{ error: errors[field.key] }"
                class="clay-input"
              />

              <!-- 多行文本 -->
              <textarea
                v-else-if="field.type === 'textarea'"
                v-model="localFormData[field.key]"
                :placeholder="field.placeholder"
                :class="{ error: errors[field.key] }"
                class="clay-input"
                rows="5"
              />

              <!-- 下拉选择 -->
              <select
                v-else-if="field.type === 'select'"
                v-model="localFormData[field.key]"
                :class="{ error: errors[field.key] }"
                class="clay-select"
              >
                <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>

              <!-- 错误提示 -->
              <span v-if="errors[field.key]" class="error-message">
                {{ errors[field.key] }}
              </span>
            </div>
          </form>

          <!-- 操作按钮 -->
          <div class="modal-footer">
            <button
              type="button"
              @click="handleCancel"
              :disabled="loading"
              class="clay-btn-secondary"
            >
              取消
            </button>
            <button type="button" @click="handleSubmit" :disabled="loading" class="clay-btn">
              <span v-if="loading">提交中...</span>
              <span v-else>{{ mode === 'add' ? '新增' : '保存' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ==================== 遮罩层 ==================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

/* ==================== 弹窗容器 ==================== */
.modal-container {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--clay-bg-elevated);
  overflow: hidden;
}

/* ==================== 标题栏 ==================== */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--clay-text-primary);
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  color: var(--clay-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-clay-sm);
  transition: all var(--duration-normal) var(--ease-out);
}

.close-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
  color: var(--clay-text-primary);
  transform: rotate(90deg);
}

.close-btn:active:not(:disabled) {
  transform: rotate(90deg) scale(0.95);
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==================== 表单内容 ==================== */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.form-field {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.form-field:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--clay-text-primary);
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.clay-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--clay-text-primary);
  background: var(--clay-bg-base);
  border: 1px solid transparent;
  border-radius: var(--radius-clay-sm);
  transition: all var(--duration-normal) var(--ease-out);
}

.clay-input:focus {
  outline: none;
  border-color: var(--clay-primary);
  background: var(--clay-bg-elevated);
}

.clay-input.error {
  border-color: #ef4444;
}

.clay-input::placeholder {
  color: var(--clay-text-muted);
}

textarea.clay-input {
  resize: vertical;
  min-height: 120px;
}

select.clay-input {
  cursor: pointer;
}

/* ==================== Clay 主题 Select 样式 ==================== */
.clay-select {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--clay-text-primary);
  background: var(--clay-bg-base);
  border: 2px solid transparent;
  border-radius: var(--radius-clay-sm);
  transition: all var(--duration-normal) var(--ease-out);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%237c3aed' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5rem;
  box-shadow: var(--shadow-clay-card);
}

.clay-select:hover {
  border-color: var(--clay-primary-light);
  background-color: var(--clay-bg-elevated);
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-1px);
}

.clay-select:focus {
  outline: none;
  border-color: var(--clay-primary);
  background: var(--clay-bg-elevated);
  box-shadow:
    var(--shadow-clay-hover),
    0 0 0 3px rgba(124, 58, 237, 0.1);
  transform: translateY(-1px);
}

.clay-select:active {
  transform: translateY(0);
  box-shadow: var(--shadow-clay-pressed);
}

.clay-select.error {
  border-color: #ef4444;
  box-shadow:
    var(--shadow-clay-card),
    0 0 0 3px rgba(239, 68, 68, 0.1);
}

.clay-select option {
  padding: 0.75rem 1rem;
  background: var(--clay-bg-elevated);
  color: var(--clay-text-primary);
  font-size: 0.875rem;
}

.clay-select option:hover {
  background: var(--clay-primary-light);
  color: var(--clay-text-inverse);
}

.clay-select option:checked {
  background: var(--clay-primary);
  color: var(--clay-text-inverse);
  font-weight: 600;
}

.error-message {
  display: block;
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
}

/* ==================== 操作按钮 ==================== */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.clay-btn,
.clay-btn-secondary {
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-clay-sm);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.clay-btn {
  background: var(--clay-primary);
  color: var(--clay-text-inverse);
  box-shadow: var(--shadow-clay-button);
}

.clay-btn:hover:not(:disabled) {
  background: var(--clay-primary-dark);
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.clay-btn:active:not(:disabled) {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(1px);
}

.clay-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clay-btn-secondary {
  background: var(--clay-bg-base);
  color: var(--clay-text-primary);
  box-shadow: var(--shadow-clay-button);
}

.clay-btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-2px);
}

.clay-btn-secondary:active:not(:disabled) {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(1px);
}

.clay-btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ==================== 动画 ==================== */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
    align-items: stretch;
  }

  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .modal-title {
    font-size: 1.125rem;
  }

  .form-field {
    margin-bottom: 1.25rem;
  }

  .form-label {
    font-size: 0.8125rem;
    margin-bottom: 0.375rem;
  }

  .clay-input {
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
  }

  textarea.clay-input {
    min-height: 100px;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .clay-btn,
  .clay-btn-secondary {
    width: 100%;
    padding: 0.75rem 1.5rem;
  }
}
</style>

<script setup lang="ts">
/**
 * 流水弹窗组件
 *
 * 功能说明:
 * - 新增/编辑收支流水
 * - 分类选择(支出/收入分组) + 金额 + 标签 + 备注
 * - 金额以元输入，提交时转为分
 */

import type { FinanceTransaction, FinanceTransactionParams, FinanceCategory } from '@/types'

interface Props {
  modelValue: boolean
  transaction?: FinanceTransaction
  categories: FinanceCategory[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: FinanceTransactionParams]
}>()

// ==================== 标签映射 ====================
const tagOptions = [
  { value: 1, label: '必要支出' },
  { value: 2, label: '弹性支出' },
  { value: 3, label: '工薪收入' },
  { value: 4, label: '额外收入' },
]

// ==================== 表单状态 ====================
const formData = ref({
  categoryId: null as number | null,
  amountDisplay: '',
  tag: 1 as number,
  remark: '',
})
const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const showExpenseSection = ref(true)
const showIncomeSection = ref(false)

const isEditing = computed(() => !!props.transaction?.id)

// 按类型分组分类
const expenseCategories = computed(() => props.categories.filter((c) => c.type === 1))
const incomeCategories = computed(() => props.categories.filter((c) => c.type === 2))

// 当前选中分类的类型
const selectedCategoryType = computed(() => {
  if (!formData.value.categoryId) return null
  const cat = props.categories.find((c) => c.id === formData.value.categoryId)
  return cat?.type ?? null
})

// 根据分类类型过滤标签选项
const availableTags = computed(() => {
  if (selectedCategoryType.value === 1) return tagOptions.filter((t) => t.value <= 2)
  if (selectedCategoryType.value === 2) return tagOptions.filter((t) => t.value >= 3)
  return tagOptions
})

// ==================== 选择分类 ====================
function selectCategory(cat: FinanceCategory) {
  formData.value.categoryId = cat.id
  // 自动设置默认标签
  if (cat.type === 1 && formData.value.tag > 2) formData.value.tag = 1
  if (cat.type === 2 && formData.value.tag < 3) formData.value.tag = 3
}

// ==================== 监听弹窗 ====================
watch(
  () => props.modelValue,
  (visible) => {
    if (visible && props.transaction) {
      formData.value = {
        categoryId: props.transaction.categoryId,
        amountDisplay: (props.transaction.amount / 100).toFixed(2),
        tag: props.transaction.tag,
        remark: props.transaction.remark || '',
      }
      showExpenseSection.value = props.transaction.categoryType === 1
      showIncomeSection.value = props.transaction.categoryType === 2
    } else if (visible) {
      formData.value = {
        categoryId: null,
        amountDisplay: '',
        tag: 1,
        remark: '',
      }
      showExpenseSection.value = true
      showIncomeSection.value = false
    }
    errors.value = {}
  },
  { immediate: true },
)

// ==================== 表单验证 ====================
function validateForm(): boolean {
  errors.value = {}
  if (!formData.value.categoryId) {
    errors.value.categoryId = '请选择分类'
    return false
  }
  const amount = parseFloat(formData.value.amountDisplay)
  if (!formData.value.amountDisplay || isNaN(amount) || amount <= 0) {
    errors.value.amount = '请输入有效金额'
    return false
  }
  if (amount > 999999.99) {
    errors.value.amount = '金额不能超过999,999.99'
    return false
  }
  return true
}

// ==================== 提交 ====================
function handleSubmit() {
  if (!validateForm()) return
  isSubmitting.value = true
  try {
    const data: FinanceTransactionParams = {
      categoryId: formData.value.categoryId!,
      amount: Math.round(parseFloat(formData.value.amountDisplay) * 100),
      tag: formData.value.tag,
      remark: formData.value.remark?.trim() || undefined,
    }
    if (isEditing.value && props.transaction) {
      data.id = props.transaction.id
    }
    emit('save', data)
    handleClose()
  } finally {
    isSubmitting.value = false
  }
}

// ==================== 关闭 ====================
function handleClose() {
  emit('update:modelValue', false)
}

function handleOverlayClick() {
  if (!isSubmitting.value) handleClose()
}

function outComeCategoryClick() {
  showExpenseSection.value = true
  showIncomeSection.value = false
}

function inComeCategoryClick() {
  showIncomeSection.value = true
  showExpenseSection.value = false
}

// ==================== 键盘操作 ====================
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') handleClose()
  if (e.key === 'Enter' && e.ctrlKey) handleSubmit()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
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
        @click.self="handleOverlayClick"
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
            class="w-full max-w-lg bg-clay-bg-elevated rounded-clay-lg shadow-clay-card overflow-hidden max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <!-- 标题栏 -->
            <div class="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <h3 class="text-lg font-semibold text-clay-text-primary font-heading">
                {{ isEditing ? '编辑流水' : '记一笔' }}
              </h3>
              <button
                @click="handleClose"
                :disabled="isSubmitting"
                class="w-8 h-8 flex items-center justify-center rounded-clay-sm text-clay-text-secondary hover:bg-clay-bg-base hover:text-clay-text-primary transition-all"
              >
                <AppIcon icon="mdi:close" :size="18" />
              </button>
            </div>

            <!-- 表单内容 -->
            <form @submit.prevent="handleSubmit" class="p-5 space-y-5 overflow-y-auto flex-1">
              <!-- 分类选择 -->
              <div>
                <label class="block text-sm font-medium text-clay-text-primary mb-2">
                  选择分类 <span class="text-clay-error">*</span>
                </label>
                <p v-if="errors.categoryId" class="text-xs text-clay-error mb-1">
                  {{ errors.categoryId }}
                </p>

                <div class="space-y-3">
                  <!-- 支出分类 -->
                  <div>
                    <button
                      type="button"
                      @click="outComeCategoryClick"
                      class="flex items-center gap-2 text-sm font-medium text-red-500 mb-2"
                    >
                      <AppIcon
                        :icon="showExpenseSection ? 'mdi:chevron-down' : 'mdi:chevron-right'"
                        :size="16"
                      />
                      <span>支出</span>
                    </button>
                    <Transition name="expand">
                      <div v-if="showExpenseSection" class="grid grid-cols-4 gap-2">
                        <button
                          v-for="cat in expenseCategories"
                          :key="cat.id"
                          type="button"
                          @click="selectCategory(cat)"
                          class="p-2.5 rounded-clay-sm flex flex-col items-center gap-1 transition-all"
                          :class="
                            formData.categoryId === cat.id
                              ? 'bg-red-50 ring-2 ring-red-300 shadow-clay-button'
                              : 'bg-clay-bg-base hover:shadow-clay-hover'
                          "
                        >
                          <AppIcon
                            :icon="cat.icon || 'mdi:circle-outline'"
                            :size="22"
                            :class="
                              formData.categoryId === cat.id
                                ? 'text-red-500'
                                : 'text-clay-text-secondary'
                            "
                          />
                          <span
                            class="text-xs truncate w-full text-center"
                            :class="
                              formData.categoryId === cat.id
                                ? 'text-red-500 font-medium'
                                : 'text-clay-text-secondary'
                            "
                          >
                            {{ cat.name }}
                          </span>
                        </button>
                      </div>
                    </Transition>
                  </div>

                  <!-- 收入分类 -->
                  <div>
                    <button
                      type="button"
                      @click="inComeCategoryClick"
                      class="flex items-center gap-2 text-sm font-medium text-green-500 mb-2"
                    >
                      <AppIcon
                        :icon="showIncomeSection ? 'mdi:chevron-down' : 'mdi:chevron-right'"
                        :size="16"
                      />
                      <span>收入</span>
                    </button>
                    <Transition name="expand">
                      <div v-if="showIncomeSection" class="grid grid-cols-4 gap-2">
                        <button
                          v-for="cat in incomeCategories"
                          :key="cat.id"
                          type="button"
                          @click="selectCategory(cat)"
                          class="p-2.5 rounded-clay-sm flex flex-col items-center gap-1 transition-all"
                          :class="
                            formData.categoryId === cat.id
                              ? 'bg-green-50 ring-2 ring-green-300 shadow-clay-button'
                              : 'bg-clay-bg-base hover:shadow-clay-hover'
                          "
                        >
                          <AppIcon
                            :icon="cat.icon || 'mdi:circle-outline'"
                            :size="22"
                            :class="
                              formData.categoryId === cat.id
                                ? 'text-green-500'
                                : 'text-clay-text-secondary'
                            "
                          />
                          <span
                            class="text-xs truncate w-full text-center"
                            :class="
                              formData.categoryId === cat.id
                                ? 'text-green-500 font-medium'
                                : 'text-clay-text-secondary'
                            "
                          >
                            {{ cat.name }}
                          </span>
                        </button>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>

              <!-- 金额 -->
              <div>
                <label class="block text-sm font-medium text-clay-text-primary mb-2">
                  金额 (元) <span class="text-clay-error">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-clay-text-muted">
                    ¥
                  </span>
                  <input
                    v-model="formData.amountDisplay"
                    type="number"
                    step="0.01"
                    min="0"
                    max="999999.99"
                    placeholder="0.00"
                    class="clay-input w-full pl-8 pr-4"
                    :class="{ 'border-clay-error': errors.amount }"
                  />
                </div>
                <p v-if="errors.amount" class="text-xs text-clay-error mt-1">{{ errors.amount }}</p>
              </div>

              <!-- 标签 -->
              <div>
                <label class="block text-sm font-medium text-clay-text-primary mb-2"> 标签 </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="tag in availableTags"
                    :key="tag.value"
                    type="button"
                    @click="formData.tag = tag.value"
                    class="px-4 py-2 rounded-clay-sm text-sm font-medium transition-all"
                    :class="
                      formData.tag === tag.value
                        ? 'bg-clay-primary  shadow-clay-button text-purple-500'
                        : 'bg-clay-bg-base text-clay-text-secondary hover:shadow-clay-hover'
                    "
                  >
                    {{ tag.label }}
                  </button>
                </div>
              </div>

              <!-- 备注 -->
              <div>
                <label class="block text-sm font-medium text-clay-text-primary mb-2"> 备注 </label>
                <input
                  v-model="formData.remark"
                  type="text"
                  placeholder="选填"
                  maxlength="100"
                  class="clay-input w-full px-4"
                />
              </div>
            </form>

            <!-- 底部按钮 -->
            <div class="flex items-center justify-end gap-3 p-5 border-t border-gray-100 shrink-0">
              <button
                @click="handleClose"
                :disabled="isSubmitting"
                class="clay-btn-secondary px-5 py-2.5 text-sm"
              >
                取消
              </button>
              <button
                @click="handleSubmit"
                :disabled="isSubmitting"
                class="clay-btn px-5 py-2.5 text-sm"
              >
                {{ isEditing ? '保存' : '确认' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

@media (max-width: 767px) {
  .fixed.inset-0 {
    padding: 0;
    align-items: stretch;
  }
  .fixed.inset-0 > div {
    max-width: 100%;
    border-radius: 0;
    max-height: 100vh;
    height: 100vh;
    max-height: 100dvh;
    height: 100dvh;
  }
}
</style>

<script setup lang="ts">
/**
 * 分类弹窗组件
 *
 * 功能说明:
 * - 新增/编辑财务分类
 * - 名称 + 类型(单选) + 图标(预设网格)
 * - Teleport + Transition + 键盘操作
 */

import type { FinanceCategory, FinanceCategoryParams } from '@/types'

interface Props {
  modelValue: boolean
  category?: FinanceCategory
  defaultType?: number
}

const props = withDefaults(defineProps<Props>(), {
  defaultType: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: FinanceCategoryParams]
}>()

// ==================== 预设图标 ====================
const presetIcons = [
  // 餐饮
  'mdi:food',
  'mdi:coffee',
  'mdi:fruit-cherries',
  'mdi:cupcake',
  'mdi:bottle-wine-outline',
  // 出行
  'mdi:car',
  'mdi:bus',
  'mdi:train',
  'mdi:airplane',
  'mdi:bicycle',
  // 购物
  'mdi:shopping',
  'mdi:cart-outline',
  'mdi:store-outline',
  'mdi:package-variant',
  // 居住
  'mdi:home-outline',
  'mdi:sofa-outline',
  'mdi:water-pump',
  'mdi:lightning-bolt',
  // 医疗健康
  'mdi:medical-bag',
  'mdi:hospital-box-outline',
  'mdi:pill',
  'mdi:tooth-outline',
  // 教育
  'mdi:school-outline',
  'mdi:book-open-page-variant-outline',
  'mdi:palette-outline',
  // 娱乐
  'mdi:gamepad-variant-outline',
  'mdi:movie-open-outline',
  'mdi:music-note',
  'mdi:karate',
  // 通讯数码
  'mdi:cellphone',
  'mdi:laptop',
  'mdi:headphones',
  // 服饰
  'mdi:tshirt-crew-outline',
  'mdi:shoe-sneaker',
  'mdi:diamond-stone',
  // 人情
  'mdi:gift-outline',
  'mdi:heart-outline',
  'mdi:handshake-outline',
  // 家庭
  'mdi:baby-carriage',
  'mdi:dog-side',
  'mdi:flower-outline',
  // 运动
  'mdi:dumbbell',
  'mdi:swim',
  'mdi:run',
  // 收入
  'mdi:cash',
  'mdi:bank',
  'mdi:credit-card-outline',
  'mdi:chart-line',
  'mdi:star-outline',
  'mdi:lightbulb-outline',
  'mdi:account-cash',
  'mdi:piggy-bank-outline',
  'mdi:finance',
  'mdi:safe-square-outline',
  'mdi:hand-coin-outline',
  // 通用
  'mdi:circle-outline',
]

// ==================== 表单状态 ====================
const formData = ref({
  name: '',
  type: 1 as number,
  icon: 'mdi:circle-outline',
})
const errors = ref<{ name?: string }>({})
const isSubmitting = ref(false)

const isEditing = computed(() => !!props.category?.id)

// ==================== 监听弹窗 ====================
watch(
  () => props.modelValue,
  (visible) => {
    if (visible && props.category) {
      formData.value = {
        name: props.category.name,
        type: props.category.type,
        icon: props.category.icon || 'mdi:circle-outline',
      }
    } else if (visible) {
      formData.value = {
        name: '',
        type: props.defaultType,
        icon: 'mdi:circle-outline',
      }
    }
    errors.value = {}
  },
  { immediate: true },
)

// ==================== 表单验证 ====================
function validateForm(): boolean {
  errors.value = {}
  if (!formData.value.name.trim()) {
    errors.value.name = '分类名称不能为空'
    return false
  }
  if (formData.value.name.trim().length > 20) {
    errors.value.name = '分类名称不能超过20个字符'
    return false
  }
  return true
}

// ==================== 提交 ====================
function handleSubmit() {
  if (!validateForm()) return
  isSubmitting.value = true
  try {
    const data: FinanceCategoryParams = {
      name: formData.value.name.trim(),
      type: formData.value.type,
      icon: formData.value.icon,
    }
    if (isEditing.value && props.category) {
      data.id = props.category.id
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
            class="w-full max-w-md bg-clay-bg-elevated rounded-clay-lg shadow-clay-card overflow-hidden max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <!-- 标题栏 -->
            <div class="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <h3 class="text-lg font-semibold text-clay-text-primary font-heading">
                {{ isEditing ? '编辑分类' : '新增分类' }}
              </h3>
              <button
                @click="handleClose"
                :disabled="isSubmitting"
                class="w-8 h-8 flex items-center justify-center rounded-clay-sm text-clay-text-secondary hover:bg-clay-bg-base hover:text-clay-text-primary transition-all"
              >
                <AppIcon icon="mdi:close" :size="18" />
              </button>
            </div>

            <!-- 表单 -->
            <form @submit.prevent="handleSubmit" class="p-5 space-y-5 overflow-y-auto flex-1">
              <!-- 名称 -->
              <div>
                <label class="block text-sm font-medium text-clay-text-primary mb-2">
                  分类名称 <span class="text-clay-error">*</span>
                </label>
                <input
                  v-model="formData.name"
                  type="text"
                  placeholder="请输入分类名称"
                  maxlength="20"
                  class="clay-input w-full px-4"
                  :class="{ 'border-clay-error': errors.name }"
                />
                <p v-if="errors.name" class="text-xs text-clay-error mt-1">{{ errors.name }}</p>
              </div>

              <!-- 类型 -->
              <div>
                <label class="block text-sm font-medium text-clay-text-primary mb-2">
                  分类类型 <span class="text-clay-error">*</span>
                </label>
                <div class="flex gap-3">
                  <button
                    type="button"
                    @click="formData.type = 1"
                    class="flex-1 py-2.5 rounded-clay-sm font-medium transition-all text-sm"
                    :class="
                      formData.type === 1
                        ? 'bg-red-50 text-red-500 border-2 border-red-300 shadow-clay-button'
                        : 'bg-clay-bg-base text-clay-text-secondary border-2 border-transparent hover:border-clay-primary/20'
                    "
                  >
                    <AppIcon icon="mdi:arrow-down-bold" :size="16" class="inline mr-1" />
                    支出
                  </button>
                  <button
                    type="button"
                    @click="formData.type = 2"
                    class="flex-1 py-2.5 rounded-clay-sm font-medium transition-all text-sm"
                    :class="
                      formData.type === 2
                        ? 'bg-green-50 text-green-500 border-2 border-green-300 shadow-clay-button'
                        : 'bg-clay-bg-base text-clay-text-secondary border-2 border-transparent hover:border-clay-primary/20'
                    "
                  >
                    <AppIcon icon="mdi:arrow-up-bold" :size="16" class="inline mr-1" />
                    收入
                  </button>
                </div>
              </div>

              <!-- 图标选择 -->
              <div>
                <label class="block text-sm font-medium text-clay-text-primary mb-2">
                  选择图标
                </label>
                <div class="grid grid-cols-6 gap-2">
                  <button
                    v-for="icon in presetIcons"
                    :key="icon"
                    type="button"
                    @click="formData.icon = icon"
                    class="w-10 h-10 rounded-clay-sm flex items-center justify-center transition-all"
                    :class="
                      formData.icon === icon
                        ? 'bg-clay-primary shadow-clay-button'
                        : 'bg-clay-bg-base hover:shadow-clay-hover'
                    "
                  >
                    <AppIcon
                      :icon="icon"
                      :size="20"
                      :class="
                        formData.icon === icon ? 'text-purple-500' : 'text-clay-text-secondary'
                      "
                    />
                  </button>
                </div>
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
                {{ isEditing ? '保存' : '新增' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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

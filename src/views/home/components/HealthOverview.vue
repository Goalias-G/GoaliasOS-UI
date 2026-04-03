<script setup lang="ts">
/**
 * HealthOverview 组件 - 每日健康快览
 *
 * 功能说明：
 * - 查询当天的健康记录
 * - 根据是否有记录切换新增/修改模式
 * - 提供起床时间、睡眠时间、饮食、运动、备注的输入框
 * - 手动保存数据（时间自动补上秒）
 * - 展示保存成功/失败提示
 */

import type { DailyHealth } from '@/types'
import { dailyHealthApi } from '@/api/modules/home'
import { formatDate } from '@/utils/format'
import { showSuccess, showError } from '@/utils/toast'

// ==================== 注入父组件提供的 healthData ====================
const healthData = inject<Ref<DailyHealth | null>>('healthData')!

// ==================== 响应式状态 ====================
const isEditMode = ref(false)
const saving = ref(false)
const loading = ref(false)

const formData = ref({
  upTime: '',
  sleepTime: '',
  food: '',
  exercise: '',
  remark: '',
})

// ==================== 计算属性 ====================
// 可选择的日期列表（最近15天）
const dateOptions = computed(() => {
  const options: { value: string; label: string }[] = []
  const today = new Date()

  for (let i = 0; i < 15; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = formatDate(date, 'YYYY-MM-DD')
    const isToday = i === 0
    const dayOfWeek = date.toLocaleDateString('zh-CN', { weekday: 'short' })

    options.push({
      value: dateStr,
      label: isToday ? `今天 (${dayOfWeek})` : `${dateStr} (${dayOfWeek})`,
    })
  }

  return options
})

// 当前选中的日期（默认为今天）
const selectedDate = ref(formatDate(new Date(), 'YYYY-MM-DD'))

// 是否可以选择今天（只有今天可以编辑）
const isToday = computed(() => selectedDate.value === formatDate(new Date(), 'YYYY-MM-DD'))

// ==================== 辅助函数 ====================
function stripSeconds(time: string | undefined | null): string {
  return time ? time.substring(0, 5) : ''
}

// ==================== 方法 ====================
function switchToPrevDay() {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - 1)
  selectedDate.value = formatDate(date, 'YYYY-MM-DD')
  loadHealthData()
}

function switchToNextDay() {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + 1)
  selectedDate.value = formatDate(date, 'YYYY-MM-DD')
  loadHealthData()
}

async function loadHealthData() {
  loading.value = true
  try {
    const response = await dailyHealthApi.list({ healthDate: selectedDate.value })
    if (response.code === 200 && response.data?.list) {
      const records = response.data.list
      if (records.length > 0 && records[0]) {
        const record = records[0]
        healthData.value = record
        isEditMode.value = true
        formData.value = {
          upTime: stripSeconds(record.upTime),
          sleepTime: stripSeconds(record.sleepTime),
          food: record.food || '',
          exercise: record.exercise || '',
          remark: record.remark || '',
        }
      } else {
        isEditMode.value = false
        healthData.value = null
        // 重置表单
        formData.value = {
          upTime: '',
          sleepTime: '',
          food: '',
          exercise: '',
          remark: '',
        }
      }
    }
  } catch (error) {
    console.error('加载健康数据失败:', error)
    showError('加载健康数据失败')
    // 发生错误时也重置表单
    isEditMode.value = false
    healthData.value = null
    formData.value = {
      upTime: '',
      sleepTime: '',
      food: '',
      exercise: '',
      remark: '',
    }
  } finally {
    loading.value = false
  }
}

async function saveHealthData() {
  if (!isToday.value) {
    showError('只能编辑当天的健康数据')
    return
  }

  saving.value = true
  try {
    const data = {
      upTime: formData.value.upTime ? `${formData.value.upTime}:00` : '',
      sleepTime: formData.value.sleepTime ? `${formData.value.sleepTime}:00` : '',
      food: formData.value.food,
      exercise: formData.value.exercise,
      remark: formData.value.remark,
      healthDate: selectedDate.value,
      id: healthData.value?.id,
    }

    if (isEditMode.value && healthData.value?.id) {
      await dailyHealthApi.edit(data)
      healthData.value = {
        ...healthData.value,
        upTime: data.upTime,
        sleepTime: data.sleepTime,
        food: data.food,
        exercise: data.exercise,
        remark: data.remark,
      }
    } else {
      await dailyHealthApi.add(data)
      isEditMode.value = true
      await loadHealthData()
    }

    showSuccess('保存成功')
  } catch (error) {
    console.error('保存健康数据失败:', error)
    showError('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadHealthData()
})
</script>

<template>
  <div class="clay-card p-6">
    <!-- 标题 -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <h2 class="text-xl font-bold text-clay-text-primary">生活记录</h2>
      <div class="flex items-center gap-1.5">
        <button
          class="p-1.5 rounded-clay-md hover:bg-clay-bg-base transition-colors text-clay-text-secondary hover:text-clay-text-primary"
          title="前一天"
          @click="switchToPrevDay"
        >
          <AppIcon icon="mdi:chevron-left" :size="20" />
        </button>
        <select
          v-model="selectedDate"
          class="clay-input px-3 py-1.5 text-sm min-w-40"
          @change="loadHealthData"
        >
          <option v-for="opt in dateOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <button
          class="p-1.5 rounded-clay-md hover:bg-clay-bg-base transition-colors text-clay-text-secondary hover:text-clay-text-primary"
          title="后一天"
          @click="switchToNextDay"
        >
          <AppIcon icon="mdi:chevron-right" :size="20" />
        </button>
        <button
          class="clay-btn-secondary px-4 py-1.5 text-sm"
          :disabled="saving || !isToday"
          @click="saveHealthData"
        >
          <span v-if="saving" role="status" aria-live="polite" class="flex items-center gap-1.5">
            <div
              class="w-3.5 h-3.5 border-2 border-clay-primary border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            ></div>
            保存中...
          </span>
          <span v-else>保存</span>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="loading"
      role="status"
      aria-live="polite"
      class="flex items-center justify-center py-12"
    >
      <div
        class="w-8 h-8 border-4 border-clay-primary/20 border-t-clay-primary rounded-full animate-spin"
        aria-hidden="true"
      ></div>
      <span class="sr-only">正在加载健康数据...</span>
    </div>

    <!-- 表单内容 -->
    <div v-else class="space-y-4" role="form" aria-label="健康数据表单">
      <!-- 起床时间 -->
      <div class="form-field">
        <label for="upTime" class="block text-sm font-medium text-clay-text-primary mb-2">
          起床时间
        </label>
        <input
          id="upTime"
          v-model="formData.upTime"
          type="time"
          class="clay-input w-full"
          :disabled="!isToday"
          placeholder="请选择起床时间"
          aria-describedby="upTime-hint"
        />
        <p id="upTime-hint" class="sr-only">请输入起床时间，格式为 HH:mm</p>
      </div>

      <!-- 睡眠时间 -->
      <div class="form-field">
        <label for="sleepTime" class="block text-sm font-medium text-clay-text-primary mb-2">
          睡眠时间
        </label>
        <input
          id="sleepTime"
          v-model="formData.sleepTime"
          type="time"
          class="clay-input w-full"
          :disabled="!isToday"
          placeholder="请输入睡眠时间"
          aria-describedby="sleepTime-hint"
        />
        <p id="sleepTime-hint" class="sr-only">请输入睡眠时间，格式为 HH:mm</p>
      </div>

      <!-- 饮食内容 -->
      <div class="form-field">
        <label for="food" class="block text-sm font-medium text-clay-text-primary mb-2">
          饮食内容
        </label>
        <textarea
          id="food"
          v-model="formData.food"
          rows="3"
          class="clay-input w-full resize-none"
          :disabled="!isToday"
          placeholder="记录今日饮食..."
          aria-describedby="food-hint"
        ></textarea>
        <p id="food-hint" class="sr-only">请记录今日饮食内容，支持多行输入</p>
      </div>

      <!-- 运动内容 -->
      <div class="form-field">
        <label for="exercise" class="block text-sm font-medium text-clay-text-primary mb-2">
          运动内容
        </label>
        <textarea
          id="exercise"
          v-model="formData.exercise"
          rows="3"
          class="clay-input w-full resize-none"
          :disabled="!isToday"
          placeholder="记录今日运动..."
          aria-describedby="exercise-hint"
        ></textarea>
        <p id="exercise-hint" class="sr-only">请记录今日运动内容，支持多行输入</p>
      </div>

      <!-- 备注 -->
      <div class="form-field">
        <label for="remark" class="block text-sm font-medium text-clay-text-primary mb-2">
          备注
        </label>
        <textarea
          id="remark"
          v-model="formData.remark"
          rows="3"
          class="clay-input w-full resize-none"
          :disabled="!isToday"
          placeholder="其他备注信息..."
          aria-describedby="remark-hint"
        ></textarea>
        <p id="remark-hint" class="sr-only">请输入其他备注信息，支持多行输入</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 组件样式（优先使用 Tailwind CSS） */
.form-field {
  transition: all 0.2s;
}

.form-field:focus-within {
  transform: scale(1.01);
}
</style>

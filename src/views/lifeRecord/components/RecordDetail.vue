/** * RecordDetail 组件 - 记录详情 * * 功能说明: * - 展示记录的完整内容和图片 * - 支持收藏和评分操作
* - 支持编辑和删除操作 * - 支持键盘导航(上一条/下一条) */
<script setup lang="ts">
import { useLifeRecordStore } from '@/stores/lifeRecord'
import { storeToRefs } from 'pinia'
import EmptyState from './EmptyState.vue'
import ExpandableGallery from '@/components/ui/expandable-gallery/ExpandableGallery.vue'

// ==================== Store ====================
const store = useLifeRecordStore()
const { currentRecord, records, loading } = storeToRefs(store)

// ==================== 状态 ====================
const contentKey = ref(0)

// ==================== 计算属性 ====================
const isFavorite = computed(() => currentRecord.value?.favoriteFlag === 1)

const rating = computed(() => currentRecord.value?.rating || 0)

// 分离图片和视频
const imageUrls = computed(() => {
  if (!currentRecord.value?.attachsUrls) return []
  return currentRecord.value.attachsUrls.filter((url) => !url.toLowerCase().endsWith('.mp4'))
})

const videoUrls = computed(() => {
  if (!currentRecord.value?.attachsUrls) return []
  return currentRecord.value.attachsUrls.filter((url) => url.toLowerCase().endsWith('.mp4'))
})

const hasImages = computed(() => imageUrls.value.length > 0)
const hasVideos = computed(() => videoUrls.value.length > 0)

// 格式化日期（只显示年月日）
const formattedDate = computed(() => {
  if (!currentRecord.value?.recordDate) return ''
  const date = currentRecord.value.recordDate
  // 提取日期部分，去掉时间（支持空格和T分隔符）
  return date.split(' ')[0]?.split('T')[0] || date
})

// 当前记录在列表中的索引
const currentIndex = computed(() => {
  if (!currentRecord.value) return -1
  return records.value.findIndex((r) => r.id === currentRecord.value!.id)
})

const hasPrevious = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < records.value.length - 1)

// ==================== Emits ====================
const emit = defineEmits<{
  edit: []
  delete: []
}>()

// ==================== 收藏功能 ====================
async function toggleFavorite() {
  if (!currentRecord.value) return
  const newFlag = isFavorite.value ? 0 : 1
  await store.toggleFavorite(currentRecord.value.id!, newFlag)
}

// ==================== 评分功能 ====================
async function updateRating(newRating: number) {
  if (!currentRecord.value) return
  // 如果点击当前评分,则清除评分
  const finalRating = newRating === rating.value ? 0 : newRating
  await store.updateRating(currentRecord.value.id!, finalRating)
}

// ==================== 键盘导航 ====================
function gotoPrevious() {
  if (hasPrevious.value) {
    const prevRecord = records.value[currentIndex.value - 1]
    store.loadRecordDetail(prevRecord!.id!)
  }
}

function gotoNext() {
  if (hasNext.value) {
    const nextRecord = records.value[currentIndex.value + 1]
    store.loadRecordDetail(nextRecord!.id!)
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!currentRecord.value) return

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      gotoPrevious()
      break
    case 'ArrowRight':
      event.preventDefault()
      gotoNext()
      break
  }
}

// ==================== 状态 ====================
const contentVisible = ref(false)

// ==================== 生命周期 ====================
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  contentVisible.value = true
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    class="record-detail-container h-full flex flex-col bg-clay-bg-elevated rounded-clay-lg shadow-clay-card"
  >
    <!-- 加载指示器 -->
    <div v-if="loading.detail" class="flex-1 flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-clay-primary" />
    </div>

    <!-- 空状态 -->
    <EmptyState v-else-if="!currentRecord" type="record" @create="emit('edit')" />

    <!-- 记录详情 -->
    <template v-else>
      <!-- 头部操作栏 -->
      <div class="detail-header p-4 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- 收藏按钮 -->
          <button
            @click="toggleFavorite"
            :class="[
              'p-2 rounded-full transition-all duration-200',
              isFavorite
                ? 'text-red-500 bg-red-50 hover:bg-red-100'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50',
            ]"
            :title="isFavorite ? '取消收藏' : '收藏'"
          >
            <AppIcon :icon="isFavorite ? 'mdi:heart' : 'mdi:heart-outline'" :size="24" />
          </button>

          <!-- 导航按钮 -->
          <div class="flex items-center gap-2">
            <button
              @click="gotoPrevious"
              :disabled="!hasPrevious"
              :class="[
                'p-2 rounded-full transition-colors',
                hasPrevious
                  ? 'text-clay-text-primary hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed',
              ]"
              title="上一条 (←)"
            >
              <AppIcon icon="mdi:chevron-left" :size="24" />
            </button>
            <button
              @click="gotoNext"
              :disabled="!hasNext"
              :class="[
                'p-2 rounded-full transition-colors',
                hasNext
                  ? 'text-clay-text-primary hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed',
              ]"
              title="下一条 (→)"
            >
              <AppIcon icon="mdi:chevron-right" :size="24" />
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- 编辑按钮 -->
          <button
            @click="emit('edit')"
            class="clay-btn-secondary px-4 py-2 flex items-center gap-2"
          >
            <AppIcon icon="mdi:pencil" :size="18" />
            <span>编辑</span>
          </button>

          <!-- 删除按钮 -->
          <button
            @click="emit('delete')"
            class="px-4 py-2 rounded-clay-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2"
          >
            <AppIcon icon="mdi:delete" :size="18" />
            <span>删除</span>
          </button>
        </div>
      </div>

      <!-- 详情内容 -->
      <div class="detail-content flex-1 overflow-y-auto p-6 scrollbar-hide">
        <!-- 标题和元信息区域 -->
        <div class="flex items-start justify-between gap-6 mb-6">
          <!-- 左侧：标题和日期 -->
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-bold text-clay-text-primary mb-3">
              {{ currentRecord.title }}
            </h1>
            <div class="flex items-center gap-2 text-sm text-clay-text-secondary">
              <AppIcon icon="mdi:calendar" :size="16" />
              <span>{{ formattedDate }}</span>
            </div>
          </div>

          <!-- 右侧：评分和备注 -->
          <div class="flex flex-col gap-4 items-end">
            <!-- 评分 -->
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1">
                <button
                  v-for="star in 5"
                  :key="star"
                  @click="updateRating(star)"
                  :class="[
                    'transition-all duration-200 hover:scale-110',
                    star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200',
                  ]"
                  :title="`${star} 星`"
                >
                  <AppIcon icon="mdi:star" :size="20" />
                </button>
              </div>
            </div>

            <!-- 备注 -->
            <div
              v-if="currentRecord.remark"
              class="bg-clay-accent-yellow/10 rounded-clay-sm px-3 py-2 max-w-xs"
            >
              <p class="text-clay-text-secondary text-sm">{{ currentRecord.remark }}</p>
            </div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="prose max-w-none mb-6">
          <p
            :class="[
              'text-clay-text-primary text-base leading-relaxed whitespace-pre-wrap',
              contentVisible ? 'animate-fade-in' : 'blur-md',
            ]"
          >
            {{ currentRecord.content || '' }}
          </p>
        </div>

        <!-- 视频展示 -->
        <div v-if="hasVideos" class="mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="(videoUrl, index) in videoUrls"
              :key="`video-${index}`"
              class="relative rounded-clay-md overflow-hidden bg-black"
            >
              <video :src="videoUrl" controls class="w-full h-auto max-h-64" preload="metadata">
                您的浏览器不支持 video 标签
              </video>
            </div>
          </div>
        </div>

        <!-- 图片画廊 -->
        <ExpandableGallery v-if="hasImages" :images="imageUrls" class="mb-6" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail-content::-webkit-scrollbar {
  width: 6px;
}

.detail-content::-webkit-scrollbar-track {
  background: transparent;
}

.detail-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 确保内容区域不会被截断 */
.prose {
  max-width: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    filter: blur(10px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}
</style>

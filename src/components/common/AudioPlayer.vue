<script setup lang="ts">
/**
 * 音频播放器组件
 *
 * 功能说明：
 * - 手动配置音频列表（在组件内定义）
 * - 支持播放/暂停控制
 * - 支持音频列表选择
 * - 用户首次交互后自动播放
 * - 播放完毕后自动播放随机下一首（不重复当前歌曲）
 * - 懒加载音频（初始化不下载）
 * - 缓存播放状态和选择的歌曲
 * - 未选择歌曲时随机播放
 * - 避免重复创建音频实例
 * - 空状态提示（无音频文件时）
 */

// ==================== 音频列表 ====================
interface AudioItem {
  name: string
  path: string
}

// 手动定义音频列表
const audioList: AudioItem[] = [
  {
    name: '为你写诗',
    path: '/audio/为你写诗.mp3',
  },
  {
    name: 'Harvest Symphony',
    path: '/audio/harvest-symphony.mp3',
  },
  {
    name: 'Risk It All - Blue',
    path: '/audio/Risk It All - Blue.mp3',
  },
  {
    name: 'Summer Memories',
    path: '/audio/summer-memories.mp3',
  },
  {
    name: 'What Makes You Beautiful',
    path: '/audio/What Makes You Beautiful.mp3',
  },
].sort((a, b) => a.name.localeCompare(b.name)) // 按名称排序

// ==================== 状态管理 ====================
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.7)
const selectedAudio = ref<AudioItem | null>(null)
const isLoading = ref(false)
const showVolumeSlider = ref(false)
const hasUserInteracted = ref(false)

// 从 localStorage 恢复状态
const STORAGE_KEY = 'audio-player-state'

interface StoredState {
  volume: number
  selectedAudioName?: string
}

// ==================== 工具函数 ====================
function getRandomAudio(): AudioItem | null {
  if (audioList.length === 0) return null
  const randomIndex = Math.floor(Math.random() * audioList.length)
  return audioList[randomIndex]!
}

function saveState() {
  const state: StoredState = {
    volume: volume.value,
    selectedAudioName: selectedAudio.value?.name,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// ==================== 初始化 ====================
onMounted(() => {
  // 检查是否有音频文件
  if (audioList.length === 0) {
    console.warn('No audio files found in /public/audio directory')
    return
  }

  // 从 localStorage 恢复状态
  const savedState = localStorage.getItem(STORAGE_KEY)
  if (savedState) {
    try {
      const state: StoredState = JSON.parse(savedState)
      volume.value = state.volume

      // 恢复上次选择的歌曲，如果没有则随机选择
      if (state.selectedAudioName) {
        const savedAudio = audioList.find((a) => a.name === state.selectedAudioName)
        selectedAudio.value = savedAudio || getRandomAudio()
      } else {
        selectedAudio.value = getRandomAudio()
      }
    } catch (e) {
      console.error('Failed to restore audio player state:', e)
      selectedAudio.value = getRandomAudio()
    }
  } else {
    // 首次使用，随机选择一首歌
    selectedAudio.value = getRandomAudio()
  }

  // 监听用户交互事件
  const handleUserInteraction = () => {
    if (!hasUserInteracted.value) {
      hasUserInteracted.value = true
      // 用户首次交互后自动播放
      nextTick(() => {
        loadAndPlay()
      })
      // 移除监听器
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }

  document.addEventListener('click', handleUserInteraction, { once: true })
  document.addEventListener('keydown', handleUserInteraction, { once: true })
})

// ==================== 音频控制 ====================
function createAudioElement() {
  if (!audioRef.value) {
    audioRef.value = new Audio()
    audioRef.value.volume = volume.value

    // 监听音频事件
    audioRef.value.addEventListener('loadedmetadata', () => {
      duration.value = audioRef.value?.duration || 0
      isLoading.value = false
    })

    audioRef.value.addEventListener('timeupdate', () => {
      currentTime.value = audioRef.value?.currentTime || 0
    })

    audioRef.value.addEventListener('ended', () => {
      isPlaying.value = false
      currentTime.value = 0
      // 播放完毕后自动播放随机下一首
      playNextRandom()
    })

    audioRef.value.addEventListener('error', () => {
      isLoading.value = false
      isPlaying.value = false
      console.error('Audio loading error')
    })
  }
}

async function loadAndPlay() {
  if (!selectedAudio.value) {
    selectedAudio.value = getRandomAudio()
  }

  // 如果还是没有音频（列表为空），直接返回
  if (!selectedAudio.value) {
    console.warn('No audio available to play')
    return
  }

  createAudioElement()
  if (!audioRef.value) return

  isLoading.value = true

  // 如果音频源改变，重新加载
  if (audioRef.value.src !== selectedAudio.value.path) {
    audioRef.value.src = selectedAudio.value.path
    audioRef.value.load()
  }

  try {
    await audioRef.value.play()
    isPlaying.value = true
  } catch (error) {
    console.error('Failed to play audio:', error)
    isPlaying.value = false
  } finally {
    isLoading.value = false
  }
}

function togglePlay() {
  // 标记用户已交互
  hasUserInteracted.value = true

  if (!audioRef.value || !audioRef.value.src) {
    loadAndPlay()
    return
  }

  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play()
    isPlaying.value = true
  }
}

function selectAudio(audio: AudioItem) {
  // 标记用户已交互
  hasUserInteracted.value = true

  selectedAudio.value = audio
  if (audioRef.value) {
    audioRef.value.src = audio.path
    audioRef.value.load()
    currentTime.value = 0
    duration.value = 0
  }
  saveState()

  // 选择后自动播放
  nextTick(() => {
    loadAndPlay()
  })
}

function playNextRandom() {
  // 如果没有音频列表，直接返回
  if (audioList.length === 0) return

  // 如果只有一首歌，重新播放当前歌曲
  if (audioList.length === 1) {
    nextTick(() => {
      loadAndPlay()
    })
    return
  }

  // 随机选择下一首（确保不是当前歌曲）
  let nextAudio: AudioItem | null = null
  do {
    nextAudio = getRandomAudio()
  } while (nextAudio && selectedAudio.value && nextAudio.name === selectedAudio.value.name)

  if (nextAudio) {
    selectedAudio.value = nextAudio
    saveState()
    nextTick(() => {
      loadAndPlay()
    })
  }
}

function handleVolumeChange(event: Event) {
  const target = event.target as HTMLInputElement
  volume.value = parseFloat(target.value)
  if (audioRef.value) {
    audioRef.value.volume = volume.value
  }
  saveState()
}

function handleProgressClick(event: MouseEvent) {
  if (!audioRef.value || !duration.value) return

  const progressBar = event.currentTarget as HTMLElement
  const rect = progressBar.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const newTime = percent * duration.value

  audioRef.value.currentTime = newTime
  currentTime.value = newTime
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ==================== 计算属性 ====================
const progress = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

const volumeIcon = computed(() => {
  if (volume.value === 0) return 'mdi:volume-off'
  if (volume.value < 0.5) return 'mdi:volume-low'
  return 'mdi:volume-high'
})

// ==================== 清理 ====================
onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.src = ''
  }
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- 当前播放信息 -->
    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
      <div class="flex items-center gap-2 mb-2">
        <AppIcon icon="mdi:music-note" :size="16" class="text-purple-300" />
        <span class="text-xs font-medium text-white truncate">
          {{ selectedAudio?.name || '未选择' }}
        </span>
      </div>

      <!-- 进度条 -->
      <div
        @click="handleProgressClick"
        class="h-1.5 bg-white/20 rounded-full cursor-pointer mb-2 overflow-hidden"
      >
        <div
          class="h-full bg-linear-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-150"
          :style="{ width: `${progress}%` }"
        />
      </div>

      <!-- 时间显示 -->
      <div class="flex justify-between text-xs text-gray-300 mb-3">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>

      <!-- 控制按钮 -->
      <div class="flex items-center justify-between">
        <!-- 播放/暂停 -->
        <button
          @click="togglePlay"
          :disabled="isLoading"
          class="w-10 h-10 flex items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AppIcon v-if="isLoading" icon="mdi:loading" :size="20" class="text-white animate-spin" />
          <AppIcon
            v-else
            :icon="isPlaying ? 'mdi:pause' : 'mdi:play'"
            :size="20"
            class="text-white"
          />
        </button>

        <!-- 音量控制 -->
        <div class="relative flex items-center gap-2">
          <button
            @click="showVolumeSlider = !showVolumeSlider"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <AppIcon :icon="volumeIcon" :size="18" class="text-gray-300" />
          </button>

          <!-- 音量滑块 -->
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showVolumeSlider"
              class="absolute right-0 bottom-full mb-2 bg-gray-800/95 backdrop-blur-sm rounded-lg p-2 shadow-xl border border-white/10"
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="volume"
                @input="handleVolumeChange"
                class="w-20 h-1 accent-purple-500"
              />
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 音频列表 -->
    <div class="flex flex-col gap-1">
      <div class="text-xs font-bold text-white uppercase tracking-wider px-1">播放列表</div>

      <!-- 空状态提示 -->
      <div
        v-if="audioList.length === 0"
        class="flex flex-col items-center gap-2 py-4 px-3 text-center"
      >
        <AppIcon icon="mdi:music-off" :size="32" class="text-gray-400" />
        <p class="text-xs text-gray-400">未找到音频文件</p>
      </div>

      <!-- 音频列表 -->
      <div v-else class="flex flex-col gap-1">
        <button
          v-for="audio in audioList"
          :key="audio.name"
          @click="selectAudio(audio)"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200"
          :class="
            selectedAudio?.name === audio.name
              ? 'bg-purple-500/30 text-white border border-purple-400/50'
              : 'hover:bg-white/10 text-gray-300 border border-transparent'
          "
        >
          <AppIcon
            :icon="selectedAudio?.name === audio.name ? 'mdi:music-note' : 'mdi:music-note-outline'"
            :size="16"
          />
          <span class="truncate flex-1 text-left">{{ audio.name }}</span>
          <AppIcon
            v-if="selectedAudio?.name === audio.name"
            icon="mdi:check-circle"
            :size="14"
            class="text-purple-400"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义滑块样式 */
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type='range']::-webkit-slider-track {
  background: rgba(255, 255, 255, 0.2);
  height: 4px;
  border-radius: 2px;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: #a78bfa;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  margin-top: -4px;
}

input[type='range']::-moz-range-track {
  background: rgba(255, 255, 255, 0.2);
  height: 4px;
  border-radius: 2px;
}

input[type='range']::-moz-range-thumb {
  background: #a78bfa;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  border: none;
}
</style>

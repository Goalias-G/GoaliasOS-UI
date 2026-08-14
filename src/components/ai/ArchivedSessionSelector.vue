<script setup lang="ts">
import { chatSessionApi } from '@/api/modules/chat-session'
import { useSessionStore } from '@/stores/session'
import type { ChatSession } from '@/types'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:visible': [value: boolean] }>()
const sessionStore = useSessionStore()
const sessions = ref<ChatSession[]>([])
const loading = ref(false)

function close() {
  emit('update:visible', false)
}

async function loadArchivedSessions() {
  loading.value = true
  try {
    const response = await chatSessionApi.list({ archiveStatus: 1 }, { pageNum: 1, pageSize: 100 })
    if (response.code === 200) {
      sessions.value = response.data.list
    }
  } catch (error) {
    console.error('加载归档会话失败:', error)
  } finally {
    loading.value = false
  }
}

async function viewSession(session: ChatSession) {
  await sessionStore.viewArchivedSession(session)
  close()
}

async function unarchiveSession(session: ChatSession) {
  await sessionStore.unarchiveSession(session)
  sessions.value = sessions.value.filter((item) => item.id !== session.id)
}

async function deleteSession(session: ChatSession) {
  await sessionStore.deleteSession(session.id)
  sessions.value = sessions.value.filter((item) => item.id !== session.id)
}

function formatTime(value?: string) {
  if (!value) return '暂无更新时间'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const pad = (number: number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) loadArchivedSessions()
  },
)
</script>

<template>
  <Transition name="overlay">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="close"
    >
      <section class="clay-card flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden">
        <header class="flex items-center justify-between border-b border-clay-primary/10 px-6 py-4">
          <div>
            <h2 class="text-xl font-bold text-clay-text-primary">已归档会话记录</h2>
            <p class="mt-1 text-xs text-clay-text-muted">
              归档会话可查看、恢复或删除；查看时不能继续聊天。
            </p>
          </div>
          <button class="rounded-full p-2 hover:bg-clay-primary/10" title="关闭" @click="close">
            <AppIcon icon="mdi:close" :size="20" class="text-clay-text-secondary" />
          </button>
        </header>

        <div class="min-h-48 flex-1 overflow-y-auto px-6 py-4">
          <div v-if="loading" class="flex justify-center py-10 text-clay-text-muted">
            <AppIcon icon="mdi:loading" :size="28" class="animate-spin" />
          </div>
          <div
            v-else-if="sessions.length === 0"
            class="py-10 text-center text-sm text-clay-text-muted"
          >
            暂无已归档会话
          </div>
          <div v-else class="space-y-2">
            <article v-for="session in sessions" :key="session.id" class="clay-card px-4 py-3">
              <button class="block w-full text-left" @click="viewSession(session)">
                <p class="truncate text-sm font-semibold text-clay-text-primary">
                  {{ session.sessionTitle || '新对话' }}
                </p>
                <p class="mt-1 text-xs text-clay-text-muted">
                  更新于 {{ formatTime(session.updateTime || session.createTime) }}
                </p>
              </button>
              <div class="mt-3 flex justify-end gap-2 border-t border-clay-primary/10 pt-3">
                <button
                  class="clay-btn-secondary px-3 py-1.5 text-xs"
                  @click="unarchiveSession(session)"
                >
                  <AppIcon icon="mdi:archive-arrow-up-outline" :size="15" />
                  取消归档
                </button>
                <button
                  class="rounded-clay-sm px-3 py-1.5 text-xs text-red-500 hover:bg-red-500/10"
                  @click="deleteSession(session)"
                >
                  <AppIcon icon="mdi:delete-outline" :size="15" />
                  删除
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>

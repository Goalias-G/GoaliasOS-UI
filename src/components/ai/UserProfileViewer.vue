<script setup lang="ts">
import { chatSessionApi } from '@/api/modules/chat-session'

interface Props {
  visible: boolean
}

interface ProfileEntry {
  key: string
  label: string
  value: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:visible': [value: boolean] }>()
const context = ref<Record<string, string>>({})
const loading = ref(false)

const groups = computed(() => {
  const grouped = new Map<string, ProfileEntry[]>()
  Object.entries(context.value).forEach(([key, value]) => {
    const [group = '其他', ...segments] = key.split('.')
    const entries = grouped.get(group) || []
    entries.push({ key, label: segments.join('.') || group, value })
    grouped.set(group, entries)
  })
  return [...grouped.entries()].map(([name, entries]) => ({ name, entries }))
})

function close() {
  emit('update:visible', false)
}

async function loadContext() {
  loading.value = true
  try {
    const response = await chatSessionApi.getUserContext()
    if (response.code === 200) context.value = response.data || {}
  } catch (error) {
    console.error('加载用户画像失败:', error)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) loadContext()
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
            <h2 class="text-xl font-bold text-clay-text-primary">用户画像</h2>
            <p class="mt-1 text-xs text-clay-text-muted">由 AI 对话上下文生成，仅供查看。</p>
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
            v-else-if="groups.length === 0"
            class="py-10 text-center text-sm text-clay-text-muted"
          >
            暂无用户画像数据
          </div>
          <div v-else class="space-y-4">
            <section
              v-for="group in groups"
              :key="group.name"
              class="rounded-clay-md bg-clay-bg-base p-4"
            >
              <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-clay-text-primary">
                <AppIcon icon="mdi:account-details-outline" :size="17" class="text-clay-primary" />
                {{ group.name }}
              </h3>
              <dl class="space-y-2">
                <div
                  v-for="entry in group.entries"
                  :key="entry.key"
                  class="grid grid-cols-[minmax(6rem,auto)_1fr] gap-4 text-sm"
                >
                  <dt class="text-clay-text-muted">{{ entry.label }}</dt>
                  <dd class="break-words text-clay-text-primary">{{ entry.value }}</dd>
                </div>
              </dl>
            </section>
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

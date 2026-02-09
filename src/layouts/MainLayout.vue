<script setup lang="ts">
/**
 * 主布局组件 - 占满整个视口
 */
import { useUserStore } from '@/stores/user'
import { mainRoutes, type AppRouteMeta } from '@/router/routes'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isUserMenuOpen = ref<boolean>(false)

// ==================== MorphingTabs 导航 ====================
const activeTab = computed(() => {
  const current = navItems.value.find((item) => isActive(item.path))
  return current?.title || ''
})

const tabTitles = computed(() => navItems.value.map((item) => item.title))
const tabIcons = computed(() => navItems.value.map((item) => item.icon))

function handleTabChange(title: string) {
  const item = navItems.value.find((i) => i.title === title)
  if (item) {
    router.push(item.path)
  }
}

const navItems = computed(() => {
  return mainRoutes
    .filter((r) => !(r.meta as AppRouteMeta)?.hidden)
    .map((r) => ({
      name: r.name as string,
      path: r.path === '' ? '/' : `/${r.path}`,
      title: (r.meta as AppRouteMeta)?.title || r.name,
      icon: (r.meta as AppRouteMeta)?.icon || 'mdi:circle',
    }))
})

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

function closeUserMenu() {
  isUserMenuOpen.value = false
}

async function handleLogout() {
  await userStore.logout()
  router.push('/auth/login')
  closeUserMenu()
}
</script>

<template>
  <div class="w-screen h-screen flex flex-col overflow-hidden bg-clay-bg-base">
    <!-- 顶部导航栏 -->
    <header class="w-full h-16 shrink-0 bg-clay-bg-base border-clay-bg-elevated/50">
      <div class="h-full mx-auto px-6 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2">
          <div
            class="w-10 h-10 bg-linear-to-br from-yellow-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md"
          >
            <AppIcon icon="mdi:synagogue" :size="30" color="white" />
          </div>
          <span
            class="text-xl font-bold bg-linear-to-r from-purple-500 to-yellow-600 bg-clip-text text-transparent"
          >
            GoaliasOS
          </span>
        </router-link>

        <!-- 导航菜单 - MorphingTabs -->
        <MorphingTabs
          :tabs="tabTitles"
          v-model:activeTab="activeTab"
          :icons="tabIcons"
          :margin="16"
          :blurStdDeviation="5"
          @update:activeTab="handleTabChange"
        />

        <!-- 用户信息 -->
        <div class="relative">
          <button
            @click="toggleUserMenu"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div
              class="w-8 h-8 rounded-full bg-linear-to-br from-yellow-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium"
            >
              {{ userStore.nickName.charAt(0).toUpperCase() }}
            </div>
            <span class="text-sm font-medium text-gray-700">{{ userStore.nickName }}</span>
            <AppIcon
              icon="mdi:chevron-down"
              :size="16"
              class="text-gray-500 transition-transform"
              :class="{ 'rotate-180': isUserMenuOpen }"
            />
          </button>

          <div
            v-if="isUserMenuOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
            @mouseleave="closeUserMenu"
          >
            <div class="px-4 py-2 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900">{{ userStore.nickName }}</p>
              <p class="text-xs text-gray-500 truncate">
                {{ userStore.userInfo?.loginIp || '未知 IP' }}
              </p>
            </div>
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <AppIcon icon="mdi:logout" :size="16" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="flex-1 overflow-auto">
      <div class="mx-auto h-full">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 覆盖 MorphingTabs 样式以匹配 Clay 设计系统 */
:deep(.bg-primary) {
  background-color: var(--clay-primary) !important;
}

:deep(.text-background) {
  color: var(--clay-text-inverse) !important;
}
</style>

<script setup lang="ts">
/**
 * 主布局组件 - 占满整个视口
 */
import { useUserStore } from '@/stores/user'
import { mainRoutes, type AppRouteMeta } from '@/router/routes'
import AppIcon from '@/components/common/AppIcon.vue'
import AudioPlayer from '@/components/common/AudioPlayer.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isUserMenuOpen = ref<boolean>(false)
const isMobileMenuOpen = ref<boolean>(false)
const mainRef = ref<HTMLElement | null>(null)

// ==================== Cursor 配置 ====================
type CursorType = 'default' | 'sleek-line' | 'fluid'
const currentCursor = ref<CursorType>('default')

function setCursor(type: CursorType) {
  currentCursor.value = type
}

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
    .filter((r) => {
      const meta = r.meta as AppRouteMeta
      // 过滤隐藏的路由
      if (meta?.hidden) return false
      // 过滤需要管理员权限但用户不是管理员的路由
      if (meta?.requiresAdmin && !userStore.isAdmin) return false
      return true
    })
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

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function handleMobileNavClick(path: string) {
  router.push(path)
  closeMobileMenu()
}

async function handleLogout() {
  await userStore.logout()
  router.push('/auth/login')
  closeUserMenu()
}

onMounted(userStore.init)
</script>

<template>
  <div class="w-screen h-screen flex flex-col overflow-hidden bg-clay-bg-base">
    <ScrollIsland title="OS" :scroll-container="mainRef">
      <div class="flex flex-col gap-4 p-1">
        <!-- Cursor 设置区域 -->
        <div class="flex flex-col gap-2">
          <div class="text-xs font-bold text-white uppercase tracking-wider px-1 drop-shadow-lg">
            鼠标样式
          </div>
          <div class="flex flex-col gap-1.5">
            <button
              @click="setCursor('default')"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              :class="
                currentCursor === 'default'
                  ? 'bg-purple-500/30 text-white border border-purple-400/50 shadow-lg'
                  : 'hover:bg-white/10 text-gray-200 border border-white/10'
              "
            >
              <AppIcon icon="mdi:cursor-default" :size="16" />
              <span>默认</span>
              <AppIcon
                v-if="currentCursor === 'default'"
                icon="mdi:check-circle"
                :size="14"
                class="ml-auto text-purple-300"
              />
            </button>

            <button
              @click="setCursor('sleek-line')"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              :class="
                currentCursor === 'sleek-line'
                  ? 'bg-purple-500/30 text-white border border-purple-400/50 shadow-lg'
                  : 'hover:bg-white/10 text-gray-200 border border-white/10'
              "
            >
              <AppIcon icon="mdi:vector-line" :size="16" />
              <span>柔性线</span>
              <AppIcon
                v-if="currentCursor === 'sleek-line'"
                icon="mdi:check-circle"
                :size="14"
                class="ml-auto text-purple-300"
              />
            </button>

            <button
              @click="setCursor('fluid')"
              class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              :class="
                currentCursor === 'fluid'
                  ? 'bg-purple-500/30 text-white border border-purple-400/50 shadow-lg'
                  : 'hover:bg-white/10 text-gray-200 border border-white/10'
              "
            >
              <AppIcon icon="mdi:water" :size="16" />
              <span>流性纹</span>
              <AppIcon
                v-if="currentCursor === 'fluid'"
                icon="mdi:check-circle"
                :size="14"
                class="ml-auto text-purple-300"
              />
            </button>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
        <div class="text-xs font-bold text-white uppercase tracking-wider px-1 drop-shadow-lg">
          音频播放器
        </div>
        <!-- 音频播放器 -->
        <AudioPlayer />

        <!-- 分隔线 -->
        <div class="h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>

        <!-- 其他设置预留区域 -->
        <div class="flex flex-col gap-2">
          <div class="text-xs font-bold text-white uppercase tracking-wider px-1 drop-shadow-lg">
            更多设置
          </div>
          <div class="text-xs text-gray-300 italic px-1">敬请期待...</div>
        </div>
      </div>
    </ScrollIsland>

    <!-- Cursor 效果组件 -->
    <SleekLineCursor v-if="currentCursor === 'sleek-line'" />
    <FluidCursor v-if="currentCursor === 'fluid'" />
    <!-- 顶部导航栏 -->
    <header class="w-full h-16 shrink-0 bg-clay-bg-base border-clay-bg-elevated/50">
      <div class="h-full mx-auto px-4 md:px-6 flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2">
          <div
            class="w-10 h-10 bg-linear-to-br from-yellow-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md"
          >
            <AppIcon icon="hugeicons:agreement-01" :size="30" color="white" />
          </div>
          <span
            class="text-lg md:text-xl font-bold bg-linear-to-r from-purple-500 to-yellow-600 bg-clip-text text-transparent"
          >
            Goalias OS
          </span>
        </router-link>

        <!-- 导航菜单 - MorphingTabs (桌面端) -->
        <MorphingTabs
          class="hidden lg:block"
          :tabs="tabTitles"
          v-model:activeTab="activeTab"
          :icons="tabIcons"
          :margin="16"
          :blurStdDeviation="5"
          @update:activeTab="handleTabChange"
        />

        <!-- 右侧操作区 -->
        <div class="flex items-center gap-2">
          <!-- 用户信息 (桌面端) -->
          <div class="relative hidden md:block">
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

          <!-- 汉堡菜单按钮 (移动端) -->
          <button
            @click="toggleMobileMenu"
            class="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            :class="{ 'bg-gray-100': isMobileMenuOpen }"
          >
            <AppIcon
              :icon="isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'"
              :size="24"
              class="text-gray-700"
            />
          </button>
        </div>
      </div>
    </header>

    <!-- 移动端导航菜单 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="isMobileMenuOpen"
        class="lg:hidden absolute top-16 left-0 right-0 z-40 bg-clay-bg-elevated shadow-clay-card mx-4 rounded-clay-md overflow-hidden"
      >
        <!-- 导航项 -->
        <nav class="py-2">
          <button
            v-for="item in navItems"
            :key="item.name"
            @click="handleMobileNavClick(item.path)"
            class="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200"
            :class="
              isActive(item.path)
                ? 'bg-clay-primary text-clay-text-inverse'
                : 'text-clay-text-primary hover:bg-gray-100'
            "
          >
            <AppIcon :icon="item.icon" :size="20" />
            <span class="text-sm font-medium">{{ item.title }}</span>
            <AppIcon v-if="isActive(item.path)" icon="mdi:check" :size="16" class="ml-auto" />
          </button>
        </nav>

        <!-- 用户信息区 (移动端) -->
        <div class="border-t border-gray-200 md:hidden">
          <div class="px-4 py-3 bg-gray-50">
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 to-purple-500 flex items-center justify-center text-white font-medium"
              >
                {{ userStore.nickName.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ userStore.nickName }}</p>
                <p class="text-xs text-gray-500">
                  {{ userStore.userInfo?.loginIp || '未知 IP' }}
                </p>
              </div>
            </div>
            <button
              @click="handleLogout"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <AppIcon icon="mdi:logout" :size="16" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 移动端遮罩层 -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        @click="closeMobileMenu"
        class="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
      />
    </Transition>

    <!-- 主内容区域 -->
    <main ref="mainRef" class="flex-1 overflow-auto">
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

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
            class="w-10 h-10 bg-gradient-clay-primary rounded-lg flex items-center justify-center shadow-clay-button border-2 border-clay-primary-light/50"
          >
            <AppIcon icon="hugeicons:agreement-01" :size="30" color="white" />
          </div>
          <span class="text-lg md:text-xl font-bold text-clay-primary"> Goalias OS </span>
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
              class="flex items-center gap-2 px-3 py-1.5 rounded-clay-sm transition-all duration-200 shadow-clay-card hover:shadow-clay-hover border-2"
              :class="
                isUserMenuOpen
                  ? 'bg-clay-primary/10 border-clay-primary/40'
                  : 'bg-clay-bg-elevated hover:bg-clay-bg-base border-clay-primary/20'
              "
            >
              <div
                v-if="userStore.avatar"
                class="w-8 h-8 rounded-full overflow-hidden shadow-clay-button border-2 border-clay-primary-light/50"
              >
                <img
                  :src="userStore.avatar"
                  :alt="userStore.nickName"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-8 h-8 rounded-full bg-gradient-clay-primary flex items-center justify-center text-white text-sm font-bold shadow-clay-button border-2 border-clay-primary-light/50"
              >
                {{ userStore.nickName.charAt(0).toUpperCase() }}
              </div>
              <span class="text-sm font-medium text-clay-text-primary"
                >{{ userStore.nickName }}
              </span>
              <AppIcon
                icon="mdi:chevron-down"
                :size="16"
                class="text-clay-text-secondary transition-transform duration-200"
                :class="{ 'rotate-180': isUserMenuOpen }"
              />
            </button>

            <div
              v-if="isUserMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-clay-bg-elevated rounded-clay-md shadow-clay-card border-2 border-clay-primary/30 py-1 z-50 overflow-hidden"
              @mouseleave="closeUserMenu"
            >
              <div class="px-4 py-2 border-b-2 border-clay-primary/20 bg-gradient-clay-user">
                <p class="text-sm font-medium text-clay-text-primary">{{ userStore.nickName }}</p>
                <p class="text-xs text-clay-text-muted truncate">
                  {{ userStore.userInfo?.loginIp || '未知 IP' }}
                </p>
              </div>
              <button
                @click="handleLogout"
                class="w-full flex items-center gap-2 px-4 py-2 text-sm text-clay-error hover:bg-clay-error/10 active:bg-clay-error/20 transition-all duration-200"
              >
                <AppIcon icon="mdi:logout" :size="16" />
                <span>退出登录</span>
              </button>
            </div>
          </div>

          <!-- 汉堡菜单按钮 (移动端) -->
          <button
            @click="toggleMobileMenu"
            class="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200"
            :class="
              isMobileMenuOpen
                ? 'bg-clay-primary shadow-clay-button'
                : 'bg-clay-bg-elevated shadow-clay-card hover:shadow-clay-hover'
            "
          >
            <AppIcon
              :icon="isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'"
              :size="24"
              :class="isMobileMenuOpen ? 'text-white' : 'text-clay-text-primary'"
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
        class="lg:hidden absolute top-16 left-0 right-0 z-40 bg-clay-bg-elevated shadow-clay-card mx-4 rounded-clay-md overflow-hidden border-2 border-clay-primary/30"
      >
        <!-- 导航项 -->
        <nav class="py-2">
          <button
            v-for="item in navItems"
            :key="item.name"
            @click="handleMobileNavClick(item.path)"
            class="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 relative"
            :class="
              isActive(item.path)
                ? 'bg-gradient-clay-nav text-clay-primary shadow-inner'
                : 'text-clay-text-primary hover:bg-clay-bg-base active:bg-clay-primary/5'
            "
          >
            <!-- 选中指示器 -->
            <div
              v-if="isActive(item.path)"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-clay-primary rounded-r-full shadow-lg"
            ></div>
            <AppIcon
              :icon="item.icon"
              :size="20"
              :class="isActive(item.path) ? 'text-clay-primary' : 'text-clay-text-secondary'"
            />
            <span class="text-sm font-medium">{{ item.title }}</span>
            <AppIcon
              v-if="isActive(item.path)"
              icon="mdi:check-circle"
              :size="18"
              class="ml-auto text-clay-primary"
            />
          </button>
        </nav>

        <!-- 用户信息区 (移动端) -->
        <div class="border-t-2 border-clay-primary/20 md:hidden">
          <div class="px-4 py-3 bg-gradient-clay-user">
            <div class="flex items-center gap-3 mb-3">
              <div
                v-if="userStore.avatar"
                class="w-10 h-10 rounded-full overflow-hidden shadow-clay-button border-2 border-clay-primary-light/50"
              >
                <img
                  :src="userStore.avatar"
                  :alt="userStore.nickName"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-10 h-10 rounded-full bg-gradient-clay-primary flex items-center justify-center text-white font-bold shadow-clay-button border-2 border-clay-primary-light/50"
              >
                {{ userStore.nickName.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="text-sm font-medium text-clay-text-primary">{{ userStore.nickName }}</p>
                <p class="text-xs text-clay-text-muted">
                  {{ userStore.userInfo?.loginIp || '未知 IP' }}
                </p>
              </div>
            </div>
            <button
              @click="handleLogout"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-clay-error/10 text-clay-error rounded-clay-sm text-sm font-medium hover:bg-clay-error/20 active:bg-clay-error/30 transition-all duration-200 shadow-clay-button hover:shadow-clay-hover border-2 border-clay-error/20"
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

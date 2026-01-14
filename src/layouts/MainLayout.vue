<script setup lang="ts">
/**
 * 主布局组件 - 占满整个视口
 */
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { mainRoutes, type AppRouteMeta } from '@/router/routes'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isUserMenuOpen = ref(false)

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

function handleLogout() {
    userStore.logout()
    router.push('/auth/login')
    closeUserMenu()
}
</script>

<template>
    <div class="w-screen h-screen flex flex-col overflow-hidden bg-gray-50">
        <!-- 顶部导航栏 -->
        <header class="w-full h-16 shrink-0 bg-white border-b border-gray-200">
            <div class="h-full mx-auto px-6 flex items-center justify-between">
                <!-- Logo -->
                <router-link to="/" class="flex items-center gap-2">
                    <div
                        class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                        <AppIcon icon="mdi:rocket-launch" :size="20" color="white" />
                    </div>
                    <span
                        class="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        GoaliasOS App
                    </span>
                </router-link>

                <!-- 导航菜单 -->
                <nav class="flex items-center gap-1">
                    <router-link v-for="item in navItems" :key="item.name" :to="item.path"
                        class="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        :class="[
                            isActive(item.path)
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        ]">
                        <AppIcon :icon="item.icon" :size="18" />
                        <span>{{ item.title }}</span>
                    </router-link>
                </nav>

                <!-- 用户信息 -->
                <div class="relative">
                    <button @click="toggleUserMenu"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <div
                            class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                            {{ userStore.username.charAt(0).toUpperCase() }}
                        </div>
                        <span class="text-sm font-medium text-gray-700">{{ userStore.username }}</span>
                        <AppIcon icon="mdi:chevron-down" :size="16" class="text-gray-500 transition-transform"
                            :class="{ 'rotate-180': isUserMenuOpen }" />
                    </button>

                    <div v-if="isUserMenuOpen"
                        class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
                        @mouseleave="closeUserMenu">
                        <div class="px-4 py-2 border-b border-gray-100">
                            <p class="text-sm font-medium text-gray-900">{{ userStore.username }}</p>
                            <p class="text-xs text-gray-500 truncate">{{ userStore.userInfo?.email || '未设置邮箱' }}</p>
                        </div>
                        <button @click="handleLogout"
                            class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
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

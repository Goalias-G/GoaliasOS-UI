<script setup lang="ts">
/**
 * 登录页面 - 占满整个视口
 */
import { useUserStore } from '@/stores'
import AppIcon from '@/components/common/AppIcon.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const isFormValid = computed(() => username.value.trim().length > 0 && password.value.length >= 1)

async function handleLogin() {
    if (!isFormValid.value || isLoading.value) return
    errorMessage.value = ''
    isLoading.value = true

    try {
        await userStore.login({ username: username.value.trim(), password: password.value })
        router.push((route.query.redirect as string) || '/')
    } catch (error: any) {
        errorMessage.value = error?.message || '登录失败'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="w-screen h-screen flex overflow-hidden">
        <!-- 左侧品牌区域 -->
        <div
            class="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-12 flex-col justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <AppIcon icon="mdi:rocket-launch" :size="24" color="white" />
                </div>
                <span class="text-xl font-bold text-white">GoaliasOS</span>
            </div>

            <div class="max-w-lg">
                <h1 class="text-4xl font-bold text-white mb-6">现代化前端开发框架</h1>
                <p class="text-lg text-indigo-100 leading-relaxed">
                    基于 Vue 3 + TypeScript + Vite + Tailwind CSS 构建的企业级前端项目模板。
                </p>
                <div class="flex gap-3 mt-8">
                    <span class="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Vue 3</span>
                    <span class="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">TypeScript</span>
                    <span class="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Vite</span>
                    <span class="px-4 py-2 bg-white/10 rounded-lg text-white text-sm">Tailwind</span>
                </div>
            </div>

            <p class="text-indigo-200 text-sm">© {{ new Date().getFullYear() }} GoaliasOS</p>
        </div>

        <!-- 右侧登录表单 -->
        <div class="flex-1 flex items-center justify-center p-8 lg:p-12 bg-gray-50">
            <div class="w-full max-w-md">
                <div class="lg:hidden text-center mb-8">
                    <div
                        class="inline-flex items-center justify-center w-14 h-14 bg-indigo-500 rounded-2xl shadow-lg mb-4">
                        <AppIcon icon="mdi:rocket-launch" :size="28" color="white" />
                    </div>
                    <h1 class="text-xl font-bold text-gray-900">GoaliasOS</h1>
                </div>

                <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-900">登录账户</h2>
                    <p class="text-gray-500 mt-2">请输入您的账户信息</p>
                </div>

                <form @submit.prevent="handleLogin" class="space-y-5">
                    <div v-if="errorMessage"
                        class="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3">
                        <AppIcon icon="mdi:alert-circle" :size="20" class="text-red-500" />
                        <span class="text-sm text-red-600">{{ errorMessage }}</span>
                    </div>

                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">用户名</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <AppIcon icon="mdi:account-outline" :size="20" class="text-gray-400" />
                            </div>
                            <input v-model="username" type="text" placeholder="请输入用户名"
                                class="w-full h-11 pl-12 pr-4 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">密码</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <AppIcon icon="mdi:lock-outline" :size="20" class="text-gray-400" />
                            </div>
                            <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码"
                                class="w-full h-11 pl-12 pr-12 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                            <button type="button" @click="showPassword = !showPassword"
                                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                                <AppIcon :icon="showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" :size="20" />
                            </button>
                        </div>
                    </div>

                    <button type="submit" :disabled="!isFormValid || isLoading"
                        class="w-full h-11 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2">
                        <AppIcon v-if="isLoading" icon="mdi:loading" :size="20" class="animate-spin" />
                        <span>{{ isLoading ? '登录中...' : '登录' }}</span>
                    </button>
                </form>

                <p class="mt-8 text-center text-sm text-gray-400">演示账号：任意用户名 / 任意密码</p>
            </div>
        </div>
    </div>
</template>

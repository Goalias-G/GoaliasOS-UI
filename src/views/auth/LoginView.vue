<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()

// ==================== 表单状态 ====================
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// ==================== 计算属性 ====================
const isFormValid = computed(() => username.value.trim().length > 0 && password.value.length > 0)

// ==================== 方法 ====================
async function handleLogin() {
    if (!isFormValid.value || isLoading.value) return

    errorMessage.value = ''
    isLoading.value = true

    try {
        await userStore.login({
            username: username.value.trim(),
            password: password.value,
        })

        // 登录成功，跳转到目标页面或首页
        const redirect = (route.query.redirect as string) || '/'
        router.push(redirect)
    } catch (error: any) {
        console.error('登录失败:', error)
        errorMessage.value = error?.message || '登录失败，请检查用户名和密码'
    } finally {
        isLoading.value = false
    }
}

// 快捷键支持
function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && isFormValid.value) {
        handleLogin()
    }
}

</script>

<template>
    <div class="relative w-screen h-screen overflow-hidden bg-clay-bg-base">
        <!-- 背景动画 -->
        <FallingStarsBg :color="themeStore.getThemeColor()" />

        <!-- 登录卡片 -->
        <div class="relative z-10 w-full h-full flex items-center justify-center p-4">
            <div class="w-full max-w-md">
                <!-- Logo 和标题 -->
                <div class="text-center mb-8">
                    <div
                        class="inline-flex items-center justify-center w-20 h-20 bg-clay-bg-elevated rounded-clay-lg shadow-clay-card mb-6 animate-float">
                        <AppIcon icon="mdi:heart-pulse" :size="50" class="text-clay-primary" />
                    </div>
                    <h1 class="text-3xl font-heading font-bold text-clay-text-primary mb-2">
                        Goalias OS
                    </h1>
                    <p class="text-clay-text-secondary">--专注于个人成长与记录的贴身"操作系统"~</p>
                </div>

                <!-- 登录表单卡片 -->
                <div class="clay-card p-10 animate-breathe" @keydown="handleKeydown">
                    <h2 class="text-xl font-heading font-bold text-clay-text-primary mb-6">
                        登录账户
                    </h2>

                    <!-- 错误提示 -->
                    <div v-if="errorMessage"
                        class="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-clay-sm flex items-start gap-3">
                        <AppIcon icon="mdi:alert-circle" :size="20" class="text-red-500 shrink-0 mt-0.5" />
                        <span class="text-sm text-red-600">{{ errorMessage }}</span>
                    </div>

                    <form @submit.prevent="handleLogin">
                        <!-- 用户名输入 -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-clay-text-primary mb-2">
                                用户名
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <AppIcon icon="mdi:account-outline" :size="20" class="text-clay-text-muted" />
                                </div>
                                <input v-model="username" type="text" placeholder="请输入用户名" autocomplete="username"
                                    class="pl-12 clay-input w-full " />
                            </div>
                        </div>

                        <!-- 密码输入 -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-clay-text-primary mb-2">
                                密码
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <AppIcon icon="mdi:lock-outline" :size="20" class="text-clay-text-muted" />
                                </div>
                                <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码"
                                    autocomplete="current-password" class="clay-input w-full pl-12 pr-12" />
                                <button type="button" @click="showPassword = !showPassword"
                                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-clay-text-muted hover:text-clay-text-secondary transition-colors">
                                    <AppIcon :icon="showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'"
                                        :size="20" />
                                </button>
                            </div>
                        </div>

                        <!-- 登录按钮 -->
                        <button type="submit" :disabled="!isFormValid || isLoading"
                            class="clay-btn w-full h-12 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8">
                            <AppIcon v-if="isLoading" icon="mdi:loading" :size="20" class="animate-spin" />
                            <span class="font-medium">{{ isLoading ? '登录中...' : '登录' }}</span>
                        </button>
                    </form>
                </div>

                <!-- 底部信息 -->
                <div class="mt-8 text-center">
                    <p class="text-sm text-clay-text-muted">
                        © {{ new Date().getFullYear() }} Goalias OS. 健康生活，从今天开始
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>

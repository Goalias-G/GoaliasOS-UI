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
const rememberMe = ref(false)

// ==================== 生命周期 ====================
onMounted(() => {
  const savedUsername = localStorage.getItem('rememberedUsername')
  if (savedUsername) {
    username.value = savedUsername
    rememberMe.value = true
  }
})

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

    // 处理"记住我" - 只存储用户名，不存储密码
    if (rememberMe.value) {
      localStorage.setItem('rememberedUsername', username.value.trim())
    } else {
      localStorage.removeItem('rememberedUsername')
    }

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
  <div class="relative w-screen min-h-screen overflow-y-auto bg-clay-bg-base">
    <!-- 背景动画 -->
    <FallingStarsBg :color="themeStore.getThemeColor()" />

    <!-- 登录卡片 -->
    <div
      class="relative z-10 w-full min-h-screen flex items-center justify-center p-4 py-6 sm:py-8"
    >
      <div class="w-full max-w-md">
        <!-- Logo 和标题 -->
        <div class="text-center mb-4 sm:mb-6">
          <div
            class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-clay-bg-elevated rounded-clay-lg shadow-clay-card mb-3 sm:mb-4 animate-float"
          >
            <AppIcon
              icon="hugeicons:agreement-01"
              :size="40"
              class="text-clay-primary sm:!w-[50px] sm:!h-[50px]"
            />
          </div>
          <SparklesText
            text="Goalias OS"
            :colors="{ first: 'pink', second: 'orange' }"
            :sparkles-count="10"
            class="text-3xl font-heading font-bold text-clay-text-primary mb-1 sm:mb-2"
          />
          <p class="text-sm sm:text-base text-clay-text-secondary px-2">
            --专注于个人成长与记录的贴身"操作系统"~
          </p>
        </div>

        <!-- 登录表单卡片 -->
        <div class="clay-card p-6 sm:p-8 animate-breathe" @keydown="handleKeydown">
          <h2
            class="flex items-center text-lg sm:text-xl font-heading font-bold text-clay-text-primary mb-4 sm:mb-5"
          >
            <span>登录账户</span>
            <span
              class="flex-1 text-[12px] leading-tight font-normal text-clay-text-muted text-right"
            >
              <span class="inline-flex flex-col items-start gap-0.5">
                <span>游客用户名: <span class="text-clay-primary">user</span></span>
                <span>游客密码: <span class="text-clay-primary">user123456</span></span>
              </span>
            </span>
          </h2>

          <!-- 错误提示 -->
          <div
            v-if="errorMessage"
            class="mb-4 p-3 bg-red-50 border-2 border-red-100 rounded-clay-sm flex items-start gap-2"
          >
            <AppIcon icon="mdi:alert-circle" :size="18" class="text-red-500 shrink-0 mt-0.5" />
            <span class="text-xs sm:text-sm text-red-600">{{ errorMessage }}</span>
          </div>

          <form @submit.prevent="handleLogin">
            <!-- 用户名输入 -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-clay-text-primary mb-1.5">
                用户名
              </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none"
                >
                  <AppIcon icon="mdi:account-outline" :size="18" class="text-clay-text-muted" />
                </div>
                <input
                  v-model="username"
                  type="text"
                  placeholder="请输入用户名"
                  autocomplete="username"
                  class="pl-10 sm:pl-12 clay-input w-full text-sm sm:text-base"
                />
              </div>
            </div>

            <!-- 密码输入 -->
            <div class="mb-3">
              <label class="block text-sm font-medium text-clay-text-primary mb-1.5"> 密码 </label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none"
                >
                  <AppIcon icon="mdi:lock-outline" :size="18" class="text-clay-text-muted" />
                </div>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                  class="clay-input w-full pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-clay-text-muted hover:text-clay-text-secondary transition-colors"
                >
                  <AppIcon
                    :icon="showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'"
                    :size="18"
                  />
                </button>
              </div>
            </div>

            <!-- 记住我 -->
            <div class="flex items-center mb-5">
              <button
                type="button"
                @click="rememberMe = !rememberMe"
                class="flex items-center gap-2 text-xs sm:text-sm text-clay-text-secondary hover:text-clay-text-primary transition-colors"
              >
                <div
                  class="w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors"
                  :class="
                    rememberMe ? 'bg-clay-primary border-clay-primary' : 'border-clay-text-muted'
                  "
                >
                  <AppIcon
                    v-if="rememberMe"
                    icon="mdi:check"
                    :size="12"
                    class="text-white sm:!w-[14px] sm:!h-[14px]"
                  />
                </div>
                <span>记住我</span>
              </button>
            </div>

            <!-- 登录按钮 -->
            <button
              type="submit"
              :disabled="!isFormValid || isLoading"
              class="clay-btn w-full h-11 sm:h-12 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              <AppIcon v-if="isLoading" icon="mdi:loading" :size="18" class="animate-spin" />
              <span class="font-medium text-sm sm:text-base">{{
                isLoading ? '登录中...' : '登录'
              }}</span>
            </button>
          </form>
        </div>

        <!-- 底部信息 -->
        <div class="mt-4 sm:mt-6 text-center space-y-1.5">
          <p class="text-xs sm:text-sm text-clay-text-muted">
            Copyright © {{ new Date().getFullYear() }} Goalias OS. All rights reserved. {Built with
            💙}
          </p>
          <div class="text-xs sm:text-sm text-clay-text-muted">
            ICP证:
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              class="text-clay-primary hover:text-clay-primary-dark transition-colors underline"
              >鲁ICP备2025150744号-1</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

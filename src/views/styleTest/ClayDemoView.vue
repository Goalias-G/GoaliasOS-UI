<script setup lang="ts">
/**
 * Claymorphism 工具类演示页面
 * 展示如何在实际场景中使用 Clay 工具类
 */
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const selectedPlan = ref<string | null>(null)

const plans = [
  {
    id: 'free',
    name: '免费版',
    price: '¥0',
    period: '/月',
    features: ['基础功能', '5GB 存储空间', '社区支持'],
    color: 'var(--clay-text-secondary)',
  },
  {
    id: 'pro',
    name: '专业版',
    price: '¥99',
    period: '/月',
    features: ['所有基础功能', '100GB 存储空间', '优先支持', '高级分析'],
    color: 'var(--clay-primary)',
    popular: true,
  },
  {
    id: 'enterprise',
    name: '企业版',
    price: '¥299',
    period: '/月',
    features: ['所有专业功能', '无限存储空间', '24/7 专属支持', '自定义集成'],
    color: 'var(--clay-accent-pink)',
  },
]

function handleLogin() {
  console.log('登录', { username: username.value, password: password.value })
}

function selectPlan(planId: string) {
  selectedPlan.value = planId
  console.log('选择套餐', planId)
}
</script>

<template>
  <div class="min-h-full p-8">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-12 text-center">
        <h1 class="mb-4">Claymorphism 工具类演示</h1>
        <p class="text-clay-text-secondary text-lg">在实际场景中使用 Clay 工具类构建美观的界面</p>
        <div class="mt-4 flex gap-4 justify-center">
          <RouterLink to="/style-test" class="clay-btn-secondary"> 查看样式测试页面 </RouterLink>
          <RouterLink to="/tailwind-test" class="clay-btn-secondary">
            查看 Tailwind 配置测试
          </RouterLink>
        </div>
      </div>

      <!-- 场景 1：登录表单 -->
      <section class="mb-16">
        <h2 class="mb-6">场景 1：登录表单</h2>
        <div class="max-w-md mx-auto">
          <div class="clay-card p-8">
            <h3 class="mb-6 text-center">欢迎回来</h3>
            <form @submit.prevent="handleLogin" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">用户名</label>
                <input
                  v-model="username"
                  type="text"
                  class="clay-input w-full"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">密码</label>
                <input
                  v-model="password"
                  type="password"
                  class="clay-input w-full"
                  placeholder="请输入密码"
                />
              </div>
              <button type="submit" class="clay-btn w-full">登录</button>
              <button type="button" class="clay-btn-secondary w-full">使用 Google 登录</button>
            </form>
          </div>
        </div>
      </section>

      <!-- 场景 2：功能卡片网格 -->
      <section class="mb-16">
        <h2 class="mb-6">场景 2：功能卡片网格</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="clay-card-hoverable p-6">
            <div
              class="w-16 h-16 rounded-[var(--radius-clay-md)] mb-4 flex items-center justify-center text-2xl animate-float"
              style="background-color: var(--clay-primary); color: white"
            >
              🎨
            </div>
            <h3 class="mb-2">设计精美</h3>
            <p class="text-sm text-clay-text-secondary">
              多层阴影和超圆角创造出柔软的黏土质感，提供温暖友好的视觉体验
            </p>
          </div>

          <div class="clay-card-hoverable p-6">
            <div
              class="w-16 h-16 rounded-[var(--radius-clay-md)] mb-4 flex items-center justify-center text-2xl animate-breathe"
              style="background-color: var(--clay-accent-pink); color: white"
            >
              ✨
            </div>
            <h3 class="mb-2">流畅动画</h3>
            <p class="text-sm text-clay-text-secondary">
              悬停和按压时的动画反馈提供直观的交互体验，让界面更加生动
            </p>
          </div>

          <div class="clay-card-hoverable p-6">
            <div
              class="w-16 h-16 rounded-[var(--radius-clay-md)] mb-4 flex items-center justify-center text-2xl"
              style="background-color: var(--clay-accent-cyan); color: white"
            >
              🚀
            </div>
            <h3 class="mb-2">性能优化</h3>
            <p class="text-sm text-clay-text-secondary">
              使用 CSS transform 和 GPU 加速确保流畅运行，支持动画偏好设置
            </p>
          </div>
        </div>
      </section>

      <!-- 场景 3：定价套餐 -->
      <section class="mb-16">
        <h2 class="mb-6 text-center">场景 3：定价套餐</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="clay-card-clickable p-8 relative"
            :class="{ 'ring-4 ring-clay-primary ring-opacity-50': selectedPlan === plan.id }"
            @click="selectPlan(plan.id)"
          >
            <!-- 热门标签 -->
            <div v-if="plan.popular" class="absolute -top-3 left-1/2 -translate-x-1/2">
              <span class="clay-badge clay-badge-primary">最受欢迎</span>
            </div>

            <!-- 套餐名称 -->
            <h3 class="mb-2 text-center">{{ plan.name }}</h3>

            <!-- 价格 -->
            <div class="text-center mb-6">
              <span class="text-4xl font-bold" :style="{ color: plan.color }">{{
                plan.price
              }}</span>
              <span class="text-clay-text-muted">{{ plan.period }}</span>
            </div>

            <!-- 功能列表 -->
            <ul class="space-y-3 mb-6">
              <li
                v-for="(feature, index) in plan.features"
                :key="index"
                class="flex items-center gap-2 text-sm"
              >
                <span class="text-clay-primary">✓</span>
                <span>{{ feature }}</span>
              </li>
            </ul>

            <!-- 选择按钮 -->
            <button
              class="w-full"
              :class="selectedPlan === plan.id ? 'clay-btn' : 'clay-btn-secondary'"
            >
              {{ selectedPlan === plan.id ? '已选择' : '选择套餐' }}
            </button>
          </div>
        </div>
      </section>

      <!-- 场景 4：状态徽章 -->
      <section class="mb-16">
        <h2 class="mb-6">场景 4：状态徽章</h2>
        <div class="clay-card p-8">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span>项目状态</span>
              <span class="clay-badge clay-badge-primary">进行中</span>
            </div>
            <div class="flex items-center justify-between">
              <span>部署状态</span>
              <span class="clay-badge clay-badge-secondary">已完成</span>
            </div>
            <div class="flex items-center justify-between">
              <span>测试覆盖率</span>
              <span class="clay-badge clay-badge-primary">85%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 场景 5：玻璃态效果 -->
      <section class="mb-16">
        <h2 class="mb-6">场景 5：玻璃态效果</h2>
        <div class="relative h-64 rounded-[var(--radius-clay-lg)] overflow-hidden">
          <!-- 背景渐变 -->
          <div
            class="absolute inset-0"
            style="
              background: linear-gradient(
                135deg,
                var(--clay-primary) 0%,
                var(--clay-accent-pink) 50%,
                var(--clay-accent-cyan) 100%
              );
            "
          ></div>

          <!-- 玻璃态卡片 -->
          <div class="absolute inset-0 flex items-center justify-center p-8">
            <div class="clay-glass p-8 max-w-md">
              <h3 class="mb-4">玻璃态效果</h3>
              <p class="text-sm text-clay-text-secondary mb-4">
                半透明背景配合模糊效果，创造出现代感十足的玻璃质感。适合用于叠加在图片或渐变背景上。
              </p>
              <button class="clay-btn">了解更多</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 场景 6：交互式列表 -->
      <section class="mb-16">
        <h2 class="mb-6">场景 6：交互式列表</h2>
        <div class="space-y-4">
          <div class="clay-card-hoverable p-6 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center"
                style="background-color: var(--clay-primary); color: white"
              >
                📧
              </div>
              <div>
                <h4 class="font-medium">新消息通知</h4>
                <p class="text-sm text-clay-text-muted">您有 3 条未读消息</p>
              </div>
            </div>
            <span class="clay-badge clay-badge-primary">3</span>
          </div>

          <div class="clay-card-hoverable p-6 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center"
                style="background-color: var(--clay-accent-pink); color: white"
              >
                🔔
              </div>
              <div>
                <h4 class="font-medium">系统更新</h4>
                <p class="text-sm text-clay-text-muted">新版本已发布</p>
              </div>
            </div>
            <span class="clay-badge clay-badge-secondary">新</span>
          </div>

          <div class="clay-card-hoverable p-6 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center"
                style="background-color: var(--clay-accent-cyan); color: white"
              >
                ⚙️
              </div>
              <div>
                <h4 class="font-medium">设置提醒</h4>
                <p class="text-sm text-clay-text-muted">完善您的个人资料</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 代码示例 -->
      <section>
        <div class="clay-card p-8">
          <h2 class="mb-4">💡 使用提示</h2>
          <div class="space-y-4 text-sm text-clay-text-secondary">
            <p>所有演示的效果都使用了全局 CSS 工具类，无需编写额外的样式代码。主要的工具类包括：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li><code class="text-clay-primary">.clay-card</code> - 基础卡片样式</li>
              <li><code class="text-clay-primary">.clay-card-hoverable</code> - 可悬停卡片</li>
              <li><code class="text-clay-primary">.clay-card-clickable</code> - 可点击卡片</li>
              <li><code class="text-clay-primary">.clay-btn</code> - 主要按钮</li>
              <li><code class="text-clay-primary">.clay-btn-secondary</code> - 次要按钮</li>
              <li><code class="text-clay-primary">.clay-input</code> - 输入框</li>
              <li><code class="text-clay-primary">.clay-badge</code> - 徽章</li>
              <li><code class="text-clay-primary">.clay-glass</code> - 玻璃态效果</li>
            </ul>
            <p class="mt-4">
              查看
              <code class="text-clay-primary"
                >.kiro/specs/claymorphism-design-system/CLAY-UTILITIES-GUIDE.md</code
              >
              获取完整的使用文档。
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* 本页面主要使用全局工具类，无需额外样式 */
code {
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  background-color: var(--clay-bg-base);
  font-family: 'Courier New', monospace;
  font-size: 0.875em;
}
</style>

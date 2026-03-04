<script setup lang="ts">
/**
 * OS 配置管理布局组件
 *
 * 功能说明：
 * - 提供左右分栏布局结构
 * - 左侧导航栏固定宽度 240px
 * - 右侧内容区域占据剩余空间
 * - 包含三个导航项：聊天模型、知识库、提示词模板
 * - 使用 Claymorphism 设计风格
 * - 支持响应式布局（移动端汉堡菜单）
 */

// 二级导航项配置
const navItems = [
  {
    path: '/os-config/chat-model',
    name: 'OSConfigChatModel',
    label: '聊天模型',
    icon: 'mdi:robot-outline',
  },
  {
    path: '/os-config/knowledge',
    name: 'OSConfigKnowledge',
    label: '知识库',
    icon: 'mdi:book-outline',
  },
  {
    path: '/os-config/prompt-template',
    name: 'OSConfigPromptTemplate',
    label: '提示词模板',
    icon: 'mdi:text-box-outline',
  },
]

const route = useRoute()
const router = useRouter()

// 移动端菜单展开状态
const isMobileMenuOpen = ref(false)

// 判断导航项是否激活
function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

// 切换移动端菜单
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 关闭移动端菜单
function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

// 导航并关闭菜单
function navigateAndClose(path: string) {
  router.push(path)
  closeMobileMenu()
}

// 监听路由变化，自动关闭移动端菜单
watch(
  () => route.path,
  () => {
    closeMobileMenu()
  },
)

// 点击遮罩层关闭菜单
function handleOverlayClick() {
  closeMobileMenu()
}
</script>

<template>
  <div class="os-config-layout min-h-full bg-clay-bg-base p-6">
    <div class="max-w-[1600px] mx-auto flex gap-8 h-full relative">
      <!-- 移动端汉堡菜单按钮 -->
      <button
        class="mobile-menu-btn clay-btn fixed top-4 left-4 z-50 lg:hidden"
        @click="toggleMobileMenu"
        :aria-label="isMobileMenuOpen ? '关闭菜单' : '打开菜单'"
      >
        <AppIcon :icon="isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'" :size="24" />
      </button>

      <!-- 移动端遮罩层 -->
      <Transition name="fade">
        <div
          v-if="isMobileMenuOpen"
          class="mobile-overlay fixed inset-0 bg-black/50 z-40 lg:hidden"
          @click="handleOverlayClick"
        />
      </Transition>

      <!-- 左侧导航栏 -->
      <aside class="sidebar w-72 shrink-0" :class="{ 'mobile-open': isMobileMenuOpen }">
        <nav class="clay-card p-6 space-y-3 sticky top-6">
          <h2 class="text-xl font-bold text-clay-text-primary mb-6 px-3">OS 配置</h2>

          <a
            v-for="item in navItems"
            :key="item.path"
            href="#"
            class="nav-item clay-card-hoverable flex items-center gap-4 px-5 py-4 rounded-clay-md transition-all duration-300"
            :class="
              isActive(item.path)
                ? 'bg-clay-primary text-clay-text-inverse shadow-clay-hover active-nav scale-[1.10]'
                : 'text-clay-text-secondary hover:bg-clay-bg-elevated hover:text-clay-text-primary hover:shadow-clay-card'
            "
            @click.prevent="navigateAndClose(item.path)"
          >
            <AppIcon :icon="item.icon" :size="24" />
            <span class="font-semibold text-base">{{ item.label }}</span>
          </a>
        </nav>
      </aside>

      <!-- 右侧内容区域 -->
      <main class="flex-1 min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* 导航项激活指示器 */
.nav-item {
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: var(--clay-primary);
  border-radius: 0 3px 3px 0;
  transition: height 0.3s ease;
}

.nav-item.router-link-active::before,
.nav-item[class*='bg-clay-primary']::before {
  height: 70%;
}

/* 导航项悬停效果增强 */
.nav-item:not(.active-nav):hover {
  transform: translateX(6px);
  box-shadow: var(--shadow-clay-card);
}

.nav-item:not(.active-nav):active {
  transform: translateX(3px);
  box-shadow: var(--shadow-clay-pressed);
}

/* 激活状态的导航项 */
.nav-item.active-nav {
  position: relative;
  overflow: hidden;
  font-weight: 600;
}

.nav-item.active-nav::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%);
  pointer-events: none;
}

.nav-item.active-nav::before {
  width: 5px;
  height: 80%;
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.5);
}

/* 汉堡菜单按钮 */
.mobile-menu-btn {
  display: none;
  width: 48px;
  height: 48px;
  padding: 0;
  justify-content: center;
  align-items: center;
}

.mobile-menu-btn:hover {
  transform: translateY(-2px) rotate(0deg);
}

.mobile-menu-btn:active {
  transform: translateY(1px) rotate(0deg);
}

/* 移动端遮罩层动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 侧边栏滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

/* 桌面端适配 (> 1024px) - 完整分栏布局 */
@media (min-width: 1025px) {
  .sidebar {
    width: 288px;
  }
}

/* 平板适配 (768px - 1024px) - 调整左右宽度比例 */
@media (min-width: 768px) and (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }

  nav {
    position: static !important;
  }
}

/* 移动端适配 (< 768px) - 汉堡菜单 */
@media (max-width: 767px) {
  .os-config-layout {
    padding: 1rem;
    padding-top: 5rem; /* 为汉堡菜单按钮留出空间 */
  }

  .os-config-layout > div {
    flex-direction: column;
    gap: 1rem;
  }

  /* 显示汉堡菜单按钮 */
  .mobile-menu-btn {
    display: flex;
  }

  /* 侧边栏默认隐藏，固定在左侧 */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    max-width: 80vw;
    z-index: 45;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
  }

  /* 侧边栏打开状态 */
  .sidebar.mobile-open {
    transform: translateX(0);
  }

  /* 侧边栏内的导航卡片 */
  .sidebar nav {
    position: static !important;
    height: 100%;
    border-radius: 0;
  }

  /* 内容区域占满宽度 */
  main {
    width: 100%;
  }
}

/* 超小屏幕适配 (< 480px) */
@media (max-width: 479px) {
  .os-config-layout {
    padding: 0.75rem;
    padding-top: 4.5rem;
  }

  .mobile-menu-btn {
    width: 44px;
    height: 44px;
    top: 0.75rem;
    left: 0.75rem;
  }

  .sidebar {
    width: 100%;
    max-width: 100vw;
  }
}
</style>

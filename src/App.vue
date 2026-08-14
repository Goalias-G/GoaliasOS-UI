<script setup lang="ts">
/**
 * 根组件
 *
 * 说明：
 * - 仅包含 RouterView，所有布局由路由配置的布局组件处理
 * - 样式由全局 style.css 和 Tailwind CSS 处理
 * - 集成全局 Toast 提示组件
 */

const userStore = useUserStore()
</script>

<template>
  <RouterView />
  <!-- 退出接口期间的全局 loading，阻止重复操作。 -->
  <Transition name="logout-loading">
    <div
      v-if="userStore.isLoggingOut"
      class="global-logout-loading"
      role="status"
      aria-live="assertive"
    >
      <div class="global-logout-loading__card">
        <div class="global-logout-loading__spinner" aria-hidden="true"></div>
        <p>正在安全退出...</p>
      </div>
    </div>
  </Transition>

  <!-- 全局 Toast 提示 -->
  <Toast :toasts="toasts" @remove="removeToast" />
</template>

<style scoped>
.global-logout-loading {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgb(241 249 250 / 0.72);
  backdrop-filter: blur(8px);
}

.global-logout-loading__card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border: 1px solid rgb(255 255 255 / 0.78);
  border-radius: var(--radius-clay-md);
  color: var(--clay-text-primary);
  background: var(--clay-bg-elevated);
  box-shadow: var(--shadow-clay-hover);
  font-weight: 600;
}

.global-logout-loading__spinner {
  width: 1.3rem;
  height: 1.3rem;
  border: 3px solid rgb(66 150 237 / 0.2);
  border-top-color: var(--clay-primary);
  border-radius: 50%;
  animation: logout-spin 0.8s linear infinite;
}

.logout-loading-enter-active,
.logout-loading-leave-active {
  transition: opacity 0.2s ease;
}

.logout-loading-enter-from,
.logout-loading-leave-to {
  opacity: 0;
}

@keyframes logout-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .global-logout-loading__spinner {
    animation-duration: 1.8s;
  }
}
</style>

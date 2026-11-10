<script setup lang="ts">
/**
 * AI 思考中指示器
 * - 动态 SVG 脉动 + 轨道点
 * - 遵循 prefers-reduced-motion
 */
</script>

<template>
  <div
    class="thinking-indicator inline-flex items-center gap-3 bg-clay-bg-elevated rounded-clay-md px-4 py-3 shadow-clay-card"
    role="status"
    aria-live="polite"
    aria-label="OS AI 正在思考"
  >
    <svg
      class="thinking-svg"
      width="28"
      height="28"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- 外环 -->
      <circle
        class="ring ring-outer"
        cx="24"
        cy="24"
        r="18"
        stroke="var(--clay-primary)"
        stroke-width="2"
        stroke-opacity="0.25"
      />
      <!-- 旋转弧 -->
      <circle
        class="ring ring-spin"
        cx="24"
        cy="24"
        r="18"
        stroke="var(--clay-primary)"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-dasharray="28 86"
      />
      <!-- 内核光晕 -->
      <circle class="core-glow" cx="24" cy="24" r="8" fill="var(--clay-primary)" fill-opacity="0.18" />
      <circle class="core" cx="24" cy="24" r="4.5" fill="var(--clay-primary)" />
      <!-- 轨道点 -->
      <circle class="orbit-dot" cx="24" cy="6" r="2.2" fill="var(--clay-primary-light)" />
    </svg>

    <div class="flex flex-col min-w-0">
      <span class="text-sm font-medium text-clay-text-primary thinking-label">
        OS AI 正在思考
        <span class="dots" aria-hidden="true">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </span>
      <span class="text-xs text-clay-text-muted">Progressing</span>
    </div>
  </div>
</template>

<style scoped>
.thinking-svg {
  flex-shrink: 0;
}

.ring-spin {
  transform-origin: 24px 24px;
  animation: spin-ring 1.2s linear infinite;
}

.core-glow {
  transform-origin: 24px 24px;
  animation: pulse-glow 1.6s ease-in-out infinite;
}

.core {
  transform-origin: 24px 24px;
  animation: pulse-core 1.6s ease-in-out infinite;
}

.orbit-dot {
  transform-origin: 24px 24px;
  animation: orbit 1.8s linear infinite;
}

.dots span {
  display: inline-block;
  animation: blink-dot 1.2s ease-in-out infinite;
  opacity: 0.25;
}

.dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes spin-ring {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.35;
  }
  50% {
    transform: scale(1.25);
    opacity: 0.7;
  }
}

@keyframes pulse-core {
  0%,
  100% {
    transform: scale(0.92);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

@keyframes orbit {
  to {
    transform: rotate(360deg);
  }
}

@keyframes blink-dot {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ring-spin,
  .core-glow,
  .core,
  .orbit-dot,
  .dots span {
    animation: none;
  }

  .orbit-dot {
    opacity: 0.8;
  }

  .dots span {
    opacity: 0.7;
  }
}
</style>

<script setup lang="ts">
/**
 * 样式测试页面
 * 用于验证 Claymorphism 全局样式是否正确应用
 */
</script>

<template>
  <div class="min-h-full p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="mb-2">Claymorphism 样式系统测试</h1>
      <p class="text-clay-text-secondary mb-8">验证全局样式、字体、颜色和动画是否正确应用</p>

      <!-- 颜色测试 -->
      <section class="mb-12">
        <h2 class="mb-4">配色方案</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div
              class="w-full h-24 rounded-[var(--radius-clay-md)] mb-2"
              style="background-color: var(--clay-primary)"
            ></div>
            <p class="text-sm">主色调</p>
          </div>
          <div class="text-center">
            <div
              class="w-full h-24 rounded-[var(--radius-clay-md)] mb-2"
              style="background-color: var(--clay-accent-pink)"
            ></div>
            <p class="text-sm">粉色</p>
          </div>
          <div class="text-center">
            <div
              class="w-full h-24 rounded-[var(--radius-clay-md)] mb-2"
              style="background-color: var(--clay-accent-cyan)"
            ></div>
            <p class="text-sm">青色</p>
          </div>
          <div class="text-center">
            <div
              class="w-full h-24 rounded-[var(--radius-clay-md)] mb-2"
              style="background-color: var(--clay-accent-yellow)"
            ></div>
            <p class="text-sm">黄色</p>
          </div>
        </div>
      </section>

      <!-- 字体测试 -->
      <section class="mb-12">
        <h2 class="mb-4">字体系统</h2>
        <div
          class="space-y-4 bg-white p-6 rounded-[var(--radius-clay-lg)]"
          style="box-shadow: var(--shadow-clay-card)"
        >
          <div>
            <h1>H1 标题 - Nunito 字体</h1>
            <h2>H2 标题 - Nunito 字体</h2>
            <h3>H3 标题 - Nunito 字体</h3>
            <h4>H4 标题 - Nunito 字体</h4>
            <h5>H5 标题 - Nunito 字体</h5>
            <h6>H6 标题 - Nunito 字体</h6>
          </div>
          <div>
            <p class="text-clay-text-primary">这是正文文本，使用 DM Sans 字体。</p>
            <p class="text-clay-text-secondary">这是次要文本，使用 DM Sans 字体。</p>
            <p class="text-clay-text-muted">这是弱化文本，使用 DM Sans 字体。</p>
          </div>
        </div>
      </section>

      <!-- 阴影和交互测试 -->
      <section class="mb-12">
        <h2 class="mb-4">阴影系统 + 交互效果</h2>
        <p class="text-sm text-clay-text-secondary mb-4">
          💡 提示：悬停和点击卡片查看阴影和动画变化效果
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <!-- 默认卡片阴影 -->
          <div class="clay-card bg-white p-6 rounded-[var(--radius-clay-md)] text-center">
            <p class="font-medium">Card Shadow</p>
            <p class="text-sm text-clay-text-muted mt-2">卡片阴影（默认）</p>
          </div>

          <!-- 按钮阴影 -->
          <div class="clay-button bg-white p-6 rounded-[var(--radius-clay-md)] text-center">
            <p class="font-medium">Button Shadow</p>
            <p class="text-sm text-clay-text-muted mt-2">按钮阴影</p>
          </div>

          <!-- 悬停效果 -->
          <div
            class="clay-interactive bg-white p-6 rounded-[var(--radius-clay-md)] text-center cursor-pointer"
          >
            <p class="font-medium">Hover Effect</p>
            <p class="text-sm text-clay-text-muted mt-2">悬停提升 + 阴影增强</p>
          </div>

          <!-- 按压效果 -->
          <div
            class="clay-pressable bg-white p-6 rounded-[var(--radius-clay-md)] text-center cursor-pointer"
          >
            <p class="font-medium">Press Effect</p>
            <p class="text-sm text-clay-text-muted mt-2">按压下沉 + 阴影减弱</p>
          </div>
        </div>
      </section>

      <!-- 圆角测试 -->
      <section class="mb-12">
        <h2 class="mb-4">超圆角系统</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            class="bg-white p-6 text-center"
            style="border-radius: var(--radius-clay-sm); box-shadow: var(--shadow-clay-card)"
          >
            <p class="font-medium">Small</p>
            <p class="text-sm text-clay-text-muted mt-2">20px</p>
          </div>
          <div
            class="bg-white p-6 text-center"
            style="border-radius: var(--radius-clay-md); box-shadow: var(--shadow-clay-card)"
          >
            <p class="font-medium">Medium</p>
            <p class="text-sm text-clay-text-muted mt-2">28px</p>
          </div>
          <div
            class="bg-white p-6 text-center"
            style="border-radius: var(--radius-clay-lg); box-shadow: var(--shadow-clay-card)"
          >
            <p class="font-medium">Large</p>
            <p class="text-sm text-clay-text-muted mt-2">36px</p>
          </div>
          <div
            class="bg-white p-6 text-center"
            style="border-radius: var(--radius-clay-xl); box-shadow: var(--shadow-clay-card)"
          >
            <p class="font-medium">Extra Large</p>
            <p class="text-sm text-clay-text-muted mt-2">48px</p>
          </div>
        </div>
      </section>

      <!-- 动画测试 -->
      <section class="mb-12">
        <h2 class="mb-4">动画系统</h2>
        <p class="text-sm text-clay-text-secondary mb-4">
          💡 提示：观察持续动画效果，悬停和点击查看交互动画
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div
            class="bg-white p-6 rounded-[var(--radius-clay-md)] text-center animate-float"
            style="box-shadow: var(--shadow-clay-card)"
          >
            <p class="font-medium">Float</p>
            <p class="text-sm text-clay-text-muted mt-2">浮动动画（持续）</p>
          </div>
          <div
            class="bg-white p-6 rounded-[var(--radius-clay-md)] text-center animate-breathe"
            style="box-shadow: var(--shadow-clay-card)"
          >
            <p class="font-medium">Breathe</p>
            <p class="text-sm text-clay-text-muted mt-2">呼吸动画（持续）</p>
          </div>
          <div
            class="clay-hover-lift bg-white p-6 rounded-[var(--radius-clay-md)] text-center cursor-pointer"
            style="box-shadow: var(--shadow-clay-card)"
          >
            <p class="font-medium">Hover Lift</p>
            <p class="text-sm text-clay-text-muted mt-2">悬停提升（交互）</p>
          </div>
          <div
            class="clay-press bg-white p-6 rounded-[var(--radius-clay-md)] text-center cursor-pointer"
            style="box-shadow: var(--shadow-clay-card)"
          >
            <p class="font-medium">Press</p>
            <p class="text-sm text-clay-text-muted mt-2">按压效果（交互）</p>
          </div>
        </div>
      </section>

      <!-- 综合交互演示 -->
      <section class="mb-12">
        <h2 class="mb-4">综合交互演示</h2>
        <p class="text-sm text-clay-text-secondary mb-4">
          💡 提示：这些卡片结合了多种效果，提供最佳的 Claymorphism 体验
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            class="clay-card-interactive bg-white p-8 rounded-[var(--radius-clay-lg)] cursor-pointer"
          >
            <div
              class="w-16 h-16 rounded-[var(--radius-clay-md)] mb-4 flex items-center justify-center text-2xl"
              style="background-color: var(--clay-primary); color: white"
            >
              🎨
            </div>
            <h3 class="mb-2">设计精美</h3>
            <p class="text-sm text-clay-text-secondary">多层阴影和超圆角创造出柔软的黏土质感</p>
          </div>

          <div
            class="clay-card-interactive bg-white p-8 rounded-[var(--radius-clay-lg)] cursor-pointer"
          >
            <div
              class="w-16 h-16 rounded-[var(--radius-clay-md)] mb-4 flex items-center justify-center text-2xl"
              style="background-color: var(--clay-accent-pink); color: white"
            >
              ✨
            </div>
            <h3 class="mb-2">流畅动画</h3>
            <p class="text-sm text-clay-text-secondary">悬停和按压时的动画反馈提供直观的交互体验</p>
          </div>

          <div
            class="clay-card-interactive bg-white p-8 rounded-[var(--radius-clay-lg)] cursor-pointer"
          >
            <div
              class="w-16 h-16 rounded-[var(--radius-clay-md)] mb-4 flex items-center justify-center text-2xl"
              style="background-color: var(--clay-accent-cyan); color: white"
            >
              🚀
            </div>
            <h3 class="mb-2">性能优化</h3>
            <p class="text-sm text-clay-text-secondary">
              使用 CSS transform 和 GPU 加速确保流畅运行
            </p>
          </div>
        </div>
      </section>

      <!-- 状态提示 -->
      <section>
        <div
          class="bg-white p-6 rounded-[var(--radius-clay-lg)]"
          style="box-shadow: var(--shadow-clay-card)"
        >
          <h3 class="mb-4">✅ 全局样式系统配置完成</h3>
          <ul class="space-y-2 text-clay-text-secondary">
            <li>✓ CSS 变量定义完整（颜色、阴影、圆角、动画）</li>
            <li>✓ Google Fonts 导入成功（Nunito 和 DM Sans）</li>
            <li>✓ 字体样式配置正确（标题使用 Nunito，正文使用 DM Sans）</li>
            <li>✓ 全局重置样式和滚动条样式已添加</li>
            <li>✓ Claymorphism 动画系统已配置</li>
            <li>✓ 响应式动画偏好支持（prefers-reduced-motion）</li>
            <li>✓ 交互式阴影和动画效果已增强</li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ==================== 交互式 Claymorphism 效果类 ==================== */

/* 基础卡片阴影 */
.clay-card {
  box-shadow: var(--shadow-clay-card);
  transition: all var(--duration-normal) var(--ease-out);
}

/* 按钮阴影 */
.clay-button {
  box-shadow: var(--shadow-clay-button);
  transition: all var(--duration-normal) var(--ease-out);
}

/* 可交互卡片 - 悬停效果 */
.clay-interactive {
  box-shadow: var(--shadow-clay-card);
  transition: all var(--duration-normal) var(--ease-out);
}

.clay-interactive:hover {
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-4px);
}

/* 可按压卡片 - 按压效果 */
.clay-pressable {
  box-shadow: var(--shadow-clay-card);
  transition: all var(--duration-fast) var(--ease-in-out);
}

.clay-pressable:active {
  box-shadow: var(--shadow-clay-pressed);
  transform: translateY(2px);
}

/* 悬停提升动画 */
.clay-hover-lift {
  transition: all var(--duration-normal) var(--ease-out);
}

.clay-hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-clay-hover);
}

/* 按压动画 */
.clay-press {
  transition: all var(--duration-fast) var(--ease-in-out);
}

.clay-press:active {
  transform: translateY(2px);
  box-shadow: var(--shadow-clay-pressed);
}

/* 综合交互卡片 - 结合悬停和按压 */
.clay-card-interactive {
  box-shadow: var(--shadow-clay-card);
  transition: all var(--duration-normal) var(--ease-out);
}

.clay-card-interactive:hover {
  box-shadow: var(--shadow-clay-hover);
  transform: translateY(-6px);
}

.clay-card-interactive:active {
  box-shadow: var(--shadow-clay-button);
  transform: translateY(-2px);
}

/* 响应式动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .clay-card,
  .clay-button,
  .clay-interactive,
  .clay-pressable,
  .clay-hover-lift,
  .clay-press,
  .clay-card-interactive {
    transition: none !important;
  }

  .clay-interactive:hover,
  .clay-pressable:active,
  .clay-hover-lift:hover,
  .clay-press:active,
  .clay-card-interactive:hover,
  .clay-card-interactive:active {
    transform: none !important;
  }
}
</style>

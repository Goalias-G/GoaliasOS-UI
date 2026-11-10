<script setup lang="ts">
/**
 * OS 配置管理布局组件（纯展示）
 *
 * - 桌面端：左侧领域导航
 * - 移动端：侧栏收起，子路由由 MainLayout 右侧统一菜单承载
 * - 分组支持 defaultExpanded（OS AI 默认展开）
 */
import type { OsConfigNavItem } from '@/types'

interface Props {
  navItems: OsConfigNavItem[]
}

const props = defineProps<Props>()

const route = useRoute()
const router = useRouter()

/** 分组展开状态 */
const expandedGroups = ref<Record<string, boolean>>({})

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

function isGroupActive(item: OsConfigNavItem): boolean {
  return !!item.children?.some((child) => isActive(child.path))
}

function isGroupExpanded(item: OsConfigNavItem): boolean {
  if (!item.id) return false
  return !!expandedGroups.value[item.id]
}

function ensureGroupState() {
  for (const item of props.navItems) {
    if (!item.id || !item.children?.length) continue
    if (expandedGroups.value[item.id] === undefined) {
      expandedGroups.value[item.id] =
        item.defaultExpanded === true || item.children.some((child) => isActive(child.path))
    }
  }
}

function toggleGroup(item: OsConfigNavItem) {
  if (!item.id) return
  expandedGroups.value[item.id] = !expandedGroups.value[item.id]
}

function navigate(path: string) {
  router.push(path)
}

watch(
  () => [route.path, props.navItems] as const,
  () => {
    ensureGroupState()
    for (const item of props.navItems) {
      if (item.id && item.children?.some((child) => isActive(child.path))) {
        expandedGroups.value[item.id] = true
      }
    }
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div class="os-config-layout min-h-full bg-clay-bg-base p-4 md:p-6">
    <div class="max-w-[1600px] mx-auto flex gap-8 h-full relative">
      <!-- 桌面端侧栏；移动端隐藏（子路由走右侧统一菜单） -->
      <aside class="sidebar w-72 shrink-0 hidden lg:block">
        <nav class="clay-card p-6 space-y-3 sticky top-6">
          <h2 class="clay-section-title mb-6 ml-3">OS 配置</h2>

          <template v-for="item in navItems" :key="item.id || item.path || item.label">
            <a
              v-if="!item.children && item.path"
              href="#"
              class="nav-item clay-card-hoverable flex items-center gap-4 px-5 py-4 rounded-clay-md transition-all duration-300"
              :class="
                isActive(item.path)
                  ? 'bg-clay-primary text-clay-text-inverse shadow-clay-hover active-nav scale-[1.10]'
                  : 'text-clay-text-secondary hover:bg-clay-bg-elevated hover:text-clay-text-primary hover:shadow-clay-card'
              "
              @click.prevent="navigate(item.path)"
            >
              <AppIcon :icon="item.icon" :size="24" />
              <span class="font-semibold text-base">{{ item.label }}</span>
            </a>

            <div v-else class="nav-group">
              <button
                type="button"
                class="nav-item nav-group-toggle clay-card-hoverable flex w-full items-center gap-4 px-5 py-4 rounded-clay-md transition-all duration-300 text-left"
                :class="
                  isGroupActive(item)
                    ? 'bg-clay-bg-elevated text-clay-text-primary shadow-clay-card'
                    : 'text-clay-text-secondary hover:bg-clay-bg-elevated hover:text-clay-text-primary hover:shadow-clay-card'
                "
                @click="toggleGroup(item)"
              >
                <AppIcon :icon="item.icon" :size="24" />
                <span class="font-semibold text-base flex-1">{{ item.label }}</span>
                <AppIcon
                  :icon="isGroupExpanded(item) ? 'mdi:chevron-down' : 'mdi:chevron-right'"
                  :size="20"
                />
              </button>

              <Transition name="collapse">
                <div
                  v-show="isGroupExpanded(item)"
                  class="nav-children space-y-2 mt-2 ml-3 pl-3 border-l-2 border-clay-primary/20"
                >
                  <a
                    v-for="child in item.children"
                    :key="child.path"
                    href="#"
                    class="nav-item nav-child clay-card-hoverable flex items-center gap-3 px-4 py-3 rounded-clay-md transition-all duration-300"
                    :class="
                      isActive(child.path)
                        ? 'bg-clay-primary text-clay-text-inverse shadow-clay-hover active-nav'
                        : 'text-clay-text-secondary hover:bg-clay-bg-elevated hover:text-clay-text-primary hover:shadow-clay-card'
                    "
                    @click.prevent="navigate(child.path)"
                  >
                    <AppIcon :icon="child.icon" :size="20" />
                    <span class="font-medium text-sm">{{ child.label }}</span>
                  </a>
                </div>
              </Transition>
            </div>
          </template>
        </nav>
      </aside>

      <main class="flex-1 min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
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

.nav-item[class*='bg-clay-primary']::before {
  height: 70%;
}

.nav-item:not(.active-nav):hover {
  transform: translateX(6px);
  box-shadow: var(--shadow-clay-card);
}

.nav-item:not(.active-nav):active {
  transform: translateX(3px);
  box-shadow: var(--shadow-clay-pressed);
}

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
  box-shadow: 0 0 8px rgba(66, 150, 237, 0.45);
}

.nav-group-toggle {
  cursor: pointer;
  border: none;
  background: transparent;
}

.collapse-enter-active,
.collapse-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (min-width: 1025px) {
  .sidebar {
    width: 288px;
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }

  nav {
    position: static !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .collapse-enter-active,
  .collapse-leave-active {
    transition: none !important;
  }
}
</style>

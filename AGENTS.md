# GoaliasOS-UI 项目开发规范

> 本文档定义了 GoaliasOS-UI 项目的代码风格、架构模式和开发规范

## 项目概述

GoaliasOS-UI 是一个基于 Vue 3 + TypeScript + Vite + Tailwind CSS 构建的现代化前端项目，采用 Claymorphism 设计系统。这是一个生产级别的健康生活管理系统，集成了 AI 对话、生活记录、OS 配置管理等多个功能模块。

### 核心技术栈

- **框架**: Vue 3.5.25 (Composition API + `<script setup>`)
- **构建工具**: Vite 7.2.4
- **类型系统**: TypeScript 5.9
- **状态管理**: Pinia 3.0.4
- **路由管理**: Vue Router 4.6.3
- **样式方案**: Tailwind CSS 4.1.18 + Claymorphism 设计系统
- **HTTP 客户端**: Axios 1.13.2 + SSE 流式传输
- **图标库**: @iconify/vue 5.0.0
- **工具库**: VueUse 14.2.0
- **自动导入**: unplugin-auto-import + unplugin-vue-components
- **代码格式化**: Prettier 3.6.2
- **特效库**: motion-v、ogl、@number-flow/vue

---

## 一、项目架构与目录结构

### 1.1 实际目录结构

```
src/
├── api/                    # API 请求管理（按模块划分）
│   ├── index.ts           # Axios 实例和请求封装
│   └── modules/           # 各业务模块的 API
│       ├── auth.ts        # 认证接口
│       ├── chat-config.ts # 聊天配置接口
│       ├── chat-message.ts # 消息管理接口
│       ├── chat-model.ts  # 模型管理接口
│       ├── chat-session.ts # 会话管理接口
│       ├── chat.ts        # 聊天接口
│       ├── health.ts      # 健康检查接口
│       ├── knowledge.ts   # 知识库接口
│       ├── lifeCategory.api.ts # 生活分类接口
│       ├── lifeRecord.api.ts   # 生活记录接口
│       └── prompt-template.ts  # 提示词模板接口
├── assets/                # 静态资源（图片、字体等）
│   └── logo.svg
├── components/            # 组件库（四大分类）
│   ├── ai/               # AI 对话系统组件
│   │   ├── ChatArea.vue
│   │   ├── ChatInput.vue
│   │   ├── KnowledgeSelector.vue
│   │   ├── MessageItem.vue
│   │   ├── MessageList.vue
│   │   ├── ModelSelector.vue
│   │   ├── PromptSelector.vue
│   │   ├── SessionItem.vue
│   │   ├── SessionList.vue
│   │   ├── SessionSidebar.vue
│   │   └── ToolCallStatus.vue
│   ├── common/           # 通用基础组件
│   │   ├── AppIcon.vue   # 统一图标组件
│   │   ├── AudioPlayer.vue # 音频播放器
│   │   └── Toast.vue     # 全局提示组件
```

│ ├── os-config/ # OS 配置管理组件
│ │ ├── DataTable.vue
│ │ ├── FileUpload.vue
│ │ ├── FormModal.vue
│ │ ├── OSConfigLayout.vue
│ │ ├── Pagination.vue
│ │ └── SearchBar.vue
│ └── ui/ # UI 特效组件（16个高级特效）
│ ├── animated-circular-progressbar/
│ ├── bg-black-hole/
│ ├── bg-falling-stars/
│ ├── encrypted-text/
│ ├── expandable-gallery/
│ ├── flip-card/
│ ├── fluid-cursor/
│ ├── icon-cloud/
│ ├── interactive-hover-button/
│ ├── morphing-tabs/
│ ├── morphing-text/
│ ├── scroll-island/
│ ├── shimmer-button/
│ ├── sleek-line-cursor/
│ ├── sparkles-text/
│ └── text-generate-effect/
├── layouts/ # 布局组件
│ ├── MainLayout.vue # 主布局（带导航）
│ └── AuthLayout.vue # 认证布局
├── lib/ # 核心工具函数（第三方库封装）
│ └── utils.ts
├── router/ # 路由配置
│ ├── index.ts # 路由实例和守卫
│ ├── routes.ts # 路由配置表
│ └── types.ts # 路由类型定义
├── stores/ # Pinia 状态管理（按模块划分）
│ ├── lifeRecord.ts # 生活记录状态
│ ├── osConfig.ts # OS 配置状态
│ ├── session.ts # AI 会话状态
│ ├── theme.ts # 主题状态
│ └── user.ts # 用户状态
├── types/ # TypeScript 类型定义
│ ├── index.ts # 统一导出
│ ├── ai.ts # AI 系统类型
│ ├── components.ts # 组件 Props 类型
│ ├── os-config.ts # OS 配置类型
│ ├── router.ts # 路由类型
│ ├── theme.ts # 主题类型
│ └── api/ # API 相关类型
│ ├── api.ts # 通用 API 类型
│ ├── chat.ts # 聊天类型
│ ├── chat-common.ts # 聊天通用类型
│ ├── knowledge.ts # 知识库类型
│ ├── life.ts # 生活记录类型
│ ├── page.ts # 分页类型
│ └── user.ts # 用户类型
├── utils/ # 通用工具函数
│ ├── format.ts # 格式化函数
│ ├── index.ts # 通用工具函数
│ ├── markdown.ts # Markdown 处理
│ ├── sse.ts # SSE 流式传输工具
│ ├── storage.ts # 本地存储封装
│ ├── toast.ts # 提示工具
│ └── validate.ts # 验证函数
├── views/ # 页面视图（按功能模块划分）
│ ├── ai/ # AI 对话页面
│ │ └── index.vue
│ ├── auth/ # 认证相关页面
│ │ └── LoginView.vue
│ ├── error/ # 错误页面
│ │ └── NotFoundView.vue
│ ├── home/ # 首页
│ │ └── index.vue
│ ├── lifeRecord/ # 生活记录页面
│ │ ├── index.vue
│ │ └── components/ # 页面专用组件
│ │ ├── CategoryTab.vue
│ │ ├── EmptyState.vue
│ │ ├── RecordDetail.vue
│ │ └── RecordList.vue
│ ├── os-config/ # OS 配置页面
│ │ ├── index.vue
│ │ └── modules/ # 配置模块
│ │ ├── ChatModelModule.vue
│ │ ├── KnowledgeModule.vue
│ │ ├── KnowledgeAttachView.vue
│ │ └── PromptTemplateModule.vue
│ └── styleTest/ # 样式测试页面
│ ├── ClayDemoView.vue
│ ├── StyleTestView.vue
│ └── TailwindTest.vue
├── App.vue # 根组件
├── main.ts # 应用入口
└── style.css # 全局样式（Claymorphism 设计系统）

```

```

### 1.2 文件命名规范

- **组件文件**: PascalCase，如 `AppIcon.vue`、`ChatArea.vue`
- **页面文件**: PascalCase + View 后缀，如 `LoginView.vue`、`HomeView.vue`
- **工具文件**: camelCase，如 `format.ts`、`validate.ts`、`sse.ts`
- **类型文件**: camelCase，如 `user.ts`、`api.ts`、`life.ts`
- **常量文件**: camelCase，如 `constants.ts`
- **API 文件**: camelCase + .api 后缀，如 `lifeRecord.api.ts`

### 1.3 模块化原则

- **按功能模块划分**: 每个功能模块独立管理自己的页面、组件、API、类型
- **路由配置**: 统一在 `router/routes.ts` 中管理，避免循环依赖
- **API 模块**: 按业务模块划分，如 `api/modules/chat-session.ts`
- **类型定义**: 按业务领域划分，在 `types/index.ts` 中统一导出
- **组件分类**: ai、common、os-config、ui 四大分类，职责清晰

### 1.4 核心功能模块

**AI 对话系统**:

- 会话管理（创建、切换、删除、重命名）
- 消息管理（加载、删除、分页）
- SSE 流式传输（实时消息接收、中断控制）
- 模型选择和知识库关联
- 工具调用状态追踪

**生活记录场景**:

- 分类管理（CRUD、排序）
- 记录管理（CRUD、收藏、评分）
- 分类统计（记录数、平均评分、收藏数）
- 响应式布局（桌面端三栏/移动端单栏）

**OS 配置管理**:

- 聊天模型管理
- 知识库管理
- 提示词模板管理
- 模块切换和状态管理

**用户认证**:

- 登录/登出
- Token 管理
- 权限检查（管理员权限）

---

## 二、Vue 开发规范

### 2.1 组件编写规范

#### 使用 Composition API + `<script setup>`

```vue
<script setup lang="ts">
/**
 * 组件功能说明
 *
 * 功能说明：
 * - 功能点 1
 * - 功能点 2
 */
// Props 定义（使用 TypeScript 接口）
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
})

// Emits 定义
const emit = defineEmits<{
  update: [value: number]
  close: []
}>()

// 响应式状态
const isOpen = ref(false)

// 计算属性
const displayText = computed(() => `${props.title}: ${props.count}`)

// 方法
function handleClick() {
  emit('update', props.count + 1)
}
</script>

<template>
  <div class="component-wrapper">
    <!-- 模板内容 -->
  </div>
</template>

<style scoped>
/* 组件样式（优先使用 Tailwind CSS） */
</style>
```

#### 组件注释规范

- 每个组件文件顶部必须包含 JSDoc 注释说明组件功能
- 复杂逻辑需要添加行内注释
- Props 和 Emits 使用 TypeScript 类型定义，无需额外注释

### 2.2 响应式数据规范

- **ref**: 用于基本类型和单一对象（推荐）
- **reactive**: 用于复杂对象（但优先使用 ref）
- **computed**: 用于派生状态
- **watch/watchEffect**: 用于副作用

```typescript
// ✅ 推荐
const count = ref(0)
const user = ref<User | null>(null)

// ❌ 避免
const state = reactive({ count: 0 }) // 解构会失去响应性
```

### 2.3 自动导入配置

项目配置了 `unplugin-auto-import` 和 `unplugin-vue-components`：

- **自动导入 API**: `ref`、`computed`、`watch`、`useRouter`、`useRoute`、`defineStore` 等
- **自动注册组件**: `src/components` 目录下的所有组件
- **自动导入目录**: `src/stores`、`src/utils` 目录下的模块
- **无需手动导入**: Vue API、VueUse、Pinia、Vue Router

```vue
<script setup lang="ts">
// ✅ 无需导入，直接使用
const count = ref(0)
const router = useRouter()
const isDark = useDark()
const userStore = useUserStore() // 自动导入 stores

// ❌ 不要手动导入
// import { ref } from 'vue'
// import { useRouter } from 'vue-router'
// import { useUserStore } from '@/stores/user'
</script>
```

---

## 三、TypeScript 规范

### 3.1 类型定义规范

- **接口命名**: PascalCase，如 `User`、`ApiResponse`、`LifeRecord`
- **类型别名**: PascalCase，如 `Theme`、`ComponentSize`
- **枚举**: PascalCase，如 `UserRole`
- **泛型**: 单字母大写或 PascalCase，如 `T`、`TData`

### 3.2 类型导出规范

```typescript
// types/api/life.ts
export interface LifeRecord {
  id: number
  title: string
  content?: string
  categoryId?: number
  rating?: number
  favoriteFlag?: number
}

export interface LifeCategory {
  id: number
  name: string
  description?: string
  sortOrder?: number
}

// types/index.ts - 统一导出
export * from './api/user'
export * from './api/api'
export * from './api/life'
export * from './ai'
export * from './components'
```

### 3.3 API 类型定义

```typescript
// types/api/api.ts
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 使用示例
import type { ApiResponse, LifeRecord } from '@/types'

async function getLifeRecord(): Promise<LifeRecord> {
  const response = await get<LifeRecord>('/api/life-record/1')
  return response
}
```

### 3.4 组件 Props 类型

```typescript
// types/components.ts
export interface ChatInputProps {
  /** 是否禁用输入 */
  disabled?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 最大长度 */
  maxLength?: number
  /** 是否显示发送按钮 */
  showSendButton?: boolean
}

// 组件中使用
<script setup lang="ts">
import type { ChatInputProps } from '@/types'

const props = withDefaults(defineProps<ChatInputProps>(), {
  disabled: false,
  placeholder: '请输入消息...',
  maxLength: 1000,
  showSendButton: true
})
</script>
```

---

## 四、样式规范（Claymorphism 设计系统）

### 4.1 Tailwind CSS 优先

- **优先使用 Tailwind 工具类**: 避免编写自定义 CSS
- **使用 Claymorphism 变量**: 使用 `style.css` 中定义的 CSS 变量
- **响应式设计**: 使用 Tailwind 响应式前缀（`sm:`、`md:`、`lg:`、`xl:`）

```vue
<template>
  <!-- ✅ 推荐：使用 Tailwind 工具类 -->
  <div class="bg-clay-bg-elevated rounded-clay-lg shadow-clay-card p-6">
    <h2 class="text-xl font-bold text-clay-text-primary">标题</h2>
  </div>

  <!-- ❌ 避免：自定义 CSS -->
  <div class="custom-card">
    <h2 class="custom-title">标题</h2>
  </div>
</template>
```

### 4.2 Claymorphism CSS 变量

项目在 `src/style.css` 中定义了完整的 Claymorphism 设计系统变量：

#### 颜色变量

```css
/* 主色调 - 蓝色系 */
--clay-primary: #4296ed;
--clay-primary-light: #6aabf1;
--clay-primary-dark: #167ce9;

/* 背景色 - 淡蓝色系 */
--clay-bg-base: #f1f9fa;
--clay-bg-elevated: #fbfcf3;
--clay-bg-overlay: rgba(255, 255, 255, 0.4);

/* 辅助色 - 糖果色系 */
--clay-accent-pink: #ffa6ad;
--clay-accent-green: #acffe6;
--clay-accent-yellow: #ffdf95;

/* 文本色 */
--clay-text-primary: #2d3557;
--clay-text-secondary: #6b7280;
--clay-text-muted: #9ca3af;
--clay-text-inverse: #ffffff;
```

#### 阴影变量

```css
/* 卡片阴影 - 浮起效果 */
--shadow-clay-card:
  0 8px 16px rgba(238, 188, 58, 0.15), 0 4px 8px rgba(238, 188, 58, 0.1),
  inset 0 -4px 8px rgba(238, 188, 58, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.6);

/* 按钮阴影 - 中等浮起 */
--shadow-clay-button:
  0 6px 12px rgba(238, 188, 58, 0.2), 0 3px 6px rgba(238, 188, 58, 0.15),
  inset 0 -3px 6px rgba(238, 188, 58, 0.1), inset 0 1px 3px rgba(255, 255, 255, 0.7);

/* 按压状态阴影 - 下沉效果 */
--shadow-clay-pressed:
  0 2px 4px rgba(238, 188, 58, 0.15), inset 0 2px 8px rgba(238, 188, 58, 0.2),
  inset 0 -1px 2px rgba(255, 255, 255, 0.5);

/* 悬停状态阴影 - 增强浮起 */
--shadow-clay-hover:
  0 12px 24px rgba(238, 188, 58, 0.2), 0 6px 12px rgba(238, 188, 58, 0.15),
  inset 0 -6px 12px rgba(238, 188, 58, 0.08), inset 0 3px 6px rgba(255, 255, 255, 0.6);
```

#### 圆角变量

```css
--radius-clay-sm: 20px; /* 小圆角 */
--radius-clay-md: 28px; /* 中等圆角（默认） */
--radius-clay-lg: 36px; /* 大圆角 */
--radius-clay-xl: 48px; /* 超大圆角 */
--radius-clay-full: 9999px; /* 完全圆形 */
```

### 4.3 Tailwind 自定义工具类

项目提供了 Claymorphism 专用的 Tailwind 工具类：

```html
<!-- 颜色工具类 -->
<div class="bg-clay-primary text-clay-text-inverse">主色背景</div>
<div class="bg-clay-bg-elevated text-clay-text-primary">卡片背景</div>

<!-- 阴影工具类 -->
<div class="shadow-clay-card">卡片阴影</div>
<button class="shadow-clay-button hover:shadow-clay-hover active:shadow-clay-pressed">按钮</button>

<!-- 圆角工具类 -->
<div class="rounded-clay-md">中等圆角</div>
<div class="rounded-clay-lg">大圆角</div>

<!-- 字体工具类 -->
<h1 class="font-heading">标题字体（Nunito）</h1>
<p class="font-body">正文字体（DM Sans）</p>

<!-- 动画工具类 -->
<div class="animate-float">浮动动画</div>
<div class="animate-breathe">呼吸动画</div>
```

### 4.4 预定义交互类

```html
<!-- 基础卡片 -->
<div class="clay-card">静态卡片</div>

<!-- 可悬停卡片 -->
<div class="clay-card-hoverable">悬停提升</div>

<!-- 可点击卡片 -->
<div class="clay-card-clickable">悬停 + 按压</div>

<!-- 按钮样式 -->
<button class="clay-btn">主要按钮</button>
<button class="clay-btn-secondary">次要按钮</button>

<!-- 输入框样式 -->
<input class="clay-input" placeholder="输入内容" />

<!-- 玻璃态卡片 -->
<div class="clay-glass">玻璃态效果</div>
```

### 4.5 响应式设计

- **移动优先**: 默认样式为移动端，使用断点向上扩展
- **断点使用**: `sm:` (640px)、`md:` (768px)、`lg:` (1024px)、`xl:` (1280px)

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- 移动端 1 列，平板 2 列，桌面 3 列 -->
</div>
```

---

## 五、路由规范

### 5.1 路由配置结构

```typescript
// router/routes.ts - 统一路由配置
export const mainRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '首页',
      icon: 'hugeicons:home-11',
      module: 'home',
    },
  },
  {
    path: 'ai',
    name: 'AI',
    component: () => import('@/views/ai/index.vue'),
    meta: {
      title: 'OS AI',
      icon: 'hugeicons:artificial-intelligence-01',
      module: 'ai',
    },
  },
  {
    path: 'lifeRecord',
    name: 'LifeRecordScene',
    component: () => import('@/views/lifeRecord/index.vue'),
    meta: {
      title: '生活记录',
      icon: 'hugeicons:note-02',
      module: 'lifeRecord',
    },
  },
]
```

### 5.2 路由元信息（Meta）

```typescript
// router/types.ts
export interface AppRouteMeta {
  /** 页面标题 */
  title?: string
  /** 图标（用于导航菜单） */
  icon?: string
  /** 是否需要认证 */
  requiresAuth?: boolean
  /** 是否需要管理员权限 */
  requiresAdmin?: boolean
  /** 是否在导航中隐藏 */
  hidden?: boolean
  /** 所属模块 */
  module?: string
}
```

### 5.3 路由守卫

- **认证检查**: 在 `router/index.ts` 的 `beforeEach` 守卫中实现
- **页面标题**: 自动根据 `meta.title` 设置
- **权限控制**: 根据 `meta.requiresAuth` 和 `meta.requiresAdmin` 判断

---

## 六、状态管理规范（Pinia）

### 6.1 Store 定义规范

```typescript
// stores/lifeRecord.ts
import { defineStore } from 'pinia'
import type { LifeCategory, LifeRecord } from '@/types'

export const useLifeRecordStore = defineStore('lifeRecord', () => {
  // ==================== 状态 ====================
  const categories = ref<LifeCategory[]>([])
  const records = ref<LifeRecord[]>([])
  const activeCategoryId = ref<number | null>(null)
  const currentRecord = ref<LifeRecord | null>(null)

  // ==================== 计算属性 ====================
  const activeCategory = computed(() =>
    categories.value.find((cat) => cat.id === activeCategoryId.value),
  )

  const categoryStats = computed(() => {
    // 分类统计逻辑
    return new Map()
  })

  // ==================== 方法 ====================
  async function loadCategories(): Promise<void> {
    try {
      const response = await lifeCategoryApi.list()
      if (response.code === 200 && response.data) {
        categories.value = response.data
      }
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }

  function setActiveCategory(categoryId: number | null): void {
    activeCategoryId.value = categoryId
    // 持久化到 localStorage
    if (categoryId !== null) {
      localStorage.setItem('activeLifeCategoryId', categoryId.toString())
    }
  }

  // ==================== 初始化 ====================
  function init() {
    const savedCategoryId = localStorage.getItem('activeLifeCategoryId')
    if (savedCategoryId) {
      activeCategoryId.value = parseInt(savedCategoryId)
    }
  }

  init()

  return {
    // 状态
    categories,
    records,
    activeCategoryId,
    currentRecord,
    // 计算属性
    activeCategory,
    categoryStats,
    // 方法
    loadCategories,
    setActiveCategory,
  }
})
```

### 6.2 Store 使用规范

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'

const lifeRecordStore = useLifeRecordStore()

// ✅ 使用 storeToRefs 解构响应式状态
const { categories, activeCategory } = storeToRefs(lifeRecordStore)

// ✅ 直接解构方法
const { loadCategories, setActiveCategory } = lifeRecordStore

// ❌ 不要直接解构状态（会失去响应性）
// const { categories } = lifeRecordStore
</script>
```

### 6.3 Store 命名规范

- **文件名**: camelCase，如 `lifeRecord.ts`、`session.ts`
- **Store ID**: camelCase，如 `'lifeRecord'`、`'session'`
- **Composable 名称**: `use` + PascalCase + `Store`，如 `useLifeRecordStore`

---

## 七、API 请求规范

### 7.1 API 封装结构

```typescript
// api/index.ts - Axios 实例和请求方法封装
export function get<T>(url: string, params?: any, config?: RequestConfig): Promise<T>
export function post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>
export function put<T>(url: string, data?: any, config?: RequestConfig): Promise<T>
export function del<T>(url: string, config?: RequestConfig): Promise<T>

// api/modules/lifeRecord.api.ts - 业务模块 API
import { get, post, put, del } from '@/api'
import type { LifeRecord, ApiResponse, PaginatedResponse } from '@/types'

export const lifeRecordApi = {
  // 获取记录列表
  list: (params: { categoryId?: number; page?: number; pageSize?: number }) =>
    get<PaginatedResponse<LifeRecord>>('/life-record/list', params),

  // 获取记录详情
  detail: (id: number) => get<LifeRecord>(`/life-record/${id}`),

  // 创建记录
  create: (data: Partial<LifeRecord>) => post<LifeRecord>('/life-record', data),

  // 更新记录
  update: (id: number, data: Partial<LifeRecord>) => put<LifeRecord>(`/life-record/${id}`, data),

  // 删除记录
  delete: (id: number) => del<void>(`/life-record/${id}`),

  // 切换收藏状态
  toggleFavorite: (id: number) => post<void>(`/life-record/${id}/favorite`),
}
```

### 7.2 请求拦截器

- **自动添加 Token**: 从 localStorage 读取并添加到请求头
- **请求日志**: 开发环境打印请求信息
- **错误处理**: 统一处理 HTTP 错误和业务错误

### 7.3 响应拦截器

- **业务状态码判断**: `code === 200` 表示成功
- **401 处理**: 自动清除 Token 并跳转登录页
- **错误提示**: 统一错误消息格式

### 7.4 SSE 流式传输

```typescript
// utils/sse.ts - SSE 工具
import { createSSEConnection } from '@/utils/sse'

// 使用示例
const controller = new AbortController()

await createSSEConnection(
  '/api/chat/send',
  {
    messages: [{ role: 'user', content: '你好' }],
    sessionId: 123,
  },
  {
    signal: controller.signal,
    onMessage: (data) => {
      console.log('接收到数据:', data)
    },
    onError: (error) => {
      console.error('连接错误:', error)
    },
    onComplete: () => {
      console.log('连接完成')
    },
  },
)
```

---

## 八、工具函数规范

### 8.1 工具函数分类

```
utils/
├── storage.ts    # 本地存储封装
├── format.ts     # 格式化函数（日期、数字、货币等）
├── validate.ts   # 验证函数（手机号、邮箱、身份证等）
├── sse.ts        # SSE 流式传输工具
├── toast.ts      # 提示工具
├── markdown.ts   # Markdown 处理
└── index.ts      # 统一导出 + 通用工具函数
```

### 8.2 工具函数编写规范

```typescript
/**
 * 函数功能说明
 * @param param1 参数说明
 * @param param2 参数说明
 * @returns 返回值说明
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD') // '2026-02-02'
 */
export function formatDate(
  date: Date | number | string,
  format: string = 'YYYY-MM-DD HH:mm:ss',
): string {
  // 实现逻辑
}
```

### 8.3 常用工具函数

- **storage.ts**: `setStorage`、`getStorage`、`removeStorage`、`clearStorage`
- **format.ts**: `formatDate`、`formatNumber`、`formatCurrency`、`formatFileSize`
- **validate.ts**: `isPhone`、`isEmail`、`isIdCard`、`isUrl`、`isEmpty`
- **sse.ts**: `createSSEConnection`、`SSEError`
- **toast.ts**: `showSuccess`、`showError`、`showWarning`、`showInfo`
- **index.ts**: `debounce`、`throttle`、`deepClone`、`generateId`、`sleep`

---

## 九、组件开发规范

### 9.1 通用组件（common/）

- **AppIcon**: 统一图标组件，基于 @iconify/vue
- **AudioPlayer**: 音频播放器组件
- **Toast**: 全局提示组件

**使用示例**:

```vue
<AppIcon icon="mdi:home" :size="24" color="#4296ed" />
<AppIcon icon="hugeicons:artificial-intelligence-01" :size="20" class="text-clay-primary" />
```

### 9.2 AI 组件（ai/）

- **ChatArea**: 聊天区域主容器
- **ChatInput**: 聊天输入框（支持多行、快捷键）
- **MessageList**: 消息列表（虚拟滚动）
- **MessageItem**: 单条消息（支持 Markdown 渲染）
- **SessionSidebar**: 会话侧边栏
- **ModelSelector**: 模型选择器
- **KnowledgeSelector**: 知识库选择器
- **ToolCallStatus**: 工具调用状态显示

### 9.3 OS 配置组件（os-config/）

- **OSConfigLayout**: 配置页面布局
- **DataTable**: 数据表格（支持排序、筛选、分页）
- **Pagination**: 分页组件
- **SearchBar**: 搜索栏
- **FormModal**: 表单对话框
- **FileUpload**: 文件上传组件

### 9.4 UI 特效组件（ui/）

项目包含 16 个高级 UI 特效组件：

- **BlackHoleBackground**: 黑洞背景特效
- **FallingStarsBg**: 流星背景特效
- **FluidCursor**: 流体光标特效
- **MorphingTabs**: 变形标签页
- **ShimmerButton**: 闪光按钮
- **EncryptedText**: 加密文本特效
- **IconCloud**: 图标云特效
- **SparklesText**: 闪烁文本特效
- 等等...

**目录结构**: 每个组件独立目录，包含组件文件和 `index.ts`

```
ui/
├── shimmer-button/
│   ├── ShimmerButton.vue
│   └── index.ts
└── bg-black-hole/
    ├── BlackHoleBackground.vue
    └── index.ts
```

---

## 十、代码注释规范

### 10.1 文件头注释

每个文件顶部必须包含功能说明：

```typescript
/**
 * 文件功能说明
 *
 * 功能说明：
 * - 功能点 1
 * - 功能点 2
 * - 功能点 3
 */
```

### 10.2 函数注释

使用 JSDoc 格式：

```typescript
/**
 * 函数功能说明
 * @param param1 参数说明
 * @param param2 参数说明
 * @returns 返回值说明
 * @example
 * functionName(arg1, arg2) // 示例
 */
export function functionName(param1: string, param2: number): boolean {
  // 实现
}
```

### 10.3 代码块注释

使用分隔注释标记代码块：

```typescript
// ==================== 状态 ====================
const count = ref(0)
const user = ref<User | null>(null)

// ==================== 计算属性 ====================
const displayName = computed(() => user.value?.name || '游客')

// ==================== 方法 ====================
function handleClick() {
  // 实现
}
```

---

## 十一、环境配置规范

### 11.1 环境变量

- **开发环境**: `.env.development`
- **生产环境**: `.env.production`
- **变量前缀**: `VITE_`（Vite 要求）

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:7000
VITE_APP_TITLE=GoaliasOS Dev
VITE_REQUEST_TIMEOUT=10000
```

### 11.2 环境变量使用

```typescript
// ✅ 正确使用
const apiUrl = import.meta.env.VITE_API_BASE_URL
const appTitle = import.meta.env.VITE_APP_TITLE

// ❌ 错误使用
const apiUrl = process.env.VITE_API_BASE_URL // Vite 不支持 process.env
```

### 11.3 TypeScript 类型支持

在 `env.d.ts` 中声明环境变量类型：

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_REQUEST_TIMEOUT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 11.4 Vite 配置

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      dts: 'auto-imports.d.ts',
      dirs: ['src/stores', 'src/utils'],
      vueTemplate: true,
    }),
    Components({
      dirs: ['src/components'],
      dts: 'components.d.ts',
      deep: true,
      extensions: ['vue'],
    }),
  ],
  server: {
    port: 7001,
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

---

## 十二、Git 提交规范

### 12.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 12.2 Type 类型

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建工具或辅助工具变动

### 12.3 提交示例

```bash
feat(lifeRecord): 添加生活记录分类管理

- 实现分类 CRUD 操作
- 添加分类排序功能
- 集成分类统计功能

Closes #123
```

---

## 十三、代码格式化规范

### 13.1 Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100
}
```

### 13.2 格式化规则

- **不使用分号**: `semi: false`
- **使用单引号**: `singleQuote: true`
- **每行最大长度**: 100 字符
- **自动格式化**: 保存时自动格式化（VS Code 配置）

### 13.3 格式化命令

```bash
# 格式化所有代码
npm run format

# 格式化指定文件
npx prettier --write src/views/lifeRecord/index.vue
```

---

## 十四、性能优化规范

### 14.1 路由懒加载

```typescript
// ✅ 推荐：使用动态导入
{
  path: 'lifeRecord',
  component: () => import('@/views/lifeRecord/index.vue')
}

// ❌ 避免：直接导入
import LifeRecordView from '@/views/lifeRecord/index.vue'
{
  path: 'lifeRecord',
  component: LifeRecordView
}
```

### 14.2 组件懒加载

```vue
<script setup lang="ts">
// 使用 defineAsyncComponent
const HeavyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))
</script>

<template>
  <Suspense>
    <HeavyComponent />
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
```

### 14.3 图片优化

- 使用 WebP 格式
- 添加 `loading="lazy"` 属性
- 使用适当的图片尺寸

---

## 十五、开发工具推荐

### 15.1 VS Code 扩展

- **Vue (Official)**: Vue 3 官方支持
- **TypeScript Vue Plugin (Volar)**: TypeScript 支持
- **Tailwind CSS IntelliSense**: Tailwind 智能提示
- **Prettier**: 代码格式化
- **ESLint**: 代码检查
- **Iconify IntelliSense**: 图标智能提示

---

## 十六、常见问题和最佳实践

### 16.1 避免常见错误

```typescript
// ❌ 错误：直接解构 reactive 对象
const state = reactive({ count: 0 })
const { count } = state // 失去响应性

// ✅ 正确：使用 toRefs
const { count } = toRefs(state)

// ❌ 错误：硬编码颜色
<div class="bg-[#4296ed]">不要这样做</div>

// ✅ 正确：使用 CSS 变量
<div class="bg-clay-primary">正确做法</div>
```

### 16.2 性能优化技巧

- 使用 `v-memo` 缓存列表项
- 使用 `v-once` 渲染静态内容
- 合理使用 `computed` 而非 `watch`
- 避免在模板中使用复杂表达式

### 16.3 类型安全技巧

```typescript
// ✅ 使用类型断言
const user = ref<User | null>(null)
if (user.value) {
  console.log(user.value.username) // 类型安全
}

// ✅ 使用可选链
console.log(user.value?.username)

// ✅ 使用空值合并
const name = user.value?.username ?? '游客'
```

---

## 十七、部署规范

### 17.1 构建命令

```bash
# 开发环境构建
npm run build

# 生产环境构建
npm run build -- --mode production
```

### 17.2 构建产物

- 输出目录: `dist/`
- 静态资源: `dist/assets/`
- 入口文件: `dist/index.html`

### 17.3 部署检查清单

- [ ] 环境变量配置正确
- [ ] API 地址指向生产环境
- [ ] 移除 console.log
- [ ] 压缩图片资源
- [ ] 启用 Gzip 压缩
- [ ] 配置 CDN

---

## 附录：快速参考

### A. 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

### B. 常用路径别名

- `@/`: `src/` 目录
- `@/components`: 组件目录
- `@/views`: 页面目录
- `@/stores`: 状态管理目录
- `@/utils`: 工具函数目录
- `@/types`: 类型定义目录

### C. 图标资源

- **图标库**: Iconify (https://icon-sets.iconify.design/)
- **推荐图标集**:
  - `mdi:` - Material Design Icons
  - `hugeicons:` - Huge Icons（项目主要使用）
  - `lucide:` - Lucide Icons
  - `heroicons:` - Heroicons

### D. 项目特色功能

1. **完整的 AI 对话系统** - 支持 SSE 流式传输、工具调用、知识库关联
2. **Claymorphism 设计系统** - 完整的设计规范和工具类
3. **响应式设计** - 完美适配桌面端和移动端
4. **模块化架构** - 清晰的代码组织和职责划分
5. **类型安全** - 完整的 TypeScript 类型定义
6. **自动导入** - 减少重复导入代码
7. **高级 UI 特效** - 16 个精美的 UI 特效组件
8. **完整的工具函数库** - 存储、格式化、验证、SSE 等

---

**文档版本**: v2.0.0  
**最后更新**: 2026-03-10  
**维护者**: GoaliasOS Team

# GoaliasOS-UI 协作指南

## 项目定位

GoaliasOS-UI 是 GoaliasOS 的 Vue 单页客户端：把个人成长抽象为可记录、可分析、可迭代的“生活操作系统”。界面服务于 AI 对话、生活记录、财务收支、健康/知识概览和 OS 配置；新增能力应延续“数据记录 → 洞察/调度 → 行动反馈”的闭环，不应退化为孤立的表单页面。

## 技术与运行

- Vue 3 + TypeScript + Vite，Composition API 与 `<script setup>`。
- Pinia 管理跨页面状态；Vue Router 统一路由；Axios 调 REST，`utils/sse.ts` 调流式对话。
- Tailwind CSS 4 + Claymorphism 设计系统；图标优先使用 `AppIcon` / Iconify。
- Node 版本须满足 `package.json`（`^20.19.0 || >=22.12.0`）。

```powershell
npm install
npm run dev          # Vite 开发服务，默认端口见 vite.config.ts
npm run type-check   # vue-tsc
npm run build        # 类型检查 + 生产构建
npm run format       # 格式化 src/
```

开发 API 由 Vite 代理到后端；以 `.env.development` 为准，勿提交真实 Token、密钥或生产地址。

## 结构与职责

```text
src/
  api/           Axios 实例与按业务拆分的 API 模块
  components/    可复用组件（ai、common、os-config、ui）
  views/         路由页面；页面专属组件置于同级 components/
  stores/        Pinia 领域状态（session、user、lifeRecord、finance 等）
  router/        routes.ts 集中定义路由，index.ts 处理守卫
  types/         领域及接口类型；index.ts 统一导出
  utils/         存储、格式化、提示、Markdown、SSE 等无界面工具
  layouts/       主布局与认证布局
  style.css      全局样式、Clay 变量和可复用样式
```

功能通常遵循：`view → store / api module → 后端接口`。不要在页面中重复封装请求、硬编码跨页面状态或绕过公共错误处理。接口改动需同步检查 `api/modules`、`types`、对应 store 与使用页面。

主要业务：认证、首页健康/知识概览、AI 会话（模型/提示词/知识库、SSE、工具状态）、生活记录、财务收支，以及聊天模型/知识库/提示词/定时任务配置。

## 实现约定

- 新组件使用 PascalCase，工具、store、类型文件用 camelCase；页面优先按现有目录组织。
- 使用严格 TypeScript：Props/Emits 显式建模，API 返回使用领域类型；避免 `any` 和无依据的断言。
- Vue、Pinia、Vue Router、VueUse 及 `src/stores` / `src/utils` 已由自动导入配置支持，遵循附近文件的导入习惯，勿重复或混用。
- 从 Pinia 解构响应式状态时使用 `storeToRefs`；派生数据用 `computed`，副作用再使用 `watch`。
- 新路由统一加到 `src/router/routes.ts`，采用懒加载，并补全 `meta`（title、icon、权限、模块）。
- 请求统一使用 `api/index.ts` 的 `get/post/put/del/patch`；认证、响应解包、错误提示由拦截器处理。流式 API 使用 `createSSEConnection`、`AbortController`，必须处理完成、失败与取消。
- 通用组件放 `src/components`，业务页面独有组件留在页面目录；不要将业务状态塞进纯展示组件。

## 视觉规范

- 移动优先，使用 Tailwind 响应式前缀；优先 Tailwind 工具类，少写 scoped CSS。
- 使用 `src/style.css` 的 Clay 色彩、圆角、阴影与交互类，如 `clay-card`、`clay-btn`、`clay-input`；禁止为已有 token 硬编码近似颜色。
- 保持圆润、轻量、有层次的 Claymorphism，并确保 hover/active/disabled、空态、加载与错误态可用；尊重 `prefers-reduced-motion`。

## 变更检查

- 先阅读相邻实现，保持接口命名、响应结构与交互一致。
- 完成后按影响范围运行 `npm run type-check`；涉及构建配置、路由或全局样式时运行 `npm run build`。
- 文件统一 UTF-8、无 BOM；中文不得乱码。避免无关格式化和对用户已有改动的覆盖。
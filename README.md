# GoaliasOS-UI

> 一个基于 Vue 3 + TypeScript + Vite 构建的现代化健康生活管理系统，采用 Claymorphism 设计系统。

![Vue](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2-646cff?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06b6d4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

## ✨ 特性

- 🎨 **Claymorphism 设计系统** - 完整的粘土风格设计规范，包含颜色、阴影、圆角、动画等变量
- 🤖 **AI 对话系统** - 支持 SSE 流式传输、工具调用、知识库关联、模型选择
- 📝 **生活记录管理** - 分类管理、记录 CRUD、收藏评分、分类统计
- ⚙️ **OS 配置管理** - 聊天模型、知识库、提示词模板管理
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🔒 **类型安全** - 完整的 TypeScript 类型定义
- 🚀 **自动导入** - 减少重复导入代码，提升开发效率
- 🎭 **高级 UI 特效** - 16 个精美的 UI 特效组件

## 🛠️ 技术栈

### 核心框架

- **框架**: Vue 3.5 (Composition API + `<script setup>`)
- **构建工具**: Vite 7.2
- **类型系统**: TypeScript 5.9
- **状态管理**: Pinia 3.0
- **路由管理**: Vue Router 4.6
- **样式方案**: Tailwind CSS 4.1 + Claymorphism 设计系统

### 工具库

- **HTTP 客户端**: Axios 1.13 (SSE 流式传输)
- **图标库**: @iconify/vue 5.0
- **工具库**: VueUse 14.2
- **Markdown**: markdown-it 14.1 + highlight.js
- **图表**: ECharts 6.0 + vue-echarts
- **动画**: motion-v, ogl, @number-flow/vue
- **自动导入**: unplugin-auto-import + unplugin-vue-components
- **代码格式化**: Prettier 3.6

## 📁 项目结构

```
src/
├── api/                    # API 请求管理（按模块划分）
│   ├── index.ts           # Axios 实例和请求封装
│   └── modules/           # 各业务模块的 API
├── assets/                # 静态资源（图片、字体等）
├── components/            # 组件库（四大分类）
│   ├── ai/               # AI 对话系统组件
│   ├── common/           # 通用基础组件
│   ├── os-config/        # OS 配置管理组件
│   └── ui/               # UI 特效组件（16个高级特效）
├── layouts/               # 布局组件
├── lib/                   # 核心工具函数
├── router/                # 路由配置
├── stores/                # Pinia 状态管理
├── types/                 # TypeScript 类型定义
├── utils/                 # 通用工具函数
├── views/                 # 页面视图（按功能模块划分）
├── App.vue                # 根组件
├── main.ts                # 应用入口
└── style.css              # 全局样式（Claymorphism 设计系统）
```

## 🚀 快速开始

### 环境要求

- Node.js: `^20.19.0 || >=22.12.0`
- npm: `>=10.0.0`

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:7001 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码格式化

```bash
npm run format
```

### TypeScript 类型检查

```bash
npm run type-check
```

## 📖 核心功能

### AI 对话系统

- 会话管理（创建、切换、删除、重命名）
- 消息管理（加载、删除、分页）
- SSE 流式传输（实时消息接收、中断控制）
- 模型选择和知识库关联
- 工具调用状态追踪
- 提示词模板支持

### 生活记录场景

- 分类管理（CRUD、排序）
- 记录管理（CRUD、收藏、评分）
- 分类统计（记录数、平均评分、收藏数）
- 响应式布局（桌面端三栏/移动端单栏）

### OS 配置管理

- 聊天模型管理
- 知识库管理
- 提示词模板管理
- 模块切换和状态管理

### 用户认证

- 登录/登出
- Token 管理
- 权限检查（管理员权限）

## 🎨 设计系统

### Claymorphism 风格

项目采用 Claymorphism（粘土风格）设计系统，特点包括：

- **柔和的阴影** - 多层阴影创造浮起效果
- **圆润的边角** - 20px-48px 的大圆角
- **清新的配色** - 蓝色系主色调，糖果色辅助色
- **立体的层次** - 通过阴影和颜色创造深度感


## 📚 相关文档

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Iconify 图标](https://icon-sets.iconify.design/)

## 📄 许可证

MIT License

---

**版本**: v1.0.0  
**最后更新**: 2026-04-01  
**维护者**: GoaliasOS Team

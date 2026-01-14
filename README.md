# GoaliasOS-UI

GoaliasOS-UI 是一个基于 Vue 3 构建的现代化 Web 应用前端项目，采用 Vite 作为构建工具，集成了多种现代化前端技术栈。

## 技术栈

- **框架**: Vue 3
- **构建工具**: Vite
- **类型系统**: TypeScript
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **样式方案**: Tailwind CSS
- **HTTP 客户端**: Axios
- **UI 图标**: iconify-icon
- **组件库**: Inspire UI
- **工具库**: VueUse
- **代码格式化**: Prettier

## 项目结构

```
src/
├── api/          # API 请求管理
├── assets/       # 静态资源
├── components/   # 组件库
├── layouts/      # 布局组件
├── lib/          # 核心工具函数
├── router/       # 路由配置
├── stores/       # Pinia 状态管理
├── types/        # TypeScript 类型定义
├── utils/        # 通用工具函数
└── views/        # 页面视图
```

## 开发工具推荐

- **IDE**: [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)


## 脚本命令

### 安装依赖

```sh
npm install
```

### 开发模式

```sh
npm run dev
```

启动开发服务器，支持热更新。

### 构建生产版本

```sh
npm run build
```

执行 TypeScript 类型检查、编译代码并优化构建生产版本。

### 预览生产构建

```sh
npm run preview
```

在本地预览生产构建的效果。

### 代码格式化

```sh
npm run format
```

使用 Prettier 格式化代码。

### TypeScript 类型检查

```sh
npm run type-check
```

单独执行 TypeScript 类型检查。

## TypeScript 支持

TypeScript 默认无法处理 `.vue` 文件的类型信息，因此我们使用 `vue-tsc` 替代 `tsc` 进行类型检查。在编辑器中，需要安装 [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 扩展来让 TypeScript 语言服务识别 `.vue` 文件类型。

## 配置自定义

查看 [Vite 配置参考](https://vite.dev/config/) 了解如何自定义项目配置。

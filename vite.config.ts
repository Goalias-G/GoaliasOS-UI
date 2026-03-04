import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite 配置文件
 *
 * 功能说明：
 * - 配置 unplugin-auto-import 自动导入 Vue、Vue Router、Pinia、VueUse API
 * - 配置 unplugin-vue-components 自动注册组件
 * - 配置开发服务器代理
 * - 配置路径别名
 * - 配置代码分割策略，优化打包体积
 */

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // 自动导入 API
    AutoImport({
      imports: [
        'vue', // ref, reactive, computed, watch 等
        'vue-router', // useRouter, useRoute 等
        'pinia', // defineStore, storeToRefs 等
        '@vueuse/core', // useDark, useStorage 等
      ],
      dts: 'auto-imports.d.ts', // 生成类型声明文件
      dirs: ['src/stores', 'src/utils'], // 自动导入这些目录下的模块
      vueTemplate: true, // 在 template 中也支持自动导入
    }),
    // 自动注册组件
    Components({
      dirs: ['src/components'], // 组件目录
      dts: 'components.d.ts', // 生成类型声明文件
      deep: true, // 递归扫描子目录
      extensions: ['vue'], // 组件文件扩展名
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 开发服务器配置
  server: {
    port: 7001,
    host: true, // 允许局域网访问
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // 构建优化配置
  build: {
    copyPublicDir: true,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // 手动分包策略
        manualChunks: (id) => {
          // node_modules 中的依赖分包
          if (id.includes('node_modules')) {
            // Vue 核心库单独打包
            if (id.includes('vue') && !id.includes('vue-router') && !id.includes('@vue')) {
              return 'vue-core'
            }
            // Vue Router 单独打包
            if (id.includes('vue-router')) {
              return 'vue-router'
            }
            // Pinia 状态管理单独打包
            if (id.includes('pinia')) {
              return 'pinia'
            }
            // VueUse 工具库单独打包
            if (id.includes('@vueuse')) {
              return 'vueuse'
            }
            // Axios HTTP 库单独打包
            if (id.includes('axios')) {
              return 'axios'
            }
            // Markdown 相关库单独打包
            if (id.includes('markdown-it') || id.includes('highlight.js')) {
              return 'markdown'
            }
            // 图标库单独打包
            if (id.includes('@iconify') || id.includes('lucide-vue-next')) {
              return 'icons'
            }
            // 动画和特效库单独打包
            if (id.includes('motion-v') || id.includes('ogl') || id.includes('@number-flow')) {
              return 'animations'
            }
            // Tailwind 相关库单独打包
            if (
              id.includes('tailwindcss') ||
              id.includes('tailwind-merge') ||
              id.includes('class-variance-authority') ||
              id.includes('clsx')
            ) {
              return 'tailwind-utils'
            }
            // 其他第三方库统一打包到 vendor
            return 'vendor'
          }

          // 业务代码分包
          // UI 组件库单独打包
          if (id.includes('src/components/ui')) {
            return 'ui-components'
          }
          // OS 配置模块单独打包
          if (id.includes('src/views/os-config')) {
            return 'os-config'
          }
          // AI 对话模块单独打包
          if (id.includes('src/views/ai')) {
            return 'ai-module'
          }
          // 工具函数单独打包
          if (id.includes('src/utils') || id.includes('src/lib')) {
            return 'utils'
          }
          // Store 单独打包
          if (id.includes('src/stores')) {
            return 'stores'
          }
          // API 模块单独打包
          if (id.includes('src/api')) {
            return 'api'
          }
        },
        // 自定义 chunk 文件名
        chunkFileNames: 'assets/[name]-[hash].js',
        // 自定义入口文件名
        entryFileNames: 'assets/[name]-[hash].js',
        // 自定义静态资源文件名
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    minify: 'esbuild',
  },
})

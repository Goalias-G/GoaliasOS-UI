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
})

<script setup lang="ts">
/**
 * 关于页面
 *
 * 功能说明：
 * - 展示项目信息和技术栈
 * - 提供项目相关链接
 */
import AppIcon from '@/components/common/AppIcon.vue'

// 技术栈列表
const techStack = [
  { name: 'Vue 3', icon: 'mdi:vuejs', color: 'text-green-500', desc: '渐进式 JavaScript 框架' },
  { name: 'TypeScript', icon: 'mdi:language-typescript', color: 'text-blue-500', desc: '类型安全的 JavaScript 超集' },
  { name: 'Vite', icon: 'mdi:lightning-bolt', color: 'text-purple-500', desc: '下一代前端构建工具' },
  { name: 'Tailwind CSS', icon: 'mdi:tailwind', color: 'text-cyan-500', desc: '实用优先的 CSS 框架' },
  { name: 'Pinia', icon: 'mdi:fruit-pineapple', color: 'text-yellow-500', desc: 'Vue 官方状态管理库' },
  { name: 'Vue Router', icon: 'mdi:routes', color: 'text-red-500', desc: 'Vue 官方路由管理器' },
]

// 项目特性
const features = [
  { title: '自动导入', desc: 'Vue、VueUse、Pinia API 自动导入', icon: 'mdi:auto-fix' },
  { title: 'TypeScript', desc: '完整的类型支持和智能提示', icon: 'mdi:code-tags-check' },
  { title: 'Axios 封装', desc: '统一的请求拦截和错误处理', icon: 'mdi:api' },
  { title: '路由守卫', desc: '认证检查和权限控制', icon: 'mdi:shield-check' },
  { title: '状态管理', desc: 'Pinia 模块化状态管理', icon: 'mdi:database' },
  { title: '工具函数', desc: '常用工具函数封装', icon: 'mdi:tools' },
]
</script>

<template>
  <div class="p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">关于项目</h1>
      <p class="text-gray-500 mt-1">Vue 3 企业级前端项目基础架构模板</p>
    </div>

    <!-- 项目介绍 -->
    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white mb-8">
      <div class="flex items-start gap-6">
        <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          <AppIcon icon="mdi:rocket-launch" :size="32" color="white" />
        </div>
        <div>
          <h2 class="text-2xl font-bold mb-2">GoaliasOS 基础架构</h2>
          <p class="text-indigo-100 leading-relaxed">
            这是一个基于 Vue 3 + TypeScript + Vite + Tailwind CSS 构建的现代化前端项目模板。
            提供完整的基础架构配置，包括自动导入、Axios 封装、路由系统、状态管理等，
            帮助开发者快速启动企业级前端项目。
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 技术栈 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AppIcon icon="mdi:code-braces" :size="20" class="text-indigo-500" />
          技术栈
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="tech in techStack" :key="tech.name"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <AppIcon :icon="tech.icon" :size="24" :class="tech.color" />
            <div>
              <p class="font-medium text-gray-900">{{ tech.name }}</p>
              <p class="text-xs text-gray-500">{{ tech.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 项目特性 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AppIcon icon="mdi:star-outline" :size="20" class="text-indigo-500" />
          项目特性
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="feature in features" :key="feature.title"
            class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <AppIcon :icon="feature.icon" :size="16" class="text-indigo-500" />
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ feature.title }}</p>
              <p class="text-xs text-gray-500">{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 版本信息 -->
    <div class="mt-6 bg-gray-50 rounded-xl p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <AppIcon icon="mdi:tag-outline" :size="20" class="text-gray-400" />
          <span class="text-sm text-gray-600">版本 1.0.0</span>
        </div>
        <div class="flex items-center gap-4 text-sm text-gray-500">
          <span>© {{ new Date().getFullYear() }} GoaliasOS</span>
        </div>
      </div>
    </div>
  </div>
</template>

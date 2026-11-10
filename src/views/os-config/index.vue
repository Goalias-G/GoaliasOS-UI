<script setup lang="ts">
/**
 * OS 配置管理主页面
 *
 * - 注入侧栏导航配置
 * - 通过 router-view 渲染 knowledge / ai / schedule 领域模块
 */
import { OS_CONFIG_NAV_ITEMS } from './config/nav'
</script>

<template>
  <OSConfigLayout :nav-items="OS_CONFIG_NAV_ITEMS">
    <router-view />
  </OSConfigLayout>
</template>

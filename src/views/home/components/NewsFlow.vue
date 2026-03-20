<script setup lang="ts">
/**
 * NewsFlow 组件 - 资讯流
 *
 * 功能说明：
 * - 展示六大平台的热点新闻榜单
 * - 每个平台显示前 8 条新闻
 * - 支持点击新闻标题在新窗口打开链接
 * - 响应式布局（桌面端三列、平板端两列、移动端单列）
 */

import type { HotBoard } from '@/types'

// ==================== Props ====================
interface Props {
  /** 热门看板数据 */
  hotBoards?: HotBoard[]
}

const props = defineProps<Props>()

// ==================== 平台配置（固定顺序） ====================
const platformConfig = [
  { type: 'weibo', name: '微博热搜', icon: 'simple-icons:sinaweibo' },
  { type: 'baidu', name: '百度热搜', icon: 'simple-icons:baidu' },
  { type: 'juejin', name: '掘金热榜', icon: 'simple-icons:juejin' },
  { type: 'douyin', name: '抖音热榜', icon: 'simple-icons:tiktok' },
  { type: 'netease-music', name: '网易云音乐', icon: 'simple-icons:neteasecloudmusic' },
  { type: 'lol', name: '英雄联盟', icon: 'simple-icons:leagueoflegends' },
]

// ==================== 计算属性 ====================
// 根据 hotBoards 创建一个 Map，方便查找
const boardMap = computed(() => {
  const map = new Map<string, HotBoard>()
  if (props.hotBoards) {
    props.hotBoards.forEach((board) => {
      if (board.type) {
        map.set(board.type, board)
      }
    })
  }
  return map
})

// 按固定顺序返回平台数据
const boardList = computed(() => {
  return platformConfig.map((config) => {
    const board = boardMap.value.get(config.type)
    return {
      ...config,
      ...board,
      newsList: board?.list?.slice(0, 8) || [],
    }
  })
})

// 格式化更新时间
function formatUpdateTime(time?: string): string {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return time
  }
}
</script>

<template>
  <div class="news-flow">
    <h2 class="text-lg md:text-xl font-bold text-clay-text-primary mb-6">热点资讯</h2>

    <!-- 资讯流内容 -->
    <div
      v-if="boardList.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
    >
      <article
        v-for="board in boardList"
        :key="board.type"
        class="clay-card-hoverable overflow-hidden flex flex-col"
      >
        <!-- 平台头部 -->
        <div class="p-5 border-b border-clay-bg-base">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center shadow-clay-button"
              >
                <AppIcon :icon="board.icon" :size="24" />
              </div>
              <div>
                <h3 class="font-bold text-clay-text-primary">
                  {{ board.name }}
                </h3>
                <div v-if="board.update_time" class="text-xs text-clay-text-secondary">
                  更新于 {{ formatUpdateTime(board.update_time) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 新闻列表 -->
        <div class="p-5 flex-1">
          <ul v-if="board.newsList.length > 0" class="space-y-3">
            <li v-for="(news, index) in board.newsList" :key="index" class="group">
              <a
                :href="news.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-start gap-3 p-2 rounded-clay-sm transition-all hover:bg-clay-bg-base group-hover:translate-x-1"
                :aria-label="`打开新闻：${news.title}`"
              >
                <!-- 序号 -->
                <div
                  class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  :class="
                    index < 3
                      ? 'bg-clay-primary text-white'
                      : 'bg-clay-bg-base text-clay-text-secondary'
                  "
                >
                  {{ news.index ?? index + 1 }}
                </div>
                <!-- 标题 -->
                <div class="flex-1 min-w-0">
                  <div
                    class="text-sm text-clay-text-primary leading-relaxed line-clamp-2 transition-colors group-hover:text-clay-primary"
                  >
                    {{ news.title || '无标题' }}
                  </div>
                </div>
                <!-- 外链图标 -->
                <AppIcon
                  icon="mdi:open-in-new"
                  :size="16"
                  class="text-clay-text-muted shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            </li>
          </ul>
          <!-- 空状态 -->
          <div v-else class="text-center py-8">
            <AppIcon
              icon="mdi:newspaper-variant-off"
              :size="48"
              class="text-clay-text-muted mx-auto mb-3"
            />
            <p class="text-sm text-clay-text-secondary">暂无热点</p>
          </div>
        </div>
      </article>
    </div>

    <!-- 空状态 -->
    <div v-else class="clay-card p-12 text-center">
      <AppIcon
        icon="mdi:newspaper-variant-outline"
        :size="64"
        class="text-clay-text-muted mx-auto mb-4"
      />
      <h3 class="text-lg font-bold text-clay-text-primary mb-2">暂无资讯</h3>
      <p class="text-clay-text-secondary">热点资讯将在这里显示</p>
    </div>
  </div>
</template>

<style scoped>
/* 文本截断（2行） */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

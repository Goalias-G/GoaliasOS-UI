/**
 * 每日健康相关类型定义
 */

/** 每日健康记录 */
export interface DailyHealth {
  id: number
  userId: number
  upTime?: string
  sleepTime?: string
  food?: string
  exercise?: string
  remark?: string
  createTime?: string
  createBy?: number
  updateTime?: string
  updateBy?: number
}

/** 每日健康记录查询参数 */
export interface DailyHealthParams {
  id?: number
  userId?: number
  upTime?: string
  sleepTime?: string
  food?: string
  exercise?: string
  remark?: string
  healthDate?: string
  startTime?: string
  endTime?: string
}

/**
 * 每日知识相关类型定义
 */

/** 每日知识类型枚举 */
export const DailyKnowledgeType = {
  KNOWLEDGE: 'knowledge',
  PSYCHOLOGY: 'psychology',
} as const

export type DailyKnowledgeType = (typeof DailyKnowledgeType)[keyof typeof DailyKnowledgeType]

/** 每日知识记录 */
export interface DailyKnowledge {
  id: number
  type?: DailyKnowledgeType
  title?: string
  content?: string
  createTime?: string
  createBy?: number
  updateTime?: string
  updateBy?: number
}

/** 每日知识查询参数 */
export interface DailyKnowledgeParams {
  id?: number
  type?: DailyKnowledgeType
  title?: string
  content?: string
  knowledgeDate?: string
  startTime?: string
  endTime?: string
}

/**
 * 首页相关类型定义
 */

/** 首页信息 */
export interface HomeInfoVo {
  saying?: string
  hotBoards?: HotBoard[]
  weather?: Weather
  aiRecommend?: AiRecommend
}

/** 天气信息 */
export interface Weather {
  province?: string
  city?: string
  district?: string
  weather?: string
  temperature?: string
  wind_direction?: string
  wind_power?: string
  humidity?: string
  report_time?: string
}

/** 热门看板 */
export interface HotBoard {
  type?: string
  update_time?: string
  list?: NewsInfo[]
}

/** 新闻信息 */
export interface NewsInfo {
  index?: number
  title?: string
  url?: string
}

/** AI推荐信息 */
export interface AiRecommend {
  greeting?: string
  psychology?: AiKnowledgeInfo
  knowledge?: AiKnowledgeInfo
  lifeAnalysis?: string
}

/** 知识信息 */
export interface AiKnowledgeInfo {
  title?: string
  content?: string
}

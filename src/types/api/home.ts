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

/**
 * 健康睡眠图表数据
 */
export interface HealthSleepChart {
  /** 日期 */
  date: string
  /** 起床时间 */
  upTime?: string | null
  /** 睡眠时间 */
  sleepTime?: string | null
}

/** 节假日万年历 — 查询回显 */
export interface HolidayCalendarQuery {
  date?: string
  month?: string
  year?: string
  timezone?: string
  holiday_type?: string
  region?: string
  include_nearby?: boolean
  nearby_limit?: number
  exclude_past?: boolean
}

/** 节假日万年历 — 汇总 */
export interface HolidayCalendarSummary {
  total_days?: number
  weekend_days?: number
  workdays?: number
  rest_days?: number
  holiday_events?: number
  legal_rest_days?: number
  legal_workdays?: number
}

/** 节假日万年历 — 单日明细（不含干支展示字段的业务使用） */
export interface HolidayCalendarDay {
  date: string
  year?: number
  month?: number
  day?: number
  weekday_cn?: string
  is_weekend?: boolean
  is_workday?: boolean
  is_rest_day?: boolean
  is_holiday?: boolean
  legal_holiday_name?: string
  /** rest | workday_adjust */
  legal_holiday_type?: string
  solar_festival?: string
  lunar_festival?: string
  solar_term?: string
  lunar_year?: number
  lunar_month?: number
  lunar_day?: number
  lunar_month_name?: string
  lunar_day_name?: string
}

export interface HolidayCalendarEvent {
  date: string
  name: string
  type: string
  is_workday?: boolean
}

export interface HolidayCalendarVo {
  mode?: string
  query?: HolidayCalendarQuery
  summary?: HolidayCalendarSummary
  days?: HolidayCalendarDay[]
  holidays?: HolidayCalendarEvent[]
}

/** 日历日任务状态 */
export type CalendarTaskStatus = 'pending' | 'done' | 'cancelled'

export interface CalendarDayTask {
  id: string
  content: string
  status: CalendarTaskStatus
}

/** 日历日笔记 */
export interface DailyCalendarNote {
  id?: number
  userId?: number
  noteDate: string
  moodEmoji?: string
  /** 今日一言 */
  note?: string
  tasks?: CalendarDayTask[]
  createTime?: string
  updateTime?: string
}

export type DailyCalendarNoteParams = Omit<DailyCalendarNote, 'id' | 'userId' | 'createTime' | 'updateTime'> & {
  id?: number
}

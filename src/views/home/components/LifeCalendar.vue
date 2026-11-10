<script setup lang="ts">
/**
 * 生活日历：节假日万年历 + 日心情 / 今日一言 / 任务
 * 点击日期后在当周下方展开气泡编辑，不使用弹窗。
 */
import type {
  CalendarDayTask,
  CalendarTaskStatus,
  DailyCalendarNote,
  HolidayCalendarDay,
  HolidayCalendarSummary,
  HolidayCalendarVo,
} from '@/types'
import {calendarNoteApi, homeApi} from '@/api/modules/home'
import {showError, showSuccess} from '@/utils/toast'

const WEEK_HEADERS = ['一', '二', '三', '四', '五', '六', '日']
/** 心情表情：好 → 中立 → 坏 */
const MOOD_OPTIONS = ['🤩', '🥳', '😊', '🥰', '🙂', '😐', '😴', '😔', '😢', '😫', '😤', '😡']

interface TaskCounts {
  pending: number
  done: number
  cancelled: number
}

interface CalendarCell {
  key: string
  date: string
  day: number
  inMonth: boolean
  holiday?: HolidayCalendarDay
  note?: DailyCalendarNote
  isToday: boolean
  taskCounts: TaskCounts
}

const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth() + 1)

const loading = ref(false)
const saving = ref(false)
const holidayData = ref<HolidayCalendarVo | null>(null)
const notesMap = ref<Record<string, DailyCalendarNote>>({})

const selectedDate = ref<string | null>(null)
const pendingSelectDate = ref<string | null>(null)
const draft = ref(createEmptyDraft(formatYmd(now)))
const newTaskContent = ref('')

const monthParam = computed(
    () => `${viewYear.value}-${String(viewMonth.value).padStart(2, '0')}`,
)

/** 供 type=month 双向绑定 */
const monthInput = computed({
  get: () => monthParam.value,
  set: (value: string) => {
    if (!/^\d{4}-\d{2}$/.test(value)) return
    const [y, m] = value.split('-').map(Number)
    if (!y || !m || m < 1 || m > 12) return
    viewYear.value = y
    viewMonth.value = m
  },
})

const summary = computed<HolidayCalendarSummary>(() => holidayData.value?.summary ?? {})

const holidayMap = computed(() => {
  const map: Record<string, HolidayCalendarDay> = {}
  for (const day of holidayData.value?.days ?? []) {
    if (day.date) map[day.date] = day
  }
  return map
})

const calendarCells = computed<CalendarCell[]>(() => {
  const year = viewYear.value
  const month = viewMonth.value
  const first = new Date(year, month - 1, 1)
  const firstWeekday = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = formatYmd(new Date())
  const cells: CalendarCell[] = []

  for (let i = 0; i < firstWeekday; i++) {
    const d = new Date(year, month - 1, 1 - (firstWeekday - i))
    const date = formatYmd(d)
    cells.push(buildCell(date, d.getDate(), false, today))
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push(buildCell(date, day, true, today))
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]!
    const d = new Date(last.date)
    d.setDate(d.getDate() + 1)
    const date = formatYmd(d)
    cells.push(buildCell(date, d.getDate(), false, today))
  }
  return cells
})

/** 按周切分，便于在选中日所在周下方插入气泡 */
const calendarWeeks = computed(() => {
  const weeks: CalendarCell[][] = []
  for (let i = 0; i < calendarCells.value.length; i += 7) {
    weeks.push(calendarCells.value.slice(i, i + 7))
  }
  return weeks
})

const selectedHoliday = computed(() =>
    selectedDate.value ? holidayMap.value[selectedDate.value] : undefined,
)

const draftTaskCounts = computed(() => countTasks(draft.value.tasks))

watch(monthParam, () => {
  if (!pendingSelectDate.value) {
    selectedDate.value = null
  }
  loadMonth()
})

onMounted(() => {
  loadMonth()
})

function buildCell(date: string, day: number, inMonth: boolean, today: string): CalendarCell {
  const note = notesMap.value[date]
  return {
    key: inMonth ? date : `pad-${date}`,
    date,
    day,
    inMonth,
    holiday: holidayMap.value[date],
    note,
    isToday: date === today,
    taskCounts: countTasks(note?.tasks),
  }
}

async function loadMonth() {
  loading.value = true
  try {
    const [holidayRes, notesRes] = await Promise.all([
      homeApi.holidayCalendar({month: monthParam.value}),
      calendarNoteApi.listByMonth(monthParam.value),
    ])
    if (holidayRes.code === 200) {
      holidayData.value = holidayRes.data ?? null
    } else {
      holidayData.value = null
      showError(holidayRes.message || '加载节假日失败')
    }

    const map: Record<string, DailyCalendarNote> = {}
    if (notesRes.code === 200 && notesRes.data) {
      for (const note of notesRes.data) {
        map[note.noteDate] = note
      }
    }
    notesMap.value = map

    if (pendingSelectDate.value) {
      const target = pendingSelectDate.value
      pendingSelectDate.value = null
      applySelectDate(target)
    }
  } catch (error) {
    console.error(error)
    showError('加载日历失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function shiftMonth(delta: number) {
  const d = new Date(viewYear.value, viewMonth.value - 1 + delta, 1)
  viewYear.value = d.getFullYear()
  viewMonth.value = d.getMonth() + 1
}

function goToday() {
  const d = new Date()
  const date = formatYmd(d)
  if (viewYear.value !== d.getFullYear() || viewMonth.value !== d.getMonth() + 1) {
    pendingSelectDate.value = date
    viewYear.value = d.getFullYear()
    viewMonth.value = d.getMonth() + 1
    return
  }
  applySelectDate(date)
}

function openDay(cell: CalendarCell) {
  if (!cell.inMonth) {
    pendingSelectDate.value = cell.date
    const d = new Date(cell.date)
    viewYear.value = d.getFullYear()
    viewMonth.value = d.getMonth() + 1
    return
  }

  if (selectedDate.value === cell.date) {
    selectedDate.value = null
    return
  }
  applySelectDate(cell.date)
}

function applySelectDate(date: string) {
  selectedDate.value = date
  const existing = notesMap.value[date]
  draft.value = existing
      ? {
        noteDate: existing.noteDate,
        moodEmoji: existing.moodEmoji || '',
        note: existing.note || '',
        tasks: (existing.tasks || []).map((t) => ({...t})),
      }
      : createEmptyDraft(date)
  newTaskContent.value = ''
}

function closeBubble() {
  selectedDate.value = null
}

function createEmptyDraft(date: string): DailyCalendarNote {
  return {
    noteDate: date,
    moodEmoji: '',
    note: '',
    tasks: [],
  }
}

function countTasks(tasks?: CalendarDayTask[]): TaskCounts {
  const counts: TaskCounts = {pending: 0, done: 0, cancelled: 0}
  for (const task of tasks || []) {
    if (task.status === 'done') counts.done += 1
    else if (task.status === 'cancelled') counts.cancelled += 1
    else counts.pending += 1
  }
  return counts
}

function addTask() {
  const content = newTaskContent.value.trim()
  if (!content) return
  const tasks = draft.value.tasks ? [...draft.value.tasks] : []
  tasks.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    content,
    status: 'pending',
  })
  draft.value.tasks = tasks
  newTaskContent.value = ''
}

function setTaskStatus(task: CalendarDayTask, status: CalendarTaskStatus) {
  task.status = status
}

function removeTask(id: string) {
  draft.value.tasks = (draft.value.tasks || []).filter((t) => t.id !== id)
}

async function saveDraft() {
  if (!selectedDate.value) return
  saving.value = true
  try {
    const payload = {
      noteDate: draft.value.noteDate,
      moodEmoji: draft.value.moodEmoji || undefined,
      note: draft.value.note || undefined,
      tasks: draft.value.tasks || [],
    }
    const res = await calendarNoteApi.save(payload)
    if (res.code === 200 && res.data) {
      notesMap.value = {...notesMap.value, [res.data.noteDate]: res.data}
      showSuccess('已保存')
      selectedDate.value = null
    } else {
      showError(res.message || '保存失败')
    }
  } catch (error) {
    console.error(error)
    showError('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

function dayBadges(day?: HolidayCalendarDay) {
  if (!day) return [] as { text: string; tone: string }[]
  const badges: { text: string; tone: string }[] = []
  if (day.legal_holiday_type === 'workday_adjust' || (day.is_weekend && day.is_workday)) {
    badges.push({text: '补班', tone: 'work'})
  } else if (day.legal_holiday_type === 'rest' || (day.is_rest_day && day.legal_holiday_name)) {
    badges.push({text: '休', tone: 'rest'})
  }
  return badges
}

function festivalText(day?: HolidayCalendarDay) {
  if (!day) return ''
  return [day.legal_holiday_name, day.solar_festival, day.lunar_festival, day.solar_term]
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join(' · ')
}

function formatYmd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function taskStatusClass(status: CalendarTaskStatus) {
  if (status === 'done') return 'line-through text-clay-text-muted'
  if (status === 'cancelled') return 'line-through text-clay-text-muted opacity-60'
  return 'text-clay-text-primary'
}

function isMakeup(day?: HolidayCalendarDay) {
  return !!day && (day.legal_holiday_type === 'workday_adjust' || (!!day.is_weekend && !!day.is_workday))
}

function hasSaying(note?: DailyCalendarNote) {
  return !!note?.note?.trim()
}

function weekHasSelected(week: CalendarCell[]) {
  return !!selectedDate.value && week.some((c) => c.inMonth && c.date === selectedDate.value)
}

/**
 * 格子背景按接口笔记状态同步（有一言=淡紫），选中只加描边不强行改底色，
 * 避免未保存时一言紫底被点选临时盖掉。
 */
function cellToneClass(cell: CalendarCell) {
  if (!cell.inMonth) return 'bg-clay-bg-base/60 opacity-55 text-clay-text-primary'

  // 一言背景始终跟 notesMap / 接口数据走
  if (hasSaying(cell.note)) {
    return 'day-has-saying text-clay-text-primary hover:shadow-clay-card'
  }
  if (isMakeup(cell.holiday)) {
    return 'bg-amber-50/90 text-clay-text-primary hover:shadow-clay-card'
  }
  if (cell.holiday?.is_rest_day) {
    return 'bg-emerald-50/80 text-clay-text-primary hover:shadow-clay-card'
  }
  if (selectedDate.value === cell.date) {
    return 'bg-clay-primary/10 text-clay-text-primary hover:shadow-clay-card'
  }
  return 'bg-clay-bg-elevated text-clay-text-primary hover:shadow-clay-card'
}
</script>

<template>
  <div class="life-calendar space-y-4 sm:space-y-5">
    <!-- 月切换：移动端整行网格；PC 标题与控件同行，月份列固定宽度防错位 -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h3 class="clay-section-title clay-section-title--compact mb-0 shrink-0">生活日历</h3>
      <div
          class="month-actions grid w-full grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-1.5 sm:w-auto sm:grid-cols-[2.5rem_12rem_2.5rem_auto] sm:gap-3"
      >
        <button class="month-nav-button" type="button" title="上个月" @click="shiftMonth(-1)">
          <AppIcon icon="mdi:chevron-left" :size="20"/>
        </button>
        <label class="sr-only" for="life-calendar-month">选择年月</label>
        <input
            id="life-calendar-month"
            v-model="monthInput"
            type="month"
            class="clay-input h-10 min-w-0 w-full px-3 py-1.5 text-sm font-semibold text-clay-text-primary sm:min-w-0"
        />
        <button class="month-nav-button" type="button" title="下个月" @click="shiftMonth(1)">
          <AppIcon icon="mdi:chevron-right" :size="20"/>
        </button>
        <button
            class="clay-btn-secondary col-span-3 h-10 w-full px-4 py-1.5 text-sm whitespace-nowrap sm:col-auto sm:w-auto sm:min-w-[4.5rem] sm:shrink-0"
            type="button"
            @click="goToday"
        >
          今天
        </button>
      </div>
    </div>

    <!-- Summary：四块平分宽度，块内标题与数字同行 -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      <div
        class="flex items-baseline justify-between gap-2 rounded-clay-md bg-clay-bg-base px-3 py-2.5 sm:px-3.5"
      >
        <span class="text-xs text-clay-text-secondary shrink-0">工作日</span>
        <span class="text-base sm:text-lg font-bold tabular-nums text-clay-text-primary">
          {{ loading ? '···' : (summary.workdays ?? '-') }}
        </span>
      </div>
      <div
        class="flex items-baseline justify-between gap-2 rounded-clay-md bg-clay-bg-base px-3 py-2.5 sm:px-3.5"
      >
        <span class="text-xs text-clay-text-secondary shrink-0">休息日</span>
        <span class="text-base sm:text-lg font-bold tabular-nums text-clay-text-primary">
          {{ loading ? '···' : (summary.rest_days ?? '-') }}
        </span>
      </div>
      <div
        class="flex items-baseline justify-between gap-2 rounded-clay-md bg-clay-bg-base px-3 py-2.5 sm:px-3.5"
      >
        <span class="text-xs text-clay-text-secondary shrink-0">法定休假</span>
        <span class="text-base sm:text-lg font-bold tabular-nums text-emerald-600">
          {{ loading ? '···' : (summary.legal_rest_days ?? '-') }}
        </span>
      </div>
      <div
        class="flex items-baseline justify-between gap-2 rounded-clay-md bg-clay-bg-base px-3 py-2.5 sm:px-3.5"
      >
        <span class="text-xs text-clay-text-secondary shrink-0">补班日</span>
        <span class="text-base sm:text-lg font-bold tabular-nums text-amber-600">
          {{ loading ? '···' : (summary.legal_workdays ?? '-') }}
        </span>
      </div>
    </div>

    <!-- 日历区域独立 loading，不阻塞首页其它模块 -->
    <div v-if="loading" class="calendar-loading rounded-clay-md bg-clay-bg-base/70 p-6 sm:p-8">
      <div class="flex flex-col items-center justify-center gap-3 py-8">
        <div class="relative w-12 h-12">
          <div class="absolute inset-0 rounded-full border-4 border-clay-primary/15"></div>
          <div
              class="absolute inset-0 rounded-full border-4 border-clay-primary border-t-transparent animate-spin"
          ></div>
        </div>
        <p class="text-sm text-clay-text-secondary">日历加载中...</p>
        <div class="w-full max-w-sm grid grid-cols-7 gap-1.5 mt-2">
          <div
              v-for="i in 14"
              :key="i"
              class="h-10 rounded-md bg-clay-bg-elevated/80 animate-pulse"
              :style="{ animationDelay: `${(i % 7) * 60}ms` }"
          ></div>
        </div>
      </div>
    </div>

    <template v-else>
      <div class="grid grid-cols-7 gap-1 sm:gap-2">
        <div
            v-for="w in WEEK_HEADERS"
            :key="w"
            class="text-center text-[11px] sm:text-sm font-medium text-clay-text-secondary py-1"
        >
          周{{ w }}
        </div>
      </div>

      <div class="space-y-1 sm:space-y-2">
        <div v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex" class="space-y-1 sm:space-y-2">
          <div class="grid grid-cols-7 gap-1 sm:gap-2">
            <button
                v-for="cell in week"
                :key="cell.key"
                type="button"
                class="relative min-h-[4.25rem] sm:min-h-[5.5rem] rounded-clay-md p-1 sm:p-2 text-left transition-all border"
                :class="[
                cellToneClass(cell),
                selectedDate === cell.date
                  ? 'border-clay-primary shadow-[0_0_0_2px_rgba(66,150,237,0.22)]'
                  : cell.isToday
                    ? 'border-clay-primary/45 shadow-[0_0_0_2px_rgba(66,150,237,0.16)]'
                    : 'border-transparent',
              ]"
                @click="openDay(cell)"
            >
              <div class="flex items-start justify-between gap-1">
                <span
                    class="text-sm font-semibold"
                    :class="cell.isToday ? 'text-clay-primary' : 'text-clay-text-primary'"
                >
                  {{ cell.day }}
                </span>
                <span v-if="cell.note?.moodEmoji" class="text-sm leading-none">{{
                    cell.note.moodEmoji
                  }}</span>
              </div>

              <div class="mt-1 flex flex-wrap gap-0.5">
                <span
                    v-for="badge in dayBadges(cell.holiday)"
                    :key="badge.text"
                    class="text-[10px] px-1 rounded"
                    :class="
                    badge.tone === 'work'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  "
                >
                  {{ badge.text }}
                </span>
              </div>

              <div
                  v-if="cell.holiday?.lunar_day_name || festivalText(cell.holiday)"
                  class="mt-0.5 flex flex-wrap items-baseline gap-x-1 gap-y-0.5 text-[10px] sm:text-xs leading-tight"
              >
                <span
                    v-if="cell.holiday?.lunar_day_name"
                    class="text-clay-text-secondary shrink-0"
                >
                  {{ cell.holiday.lunar_day_name }}
                </span>
                <span
                    v-if="festivalText(cell.holiday)"
                    class="text-rose-500/90 min-w-0 break-all"
                >
                  {{ festivalText(cell.holiday) }}
                </span>
              </div>

              <!-- 任务数量：待办 / 完成 / 取消 -->
              <div
                  v-if="cell.note?.tasks?.length"
                  class="mt-1 flex flex-wrap gap-1 text-[10px] leading-none"
              >
                <span
                    v-if="cell.taskCounts.pending"
                    class="px-1 py-0.5 rounded bg-sky-50 text-sky-700"
                >
                  待办 {{ cell.taskCounts.pending }}
                </span>
                <span
                    v-if="cell.taskCounts.done"
                    class="px-1 py-0.5 rounded bg-emerald-50 text-emerald-700"
                >
                  完成 {{ cell.taskCounts.done }}
                </span>
                <span
                    v-if="cell.taskCounts.cancelled"
                    class="px-1 py-0.5 rounded bg-stone-100 text-stone-500"
                >
                  取消 {{ cell.taskCounts.cancelled }}
                </span>
              </div>
            </button>
          </div>

          <!-- 选中日所在周下方气泡 -->
          <Transition name="bubble">
            <div
                v-if="weekHasSelected(week)"
                class="calendar-bubble relative rounded-clay-md border border-clay-primary/20 bg-clay-bg-elevated p-4 sm:p-5 shadow-clay-card"
            >
              <div
                  class="pointer-events-none absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-clay-primary/20 bg-clay-bg-elevated"
              ></div>

              <div class="relative flex items-start justify-between gap-3 mb-3">
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span class="font-semibold text-clay-text-primary shrink-0">{{ selectedDate }}</span>
                    <span
                        v-if="selectedHoliday?.weekday_cn"
                        class="text-xs text-clay-text-secondary shrink-0"
                    >
                      {{ selectedHoliday.weekday_cn }}
                    </span>
                    <span
                        v-if="selectedHoliday?.lunar_month_name"
                        class="text-xs text-clay-text-secondary shrink-0"
                    >
                      农历{{ selectedHoliday.lunar_month_name }}{{ selectedHoliday.lunar_day_name }}
                    </span>
                    <span
                        v-if="festivalText(selectedHoliday)"
                        class="text-xs text-rose-500 min-w-0"
                    >
                      {{ festivalText(selectedHoliday) }}
                    </span>
                    <span
                        v-for="badge in dayBadges(selectedHoliday)"
                        :key="badge.text"
                        class="text-[11px] px-2 py-0.5 rounded-full"
                        :class="
                        badge.tone === 'work'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      "
                    >
                      {{ badge.text }}
                    </span>
                  </div>
                </div>
                <button
                    type="button"
                    class="p-1.5 rounded-clay-sm text-clay-text-muted hover:bg-clay-bg-base shrink-0"
                    @click="closeBubble"
                >
                  <AppIcon icon="mdi:close" :size="18"/>
                </button>
              </div>

              <div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <div class="text-xs font-medium text-clay-text-secondary shrink-0">今日心情</div>
                <div class="flex flex-wrap gap-1.5 min-w-0">
                  <button
                      v-for="emoji in MOOD_OPTIONS"
                      :key="emoji"
                      type="button"
                      class="w-9 h-9 rounded-full text-lg transition-all"
                      :class="
                      draft.moodEmoji === emoji
                        ? 'bg-clay-primary/15 ring-2 ring-clay-primary/40 scale-105'
                        : 'bg-clay-bg-base hover:bg-white'
                    "
                      @click="draft.moodEmoji = draft.moodEmoji === emoji ? '' : emoji"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>

              <div class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <label
                    for="calendar-day-note"
                    class="text-xs font-medium text-clay-text-secondary shrink-0"
                >今日一言</label>
                <input
                    id="calendar-day-note"
                    v-model="draft.note"
                    maxlength="200"
                    class="clay-input min-w-0 flex-1 basis-[12rem] text-sm"
                />
              </div>

              <div class="mb-3">
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <div class="text-xs font-medium text-clay-text-secondary">今日任务</div>
                  <div class="flex gap-1.5 text-[11px]">
                    <span class="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700"
                    >待办 {{ draftTaskCounts.pending }}</span
                    >
                    <span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700"
                    >完成 {{ draftTaskCounts.done }}</span
                    >
                    <span class="px-1.5 py-0.5 rounded bg-stone-100 text-stone-500"
                    >取消 {{ draftTaskCounts.cancelled }}</span
                    >
                  </div>
                </div>
                <div class="flex gap-2 mb-2">
                  <input
                      v-model="newTaskContent"
                      maxlength="100"
                      class="clay-input flex-1 text-sm"
                      @keyup.enter="addTask"
                  />
                  <button type="button" class="clay-btn px-3 text-sm shrink-0" @click="addTask">
                    添加
                  </button>
                </div>
                <ul v-if="draft.tasks?.length" class="space-y-1.5">
                  <li
                      v-for="task in draft.tasks"
                      :key="task.id"
                      class="flex items-center gap-1.5 p-2 rounded-clay-sm bg-clay-bg-base"
                  >
                    <span class="flex-1 text-sm" :class="taskStatusClass(task.status)">{{
                        task.content
                      }}</span>
                    <button
                        type="button"
                        class="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                        title="完成"
                        @click="setTaskStatus(task, 'done')"
                    >
                      <AppIcon icon="mdi:check" :size="15"/>
                    </button>
                    <button
                        type="button"
                        class="p-1 rounded text-amber-600 hover:bg-amber-50"
                        title="取消"
                        @click="setTaskStatus(task, 'cancelled')"
                    >
                      <AppIcon icon="mdi:close-circle-outline" :size="15"/>
                    </button>
                    <button
                        type="button"
                        class="p-1 rounded text-clay-text-muted hover:bg-white"
                        title="恢复待办"
                        @click="setTaskStatus(task, 'pending')"
                    >
                      <AppIcon icon="mdi:restart" :size="15"/>
                    </button>
                    <button
                        type="button"
                        class="p-1 rounded text-red-500 hover:bg-red-50"
                        title="删除"
                        @click="removeTask(task.id)"
                    >
                      <AppIcon icon="mdi:trash-can-outline" :size="15"/>
                    </button>
                  </li>
                </ul>
              </div>

              <div class="flex gap-2">
                <button
                    type="button"
                    class="clay-btn-secondary flex-1 py-2 text-sm"
                    @click="closeBubble"
                >
                  取消
                </button>
                <button
                    type="button"
                    class="clay-btn flex-1 py-2 text-sm"
                    :disabled="saving"
                    @click="saveDraft"
                >
                  {{ saving ? '保存中...' : '保存' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 有「今日一言」的日期：淡紫色底 */
.day-has-saying {
  background-color: #efe6ff;
}

.month-nav-button {
  display: inline-flex;
  width: 2rem;
  height: 2.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-clay-md);
  color: var(--clay-text-secondary);
  transition: color var(--duration-fast),
  background-color var(--duration-fast);
}

.month-nav-button:hover {
  background: var(--clay-bg-base);
  color: var(--clay-text-primary);
}

/* PC：月份输入锁死在网格列内，避免原生控件撑破导致错位 */
@media (min-width: 640px) {
  .month-nav-button {
    width: 2.5rem;
  }

  .month-actions input[type='month'] {
    width: 12rem;
    max-width: 12rem;
    box-sizing: border-box;
  }
}
</style>

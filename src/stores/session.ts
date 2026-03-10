/**
 * 会话状态管理模块
 *
 * 功能说明：
 * - 管理 AI 对话会话状态（会话列表、当前会话、消息列表）
 * - 管理 SSE 流式对话状态（流式消息、发送状态）
 * - 管理模型和知识库选择状态
 * - 提供会话管理、消息管理、模型切换等方法
 * - 实现本地存储持久化（currentSessionId、currentModelId）
 */

import { defineStore } from 'pinia'
import type {
  ChatSession,
  ChatMessage,
  ChatModel,
  StreamingMessage,
  SessionLoadingState,
} from '@/types'

export const useSessionStore = defineStore('session', () => {
  // ==================== 状态 ====================

  /** 会话列表 */
  const sessions = ref<ChatSession[]>([])

  /** 当前会话 ID */
  const currentSessionId = ref<number | null>(null)

  /** 当前会话的消息列表 */
  const messages = ref<ChatMessage[]>([])

  /** 流式传输中的消息 */
  const streamingMessage = ref<StreamingMessage | null>(null)

  /** 当前选中的模型 ID */
  const currentModelId = ref<number | null>(null)

  /** 可用模型列表 */
  const models = ref<ChatModel[]>([])

  /** 当前关联的知识库 ID */
  const currentKnowledgeId = ref<string | null>(null)

  /** 当前关联的知识库名称（缓存） */
  const currentKnowledgeName = ref<string | null>(null)

  /** 是否启用联网搜索 */
  const enableWebSearch = ref(false)

  /** 加载状态 */
  const loading = ref<SessionLoadingState>({
    sessions: false,
    messages: false,
    sending: false,
  })

  /** SSE 连接控制器 */
  const sseController = ref<AbortController | null>(null)

  // ==================== 辅助函数 ====================

  /**
   * 统一错误处理（仅记录日志，错误提示由 Axios 拦截器处理）
   * @param context 错误上下文
   * @param error 错误对象
   */
  function handleError(context: string, error: any) {
    console.error(`${context}失败:`, error)
    // 错误提示已由 Axios 拦截器统一处理，这里只需要记录日志
  }

  // ==================== 计算属性 ====================

  /**
   * 当前会话信息
   */
  const currentSession = computed(() => sessions.value.find((s) => s.id === currentSessionId.value))

  /**
   * 当前模型信息
   */
  const currentModel = computed(() => models.value.find((m) => m.id === currentModelId.value))

  /**
   * 是否有流式消息正在传输
   */
  const isStreaming = computed(() => streamingMessage.value !== null)

  /**
   * 是否可以发送消息
   */
  const canSend = computed(() => !loading.value.sending && !isStreaming.value)

  // ==================== 会话管理 Actions ====================

  /**
   * 加载会话列表
   * @param pageQuery 分页参数（可选）
   */
  /**
   * 加载会话列表
   * @param pageQuery 分页参数（可选）
   */
  async function loadSessions(pageQuery?: { pageNum: number; pageSize: number }) {
    loading.value.sessions = true

    try {
      const { chatSessionApi } = await import('@/api/modules/chat-session')
      const response = await chatSessionApi.list(undefined, pageQuery)

      if (response.code === 200) {
        sessions.value = response.data.list
      } else {
        throw new Error(response.message || '加载会话列表失败')
      }
    } catch (error: any) {
      handleError('加载会话列表', error)
      throw error
    } finally {
      loading.value.sessions = false
    }
  }

  /**
   * 创建新会话
   * 注意: 不调用后端 API,后端会在第一次发送消息时自动创建会话
   * @param title 会话标题（可选）
   */
  async function createSession(title?: string) {
    try {
      // 清空当前会话 ID,表示进入新会话模式
      currentSessionId.value = null

      // 清空消息列表
      messages.value = []

      // 清空流式消息
      streamingMessage.value = null

      // 清除本地存储的会话 ID
      localStorage.removeItem('currentSessionId')

      console.log('已准备创建新会话,将在首次发送消息时由后端自动创建')
    } catch (error: any) {
      handleError('准备新会话', error)
      showError('创建新会话失败')
      throw error
    }
  }

  /**
   * 切换当前会话
   * @param sessionId 会话 ID
   */
  async function switchSession(sessionId: number) {
    if (currentSessionId.value === sessionId) {
      return
    }

    try {
      // 切换会话 ID
      currentSessionId.value = sessionId

      // 清空当前消息列表
      messages.value = []

      // 加载该会话的消息历史
      await loadMessages(sessionId)

      // 保存到本地存储
      saveToStorage()
    } catch (error: any) {
      handleError('切换会话', error)
      throw error
    }
  }

  /**
   * 删除会话
   * @param sessionId 会话 ID
   */
  async function deleteSession(sessionId: number) {
    try {
      const { chatSessionApi } = await import('@/api/modules/chat-session')
      const response = await chatSessionApi.remove([sessionId])

      if (response.code === 200) {
        // 从列表中移除
        sessions.value = sessions.value.filter((s) => s.id !== sessionId)

        // 如果删除的是当前会话，需要切换到其他会话
        if (currentSessionId.value === sessionId) {
          await createSession()
        }

        showSuccess('会话已删除')
      } else {
        throw new Error(response.message || '删除会话失败')
      }
    } catch (error: any) {
      handleError('删除会话', error)
      throw error
    }
  }

  /**
   * 重命名会话
   * @param sessionId 会话 ID
   * @param newTitle 新标题
   */
  async function renameSession(sessionId: number, newTitle: string) {
    try {
      const { chatSessionApi } = await import('@/api/modules/chat-session')
      const session = sessions.value.find((s) => s.id === sessionId)

      if (!session) {
        throw new Error('会话不存在')
      }

      const response = await chatSessionApi.edit({
        id: sessionId,
        sessionTitle: newTitle,
        userId: session.userId,
      })

      if (response.code === 200) {
        // 更新本地会话标题
        const targetSession = sessions.value.find((s) => s.id === sessionId)
        if (targetSession) {
          targetSession.sessionTitle = newTitle
        }

        showSuccess('会话已重命名')
      } else {
        throw new Error(response.message || '重命名会话失败')
      }
    } catch (error: any) {
      handleError('重命名会话', error)
      throw error
    }
  }

  /**
   * 获取会话详情
   * @param sessionId 会话 ID
   * @returns 会话信息
   */
  async function getSessionInfo(sessionId: number) {
    try {
      const { chatSessionApi } = await import('@/api/modules/chat-session')
      const response = await chatSessionApi.getInfo(sessionId)

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message || '获取会话详情失败')
      }
    } catch (error: any) {
      handleError('获取会话详情', error)
      throw error
    }
  }

  // ==================== 消息管理 Actions ====================

  /** 消息缓存（Map<sessionId, messages>）避免重复请求 */
  const messageCache = new Map<number, ChatMessage[]>()

  /** 消息分页状态（Map<sessionId, { pageNum, hasMore }>） */
  const messagePagination = new Map<number, { pageNum: number; hasMore: boolean }>()

  /**
   * 加载指定会话的消息列表（支持分页）
   * @param sessionId 会话 ID
   * @param pageQuery 分页参数（可选）
   */
  async function loadMessages(
    sessionId: number,
    pageQuery?: { pageNum: number; pageSize: number },
  ) {
    loading.value.messages = true

    try {
      // 如果没有提供分页参数，检查缓存
      if (!pageQuery && messageCache.has(sessionId)) {
        messages.value = messageCache.get(sessionId)!
        loading.value.messages = false
        return
      }

      const { chatMessageApi } = await import('@/api/modules/chat-message')

      // 默认分页参数：第一页，20 条
      const query = pageQuery || { pageNum: 1, pageSize: 20 }

      const response = await chatMessageApi.listBySession(sessionId, query)

      if (response.code === 200) {
        const { list, total } = response.data

        // 按时间正序排列（旧消息在上，新消息在下）
        const sortedMessages = list.sort((a, b) => {
          const timeA = new Date(a.createTime || 0).getTime()
          const timeB = new Date(b.createTime || 0).getTime()
          return timeA - timeB
        })

        if (query.pageNum === 1) {
          // 第一页：直接设置消息列表
          messages.value = sortedMessages
          // 更新缓存
          messageCache.set(sessionId, sortedMessages)
        } else {
          // 后续页：追加到消息列表前面（因为是加载更早的消息）
          messages.value = [...sortedMessages, ...messages.value]
          // 更新缓存
          messageCache.set(sessionId, messages.value)
        }

        // 更新分页状态
        const hasMore = list.length >= query.pageSize && messages.value.length < total
        messagePagination.set(sessionId, {
          pageNum: query.pageNum,
          hasMore,
        })
      } else {
        throw new Error(response.message || '加载消息列表失败')
      }
    } catch (error: any) {
      handleError('加载消息列表', error)
      throw error
    } finally {
      loading.value.messages = false
    }
  }

  /**
   * 向上滚动时加载更早的消息（分页加载）
   */
  async function loadMoreMessages() {
    if (!currentSessionId.value) {
      console.warn('没有选中的会话')
      return
    }

    const sessionId = currentSessionId.value
    const pagination = messagePagination.get(sessionId)

    // 检查是否还有更多消息
    if (pagination && !pagination.hasMore) {
      console.log('没有更多消息了')
      return
    }

    // 检查是否正在加载
    if (loading.value.messages) {
      console.log('正在加载中...')
      return
    }

    try {
      const nextPage = pagination ? pagination.pageNum + 1 : 2
      await loadMessages(sessionId, { pageNum: nextPage, pageSize: 20 })
    } catch (error: any) {
      handleError('加载更多消息', error)
      throw error
    }
  }

  /**
   * 删除消息
   * @param messageId 消息 ID
   */
  async function deleteMessage(messageId: number) {
    try {
      const { chatMessageApi } = await import('@/api/modules/chat-message')
      const response = await chatMessageApi.remove([messageId])

      if (response.code === 200) {
        // 从消息列表中移除
        messages.value = messages.value.filter((m) => m.id !== messageId)

        // 更新缓存
        if (currentSessionId.value) {
          messageCache.set(currentSessionId.value, messages.value)
        }

        showSuccess('消息已删除')
      } else {
        throw new Error(response.message || '删除消息失败')
      }
    } catch (error: any) {
      handleError('删除消息', error)
      throw error
    }
  }

  /**
   * 获取消息详情
   * @param messageId 消息 ID
   * @returns 消息信息
   */
  async function getMessageInfo(messageId: number) {
    try {
      const { chatMessageApi } = await import('@/api/modules/chat-message')
      const response = await chatMessageApi.getInfo(messageId)

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message || '获取消息详情失败')
      }
    } catch (error: any) {
      handleError('获取消息详情', error)
      throw error
    }
  }

  /**
   * 清除指定会话的消息缓存
   * @param sessionId 会话 ID（可选，不传则清除所有缓存）
   */
  function clearMessageCache(sessionId?: number) {
    if (sessionId !== undefined) {
      messageCache.delete(sessionId)
      messagePagination.delete(sessionId)
    } else {
      messageCache.clear()
      messagePagination.clear()
    }
  }

  // ==================== SSE 流式对话 Actions ====================

  /**
   * 发送消息并建立 SSE 连接
   * 注意: 后端会自动保存消息,无需前端调用保存接口
   * @param content 消息内容
   */
  async function sendMessage(content: string) {
    // 保存用户输入,以便发送失败时恢复
    const userInput = content

    // 检查是否可以发送
    if (!canSend.value) {
      console.warn('当前无法发送消息：正在发送中或流式传输中')
      showWarning('请等待当前消息发送完成')
      return
    }

    // 检查是否有选中的模型或启用自动选择
    // 自动选择模式下 currentModelId 为 null 是正常的
    if (currentModelId.value === null && models.value.length === 0) {
      console.warn('没有可用的模型')
      showWarning('没有可用的模型')
      return
    }

    // 获取用户信息
    const userStore = useUserStore()

    if (!userStore.userInfo?.userId) {
      console.warn('用户未登录')
      showWarning('请先登录')
      return
    }

    // 生成临时消息 ID（使用时间戳）
    const tempUserMessageId = Date.now()

    // 添加用户消息到本地消息列表（临时 ID）
    const userMessage: ChatMessage = {
      id: tempUserMessageId,
      userId: userStore.userInfo.userId,
      content: userInput,
      sessionId: currentSessionId.value || 0, // 新会话时为 0
      role: 'user',
      deductCost: 0,
      totalTokens: 0,
      modelName: currentModel.value?.modelName || '',
      remark: '',
      createTime: new Date().toISOString(),
    }

    messages.value.push(userMessage)

    // 初始化流式消息
    streamingMessage.value = {
      role: 'assistant',
      content: '',
      toolCalls: [],
    }

    // 设置发送状态
    loading.value.sending = true

    // 创建 AbortController
    sseController.value = new AbortController()

    // 重试配置
    const maxRetries = 3
    let retryCount = 0

    // 重试函数
    const attemptSend = async (): Promise<void> => {
      try {
        // 导入 SSE 工具
        const { createSSEConnection } = await import('@/utils/sse')

        // 构建完整的会话历史记录(不包含刚添加的用户消息,因为它还是临时ID)
        const historyMessages = messages.value
          .filter((msg) => msg.id !== tempUserMessageId) // 排除刚添加的临时消息
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          }))

        // 添加当前用户输入作为最后一条消息
        historyMessages.push({
          role: 'user',
          content: userInput,
        })

        // 构建请求参数(携带完整会话历史)
        const requestParams: any = {
          messages: historyMessages,
          sessionId: currentSessionId.value || undefined, // 新会话时不传 sessionId
          kid: currentKnowledgeId.value || undefined,
          enableSearch: enableWebSearch.value, // 是否启用联网搜索
        }

        // 如果是自动选择模式，传递 autoSelectModel 参数
        if (currentModelId.value === null) {
          requestParams.autoSelectModel = true
        } else {
          requestParams.model = currentModel.value?.modelName
        }

        // 构建完整的 URL
        const baseURL = '/api'
        const url = `${baseURL}/chat/send`

        // 建立 SSE 连接
        await createSSEConnection(url, requestParams, {
          signal: sseController.value!.signal,
          onMessage: (data: string) => {
            // 实时更新流式消息内容
            if (streamingMessage.value) {
              // 尝试解析 JSON 格式（工具调用状态）
              if (data.startsWith('{') && data.endsWith('}')) {
                try {
                  const parsed = JSON.parse(data)

                  // 检查是否是工具调用状态
                  if (
                    parsed.type &&
                    ['tool_call_start', 'tool_executing', 'tool_completed', 'ai_thinking'].includes(
                      parsed.type,
                    )
                  ) {
                    console.log('接收到工具调用状态:', parsed)

                    // 初始化 toolCalls 数组
                    if (!streamingMessage.value.toolCalls) {
                      streamingMessage.value.toolCalls = []
                    }

                    // 添加工具调用状态
                    streamingMessage.value.toolCalls.push({
                      type: parsed.type,
                      toolName: parsed.toolName,
                      message: parsed.message,
                      current: parsed.current,
                      total: parsed.total,
                      executionTime: parsed.executionTime,
                      timestamp: parsed.timestamp || Date.now(),
                    })

                    return // 不累加到 content 中
                  }
                } catch (error) {
                  console.warn('解析 JSON 失败，作为普通文本处理:', error)
                  // 解析失败，继续作为普通文本处理
                }
              }

              // 处理普通文本内容
              // 如果接收到空字符串，将其转换为换行符
              const content = data === '' ? '\n' : data
              streamingMessage.value.content += content
            }
          },
          onError: async (error) => {
            console.error('SSE 连接错误:', error)

            // 如果是用户主动中断，不进行重试
            if (error.message.includes('已中断')) {
              return
            }

            // 如果还有重试次数，进行重试
            if (retryCount < maxRetries) {
              retryCount++
              console.log(`正在重试... (${retryCount}/${maxRetries})`)
              setTimeout(() => {
                attemptSend()
              }, 1000 * retryCount) // 递增延迟
            } else {
              // 重试次数用尽，清理状态并显示错误
              console.error('重试次数已用尽')

              if (error.message?.includes('Network Error') || error.message?.includes('timeout')) {
                showError('网络连接失败,请检查网络设置')
              } else if (error.message?.includes('401')) {
                showError('登录已过期,请重新登录')
              } else if (error.message?.includes('500')) {
                showError('服务器错误,请稍后重试')
              } else {
                showError(error.message || 'SSE 连接失败')
              }

              cleanupAfterError()
            }
          },
          onComplete: async () => {
            // 流式传输完成
            console.log('SSE 流式传输完成')

            try {
              // 后端已自动保存消息,无需前端调用保存接口
              // 只需要将流式消息添加到本地消息列表

              // 生成 AI 消息的临时 ID
              const tempAssistantMessageId = Date.now()

              // 添加 AI 消息到消息列表
              const assistantMessage: ChatMessage = {
                id: tempAssistantMessageId,
                userId: userStore.userInfo!.userId,
                content: streamingMessage.value?.content || '',
                sessionId: currentSessionId.value || 0,
                role: 'assistant',
                deductCost: 0,
                totalTokens: 0,
                modelName: currentModel.value?.modelName || '',
                remark: '',
                createTime: new Date().toISOString(),
              }

              messages.value.push(assistantMessage)

              // 清空流式消息状态
              streamingMessage.value = null

              // 清空 SSE 控制器
              sseController.value = null

              // 如果是新会话,重新加载会话列表以获取新创建的会话
              if (!currentSessionId.value) {
                await loadSessions()
                // 选择最新的会话(第一个)
                if (sessions.value.length > 0) {
                  const latestSession = sessions.value[sessions.value.length - 1]
                  if (latestSession) {
                    currentSessionId.value = latestSession.id
                    saveToStorage()

                    // 重新加载消息列表，替换临时消息
                    await loadMessages(latestSession.id)
                  }
                }
              } else {
                // 清除消息缓存（强制下次重新加载）
                clearMessageCache(currentSessionId.value)
              }
            } catch (error: any) {
              handleError('处理完成回调', error)
              // 即使出错,也要保留流式消息
              if (streamingMessage.value) {
                const tempAssistantMessageId = Date.now()
                const assistantMessage: ChatMessage = {
                  id: tempAssistantMessageId,
                  userId: userStore.userInfo!.userId,
                  content: streamingMessage.value.content,
                  sessionId: currentSessionId.value || 0,
                  role: 'assistant',
                  deductCost: 0,
                  totalTokens: 0,
                  modelName: currentModel.value?.modelName || '',
                  remark: '',
                  createTime: new Date().toISOString(),
                }

                messages.value.push(assistantMessage)
                streamingMessage.value = null
              }
            } finally {
              // 重置发送状态
              loading.value.sending = false
            }
          },
        })
      } catch (error: any) {
        handleError('发送消息', error)

        // 如果是用户主动中断，不进行重试
        if (error.message?.includes('已中断')) {
          cleanupAfterError()
          return
        }

        // 如果还有重试次数，进行重试
        if (retryCount < maxRetries) {
          retryCount++
          console.log(`正在重试... (${retryCount}/${maxRetries})`)
          setTimeout(() => {
            attemptSend()
          }, 1000 * retryCount) // 递增延迟
        } else {
          // 重试次数用尽，清理状态并显示错误
          console.error('重试次数已用尽')

          if (error.message?.includes('Network Error') || error.message?.includes('timeout')) {
            showError('网络连接失败,请检查网络设置')
          } else if (error.response?.status === 401) {
            showError('登录已过期,请重新登录')
          } else if (error.response?.status >= 500) {
            showError('服务器错误,请稍后重试')
          } else {
            showError(error.message || '发送消息失败')
          }

          cleanupAfterError()
        }
      }
    }

    // 清理错误状态的辅助函数
    const cleanupAfterError = () => {
      // 移除临时用户消息
      messages.value = messages.value.filter((m) => m.id !== tempUserMessageId)

      // 清空流式消息
      streamingMessage.value = null

      // 清空 SSE 控制器
      sseController.value = null

      // 重置发送状态
      loading.value.sending = false

      // 注意: 用户输入已保存在 userInput 变量中,组件可以选择恢复它
    }

    // 开始发送
    await attemptSend()
  }

  /**
   * 中断 SSE 连接
   */
  async function stopGeneration() {
    if (sseController.value) {
      // 中断连接
      sseController.value.abort()

      // 清空 SSE 控制器
      sseController.value = null

      // 如果有流式消息，保留当前内容并添加到消息列表
      if (streamingMessage.value && currentSessionId.value) {
        const userStore = useUserStore()

        const assistantMessage: ChatMessage = {
          id: Date.now(),
          userId: userStore.userInfo?.userId || 0,
          content: streamingMessage.value.content + '\n\n[已中断]',
          sessionId: currentSessionId.value,
          role: 'assistant',
          deductCost: 0,
          totalTokens: 0,
          modelName: currentModel.value?.modelName || '',
          remark: '',
          createTime: new Date().toISOString(),
        }

        messages.value.push(assistantMessage)
      }

      // 清空流式消息状态
      streamingMessage.value = null

      // 重置发送状态
      loading.value.sending = false

      console.log('SSE 连接已中断')
    }
  }

  // ==================== 模型和知识库管理 Actions ====================

  /**
   * 加载用户可见的模型列表（不分页）
   * 模型列表在初始化时加载一次并缓存
   */
  async function loadModels() {
    try {
      const { chatModelApi } = await import('@/api/modules/chat-model')
      const response = await chatModelApi.modelList({
        category: 'chat',
      })

      if (response.code === 200) {
        models.value = response.data
      } else {
        throw new Error(response.message || '加载模型列表失败')
      }
    } catch (error: any) {
      handleError('加载模型列表', error)
      throw error
    }
  }

  /**
   * 切换当前选中的模型
   * @param modelId 模型 ID（null 表示自动选择）
   */
  function selectModel(modelId: number | null) {
    // 如果是自动选择（modelId 为 null）
    if (modelId === null) {
      currentModelId.value = null
      saveToStorage()
      console.log('已设置为自动选择模型')
      return
    }

    // 检查模型是否存在
    const model = models.value.find((m) => m.id === modelId)

    if (!model) {
      console.warn(`模型 ID ${modelId} 不存在`)
      return
    }

    // 更新当前模型 ID
    currentModelId.value = modelId

    // 如果模型不支持联网搜索，自动关闭联网搜索开关
    if (model.enableSearch !== 1) {
      enableWebSearch.value = false
    }

    // 保存到本地存储
    saveToStorage()

    console.log(`已切换到模型: ${model.modelName}`)
  }

  /**
   * 切换联网搜索状态
   */
  function toggleWebSearch() {
    // 检查当前模型是否支持联网搜索
    if (currentModel.value?.enableSearch === 1) {
      enableWebSearch.value = !enableWebSearch.value
      console.log(`联网搜索已${enableWebSearch.value ? '启用' : '关闭'}`)
    } else {
      console.warn('当前模型不支持联网搜索')
    }
  }

  /**
   * 关联/取消关联知识库
   * @param knowledgeId 知识库 ID（传入 null 表示取消关联）
   * @param knowledgeName 知识库名称（可选）
   */
  function selectKnowledge(knowledgeId: string | null, knowledgeName?: string) {
    // 更新当前知识库 ID
    currentKnowledgeId.value = knowledgeId
    currentKnowledgeName.value = knowledgeName || null

    // 保存到本地存储（null 时移除）
    if (knowledgeId === null) {
      localStorage.removeItem('currentKnowledgeId')
      localStorage.removeItem('currentKnowledgeName')
      console.log('已取消关联知识库')
    } else {
      localStorage.setItem('currentKnowledgeId', knowledgeId)
      if (knowledgeName) {
        localStorage.setItem('currentKnowledgeName', knowledgeName)
      }
      console.log(`已关联知识库: ${knowledgeName || knowledgeId}`)
    }
  }

  /**
   * 加载知识库列表（支持分页）
   * 知识库列表按需加载（打开选择器时加载）
   * @param pageQuery 分页参数（可选）
   * @returns 知识库列表和分页信息
   */
  async function loadKnowledgeList(pageQuery?: { pageNum: number; pageSize: number }) {
    try {
      const { knowledgeApi } = await import('@/api/modules/knowledge')

      // 默认分页参数：第一页，20 条
      const query = pageQuery || { pageNum: 1, pageSize: 20 }

      const response = await knowledgeApi.list(undefined, query)

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message || '加载知识库列表失败')
      }
    } catch (error: any) {
      handleError('加载知识库列表', error)
      throw error
    }
  }

  /**
   * 搜索知识库
   * @param keyword 搜索关键词
   * @param pageQuery 分页参数（可选）
   * @returns 知识库列表和分页信息
   */
  async function searchKnowledge(
    keyword: string,
    pageQuery?: { pageNum: number; pageSize: number },
  ) {
    try {
      const { knowledgeApi } = await import('@/api/modules/knowledge')

      // 默认分页参数：第一页，20 条
      const query = pageQuery || { pageNum: 1, pageSize: 20 }

      // 将 keyword 作为查询参数传递
      const response = await knowledgeApi.list({ kname: keyword } as any, query)

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message || '搜索知识库失败')
      }
    } catch (error: any) {
      handleError('搜索知识库', error)
      throw error
    }
  }

  // ==================== 本地存储持久化 ====================

  /**
   * 保存状态到本地存储
   */
  function saveToStorage() {
    try {
      // 保存当前会话 ID
      if (currentSessionId.value !== null) {
        localStorage.setItem('currentSessionId', String(currentSessionId.value))
      } else {
        localStorage.removeItem('currentSessionId')
      }

      // 保存当前模型 ID
      if (currentModelId.value !== null) {
        localStorage.setItem('currentModelId', String(currentModelId.value))
      } else {
        localStorage.removeItem('currentModelId')
      }
    } catch (error) {
      console.error('保存到本地存储失败:', error)
    }
  }

  /**
   * 初始化 Store（从本地存储恢复状态）
   */
  async function init() {
    try {
      // 1. 恢复 currentModelId（如果存在且有效）
      const savedModelId = localStorage.getItem('currentModelId')
      if (savedModelId) {
        const modelId = Number(savedModelId)
        if (!isNaN(modelId)) {
          currentModelId.value = modelId
        }
      }

      // 2. 加载模型列表
      await loadModels()

      // 3. 验证恢复的模型 ID 是否有效
      if (currentModelId.value !== null) {
        const modelExists = models.value.some((m) => m.id === currentModelId.value)
        if (!modelExists) {
          // 模型不存在，清除无效的 ID
          currentModelId.value = null
          localStorage.removeItem('currentModelId')
        }
      }

      // 4. 如果没有选中模型，选择第一个可用模型（或保持自动选择）
      // 注意：如果用户之前选择了"自动选择"，currentModelId 会是 null，这是正常的
      if (currentModelId.value === null && models.value.length > 0) {
        // 可以选择保持自动选择模式，或者选择第一个模型
        // 这里保持自动选择模式，不做任何操作
        console.log('当前为自动选择模式')
      }

      // 5. 加载会话列表
      await loadSessions()

      // 6. 恢复 currentSessionId（如果存在且有效）
      const savedSessionId = localStorage.getItem('currentSessionId')
      if (savedSessionId) {
        const sessionId = Number(savedSessionId)
        if (!isNaN(sessionId)) {
          // 验证会话是否存在
          const sessionExists = sessions.value.some((s) => s.id === sessionId)
          if (sessionExists) {
            currentSessionId.value = sessionId
            // 加载该会话的消息
            await loadMessages(sessionId)
          } else {
            // 会话不存在，清除无效的 ID
            localStorage.removeItem('currentSessionId')
          }
        }
      }

      // 7. 恢复知识库信息（如果存在）
      const savedKnowledgeId = localStorage.getItem('currentKnowledgeId')
      const savedKnowledgeName = localStorage.getItem('currentKnowledgeName')
      if (savedKnowledgeId) {
        currentKnowledgeId.value = savedKnowledgeId
        currentKnowledgeName.value = savedKnowledgeName
      }

      // 8. 如果没有会话，准备创建新会话（不调用后端 API）
      if (sessions.value.length === 0) {
        await createSession('新对话')
      } else if (currentSessionId.value === null) {
        console.log(sessions.value)
        // 有会话但没有选中，选择第一个会话
        const firstSession = sessions.value[sessions.value.length - 1]
        if (firstSession) {
          await switchSession(firstSession.id)
        }
      }
    } catch (error: any) {
      handleError('初始化 Session Store', error)

      // 初始化失败时，准备创建新会话
      try {
        if (sessions.value.length === 0) {
          await createSession('新对话')
        }
      } catch (createError) {
        handleError('准备新会话', createError)
      }
    }
  }

  return {
    // 状态
    sessions,
    currentSessionId,
    messages,
    streamingMessage,
    currentModelId,
    models,
    currentKnowledgeId,
    currentKnowledgeName,
    enableWebSearch,
    loading,
    sseController,
    // 计算属性
    currentSession,
    currentModel,
    isStreaming,
    canSend,
    // 会话管理方法
    loadSessions,
    createSession,
    switchSession,
    deleteSession,
    renameSession,
    getSessionInfo,
    // 消息管理方法
    loadMessages,
    loadMoreMessages,
    deleteMessage,
    getMessageInfo,
    clearMessageCache,
    // SSE 流式对话方法
    sendMessage,
    stopGeneration,
    // 模型和知识库管理方法
    loadModels,
    selectModel,
    toggleWebSearch,
    selectKnowledge,
    loadKnowledgeList,
    searchKnowledge,
    // 本地存储持久化方法
    init,
    saveToStorage,
  }
})

/**
 * OS 配置管理状态管理
 *
 * 功能说明：
 * - 管理当前激活的模块
 * - 管理各模块的数据列表、分页、搜索状态
 * - 管理加载状态和错误状态
 */
import { chatModelApi } from '@/api/modules/chat-model'
import { knowledgeApi } from '@/api/modules/knowledge'
import { promptTemplateApi } from '@/api/modules/prompt-template'
import type { ChatModel, KnowledgeInfo, PromptTemplate } from '@/types'

export const useOsConfigStore = defineStore('osConfig', () => {
  // ==================== 状态 ====================
  const activeModule = ref<'chat-model' | 'knowledge' | 'prompt-template'>('chat-model')

  // 聊天模型状态
  const chatModels = ref<ChatModel[]>([])
  const chatModelPage = ref(1)
  const chatModelPageSize = ref(10)
  const chatModelTotal = ref(0)
  const chatModelSearchKeyword = ref('')
  const chatModelLoading = ref(false)

  // 知识库状态
  const knowledgeList = ref<KnowledgeInfo[]>([])
  const knowledgePage = ref(1)
  const knowledgePageSize = ref(10)
  const knowledgeTotal = ref(0)
  const knowledgeSearchKeyword = ref('')
  const knowledgeLoading = ref(false)

  // 提示词模板状态
  const promptTemplates = ref<PromptTemplate[]>([])
  const promptTemplatePage = ref(1)
  const promptTemplatePageSize = ref(10)
  const promptTemplateTotal = ref(0)
  const promptTemplateSearchKeyword = ref('')
  const promptTemplateLoading = ref(false)

  // ==================== 聊天模型方法 ====================
  async function fetchChatModels() {
    try {
      chatModelLoading.value = true
      const response = await chatModelApi.list(
        chatModelSearchKeyword.value ? { modelName: chatModelSearchKeyword.value } : {},
        { pageNum: chatModelPage.value, pageSize: chatModelPageSize.value },
      )

      if (response.code === 200 && response.data) {
        chatModels.value = response.data.list || []
        chatModelTotal.value = response.data.total || 0
      }
    } catch (error) {
      console.error('加载聊天模型失败:', error)
    } finally {
      chatModelLoading.value = false
    }
  }

  function setChatModelSearch(keyword: string) {
    chatModelSearchKeyword.value = keyword
    chatModelPage.value = 1
  }

  function setChatModelPage(page: number) {
    chatModelPage.value = page
  }

  function setChatModelPageSize(pageSize: number) {
    chatModelPageSize.value = pageSize
    chatModelPage.value = 1
  }

  // ==================== 知识库方法 ====================
  async function fetchKnowledge() {
    try {
      knowledgeLoading.value = true
      const response = await knowledgeApi.list(
        knowledgeSearchKeyword.value ? { kname: knowledgeSearchKeyword.value } : {},
        { pageNum: knowledgePage.value, pageSize: knowledgePageSize.value },
      )

      if (response.code === 200 && response.data) {
        knowledgeList.value = response.data.list || []
        knowledgeTotal.value = response.data.total || 0
      }
    } catch (error) {
      console.error('加载知识库失败:', error)
    } finally {
      knowledgeLoading.value = false
    }
  }

  function setKnowledgeSearch(keyword: string) {
    knowledgeSearchKeyword.value = keyword
    knowledgePage.value = 1
  }

  function setKnowledgePage(page: number) {
    knowledgePage.value = page
  }

  function setKnowledgePageSize(pageSize: number) {
    knowledgePageSize.value = pageSize
    knowledgePage.value = 1
  }

  // ==================== 提示词模板方法 ====================
  async function fetchPromptTemplates() {
    try {
      promptTemplateLoading.value = true
      const response = await promptTemplateApi.list(
        promptTemplateSearchKeyword.value
          ? { templateName: promptTemplateSearchKeyword.value }
          : {},
        { pageNum: promptTemplatePage.value, pageSize: promptTemplatePageSize.value },
      )

      if (response.code === 200 && response.data) {
        promptTemplates.value = response.data.list || []
        promptTemplateTotal.value = response.data.total || 0
      }
    } catch (error) {
      console.error('加载提示词模板失败:', error)
    } finally {
      promptTemplateLoading.value = false
    }
  }

  function setPromptTemplateSearch(keyword: string) {
    promptTemplateSearchKeyword.value = keyword
    promptTemplatePage.value = 1
  }

  function setPromptTemplatePage(page: number) {
    promptTemplatePage.value = page
  }

  function setPromptTemplatePageSize(pageSize: number) {
    promptTemplatePageSize.value = pageSize
    promptTemplatePage.value = 1
  }

  // ==================== 通用方法 ====================
  function setActiveModule(module: 'chat-model' | 'knowledge' | 'prompt-template') {
    activeModule.value = module
  }

  function resetState() {
    // 重置聊天模型状态
    chatModels.value = []
    chatModelPage.value = 1
    chatModelPageSize.value = 10
    chatModelTotal.value = 0
    chatModelSearchKeyword.value = ''
    chatModelLoading.value = false

    // 重置知识库状态
    knowledgeList.value = []
    knowledgePage.value = 1
    knowledgePageSize.value = 10
    knowledgeTotal.value = 0
    knowledgeSearchKeyword.value = ''
    knowledgeLoading.value = false

    // 重置提示词模板状态
    promptTemplates.value = []
    promptTemplatePage.value = 1
    promptTemplatePageSize.value = 10
    promptTemplateTotal.value = 0
    promptTemplateSearchKeyword.value = ''
    promptTemplateLoading.value = false
  }

  return {
    // 状态
    activeModule,
    chatModels,
    chatModelPage,
    chatModelPageSize,
    chatModelTotal,
    chatModelSearchKeyword,
    chatModelLoading,
    knowledgeList,
    knowledgePage,
    knowledgePageSize,
    knowledgeTotal,
    knowledgeSearchKeyword,
    knowledgeLoading,
    promptTemplates,
    promptTemplatePage,
    promptTemplatePageSize,
    promptTemplateTotal,
    promptTemplateSearchKeyword,
    promptTemplateLoading,

    // 方法
    setActiveModule,
    fetchChatModels,
    setChatModelSearch,
    setChatModelPage,
    setChatModelPageSize,
    fetchKnowledge,
    setKnowledgeSearch,
    setKnowledgePage,
    setKnowledgePageSize,
    fetchPromptTemplates,
    setPromptTemplateSearch,
    setPromptTemplatePage,
    setPromptTemplatePageSize,
    resetState,
  }
})

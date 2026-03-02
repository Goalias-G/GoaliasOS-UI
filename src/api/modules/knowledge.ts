/**
 * 知识库管理 API
 *
 * 功能说明：
 * - 查询知识库列表
 * - 新增/修改/删除知识库
 * - 知识库附件管理
 * - 知识片段查询
 * - 文件上传与翻译
 */

import { get, post, del } from '@/api'
import type {
  ApiResponse,
  KnowledgeInfo,
  KnowledgeInfoParams,
  KnowledgeAttach,
  KnowledgeAttachParams,
  KnowledgeFragment,
  KnowledgeFragmentParams,
  SysOss,
  PageQuery,
  PageResult,
} from '@/types'

export const knowledgeApi = {
  /**
   * 查询知识库列表（分页）
   * @param params 查询参数
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<KnowledgeInfoParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<KnowledgeInfo>>>('/knowledge/list', { ...params, ...pageQuery }),

  /**
   * 新增知识库
   * @param data 知识库数据
   */
  save: (data: KnowledgeInfoParams) => post<ApiResponse<void>>('/knowledge/save', data),

  /**
   * 删除知识库
   * @param kid 知识库 ID
   */
  remove: (kid: string) => post<ApiResponse<string>>(`/knowledge/remove/${kid}`),

  /**
   * 修改知识库
   * @param data 知识库数据
   */
  edit: (data: KnowledgeInfoParams) => post<ApiResponse<void>>('/knowledge/edit', data),

  /**
   * 查询知识附件列表（分页）
   * @param kid 知识库 ID
   * @param params 查询参数
   * @param pageQuery 分页参数
   */
  attachList: (kid: string, params?: Partial<KnowledgeAttachParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<KnowledgeAttach>>>(`/knowledge/detail/${kid}`, {
      ...params,
      ...pageQuery,
    }),

  /**
   * 上传知识库附件
   * @param data 上传数据
   */
  uploadAttach: (data: { file: File; kid?: string }) =>
    post<ApiResponse<SysOss>>('/knowledge/attach/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * 获取附件详情
   * @param id 附件 ID
   */
  getAttachInfo: (id: number) => get<ApiResponse<KnowledgeAttach>>(`/knowledge/attach/info/${id}`),

  /**
   * 删除知识库附件
   * @param docId 文档 ID
   */
  removeAttach: (docId: string) => post<ApiResponse<void>>(`/knowledge/attach/remove/${docId}`),

  /**
   * 查询知识片段列表（分页）
   * @param docId 文档 ID
   * @param params 查询参数
   * @param pageQuery 分页参数
   */
  fragmentList: (docId: string, params?: Partial<KnowledgeFragmentParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<KnowledgeFragment>>>(`/knowledge/fragment/list/${docId}`, {
      ...params,
      ...pageQuery,
    }),

  /**
   * 文件翻译
   * @param file 文件对象
   * @param targetLanguage 目标语言
   */
  // translationByFile: (file: File, targetLanguage: string) =>
  //   post<ApiResponse<string>>(
  //     '/knowledge/translationByFile',
  //     { file, targetLanguage },
  //     {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     },
  //   ),
}

/**
 * OSS对象存储 API
 *
 * 功能说明：
 * - 查询OSS对象存储列表
 * - 根据ID串查询OSS对象
 * - 上传/删除OSS对象
 * - 分片上传（初始化、上传分片、合并分片、取消上传、查询已上传分片）
 */

import { get, post, del, put } from '@/api'
import type {
  ApiResponse,
  PageQuery,
  PageResult,
  SysOss,
  SysOssUploadVo,
  UploadInitVO,
  ChunkUploadVO,
  UploadResultVO,
  MultipartUploadInitDTO,
  MultipartUploadMergeDTO,
} from '@/types'

export const ossApi = {
  /**
   * 查询OSS对象存储列表（分页）
   * @param params 查询参数
   * @param pageQuery 分页参数
   */
  list: (params?: Partial<SysOss>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<SysOss>>>('/system/oss/list', { ...params, ...pageQuery }),

  /**
   * 根据ID串查询OSS对象
   * @param ossIds OSS对象ID数组
   */
  listByIds: (ossIds: number[]) =>
    get<ApiResponse<SysOss[]>>(`/system/oss/listByIds/${ossIds.join(',')}`),

  /**
   * 上传OSS对象存储
   * @param file 文件
   */
  upload: (file: File | Blob) => {
    const formData = new FormData()
    formData.append('file', file)
    return post<ApiResponse<SysOssUploadVo>>('/system/oss/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /**
   * 获取OSS对象详细信息
   * @param ossIds OSS对象ID数组
   */
  getInfo: (ossIds: number[]) =>
    get<ApiResponse<SysOssUploadVo[]>>(`/system/oss/info/${ossIds.join(',')}`),

  /**
   * 删除OSS对象存储
   * @param ossIds OSS对象ID数组
   */
  remove: (ossIds: number[]) => del<ApiResponse<void>>(`/system/oss/${ossIds.join(',')}`),

  // ==================== 分片上传接口 ====================

  /**
   * 初始化分片上传
   * 前端在开始分片上传前调用此接口，获取 uploadId 和预签名 URL 列表
   * @param dto 初始化请求参数
   */
  initMultipartUpload: (dto: MultipartUploadInitDTO) =>
    post<ApiResponse<UploadInitVO>>('/system/oss/chunks/init', dto),

  /**
   * 上传单个分片
   * @param objectName 文件对象名
   * @param uploadId 分片上传 ID
   * @param chunkNumber 分片编号（从 1 开始）
   * @param file 分片文件数据
   */
  uploadChunk: (objectName: string, uploadId: string, chunkNumber: number, file: File | Blob) => {
    const formData = new FormData()
    formData.append('objectName', objectName)
    formData.append('uploadId', uploadId)
    formData.append('chunkNumber', String(chunkNumber))
    formData.append('file', file)
    return post<ApiResponse<ChunkUploadVO>>('/system/oss/chunks/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /**
   * 合并分片完成上传
   * 所有分片上传完成后调用此接口，合并成完整文件
   * @param dto 合并请求参数
   */
  completeMultipartUpload: (dto: MultipartUploadMergeDTO) =>
    post<ApiResponse<UploadResultVO>>('/system/oss/chunks/complete', dto),

  /**
   * 取消分片上传
   * 用于取消未完成的分片上传任务，释放服务器资源
   * @param objectName 文件对象名
   * @param uploadId 分片上传 ID
   */
  abortMultipartUpload: (objectName: string, uploadId: string) =>
    del<ApiResponse<void>>('/system/oss/chunks/abort', { params: { objectName, uploadId } }),

  /**
   * 获取已上传的分片列表（用于断点续传）
   * @param uploadId 分片上传 ID
   */
  getUploadedChunks: (uploadId: string) =>
    get<ApiResponse<number[]>>('/system/oss/chunks/uploaded', { uploadId }),
}

/**
 * OSS对象存储相关类型定义
 */

/**
 * OSS对象存储实体
 */
export interface SysOss {
  ossId: number
  fileName: string
  originalName: string
  fileSuffix: string
  url: string
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
  delFlag?: string
  remark?: string
}

/**
 * OSS上传结果
 */
export interface SysOssUploadVo {
  url: string
  fileName: string
  ossId: number
}

/**
 * 分片上传初始化请求参数
 */
export interface MultipartUploadInitDTO {
  bucketName: string
  objectName: string
  fileSize: number
  fileMd5?: string
  contentType?: string
  chunkSize?: number
}

/**
 * 分片上传合并请求参数
 */
export interface MultipartUploadMergeDTO {
  bucketName: string
  objectName: string
  uploadId: string
}

/**
 * 分片上传初始化响应
 */
export interface UploadInitVO {
  uploadId: string
  bucketName: string
  objectName: string
  totalChunks: number
  chunkSize: number
  instantUpload: boolean
  fileUrl?: string
  uploadedChunks?: number[]
  uploadUrls?: string[]
}

/**
 * 分片上传响应
 */
export interface ChunkUploadVO {
  chunkNumber: number
  etag: string
  success: boolean
  errorMsg?: string
}

/**
 * 分片上传结果响应
 */
export interface UploadResultVO {
  objectName: string
  fileUrl: string
  fileSize: number
  etag: string
  ossId: number
}

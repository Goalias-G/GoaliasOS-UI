/**
 * 知识库信息
 */
export interface KnowledgeInfo {
  id: number
  kid: string
  uid: number
  kname: string
  description?: string
  knowledgeSeparator?: string
  questionSeparator?: string
  overlapChar?: number
  retrieveLimit: number
  textBlockSize?: number
  embeddingModelId?: number
  embeddingModelName?: string
  remark?: string
  createTime?: string
  updateTime?: string
}

/**
 * 知识库请求体
 */
export interface KnowledgeInfoParams {
  id?: number
  kid?: string
  uid?: number
  kname: string
  description?: string
  knowledgeSeparator?: string
  questionSeparator?: string
  overlapChar?: number
  retrieveLimit: number
  textBlockSize?: number
  embeddingModelId?: number
  embeddingModelName?: string
  remark?: string
}

/**
 * 知识库附件
 */
export interface KnowledgeAttach {
  id: number
  kid: string
  docId: string
  docName: string
  docType: string
  content: string
  remark: string
  ossId: number
  picStatus: number
  picAnysStatus: number
  vectorStatus: number
  createTime?: string
  updateTime?: string
}

/**
 * 知识库附件请求体
 */
export interface KnowledgeAttachParams {
  id?: number
  kid: string
  docId: string
  docName: string
  docType: string
  content: string
  remark: string
  ossId: number
  picStatus: number
  picAnysStatus: number
  vectorStatus: number
}

/**
 * 知识片段
 */
export interface KnowledgeFragment {
  id: number
  kid: string
  docId: string
  fid: string
  idx: number
  content: string
  remark: string
  createTime?: string
  updateTime?: string
}

/**
 * 知识片段请求体
 */
export interface KnowledgeFragmentParams {
  id?: number
  kid: string
  docId: string
  fid: string
  idx: number
  content: string
  remark: string
}

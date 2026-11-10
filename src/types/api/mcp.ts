/**
 * 外部 MCP Client 配置类型
 *
 * - status：'0' 停用 / '1' 启用
 * - transportType：当前仅支持 http_streamable
 */

/** MCP Server / Tool 启停状态 */
export type McpStatus = '0' | '1'

/** MCP 传输类型 */
export type McpTransportType = 'http_streamable'

/** MCP Client Server 实体 */
export interface McpClientServer {
  id?: number
  serverName: string
  serverCode: string
  endpointUrl: string
  transportType?: McpTransportType | string
  apiKey?: string
  headersJson?: string
  status?: McpStatus | string
  connectTimeoutMs?: number
  requestTimeoutMs?: number
  lastSyncTime?: string
  lastError?: string
  remark?: string
  createTime?: string
  updateTime?: string
}

/** MCP Client Server 新增/修改入参 */
export interface McpClientServerParams {
  id?: number
  serverName: string
  serverCode: string
  endpointUrl: string
  transportType?: McpTransportType | string
  apiKey?: string
  headersJson?: string
  status?: McpStatus | string
  connectTimeoutMs?: number
  requestTimeoutMs?: number
  remark?: string
}

/** MCP Client 工具实体 */
export interface McpClientTool {
  id?: number
  serverId: number
  remoteToolName: string
  exposedName: string
  description?: string
  inputSchema?: string
  status?: McpStatus | string
  remark?: string
  createTime?: string
  updateTime?: string
}

/** MCP 工具查询参数 */
export interface McpClientToolParams {
  id?: number
  serverId?: number
  remoteToolName?: string
  exposedName?: string
  status?: McpStatus | string
}

/** 启停入参 */
export interface McpChangeStatusParams {
  id: number
  status: McpStatus
}

/** 同步工具结果 */
export interface McpSyncToolsResult {
  toolCount: number
}

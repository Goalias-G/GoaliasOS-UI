/**
 * 外部 MCP Client 配置 API
 *
 * - Server：CRUD、启停、同步工具、连通性探测
 * - Tool：列表预览、自定义启停
 */

import { get, post, put, del } from '@/api'
import type {
  ApiResponse,
  McpChangeStatusParams,
  McpClientServer,
  McpClientServerParams,
  McpClientTool,
  McpClientToolParams,
  McpSyncToolsResult,
  PageQuery,
  PageResult,
} from '@/types'

export const mcpClientServerApi = {
  /**
   * 分页查询 MCP Server
   */
  list: (params?: Partial<McpClientServerParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<McpClientServer>>>('/chat/mcp/server/list', {
      ...params,
      ...pageQuery,
    }),

  /**
   * 获取 Server 详情
   */
  getInfo: (id: number) => get<ApiResponse<McpClientServer>>(`/chat/mcp/server/${id}`),

  /**
   * 新增 Server
   */
  add: (data: McpClientServerParams) => post<ApiResponse<void>>('/chat/mcp/server', data),

  /**
   * 修改 Server
   */
  edit: (data: McpClientServerParams) => put<ApiResponse<void>>('/chat/mcp/server', data),

  /**
   * 启停 Server
   */
  changeStatus: (data: McpChangeStatusParams) =>
    put<ApiResponse<void>>('/chat/mcp/server/changeStatus', data),

  /**
   * 同步远端 tools 并落库
   */
  syncTools: (id: number) =>
    post<ApiResponse<McpSyncToolsResult>>(`/chat/mcp/server/${id}/syncTools`),

  /**
   * 连通性探测（不落库，返回工具预览）
   */
  test: (id: number) => post<ApiResponse<McpClientTool[]>>(`/chat/mcp/server/${id}/test`),

  /**
   * 批量删除 Server
   */
  remove: (ids: number[]) => del<ApiResponse<void>>(`/chat/mcp/server/${ids.join(',')}`),
}

export const mcpClientToolApi = {
  /**
   * 分页查询工具（DB 缓存预览）
   */
  list: (params?: Partial<McpClientToolParams>, pageQuery?: PageQuery) =>
    get<ApiResponse<PageResult<McpClientTool>>>('/chat/mcp/tool/list', {
      ...params,
      ...pageQuery,
    }),

  /**
   * 工具详情
   */
  getInfo: (id: number) => get<ApiResponse<McpClientTool>>(`/chat/mcp/tool/${id}`),

  /**
   * 自定义启停单个工具
   */
  changeStatus: (data: McpChangeStatusParams) =>
    put<ApiResponse<void>>('/chat/mcp/tool/changeStatus', data),
}

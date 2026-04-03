/**
 * SSE 流式请求工具
 *
 * 功能说明：
 * - 封装 SSE (Server-Sent Events) 连接逻辑
 * - 支持流式数据接收和解析
 * - 支持连接中断和错误处理
 * - 自动添加认证 Token
 */

/**
 * SSE 连接配置选项
 */
export interface SSEOptions {
  /** 接收到消息时的回调 */
  onMessage: (data: string) => void
  /** 发生错误时的回调 */
  onError: (error: Error) => void
  /** 连接完成时的回调 */
  onComplete: () => void
  /** 中断信号（用于取消连接） */
  signal?: AbortSignal
  /** 请求超时时间（毫秒），默认 60000ms (60秒) */
  timeout?: number
}

/**
 * SSE 连接错误类型
 */
export class SSEError extends Error {
  constructor(
    message: string,
    public type: 'network' | 'parse' | 'timeout' | 'abort' | 'http',
    public statusCode?: number,
  ) {
    super(message)
    this.name = 'SSEError'
  }
}

/**
 * 创建 SSE 流式连接
 *
 * @param url 请求 URL
 * @param data 请求数据
 * @param options SSE 配置选项
 *
 * @example
 * ```typescript
 * const controller = new AbortController()
 *
 * await createSSEConnection('/goalias-os/chat/send', {
 *   messages: [{ role: 'user', content: '你好' }],
 *   sessionId: 123
 * }, {
 *   signal: controller.signal,
 *   onMessage: (data) => {
 *     console.log('接收到数据:', data)
 *   },
 *   onError: (error) => {
 *     console.error('连接错误:', error)
 *   },
 *   onComplete: () => {
 *     console.log('连接完成')
 *   }
 * })
 * ```
 */
export async function createSSEConnection(
  url: string,
  data: any,
  options: SSEOptions,
): Promise<void> {
  const { onMessage, onError, onComplete, signal, timeout = 60000 } = options

  // 从 localStorage 读取 token
  const token = localStorage.getItem('token')

  // 创建超时控制器
  const timeoutController = new AbortController()
  const timeoutId = setTimeout(() => {
    timeoutController.abort()
  }, timeout)

  // 合并中断信号
  const combinedSignal = signal
    ? combineAbortSignals([signal, timeoutController.signal])
    : timeoutController.signal

  try {
    // 发起 SSE 请求
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
      signal: combinedSignal,
    })

    // 清除超时定时器
    clearTimeout(timeoutId)

    // 检查 HTTP 状态码
    if (!response.ok) {
      throw new SSEError(
        `HTTP 错误: ${response.status} ${response.statusText}`,
        'http',
        response.status,
      )
    }

    // 检查响应体是否存在
    if (!response.body) {
      throw new SSEError('响应体为空', 'network')
    }

    // 获取 ReadableStream 读取器
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    // 用于累积未完成的数据行
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // 流结束
          onComplete()
          break
        }

        // 解码数据块
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // 按行分割数据
        const lines = buffer.split('\n')

        // 保留最后一个不完整的行
        buffer = lines.pop() || ''

        // 处理每一行
        for (const line of lines) {
          // 跳过空行（SSE 协议中空行用于分隔事件）
          if (!line.trim()) {
            continue
          }

          // 解析 SSE 数据格式: data: {内容}
          if (line.startsWith('data:')) {
            try {
              // 提取 data: 后面的内容
              // 注意：只移除 "data:" 和紧跟的一个空格（如果有）
              let content = line.slice(5) // 移除 "data:" 前缀（5个字符）

              // 连续的空 data: 表示换行
              onMessage(content)
            } catch (parseError) {
              // 解析错误
              console.error('SSE 数据解析失败:', line, parseError)
              throw new SSEError(`数据解析失败: ${parseError}`, 'parse')
            }
          } else {
            // 记录非 data: 开头的行（可能是 event:, id:, retry: 等）
            console.log('SSE 接收到非 data 行:', line)
          }
        }
      }
    } catch (readError: any) {
      // 读取流时发生错误
      if (readError.name === 'AbortError') {
        // 用户主动中断
        throw new SSEError('连接已中断', 'abort')
      } else {
        // 其他读取错误
        throw new SSEError(`读取数据失败: ${readError.message}`, 'network')
      }
    } finally {
      // 释放读取器
      reader.releaseLock()
    }
  } catch (error: any) {
    // 清除超时定时器
    clearTimeout(timeoutId)

    // 处理不同类型的错误
    if (error instanceof SSEError) {
      // 已经是 SSEError，直接传递
      onError(error)
    } else if (error.name === 'AbortError') {
      // 超时或用户中断
      if (timeoutController.signal.aborted && !signal?.aborted) {
        // 超时
        onError(new SSEError('连接超时', 'timeout'))
      } else {
        // 用户主动中断
        onError(new SSEError('连接已中断', 'abort'))
      }
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // 网络错误
      onError(new SSEError('网络连接失败，请检查网络', 'network'))
    } else {
      // 其他未知错误
      onError(new SSEError(`未知错误: ${error.message}`, 'network'))
    }

    throw error
  }
}

/**
 * 合并多个 AbortSignal
 * @param signals AbortSignal 数组
 * @returns 合并后的 AbortSignal
 */
function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController()

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort()
      break
    }

    signal.addEventListener('abort', () => {
      controller.abort()
    })
  }

  return controller.signal
}

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
 * 增量解析 SSE 文本流。
 *
 * SSE 以空行分隔事件；同一个事件内可以包含多条 data 字段，字段之间
 * 必须以换行连接。后端输出的 Markdown 换行正是通过这种多 data 行形式
 * 传输的，不能逐行直接拼接。
 */
class SSEStreamParser {
  private buffer = ''
  private dataLines: string[] = []

  constructor(private readonly onMessage: (data: string) => void) {}

  push(chunk: string): void {
    this.buffer += chunk
    this.consumeLines(false)
  }

  finish(): void {
    this.consumeLines(true)

    if (this.buffer) {
      this.processLine(this.buffer)
      this.buffer = ''
    }

    this.dispatchEvent()
  }

  private consumeLines(flush: boolean): void {
    while (this.buffer) {
      const lineBreakIndex = this.buffer.search(/[\r\n]/)

      if (lineBreakIndex < 0) {
        return
      }

      const lineBreak = this.buffer[lineBreakIndex]

      // \r\n 可能刚好被拆到两个网络分片中，等待下一个分片后再判断。
      if (!flush && lineBreak === '\r' && lineBreakIndex === this.buffer.length - 1) {
        return
      }

      const line = this.buffer.slice(0, lineBreakIndex)
      const lineBreakLength = lineBreak === '\r' && this.buffer[lineBreakIndex + 1] === '\n' ? 2 : 1

      this.buffer = this.buffer.slice(lineBreakIndex + lineBreakLength)
      this.processLine(line)
    }
  }

  private processLine(line: string): void {
    if (line === '') {
      this.dispatchEvent()
      return
    }

    if (line.startsWith('data:')) {
      // 当前后端直接把 token 拼在 data: 后面。保留其原始前导空格，
      // 否则 "#" + " 标题" 会错误变为 "#标题"。
      this.dataLines.push(line.slice(5))
    }
  }

  private dispatchEvent(): void {
    if (this.dataLines.length === 0) {
      return
    }

    this.onMessage(this.dataLines.join('\n'))
    this.dataLines = []
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

    const parser = new SSEStreamParser(onMessage)

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // 刷新 TextDecoder 和最后一个可能没有空行结尾的 SSE 事件。
          parser.push(decoder.decode())
          parser.finish()
          onComplete()
          break
        }

        parser.push(decoder.decode(value, { stream: true }))
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

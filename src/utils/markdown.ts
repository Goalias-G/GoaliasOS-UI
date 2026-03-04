/**
 * Markdown 渲染工具
 *
 * 功能说明：
 * - 封装 markdown-it 进行 Markdown 渲染
 * - 集成 highlight.js 实现代码高亮（按需导入语言）
 * - 提供代码块复制功能
 * - 处理 XSS 安全防护
 */

import MarkdownIt from 'markdown-it'
// 只导入 highlight.js 核心，不导入所有语言
import hljs from 'highlight.js/lib/core'

// 按需导入常用语言（大幅减小打包体积）
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import go from 'highlight.js/lib/languages/go'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import shell from 'highlight.js/lib/languages/shell'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'
import css from 'highlight.js/lib/languages/css'
import scss from 'highlight.js/lib/languages/scss'
import less from 'highlight.js/lib/languages/less'

// 注册语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c++', cpp)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('cs', csharp)
hljs.registerLanguage('go', go)
hljs.registerLanguage('golang', go)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('shell', shell)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('css', css)
hljs.registerLanguage('scss', scss)
hljs.registerLanguage('less', less)

// ==================== 类型定义 ====================

/**
 * Markdown 渲染选项
 */
export interface MarkdownOptions {
  /** 是否启用 HTML 标签（默认 false，防止 XSS） */
  html?: boolean
  /** 是否自动将 URL 转换为链接 */
  linkify?: boolean
  /** 是否启用排版优化 */
  typographer?: boolean
  /** 是否在新标签页打开链接 */
  openLinksInNewTab?: boolean
}

/**
 * 代码块复制按钮配置
 */
export interface CopyButtonOptions {
  /** 按钮文本 */
  text?: string
  /** 复制成功后的文本 */
  successText?: string
  /** 成功提示显示时长（毫秒） */
  successDuration?: number
}

// ==================== Markdown 渲染器配置 ====================

/**
 * 创建 Markdown 渲染器实例
 * @param options 渲染选项
 * @returns MarkdownIt 实例
 */
export function createMarkdownRenderer(options: MarkdownOptions = {}): MarkdownIt {
  const {
    html = false, // 默认禁用 HTML，防止 XSS
    linkify = true,
    typographer = true,
    openLinksInNewTab = true,
  } = options

  // 创建 markdown-it 实例
  const md = new MarkdownIt({
    html,
    linkify,
    typographer,
    highlight: (str, lang) => {
      // 代码高亮处理
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(str, {
            language: lang,
            ignoreIllegals: true,
          }).value

          // 返回带语言标签和复制按钮的代码块
          return `<pre class="hljs-code-block" data-lang="${escapeHtml(lang)}"><code class="hljs language-${escapeHtml(lang)}">${highlighted}</code><button class="copy-code-btn" data-code="${escapeHtml(str)}" aria-label="复制代码">复制</button></pre>`
        } catch (error) {
          console.error('代码高亮失败:', error)
        }
      }

      // 无语言标签或高亮失败时，返回纯文本
      return `<pre class="hljs-code-block"><code class="hljs">${escapeHtml(str)}</code><button class="copy-code-btn" data-code="${escapeHtml(str)}" aria-label="复制代码">复制</button></pre>`
    },
  })

  // 自定义链接渲染规则（在新标签页打开）
  if (openLinksInNewTab) {
    const defaultRender =
      md.renderer.rules.link_open ||
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options)
      }

    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      const token = tokens[idx]
      if (!token) return defaultRender(tokens, idx, options, env, self)

      const aIndex = token.attrIndex('target')

      if (aIndex < 0) {
        token.attrPush(['target', '_blank'])
      } else {
        const attrs = token.attrs
        if (attrs && attrs[aIndex]) {
          attrs[aIndex][1] = '_blank'
        }
      }

      // 添加 rel="noopener noreferrer" 提升安全性
      const relIndex = token.attrIndex('rel')
      if (relIndex < 0) {
        token.attrPush(['rel', 'noopener noreferrer'])
      } else {
        const attrs = token.attrs
        if (attrs && attrs[relIndex]) {
          attrs[relIndex][1] = 'noopener noreferrer'
        }
      }

      return defaultRender(tokens, idx, options, env, self)
    }
  }

  return md
}

// ==================== 默认渲染器实例 ====================

/**
 * 默认 Markdown 渲染器（单例）
 */
let defaultRenderer: MarkdownIt | null = null

/**
 * 获取默认渲染器实例
 * @returns MarkdownIt 实例
 */
export function getDefaultRenderer(): MarkdownIt {
  if (!defaultRenderer) {
    defaultRenderer = createMarkdownRenderer()
  }
  return defaultRenderer
}

// ==================== 渲染函数 ====================

/**
 * 渲染 Markdown 文本为 HTML
 * @param markdown Markdown 文本
 * @param options 渲染选项
 * @returns 渲染后的 HTML 字符串
 * @example
 * const html = renderMarkdown('# Hello World')
 */
export function renderMarkdown(markdown: string, options?: MarkdownOptions): string {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }

  try {
    const renderer = options ? createMarkdownRenderer(options) : getDefaultRenderer()
    return renderer.render(markdown)
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    return escapeHtml(markdown) // 渲染失败时返回转义后的纯文本
  }
}

/**
 * 渲染 Markdown 文本为 HTML（内联模式，不生成 <p> 标签）
 * @param markdown Markdown 文本
 * @param options 渲染选项
 * @returns 渲染后的 HTML 字符串
 * @example
 * const html = renderMarkdownInline('**bold** text')
 */
export function renderMarkdownInline(markdown: string, options?: MarkdownOptions): string {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }

  try {
    const renderer = options ? createMarkdownRenderer(options) : getDefaultRenderer()
    return renderer.renderInline(markdown)
  } catch (error) {
    console.error('Markdown 内联渲染失败:', error)
    return escapeHtml(markdown)
  }
}

// ==================== XSS 防护 ====================

/**
 * HTML 转义字符映射表
 */
const htmlEscapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/**
 * 转义 HTML 特殊字符，防止 XSS 攻击
 * @param text 原始文本
 * @returns 转义后的文本
 * @example
 * escapeHtml('<script>alert("xss")</script>')
 * // 返回: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char] || char)
}

/**
 * 清理 HTML 标签（仅保留纯文本）
 * @param html HTML 字符串
 * @returns 纯文本
 * @example
 * stripHtml('<p>Hello <strong>World</strong></p>')
 * // 返回: 'Hello World'
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * 清理危险的 HTML 属性（如 onerror、onclick 等）
 * @param html HTML 字符串
 * @returns 清理后的 HTML
 */
export function sanitizeHtml(html: string): string {
  // 移除事件处理属性
  let sanitized = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')

  // 移除 javascript: 协议
  sanitized = sanitized.replace(/javascript:/gi, '')

  // 移除 data: 协议（可能包含恶意代码）
  sanitized = sanitized.replace(/data:text\/html/gi, '')

  return sanitized
}

// ==================== 代码块复制功能 ====================

/**
 * 初始化代码块复制功能
 * @param container 容器元素（包含代码块的父元素）
 * @param options 复制按钮配置
 * @example
 * const container = document.querySelector('.message-content')
 * initCodeCopy(container)
 */
export function initCodeCopy(container: HTMLElement, options: CopyButtonOptions = {}): () => void {
  const { successText = '已复制', successDuration = 2000 } = options

  // 事件处理函数
  const handleCopyClick = async (event: Event) => {
    const target = event.target as HTMLElement

    // 检查是否点击了复制按钮
    if (!target.classList.contains('copy-code-btn')) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    // 获取代码内容
    const code = target.getAttribute('data-code')
    if (!code) {
      console.warn('未找到代码内容')
      return
    }

    try {
      // 复制到剪贴板
      await copyToClipboard(code)

      // 更新按钮状态
      const originalText = target.textContent || '复制代码'
      target.textContent = successText
      target.classList.add('copied')

      // 恢复按钮状态
      setTimeout(() => {
        target.textContent = originalText
        target.classList.remove('copied')
      }, successDuration)
    } catch (error) {
      console.error('复制失败:', error)
      target.textContent = '复制失败'

      setTimeout(() => {
        target.textContent = '复制'
      }, successDuration)
    }
  }

  // 添加事件监听（使用事件委托）
  container.addEventListener('click', handleCopyClick)

  // 返回清理函数
  return () => {
    container.removeEventListener('click', handleCopyClick)
  }
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise
 */
export async function copyToClipboard(text: string): Promise<void> {
  // 优先使用现代 Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch (error) {
      console.warn('Clipboard API 失败，尝试降级方案:', error)
    }
  }

  // 降级方案：使用 execCommand
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    textarea.style.pointerEvents = 'none'

    document.body.appendChild(textarea)
    textarea.select()

    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(textarea)

      if (successful) {
        resolve()
      } else {
        reject(new Error('execCommand 复制失败'))
      }
    } catch (error) {
      document.body.removeChild(textarea)
      reject(error)
    }
  })
}

// ==================== 工具函数 ====================

/**
 * 提取 Markdown 中的纯文本（移除所有格式）
 * @param markdown Markdown 文本
 * @returns 纯文本
 * @example
 * extractPlainText('# Hello **World**')
 * // 返回: 'Hello World'
 */
export function extractPlainText(markdown: string): string {
  const html = renderMarkdown(markdown)
  return stripHtml(html).trim()
}

/**
 * 截断 Markdown 文本（保留格式）
 * @param markdown Markdown 文本
 * @param maxLength 最大长度
 * @param suffix 截断后缀（默认 '...'）
 * @returns 截断后的 Markdown
 * @example
 * truncateMarkdown('# Very long title...', 10)
 * // 返回: '# Very lon...'
 */
export function truncateMarkdown(markdown: string, maxLength: number, suffix = '...'): string {
  if (markdown.length <= maxLength) {
    return markdown
  }

  return markdown.slice(0, maxLength - suffix.length) + suffix
}

/**
 * 检测文本是否包含 Markdown 格式
 * @param text 文本
 * @returns 是否包含 Markdown 格式
 */
export function hasMarkdownSyntax(text: string): boolean {
  // 检测常见的 Markdown 语法
  const markdownPatterns = [
    /^#{1,6}\s/, // 标题
    /\*\*.*\*\*/, // 粗体
    /\*.*\*/, // 斜体
    /\[.*\]\(.*\)/, // 链接
    /!\[.*\]\(.*\)/, // 图片
    /^```/, // 代码块
    /`.*`/, // 内联代码
    /^[-*+]\s/, // 无序列表
    /^\d+\.\s/, // 有序列表
    /^>\s/, // 引用
  ]

  return markdownPatterns.some((pattern) => pattern.test(text))
}

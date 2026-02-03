/// <reference types="vite/client" />

/**
 * 环境变量类型声明
 *
 * 说明：所有 VITE_ 前缀的环境变量都会暴露给客户端代码
 *
 * TODO 扩展：
 * - [ ] VITE_UPLOAD_URL - 文件上传地址
 * - [ ] VITE_WS_URL - WebSocket 地址
 * - [ ] VITE_SENTRY_DSN - Sentry 错误上报地址
 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_REQUEST_TIMEOUT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

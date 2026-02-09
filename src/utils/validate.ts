/**
 * 验证工具函数
 *
 * 功能说明：
 * - 常用格式验证（手机号、邮箱、身份证等）
 * - 密码强度检测
 * - URL 验证
 */

/**
 * 验证手机号（中国大陆）
 * @param phone 手机号
 */
export function isPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 验证邮箱
 * @param email 邮箱地址
 */
export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * 验证身份证号（18位）
 * @param idCard 身份证号
 */
export function isIdCard(idCard: string): boolean {
  return /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard)
}

/**
 * 验证 URL
 * @param url URL 地址
 */
export function isUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证是否为空（null、undefined、空字符串、空数组、空对象）
 * @param value 待验证的值
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 密码强度检测
 * @param password 密码
 * @returns 强度等级：0-弱，1-中，2-强
 */
export function checkPasswordStrength(password: string): 0 | 1 | 2 {
  if (password.length < 6) return 0

  let strength = 0
  // 包含数字
  if (/\d/.test(password)) strength++
  // 包含小写字母
  if (/[a-z]/.test(password)) strength++
  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++
  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
  // 长度大于 10
  if (password.length >= 10) strength++

  if (strength <= 2) return 0
  if (strength <= 3) return 1
  return 2
}

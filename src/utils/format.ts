/**
 * 格式化工具函数
 *
 * 功能说明：
 * - 日期时间格式化
 * - 数字格式化（千分位、货币、百分比）
 * - 文件大小格式化
 * - 手机号脱敏
 */

/**
 * 日期格式化
 * @param date 日期对象或时间戳
 * @param format 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @example formatDate(new Date(), 'YYYY-MM-DD') // '2026-01-09'
 */
export function formatDate(
    date: Date | number | string,
    format: string = 'YYYY-MM-DD HH:mm:ss',
): string {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
}

/**
 * 数字千分位格式化
 * @param num 数字
 * @param decimals 小数位数，默认 2
 * @example formatNumber(1234567.89) // '1,234,567.89'
 */
export function formatNumber(num: number, decimals: number = 2): string {
    if (isNaN(num)) return '0'
    return num.toLocaleString('zh-CN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })
}

/**
 * 货币格式化
 * @param amount 金额
 * @param currency 货币符号，默认 '¥'
 * @example formatCurrency(1234.5) // '¥1,234.50'
 */
export function formatCurrency(amount: number, currency: string = '¥'): string {
    return `${currency}${formatNumber(amount, 2)}`
}

/**
 * 百分比格式化
 * @param value 数值（0-1 之间）
 * @param decimals 小数位数，默认 2
 * @example formatPercent(0.1234) // '12.34%'
 */
export function formatPercent(value: number, decimals: number = 2): string {
    return `${(value * 100).toFixed(decimals)}%`
}

/**
 * 文件大小格式化
 * @param bytes 字节数
 * @example formatFileSize(1024) // '1 KB'
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

/**
 * 手机号脱敏
 * @param phone 手机号
 * @example maskPhone('13812345678') // '138****5678'
 */
export function maskPhone(phone: string): string {
    if (!phone || phone.length !== 11) return phone
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 邮箱脱敏
 * @param email 邮箱地址
 * @example maskEmail('test@example.com') // 't***@example.com'
 */
export function maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email
    const parts = email.split('@')
    const name = parts[0] || ''
    const domain = parts[1] || ''
    const maskedName = name.length > 2 ? name[0] + '***' + name.slice(-1) : name[0] + '***'
    return `${maskedName}@${domain}`
}

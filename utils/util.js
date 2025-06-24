const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

/**
 * 格式化友好的时间显示
 * @param {Date|string} date 日期对象或日期字符串
 * @returns {string} 格式化后的时间字符串
 */
const formatFriendlyTime = (date) => {
  if (!date) return ''
  
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const year = targetDate.getFullYear()
  const month = targetDate.getMonth() + 1
  const day = targetDate.getDate()
  const hour = targetDate.getHours()
  const minute = targetDate.getMinutes()
  
  return `${year}-${formatNumber(month)}-${formatNumber(day)} ${formatNumber(hour)}:${formatNumber(minute)}`
}

/**
 * 格式化相对时间（多久前）
 * @param {Date|string} date 日期对象或日期字符串
 * @returns {string} 相对时间字符串
 */
const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - targetDate.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  // 超过7天显示具体日期
  return formatFriendlyTime(targetDate)
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 获取默认头像URL
 * @param {string} nickname 用户昵称
 * @returns {string} 默认头像URL或base64
 */
const getDefaultAvatar = (nickname = '') => {
  // 获取昵称首字符
  const firstChar = nickname ? nickname.charAt(0).toUpperCase() : '用'
  
  // 生成简单的SVG头像
  const svgContent = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#f0f0f0"/>
    <text x="50" y="65" font-family="Arial, sans-serif" font-size="40" fill="#999" text-anchor="middle">${firstChar}</text>
  </svg>`
  
  // 在小程序中，我们可能需要使用不同的方式
  // 这里返回一个简单的占位符，实际使用中可以上传到云存储
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
}

/**
 * 处理头像URL，提供默认头像
 * @param {string} avatarUrl 原头像URL
 * @param {string} nickname 用户昵称
 * @returns {string} 处理后的头像URL
 */
const processAvatarUrl = (avatarUrl, nickname = '') => {
  if (avatarUrl && avatarUrl.trim()) {
    return avatarUrl
  }
  
  // 如果没有头像，返回默认头像
  return getDefaultAvatar(nickname)
}

module.exports = {
  formatTime,
  formatFriendlyTime,
  formatRelativeTime,
  getDefaultAvatar,
  processAvatarUrl
} 
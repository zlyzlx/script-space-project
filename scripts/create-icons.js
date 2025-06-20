/**
 * TabBar 图标创建脚本
 * 
 * 这个脚本可以在浏览器环境中运行，生成基本的tabBar图标
 * 
 * 使用方法：
 * 1. 在浏览器控制台中运行此脚本
 * 2. 或者在Node.js环境中使用canvas库运行
 */

// 图标配置
const iconConfig = {
  size: 81,
  normalColor: '#7A7E83',
  activeColor: '#667eea',
  backgroundColor: 'transparent'
}

// 创建canvas元素
function createCanvas(size) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return canvas
}

// 绘制首页图标
function drawHomeIcon(ctx, size, color, filled = false) {
  const center = size / 2
  const houseSize = size * 0.6
  
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  // 绘制房子
  ctx.beginPath()
  
  // 屋顶
  ctx.moveTo(center - houseSize/2, center)
  ctx.lineTo(center, center - houseSize/3)
  ctx.lineTo(center + houseSize/2, center)
  
  // 房子主体
  ctx.lineTo(center + houseSize/2, center + houseSize/3)
  ctx.lineTo(center - houseSize/2, center + houseSize/3)
  ctx.closePath()
  
  if (filled) {
    ctx.fill()
  } else {
    ctx.stroke()
  }
  
  // 门
  ctx.beginPath()
  ctx.rect(center - houseSize/8, center + houseSize/6, houseSize/4, houseSize/6)
  if (filled) {
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  } else {
    ctx.stroke()
  }
}

// 绘制拼车图标
function drawCarpoolIcon(ctx, size, color, filled = false) {
  const center = size / 2
  const carWidth = size * 0.7
  const carHeight = size * 0.4
  
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  // 绘制汽车主体
  ctx.beginPath()
  ctx.roundRect(center - carWidth/2, center - carHeight/4, carWidth, carHeight/2, 5)
  
  if (filled) {
    ctx.fill()
  } else {
    ctx.stroke()
  }
  
  // 绘制车轮
  const wheelRadius = size * 0.08
  const wheelY = center + carHeight/4 + wheelRadius/2
  
  ctx.beginPath()
  ctx.arc(center - carWidth/3, wheelY, wheelRadius, 0, Math.PI * 2)
  ctx.arc(center + carWidth/3, wheelY, wheelRadius, 0, Math.PI * 2)
  
  if (filled) {
    ctx.fill()
  } else {
    ctx.stroke()
  }
}

// 绘制用户图标
function drawProfileIcon(ctx, size, color, filled = false) {
  const center = size / 2
  const headRadius = size * 0.15
  const bodyWidth = size * 0.4
  const bodyHeight = size * 0.3
  
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  // 绘制头部
  ctx.beginPath()
  ctx.arc(center, center - size * 0.1, headRadius, 0, Math.PI * 2)
  
  if (filled) {
    ctx.fill()
  } else {
    ctx.stroke()
  }
  
  // 绘制身体
  ctx.beginPath()
  ctx.arc(center, center + size * 0.2, bodyWidth/2, 0, Math.PI, true)
  
  if (filled) {
    ctx.fill()
  } else {
    ctx.stroke()
  }
}

// 生成图标
function generateIcon(name, drawFunction, filled = false) {
  const canvas = createCanvas(iconConfig.size)
  const ctx = canvas.getContext('2d')
  
  // 清除画布
  ctx.clearRect(0, 0, iconConfig.size, iconConfig.size)
  
  // 绘制图标
  const color = filled ? iconConfig.activeColor : iconConfig.normalColor
  drawFunction(ctx, iconConfig.size, color, filled)
  
  // 返回DataURL
  return canvas.toDataURL('image/png')
}

// 下载图标
function downloadIcon(dataUrl, filename) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 生成所有图标
function generateAllIcons() {
  const icons = [
    { name: 'home', drawFunc: drawHomeIcon },
    { name: 'carpool', drawFunc: drawCarpoolIcon },
    { name: 'profile', drawFunc: drawProfileIcon }
  ]
  
  icons.forEach(icon => {
    // 普通状态
    const normalIcon = generateIcon(icon.name, icon.drawFunc, false)
    downloadIcon(normalIcon, `${icon.name}.png`)
    
    // 选中状态
    const activeIcon = generateIcon(icon.name, icon.drawFunc, true)
    downloadIcon(activeIcon, `${icon.name}-active.png`)
  })
  
  console.log('所有图标已生成并下载')
}

// 浏览器环境下运行
if (typeof window !== 'undefined') {
  console.log('TabBar图标生成器已加载')
  console.log('运行 generateAllIcons() 来生成所有图标')
  
  // 添加到全局对象
  window.generateAllIcons = generateAllIcons
}

// 导出函数（Node.js环境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateAllIcons,
    generateIcon,
    drawHomeIcon,
    drawCarpoolIcon,
    drawProfileIcon
  }
}

/*
使用说明：

1. 在浏览器中运行：
   - 打开浏览器控制台
   - 复制粘贴此脚本
   - 运行 generateAllIcons()
   - 图标将自动下载

2. 手动创建图标：
   - 访问 https://www.iconfont.cn/
   - 搜索 home, car, user 图标
   - 下载PNG格式，81x81像素
   - 重命名为对应文件名

3. 将下载的图标文件放置到：
   images/tab/ 目录下

4. 更新 app.json 配置：
   添加 iconPath 和 selectedIconPath 配置
*/ 
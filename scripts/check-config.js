// 配置检查脚本
// 在微信开发者工具的控制台中运行此脚本来检查配置状态

console.log('=== 云开发配置检查 ===')

// 检查云开发初始化
if (typeof wx !== 'undefined' && wx.cloud) {
  console.log('✅ 云开发SDK已加载')
  
  // 检查云函数
  const cloudFunctions = [
    'carpool-list',
    'carpool-detail', 
    'carpool-create',
    'carpool-update',
    'carpool-join',
    'carpool-quit',
    'user-info',
    'user-update',
    'user-carpools',
    'user-rides'
  ]
  
  console.log('\n=== 云函数检查 ===')
  cloudFunctions.forEach(async (funcName, index) => {
    try {
      const result = await wx.cloud.callFunction({
        name: funcName,
        data: { test: true }
      })
      console.log(`✅ ${funcName} - 可调用`)
    } catch (error) {
      console.log(`❌ ${funcName} - 调用失败:`, error.message)
    }
  })
  
  // 检查数据库连接
  console.log('\n=== 数据库检查 ===')
  const db = wx.cloud.database()
  
  const collections = ['carpools', 'carpool_participants', 'users']
  collections.forEach(async (collectionName) => {
    try {
      const result = await db.collection(collectionName).limit(1).get()
      console.log(`✅ ${collectionName} 集合 - 可访问`)
    } catch (error) {
      console.log(`❌ ${collectionName} 集合 - 访问失败:`, error.message)
    }
  })
  
} else {
  console.log('❌ 云开发SDK未加载，请检查 app.js 配置')
}

console.log('\n=== 检查完成 ===')
console.log('如有错误，请参考 SETUP_GUIDE.md 进行配置') 
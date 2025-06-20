// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    const { 
      page = 1, 
      limit = 10, 
      searchText = '', 
      dateFilter = '', 
      statusFilter = '' 
    } = event

    // 构建查询条件
    let query = {}
    
    // 搜索条件
    if (searchText) {
      query = db.command.or([
        {
          activityName: db.RegExp({
            regexp: searchText,
            options: 'i'
          })
        },
        {
          location: db.RegExp({
            regexp: searchText,
            options: 'i'
          })
        }
      ])
    }
    
    // 状态筛选
    if (statusFilter) {
      query.status = statusFilter
    }
    
    // 日期筛选
    if (dateFilter) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      if (dateFilter === '今天') {
        const todayStr = today.toISOString().split('T')[0]
        query.date = todayStr
      } else if (dateFilter === '明天') {
        const tomorrowStr = tomorrow.toISOString().split('T')[0]
        query.date = tomorrowStr
      } else if (dateFilter === '本周') {
        // 获取本周日期范围
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        
        query.date = db.command.gte(startOfWeek.toISOString().split('T')[0])
          .and(db.command.lte(endOfWeek.toISOString().split('T')[0]))
      }
    }
    
    // 执行查询
    const result = await db.collection('carpools')
      .where(query)
      .orderBy('publishTime', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get()
    
    // 获取总数
    const countResult = await db.collection('carpools')
      .where(query)
      .count()
    
    return {
      success: true,
      data: result.data,
      total: countResult.total,
      page,
      limit,
      hasMore: countResult.total > page * limit
    }
    
  } catch (error) {
    console.error('获取拼车列表失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
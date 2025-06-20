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
    } else {
      // 默认只显示活跃状态的拼车
      query.status = db.command.neq('deleted')
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
    
    // 处理每个拼车数据，添加发布者信息和参与者统计
    const processedData = await Promise.all(
      result.data.map(async (carpool) => {
        // 获取发布者信息
        const organizerResult = await db.collection('users')
          .where({
            _openid: carpool.organizerId
          })
          .get()
        
        const organizerInfo = organizerResult.data[0] || {
          nickname: '未知用户',
          avatar: '/images/default-avatar.png'
        }
        
        // 获取参与者数量
        const participantsResult = await db.collection('carpool_participants')
          .where({
            carpoolId: carpool._id,
            status: 'active'
          })
          .count()
        
        // 格式化发布时间
        const publishTime = new Date(carpool.publishTime)
        const now = new Date()
        const diffMs = now - publishTime
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)
        
        let publishTimeText = ''
        if (diffDays > 0) {
          publishTimeText = `${diffDays}天前`
        } else if (diffHours > 0) {
          publishTimeText = `${diffHours}小时前`
        } else {
          const diffMinutes = Math.floor(diffMs / (1000 * 60))
          publishTimeText = diffMinutes > 0 ? `${diffMinutes}分钟前` : '刚刚'
        }
        
        return {
          _id: carpool._id,
          activityName: carpool.activityName,
          date: carpool.date,
          time: carpool.time,
          startLocation: carpool.location || carpool.startLocation || '起点',
          endLocation: carpool.fullAddress || carpool.endLocation || '终点',
          currentCount: participantsResult.total,
          maxCount: carpool.maxCount,
          price: carpool.price,
          status: carpool.status,
          publisherInfo: {
            avatarUrl: organizerInfo.avatar || '/images/default-avatar.png',
            nickName: organizerInfo.nickname
          },
          publishTimeText,
          publishTime: carpool.publishTime
        }
      })
    )
    
    return {
      success: true,
      data: processedData,
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
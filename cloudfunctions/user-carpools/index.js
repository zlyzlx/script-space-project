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
      status = '' 
    } = event
    
    const currentUserId = wxContext.OPENID
    
    // 构建查询条件
    let query = {
      organizerId: currentUserId
    }
    
    // 状态筛选
    if (status && status !== 'all') {
      const statusMap = {
        'recruiting': '招募中',
        'full': '已满员',
        'finished': '已结束',
        'cancelled': '已取消'
      }
      query.status = statusMap[status]
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
    
    // 为每个拼车获取参与者信息
    const carpoolsWithParticipants = await Promise.all(
      result.data.map(async (carpool) => {
        // 获取参与者
        const participantsResult = await db.collection('carpool_participants')
          .where({
            carpoolId: carpool._id,
            status: 'active'
          })
          .get()
        
        // 获取参与者用户信息
        const participantIds = participantsResult.data.map(p => p.userId)
        let participantsInfo = []
        
        if (participantIds.length > 0) {
          const usersResult = await db.collection('users')
            .where({
              _openid: db.command.in(participantIds)
            })
            .get()
          
          participantsInfo = usersResult.data.map(user => ({
            id: user._openid,
            nickname: user.nickname,
            avatar: user.avatar,
            joinTime: participantsResult.data.find(p => p.userId === user._openid)?.joinTime
          }))
        }
        
        return {
          ...carpool,
          id: carpool._id,
          currentCount: participantsInfo.length,
          participants: participantsInfo
        }
      })
    )
    
    return {
      success: true,
      data: carpoolsWithParticipants,
      total: countResult.total,
      page,
      limit,
      hasMore: countResult.total > page * limit
    }
    
  } catch (error) {
    console.error('获取用户拼车列表失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
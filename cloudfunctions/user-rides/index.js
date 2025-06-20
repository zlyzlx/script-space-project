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
    
    // 构建查询条件 - 查找用户参与的拼车
    let participantQuery = {
      userId: currentUserId
    }
    
    if (status && status !== 'all') {
      participantQuery.status = 'active'
    }
    
    // 获取用户参与的拼车ID列表
    const participantsResult = await db.collection('carpool_participants')
      .where(participantQuery)
      .orderBy('joinTime', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get()
    
    if (participantsResult.data.length === 0) {
      return {
        success: true,
        data: [],
        total: 0,
        page,
        limit,
        hasMore: false
      }
    }
    
    // 获取拼车详情
    const carpoolIds = participantsResult.data.map(p => p.carpoolId)
    const carpoolsResult = await db.collection('carpools')
      .where({
        _id: db.command.in(carpoolIds)
      })
      .get()
    
    // 根据状态筛选
    let filteredCarpools = carpoolsResult.data
    if (status && status !== 'all') {
      const statusMap = {
        'upcoming': ['招募中', '已满员'],
        'finished': ['已结束'],
        'cancelled': ['已取消']
      }
      
      if (statusMap[status]) {
        filteredCarpools = carpoolsResult.data.filter(carpool => 
          statusMap[status].includes(carpool.status)
        )
      }
    }
    
    // 为每个拼车获取完整信息
    const ridesWithDetails = await Promise.all(
      filteredCarpools.map(async (carpool) => {
        // 获取组织者信息
        const organizerResult = await db.collection('users')
          .where({
            _openid: carpool.organizerId
          })
          .get()
        
        const organizerInfo = organizerResult.data[0] || {
          nickname: '未知用户',
          avatar: ''
        }
        
        // 获取其他参与者信息
        const otherParticipantsResult = await db.collection('carpool_participants')
          .where({
            carpoolId: carpool._id,
            userId: db.command.neq(currentUserId),
            status: 'active'
          })
          .get()
        
        // 获取其他参与者的用户信息
        const otherParticipantIds = otherParticipantsResult.data.map(p => p.userId)
        let otherParticipantsInfo = []
        
        if (otherParticipantIds.length > 0) {
          const otherUsersResult = await db.collection('users')
            .where({
              _openid: db.command.in(otherParticipantIds)
            })
            .get()
          
          otherParticipantsInfo = otherUsersResult.data.map(user => ({
            id: user._openid,
            nickname: user.nickname,
            avatar: user.avatar
          }))
        }
        
        // 获取用户的参与信息
        const userParticipantInfo = participantsResult.data.find(p => p.carpoolId === carpool._id)
        
        // 判断拼车状态
        let rideStatus = '即将开始'
        const activityDateTime = new Date(carpool.date + ' ' + carpool.time)
        const now = new Date()
        
        if (activityDateTime < now) {
          rideStatus = '已完成'
        } else if (carpool.status === '已取消') {
          rideStatus = '已取消'
        }
        
        return {
          id: carpool._id,
          activityName: carpool.activityName,
          status: rideStatus,
          date: carpool.date,
          time: carpool.time,
          location: carpool.location,
          price: carpool.price,
          organizer: organizerInfo.nickname,
          organizerId: carpool.organizerId,
          otherParticipants: otherParticipantsInfo,
          joinTime: userParticipantInfo?.joinTime,
          hasRated: false // 可以根据实际需求添加评价记录
        }
      })
    )
    
    // 获取总数
    const totalParticipants = await db.collection('carpool_participants')
      .where({
        userId: currentUserId,
        status: 'active'
      })
      .count()
    
    return {
      success: true,
      data: ridesWithDetails,
      total: totalParticipants.total,
      page,
      limit,
      hasMore: totalParticipants.total > page * limit
    }
    
  } catch (error) {
    console.error('获取用户参与的拼车列表失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
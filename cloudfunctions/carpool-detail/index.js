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
    const { carpoolId } = event
    
    if (!carpoolId) {
      return {
        success: false,
        error: '缺少拼车ID参数'
      }
    }
    
    // 获取拼车详情
    const carpoolResult = await db.collection('carpools')
      .doc(carpoolId)
      .get()
    
    if (!carpoolResult.data) {
      return {
        success: false,
        error: '拼车信息不存在'
      }
    }
    
    const carpoolData = carpoolResult.data
    
    // 获取参与者信息
    const participantsResult = await db.collection('carpool_participants')
      .where({
        carpoolId: carpoolId,
        status: 'active'
      })
      .get()
    
    // 获取参与者的用户信息
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
        nickname: user.nickName || user.nickname || '微信用户',
        avatar: user.avatarUrl || user.avatar || '',
        joinTime: participantsResult.data.find(p => p.userId === user._openid)?.joinTime
      }))
    }
    
    // 检查当前用户是否已参与
    const currentUserId = wxContext.OPENID
    const isParticipant = participantIds.includes(currentUserId)
    const isOrganizer = carpoolData.organizerId === currentUserId
    
    // 获取组织者信息
    const organizerResult = await db.collection('users')
      .where({
        _openid: carpoolData.organizerId
      })
      .get()
    
    const organizerInfo = organizerResult.data[0] || {
      nickName: '未知用户',
      avatarUrl: ''
    }
    
    const result = {
      ...carpoolData,
      participants: participantsInfo,
      currentCount: participantsInfo.length,
      organizer: {
        id: carpoolData.organizerId,
        nickname: organizerInfo.nickName || organizerInfo.nickname || '微信用户',
        avatar: organizerInfo.avatarUrl || organizerInfo.avatar || '',
        phone: organizerInfo.phone || ''
      },
      isParticipant,
      isOrganizer
    }
    
    return {
      success: true,
      data: result
    }
    
  } catch (error) {
    console.error('获取拼车详情失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
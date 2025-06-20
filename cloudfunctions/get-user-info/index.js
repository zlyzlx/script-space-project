const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { openid } = event
  
  // 如果没有传入openid，使用当前用户的openid
  const targetOpenid = openid || wxContext.OPENID
  
  try {
    // 查询用户信息
    const userResult = await db.collection('users').doc(targetOpenid).get()
    
    if (!userResult.data) {
      return {
        success: false,
        message: '用户不存在'
      }
    }
    
    const userData = userResult.data
    
    // 如果是查询当前用户，返回完整信息
    if (!openid || openid === wxContext.OPENID) {
      return {
        success: true,
        data: {
          _id: userData._id,
          nickName: userData.nickName || '未设置昵称',
          avatarUrl: userData.avatarUrl || '/images/default-avatar.png',
          phone: userData.phone, // 当前用户可以看到自己的电话
          createTime: userData.createTime,
          updateTime: userData.updateTime
        }
      }
    }
    
    // 如果是查询其他用户，查询统计信息（用于好友页面）
    const carpoolCount = await db.collection('carpools')
      .where({
        organizerId: targetOpenid,
        status: db.command.neq('deleted')
      })
      .count()
    
    const ridesCount = await db.collection('carpools')
      .where({
        'participants.userId': targetOpenid,
        status: db.command.neq('deleted')
      })
      .count()
    
    // 返回用户信息（隐私保护）
    const userInfo = {
      _id: userData._id,
      nickName: userData.nickName || '匿名用户',
      avatarUrl: userData.avatarUrl || '/images/default-avatar.png',
      carpoolCount: carpoolCount.total || 0,
      ridesCount: ridesCount.total || 0,
      // 不返回敏感信息如电话号码等
    }
    
    return {
      success: true,
      data: userInfo
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return {
      success: false,
      message: '获取用户信息失败',
      error: error.message
    }
  }
} 
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
    console.log('查询用户信息 - targetOpenid:', targetOpenid)
    
    // 查询用户信息（使用 _openid 字段查询）
    const userResult = await db.collection('users')
      .where({
        _openid: targetOpenid
      })
      .get()
    
    if (!userResult.data || userResult.data.length === 0) {
      console.log('用户不存在:', targetOpenid)
      return {
        success: false,
        message: '用户不存在'
      }
    }
    
    const userData = userResult.data[0]
    
    // 如果是查询当前用户，返回完整信息
    if (!openid || openid === wxContext.OPENID) {
              return {
          success: true,
          data: {
            _id: userData._id,
            _openid: userData._openid,
            nickName: userData.nickName || userData.nickname || '微信用户',
            avatarUrl: userData.avatarUrl || userData.avatar || '',
            phone: userData.phone, // 当前用户可以看到自己的电话
            wechatId: userData.wechatId || '', // 当前用户可以看到自己的微信号
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
      nickName: userData.nickName || userData.nickname || '微信用户',
      avatarUrl: userData.avatarUrl || userData.avatar || '',
      wechatId: userData.wechatId || '', // 允许查看其他用户的微信号（用于联系）
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
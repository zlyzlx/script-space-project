const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { nickName, avatarUrl } = event
  
  try {
    // 更新用户信息
    const result = await db.collection('users').doc(wxContext.OPENID).update({
      data: {
        nickName: nickName,
        avatarUrl: avatarUrl,
        updateTime: db.serverDate()
      }
    })
    
    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
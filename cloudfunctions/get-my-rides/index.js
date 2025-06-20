const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { page = 1, limit = 20 } = event
  
  try {
    const result = await db.collection('carpools')
      .where({
        'participants.userId': wxContext.OPENID,
        status: db.command.neq('deleted')
      })
      .orderBy('createTime', 'desc')
      .skip((page - 1) * limit)
      .limit(limit)
      .get()
    
    return {
      success: true,
      data: result.data,
      total: result.data.length
    }
  } catch (error) {
    console.error('获取我参与的拼车失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
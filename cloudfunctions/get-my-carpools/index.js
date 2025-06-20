const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { page = 1, limit = 20, status = '' } = event
  
  try {
    let whereCondition = {
      organizerId: wxContext.OPENID
    }
    
    // 如果指定了状态，添加状态过滤
    if (status) {
      whereCondition.status = status
    } else {
      // 默认不包含已删除的
      whereCondition.status = db.command.neq('deleted')
    }
    
    const result = await db.collection('carpools')
      .where(whereCondition)
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
    console.error('获取我的拼车失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
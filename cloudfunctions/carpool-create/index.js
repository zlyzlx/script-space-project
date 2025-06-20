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
      activityName,
      date,
      time,
      location,
      fullAddress,
      maxCount,
      price,
      description,
      requirements,
      notes
    } = event
    
    // 验证必填字段
    if (!activityName || !date || !time || !location || !maxCount || !price) {
      return {
        success: false,
        error: '请填写完整的拼车信息'
      }
    }
    
    // 验证数据有效性
    if (maxCount < 2 || maxCount > 10) {
      return {
        success: false,
        error: '人数限制应在2-10人之间'
      }
    }
    
    if (price <= 0) {
      return {
        success: false,
        error: '费用必须大于0'
      }
    }
    
    // 验证日期不能是过去的日期
    const inputDate = new Date(date + ' ' + time)
    const now = new Date()
    if (inputDate <= now) {
      return {
        success: false,
        error: '活动时间不能是过去的时间'
      }
    }
    
    const currentUserId = wxContext.OPENID
    
    // 检查用户是否存在，如果不存在则创建
    const userResult = await db.collection('users')
      .where({
        _openid: currentUserId
      })
      .get()
    
    if (userResult.data.length === 0) {
      // 创建用户记录
      await db.collection('users').add({
        data: {
          _openid: currentUserId,
          nickname: '用户' + currentUserId.slice(-4),
          avatar: '',
          createTime: new Date(),
          updateTime: new Date()
        }
      })
    }
    
    // 创建拼车记录
    const carpoolData = {
      activityName,
      date,
      time,
      location,
      fullAddress: fullAddress || '',
      maxCount: parseInt(maxCount),
      price: parseFloat(price),
      description: description || '',
      requirements: requirements || '',
      notes: notes || '',
      organizerId: currentUserId,
      status: '招募中',
      publishTime: new Date(),
      updateTime: new Date()
    }
    
    const result = await db.collection('carpools').add({
      data: carpoolData
    })
    
    return {
      success: true,
      data: {
        id: result._id,
        ...carpoolData
      }
    }
    
  } catch (error) {
    console.error('创建拼车失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
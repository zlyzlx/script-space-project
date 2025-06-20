// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { nickname, avatar, phone } = event
  
  try {
    const now = new Date()
    
    // 检查用户是否已存在
    const userResult = await db.collection('users').where({
      _openid: wxContext.OPENID
    }).get()
    
    let result
    if (userResult.data.length > 0) {
      // 更新现有用户信息
      const updateData = {
        updateTime: now
      }
      
      if (nickname !== undefined) updateData.nickname = nickname
      if (avatar !== undefined) updateData.avatar = avatar
      if (phone !== undefined) updateData.phone = phone
      
      result = await db.collection('users').where({
        _openid: wxContext.OPENID
      }).update({
        data: updateData
      })
    } else {
      // 创建新用户记录
      result = await db.collection('users').add({
        data: {
          _openid: wxContext.OPENID,
          nickname: nickname || '',
          avatar: avatar || '',
          phone: phone || '',
          createTime: now,
          updateTime: now
        }
      })
    }
    
    return {
      success: true,
      message: '用户信息更新成功',
      data: result
    }
  } catch (error) {
    console.error('更新用户信息失败：', error)
    return {
      success: false,
      message: '更新用户信息失败',
      error: error.message
    }
  }
} 
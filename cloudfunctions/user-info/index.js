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
    // 查询用户信息
    const userResult = await db.collection('users').where({
      _openid: wxContext.OPENID
    }).get()
    
    let userInfo = null
    if (userResult.data.length > 0) {
      userInfo = userResult.data[0]
    }
    
    // 获取用户统计数据
    const stats = await getUserStats(wxContext.OPENID)
    
    return {
      success: true,
      data: {
        userInfo: userInfo,
        stats: stats
      }
    }
  } catch (error) {
    console.error('获取用户信息失败：', error)
    return {
      success: false,
      message: '获取用户信息失败',
      error: error.message
    }
  }
}

// 获取用户统计数据
async function getUserStats(openid) {
  try {
    // 获取用户发布的拼车数量
    const myCarpoolResult = await db.collection('carpools').where({
      _openid: openid
    }).count()
    
    // 获取用户参与的拼车数量
    const myRidesResult = await db.collection('carpool_participants').where({
      _openid: openid,
      status: 'active'
    }).count()
    
    // 获取用户发布的拼车中的总参与人数
    const carpoolsResult = await db.collection('carpools').where({
      _openid: openid
    }).get()
    
    let totalParticipants = 0
    if (carpoolsResult.data.length > 0) {
      for (const carpool of carpoolsResult.data) {
        const participantsResult = await db.collection('carpool_participants').where({
          carpoolId: carpool._id,
          status: 'active'
        }).count()
        totalParticipants += participantsResult.total
      }
    }
    
    return {
      myCarpoolCount: myCarpoolResult.total,
      myRidesCount: myRidesResult.total,
      totalParticipants: totalParticipants
    }
  } catch (error) {
    console.error('获取用户统计数据失败：', error)
    return {
      myCarpoolCount: 0,
      myRidesCount: 0,
      totalParticipants: 0
    }
  }
} 
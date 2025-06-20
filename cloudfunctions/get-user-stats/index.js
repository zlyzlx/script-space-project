const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    // 获取我发布的拼车数量
    const myCarpoolCount = await db.collection('carpools')
      .where({
        organizerId: wxContext.OPENID,
        status: db.command.neq('deleted')
      })
      .count()

    // 获取我参与的拼车数量
    const myRidesCount = await db.collection('carpools')
      .where({
        'participants.userId': wxContext.OPENID,
        status: db.command.neq('deleted')
      })
      .count()

    // 获取我发布的拼车详情，计算总服务人次
    const myCarpools = await db.collection('carpools')
      .where({
        organizerId: wxContext.OPENID,
        status: db.command.neq('deleted')
      })
      .get()

    let totalParticipants = 0
    if (myCarpools.data) {
      totalParticipants = myCarpools.data.reduce((sum, carpool) => {
        return sum + (carpool.participants ? carpool.participants.length : 0)
      }, 0)
    }

    return {
      success: true,
      data: {
        myCarpoolCount: myCarpoolCount.total || 0,
        myRidesCount: myRidesCount.total || 0,
        totalParticipants: totalParticipants
      }
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
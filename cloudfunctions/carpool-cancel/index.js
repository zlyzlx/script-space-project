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
        error: '拼车ID不能为空'
      }
    }
    
    // 1. 检查拼车是否存在且属于当前用户
    const carpoolResult = await db.collection('carpools')
      .where({
        _id: carpoolId,
        organizerId: wxContext.OPENID
      })
      .get()
    
    if (carpoolResult.data.length === 0) {
      return {
        success: false,
        error: '拼车不存在或您没有权限取消'
      }
    }
    
    const carpool = carpoolResult.data[0]
    
    // 2. 检查是否可以取消（只有招募中的拼车可以取消）
    if (carpool.status !== '招募中') {
      return {
        success: false,
        error: '只有招募中的拼车可以取消'
      }
    }
    
    // 3. 更新拼车状态为已取消
    await db.collection('carpools')
      .doc(carpoolId)
      .update({
        data: {
          status: '已取消',
          updateTime: new Date()
        }
      })
    
    // 4. 删除所有参与者记录
    await db.collection('carpool_participants')
      .where({
        carpoolId: carpoolId
      })
      .remove()
    
    return {
      success: true,
      message: '拼车已取消'
    }
    
  } catch (error) {
    console.error('取消拼车失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
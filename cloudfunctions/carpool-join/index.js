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
        error: '缺少拼车ID参数'
      }
    }
    
    const currentUserId = wxContext.OPENID
    
    // 开始事务
    const transaction = await db.startTransaction()
    
    try {
      // 获取拼车信息
      const carpoolResult = await transaction.collection('carpools')
        .doc(carpoolId)
        .get()
      
      if (!carpoolResult.data) {
        await transaction.rollback()
        return {
          success: false,
          error: '拼车信息不存在'
        }
      }
      
      const carpoolData = carpoolResult.data
      
      // 检查拼车状态
      if (carpoolData.status !== '招募中') {
        await transaction.rollback()
        return {
          success: false,
          error: '该拼车已停止招募'
        }
      }
      
      // 检查是否是组织者
      if (carpoolData.organizerId === currentUserId) {
        await transaction.rollback()
        return {
          success: false,
          error: '不能参与自己发布的拼车'
        }
      }
      
      // 检查是否已经参与
      const existingParticipant = await transaction.collection('carpool_participants')
        .where({
          carpoolId: carpoolId,
          userId: currentUserId,
          status: 'active'
        })
        .get()
      
      if (existingParticipant.data.length > 0) {
        await transaction.rollback()
        return {
          success: false,
          error: '您已经参与了这个拼车'
        }
      }
      
      // 检查当前参与人数
      const currentParticipants = await transaction.collection('carpool_participants')
        .where({
          carpoolId: carpoolId,
          status: 'active'
        })
        .get()
      
      if (currentParticipants.data.length >= carpoolData.maxCount) {
        await transaction.rollback()
        return {
          success: false,
          error: '拼车已满员'
        }
      }
      
      // 添加参与记录
      await transaction.collection('carpool_participants').add({
        data: {
          carpoolId: carpoolId,
          userId: currentUserId,
          status: 'active',
          joinTime: new Date()
        }
      })
      
      // 检查是否满员，如果满员则更新拼车状态
      const newParticipantCount = currentParticipants.data.length + 1
      if (newParticipantCount >= carpoolData.maxCount) {
        await transaction.collection('carpools')
          .doc(carpoolId)
          .update({
            data: {
              status: '已满员',
              updateTime: new Date()
            }
          })
      }
      
      // 提交事务
      await transaction.commit()
      
      return {
        success: true,
        message: '参与成功',
        data: {
          carpoolId,
          currentCount: newParticipantCount,
          status: newParticipantCount >= carpoolData.maxCount ? '已满员' : '招募中'
        }
      }
      
    } catch (error) {
      await transaction.rollback()
      throw error
    }
    
  } catch (error) {
    console.error('参与拼车失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
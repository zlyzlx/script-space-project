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
      
      // 检查是否是组织者
      if (carpoolData.organizerId === currentUserId) {
        await transaction.rollback()
        return {
          success: false,
          error: '组织者不能退出自己的拼车，请取消拼车'
        }
      }
      
      // 检查是否已经参与
      const participantResult = await transaction.collection('carpool_participants')
        .where({
          carpoolId: carpoolId,
          userId: currentUserId,
          status: 'active'
        })
        .get()
      
      if (participantResult.data.length === 0) {
        await transaction.rollback()
        return {
          success: false,
          error: '您没有参与这个拼车'
        }
      }
      
      // 更新参与状态为退出
      await transaction.collection('carpool_participants')
        .where({
          carpoolId: carpoolId,
          userId: currentUserId,
          status: 'active'
        })
        .update({
          data: {
            status: 'quit',
            quitTime: new Date()
          }
        })
      
      // 检查拼车状态，如果之前是满员状态，现在有空位了，改为招募中
      if (carpoolData.status === '已满员') {
        await transaction.collection('carpools')
          .doc(carpoolId)
          .update({
            data: {
              status: '招募中',
              updateTime: new Date()
            }
          })
      }
      
      // 获取当前参与人数
      const currentParticipants = await transaction.collection('carpool_participants')
        .where({
          carpoolId: carpoolId,
          status: 'active'
        })
        .get()
      
      const newParticipantCount = currentParticipants.data.length
      
      // 提交事务
      await transaction.commit()
      
      return {
        success: true,
        message: '退出成功',
        data: {
          carpoolId,
          currentCount: newParticipantCount,
          status: carpoolData.status === '已满员' ? '招募中' : carpoolData.status
        }
      }
      
    } catch (error) {
      await transaction.rollback()
      throw error
    }
    
  } catch (error) {
    console.error('退出拼车失败：', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
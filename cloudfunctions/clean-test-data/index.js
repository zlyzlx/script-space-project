// 清理测试数据云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    console.log('开始清理测试数据...')
    
    // 1. 清理 carpool_participants 集合中的所有数据
    const participantsResult = await db.collection('carpool_participants').get()
    console.log(`找到 ${participantsResult.data.length} 条参与者记录`)
    
    if (participantsResult.data.length > 0) {
      // 批量删除参与者记录
      const deletePromises = participantsResult.data.map(item => 
        db.collection('carpool_participants').doc(item._id).remove()
      )
      await Promise.all(deletePromises)
      console.log(`已删除 ${participantsResult.data.length} 条参与者记录`)
    }
    
    // 2. 重置所有拼车的状态为"招募中"
    const carpoolsResult = await db.collection('carpools').get()
    console.log(`找到 ${carpoolsResult.data.length} 条拼车记录`)
    
    if (carpoolsResult.data.length > 0) {
      const updatePromises = carpoolsResult.data.map(carpool => 
        db.collection('carpools').doc(carpool._id).update({
          data: {
            status: '招募中',
            updateTime: new Date()
          }
        })
      )
      await Promise.all(updatePromises)
      console.log(`已重置 ${carpoolsResult.data.length} 条拼车记录的状态`)
    }
    
    // 3. 检查清理结果
    const finalParticipantsCount = await db.collection('carpool_participants').count()
    const finalCarpoolsResult = await db.collection('carpools')
      .where({
        status: '招募中'
      })
      .count()
    
    return {
      success: true,
      message: '测试数据清理完成',
      details: {
        deletedParticipants: participantsResult.data.length,
        resetCarpools: carpoolsResult.data.length,
        finalParticipantsCount: finalParticipantsCount.total,
        finalRecruitingCarpools: finalCarpoolsResult.total
      }
    }
    
  } catch (error) {
    console.error('清理测试数据失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
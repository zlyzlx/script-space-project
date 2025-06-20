// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  
  try {
    const { 
      carpoolId,
      activityName,
      date,
      time,
      location,
      fullAddress,
      maxCount,
      price,
      description,
      requirements,
      notes,
      status,
      organizerJoins
    } = event
    
    // 验证必需参数
    if (!carpoolId) {
      return {
        success: false,
        error: '拼车ID不能为空'
      }
    }
    
    // 获取拼车信息
    const carpoolResult = await db.collection('carpools').doc(carpoolId).get()
    
    if (!carpoolResult.data) {
      return {
        success: false,
        error: '拼车信息不存在'
      }
    }
    
    const carpool = carpoolResult.data
    
    // 验证权限：只有组织者可以更新
    if (carpool.organizerId !== userId) {
      return {
        success: false,
        error: '只有组织者可以修改拼车信息'
      }
    }
    
    // 构建更新数据
    const updateData = {
      updateTime: new Date()
    }
    
    // 只更新提供的字段
    if (activityName !== undefined) updateData.activityName = activityName
    if (date !== undefined) updateData.date = date
    if (time !== undefined) updateData.time = time
    if (location !== undefined) updateData.location = location
    if (fullAddress !== undefined) updateData.fullAddress = fullAddress
    if (maxCount !== undefined) updateData.maxCount = maxCount
    if (price !== undefined) updateData.price = price
    if (description !== undefined) updateData.description = description
    if (requirements !== undefined) updateData.requirements = requirements
    if (notes !== undefined) updateData.notes = notes
    if (status !== undefined) updateData.status = status
    if (organizerJoins !== undefined) updateData.organizerJoins = organizerJoins
    
    // 处理组织者参与状态的变化
    if (organizerJoins !== undefined && organizerJoins !== carpool.organizerJoins) {
      const organizerParticipantResult = await db.collection('carpool_participants')
        .where({
          carpoolId: carpoolId,
          userId: userId,
          isOrganizer: true
        })
        .get()
      
      if (organizerJoins && organizerParticipantResult.data.length === 0) {
        // 组织者选择参与，但没有参与记录，创建一个
        await db.collection('carpool_participants').add({
          data: {
            carpoolId: carpoolId,
            userId: userId,
            status: 'active',
            joinTime: new Date(),
            isOrganizer: true
          }
        })
      } else if (!organizerJoins && organizerParticipantResult.data.length > 0) {
        // 组织者选择不参与，删除参与记录
        await db.collection('carpool_participants').doc(organizerParticipantResult.data[0]._id).remove()
      }
    }
    
    // 如果更新了最大人数，需要检查当前参与人数
    if (maxCount !== undefined) {
      const participantsResult = await db.collection('carpool_participants')
        .where({
          carpoolId: carpoolId,
          status: 'active'
        })
        .count()
      
      const currentCount = participantsResult.total
      
      if (maxCount < currentCount) {
        return {
          success: false,
          error: `最大人数不能小于当前参与人数(${currentCount})`
        }
      }
      
      // 更新拼车状态
      if (currentCount >= maxCount) {
        updateData.status = '已满员'
      } else if (carpool.status === '已满员') {
        updateData.status = '招募中'
      }
    }
    
    // 执行更新
    await db.collection('carpools').doc(carpoolId).update({
      data: updateData
    })
    
    return {
      success: true,
      message: '更新成功',
      data: {
        carpoolId: carpoolId,
        updateTime: updateData.updateTime
      }
    }
    
  } catch (error) {
    console.error('更新拼车信息失败：', error)
    return {
      success: false,
      error: '更新拼车信息失败，请重试'
    }
  }
} 
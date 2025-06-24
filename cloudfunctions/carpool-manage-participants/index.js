// 拼局参与者管理云函数
const cloud = require('wx-server-sdk')

// 使用当前云环境
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 时间格式化函数
function formatRelativeTime(date) {
  if (!date) return ''
  
  const now = new Date()
  const targetDate = new Date(date)
  const diffMs = now - targetDate
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 30) return `${diffDays}天前`
  
  return targetDate.toLocaleDateString('zh-CN')
}

exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  
  try {
    switch (action) {
      case 'remove_participant':
        return await removeParticipant(data, wxContext)
      case 'get_participants':
        return await getParticipants(data, wxContext)
      case 'contact_participant':
        return await contactParticipant(data, wxContext)
      default:
        return {
          success: false,
          error: '无效的操作类型'
        }
    }
  } catch (error) {
    console.error('参与者管理操作失败:', error)
    return {
      success: false,
      error: error.message || '操作失败'
    }
  }
}

// 踢出参与者
async function removeParticipant(data, wxContext) {
  const { carpoolId, participantUserId, reason } = data
  const currentUserId = wxContext.OPENID
  
  // 首先验证当前用户是否为组织者
  const carpoolResult = await db.collection('carpools')
    .where({
      _id: carpoolId,
      organizerId: currentUserId
    })
    .get()
  
  if (carpoolResult.data.length === 0) {
    return {
      success: false,
      error: '只有组织者可以移除参与者'
    }
  }
  
  const carpool = carpoolResult.data[0]
  
  // 移除参与者
  const removeResult = await db.collection('carpool_participants')
    .where({
      carpoolId: carpoolId,
      userId: participantUserId,
      status: 'joined'
    })
    .update({
      data: {
        status: 'removed_by_organizer',
        removeTime: new Date(),
        removeReason: reason || '组织者移除',
        removedBy: currentUserId
      }
    })
  
  if (removeResult.stats.updated > 0) {
    // 更新拼局人数
    await db.collection('carpools')
      .doc(carpoolId)
      .update({
        data: {
          currentCount: db.command.inc(-1),
          updateTime: new Date()
        }
      })
    
    // 记录操作日志
    await db.collection('carpool_participants').add({
      data: {
        carpoolId: carpoolId,
        userId: currentUserId,
        action: 'remove_participant',
        targetUserId: participantUserId,
        reason: reason,
        timestamp: new Date()
      }
    })
    
    return {
      success: true,
      message: '参与者已移除'
    }
  } else {
    return {
      success: false,
      error: '参与者不存在或已移除'
    }
  }
}

// 获取参与者列表（组织者视角）
async function getParticipants(data, wxContext) {
  const { carpoolId } = data
  const currentUserId = wxContext.OPENID
  
  console.log('获取参与者详情 - 拼局ID:', carpoolId, '用户ID:', currentUserId)
  
  if (!carpoolId) {
    return {
      success: false,
      error: '拼局ID不能为空'
    }
  }
  
  // 验证是否为组织者
  const carpoolResult = await db.collection('carpools')
    .where({
      _id: carpoolId,
      organizerId: currentUserId
    })
    .get()
  
  console.log('拼局查询结果:', carpoolResult.data.length)
  
  if (carpoolResult.data.length === 0) {
    return {
      success: false,
      error: '只有组织者可以查看详细参与者信息'
    }
  }
  
  // 获取参与者详细信息
  const participantsResult = await db.collection('carpool_participants')
    .where({
      carpoolId: carpoolId,
      status: 'joined'
    })
    .get()
  
  console.log('参与者查询结果:', participantsResult.data.length, '个参与者')
  
  // 获取用户详细信息
  const userIds = participantsResult.data.map(p => p.userId)
  console.log('用户ID列表:', userIds)
  
  let usersResult = { data: [] }
  if (userIds.length > 0) {
    usersResult = await db.collection('users')
      .where({
        _openid: db.command.in(userIds)
      })
      .get()
  }
  
  console.log('用户信息查询结果:', usersResult.data.length, '个用户')
  
  // 获取联系记录
  const contactsResult = await db.collection('contact_records')
    .where({
      carpoolId: carpoolId,
      fromUserId: currentUserId,
      status: 'active'
    })
    .get()
    
  console.log('联系记录查询结果:', contactsResult.data.length, '条记录')
  
  // 组合数据
  const participants = participantsResult.data.map(participant => {
    const userInfo = usersResult.data.find(u => u._openid === participant.userId)
    const contactRecord = contactsResult.data.find(c => c.toUserId === participant.userId)
    
    return {
      userId: participant.userId,
      joinTime: formatRelativeTime(participant.joinTime),
      nickname: userInfo?.nickname || '未知用户',
      avatarUrl: userInfo?.avatarUrl || '',
      wechatId: userInfo?.wechatId || '',
      hasContacted: !!contactRecord,
      lastContactTime: contactRecord?.contactTime ? formatRelativeTime(contactRecord.contactTime) : '',
      contactType: contactRecord?.contactType
    }
  })
  
  console.log('最终返回参与者数据:', participants.length, '个参与者')
  console.log('参与者详情:', JSON.stringify(participants, null, 2))
  
  return {
    success: true,
    data: participants
  }
}

// 联系参与者
async function contactParticipant(data, wxContext) {
  const { carpoolId, participantUserId, contactType } = data
  const currentUserId = wxContext.OPENID
  
  // 验证是否为组织者
  const carpoolResult = await db.collection('carpools')
    .where({
      _id: carpoolId,
      organizerId: currentUserId
    })
    .get()
  
  if (carpoolResult.data.length === 0) {
    return {
      success: false,
      error: '只有组织者可以联系参与者'
    }
  }
  
  // 获取参与者信息
  const userResult = await db.collection('users')
    .where({
      _openid: participantUserId
    })
    .get()
  
  if (userResult.data.length === 0) {
    return {
      success: false,
      error: '参与者不存在'
    }
  }
  
  const userInfo = userResult.data[0]
  
  // 创建联系记录
  await db.collection('contact_records').add({
    data: {
      fromUserId: currentUserId,
      toUserId: participantUserId,
      carpoolId: carpoolId,
      contactType: contactType,
      contactInfo: {
        wechatId: userInfo.wechatId,
        nickname: userInfo.nickname
      },
      contactTime: new Date(),
      status: 'active'
    }
  })
  
  return {
    success: true,
    data: {
      wechatId: userInfo.wechatId,
      nickname: userInfo.nickname,
      avatarUrl: userInfo.avatarUrl
    }
  }
} 
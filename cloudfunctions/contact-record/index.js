// 联系记录云函数
const cloud = require('wx-server-sdk')

// 使用当前云环境
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  
  try {
    switch (action) {
      case 'create':
        return await createContactRecord(data, wxContext)
      case 'list':
        return await getContactRecords(data, wxContext)
      case 'update':
        return await updateContactRecord(data, wxContext)
      default:
        return {
          success: false,
          error: '无效的操作类型'
        }
    }
  } catch (error) {
    console.error('联系记录操作失败:', error)
    return {
      success: false,
      error: error.message || '操作失败'
    }
  }
}

// 创建联系记录
async function createContactRecord(data, wxContext) {
  const { contactedUserId, carpoolId, contactType, contactInfo } = data
  const currentUserId = wxContext.OPENID
  
  const record = {
    fromUserId: currentUserId, // 发起联系的用户
    toUserId: contactedUserId, // 被联系的用户
    carpoolId: carpoolId, // 相关的拼局ID
    contactType: contactType, // 联系方式：'qr_code', 'wechat', 'phone'
    contactInfo: contactInfo, // 联系的具体信息
    contactTime: new Date(),
    status: 'active' // active, deleted
  }
  
  const result = await db.collection('contact_records').add({
    data: record
  })
  
  return {
    success: true,
    data: {
      recordId: result._id,
      message: '联系记录创建成功'
    }
  }
}

// 获取联系记录列表
async function getContactRecords(data, wxContext) {
  const { carpoolId, type } = data
  const currentUserId = wxContext.OPENID
  
  let query = db.collection('contact_records')
    .where({
      status: 'active'
    })
  
  // 根据类型筛选
  if (type === 'initiated') {
    // 我发起的联系
    query = query.where({
      fromUserId: currentUserId
    })
  } else if (type === 'received') {
    // 别人联系我的
    query = query.where({
      toUserId: currentUserId
    })
  } else {
    // 与我相关的所有联系
    query = query.where({
      $or: [
        { fromUserId: currentUserId },
        { toUserId: currentUserId }
      ]
    })
  }
  
  // 如果指定了拼局ID
  if (carpoolId) {
    query = query.where({
      carpoolId: carpoolId
    })
  }
  
  const result = await query
    .orderBy('contactTime', 'desc')
    .limit(50)
    .get()
  
  return {
    success: true,
    data: result.data
  }
}

// 更新联系记录状态
async function updateContactRecord(data, wxContext) {
  const { recordId, status } = data
  const currentUserId = wxContext.OPENID
  
  // 只能更新自己发起的联系记录
  const result = await db.collection('contact_records')
    .where({
      _id: recordId,
      fromUserId: currentUserId
    })
    .update({
      data: {
        status: status,
        updateTime: new Date()
      }
    })
  
  return {
    success: true,
    data: {
      updated: result.stats.updated
    }
  }
} 
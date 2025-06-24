const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { userId } = event
  
  try {
    console.log('获取用户二维码 - 用户ID:', userId)
    
    // 查询用户信息（使用 _openid 字段查询而不是文档 ID）
    const userResult = await db.collection('users')
      .where({
        _openid: userId
      })
      .get()
    
    if (!userResult.data || userResult.data.length === 0) {
      console.log('用户不存在:', userId)
      return {
        success: false,
        error: '用户不存在'
      }
    }
    
    const userData = userResult.data[0]
    const userDocId = userData._id
    
    // 检查用户是否已有二维码
    if (userData.wechatQRCode) {
      console.log('用户已有二维码:', userData.wechatQRCode)
      return {
        success: true,
        qrCodeUrl: userData.wechatQRCode,
        userInfo: {
          nickName: userData.nickname || userData.nickName,
          avatarUrl: userData.avatarUrl
        }
      }
    }
    
    // 如果没有二维码，生成一个新的
    try {
      console.log('生成新的二维码 - 用户ID:', userId)
      
      const qrResult = await cloud.openapi.wxacode.getUnlimited({
        scene: userId,
        width: 430,
        autoColor: false,
        lineColor: {
          r: 255,
          g: 107,
          b: 157
        },
        isHyaline: false
      })
      
      // 上传二维码到云存储
      const upload = await cloud.uploadFile({
        cloudPath: `wechat-qr/${userId}-${Date.now()}.png`,
        fileContent: qrResult.buffer,
      })
      
      console.log('二维码上传成功:', upload.fileID)
      
      // 更新用户信息（使用文档ID更新）
      await db.collection('users').doc(userDocId).update({
        data: {
          wechatQRCode: upload.fileID,
          qrCodeUpdateTime: db.serverDate()
        }
      })
      
      return {
        success: true,
        qrCodeUrl: upload.fileID,
        userInfo: {
          nickName: userData.nickname || userData.nickName,
          avatarUrl: userData.avatarUrl
        }
      }
    } catch (qrError) {
      console.error('生成二维码失败:', qrError)
      return {
        success: false,
        error: '生成二维码失败'
      }
    }
  } catch (error) {
    console.error('获取用户二维码失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
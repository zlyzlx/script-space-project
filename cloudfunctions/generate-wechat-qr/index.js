const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    const { scene } = event
    
    // 确保场景值不为空
    const sceneValue = scene || wxContext.OPENID
    if (!sceneValue) {
      throw new Error('场景值不能为空')
    }
    
    console.log('开始生成小程序码，场景值:', sceneValue)
    
    // 生成小程序码，场景值为用户的openid
    const result = await cloud.openapi.wxacode.getUnlimited({
      scene: sceneValue,
      width: 430,
      autoColor: false,
      lineColor: {
        r: 255,
        g: 107,
        b: 157
      },
      isHyaline: false
    })
    
    console.log('小程序码生成成功')
    
    // 检查result是否包含buffer
    if (!result.buffer) {
      throw new Error('生成的小程序码数据为空')
    }
    
    // 将生成的二维码上传到云存储
    const cloudPath = `wechat-qr/${wxContext.OPENID}-${Date.now()}.png`
    console.log('开始上传到云存储:', cloudPath)
    
    const upload = await cloud.uploadFile({
      cloudPath: cloudPath,
      fileContent: result.buffer,
    })
    
    console.log('上传成功:', upload.fileID)
    
    // 将二维码路径保存到用户信息中
    await db.collection('users').doc(wxContext.OPENID).update({
      data: {
        wechatQRCode: upload.fileID,
        qrCodeUpdateTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
    
    console.log('用户信息更新成功')
    
    return {
      success: true,
      fileID: upload.fileID,
      message: '二维码生成成功'
    }
  } catch (error) {
    console.error('生成微信二维码失败:', error)
    
    // 根据错误类型返回不同的错误信息
    let errorMessage = '生成二维码失败'
    if (error.errCode === -604101) {
      errorMessage = '小程序码生成权限未开启，请联系管理员'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.errCode || 'UNKNOWN_ERROR'
    }
  }
} 
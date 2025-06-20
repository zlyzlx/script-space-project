const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    const { scene } = event
    
    // 生成小程序码，场景值为用户的openid
    const result = await cloud.openapi.wxacode.getUnlimited({
      scene: scene || wxContext.OPENID,
      page: 'pages/add-friend/add-friend', // 添加好友页面
      width: 430,
      autoColor: false,
      lineColor: {
        r: 255,
        g: 107,
        b: 157
      },
      isHyaline: false
    })
    
    // 将生成的二维码上传到云存储
    const upload = await cloud.uploadFile({
      cloudPath: `wechat-qr/${wxContext.OPENID}-${Date.now()}.png`,
      fileContent: result.buffer,
    })
    
    // 将二维码路径保存到用户信息中
    await db.collection('users').doc(wxContext.OPENID).update({
      data: {
        wechatQRCode: upload.fileID,
        qrCodeUpdateTime: db.serverDate()
      }
    })
    
    return {
      success: true,
      fileID: upload.fileID
    }
  } catch (error) {
    console.error('生成微信二维码失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
} 
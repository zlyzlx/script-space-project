const app = getApp()

Page({
  data: {
    friendInfo: null,
    loading: false
  },

  onLoad(options) {
    console.log('扫码参数:', options)
    const { scene } = options
    
    if (scene) {
      // 从场景值解析用户openid
      this.setData({ loading: true })
      this.loadFriendInfo(scene)
    } else {
      console.log('未获取到场景值')
      wx.showToast({
        title: '无效的二维码',
        icon: 'none'
      })
    }
  },

  // 加载好友信息
  async loadFriendInfo(openid) {
    try {
      wx.cloud.callFunction({
        name: 'get-user-info',
        data: { openid }
      }).then(res => {
        this.setData({ loading: false })
        
        if (res.result.success) {
          this.setData({
            friendInfo: res.result.data
          })
        } else {
          wx.showToast({
            title: '用户不存在',
            icon: 'none'
          })
        }
      }).catch(err => {
        console.error('获取用户信息失败:', err)
        this.setData({ loading: false })
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      })
    } catch (error) {
      console.error('加载好友信息失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 联系好友
  contactFriend() {
    const { friendInfo } = this.data
    
    if (!friendInfo) return
    
    wx.showModal({
      title: '联系方式',
      content: '由于微信限制，暂时无法直接发送消息。建议您在微信中搜索对方昵称或通过其他方式联系。',
      showCancel: true,
      confirmText: '我知道了',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          // 可以在这里添加复制昵称到剪贴板的功能
          wx.setClipboardData({
            data: friendInfo.nickName,
            success: () => {
              wx.showToast({
                title: '昵称已复制',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  // 查看好友的拼车信息
  viewFriendCarpools() {
    const { friendInfo } = this.data
    
    if (!friendInfo) return
    
    // 跳转到拼车列表页，筛选该用户发布的拼车
    wx.navigateTo({
      url: `/pages/carpool-list/carpool-list?userId=${friendInfo._id}&userName=${friendInfo.nickName}`
    })
  },

  // 返回首页
  goBack() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 分享功能
  onShareAppMessage() {
    const { friendInfo } = this.data
    
    return {
      title: friendInfo ? `${friendInfo.nickName}的拼局信息` : '拼局小程序',
      path: '/pages/index/index',
      imageUrl: friendInfo?.avatarUrl || ''
    }
  },

  onShareTimeline() {
    const { friendInfo } = this.data
    
    return {
      title: friendInfo ? `${friendInfo.nickName}的拼局信息` : '拼局小程序',
      imageUrl: friendInfo?.avatarUrl || ''
    }
  }
}) 
const app = getApp()

Page({
  data: {
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    userInfo: null,
    hasUserInfo: false,
    loading: false
  },

  onLoad() {
    console.log('登录页面加载')
    // 检查是否已经登录
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.nickName && !userInfo.isGuest) {
      console.log('用户已登录，跳转到首页')
      wx.reLaunch({
        url: '/pages/index/index'
      })
    }
  },

  // 获取用户信息（新版本API）
  getUserProfile() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    wx.getUserProfile({
      desc: '用于完善用户资料和提供拼车服务',
      success: (res) => {
        console.log('获取用户信息成功', res)
        const userInfo = res.userInfo
        
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true,
          loading: false
        })
        
        // 保存用户信息到云端
        this.saveUserInfoToCloud(userInfo)
      },
      fail: (err) => {
        console.error('获取用户信息失败', err)
        this.setData({ loading: false })
        wx.showModal({
          title: '授权失败',
          content: '需要微信授权才能使用拼车功能，请重新尝试授权',
          showCancel: false,
          confirmText: '我知道了'
        })
      }
    })
  },

  // 兼容旧版本的getUserInfo
  getUserInfo(e) {
    if (this.data.loading) return
    
    console.log('获取用户信息', e)
    if (e.detail.userInfo) {
      this.setData({ loading: true })
      
      const userInfo = e.detail.userInfo
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true,
        loading: false
      })
      
      // 保存用户信息到云端
      this.saveUserInfoToCloud(userInfo)
    } else {
      wx.showModal({
        title: '授权失败',
        content: '需要微信授权才能使用拼车功能，请同意授权',
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    console.log('选择头像', avatarUrl)
    
    const userInfo = this.data.userInfo || {}
    userInfo.avatarUrl = avatarUrl
    
    this.setData({
      userInfo: userInfo
    })
    
    if (userInfo.nickName) {
      // 保存用户信息到云端
      this.saveUserInfoToCloud(userInfo)
    }
  },

  // 完成登录
  completeLogin() {
    if (this.data.userInfo && this.data.userInfo.nickName) {
      app.onLoginSuccess(this.data.userInfo)
    }
  },

  // 保存用户信息到云端
  async saveUserInfoToCloud(userInfo) {
    try {
      console.log('保存用户信息到云端', userInfo)
      
      // 确保不是游客用户
      userInfo.isGuest = false
      
      // 调用云函数保存用户信息
      const result = await wx.cloud.callFunction({
        name: 'user-update',
        data: {
          userInfo: userInfo
        }
      })
      
      console.log('用户信息保存成功', result)
      
      // 通知app登录成功
      app.onLoginSuccess(userInfo)
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
    } catch (error) {
      console.error('保存用户信息失败', error)
      
      // 即使云端保存失败，也允许本地登录
      userInfo.isGuest = false
      app.onLoginSuccess(userInfo)
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }
  }
}) 
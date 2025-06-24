const app = getApp()
const util = require('../../utils/util')

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    myCarpoolCount: 0,
    myRidesCount: 0,
    totalParticipants: 0,
    lastUpdateTime: '',
    loading: true,
    wechatQRCode: '', // 微信二维码图片路径
    showQRCode: false, // 是否显示二维码
    tempNickname: '', // 临时昵称（未登录状态使用）
    qrCodeGenerated: false, // 二维码是否生成成功
    qrCodeError: '', // 二维码生成错误信息
    wechatId: '', // 用户微信号
    inputWechatId: '', // 输入的微信号
    editingWechatId: false // 是否正在编辑微信号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('个人中心页面加载')
    
    // 初始化页面数据
    this.setData({
      qrCodeGenerated: false,
      qrCodeError: '',
      wechatQRCode: ''
    })
    
    this.initPage()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示时刷新数据
    this.refreshUserData()
  },

  onReady() {
    console.log('我的页面渲染完成')
  },

  // 初始化页面
  async initPage() {
    try {
      this.setData({ loading: true })
      
      // 检查登录状态
      if (!app.globalData.hasLogin) {
        this.requireLogin()
        return
      }
      
      // 加载保存的微信号
      const savedWechatId = wx.getStorageSync('wechatId')
      if (savedWechatId) {
        this.setData({
          wechatId: savedWechatId
        })
        // 延迟生成二维码，确保canvas已渲染
        setTimeout(() => {
          this.generateQRCode(savedWechatId)
        }, 100)
      }
      
      // 检查登录状态
      await this.loadUserProfile()
      
      // 如果已登录，加载统计数据
      if (this.data.hasUserInfo) {
        await this.loadUserStats()
      }
      
    } catch (error) {
      console.error('初始化页面失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 要求登录
  requireLogin() {
    this.setData({ loading: false })
    app.requireAuth(() => {
      this.initPage()
    })
  },

  // 加载用户资料
  async loadUserProfile() {
    try {
      // 先检查全局状态
      const app = getApp()
      if (app.globalData.userInfo && app.globalData.hasLogin) {
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
        return
      }

      // 检查本地存储
      const localUserInfo = wx.getStorageSync('userInfo')
      if (localUserInfo) {
        this.setData({
          userInfo: localUserInfo,
          hasUserInfo: true
        })
        app.globalData.userInfo = localUserInfo
        app.globalData.hasLogin = true
        return
      }

      // 调用云函数获取用户信息
      const result = await wx.cloud.callFunction({
        name: 'get-user-info',
        data: {}
      })

      if (result.result && result.result.success) {
        const userInfo = result.result.data
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
        
        // 更新全局状态和本地存储
        app.globalData.userInfo = userInfo
        app.globalData.hasLogin = true
        wx.setStorageSync('userInfo', userInfo)
      } else {
        // 用户未登录
        this.setData({
          userInfo: null,
          hasUserInfo: false
        })
      }
    } catch (error) {
      console.error('加载用户资料失败:', error)
      this.setData({
        userInfo: null,
        hasUserInfo: false
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('个人页面下拉刷新')
    this.refreshUserData().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 刷新用户数据
  async refreshUserData() {
    try {
      await this.loadUserProfile()
      if (this.data.hasUserInfo) {
        await this.loadUserStats()
      }
    } catch (error) {
      console.error('刷新用户数据失败:', error)
    }
  },

  // 检查用户授权状态
  checkUserAuth() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          this.setData({
            hasUserInfo: true
          })
        }
      }
    })
  },

  // 加载用户信息
  async loadUserInfo() {
    this.setData({ loading: true })
    
    try {
      // 调用云函数获取用户信息
      const result = await wx.cloud.callFunction({
        name: 'get-user-info',
        data: {}
      })
      
      if (result.result.success) {
        const userInfo = result.result.data
        
        this.setData({
          userInfo: userInfo,
          hasUserInfo: !!userInfo,
          wechatId: userInfo.wechatId || '', // 加载微信号
          loading: false
        })
        
        // 更新全局状态
        const app = getApp()
        app.globalData.userInfo = userInfo
        app.globalData.hasLogin = true
        wx.setStorageSync('userInfo', userInfo)
        
      } else {
        console.error('获取用户信息失败：', result.result.message)
        this.setData({ 
          hasUserInfo: false,
          loading: false 
        })
      }
    } catch (error) {
      console.error('加载用户信息失败：', error)
      this.setData({ 
        hasUserInfo: false,
        loading: false 
      })
    }
  },

  // 保存用户信息到云端
  async saveUserInfoToCloud(userInfo) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'update-user-info',
        data: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      })
      
      if (result.result && result.result.success) {
        console.log('用户信息保存成功')
        
        // 更新本地存储和全局状态
        const app = getApp()
        app.globalData.userInfo = userInfo
        wx.setStorageSync('userInfo', userInfo)
        
      } else {
        console.error('保存用户信息失败：', result.result?.message || '未知错误')
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('保存用户信息失败：', error)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    }
  },

  // 获取用户信息（新版API）
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: async (res) => {
        console.log('获取用户信息成功', res)
        const userInfo = res.userInfo
        
        // 如果有临时昵称，使用临时昵称
        if (this.data.tempNickname) {
          userInfo.nickName = this.data.tempNickname
        }
        
        // 确保头像URL正确
        if (!userInfo.avatarUrl || userInfo.avatarUrl === '/images/default-avatar.png') {
          // 如果没有头像，尝试使用微信默认头像
          userInfo.avatarUrl = res.userInfo.avatarUrl || '/images/default-avatar.png'
        }
        
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true,
          tempNickname: '' // 清空临时昵称
        })
        
        const app = getApp()
        app.globalData.userInfo = userInfo
        app.globalData.hasLogin = true
        
        // 保存用户信息到云数据库
        await this.saveUserInfoToCloud(userInfo)
        
        // 立即刷新统计数据
        await this.loadUserStats()
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('获取用户信息失败', err)
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    })
  },

  // 兼容旧版本的getUserInfo
  getUserInfo(e) {
    console.log('获取用户信息', e)
    if (e.detail.userInfo) {
      const userInfo = e.detail.userInfo
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
      app.globalData.userInfo = userInfo
      app.globalData.hasLogin = true
      
      this.saveUserInfoToCloud(userInfo)
      
      // 立即刷新统计数据
      this.loadUserStats()
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }
  },

  // 选择头像
  chooseAvatar(e) {
    const { avatarUrl } = e.detail
    const userInfo = this.data.userInfo || {}
    userInfo.avatarUrl = avatarUrl
    
    this.setData({
      userInfo: userInfo,
      hasUserInfo: true
    })
    
    app.globalData.userInfo = userInfo
    
    // 保存新头像到云端
    this.saveUserInfoToCloud(userInfo)
    
    wx.showToast({
      title: '头像更新成功',
      icon: 'success'
    })
  },

  // 输入昵称
  onNicknameInput(e) {
    const nickname = e.detail.value
    
    if (this.data.hasUserInfo) {
      // 已登录状态：更新用户信息
      const userInfo = this.data.userInfo || {}
      userInfo.nickName = nickname
      
      this.setData({
        userInfo: userInfo
      })
      
      app.globalData.userInfo = userInfo
    } else {
      // 未登录状态：只更新临时昵称
      this.setData({
        tempNickname: nickname
      })
    }
  },

  // 昵称输入完成
  onNicknameBlur() {
    if (this.data.userInfo && this.data.userInfo.nickName) {
      this.saveUserInfoToCloud(this.data.userInfo)
      wx.showToast({
        title: '昵称更新成功',
        icon: 'success'
      })
    }
  },

  // 加载用户统计数据
  async loadUserStats() {
    if (!this.data.hasUserInfo) {
      // 如果未登录，重置统计数据
      this.setData({
        myCarpoolCount: 0,
        myRidesCount: 0,
        totalParticipants: 0,
        lastUpdateTime: '',
        loading: false
      })
      return
    }

    try {
      // 调用云函数获取最新的用户统计数据
      const result = await wx.cloud.callFunction({
        name: 'get-user-stats'
      })
      
      if (result.result && result.result.success) {
        const stats = result.result.data
        this.setData({
          myCarpoolCount: stats.myCarpoolCount || 0,
          myRidesCount: stats.myRidesCount || 0,
          totalParticipants: stats.totalParticipants || 0,
          lastUpdateTime: new Date().toLocaleString()
        })
        console.log('用户统计数据已更新:', stats)
      } else {
        // 如果云函数调用失败，尝试从本地计算
        await this.calculateStatsLocally()
      }
    } catch (error) {
      console.error('加载用户统计数据失败：', error)
      // 如果网络请求失败，尝试从本地计算
      await this.calculateStatsLocally()
    }
  },

  // 本地计算统计数据（备用方案）
  async calculateStatsLocally() {
    try {
      // 获取我发布的拼车数量
      const myCarpoolResult = await wx.cloud.callFunction({
        name: 'get-my-carpools',
        data: {
          page: 1,
          limit: 1000, // 获取所有数据来计算总数
          status: '' // 所有状态
        }
      })
      
      // 获取我参与的拼车数量
      const myRidesResult = await wx.cloud.callFunction({
        name: 'get-my-rides',
        data: {
          page: 1,
          limit: 1000
        }
      })
      
      let myCarpoolCount = 0
      let myRidesCount = 0
      let totalParticipants = 0
      
      if (myCarpoolResult.result && myCarpoolResult.result.success) {
        const carpools = myCarpoolResult.result.data || []
        myCarpoolCount = carpools.length
        // 计算总服务人次（我发布的拼车的参与者总数）
        totalParticipants = carpools.reduce((sum, carpool) => {
          return sum + (carpool.currentCount || 0)
        }, 0)
      }
      
      if (myRidesResult.result && myRidesResult.result.success) {
        myRidesCount = (myRidesResult.result.data || []).length
      }
      
      this.setData({
        myCarpoolCount,
        myRidesCount,
        totalParticipants,
        lastUpdateTime: new Date().toLocaleString()
      })
      
      console.log('本地计算统计数据完成:', { myCarpoolCount, myRidesCount, totalParticipants })
    } catch (error) {
      console.error('本地计算统计数据失败：', error)
      // 如果都失败了，保持当前数据不变
    }
  },

  viewMyCarpool() {
    if (!this.data.hasUserInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/my-carpools/my-carpools'
    })
  },

  viewMyRides() {
    if (!this.data.hasUserInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/my-rides/my-rides'
    })
  },

  // 设置页面
  goToSettings() {
    wx.showActionSheet({
      itemList: ['清除缓存', '意见反馈', '关于我们'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.clearCache()
            break
          case 1:
            this.feedback()
            break
          case 2:
            this.aboutApp()
            break
        }
      }
    })
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除本地缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          // 清除用户信息
          this.setData({
            userInfo: null,
            hasUserInfo: false,
            myCarpoolCount: 0,
            myRidesCount: 0,
            totalParticipants: 0,
            lastUpdateTime: ''
          })
          app.globalData.userInfo = null
          wx.showToast({
            title: '清除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 意见反馈
  feedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有问题或建议，请通过小程序内的客服功能联系我们，或者在小程序评价中留言',
      showCancel: false
    })
  },

  aboutApp() {
    wx.showModal({
      title: '关于我们',
      content: '剧本杀拼局小程序\n\n让剧本杀爱好者更容易找到同行伙伴，一起享受推理的乐趣！\n\n基于微信小程序云开发技术构建\n\n功能包括：\n• 发布和查找拼局信息\n• 参与和管理拼局活动\n• 用户信息管理\n• 行程记录和互动',
      showCancel: false
    })
  },

  // 显示隐私政策
  showPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们非常重视您的隐私保护。本应用仅收集必要的用户信息用于提供拼局服务，包括：\n\n1. 微信昵称和头像（用于身份展示）\n2. 位置信息（仅用于拼局活动地点）\n3. 活动记录（用于统计和服务优化）\n\n我们承诺：\n• 不会泄露您的个人信息\n• 不会将信息用于商业目的\n• 您可随时删除个人数据\n• 严格遵守相关法律法规',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 显示用户协议
  showUserAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '欢迎使用剧本杀拼局小程序！\n\n使用本服务，即表示您同意：\n\n1. 遵守国家法律法规和社会公德\n2. 发布真实有效的拼局信息\n3. 尊重其他用户，文明互动\n4. 不发布违法违规内容\n5. 保护个人和他人信息安全\n\n注意事项：\n• 线下活动请注意人身安全\n• 费用分摊请当面确认\n• 如遇纠纷请理性协商解决\n\n我们保留对违规行为的处理权利。',
      showCancel: false,
      confirmText: '我同意'
    })
  },

  // 获取用户头像URL（含默认头像处理）
  getUserAvatarUrl() {
    if (this.data.userInfo && this.data.userInfo.avatar) {
      return this.data.userInfo.avatar
    }
    if (this.data.userInfo && this.data.userInfo.avatarUrl) {
      return this.data.userInfo.avatarUrl
    }
    
    // 使用工具函数生成默认头像
    const nickname = this.data.userInfo ? (this.data.userInfo.nickname || this.data.userInfo.nickName) : ''
    return util.getDefaultAvatar(nickname)
  },

  // 获取用户昵称
  getUserNickname() {
    if (this.data.userInfo) {
      return this.data.userInfo.nickname || this.data.userInfo.nickName || '未设置昵称'
    }
    // 未登录时显示临时昵称或提示文字
    return this.data.tempNickname || '点击登录'
  },

  // 发布拼车
  publishCarpool() {
    if (!this.data.hasUserInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/publish-carpool/publish-carpool'
    })
  },

  // 搜索拼车
  searchCarpool() {
    wx.switchTab({
      url: '/pages/carpool/list'
    })
  },

  // 检查登录状态
  checkLoginStatus() {
    const app = getApp()
    const userInfo = app.globalData.userInfo
    return userInfo && userInfo.nickName && !userInfo.isGuest
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出当前账号吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          const app = getApp()
          app.globalData.userInfo = null
          app.globalData.hasLogin = false
          
          // 清除本地存储
          wx.removeStorageSync('userInfo')
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
          
          // 跳转到登录页面
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/auth/auth'
            })
          }, 1500)
        }
      }
    })
  },

  // 手动刷新统计数据
  refreshStats() {
    if (!this.data.hasUserInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '刷新中...'
    })
    
    this.loadUserStats().finally(() => {
      wx.hideLoading()
      wx.showToast({
        title: '刷新完成',
        icon: 'success',
        duration: 1500
      })
    })
  },

  // 复制昵称
  copyNickname() {
    const nickname = this.getUserNickname()
    if (nickname) {
      wx.setClipboardData({
        data: nickname,
        success: () => {
          wx.showToast({
            title: '昵称已复制',
            icon: 'success'
          })
        },
        fail: () => {
          wx.showToast({
            title: '复制失败',
            icon: 'none'
          })
        }
      })
    }
  },



  // 保存二维码
  saveQRCode() {
    if (!this.data.wechatQRCode || !this.data.qrCodeGenerated) {
      wx.showToast({
        title: '二维码尚未生成',
        icon: 'none'
      })
      return
    }

    wx.saveImageToPhotosAlbum({
      filePath: this.data.wechatQRCode,
      success: () => {
        wx.showToast({
          title: '已保存到相册',
          icon: 'success'
        })
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '需要相册权限',
            content: '保存二维码需要访问您的相册权限',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting()
              }
            }
          })
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      }
    })
  },

  // 分享名片
  shareProfile() {
    const nickname = this.getUserNickname()
    const avatar = this.getUserAvatarUrl()
    
    return {
      title: `${nickname}的拼局名片`,
      path: '/pages/index/index',
      imageUrl: avatar
    }
  },

  // 显示我的名片
  async showMyQRCode() {
    // 检查是否有昵称（已登录用户或临时昵称）
    const nickname = this.data.hasUserInfo ? 
      (this.data.userInfo.nickName || this.data.userInfo.nickname) : 
      this.data.tempNickname
    
    if (!nickname) {
      wx.showToast({
        title: '请先输入昵称',
        icon: 'none'
      })
      return
    }

    // 显示二维码弹窗
    this.setData({ showQRCode: true })
    
    // 如果已登录，获取真实的微信小程序码
    if (this.data.hasUserInfo && this.data.userInfo._openid) {
      try {
        wx.showLoading({
          title: '生成二维码中...'
        })

        const result = await wx.cloud.callFunction({
          name: 'get-user-qrcode',
          data: {
            userId: this.data.userInfo._openid
          }
        })

        wx.hideLoading()

        if (result.result && result.result.success) {
          this.setData({
            wechatQRCode: result.result.qrCodeUrl,
            qrCodeGenerated: true
          })
        } else {
          throw new Error(result.result?.error || '生成二维码失败')
        }
      } catch (error) {
        wx.hideLoading()
        console.error('生成二维码失败:', error)
        // 如果生成失败，显示提示信息
        this.setData({
          qrCodeGenerated: false,
          qrCodeError: '二维码生成失败，请稍后重试'
        })
      }
    } else {
      // 未登录状态，显示提示
      this.setData({
        qrCodeGenerated: false,
        qrCodeError: '请先完成微信登录后生成二维码'
      })
    }
  },

  // 隐藏二维码
  hideQRCode() {
    this.setData({ showQRCode: false })
  },

  // 输入微信号
  onWechatIdInput(e) {
    this.setData({
      inputWechatId: e.detail.value
    })
  },

  // 保存微信号
  async saveWechatId() {
    const wechatId = this.data.inputWechatId.trim()
    
    if (!wechatId) {
      // 如果输入为空，取消编辑
      this.setData({
        editingWechatId: false,
        inputWechatId: this.data.wechatId
      })
      return
    }

    if (wechatId === this.data.wechatId) {
      // 如果没有改变，取消编辑状态
      this.setData({
        editingWechatId: false
      })
      return
    }

    try {
      wx.showLoading({
        title: '保存中...'
      })

      // 调用云函数更新用户信息
      const result = await wx.cloud.callFunction({
        name: 'update-user-info',
        data: {
          wechatId: wechatId
        }
      })

      wx.hideLoading()

      if (result.result && result.result.success) {
        this.setData({
          wechatId: wechatId,
          editingWechatId: false,
          inputWechatId: ''
        })
        
        wx.showToast({
          title: '微信号已保存',
          icon: 'success'
        })
      } else {
        throw new Error(result.result?.error || '保存失败')
      }
    } catch (error) {
      wx.hideLoading()
      console.error('保存微信号失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 编辑微信号
  editWechatId() {
    this.setData({
      editingWechatId: true,
      inputWechatId: this.data.wechatId
    })
  },


}) 
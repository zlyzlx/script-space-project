const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    recentCarpools: [],
    hotCarpools: [],
    loading: true
  },

  onLoad(options) {
    console.log('首页加载', options)
    
    // 检查是否从二维码扫码进入
    if (options.scene) {
      console.log('从二维码扫码进入，场景值:', options.scene)
      // 跳转到添加好友页面
      wx.navigateTo({
        url: `/pages/add-friend/add-friend?scene=${options.scene}`
      })
      return
    }
    
    // 延迟检查登录状态，确保 app 初始化完成
    setTimeout(() => {
      this.initPage()
    }, 100)
  },

  onShow() {
    console.log('首页显示')
    this.initPage()
  },

  // 初始化页面
  initPage() {
    console.log('初始化页面开始')
    
    // 检查登录状态，但不阻塞页面显示
    const isLoggedIn = this.checkLoginStatus()
    
    if (!isLoggedIn) {
      console.log('用户未登录，显示未登录状态')
      this.setData({ 
        loading: false,
        hasUserInfo: false,
        userInfo: null,
        recentCarpools: [],
        hotCarpools: []
      })
      return;
    }
    
    console.log('用户已登录，开始加载数据')
    // 加载页面数据
    this.loadPageData()
  },

  // 检查登录状态
  checkLoginStatus() {
    try {
      // 直接检查本地存储，避免触发自动跳转
      const userInfo = wx.getStorageSync('userInfo');
      const hasUserInfo = userInfo && userInfo.nickName && !userInfo.isGuest;
      
      if (hasUserInfo) {
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
        // 同步到全局状态
        const app = getApp()
        app.globalData.userInfo = userInfo
        app.globalData.hasLogin = true
      }
      
      return hasUserInfo
    } catch (error) {
      console.error('检查登录状态失败:', error)
      this.setData({ loading: false })
      return false
    }
  },

  // 加载页面数据
  async loadPageData() {
    this.setData({ loading: true })
    
    try {
      console.log('开始并行加载页面数据')
      // 并行加载数据
      const [recentResult, hotResult] = await Promise.all([
        this.loadRecentCarpools(),
        this.loadHotCarpools()
      ])
      
      console.log('页面数据加载完成')
      this.setData({
        recentCarpools: recentResult,
        hotCarpools: hotResult,
        loading: false
      })
      
    } catch (error) {
      console.error('加载页面数据失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 加载最新拼车
  async loadRecentCarpools() {
    try {
      console.log('开始加载最新拼车')
      const result = await wx.cloud.callFunction({
        name: 'carpool-list',
        data: {
          limit: 5,
          orderBy: 'publishTime',
          orderType: 'desc'
        }
      })
      
      console.log('最新拼车加载结果:', result)
      
      if (result.result && result.result.success) {
        return result.result.data || []
      } else {
        console.error('加载最新拼车失败:', result.result)
        return []
      }
    } catch (error) {
      console.error('加载最新拼车失败:', error)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
      return []
    }
  },

  // 加载热门拼车
  async loadHotCarpools() {
    try {
      console.log('开始加载热门拼车')
      const result = await wx.cloud.callFunction({
        name: 'carpool-list',
        data: {
          limit: 5,
          status: '招募中'
        }
      })
      
      console.log('热门拼车加载结果:', result)
      
      if (result.result && result.result.success) {
        return result.result.data || []
      } else {
        console.error('加载热门拼车失败:', result.result)
        return []
      }
    } catch (error) {
      console.error('加载热门拼车失败:', error)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
      return []
    }
  },

  // 跳转到拼车列表
  goToCarpoolList() {
    wx.switchTab({
      url: '/pages/carpool/list'
    })
  },

  // 发布拼车
  goToPublish() {
    app.requireAuth(() => {
      wx.navigateTo({
        url: '/pages/publish-carpool/publish-carpool'
      })
    })
  },

  // 搜索拼车
  goToSearch() {
    app.requireAuth(() => {
      wx.navigateTo({
        url: '/pages/carpool/list'
      })
    })
  },

  // 查看个人中心
  goToProfile() {
    app.requireAuth(() => {
      wx.navigateTo({
        url: '/pages/profile/profile'
      })
    })
  },

  // 查看拼车详情
  viewCarpoolDetail(e) {
    const carpoolId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/carpool-detail/carpool-detail?id=${carpoolId}`
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadPageData().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
}) 
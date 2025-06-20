const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    recentCarpools: [],
    hotCarpools: [],
    loading: true
  },

  onLoad() {
    console.log('首页加载')
    this.checkLoginStatus()
  },

  onShow() {
    console.log('首页显示')
    if (!this.checkLoginStatus()) {
      return;
    }
    
    this.loadRecentCarpools()
  },

  // 检查登录状态
  checkLoginStatus() {
    const hasLogin = app.checkLoginStatus()
    if (!hasLogin) {
      // 未登录，跳转到登录页面
      return false
    }
    
    this.setData({
      userInfo: app.globalData.userInfo,
      hasUserInfo: true
    })
    return true
  },

  // 加载页面数据
  async loadPageData() {
    this.setData({ loading: true })
    
    try {
      // 并行加载数据
      const [recentResult, hotResult] = await Promise.all([
        this.loadRecentCarpools(),
        this.loadHotCarpools()
      ])
      
      this.setData({
        recentCarpools: recentResult,
        hotCarpools: hotResult,
        loading: false
      })
      
    } catch (error) {
      console.error('加载页面数据失败:', error)
      this.setData({ loading: false })
    }
  },

  // 加载最新拼车
  async loadRecentCarpools() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'carpool-list',
        data: {
          limit: 5,
          orderBy: 'publishTime',
          orderType: 'desc'
        }
      })
      
      return result.result.data || []
    } catch (error) {
      console.error('加载最新拼车失败:', error)
      return []
    }
  },

  // 加载热门拼车
  async loadHotCarpools() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'carpool-list',
        data: {
          limit: 5,
          status: '招募中'
        }
      })
      
      return result.result.data || []
    } catch (error) {
      console.error('加载热门拼车失败:', error)
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
    app.requireAuth(() => {
      const carpoolId = e.currentTarget.dataset.id
      wx.navigateTo({
        url: `/pages/carpool-detail/carpool-detail?id=${carpoolId}`
      })
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadPageData().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
}) 
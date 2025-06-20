// pages/carpool/list.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    carpools: [],
    loading: true,
    searchKeyword: '',
    filterStatus: 'all', // all, 招募中, 已满员
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('拼车列表页面加载')
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return; // 未登录会自动跳转到登录页面
    }
    this.loadCarpools()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示时检查登录并刷新数据
    if (!this.checkLoginStatus()) {
      return; // 未登录会自动跳转到登录页面
    }
    this.refreshData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refreshData()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadCarpools()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 加载拼车列表
  async loadCarpools(isRefresh = false) {
    if (this.data.loading && !isRefresh) return
    
    this.setData({ 
      loading: true 
    })

    try {
      // 模拟云函数调用，实际项目中需要替换为真实的云函数
      const result = {
        result: {
          data: this.getMockData()
        }
      }

      let newCarpools = result.result.data || []
      
      // 应用搜索和过滤
      newCarpools = this.applyFilters(newCarpools)
      
      this.setData({
        carpools: isRefresh ? newCarpools : [...this.data.carpools, ...newCarpools],
        loading: false,
        hasMore: newCarpools.length === this.data.pageSize,
        page: isRefresh ? 2 : this.data.page + 1
      })

    } catch (error) {
      console.error('加载拼车列表失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 应用搜索和过滤条件
  applyFilters(carpools) {
    let filteredCarpools = carpools

    // 应用搜索关键词
    if (this.data.searchKeyword.trim()) {
      const keyword = this.data.searchKeyword.trim().toLowerCase()
      filteredCarpools = filteredCarpools.filter(item => 
        item.activityName.toLowerCase().includes(keyword) ||
        item.startLocation.toLowerCase().includes(keyword) ||
        item.endLocation.toLowerCase().includes(keyword)
      )
    }

    // 应用状态过滤
    if (this.data.filterStatus !== 'all') {
      filteredCarpools = filteredCarpools.filter(item => 
        item.status === this.data.filterStatus
      )
    }

    return filteredCarpools
  },

  // 获取模拟数据
  getMockData() {
    return [
      {
        _id: '1',
        activityName: '测试1',
        date: '2025-07-20',
        time: '23:59',
        startLocation: '起点1',
        endLocation: '终点1',
        currentCount: 2,
        maxCount: 4,
        price: 35,
        status: '招募中',
        publisherInfo: {
          avatarUrl: '/images/default-avatar.png',
          nickName: '用户1'
        },
        publishTimeText: '2小时前'
      },
      {
        _id: '2',
        activityName: 'test123',
        date: '2025-06-20',
        time: '23:59',
        startLocation: '起点2',
        endLocation: '终点2',
        currentCount: 4,
        maxCount: 4,
        price: 30,
        status: '已满员',
        publisherInfo: {
          avatarUrl: '/images/default-avatar.png',
          nickName: '用户2'
        },
        publishTimeText: '1天前'
      }
    ]
  },

  // 刷新数据
  refreshData() {
    this.setData({
      carpools: [],
      page: 1,
      hasMore: true
    })
    this.loadCarpools(true)
  },

  // 搜索拼车 - 支持实时搜索
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ searchKeyword: keyword })
    
    // 防抖搜索
    clearTimeout(this.searchTimeout)
    this.searchTimeout = setTimeout(() => {
      this.refreshData()
    }, 500)
  },

  // 执行搜索
  onSearch() {
    // 清除防抖定时器，立即搜索
    clearTimeout(this.searchTimeout)
    this.refreshData()
  },

  // 筛选状态
  onFilterChange(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ filterStatus: status })
    this.refreshData()
  },

  // 查看拼车详情
  viewDetail(e) {
    const carpoolId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/carpool-detail/carpool-detail?id=${carpoolId}`
    })
  },

  // 检查登录状态
  checkLoginStatus() {
    const app = getApp()
    const userInfo = app.globalData.userInfo
    const isLoggedIn = userInfo && userInfo.nickName && !userInfo.isGuest
    
    if (!isLoggedIn) {
      wx.showModal({
        title: '需要登录',
        content: '此功能需要微信授权登录才能使用',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/auth/auth'
            })
          } else {
            wx.navigateBack()
          }
        }
      })
      return false
    }
    return true
  },

  // 参与拼车
  async joinCarpool(e) {
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return;
    }
    
    const carpoolId = e.currentTarget.dataset.id
    
    wx.showLoading({ title: '加入中...' })

    try {
      await wx.cloud.callFunction({
        name: 'carpool-join',
        data: { carpoolId }
      })

      wx.hideLoading()
      wx.showToast({
        title: '加入成功',
        icon: 'success'
      })

      // 刷新列表
      this.refreshData()

    } catch (error) {
      wx.hideLoading()
      console.error('加入拼车失败:', error)
      wx.showToast({
        title: error.message || '加入失败',
        icon: 'none'
      })
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡，防止触发上级的点击事件
  }
})
// pages/carpool/list.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchKeyword: '',
    filterStatus: 'all',
    carpools: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('拼车列表页面加载')
    this.loadCarpools(true)
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
    console.log('拼车列表页面显示')
    // 从其他页面返回时刷新数据
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
    console.log('下拉刷新')
    this.refreshData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    console.log('上拉加载更多')
    this.loadMoreCarpools()
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
      // 从云函数获取真实数据
      const result = await wx.cloud.callFunction({
        name: 'carpool-list',
        data: {
          page: this.data.page,
          limit: this.data.pageSize,
          searchText: this.data.searchKeyword,
          statusFilter: this.data.filterStatus === 'all' ? '' : this.data.filterStatus
        }
      })

      if (result.result.success) {
        let newCarpools = result.result.data || []
        
        this.setData({
          carpools: isRefresh ? newCarpools : [...this.data.carpools, ...newCarpools],
          loading: false,
          hasMore: result.result.hasMore,
          page: isRefresh ? 2 : this.data.page + 1
        })
        
        if (isRefresh) {
          wx.stopPullDownRefresh()
        }
      } else {
        throw new Error(result.result.error)
      }

    } catch (error) {
      console.error('加载拼车列表失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
      wx.stopPullDownRefresh()
    }
  },

  // 加载更多拼车
  async loadMoreCarpools() {
    if (!this.data.hasMore || this.data.loading) return
    
    await this.loadCarpools(false)
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
      const result = await wx.cloud.callFunction({
        name: 'carpool-join',
        data: { carpoolId }
      })

      wx.hideLoading()
      
      if (result.result.success) {
        wx.showToast({
          title: '加入成功',
          icon: 'success'
        })

        // 刷新列表
        setTimeout(() => {
          this.refreshData()
        }, 1000)
      } else {
        wx.showToast({
          title: result.result.error || '加入失败',
          icon: 'none'
        })
      }

    } catch (error) {
      wx.hideLoading()
      console.error('加入拼车失败:', error)
      wx.showToast({
        title: error.message || '加入失败',
        icon: 'none'
      })
    }
  },

  // 阻止冒泡
  stopPropagation() {
    // 阻止事件冒泡
  }
})
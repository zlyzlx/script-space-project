Page({

  /**
   * 页面的初始数据
   */
  data: {
    carpoolList: [],
    loading: false,
    page: 1,
    limit: 10,
    hasMore: true,
    total: 0,
    recruitingCount: 0,
    totalParticipants: 0,
    statusFilter: '' // 状态筛选：'', '招募中', '已满员', '已完成', '已取消'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('我的拼车页面加载')
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return; // 未登录会自动跳转到登录页面
    }
    this.loadMyCarpools()
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
    this.loadMyCarpools()
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
      this.loadMoreCarpools()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '我的拼车发布',
      path: '/pages/my-carpools/my-carpools'
    }
  },

  async loadMyCarpools() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'user-carpools',
        data: {
          page: this.data.page,
          limit: this.data.limit,
          status: this.data.statusFilter
        }
      })
      
      if (result.result.success) {
        const { data, total, hasMore } = result.result
        const allCarpools = this.data.page === 1 ? data : [...this.data.carpoolList, ...data]
        
        // 计算统计数据
        const recruitingCount = allCarpools.filter(item => item.status === '招募中').length
        const totalParticipants = allCarpools.reduce((sum, item) => sum + (item.currentCount || 0), 0)
        
        this.setData({
          carpoolList: allCarpools,
          total,
          hasMore,
          recruitingCount,
          totalParticipants,
          loading: false
        })
      } else {
        throw new Error(result.result.error)
      }
    } catch (error) {
      console.error('获取我的拼车失败：', error)
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  refreshData() {
    this.setData({
      page: 1,
      carpoolList: [],
      hasMore: true
    })
    this.loadMyCarpools()
  },

  loadMoreCarpools() {
    this.setData({
      page: this.data.page + 1
    })
    this.loadMyCarpools()
  },

  onStatusFilterChange(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      statusFilter: status
    })
    this.refreshData()
  },

  viewCarpoolDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/carpool-detail/carpool-detail?id=${id}`
    })
  },

  editCarpool(e) {
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return;
    }
    
    const carpoolId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/publish-carpool/publish-carpool?mode=edit&id=${carpoolId}`
    })
  },

  async cancelCarpool(e) {
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return;
    }
    
    const carpoolId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个拼车吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中...' })
          
          try {
            const result = await wx.cloud.callFunction({
              name: 'carpool-cancel',
              data: { carpoolId }
            })

            wx.hideLoading()
            
            if (result.result.success) {
              wx.showToast({
                title: '取消成功',
                icon: 'success'
              })
              
              // 刷新列表
              this.loadMyCarpools()
            } else {
              throw new Error(result.result.message || '取消失败')
            }

          } catch (error) {
            wx.hideLoading()
            console.error('取消拼车失败:', error)
            wx.showToast({
              title: error.message || '取消失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  shareCarpool(e) {
    const id = e.currentTarget.dataset.id
    const carpool = this.data.carpoolList.find(item => item.id === id)
    
    return {
      title: `${carpool.activityName} - 拼车信息`,
      path: `/pages/carpool-detail/carpool-detail?id=${id}`,
      imageUrl: ''
    }
  },

  viewParticipants(e) {
    const id = e.currentTarget.dataset.id
    const carpool = this.data.carpoolList.find(item => item.id === id)
    
    if (carpool.participants && carpool.participants.length > 0) {
      const participantNames = carpool.participants.map(p => p.nickname).join('、')
      wx.showModal({
        title: '参与者列表',
        content: `当前参与者：${participantNames}`,
        showCancel: false,
        confirmText: '知道了'
      })
    } else {
      wx.showToast({
        title: '暂无参与者',
        icon: 'none'
      })
    }
  },

  publishNewCarpool() {
    wx.navigateTo({
      url: '/pages/publish-carpool/publish-carpool'
    })
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡，用于按钮点击时不触发父级的点击事件
  },

  // 检查登录状态
  checkLoginStatus() {
    const app = getApp()
    const userInfo = app.globalData.userInfo
    const isLoggedIn = userInfo && userInfo.nickName && !userInfo.isGuest
    
    if (!isLoggedIn) {
      wx.showModal({
        title: '需要登录',
        content: '查看我的拼车需要微信授权登录',
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
  }
}) 
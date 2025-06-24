const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    ridesList: [],
    loading: false,
    page: 1,
    limit: 10,
    hasMore: true,
    total: 0,
    statusFilter: '' // 状态筛选：'', '即将开始', '已完成', '已取消'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态
    if (!app.globalData.hasLogin) {
      this.requireLogin()
      return
    }
    this.loadMyRides()
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
    // 检查登录状态
    if (!app.globalData.hasLogin) {
      this.requireLogin()
      return
    }
    // 页面显示时刷新数据
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
      this.loadMoreRides()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '我的拼局行程',
      path: '/pages/my-rides/my-rides'
    }
  },

  async loadMyRides() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'user-rides',
        data: {
          page: this.data.page,
          limit: this.data.limit,
          status: this.data.statusFilter
        }
      })
      
      if (result.result.success) {
        const { data, total, hasMore } = result.result
        
        this.setData({
          ridesList: this.data.page === 1 ? data : [...this.data.ridesList, ...data],
          total,
          hasMore,
          loading: false
        })
      } else {
        throw new Error(result.result.error)
      }
    } catch (error) {
      console.error('获取我的行程失败：', error)
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
      ridesList: [],
      hasMore: true
    })
    this.loadMyRides()
  },

  loadMoreRides() {
    this.setData({
      page: this.data.page + 1
    })
    this.loadMyRides()
  },

  onStatusFilterChange(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      statusFilter: status
    })
    this.refreshData()
  },

  contactOrganizer(e) {
    const id = e.currentTarget.dataset.id
    const ride = this.data.ridesList.find(item => item.id === id)
    
    wx.showActionSheet({
      itemList: ['发送消息', '拨打电话'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 发送消息
          wx.showModal({
            title: '发送消息',
            content: '消息功能开发中，请直接联系组织者',
            showCancel: false
          })
        } else if (res.tapIndex === 1) {
          // 拨打电话
          if (ride.organizer && ride.organizer.phone) {
            wx.makePhoneCall({
              phoneNumber: ride.organizer.phone
            })
          } else {
            wx.showToast({
              title: '暂无联系电话',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  quitRide(e) {
    const id = e.currentTarget.dataset.id
    const ride = this.data.ridesList.find(item => item.id === id)
    
    wx.showModal({
      title: '确认退出',
              content: `确定要退出"${ride.activityName}"的拼局吗？`,
      confirmText: '确认退出',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          this.doQuitRide(id)
        }
      }
    })
  },

  async doQuitRide(id) {
    wx.showLoading({
      title: '正在退出...'
    })

    try {
      const result = await wx.cloud.callFunction({
        name: 'carpool-quit',
        data: {
          carpoolId: id
        }
      })
      
      wx.hideLoading()
      
      if (result.result.success) {
        wx.showToast({
          title: '退出成功',
          icon: 'success'
        })
        
        // 刷新列表
        setTimeout(() => {
          this.refreshData()
        }, 1000)
      } else {
        wx.showToast({
          title: result.result.error || '退出失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('退出拼车失败：', error)
      wx.showToast({
        title: '退出失败，请重试',
        icon: 'none'
      })
    }
  },

  rateRide(e) {
    const id = e.currentTarget.dataset.id
    const ride = this.data.ridesList.find(item => item.id === id)
    
    wx.showModal({
              title: '评价拼局',
        content: '请为这次拼局体验打分（1-5分）',
      editable: true,
      placeholderText: '请输入1-5的数字',
      success: (res) => {
        if (res.confirm) {
          const rating = parseInt(res.content)
          if (rating >= 1 && rating <= 5) {
            this.doRateRide(id, rating)
          } else {
            wx.showToast({
              title: '请输入1-5的数字',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  async doRateRide(id, rating) {
    wx.showLoading({
      title: '正在评价...'
    })

    try {
      // 这里可以调用评价云函数，目前先用本地更新
      setTimeout(() => {
        wx.hideLoading()
        
        const updatedList = this.data.ridesList.map(item => {
          if (item.id === id) {
            return {
              ...item,
              hasRated: true,
              myRating: rating
            }
          }
          return item
        })
        
        this.setData({
          ridesList: updatedList
        })
        
        wx.showToast({
          title: '评价成功',
          icon: 'success'
        })
      }, 1000)
    } catch (error) {
      wx.hideLoading()
      console.error('评价失败：', error)
      wx.showToast({
        title: '评价失败，请重试',
        icon: 'none'
      })
    }
  },

  viewRideDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/carpool-detail/carpool-detail?id=${id}`
    })
  },

  // 要求登录
  requireLogin() {
    app.requireAuth(() => {
      this.loadMyRides()
    })
  }
}) 
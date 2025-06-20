Page({
  data: {
    searchText: '',
    dateFilter: '',
    statusFilter: '',
    carpoolList: [],
    originalList: [],
    loading: false,
    page: 1,
    hasMore: true
  },

  onLoad() {
    console.log('拼车页面加载')
    this.loadCarpoolList()
  },

  onShow() {
    console.log('拼车页面显示')
    // 刷新数据
    this.refreshData()
  },

  onPullDownRefresh() {
    console.log('下拉刷新')
    this.refreshData()
  },

  onReachBottom() {
    console.log('上拉加载更多')
    this.loadMoreCarpool()
  },

  refreshData() {
    this.setData({
      page: 1,
      hasMore: true,
      carpoolList: []
    })
    this.loadCarpoolList()
  },

  async loadCarpoolList() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'carpool-list',
        data: {
          page: this.data.page,
          limit: 10,
          searchText: this.data.searchText,
          dateFilter: this.data.dateFilter,
          statusFilter: this.data.statusFilter
        }
      })
      
      if (result.result.success) {
        const newList = this.data.page === 1 ? 
          result.result.data : 
          [...this.data.carpoolList, ...result.result.data]
        
        this.setData({
          carpoolList: newList,
          originalList: newList,
          hasMore: result.result.hasMore,
          loading: false
        })
        
        if (this.data.page === 1) {
          wx.stopPullDownRefresh()
        }
      } else {
        throw new Error(result.result.error)
      }
    } catch (error) {
      console.error('加载拼车列表失败：', error)
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  async loadMoreCarpool() {
    if (!this.data.hasMore || this.data.loading) return
    
    this.setData({
      page: this.data.page + 1
    })
    
    await this.loadCarpoolList()
  },

  onSearchInput(e) {
    this.setData({
      searchText: e.detail.value
    })
  },

  onSearch() {
    this.refreshData()
  },

  filterByDate(e) {
    const date = e.currentTarget.dataset.date
    const currentFilter = this.data.dateFilter
    
    if (currentFilter === date) {
      // 取消筛选
      this.setData({
        dateFilter: ''
      })
    } else {
      this.setData({
        dateFilter: date
      })
    }
    
    this.refreshData()
  },

  filterByStatus(e) {
    const status = e.currentTarget.dataset.status
    const currentFilter = this.data.statusFilter
    
    if (currentFilter === status) {
      // 取消筛选
      this.setData({
        statusFilter: ''
      })
    } else {
      this.setData({
        statusFilter: status
      })
    }
    
    this.refreshData()
  },

  publishCarpool() {
    wx.navigateTo({
      url: '/pages/publish-carpool/publish-carpool'
    })
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/carpool-detail/carpool-detail?id=${id}`
    })
  }
}) 
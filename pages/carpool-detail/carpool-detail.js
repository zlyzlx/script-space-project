// pages/carpool-detail/carpool-detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    carpoolId: null,
    carpoolDetail: null,
    isParticipant: false,
    isOrganizer: false,
    loading: true,
    organizerQRCode: '', // 组织者微信二维码
    showOrganizerQR: false // 是否显示组织者二维码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const id = options.id
    if (id) {
      this.setData({
        carpoolId: id
      })
      this.loadCarpoolDetail(id)
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
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
    this.loadCarpoolDetail(this.data.carpoolId)
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return this.shareCarpool()
  },

  async loadCarpoolDetail(id) {
    this.setData({ loading: true })
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'carpool-detail',
        data: {
          carpoolId: id
        }
      })
      
      if (result.result.success) {
        const carpoolData = result.result.data
        
        this.setData({
          carpoolDetail: carpoolData,
          isParticipant: carpoolData.isParticipant,
          isOrganizer: carpoolData.isOrganizer,
          loading: false
        })
      } else {
        throw new Error(result.result.error)
      }
    } catch (error) {
      console.error('获取拼车详情失败：', error)
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
      
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
    }
  },

  joinCarpool() {
    if (this.data.isParticipant) {
      wx.showToast({
        title: '您已参与此拼车',
        icon: 'none'
      })
      return
    }

    const { carpoolDetail } = this.data
    if (carpoolDetail.currentCount >= carpoolDetail.maxCount) {
      wx.showToast({
        title: '拼车已满员',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认参与',
      content: `确定要参与这个拼车吗？费用：¥${carpoolDetail.price}/人`,
      confirmText: '确认参与',
      confirmColor: '#4ECDC4',
      success: (res) => {
        if (res.confirm) {
          this.doJoinCarpool()
        }
      }
    })
  },

  async doJoinCarpool() {
    wx.showLoading({
      title: '正在参与...'
    })

    try {
      const result = await wx.cloud.callFunction({
        name: 'carpool-join',
        data: {
          carpoolId: this.data.carpoolId
        }
      })
      
      wx.hideLoading()
      
      if (result.result.success) {
        wx.showToast({
          title: '参与成功！',
          icon: 'success'
        })
        
        // 重新加载详情
        setTimeout(() => {
          this.loadCarpoolDetail(this.data.carpoolId)
        }, 1000)
      } else {
        wx.showToast({
          title: result.result.error || '参与失败',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.hideLoading()
      console.error('参与拼车失败：', error)
      wx.showToast({
        title: '参与失败，请重试',
        icon: 'none'
      })
    }
  },

  quitCarpool() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出这个拼车吗？',
      confirmText: '确认退出',
      confirmColor: '#FF6B6B',
      success: (res) => {
        if (res.confirm) {
          this.doQuitCarpool()
        }
      }
    })
  },

  async doQuitCarpool() {
    wx.showLoading({
      title: '正在退出...'
    })

    try {
      const result = await wx.cloud.callFunction({
        name: 'carpool-quit',
        data: {
          carpoolId: this.data.carpoolId
        }
      })
      
      wx.hideLoading()
      
      if (result.result.success) {
        wx.showToast({
          title: '退出成功',
          icon: 'success'
        })
        
        // 重新加载详情
        setTimeout(() => {
          this.loadCarpoolDetail(this.data.carpoolId)
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

  contactOrganizer() {
    const { carpoolDetail } = this.data
    wx.showActionSheet({
      itemList: ['查看微信二维码', '发送消息', '拨打电话'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 查看微信二维码
          this.showOrganizerQRCode()
        } else if (res.tapIndex === 1) {
          // 发送消息
          wx.showModal({
            title: '发送消息',
            content: '消息功能开发中，请使用微信二维码添加好友后直接聊天',
            showCancel: false
          })
        } else if (res.tapIndex === 2) {
          // 拨打电话
          if (carpoolDetail.organizer.phone) {
            wx.makePhoneCall({
              phoneNumber: carpoolDetail.organizer.phone
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

  // 显示组织者微信二维码
  async showOrganizerQRCode() {
    const { carpoolDetail } = this.data
    
    try {
      wx.showLoading({
        title: '获取中...'
      })

      // 调用云函数获取组织者的微信二维码
      const result = await wx.cloud.callFunction({
        name: 'get-user-qrcode',
        data: {
          userId: carpoolDetail.organizer.id
        }
      })

      wx.hideLoading()

      if (result.result && result.result.success) {
        // 显示二维码弹窗
        this.setData({
          organizerQRCode: result.result.qrCodeUrl,
          showOrganizerQR: true
        })
      } else {
        throw new Error(result.result?.error || '获取二维码失败')
      }
    } catch (error) {
      wx.hideLoading()
      console.error('获取组织者二维码失败:', error)
      wx.showModal({
        title: '提示',
        content: '组织者暂未设置微信二维码，请尝试其他联系方式',
        showCancel: false
      })
    }
  },

  // 隐藏组织者二维码
  hideOrganizerQR() {
    this.setData({ 
      showOrganizerQR: false,
      organizerQRCode: ''
    })
  },

  // 保存组织者二维码到相册
  saveOrganizerQRToAlbum() {
    if (!this.data.organizerQRCode) {
      wx.showToast({
        title: '二维码不存在',
        icon: 'none'
      })
      return
    }

    wx.saveImageToPhotosAlbum({
      filePath: this.data.organizerQRCode,
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

  shareCarpool() {
    return {
      title: `${this.data.carpoolDetail.activityName} - 拼车信息`,
      path: `/pages/carpool-detail/carpool-detail?id=${this.data.carpoolId}`,
      imageUrl: ''
    }
  },

  showLocation() {
    const { carpoolDetail } = this.data
    wx.openLocation({
      latitude: 39.9042,
      longitude: 116.4074,
      name: carpoolDetail.location,
      address: carpoolDetail.fullAddress || carpoolDetail.location
    })
  }
})
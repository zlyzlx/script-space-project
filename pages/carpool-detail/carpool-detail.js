// pages/carpool-detail/carpool-detail.js
const { formatFriendlyTime, formatRelativeTime, processAvatarUrl } = require('../../utils/util')
const app = getApp()

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
    organizerWechatId: '', // 组织者微信号
    showOrganizerQR: false, // 是否显示组织者联系方式弹窗
    showParticipantManagement: false, // 是否显示参与者管理弹窗
    detailedParticipants: [], // 详细参与者信息
    showParticipantQR: false, // 是否显示参与者联系方式弹窗
    selectedParticipant: null // 当前选中的参与者
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
        
        // 格式化时间显示
        if (carpoolData.publishTime) {
          carpoolData.publishTime = formatRelativeTime(carpoolData.publishTime)
        }
        if (carpoolData.departureTime) {
          carpoolData.departureTime = formatFriendlyTime(carpoolData.departureTime)
        }
        
        // 处理组织者头像
        if (carpoolData.organizer) {
          carpoolData.organizer.avatar = processAvatarUrl(
            carpoolData.organizer.avatar, 
            carpoolData.organizer.nickname
          )
        }
        
        // 处理参与者头像和时间
        if (carpoolData.participants) {
          carpoolData.participants = carpoolData.participants.map(participant => ({
            ...participant,
            avatar: processAvatarUrl(participant.avatar, participant.nickname),
            joinTime: participant.joinTime ? formatRelativeTime(participant.joinTime) : ''
          }))
        }
        
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
    // 检查登录状态
    if (!app.globalData.hasLogin) {
      app.requireAuth(() => {
        this.joinCarpool()
      })
      return
    }

    if (this.data.isParticipant) {
      wx.showToast({
        title: '您已参与此拼局',
        icon: 'none'
      })
      return
    }

    const { carpoolDetail } = this.data
    if (carpoolDetail.currentCount >= carpoolDetail.maxCount) {
      wx.showToast({
        title: '拼局已满员',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认参与',
              content: `确定要参与这个拼局吗？AA费用：¥${carpoolDetail.price}/人`,
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
    // 检查登录状态
    if (!app.globalData.hasLogin) {
      app.requireAuth(() => {
        this.quitCarpool()
      })
      return
    }

    wx.showModal({
      title: '确认退出',
              content: '确定要退出这个拼局吗？',
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

  // 显示组织者联系方式
  async showOrganizerQRCode() {
    const { carpoolDetail } = this.data
    
    try {
      wx.showLoading({
        title: '获取联系方式...'
      })

      // 调用云函数获取组织者的用户信息（包含微信号）
      const result = await wx.cloud.callFunction({
        name: 'get-user-info',
        data: {
          openid: carpoolDetail.organizer.id
        }
      })

      wx.hideLoading()

      if (result.result && result.result.success) {
        // 记录联系记录
        await this.createContactRecord(carpoolDetail.organizer.id, 'view_contact', {
          organizerInfo: carpoolDetail.organizer
        })

        // 显示联系方式弹窗
        this.setData({
          organizerWechatId: result.result.data.wechatId || '',
          showOrganizerQR: true
        })
      } else {
        throw new Error(result.result?.error || '获取联系方式失败')
      }
    } catch (error) {
      wx.hideLoading()
      console.error('获取组织者联系方式失败:', error)
      
      // 即使获取失败也显示弹窗，但不显示微信号
      this.setData({
        organizerWechatId: '',
        showOrganizerQR: true
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

  // 复制组织者微信号
  copyOrganizerWechat() {
    if (!this.data.organizerWechatId) {
      wx.showToast({
        title: '微信号不存在',
        icon: 'none'
      })
      return
    }

    wx.setClipboardData({
      data: this.data.organizerWechatId,
      success: () => {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success'
        })
        
        // 记录复制联系方式的行为
        this.createContactRecord(this.data.carpoolDetail.organizer.id, 'copy_wechat', {
          wechatId: this.data.organizerWechatId
        })
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        })
      }
    })
  },

  // 发送消息给组织者
  sendMessageToOrganizer() {
    wx.showModal({
      title: '发送消息',
      content: '由于微信限制，暂时无法直接发送消息。建议复制微信号到微信中搜索添加好友。',
      confirmText: '复制微信号',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm && this.data.organizerWechatId) {
          this.copyOrganizerWechat()
        }
      }
    })
  },

  // ==================== 参与者管理功能 ====================

  // 显示参与者管理弹窗
  async showParticipantManagement() {
    if (!this.data.isOrganizer) {
      wx.showToast({
        title: '只有组织者可以管理参与者',
        icon: 'none'
      })
      return
    }

    // 检查拼局ID是否存在
    if (!this.data.carpoolId) {
      console.error('拼局ID不存在:', this.data.carpoolId)
      wx.showToast({
        title: '拼局信息异常',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '加载中...' })
      
      console.log('调用参与者管理云函数，拼局ID:', this.data.carpoolId)
      
      const result = await wx.cloud.callFunction({
        name: 'carpool-manage-participants',
        data: {
          action: 'get_participants',
          data: {
            carpoolId: this.data.carpoolId
          }
        }
      })

      wx.hideLoading()

      console.log('云函数返回结果:', result)

      if (result.result && result.result.success) {
        this.setData({
          detailedParticipants: result.result.data || [],
          showParticipantManagement: true
        })
      } else {
        throw new Error(result.result?.error || '获取参与者信息失败')
      }
    } catch (error) {
      wx.hideLoading()
      console.error('获取参与者详情失败:', error)
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
    }
  },

  // 隐藏参与者管理弹窗
  hideParticipantManagement() {
    this.setData({ 
      showParticipantManagement: false,
      detailedParticipants: []
    })
  },

  // 联系参与者（简单版）
  async contactParticipant(e) {
    const { userId, nickname } = e.currentTarget.dataset
    await this.contactParticipantAction(userId, nickname)
  },

  // 联系参与者（详细版）
  async contactParticipantDetailed(e) {
    const { userId, nickname } = e.currentTarget.dataset
    await this.contactParticipantAction(userId, nickname)
  },

  // 联系参与者的实际操作
  async contactParticipantAction(userId, nickname) {
    try {
      wx.showLoading({ title: '获取联系方式...' })

      const result = await wx.cloud.callFunction({
        name: 'carpool-manage-participants',
        data: {
          action: 'contact_participant',
          data: {
            carpoolId: this.data.carpoolId,
            participantUserId: userId,
            contactType: 'wechat'
          }
        }
      })

      wx.hideLoading()

      if (result.result.success) {
        const participantData = result.result.data
        
        // 记录联系记录
        await this.createContactRecord(userId, 'wechat', {
          wechatId: participantData.wechatId,
          nickname: participantData.nickname
        })

        // 显示联系方式弹窗
        this.setData({
          selectedParticipant: participantData,
          showParticipantQR: true
        })

        // 刷新参与者管理列表
        if (this.data.showParticipantManagement) {
          this.showParticipantManagement()
        }
      } else {
        throw new Error(result.result.error)
      }
    } catch (error) {
      wx.hideLoading()
      console.error('获取参与者联系方式失败:', error)
      wx.showToast({
        title: '获取失败',
        icon: 'none'
      })
    }
  },

  // 移除参与者（简单版）
  async removeParticipant(e) {
    const { userId, nickname } = e.currentTarget.dataset
    await this.removeParticipantAction(userId, nickname)
  },

  // 移除参与者（详细版）
  async removeParticipantDetailed(e) {
    const { userId, nickname } = e.currentTarget.dataset
    await this.removeParticipantAction(userId, nickname)
  },

  // 移除参与者的实际操作
  async removeParticipantAction(userId, nickname) {
    wx.showModal({
      title: '确认移除',
      content: `确定要移除参与者"${nickname}"吗？移除后TA将无法继续参与此拼局。`,
      confirmText: '确认移除',
      confirmColor: '#FF6B6B',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '移除中...' })

            const result = await wx.cloud.callFunction({
              name: 'carpool-manage-participants',
              data: {
                action: 'remove_participant',
                data: {
                  carpoolId: this.data.carpoolId,
                  participantUserId: userId,
                  reason: '组织者移除'
                }
              }
            })

            wx.hideLoading()

            if (result.result.success) {
              wx.showToast({
                title: '已移除参与者',
                icon: 'success'
              })

              // 刷新拼局详情
              this.loadCarpoolDetail(this.data.carpoolId)

              // 刷新参与者管理列表
              if (this.data.showParticipantManagement) {
                this.showParticipantManagement()
              }
            } else {
              throw new Error(result.result.error)
            }
          } catch (error) {
            wx.hideLoading()
            console.error('移除参与者失败:', error)
            wx.showToast({
              title: '移除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 隐藏参与者联系方式弹窗
  hideParticipantQR() {
    this.setData({ 
      showParticipantQR: false,
      selectedParticipant: null
    })
  },

  // 复制参与者微信号
  copyParticipantWechat() {
    const { selectedParticipant } = this.data
    if (selectedParticipant && selectedParticipant.wechatId) {
      wx.setClipboardData({
        data: selectedParticipant.wechatId,
        success: () => {
          wx.showToast({
            title: '微信号已复制',
            icon: 'success'
          })
        }
      })
    }
  },

  // 标记为已联系
  async markAsContacted() {
    const { selectedParticipant } = this.data
    if (!selectedParticipant) return

    try {
      await this.createContactRecord(selectedParticipant.userId, 'wechat', {
        wechatId: selectedParticipant.wechatId,
        nickname: selectedParticipant.nickname
      })

      wx.showToast({
        title: '已标记为已联系',
        icon: 'success'
      })

      this.hideParticipantQR()

      // 刷新参与者管理列表
      if (this.data.showParticipantManagement) {
        this.showParticipantManagement()
      }
    } catch (error) {
      console.error('标记联系失败:', error)
      wx.showToast({
        title: '标记失败',
        icon: 'none'
      })
    }
  },

  // 创建联系记录
  async createContactRecord(contactedUserId, contactType, contactInfo) {
    try {
      await wx.cloud.callFunction({
        name: 'contact-record',
        data: {
          action: 'create',
          data: {
            contactedUserId: contactedUserId,
            carpoolId: this.data.carpoolId,
            contactType: contactType,
            contactInfo: contactInfo
          }
        }
      })
    } catch (error) {
      console.error('创建联系记录失败:', error)
    }
  },

  shareCarpool() {
    return {
              title: `${this.data.carpoolDetail.activityName} - 拼局信息`,
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
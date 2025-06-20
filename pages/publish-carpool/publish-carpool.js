Page({
  data: {
    mode: 'create', // create 或 edit
    editId: null,
    formData: {
      activityName: '',
      date: '',
      time: '',
      location: '',
      fullAddress: '',
      maxCount: 4,
      price: '',
      description: '',
      requirements: '',
      notes: ''
    },
    minDate: '',
    maxDate: '',
    timeRange: ['09:00', '23:59'],
    isSubmitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('发布拼车页面加载')
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return; // 未登录会自动跳转到登录页面
    }
    
    const mode = options.mode || 'create'
    const editId = options.id || null
    
    // 设置日期范围（当前日期到30天后）
    const today = new Date()
    const maxDate = new Date()
    maxDate.setDate(today.getDate() + 30)
    
    this.setData({
      mode,
      editId,
      minDate: today.toISOString().split('T')[0],
      maxDate: maxDate.toISOString().split('T')[0]
    })

    // 如果是编辑模式，加载数据
    if (mode === 'edit' && editId) {
      this.loadEditData(editId)
    }

    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: mode === 'edit' ? '编辑拼车' : '发布拼车'
    })
  },

  async loadEditData(id) {
    wx.showLoading({
      title: '加载中...'
    })

    try {
      const result = await wx.cloud.callFunction({
        name: 'carpool-detail',
        data: {
          carpoolId: id
        }
      })
      
      wx.hideLoading()
      
      if (result.result.success) {
        const carpoolData = result.result.data
        
        // 只有组织者可以编辑
        if (!carpoolData.isOrganizer) {
          wx.showToast({
            title: '只有组织者可以编辑',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
          return
        }
        
        this.setData({
          formData: {
            activityName: carpoolData.activityName,
            date: carpoolData.date,
            time: carpoolData.time,
            location: carpoolData.location,
            fullAddress: carpoolData.fullAddress || '',
            maxCount: carpoolData.maxCount,
            price: carpoolData.price.toString(),
            description: carpoolData.description || '',
            requirements: carpoolData.requirements || '',
            notes: carpoolData.notes || ''
          }
        })
      } else {
        throw new Error(result.result.error)
      }
    } catch (error) {
      wx.hideLoading()
      console.error('加载拼车数据失败：', error)
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
    }
  },

  onFormChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`formData.${field}`]: value
    })
  },

  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    })
  },

  onTimeChange(e) {
    this.setData({
      'formData.time': e.detail.value
    })
  },

  onCountChange(e) {
    this.setData({
      'formData.maxCount': parseInt(e.detail.value)
    })
  },

  selectLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'formData.location': res.name,
          'formData.fullAddress': res.address
        })
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '提示',
            content: '需要授权位置信息才能选择地点',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting()
              }
            }
          })
        }
      }
    })
  },

  validateForm() {
    const { formData } = this.data
    const errors = []

    if (!formData.activityName.trim()) {
      errors.push('请填写活动名称')
    }
    if (!formData.date) {
      errors.push('请选择活动日期')
    }
    if (!formData.time) {
      errors.push('请选择活动时间')
    }
    if (!formData.location.trim()) {
      errors.push('请选择活动地点')
    }
    if (!formData.price || formData.price <= 0) {
      errors.push('请填写有效的拼车费用')
    }
    if (formData.maxCount < 2 || formData.maxCount > 10) {
      errors.push('人数限制应在2-10人之间')
    }

    if (errors.length > 0) {
      wx.showModal({
        title: '请完善信息',
        content: errors.join('\n'),
        showCancel: false
      })
      return false
    }

    return true
  },

  async onSubmit() {
    if (!this.validateForm()) {
      return
    }

    if (this.data.isSubmitting) {
      return
    }

    this.setData({
      isSubmitting: true
    })

    const { mode, formData, editId } = this.data
    const action = mode === 'edit' ? '更新' : '发布'

    wx.showLoading({
      title: `正在${action}...`
    })

    try {
      const functionName = mode === 'edit' ? 'carpool-update' : 'carpool-create'
      const requestData = {
        ...formData,
        price: parseFloat(formData.price)
      }
      
      if (mode === 'edit') {
        requestData.carpoolId = editId
      }
      
      const result = await wx.cloud.callFunction({
        name: functionName,
        data: requestData
      })
      
      wx.hideLoading()
      
      if (result.result.success) {
        wx.showToast({
          title: `${action}成功！`,
          icon: 'success',
          duration: 2000
        })

        setTimeout(() => {
          if (mode === 'edit') {
            wx.navigateBack()
          } else {
            wx.switchTab({
              url: '/pages/carpool/list'
            })
          }
        }, 1500)
      } else {
        throw new Error(result.result.error || `${action}失败`)
      }
    } catch (error) {
      wx.hideLoading()
      console.error(`${action}拼车失败：`, error)
      wx.showToast({
        title: error.message || `${action}失败`,
        icon: 'none'
      })
    } finally {
      this.setData({
        isSubmitting: false
      })
    }
  },

  onReset() {
    wx.showModal({
      title: '确认重置',
      content: '确定要清空所有填写的内容吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            formData: {
              activityName: '',
              date: '',
              time: '',
              location: '',
              fullAddress: '',
              maxCount: 4,
              price: '',
              description: '',
              requirements: '',
              notes: ''
            }
          })
          wx.showToast({
            title: '已重置',
            icon: 'success'
          })
        }
      }
    })
  },

  onCancel() {
    wx.showModal({
      title: '确认退出',
      content: '退出后将丢失已填写的内容，确定要退出吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
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
        content: '发布拼车需要微信授权登录',
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

  // 发布拼车
  async submitForm() {
    // 检查登录状态
    if (!this.checkLoginStatus()) {
      return;
    }

    const { activityName, date, time, startLocation, endLocation, maxCount, price, remark } = this.data

    // 基本验证
    if (!activityName || !date || !time || !startLocation || !endLocation || !maxCount || !price) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }

    if (maxCount < 2 || maxCount > 10) {
      wx.showToast({
        title: '人数限制2-10人',
        icon: 'none'
      })
      return
    }

    if (price <= 0) {
      wx.showToast({
        title: '请输入有效价格',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '发布中...' })

    try {
      // 调用云函数发布拼车
      const result = await wx.cloud.callFunction({
        name: 'carpool-create',
        data: {
          activityName: activityName.trim(),
          date,
          time,
          location: startLocation.trim(),
          fullAddress: endLocation.trim(),
          maxCount: parseInt(maxCount),
          price: parseFloat(price),
          description: remark.trim() || '',
          requirements: '',
          notes: ''
        }
      })

      wx.hideLoading()

      if (result.result.success) {
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        })

        // 返回上一页或跳转到拼车列表
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/carpool/list'
          })
        }, 1500)
      } else {
        throw new Error(result.result.error || '发布失败')
      }

    } catch (error) {
      wx.hideLoading()
      console.error('发布拼车失败:', error)
      wx.showToast({
        title: error.message || '发布失败',
        icon: 'none'
      })
    }
  }
}) 
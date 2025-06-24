// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: "cloud1-6gfpmfdb8942ac88", // 如果创建了新环境，请替换为新的环境ID
        traceUser: true,
      });
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync("logs") || [];
    logs.unshift(Date.now());
    wx.setStorageSync("logs", logs);

    // 微信登录
    wx.login({
      success: (res) => {
        console.log("微信登录成功", res.code);
        this.globalData.code = res.code;
      },
      fail: (err) => {
        console.error("微信登录失败", err);
      }
    });

    // 检查用户登录状态
    this.checkLoginStatus();
  },

  onShow() {
    console.log("小程序显示");
    // 每次显示时检查登录状态
    this.checkLoginStatus();
  },

  onHide() {
    console.log("小程序隐藏");
  },

  onError(msg) {
    console.log("小程序错误", msg);
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const hasUserInfo = userInfo && userInfo.nickName && !userInfo.isGuest;
    
    this.globalData.userInfo = hasUserInfo ? userInfo : null;
    this.globalData.hasLogin = hasUserInfo;
    
    console.log('用户登录状态:', hasUserInfo ? '已登录' : '未登录');
    
    return hasUserInfo;
  },

  // 判断是否在登录页面
  isLoginPage() {
    const pages = getCurrentPages();
    if (pages.length === 0) return false;
    
    const currentPage = pages[pages.length - 1];
    const route = currentPage.route || '';
    
    return route === 'pages/auth/auth';
  },

  // 跳转到登录页面
  navigateToLogin() {
    console.log('跳转到登录页面');
    wx.reLaunch({
      url: '/pages/auth/auth'
    });
  },

  // 用户登录成功
  onLoginSuccess(userInfo) {
    console.log('用户登录成功:', userInfo);
    
    // 确保不是游客用户
    if (userInfo.isGuest) {
      console.log('游客用户，跳转到登录页面');
      this.navigateToLogin();
      return;
    }
    
    // 保存用户信息
    this.globalData.userInfo = userInfo;
    this.globalData.hasLogin = true;
    
    // 本地存储
    wx.setStorageSync('userInfo', userInfo);
    
    // 通知所有页面用户信息已更新
    if (this.userInfoUpdateCallback) {
      this.userInfoUpdateCallback(userInfo);
    }
    
    // 跳转到首页
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  // 用户退出登录
  onLogout() {
    console.log('用户退出登录');
    
    // 清除用户信息
    this.globalData.userInfo = null;
    this.globalData.hasLogin = false;
    
    // 清除本地存储
    wx.removeStorageSync('userInfo');
    
    // 跳转到登录页面
    this.navigateToLogin();
  },

  // 检查用户信息授权状态（兼容旧版本）
  checkUserInfoAuth() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting["scope.userInfo"]) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: (res) => {
              const userInfo = res.userInfo;
              this.globalData.userInfo = userInfo;
              
              // 保存到本地存储
              wx.setStorageSync('userInfo', userInfo);
              
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
            },
          });
        }
      },
    });
  },

  // 更新用户信息
  updateUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    // 保存到本地存储
    wx.setStorageSync('userInfo', userInfo);
    // 通知所有页面用户信息已更新
    if (this.userInfoUpdateCallback) {
      this.userInfoUpdateCallback(userInfo);
    }
  },

  // 检查是否需要授权登录
  requireAuth(callback) {
    if (!this.globalData.hasLogin) {
      this.showLoginModal(callback);
      return false;
    }
    
    if (callback && typeof callback === 'function') {
      callback();
    }
    return true;
  },

  // 显示登录弹窗
  showLoginModal(callback) {
    wx.showModal({
      title: '需要登录',
      content: '此功能需要微信授权登录才能使用',
      confirmText: '微信登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.showAuthModal(callback);
        }
      }
    });
  },

  // 显示微信授权弹窗
  showAuthModal(callback) {
    // 检查是否支持新的getUserProfile API
    if (wx.canIUse('getUserProfile')) {
      wx.getUserProfile({
        desc: '用于完善用户资料和提供拼车服务',
        success: (res) => {
          console.log('获取用户信息成功', res);
          this.handleAuthSuccess(res.userInfo, callback);
        },
        fail: (err) => {
          console.error('获取用户信息失败', err);
          wx.showToast({
            title: '授权失败',
            icon: 'none'
          });
        }
      });
    } else {
      // 兼容旧版本
      wx.showModal({
        title: '提示',
        content: '请升级微信版本后重试',
        showCancel: false
      });
    }
  },

  // 处理授权成功
  async handleAuthSuccess(userInfo, callback) {
    try {
      wx.showLoading({
        title: '登录中...'
      });

      // 确保不是游客用户
      userInfo.isGuest = false;
      
      // 调用云函数保存用户信息
      const result = await wx.cloud.callFunction({
        name: 'user-update',
        data: {
          nickname: userInfo.nickName,
          avatar: userInfo.avatarUrl
        }
      });
      
      console.log('用户信息保存成功', result);
      
      // 保存用户信息
      this.globalData.userInfo = userInfo;
      this.globalData.hasLogin = true;
      wx.setStorageSync('userInfo', userInfo);
      
      wx.hideLoading();
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      // 执行回调
      if (callback && typeof callback === 'function') {
        callback();
      }
      
    } catch (error) {
      console.error('保存用户信息失败', error);
      wx.hideLoading();
      
      // 即使云端保存失败，也允许本地登录
      userInfo.isGuest = false;
      this.globalData.userInfo = userInfo;
      this.globalData.hasLogin = true;
      wx.setStorageSync('userInfo', userInfo);
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
      
      // 执行回调
      if (callback && typeof callback === 'function') {
        callback();
      }
    }
  },

  globalData: {
    userInfo: null,
    hasLogin: false,
    code: null
  },
});

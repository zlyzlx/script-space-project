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
    
    // 如果未登录且不在登录页面，跳转到登录页面
    if (!hasUserInfo && !this.isLoginPage()) {
      this.navigateToLogin();
    }
    
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
      wx.showModal({
        title: '需要登录',
        content: '此功能需要微信授权登录才能使用',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.navigateToLogin();
          }
        }
      });
      return false;
    }
    
    if (callback && typeof callback === 'function') {
      callback();
    }
    return true;
  },

  globalData: {
    userInfo: null,
    hasLogin: false,
    code: null
  },
});

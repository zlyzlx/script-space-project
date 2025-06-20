# 开发指南

## 项目概述

剧本杀拼车小程序是一个基于微信小程序平台的社交应用，帮助剧本杀爱好者寻找同行伙伴，减少出行成本。

### 核心功能

- **拼车发布**：用户可以发布拼车信息，包括活动详情、时间地点、人数限制等
- **拼车搜索**：支持按地点、时间、活动名称等条件搜索拼车
- **参与管理**：用户可以参与拼车、退出拼车，组织者可以管理参与者
- **个人中心**：查看个人信息、历史记录、统计数据等
- **微信二维码**：生成和分享个人微信二维码，便于联系

## 技术栈

### 前端（小程序端）

- **框架**：微信小程序原生框架
- **语言**：JavaScript (ES6+)
- **样式**：WXSS (基于CSS)
- **UI库**：微信小程序官方组件

### 后端（云开发）

- **云函数**：Node.js 16.x
- **数据库**：云开发数据库 (MongoDB)
- **存储**：云开发云存储
- **部署**：微信云开发平台

## 项目结构

```
script-space-project/
├── cloudfunctions/          # 云函数目录
│   ├── carpool-list/       # 获取拼车列表
│   ├── carpool-detail/     # 获取拼车详情
│   ├── carpool-create/     # 创建拼车
│   ├── carpool-update/     # 更新拼车
│   ├── carpool-join/       # 参与拼车
│   ├── carpool-quit/       # 退出拼车
│   ├── get-user-info/      # 获取用户信息
│   ├── update-user-info/   # 更新用户信息
│   ├── generate-qr-code/   # 生成二维码
│   └── get-qr-code/        # 获取二维码
├── pages/                  # 小程序页面
│   ├── index/             # 首页
│   ├── search/            # 搜索页
│   ├── publish/           # 发布页
│   ├── detail/            # 详情页
│   ├── profile/           # 个人中心
│   └── history/           # 历史记录
├── components/            # 组件（待创建）
├── utils/                 # 工具函数
├── docs/                  # 项目文档
├── app.js                # 应用入口
├── app.json              # 应用配置
└── project.config.json   # 项目配置
```

## 开发环境搭建

### 1. 环境要求

- Node.js 16.x 或更高版本
- 微信开发者工具 1.06.0 或更高版本
- 微信小程序账号（已开通云开发）

### 2. 项目初始化

```bash
# 克隆项目（如果从版本控制系统获取）
git clone <repository-url>
cd script-space-project

# 使用微信开发者工具打开项目
# 1. 打开微信开发者工具
# 2. 选择"导入项目"
# 3. 选择项目目录
# 4. 填入小程序 AppID
```

### 3. 云开发配置

```javascript
// app.js 中的云开发初始化
wx.cloud.init({
  env: 'your-env-id', // 云开发环境 ID
  traceUser: true,
});
```

### 4. 云函数部署

```bash
# 在微信开发者工具中
# 1. 右击云函数目录
# 2. 选择"创建并部署：云端安装依赖"
# 或者在每个云函数目录下右击选择"上传并部署"
```

## 开发规范

### 代码风格

#### JavaScript 规范

```javascript
// 使用 const/let，避免 var
const userName = 'example';
let currentPage = 1;

// 函数命名：动词开头，驼峰命名
function getUserInfo() {}
function handleSubmit() {}

// 对象和数组使用字面量
const user = {
  name: 'John',
  age: 25
};
const list = [];

// 使用箭头函数（适当情况下）
const handleClick = () => {
  console.log('clicked');
};

// 异步操作使用 async/await
async function fetchData() {
  try {
    const result = await wx.cloud.callFunction({
      name: 'carpool-list'
    });
    return result.result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

#### WXSS 规范

```css
/* 使用 BEM 命名规范 */
.carpool-card {}
.carpool-card__title {}
.carpool-card__content {}
.carpool-card--featured {}

/* 统一单位：使用 rpx */
.container {
  padding: 20rpx;
  margin: 10rpx 0;
}

/* 颜色变量（在 app.wxss 中定义） */
.primary-color { color: #007AFF; }
.success-color { color: #34C759; }
.error-color { color: #FF3B30; }
```

### 文件命名

- **页面文件**：小写字母，连字符分隔 (`carpool-detail`)
- **组件文件**：小写字母，连字符分隔 (`user-avatar`)
- **云函数**：小写字母，连字符分隔 (`carpool-list`)
- **工具函数**：驼峰命名 (`dateUtils.js`)

### 注释规范

```javascript
/**
 * 获取拼车列表
 * @param {Object} params - 查询参数
 * @param {string} params.location - 地点
 * @param {string} params.date - 日期
 * @param {number} params.page - 页码
 * @returns {Promise<Object>} 拼车列表数据
 */
async function getCarpoolList(params) {
  // 实现代码
}

// 单行注释：解释复杂逻辑
// TODO: 添加缓存机制
// FIXME: 修复分页问题
```

## 云函数开发

### 基本结构

```javascript
// cloudfunctions/example/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { userInfo } = cloud.getWXContext();
  
  try {
    // 参数验证
    if (!event.param) {
      return {
        success: false,
        error: 'MISSING_PARAMETER',
        message: '缺少必要参数'
      };
    }
    
    // 业务逻辑
    const result = await processBusinessLogic(event, userInfo);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      success: false,
      error: error.code || 'UNKNOWN_ERROR',
      message: error.message || '未知错误'
    };
  }
};

async function processBusinessLogic(event, userInfo) {
  // 具体业务逻辑
}
```

### 错误处理

```javascript
// 统一错误码
const ERROR_CODES = {
  AUTH_FAILED: '用户认证失败',
  PERMISSION_DENIED: '权限不足',
  INVALID_PARAMETER: '参数无效',
  RESOURCE_NOT_FOUND: '资源不存在',
  OPERATION_FAILED: '操作失败'
};

// 错误处理函数
function handleError(error) {
  if (error.code) {
    return {
      success: false,
      error: error.code,
      message: ERROR_CODES[error.code] || error.message
    };
  }
  
  return {
    success: false,
    error: 'UNKNOWN_ERROR',
    message: '系统错误，请稍后重试'
  };
}
```

### 数据验证

```javascript
// 参数验证工具
function validateParams(params, schema) {
  for (const [key, rules] of Object.entries(schema)) {
    const value = params[key];
    
    if (rules.required && !value) {
      throw new Error(`参数 ${key} 是必填项`);
    }
    
    if (value && rules.type && typeof value !== rules.type) {
      throw new Error(`参数 ${key} 类型错误`);
    }
    
    if (value && rules.maxLength && value.length > rules.maxLength) {
      throw new Error(`参数 ${key} 长度超出限制`);
    }
  }
}

// 使用示例
const schema = {
  activityName: { required: true, type: 'string', maxLength: 50 },
  maxCount: { required: true, type: 'number' },
  date: { required: true, type: 'string' }
};

validateParams(event, schema);
```

## 前端开发

### 页面开发规范

```javascript
// pages/example/example.js
Page({
  data: {
    // 页面数据
    list: [],
    loading: false,
    hasMore: true
  },

  // 页面生命周期
  onLoad(options) {
    this.initPage(options);
  },

  onShow() {
    this.refreshData();
  },

  // 初始化方法
  async initPage(options) {
    wx.showLoading({ title: '加载中...' });
    
    try {
      await this.loadData();
    } catch (error) {
      this.showError('加载失败，请稍后重试');
    } finally {
      wx.hideLoading();
    }
  },

  // 数据加载
  async loadData() {
    this.setData({ loading: true });
    
    try {
      const result = await wx.cloud.callFunction({
        name: 'example-function',
        data: { page: 1 }
      });
      
      if (result.result.success) {
        this.setData({
          list: result.result.data,
          loading: false
        });
      } else {
        throw new Error(result.result.message);
      }
    } catch (error) {
      this.setData({ loading: false });
      throw error;
    }
  },

  // 错误处理
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },

  // 事件处理
  handleItemTap(e) {
    const { item } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${item.id}`
    });
  }
});
```

### 组件开发

```javascript
// components/carpool-card/carpool-card.js
Component({
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  data: {
    // 组件内部数据
  },

  methods: {
    handleTap() {
      this.triggerEvent('tap', { item: this.data.item });
    },

    formatDate(date) {
      // 日期格式化逻辑
    }
  }
});
```

### 数据状态管理

```javascript
// utils/store.js
class Store {
  constructor() {
    this.state = {
      userInfo: null,
      carpoolList: [],
      currentLocation: null
    };
    this.listeners = [];
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

module.exports = new Store();
```

## 测试策略

### 单元测试

```javascript
// test/utils.test.js
const { formatDate } = require('../utils/dateUtils');

describe('DateUtils', () => {
  test('should format date correctly', () => {
    const date = '2024-01-15';
    const result = formatDate(date);
    expect(result).toBe('1月15日');
  });
});
```

### 云函数测试

```javascript
// test/carpool-list.test.js
const { main } = require('../cloudfunctions/carpool-list/index');

describe('carpool-list', () => {
  test('should return carpool list', async () => {
    const event = { page: 1, limit: 10 };
    const context = {};
    
    const result = await main(event, context);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data.list)).toBe(true);
  });
});
```

### 集成测试

```javascript
// 页面功能测试
describe('Carpool List Page', () => {
  test('should load and display carpool list', async () => {
    // 模拟页面加载
    const page = new MockPage();
    await page.onLoad();
    
    // 验证数据加载
    expect(page.data.list.length).toBeGreaterThan(0);
    expect(page.data.loading).toBe(false);
  });
});
```

## 性能优化

### 前端优化

1. **图片优化**
   ```javascript
   // 使用 lazy loading
   <image src="{{item.image}}" lazy-load="{{true}}" />
   
   // 压缩图片
   const compressedImage = await wx.compressImage({
     src: originalImage,
     quality: 80
   });
   ```

2. **数据缓存**
   ```javascript
   // 本地存储缓存
   const CACHE_KEY = 'carpool_list_cache';
   const CACHE_EXPIRE = 5 * 60 * 1000; // 5分钟
   
   function setCache(data) {
     wx.setStorageSync(CACHE_KEY, {
       data,
       timestamp: Date.now()
     });
   }
   
   function getCache() {
     const cache = wx.getStorageSync(CACHE_KEY);
     if (cache && Date.now() - cache.timestamp < CACHE_EXPIRE) {
       return cache.data;
     }
     return null;
   }
   ```

3. **分页加载**
   ```javascript
   // 上拉加载更多
   onReachBottom() {
     if (!this.data.hasMore || this.data.loading) return;
     this.loadMoreData();
   }
   ```

### 后端优化

1. **数据库查询优化**
   ```javascript
   // 使用索引查询
   const result = await db.collection('carpools')
     .where({
       status: 'active',
       date: db.command.gte(today)
     })
     .orderBy('publishTime', 'desc')
     .limit(20)
     .get();
   
   // 字段投影
   const result = await db.collection('carpools')
     .field({
       activityName: true,
       location: true,
       date: true,
       currentCount: true,
       maxCount: true
     })
     .get();
   ```

2. **云函数优化**
   ```javascript
   // 连接池复用
   let dbInstance = null;
   
   function getDB() {
     if (!dbInstance) {
       dbInstance = cloud.database();
     }
     return dbInstance;
   }
   ```

## 部署流程

### 开发环境

1. **本地开发**
   - 使用微信开发者工具预览
   - 真机调试测试功能

2. **云函数部署**
   ```bash
   # 在微信开发者工具中
   # 右击云函数 -> 上传并部署
   ```

### 生产环境

1. **版本发布**
   - 提交代码审核
   - 等待审核通过
   - 发布上线

2. **云函数发布**
   - 切换到生产环境
   - 部署云函数
   - 数据库迁移（如需要）

## 监控和日志

### 错误监控

```javascript
// 全局错误处理
App({
  onError(error) {
    console.error('App Error:', error);
    
    // 上报错误信息
    wx.cloud.callFunction({
      name: 'log-error',
      data: {
        error: error.toString(),
        stack: error.stack,
        timestamp: Date.now()
      }
    });
  }
});
```

### 性能监控

```javascript
// 页面性能监控
Page({
  onLoad() {
    this.startTime = Date.now();
  },
  
  onReady() {
    const loadTime = Date.now() - this.startTime;
    
    // 上报性能数据
    wx.cloud.callFunction({
      name: 'log-performance',
      data: {
        page: 'carpool-list',
        loadTime,
        timestamp: Date.now()
      }
    });
  }
});
```

## 常见问题

### 1. 云函数调用失败

**问题**：云函数返回 error 或超时
**解决**：
- 检查云函数是否正确部署
- 查看云函数日志排查错误
- 确认网络连接正常

### 2. 数据库权限问题

**问题**：数据库操作被拒绝
**解决**：
- 检查数据库安全规则
- 确认用户已登录
- 使用云函数操作数据库

### 3. 页面加载慢

**问题**：页面首次加载时间过长
**解决**：
- 优化图片大小和格式
- 使用数据缓存
- 减少首次加载的数据量

### 4. 真机调试问题

**问题**：开发者工具正常，真机有问题
**解决**：
- 检查 API 兼容性
- 确认网络环境
- 使用真机调试功能

## 扩展开发

### 新功能开发流程

1. **需求分析**：确定功能需求和技术方案
2. **数据库设计**：设计新的字段或集合
3. **API 设计**：设计云函数接口
4. **前端开发**：实现用户界面
5. **测试验证**：功能测试和集成测试
6. **文档更新**：更新相关文档

### 第三方集成

1. **地图服务**：腾讯地图 API
2. **支付功能**：微信支付 API
3. **消息推送**：微信模板消息
4. **数据分析**：微信小程序数据助手

### 性能监控工具

1. **小程序性能监控**：微信小程序管理后台
2. **云函数监控**：云开发控制台
3. **自定义监控**：自建日志系统

---

## 参考资料

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/)
- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/)
- [小程序设计指南](https://developers.weixin.qq.com/miniprogram/design/)
- [JavaScript 编码规范](https://github.com/airbnb/javascript) 
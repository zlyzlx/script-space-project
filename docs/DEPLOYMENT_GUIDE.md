# 部署指南

## 概述

本文档详细介绍了剧本杀拼车小程序从开发环境到生产环境的完整部署流程，包括环境配置、云函数部署、数据库设置、审核发布等各个环节。

## 部署架构

```
开发环境 → 测试环境 → 生产环境
    ↓          ↓          ↓
云开发测试环境 → 云开发预发布环境 → 云开发生产环境
```

## 环境要求

### 开发工具

- **微信开发者工具**：1.06.0 或更高版本
- **Node.js**：16.x 或更高版本
- **npm/yarn**：最新稳定版本

### 账号权限

- **微信小程序账号**：已认证的企业或个人账号
- **云开发权限**：已开通云开发服务
- **开发者权限**：具有小程序开发和发布权限

## 环境配置

### 1. 云开发环境创建

#### 测试环境

```javascript
// 环境名称：dev-env
// 环境别名：开发测试环境
// 资源配置：基础版（适合开发测试）
```

#### 生产环境

```javascript
// 环境名称：prod-env
// 环境别名：生产环境
// 资源配置：专业版或旗舰版（根据业务量选择）
```

### 2. 环境变量配置

```javascript
// app.js - 环境配置
const envConfig = {
  development: {
    envId: 'dev-env-xxxxx',
    apiTimeout: 10000,
    debug: true
  },
  production: {
    envId: 'prod-env-xxxxx',
    apiTimeout: 5000,
    debug: false
  }
};

// 获取当前环境
const currentEnv = __wxConfig.envVersion === 'release' ? 'production' : 'development';
const config = envConfig[currentEnv];

wx.cloud.init({
  env: config.envId,
  traceUser: true
});
```

### 3. 数据库安全规则配置

#### 测试环境安全规则

```javascript
// 测试环境：相对宽松的权限，便于开发调试
{
  "read": true,
  "write": "auth != null"
}
```

#### 生产环境安全规则

```javascript
// 生产环境：严格的权限控制
{
  "read": "auth != null",
  "write": "auth != null && resource.data._openid == auth.openid"
}
```

## 云函数部署

### ⚠️ 重要：依赖安装

在部署云函数之前，**必须**先为每个云函数安装 `wx-server-sdk` 依赖。如果忽略这一步，会导致云函数执行时出现 `Cannot find module 'wx-server-sdk'` 错误。

#### 方法一：使用微信开发者工具自动安装

1. 在微信开发者工具中，右击云函数文件夹
2. 选择 **"创建并部署：云端安装依赖"**
3. 工具会自动安装 `package.json` 中指定的依赖

#### 方法二：本地安装依赖

```bash
# 进入云函数目录
cd cloudfunctions

# 为每个云函数安装依赖
for func in carpool-list carpool-detail carpool-create carpool-update carpool-join carpool-quit get-user-info update-user-info get-user-stats get-my-carpools get-my-rides get-user-qrcode generate-wechat-qr user-info user-update user-carpools user-rides db-init; do
  echo "安装 $func 依赖..."
  cd $func
  npm install
  cd ..
done
```

#### 验证依赖安装

安装完成后，每个云函数目录下应该包含：
- `package.json` - 依赖配置文件
- `package-lock.json` - 锁定依赖版本
- `node_modules/` - 已安装的依赖包
- `index.js` - 函数入口文件

### 1. 云函数列表

| 云函数名称 | 功能描述 | 依赖包 | 内存配置 |
|-----------|----------|--------|----------|
| `carpool-list` | 获取拼车列表 | wx-server-sdk | 256MB |
| `carpool-detail` | 获取拼车详情 | wx-server-sdk | 128MB |
| `carpool-create` | 创建拼车 | wx-server-sdk | 256MB |
| `carpool-update` | 更新拼车 | wx-server-sdk | 128MB |
| `carpool-join` | 参与拼车 | wx-server-sdk | 128MB |
| `carpool-quit` | 退出拼车 | wx-server-sdk | 128MB |
| `get-user-info` | 获取用户信息 | wx-server-sdk | 128MB |
| `update-user-info` | 更新用户信息 | wx-server-sdk | 128MB |
| `get-user-stats` | 获取用户统计 | wx-server-sdk | 128MB |
| `get-my-carpools` | 获取我的拼车 | wx-server-sdk | 256MB |
| `get-my-rides` | 获取我的车次 | wx-server-sdk | 256MB |
| `get-user-qrcode` | 获取用户二维码 | wx-server-sdk | 128MB |
| `generate-wechat-qr` | 生成微信二维码 | wx-server-sdk | 256MB |

### 2. 部署流程

#### 测试环境部署

```bash
# 1. 确保已安装云函数依赖
# 2. 在微信开发者工具中切换到测试环境
# 3. 右击云函数目录，选择"创建并部署：云端安装依赖"
# 4. 等待部署完成

# 批量部署脚本（可选）
#!/bin/bash
functions=("carpool-list" "carpool-detail" "carpool-create" "carpool-update" "carpool-join" "carpool-quit" "get-user-info" "update-user-info" "get-user-stats" "get-my-carpools" "get-my-rides" "get-user-qrcode" "generate-wechat-qr")

for func in "${functions[@]}"
do
   echo "Deploying $func..."
   # 使用开发者工具命令行工具部署
   # cli upload --project . --upload-function $func
done
```

#### 生产环境部署

```bash
# 1. 确保所有云函数在测试环境正常运行
# 2. 确保所有云函数依赖已正确安装
# 3. 切换到生产环境
# 4. 逐个部署云函数
# 5. 验证功能正常

# 部署检查清单：
# □ 所有云函数代码已更新
# □ wx-server-sdk 依赖已安装
# □ package.json 依赖版本正确
# □ 环境变量配置正确
# □ 超时时间设置合理
# □ 内存配置合理
```

### 3. 云函数配置

#### package.json 示例

```json
{
  "name": "carpool-function",
  "version": "1.0.0",
  "description": "拼车相关云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "latest"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

#### 函数配置示例

```javascript
// cloudfunctions/carpool-list/config.json
{
  "permissions": {
    "openapi": []
  },
  "timeout": 10,
  "memorySize": 256,
  "runtime": "Nodejs16.13"
}
```

## 数据库部署

### 1. 数据库索引创建

```javascript
// 在云开发控制台执行以下命令创建索引

// carpools 集合索引
db.collection('carpools').createIndex({
  "status": 1,
  "publishTime": -1
});

db.collection('carpools').createIndex({
  "date": 1,
  "status": 1
});

db.collection('carpools').createIndex({
  "_openid": 1
});

// 文本搜索索引
db.collection('carpools').createIndex({
  "activityName": "text",
  "location": "text"
});

// carpool_participants 集合索引
db.collection('carpool_participants').createIndex({
  "carpoolId": 1,
  "status": 1
});

db.collection('carpool_participants').createIndex({
  "userId": 1,
  "status": 1
});

db.collection('carpool_participants').createIndex({
  "_openid": 1,
  "joinTime": -1
});

// users 集合索引
db.collection('users').createIndex({
  "_openid": 1
}, {
  unique: true
});

db.collection('users').createIndex({
  "createTime": -1
});
```

### 2. 数据迁移脚本

```javascript
// migration/migrate-v1-to-v2.js
// 数据迁移示例脚本

const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

async function migrateUserStats() {
  try {
    const users = await db.collection('users').get();
    
    for (const user of users.data) {
      // 计算用户统计数据
      const publishedCount = await db.collection('carpools')
        .where({ _openid: user._openid })
        .count();
      
      const participatedCount = await db.collection('carpool_participants')
        .where({ 
          _openid: user._openid,
          status: 'active'
        })
        .count();
      
      // 更新用户统计信息
      await db.collection('users').doc(user._id).update({
        data: {
          stats: {
            publishedCount: publishedCount.total,
            participatedCount: participatedCount.total,
            totalParticipants: 0, // 需要进一步计算
            completedCount: 0,
            cancelledCount: 0
          }
        }
      });
    }
    
    console.log('用户统计数据迁移完成');
  } catch (error) {
    console.error('迁移失败:', error);
  }
}
```

### 3. 数据备份策略

```javascript
// backup/auto-backup.js
// 自动备份脚本

const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

async function backupData() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    // 备份主要集合
    const collections = ['carpools', 'carpool_participants', 'users'];
    
    for (const collectionName of collections) {
      const data = await db.collection(collectionName).get();
      
      // 保存到云存储
      await cloud.uploadFile({
        cloudPath: `backup/${timestamp}/${collectionName}.json`,
        fileContent: Buffer.from(JSON.stringify(data.data, null, 2))
      });
    }
    
    console.log(`备份完成: ${timestamp}`);
  } catch (error) {
    console.error('备份失败:', error);
  }
}

// 定期执行（可以通过云函数定时触发器配置）
exports.main = backupData;
```

## 小程序代码部署

### 1. 版本管理

#### 版本号规范

```
主版本号.次版本号.修订号
例如：1.2.3

- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正
```

#### 版本更新记录

```javascript
// version.js
const VERSION_INFO = {
  version: '1.0.0',
  buildTime: '2024-01-10T10:00:00.000Z',
  features: [
    '基础拼车功能',
    '用户个人中心',
    '微信二维码生成'
  ],
  bugfixes: [
    '修复页面加载问题',
    '优化性能表现'
  ]
};

module.exports = VERSION_INFO;
```

### 2. 预发布流程

#### 代码检查清单

```bash
# 代码质量检查
□ 所有功能正常运行
□ 没有控制台错误或警告
□ 代码已进行压缩优化
□ 图片资源已优化
□ 无敏感信息泄露

# 性能检查
□ 页面加载时间 < 3秒
□ 云函数响应时间 < 2秒
□ 内存使用合理
□ 没有内存泄露

# 兼容性检查
□ iOS 系统兼容性
□ Android 系统兼容性
□ 不同机型适配
□ 网络环境适配
```

#### 测试用例

```javascript
// test/integration.test.js
// 集成测试用例

describe('小程序集成测试', () => {
  test('用户登录流程', async () => {
    // 测试用户登录功能
  });
  
  test('拼车发布流程', async () => {
    // 测试拼车发布功能
  });
  
  test('拼车参与流程', async () => {
    // 测试拼车参与功能
  });
  
  test('个人中心功能', async () => {
    // 测试个人中心功能
  });
});
```

### 3. 生产发布

#### 发布前准备

```bash
# 1. 确认版本信息
# 2. 更新版本号
# 3. 生成发布说明
# 4. 备份当前版本

# project.config.json 检查
{
  "miniprogramRoot": "./",
  "cloudfunctionRoot": "./cloudfunctions/",
  "setting": {
    "urlCheck": true,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true
  }
}
```

#### 发布流程

```bash
# 1. 上传代码
# - 在微信开发者工具中点击"上传"
# - 填写版本号和版本描述
# - 等待上传完成

# 2. 提交审核
# - 登录微信公众平台
# - 进入开发管理 -> 开发版本
# - 点击"提交审核"
# - 填写审核信息

# 3. 发布上线
# - 等待审核通过
# - 点击"发布"按钮
# - 确认发布
```

## 监控和运维

### 1. 性能监控

#### 小程序性能监控

```javascript
// utils/monitor.js
// 性能监控工具

class PerformanceMonitor {
  constructor() {
    this.startTime = Date.now();
  }
  
  // 页面加载时间监控
  reportPageLoad(pageName) {
    const loadTime = Date.now() - this.startTime;
    
    wx.cloud.callFunction({
      name: 'log-performance',
      data: {
        type: 'page_load',
        page: pageName,
        loadTime,
        timestamp: Date.now()
      }
    });
  }
  
  // API 调用时间监控
  async monitorAPICall(apiName, apiCall) {
    const startTime = Date.now();
    
    try {
      const result = await apiCall();
      const duration = Date.now() - startTime;
      
      // 记录成功调用
      this.reportAPICall(apiName, duration, true);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // 记录失败调用
      this.reportAPICall(apiName, duration, false, error.message);
      throw error;
    }
  }
  
  reportAPICall(apiName, duration, success, error = null) {
    wx.cloud.callFunction({
      name: 'log-performance',
      data: {
        type: 'api_call',
        api: apiName,
        duration,
        success,
        error,
        timestamp: Date.now()
      }
    });
  }
}

module.exports = new PerformanceMonitor();
```

#### 云函数监控

```javascript
// cloudfunctions/log-performance/index.js
// 性能日志收集云函数

const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { type, timestamp, ...data } = event;
  
  try {
    await db.collection('performance_logs').add({
      data: {
        type,
        data,
        timestamp: new Date(timestamp),
        createTime: new Date()
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Performance log error:', error);
    return { success: false, error: error.message };
  }
};
```

### 2. 错误监控

#### 全局错误处理

```javascript
// app.js
App({
  onError(error) {
    console.error('App Error:', error);
    
    // 上报错误
    this.reportError(error, 'app');
  },
  
  reportError(error, source) {
    wx.cloud.callFunction({
      name: 'log-error',
      data: {
        error: error.toString(),
        stack: error.stack,
        source,
        userAgent: wx.getSystemInfoSync(),
        timestamp: Date.now()
      }
    });
  }
});
```

#### 错误日志云函数

```javascript
// cloudfunctions/log-error/index.js
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  const { userInfo } = cloud.getWXContext();
  
  try {
    await db.collection('error_logs').add({
      data: {
        ...event,
        userInfo,
        createTime: new Date()
      }
    });
    
    // 严重错误告警
    if (event.error.includes('CRITICAL')) {
      await sendAlert(event);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error log failed:', error);
    return { success: false };
  }
};

async function sendAlert(errorEvent) {
  // 发送告警通知（可以集成邮件、短信等）
  console.log('CRITICAL ERROR ALERT:', errorEvent);
}
```

### 3. 数据监控

#### 业务数据监控

```javascript
// cloudfunctions/data-monitor/index.js
// 定时监控业务数据

const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 统计今日数据
    const todayStats = await getTodayStats(today);
    
    // 保存统计数据
    await db.collection('daily_stats').add({
      data: {
        date: today,
        ...todayStats,
        createTime: new Date()
      }
    });
    
    // 异常数据告警
    await checkAnomalies(todayStats);
    
    return { success: true, stats: todayStats };
  } catch (error) {
    console.error('Data monitor error:', error);
    return { success: false, error: error.message };
  }
};

async function getTodayStats(date) {
  // 新增拼车数量
  const newCarpools = await db.collection('carpools')
    .where({
      date: db.command.eq(date)
    })
    .count();
  
  // 新增用户数量
  const newUsers = await db.collection('users')
    .where({
      createTime: db.command.gte(new Date(date))
    })
    .count();
  
  // 活跃用户数量
  const activeUsers = await db.collection('carpool_participants')
    .where({
      joinTime: db.command.gte(new Date(date))
    })
    .count();
  
  return {
    newCarpools: newCarpools.total,
    newUsers: newUsers.total,
    activeUsers: activeUsers.total
  };
}

async function checkAnomalies(stats) {
  // 检查异常数据并告警
  if (stats.newCarpools === 0) {
    console.warn('WARNING: No new carpools today');
  }
  
  if (stats.activeUsers < 5) {
    console.warn('WARNING: Low user activity today');
  }
}
```

## 回滚策略

### 1. 小程序版本回滚

```bash
# 1. 紧急回滚
# - 登录微信公众平台
# - 进入开发管理 -> 线上版本
# - 点击"版本回退"

# 2. 重新发布旧版本
# - 在开发者工具中切换到稳定版本
# - 重新上传和发布
```

### 2. 云函数回滚

```bash
# 1. 备份当前版本
# 2. 部署历史版本代码
# 3. 验证功能正常
# 4. 更新相关配置

# 回滚脚本示例
#!/bin/bash
BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# 备份当前版本
cp -r cloudfunctions $BACKUP_DIR/

# 恢复历史版本
git checkout $STABLE_COMMIT cloudfunctions/
```

### 3. 数据库回滚

```javascript
// 数据回滚脚本
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();

async function rollbackData(backupTimestamp) {
  try {
    // 从备份恢复数据
    const backupData = await cloud.downloadFile({
      cloudPath: `backup/${backupTimestamp}/carpools.json`
    });
    
    // 清空当前数据（谨慎操作）
    // await db.collection('carpools').where({}).remove();
    
    // 恢复备份数据
    const data = JSON.parse(backupData.toString());
    await db.collection('carpools').add({ data });
    
    console.log('数据回滚完成');
  } catch (error) {
    console.error('数据回滚失败:', error);
  }
}
```

## 安全配置

### 1. 云函数安全

```javascript
// 云函数权限配置
const ADMIN_OPENIDS = [
  'admin-openid-1',
  'admin-openid-2'
];

function checkAdminPermission(openid) {
  return ADMIN_OPENIDS.includes(openid);
}

// 输入验证
function validateInput(data, schema) {
  // 实现输入验证逻辑
}

// 防止 SQL 注入（虽然是 NoSQL，但仍需注意）
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input.replace(/[<>]/g, '');
  }
  return input;
}
```

### 2. 数据库安全规则

```javascript
// 生产环境安全规则
{
  "read": "auth != null && (resource.data._openid == auth.openid || resource.data.public == true)",
  "write": "auth != null && resource.data._openid == auth.openid",
  "create": "auth != null",
  "update": "auth != null && resource.data._openid == auth.openid",
  "delete": "auth != null && resource.data._openid == auth.openid"
}
```

### 3. 网络安全

```javascript
// 请求频率限制
const requestLimiter = {
  limits: new Map(),
  
  checkLimit(openid, limit = 100) {
    const now = Date.now();
    const windowStart = now - 60000; // 1分钟窗口
    
    if (!this.limits.has(openid)) {
      this.limits.set(openid, []);
    }
    
    const requests = this.limits.get(openid);
    
    // 清理过期请求
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= limit) {
      throw new Error('请求频率过高，请稍后重试');
    }
    
    validRequests.push(now);
    this.limits.set(openid, validRequests);
  }
};
```

## 故障排查

### 1. 常见问题及解决方案

| 问题 | 现象 | 解决方案 |
|------|------|----------|
| 云函数超时 | 接口调用超时 | 优化代码逻辑，增加超时时间 |
| 数据库连接失败 | 数据读写失败 | 检查网络，重启云函数 |
| 小程序白屏 | 页面无法加载 | 检查代码错误，清除缓存 |
| 用户登录失败 | 无法获取用户信息 | 检查授权设置，重新登录 |

### 2. 调试工具

```javascript
// 调试模式配置
const DEBUG_MODE = __wxConfig.envVersion !== 'release';

function debugLog(message, data) {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] ${message}:`, data);
  }
}

// 性能调试
function performanceDebug(name, fn) {
  return async (...args) => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      debugLog(`${name} 执行时间`, `${Date.now() - start}ms`);
      return result;
    } catch (error) {
      debugLog(`${name} 执行失败`, error);
      throw error;
    }
  };
}
```

### 3. 日志分析

```javascript
// 日志分析工具
class LogAnalyzer {
  async analyzeErrors(startTime, endTime) {
    const errors = await db.collection('error_logs')
      .where({
        createTime: db.command.gte(startTime).and(db.command.lte(endTime))
      })
      .get();
    
    // 错误分类统计
    const errorStats = {};
    errors.data.forEach(error => {
      const type = this.categorizeError(error.error);
      errorStats[type] = (errorStats[type] || 0) + 1;
    });
    
    return errorStats;
  }
  
  categorizeError(errorMessage) {
    if (errorMessage.includes('timeout')) return 'timeout';
    if (errorMessage.includes('permission')) return 'permission';
    if (errorMessage.includes('network')) return 'network';
    return 'other';
  }
}
```

---

## 总结

本部署指南涵盖了小程序从开发到生产的完整部署流程。在实际部署过程中，请根据具体情况调整配置和流程。建议：

1. **渐进式部署**：先在测试环境验证，再发布到生产环境
2. **完善监控**：建立完整的监控体系，及时发现问题
3. **定期备份**：制定数据备份策略，确保数据安全
4. **文档更新**：及时更新部署文档，保持信息同步

如有问题，请参考相关文档或联系技术支持。 
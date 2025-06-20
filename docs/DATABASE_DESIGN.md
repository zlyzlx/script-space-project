# 数据库设计文档

## 概述

剧本杀拼车小程序使用微信小程序云开发的 NoSQL 数据库（基于 MongoDB）。本文档详细描述了各个集合（Collection）的结构设计。

## 集合列表

| 集合名称 | 说明 | 文档数量（预估） |
|---------|------|-----------------|
| `carpools` | 拼车信息表 | 1000+ |
| `carpool_participants` | 拼车参与者表 | 5000+ |
| `users` | 用户信息表 | 500+ |

## 集合设计

### 1. carpools - 拼车信息表

**用途**：存储所有拼车活动的基本信息。

**字段设计**：

```javascript
{
  "_id": ObjectId,              // 系统生成的唯一标识
  "_openid": String,            // 创建者的微信 OpenID（云开发自动添加）
  "organizerId": String,        // 组织者用户ID（冗余字段，便于查询）
  
  // 活动基本信息
  "activityName": String,       // 活动名称，必填，最大50字符
  "date": String,               // 活动日期，格式：YYYY-MM-DD
  "time": String,               // 活动时间，格式：HH:MM
  
  // 地点信息
  "location": String,           // 地点名称，必填
  "fullAddress": String,        // 详细地址（可选）
  "coordinates": {              // 地理坐标（可选）
    "latitude": Number,
    "longitude": Number
  },
  
  // 拼车设置
  "maxCount": Number,           // 最大人数，2-10
  "currentCount": Number,       // 当前人数，包含组织者
  "price": Number,              // 拼车费用（每人），单位：元
  
  // 状态管理
  "status": String,             // 状态：active(招募中)/full(已满员)/completed(已完成)/cancelled(已取消)/deleted(已删除)
  
  // 详细描述
  "description": String,        // 活动描述（可选），最大200字符
  "requirements": String,       // 参与要求（可选），最大100字符
  "notes": String,              // 注意事项（可选），最大100字符
  
  // 时间戳
  "publishTime": Date,          // 发布时间
  "updateTime": Date,           // 最后更新时间
  "createTime": Date            // 创建时间
}
```

**索引设计**：
```javascript
// 复合索引 - 状态和发布时间
{ "status": 1, "publishTime": -1 }

// 复合索引 - 日期和状态
{ "date": 1, "status": 1 }

// 文本索引 - 支持全文搜索
{ "activityName": "text", "location": "text" }

// 单字段索引
{ "_openid": 1 }
{ "organizerId": 1 }
```

**示例数据**：
```javascript
{
  "_id": "64a1b2c3d4e5f6789012345",
  "_openid": "o1234567890abcdef123456",
  "organizerId": "user_123456",
  "activityName": "《长安十二时辰》沉浸式剧本杀",
  "date": "2024-01-15",
  "time": "14:00",
  "location": "悬疑馆剧本杀（王府井店）",
  "fullAddress": "北京市东城区王府井大街138号",
  "coordinates": {
    "latitude": 39.9163,
    "longitude": 116.4067
  },
  "maxCount": 6,
  "currentCount": 3,
  "price": 25,
  "status": "active",
  "description": "还原唐朝长安城的繁华与危机，体验紧张刺激的12小时生死时速",
  "requirements": "新手友好，需要一定推理能力",
  "notes": "请提前10分钟到达，穿着舒适",
  "publishTime": "2024-01-10T08:30:00.000Z",
  "updateTime": "2024-01-10T09:15:00.000Z",
  "createTime": "2024-01-10T08:30:00.000Z"
}
```

### 2. carpool_participants - 拼车参与者表

**用途**：记录用户参与拼车的关系，支持历史记录查询。

**字段设计**：

```javascript
{
  "_id": ObjectId,              // 系统生成的唯一标识
  "_openid": String,            // 参与者的微信 OpenID
  
  // 关联信息
  "carpoolId": String,          // 拼车ID，外键关联 carpools._id
  "userId": String,             // 参与者用户ID
  
  // 状态信息
  "status": String,             // 状态：active(参与中)/quit(已退出)/kicked(被移除)
  "role": String,               // 角色：organizer(组织者)/participant(参与者)
  
  // 时间戳
  "joinTime": Date,             // 参与时间
  "quitTime": Date,             // 退出时间（可选）
  "createTime": Date,           // 记录创建时间
  
  // 备注信息
  "quitReason": String,         // 退出原因（可选）
  "notes": String               // 备注（可选）
}
```

**索引设计**：
```javascript
// 复合索引 - 拼车ID和状态
{ "carpoolId": 1, "status": 1 }

// 复合索引 - 用户ID和状态
{ "userId": 1, "status": 1 }

// 复合索引 - OpenID和参与时间
{ "_openid": 1, "joinTime": -1 }

// 唯一复合索引 - 确保一个用户不能重复参与同一个拼车
{ "carpoolId": 1, "userId": 1, "status": 1 }
```

**示例数据**：
```javascript
{
  "_id": "64a1b2c3d4e5f6789012346",
  "_openid": "o1234567890abcdef123457",
  "carpoolId": "64a1b2c3d4e5f6789012345",
  "userId": "user_123457",
  "status": "active",
  "role": "participant",
  "joinTime": "2024-01-10T09:15:00.000Z",
  "createTime": "2024-01-10T09:15:00.000Z"
}
```

### 3. users - 用户信息表

**用途**：存储用户的基本信息和设置。

**字段设计**：

```javascript
{
  "_id": ObjectId,              // 系统生成的唯一标识，也作为用户ID
  "_openid": String,            // 微信 OpenID，用户唯一标识
  
  // 基本信息
  "nickName": String,           // 用户昵称，最大20字符
  "avatarUrl": String,          // 头像URL
  "phone": String,              // 联系电话（可选）
  "gender": Number,             // 性别：0(未知)/1(男)/2(女)
  
  // 微信相关
  "wechatQRCode": String,       // 微信二维码文件ID
  "qrCodeUpdateTime": Date,     // 二维码更新时间
  
  // 统计信息（冗余字段，提高查询性能）
  "stats": {
    "publishedCount": Number,   // 发布的拼车数量
    "participatedCount": Number, // 参与的拼车数量
    "totalParticipants": Number, // 服务的总人次
    "completedCount": Number,    // 完成的拼车数量
    "cancelledCount": Number     // 取消的拼车数量
  },
  
  // 设置信息
  "settings": {
    "allowContact": Boolean,     // 是否允许他人联系
    "showPhone": Boolean,        // 是否显示电话号码
    "notifications": Boolean     // 是否接收通知
  },
  
  // 时间戳
  "createTime": Date,           // 注册时间
  "updateTime": Date,           // 最后更新时间
  "lastLoginTime": Date         // 最后登录时间
}
```

**索引设计**：
```javascript
// 唯一索引
{ "_openid": 1 }

// 普通索引
{ "nickName": 1 }
{ "createTime": -1 }
{ "lastLoginTime": -1 }
```

**示例数据**：
```javascript
{
  "_id": "user_123456",
  "_openid": "o1234567890abcdef123456",
  "nickName": "剧本杀达人",
  "avatarUrl": "https://wx.qlogo.cn/mmopen/vi_32/xxxxx/132",
  "phone": "13800138000",
  "gender": 1,
  "wechatQRCode": "cloud://env-xxx.7465-env-xxx/qr_codes/user_123456.png",
  "qrCodeUpdateTime": "2024-01-01T10:00:00.000Z",
  "stats": {
    "publishedCount": 5,
    "participatedCount": 12,
    "totalParticipants": 30,
    "completedCount": 15,
    "cancelledCount": 1
  },
  "settings": {
    "allowContact": true,
    "showPhone": true,
    "notifications": true
  },
  "createTime": "2024-01-01T08:00:00.000Z",
  "updateTime": "2024-01-10T15:30:00.000Z",
  "lastLoginTime": "2024-01-10T15:30:00.000Z"
}
```

## 数据关系

### 关系图

```
users (1) -----> (N) carpools
  |                   |
  |                   |
  |                   |
  (N) <---- carpool_participants -----> (1)
```

### 关系说明

1. **users ↔ carpools**：一对多关系
   - 一个用户可以发布多个拼车
   - 一个拼车只能有一个组织者

2. **users ↔ carpool_participants**：一对多关系
   - 一个用户可以参与多个拼车
   - 一个参与记录只对应一个用户

3. **carpools ↔ carpool_participants**：一对多关系
   - 一个拼车可以有多个参与者
   - 一个参与记录只对应一个拼车

## 数据一致性

### 事务处理

由于云开发数据库支持事务，在以下操作中需要使用事务确保数据一致性：

1. **用户参与拼车**：
   - 在 `carpool_participants` 中插入记录
   - 更新 `carpools` 中的 `currentCount`
   - 更新 `users` 中的统计信息

2. **用户退出拼车**：
   - 更新 `carpool_participants` 中的状态
   - 更新 `carpools` 中的 `currentCount`
   - 更新 `users` 中的统计信息

3. **删除拼车**：
   - 更新 `carpools` 的状态为 deleted
   - 处理所有相关的 `carpool_participants` 记录

### 数据校验规则

1. **拼车信息校验**：
   - `maxCount` 必须在 2-10 之间
   - `currentCount` 不能超过 `maxCount`
   - `date` 必须是未来日期
   - `price` 必须为非负数

2. **参与者校验**：
   - 用户不能参与自己发布的拼车
   - 用户不能重复参与同一个拼车
   - 拼车状态必须为 active 才能参与

## 性能优化

### 索引策略

1. **复合索引**：根据常用查询组合创建复合索引
2. **文本索引**：支持活动名称和地点的全文搜索
3. **TTL索引**：自动清理过期数据（可选）

### 查询优化

1. **分页查询**：使用 `skip` 和 `limit` 进行分页
2. **字段投影**：只返回必要的字段
3. **聚合查询**：使用聚合管道进行复杂统计

### 数据归档

1. **历史数据**：定期归档完成的拼车记录
2. **日志清理**：定期清理过期的操作日志
3. **存储优化**：压缩和优化图片存储

## 备份策略

1. **自动备份**：利用云开发的自动备份功能
2. **定期导出**：定期导出重要数据到本地
3. **版本控制**：保持数据库结构的版本控制

## 扩展规划

### 可能的新集合

1. **messages** - 消息表（群聊功能）
2. **reviews** - 评价表（用户评价系统）
3. **notifications** - 通知表（消息推送）
4. **activities** - 活动模板表（预定义活动）

### 字段扩展

1. **carpools 扩展**：
   - `tags`：活动标签
   - `difficulty`：难度等级
   - `duration`：预估时长

2. **users 扩展**：
   - `preferences`：用户偏好
   - `reputation`：信用评分
   - `badges`：用户徽章 
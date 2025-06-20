# API 参考文档

## 概述

本文档描述了剧本杀拼车小程序的所有云函数 API 接口。所有 API 都通过微信小程序云开发的云函数调用。

## 通用规范

### 调用方式
```javascript
wx.cloud.callFunction({
  name: 'function-name',
  data: {
    // 请求参数
  }
})
```

### 通用响应格式
```javascript
{
  "success": true,          // 请求是否成功
  "data": {},              // 响应数据（成功时）
  "error": "错误信息",      // 错误信息（失败时）
  "errorCode": "ERROR_CODE" // 错误代码（失败时）
}
```

## 拼车相关 API

### 1. carpool-list - 获取拼车列表

**功能描述**：获取拼车列表，支持搜索和筛选。

**请求参数**：
```javascript
{
  page: 1,              // 页码，默认 1
  limit: 10,            // 每页数量，默认 10
  searchText: "",       // 搜索关键词（可选）
  dateFilter: "",       // 日期筛选："今天"/"明天"/"本周"（可选）
  statusFilter: ""      // 状态筛选："招募中"/"已满员"/"已结束"（可选）
}
```

**响应数据**：
```javascript
{
  "success": true,
  "data": [
    {
      "_id": "拼车ID",
      "activityName": "活动名称",
      "date": "2024-01-15",
      "time": "14:00",
      "location": "地点名称",
      "maxCount": 6,
      "currentCount": 3,
      "price": 25,
      "status": "招募中",
      "organizerNickname": "组织者昵称",
      "publishTime": "2024-01-10T08:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "hasMore": true
}
```

### 2. carpool-detail - 获取拼车详情

**功能描述**：获取指定拼车的详细信息。

**请求参数**：
```javascript
{
  carpoolId: "拼车ID"
}
```

**响应数据**：
```javascript
{
  "success": true,
  "data": {
    "_id": "拼车ID",
    "activityName": "活动名称",
    "date": "2024-01-15",
    "time": "14:00",
    "location": "地点名称",
    "fullAddress": "详细地址",
    "maxCount": 6,
    "currentCount": 3,
    "price": 25,
    "status": "招募中",
    "description": "活动描述",
    "requirements": "参与要求",
    "notes": "注意事项",
    "organizer": {
      "userId": "组织者ID",
      "nickname": "组织者昵称",
      "avatarUrl": "头像URL"
    },
    "participants": [
      {
        "userId": "参与者ID",
        "nickname": "参与者昵称",
        "avatarUrl": "头像URL",
        "joinTime": "2024-01-10T09:00:00.000Z"
      }
    ],
    "isOrganizer": false,
    "isParticipant": false,
    "canJoin": true
  }
}
```

### 3. carpool-create - 创建拼车

**功能描述**：创建新的拼车活动。

**请求参数**：
```javascript
{
  "activityName": "活动名称",
  "date": "2024-01-15",
  "time": "14:00",
  "location": "地点名称",
  "fullAddress": "详细地址",
  "maxCount": 6,
  "price": 25,
  "description": "活动描述",
  "requirements": "参与要求",
  "notes": "注意事项"
}
```

**响应数据**：
```javascript
{
  "success": true,
  "data": {
    "_id": "新创建的拼车ID"
  }
}
```

### 4. carpool-update - 更新拼车信息

**功能描述**：更新拼车信息（仅组织者可操作）。

**请求参数**：
```javascript
{
  "carpoolId": "拼车ID",
  "updateData": {
    "activityName": "新活动名称",
    "date": "2024-01-16",
    "time": "15:00",
    // ... 其他需要更新的字段
  }
}
```

### 5. carpool-join - 参与拼车

**功能描述**：用户参与指定的拼车活动。

**请求参数**：
```javascript
{
  "carpoolId": "拼车ID"
}
```

### 6. carpool-quit - 退出拼车

**功能描述**：用户退出已参与的拼车活动。

**请求参数**：
```javascript
{
  "carpoolId": "拼车ID"
}
```

## 用户相关 API

### 1. get-user-info - 获取用户信息

**功能描述**：获取当前登录用户的信息。

**请求参数**：无

**响应数据**：
```javascript
{
  "success": true,
  "data": {
    "_id": "用户ID",
    "nickName": "用户昵称",
    "avatarUrl": "头像URL",
    "phone": "联系电话",
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-10T08:00:00.000Z"
  }
}
```

### 2. update-user-info - 更新用户信息

**功能描述**：更新用户的个人信息。

**请求参数**：
```javascript
{
  "nickName": "新昵称",
  "avatarUrl": "新头像URL",
  "phone": "新电话号码"
}
```

### 3. get-user-stats - 获取用户统计数据

**功能描述**：获取用户的拼车统计信息。

**请求参数**：无

**响应数据**：
```javascript
{
  "success": true,
  "data": {
    "publishedCount": 5,      // 发布的拼车数量
    "participatedCount": 12,  // 参与的拼车数量
    "totalParticipants": 30   // 服务的总人次
  }
}
```

### 4. get-my-carpools - 获取我发布的拼车

**功能描述**：获取当前用户发布的所有拼车。

**请求参数**：
```javascript
{
  page: 1,
  limit: 10,
  status: ""  // 可选的状态筛选
}
```

### 5. get-my-rides - 获取我参与的拼车

**功能描述**：获取当前用户参与的所有拼车。

**请求参数**：
```javascript
{
  page: 1,
  limit: 10,
  status: ""  // 可选的状态筛选
}
```

## 二维码相关 API

### 1. generate-wechat-qr - 生成微信二维码

**功能描述**：为用户生成微信二维码。

**请求参数**：无

**响应数据**：
```javascript
{
  "success": true,
  "data": {
    "qrCodeUrl": "二维码图片URL",
    "fileID": "云存储文件ID"
  }
}
```

### 2. get-user-qrcode - 获取用户二维码

**功能描述**：获取用户的二维码信息。

**请求参数**：无

**响应数据**：
```javascript
{
  "success": true,
  "data": {
    "qrCodeUrl": "二维码图片URL",
    "updateTime": "2024-01-10T08:00:00.000Z"
  }
}
```

## 错误代码说明

| 错误代码 | 说明 |
|---------|------|
| AUTH_FAILED | 用户未登录或认证失败 |
| PERMISSION_DENIED | 权限不足 |
| CARPOOL_NOT_FOUND | 拼车不存在 |
| CARPOOL_FULL | 拼车已满员 |
| ALREADY_JOINED | 已经参与了该拼车 |
| NOT_PARTICIPANT | 不是该拼车的参与者 |
| INVALID_PARAMS | 参数错误 |
| DATABASE_ERROR | 数据库操作失败 |

## 使用示例

### 获取拼车列表
```javascript
// 获取第一页拼车列表
const result = await wx.cloud.callFunction({
  name: 'carpool-list',
  data: {
    page: 1,
    limit: 10,
    searchText: '剧本杀',
    dateFilter: '今天'
  }
})

if (result.result.success) {
  console.log('拼车列表：', result.result.data)
} else {
  console.error('获取失败：', result.result.error)
}
```

### 参与拼车
```javascript
const result = await wx.cloud.callFunction({
  name: 'carpool-join',
  data: {
    carpoolId: 'carpool_id_123'
  }
})

if (result.result.success) {
  wx.showToast({
    title: '参与成功',
    icon: 'success'
  })
} else {
  wx.showToast({
    title: result.result.error,
    icon: 'none'
  })
}
```

## 版本历史

- **v1.0.0** (2024-01-01)
  - 初始版本
  - 基础拼车功能 API
  - 用户管理 API
  - 二维码功能 API 
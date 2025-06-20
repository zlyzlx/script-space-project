/**
 * 数据库初始化说明文档
 * ⚠️ 此文件仅用于文档说明，不能在云开发控制台中执行
 */

// ==========================================
// 🚀 数据库初始化方案
// ==========================================

// 方案一：使用 db-init 云函数（推荐）
// 1. 部署 cloudfunctions/db-init 云函数
// 2. 在微信开发者工具控制台中调用：
/*
wx.cloud.callFunction({
  name: 'db-init',
  success: res => {
    console.log('✅ 数据库初始化成功:', res.result)
    if (res.result.success) {
      console.log('创建的集合:', res.result.collections)
    }
  },
  fail: err => {
    console.error('❌ 数据库初始化失败:', err)
  }
})
*/

// 方案二：手动创建集合
// 在云开发控制台 → 数据库 → 添加集合，创建以下集合：
// - carpools
// - carpool_participants  
// - users

// ==========================================
// 📊 数据结构说明
// ==========================================

/*
1. carpools 集合（拼车信息）
{
  _id: "拼车ID",
  _openid: "创建者openid",
  organizerId: "组织者ID",
  activityName: "活动名称",
  date: "活动日期",
  time: "活动时间", 
  location: "地点名称",
  fullAddress: "详细地址",
  maxCount: 6, // 最大人数
  currentCount: 3, // 当前人数
  price: 25, // 拼车费用
  status: "招募中", // 状态：招募中、已满员、已完成、已取消
  description: "活动描述",
  requirements: "参与要求",
  contactInfo: "联系方式",
  notes: "备注信息",
  publishTime: "发布时间",
  updateTime: "更新时间"
}

2. carpool_participants 集合（拼车参与者）
{
  _id: "参与记录ID",
  _openid: "参与者openid",
  carpoolId: "拼车ID",
  userId: "参与者ID",
  status: "active", // 状态：active(参与中)、quit(已退出)
  joinTime: "参与时间",
  quitTime: "退出时间"
}

3. users 集合（用户信息）
{
  _id: "用户ID",
  _openid: "用户openid",
  nickname: "用户昵称",
  avatar: "头像URL",
  phone: "联系电话",
  createTime: "创建时间",
  updateTime: "更新时间"
}
*/

// ==========================================
// 🔐 数据库安全规则
// ==========================================

/*
carpools 集合权限：
{
  "read": true,
  "write": "auth.openid == resource.data._openid"
}

carpool_participants 集合权限：
{
  "read": true,
  "write": "auth.openid == resource.data._openid"
}

users 集合权限：
{
  "read": "auth.openid == resource.data._openid",
  "write": "auth.openid == resource.data._openid"
}
*/

// ==========================================
// ☁️ 云函数列表
// ==========================================

/*
- db-init: 数据库初始化（一次性执行）
- carpool-list: 获取拼车列表
- carpool-detail: 获取拼车详情
- carpool-create: 创建拼车
- carpool-update: 更新拼车信息
- carpool-join: 参与拼车
- carpool-quit: 退出拼车
- user-carpools: 获取用户发布的拼车列表
- user-rides: 获取用户参与的拼车列表
- user-info: 获取用户信息
- user-update: 更新用户信息（昵称、头像等）
*/

// ==========================================
// ✅ 验证数据库创建
// ==========================================

const db = wx.cloud.database()

Promise.all([
  db.collection('carpools').limit(1).get(),
  db.collection('carpool_participants').limit(1).get(),
  db.collection('users').limit(1).get()
]).then(results => {
  console.log('✅ 所有数据库集合验证成功!')
  console.log('carpools 集合可访问')
  console.log('carpool_participants 集合可访问')
  console.log('users 集合可访问')
}).catch(error => {
  console.error('❌ 数据库验证失败:', error)
  console.log('请先创建数据库集合')
})

console.log('📖 数据库初始化说明文档加载完成')
console.log('请使用 db-init 云函数或手动创建集合来初始化数据库') 
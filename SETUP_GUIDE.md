# 云开发配置加载指南

## 步骤一：开通云开发服务

### 1. 在微信开发者工具中操作

1. **打开项目**
   - 在微信开发者工具中打开你的小程序项目
   - 确保项目已正确加载

2. **开通云开发**
   - 点击工具栏中的 **"云开发"** 按钮
   - 如果是第一次使用，会提示开通云开发服务
   - 点击 **"开通"** 按钮

3. **创建云环境**
   - 选择 **"创建新环境"**
   - 环境名称：`carpool-dev`（开发环境）
   - 选择付费方式（建议选择按量付费）
   - 点击 **"创建"**

4. **获取环境ID**
   - 创建完成后，记录环境ID（格式类似：`carpool-dev-xxxxx`）
   - 这个ID需要填入 `app.js` 文件中

## 步骤二：配置云开发环境ID

### 更新 app.js 文件

```javascript
// 将 app.js 中的环境ID替换为你的实际环境ID
wx.cloud.init({
  env: 'carpool-dev-xxxxx', // 替换为你的环境ID
  traceUser: true,
})
```

## 步骤三：部署云函数

### 1. 同步云函数列表

1. 在微信开发者工具中，右键点击 `cloudfunctions` 文件夹
2. 选择 **"同步云函数列表"**
3. 选择你刚创建的云环境

### 2. 逐个部署云函数

按以下顺序部署云函数（每个都要单独部署）：

#### 基础云函数
```
1. carpool-list      # 拼车列表
2. carpool-detail    # 拼车详情
3. carpool-create    # 创建拼车
4. carpool-update    # 更新拼车
5. carpool-join      # 参与拼车
6. carpool-quit      # 退出拼车
```

#### 用户功能云函数
```
7. user-info         # 用户信息
8. user-update       # 更新用户信息
9. user-carpools     # 用户的拼车
10. user-rides       # 用户参与的拼车
```

#### 部署方法
对每个云函数文件夹：
1. 右键点击文件夹（如 `carpool-list`）
2. 选择 **"上传并部署：云端安装依赖"**
3. 等待部署完成（显示绿色对勾）

### 3. 验证云函数部署

在云开发控制台的"云函数"页面，应该能看到所有10个云函数都显示为"部署成功"状态。

## 步骤四：初始化云数据库

### 1. 进入数据库控制台

1. 在微信开发者工具中点击 **"云开发"**
2. 切换到 **"数据库"** 标签
3. 或者直接访问云开发控制台

### 2. 创建数据库集合

#### 方法一：手动创建
1. 点击 **"添加集合"**
2. 依次创建以下集合：
   - `carpools` - 拼车信息
   - `carpool_participants` - 拼车参与者
   - `users` - 用户信息

#### 方法二：使用初始化脚本
1. 在数据库控制台中，点击 **"数据库指引"**
2. 选择 **"执行脚本"**
3. 复制 `database/init.js` 中的内容
4. 粘贴到脚本编辑器中
5. 点击 **"执行"**

### 3. 设置数据库权限

1. 进入 **"数据库"** → **"安全规则"**
2. 为每个集合设置权限：

#### carpools 集合权限
```javascript
{
  "read": true,
  "write": "auth.openid == resource.data._openid"
}
```

#### carpool_participants 集合权限
```javascript
{
  "read": true,
  "write": "auth.openid == resource.data._openid"
}
```

#### users 集合权限
```javascript
{
  "read": "auth.openid == resource.data._openid",
  "write": "auth.openid == resource.data._openid"
}
```

## 步骤五：测试配置

### 1. 预览小程序

1. 在微信开发者工具中点击 **"预览"**
2. 用手机微信扫码
3. 在真机上测试功能

### 2. 检查功能

测试以下核心功能：
- [ ] 用户登录
- [ ] 查看拼车列表
- [ ] 查看拼车详情
- [ ] 创建拼车（需要登录）
- [ ] 参与拼车（需要登录）
- [ ] 查看个人中心

### 3. 查看日志

如果功能异常，在云开发控制台查看：
- **云函数日志**：查看云函数调用情况
- **数据库日志**：查看数据库操作记录

## 常见问题解决

### 问题1：云函数调用失败
**解决方案：**
1. 检查 `app.js` 中的环境ID是否正确
2. 确认云函数已成功部署
3. 查看云函数日志中的错误信息

### 问题2：数据库权限错误
**解决方案：**
1. 检查数据库安全规则设置
2. 确认用户已正确登录
3. 验证数据结构是否正确

### 问题3：用户信息获取失败
**解决方案：**
1. 确认已部署 `user-info` 云函数
2. 检查用户是否已授权
3. 查看控制台错误信息

### 问题4：默认头像不显示
**解决方案：**
1. 检查网络连接
2. 确认SVG格式支持
3. 可以上传默认头像到云存储

## 配置检查清单

完成配置后，请确认以下项目：

### 云开发环境
- [ ] 云开发服务已开通
- [ ] 云环境已创建
- [ ] 环境ID已配置到 `app.js`

### 云函数
- [ ] carpool-list 已部署
- [ ] carpool-detail 已部署
- [ ] carpool-create 已部署
- [ ] carpool-update 已部署
- [ ] carpool-join 已部署
- [ ] carpool-quit 已部署
- [ ] user-info 已部署
- [ ] user-update 已部署
- [ ] user-carpools 已部署
- [ ] user-rides 已部署

### 数据库
- [ ] carpools 集合已创建
- [ ] carpool_participants 集合已创建
- [ ] users 集合已创建
- [ ] 数据库索引已创建
- [ ] 安全规则已设置

### 功能测试
- [ ] 小程序可以正常预览
- [ ] 用户登录功能正常
- [ ] 拼车列表显示正常
- [ ] 个人中心数据正常

## 下一步

配置完成后，你可以：
1. 开始测试小程序功能
2. 根据需要调整界面样式
3. 添加更多自定义功能
4. 准备提交审核上线

---

**注意**：首次配置可能需要10-15分钟，请耐心等待各项服务初始化完成。 

### 📋 **总结**

现在你有两种方式初始化数据库：

1. **推荐方式**：使用 `db-init` 云函数（自动创建集合和索引）
2. **备选方式**：在云开发控制台手动创建集合

选择其中一种方式完成数据库初始化，然后就可以继续部署其他云函数了！

### 验证数据库集合

```javascript
// 验证数据库集合
const db = wx.cloud.database()

Promise.all([
  db.collection('carpools').limit(1).get(),
  db.collection('carpool_participants').limit(1).get(),
  db.collection('users').limit(1).get()
]).then(results => {
  console.log('✅ 所有数据库集合创建成功!')
  console.log('carpools:', results[0])
  console.log('carpool_participants:', results[1])
  console.log('users:', results[2])
}).catch(error => {
  console.error('❌ 数据库验证失败:', error)
})
``` 
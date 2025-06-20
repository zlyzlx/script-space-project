# 剧本杀拼车小程序

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WeChat MiniProgram](https://img.shields.io/badge/WeChat-MiniProgram-green.svg)](https://developers.weixin.qq.com/miniprogram/dev/)
[![Node.js](https://img.shields.io/badge/Node.js-16.x-brightgreen.svg)](https://nodejs.org/)

一个基于微信小程序的剧本杀拼车社交平台，帮助剧本杀爱好者寻找同行伙伴，减少出行成本，提升游戏体验。

## 🎯 项目特色

- **智能匹配**：根据地点、时间、活动类型智能匹配拼车伙伴
- **安全可靠**：基于微信生态，实名认证，安全有保障
- **便捷沟通**：内置微信二维码生成，方便快速联系
- **数据统计**：详细的个人数据统计，了解自己的拼车历史
- **响应式设计**：完美适配各种手机屏幕，用户体验优良

## 📱 功能概览

### 🚗 拼车功能
- **发布拼车**：创建拼车信息，设置活动详情、时间、地点、人数等
- **搜索拼车**：多条件搜索，快速找到合适的拼车
- **参与拼车**：一键参与心仪的拼车活动
- **管理拼车**：组织者可以管理参与者，参与者可以随时退出

### 👤 个人中心
- **用户信息**：管理个人基本信息和偏好设置
- **历史记录**：查看参与过的所有拼车活动
- **数据统计**：发布数量、参与次数、服务人次等详细统计
- **微信二维码**：生成个人微信二维码，方便他人添加

### 🔍 搜索与筛选
- **地点搜索**：按目标地点搜索拼车
- **时间筛选**：今天、明天、本周等时间快速筛选
- **关键词搜索**：活动名称、地点关键词搜索
- **智能排序**：按时间、人气等多维度排序

## 🛠 技术架构

### 前端技术栈
- **框架**：微信小程序原生框架
- **语言**：JavaScript (ES6+)
- **样式**：WXSS (基于 CSS3)
- **UI组件**：微信小程序官方组件

### 后端技术栈
- **云函数**：Node.js 16.x
- **数据库**：微信云开发数据库 (MongoDB)
- **存储**：微信云开发云存储
- **部署**：微信云开发平台

### 核心特性
- **无服务器架构**：基于云开发，无需维护服务器
- **实时数据同步**：数据库实时更新，多端同步
- **弹性扩容**：根据用户量自动扩容，无需担心性能瓶颈
- **安全保障**：基于微信身份认证，数据安全可靠

## 📁 项目结构

```
script-space-project/
├── 📁 cloudfunctions/          # 云函数目录
│   ├── 📁 carpool-list/       # 获取拼车列表
│   ├── 📁 carpool-detail/     # 获取拼车详情
│   ├── 📁 carpool-create/     # 创建拼车
│   ├── 📁 carpool-update/     # 更新拼车信息
│   ├── 📁 carpool-join/       # 参与拼车
│   ├── 📁 carpool-quit/       # 退出拼车
│   ├── 📁 get-user-info/      # 获取用户信息
│   ├── 📁 update-user-info/   # 更新用户信息
│   ├── 📁 generate-qr-code/   # 生成微信二维码
│   └── 📁 get-qr-code/        # 获取二维码信息
├── 📁 pages/                  # 小程序页面
│   ├── 📁 index/             # 首页 - 拼车列表
│   ├── 📁 search/            # 搜索页
│   ├── 📁 publish/           # 发布拼车页
│   ├── 📁 detail/            # 拼车详情页
│   ├── 📁 profile/           # 个人中心
│   └── 📁 history/           # 历史记录页
├── 📁 utils/                 # 工具函数
│   ├── 📄 util.js            # 通用工具函数
│   └── 📄 dateUtils.js       # 日期处理工具
├── 📁 images/                # 图片资源
├── 📁 docs/                  # 项目文档
│   ├── 📄 API_REFERENCE.md   # API 参考文档
│   ├── 📄 DATABASE_DESIGN.md # 数据库设计文档
│   ├── 📄 DEVELOPMENT_GUIDE.md # 开发指南
│   └── 📄 DEPLOYMENT_GUIDE.md # 部署指南
├── 📄 app.js                # 应用入口文件
├── 📄 app.json              # 应用配置文件
├── 📄 app.wxss              # 全局样式文件
└── 📄 project.config.json   # 项目配置文件
```

## 🚀 快速开始

### 环境要求

- **微信开发者工具** 1.06.0 或更高版本
- **Node.js** 16.x 或更高版本
- **微信小程序账号**（已开通云开发）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-repo/script-space-project.git
   cd script-space-project
   ```

2. **导入微信开发者工具**
   - 打开微信开发者工具
   - 选择"导入项目"
   - 选择项目目录
   - 填入你的小程序 AppID

3. **配置云开发环境**
   ```javascript
   // 在 app.js 中配置你的环境 ID
   wx.cloud.init({
     env: 'your-env-id', // 替换为你的云开发环境 ID
     traceUser: true,
   });
   ```

4. **部署云函数**
   - 在微信开发者工具中右击 `cloudfunctions` 目录
   - 选择"创建并部署：云端安装依赖"
   - 等待所有云函数部署完成

5. **配置数据库**
   - 在云开发控制台创建以下集合：
     - `carpools` - 拼车信息表
     - `carpool_participants` - 参与者表
     - `users` - 用户信息表

### 预览运行

在微信开发者工具中点击"预览"按钮，使用手机微信扫码即可体验小程序。

## 📖 文档

我们提供了完整的技术文档来帮助你快速上手和深入了解项目：

### 📋 核心文档

| 文档 | 说明 | 链接 |
|------|------|------|
| **API 参考** | 详细的 API 接口文档 | [📄 API_REFERENCE.md](docs/API_REFERENCE.md) |
| **数据库设计** | 数据库表结构和关系 | [📄 DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) |
| **开发指南** | 开发规范和最佳实践 | [📄 DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) |
| **部署指南** | 完整的部署流程 | [📄 DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) |

### 🎯 快速导航

- **新手开发者**: 建议先阅读 [开发指南](docs/DEVELOPMENT_GUIDE.md)
- **API 调用**: 查看 [API 参考文档](docs/API_REFERENCE.md)
- **数据库操作**: 参考 [数据库设计文档](docs/DATABASE_DESIGN.md)
- **生产部署**: 遵循 [部署指南](docs/DEPLOYMENT_GUIDE.md)

## 🗄 数据库设计

### 核心数据表

| 集合名称 | 用途 | 主要字段 |
|---------|------|----------|
| `carpools` | 拼车信息 | 活动名称、地点、时间、人数限制 |
| `carpool_participants` | 参与记录 | 拼车ID、用户ID、参与状态 |
| `users` | 用户信息 | 昵称、头像、联系方式、统计数据 |

### 数据关系

```
users (1) -----> (N) carpools
  |                   |
  |                   |
  (N) <---- carpool_participants -----> (1)
```

详细的数据库设计请参考 [📄 数据库设计文档](docs/DATABASE_DESIGN.md)

## 🔌 API 接口

### 拼车相关 API

- `carpool-list` - 获取拼车列表（支持搜索和分页）
- `carpool-detail` - 获取拼车详情
- `carpool-create` - 创建新拼车
- `carpool-update` - 更新拼车信息
- `carpool-join` - 参与拼车
- `carpool-quit` - 退出拼车

### 用户相关 API

- `get-user-info` - 获取用户信息
- `update-user-info` - 更新用户信息
- `get-user-stats` - 获取用户统计数据
- `get-my-carpools` - 获取我发布的拼车
- `get-my-rides` - 获取我参与的拼车

### 二维码 API

- `generate-qr-code` - 生成微信二维码
- `get-qr-code` - 获取二维码信息

完整的 API 文档请查看 [📄 API 参考文档](docs/API_REFERENCE.md)

## 🎨 界面预览

### 主要页面

- **🏠 首页**: 展示最新的拼车信息，支持快速搜索
- **🔍 搜索页**: 多条件搜索，智能匹配
- **✏️ 发布页**: 简洁的发布流程，快速创建拼车
- **📋 详情页**: 详细的拼车信息和参与者列表
- **👤 个人中心**: 个人信息管理和数据统计
- **📚 历史记录**: 完整的参与历史

### 设计特点

- **🎯 简洁直观**: 遵循微信设计规范，用户上手容易
- **📱 响应式设计**: 完美适配各种屏幕尺寸
- **🚀 流畅交互**: 优化的动画效果和交互体验
- **🎨 现代风格**: 清新的色彩搭配和现代的设计语言

## 🚀 性能优化

### 前端优化

- **📦 代码分割**: 按需加载，减少首屏加载时间
- **🖼️ 图片优化**: 自动压缩和懒加载
- **💾 数据缓存**: 智能缓存策略，提升用户体验
- **🔄 状态管理**: 高效的数据状态管理

### 后端优化

- **📊 数据库索引**: 优化查询性能
- **⚡ 云函数优化**: 合理的资源配置和代码优化
- **🔧 连接池**: 数据库连接复用
- **📈 监控告警**: 完善的性能监控体系

## 🔒 安全保障

### 数据安全

- **🔐 微信认证**: 基于微信用户身份认证
- **🛡️ 权限控制**: 严格的数据访问权限控制
- **🔍 输入验证**: 全面的输入数据验证
- **📝 操作日志**: 完整的操作日志记录

### 隐私保护

- **👤 最小化原则**: 只收集必要的用户信息
- **🔒 数据加密**: 敏感数据加密存储
- **⏰ 自动清理**: 定期清理过期数据
- **📋 透明政策**: 明确的隐私政策说明

## 🧪 测试

### 测试策略

- **🔬 单元测试**: 核心功能单元测试
- **🔄 集成测试**: 端到端功能测试
- **📱 兼容性测试**: 多设备多系统兼容性测试
- **⚡ 性能测试**: 负载测试和性能优化

### 测试工具

- **Jest**: JavaScript 单元测试框架
- **微信开发者工具**: 小程序调试和测试
- **云开发控制台**: 云函数和数据库测试

## 📊 监控运维

### 实时监控

- **📈 性能监控**: 页面加载时间、API 响应时间
- **🚨 错误监控**: 自动错误收集和告警
- **👥 用户行为**: 用户操作路径和行为分析
- **💾 资源使用**: 数据库、存储、云函数资源监控

### 日志系统

- **📋 操作日志**: 用户操作行为记录
- **⚠️ 错误日志**: 系统错误和异常记录
- **📊 性能日志**: 系统性能指标记录
- **🔍 分析工具**: 日志分析和数据可视化

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

### 贡献流程

1. **🍴 Fork 项目** 到你的 GitHub 账户
2. **🌿 创建特性分支** (`git checkout -b feature/amazing-feature`)
3. **💾 提交更改** (`git commit -m 'Add some amazing feature'`)
4. **📤 推送分支** (`git push origin feature/amazing-feature`)
5. **🔄 创建 Pull Request**

### 代码规范

- **📝 代码风格**: 遵循项目的 ESLint 配置
- **📖 注释规范**: 重要功能需要添加详细注释
- **🧪 测试要求**: 新功能需要添加对应测试
- **📚 文档更新**: 重要变更需要更新文档

### 问题反馈

- **🐛 Bug 报告**: 使用 Issues 模板报告问题
- **💡 功能建议**: 详细描述新功能需求
- **❓ 使用问题**: 先查看文档和 FAQ
- **📧 联系方式**: 重要问题可直接联系维护者

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

感谢以下项目和团队的支持：

- **微信小程序团队** - 提供优秀的开发平台
- **微信云开发** - 提供稳定的后端服务
- **开源社区** - 提供各种优秀的工具和库

## 📞 联系我们

如果你有任何问题或建议，欢迎通过以下方式联系我们：

- **📧 邮箱**: your-email@example.com
- **📱 微信**: your-wechat-id
- **🐙 GitHub**: [项目地址](https://github.com/your-repo/script-space-project)

---

**🎭 让剧本杀更有趣，让拼车更简单！**

> 如果这个项目对你有帮助，请给它一个 ⭐️ Star！ 

## 功能特色

- 🎭 **专为剧本杀定制** - 针对剧本杀活动的特殊需求设计
- 🚗 **便捷拼车** - 快速发布和参与拼车活动  
- 👥 **社交互动** - 认识更多剧本杀爱好者
- 💰 **费用分摊** - 透明的费用计算和分摊
- 📱 **移动优先** - 原生微信小程序体验

## 快速开始

### 1. 环境准备

- 微信开发者工具
- 微信小程序账号
- 云开发环境

### 2. 项目设置

1. 克隆项目到本地
2. 使用微信开发者工具打开项目
3. 配置云开发环境ID

### 3. 数据库初始化

首次使用前需要初始化数据库：

#### 方法一：使用微信开发者工具

1. 在微信开发者工具中打开项目
2. 打开调试器控制台
3. 运行以下代码：

```javascript
wx.cloud.callFunction({
  name: 'db-init',
  data: {
    createTestData: true  // 设置为 true 会创建测试数据
  }
}).then(result => {
  console.log('数据库初始化成功:', result)
}).catch(error => {
  console.error('数据库初始化失败:', error)
})
```

#### 方法二：使用云函数控制台

1. 在微信开发者工具中进入云函数页面
2. 找到 `db-init` 云函数
3. 点击测试，输入参数：`{"createTestData": true}`
4. 点击运行

### 4. 云函数部署

确保所有云函数都已正确部署：

```bash
# 进入云函数目录
cd cloudfunctions

# 为每个云函数安装依赖（如果未安装）
for func in carpool-list carpool-detail carpool-create carpool-update carpool-join carpool-quit get-user-info update-user-info get-user-stats get-my-carpools get-my-rides get-user-qrcode generate-wechat-qr user-info user-update user-carpools user-rides db-init; do
  echo "安装 $func 依赖..."
  cd $func
  npm install
  cd ..
done
```

### 5. 测试功能

初始化完成后，可以测试以下功能：

- ✅ 查看拼车列表（会显示测试数据）
- ✅ 发布拼车信息
- ✅ 参与拼车活动
- ✅ 查看个人中心统计

## 项目结构

```
├── pages/                 # 页面文件
│   ├── index/             # 首页
│   ├── carpool/           # 拼车相关页面
│   ├── profile/           # 个人中心
│   └── ...
├── cloudfunctions/        # 云函数
│   ├── carpool-list/      # 拼车列表
│   ├── carpool-create/    # 创建拼车
│   ├── db-init/           # 数据库初始化
│   └── ...
├── components/            # 组件
├── utils/                 # 工具函数
└── docs/                  # 文档
```

## 数据库结构

### carpools 集合
- `activityName`: 活动名称
- `date`: 活动日期  
- `time`: 活动时间
- `location`: 地点
- `maxCount`: 最大人数
- `price`: 费用
- `status`: 状态（招募中/已满员/已结束）
- `organizerId`: 组织者ID

### carpool_participants 集合
- `carpoolId`: 拼车ID
- `userId`: 参与者ID
- `status`: 参与状态
- `joinTime`: 加入时间

### users 集合
- `nickname`: 昵称
- `avatar`: 头像
- `createTime`: 创建时间

## 开发指南

### 添加新功能

1. 在对应页面目录创建页面文件
2. 如需后端支持，在 `cloudfunctions` 目录创建云函数
3. 更新路由配置 `app.json`

### 调试技巧

- 使用微信开发者工具的调试器查看日志
- 在云函数中使用 `console.log` 输出调试信息
- 检查云开发控制台的数据库和日志

## 常见问题

### Q: 拼车列表为空？
A: 请确保已运行数据库初始化脚本并设置 `createTestData: true`

### Q: 云函数调用失败？
A: 检查云函数是否已正确部署，依赖是否已安装

### Q: 用户登录问题？
A: 确保已配置正确的云开发环境ID

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

## 许可证

[MIT License](LICENSE)

---

�� 让我们一起打造更好的剧本杀拼车体验！ 
# TabBar 图标快速生成指南

## 🚀 快速开始

### 方法一：使用图标生成器（推荐）

1. **打开图标生成器**
   ```bash
   # 在浏览器中打开
   open scripts/icon-generator.html
   ```

2. **生成图标**
   - 页面会自动预览所有图标
   - 点击"生成并下载图标"按钮
   - 浏览器会自动下载6个图标文件

3. **放置图标**
   ```bash
   # 将下载的文件移动到项目目录
   mv ~/Downloads/*.png images/tab/
   ```

4. **配置 app.json**
   ```json
   {
     "tabBar": {
       "list": [
         {
           "pagePath": "pages/index/index",
           "text": "首页",
           "iconPath": "images/tab/home.png",
           "selectedIconPath": "images/tab/home-active.png"
         },
         {
           "pagePath": "pages/carpool/list",
           "text": "拼车",
           "iconPath": "images/tab/carpool.png",
           "selectedIconPath": "images/tab/carpool-active.png"
         },
         {
           "pagePath": "pages/profile/profile",
           "text": "我的",
           "iconPath": "images/tab/profile.png",
           "selectedIconPath": "images/tab/profile-active.png"
         }
       ]
     }
   }
   ```

### 方法二：手动下载图标

1. **访问图标网站**
   - [IconFont](https://www.iconfont.cn/) 
   - [Feather Icons](https://feathericons.com/)

2. **搜索并下载**
   - 搜索：home, car, user
   - 格式：PNG
   - 尺寸：81x81px

3. **重命名文件**
   ```
   home.png (灰色版本)
   home-active.png (蓝色版本)
   carpool.png (灰色版本)
   carpool-active.png (蓝色版本)
   profile.png (灰色版本)
   profile-active.png (蓝色版本)
   ```

## 📁 文件结构

```
images/
└── tab/
    ├── home.png
    ├── home-active.png
    ├── carpool.png
    ├── carpool-active.png
    ├── profile.png
    └── profile-active.png
```

## 🎨 设计规范

- **尺寸**: 81x81 像素
- **格式**: PNG
- **普通状态**: #7A7E83 (灰色)
- **选中状态**: #667eea (蓝色)
- **背景**: 透明

## ✅ 验证步骤

1. 确保所有图标文件存在
2. 检查文件名拼写正确
3. 在微信开发者工具中预览
4. 测试tab切换功能

## 🔧 故障排除

**问题**: 图标不显示
- 检查文件路径是否正确
- 确认文件名大小写匹配
- 验证图标文件是否存在

**问题**: 图标模糊
- 确保图标尺寸为81x81像素
- 使用高质量的PNG文件

---

💡 **提示**: 使用图标生成器是最快的方法，只需要几分钟就能完成所有图标的创建和配置！ 
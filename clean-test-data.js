// 清理测试数据脚本
// 在微信开发者工具的云开发控制台中运行此脚本

// 方法1: 在云开发控制台中直接删除 carpool_participants 集合中的测试数据
// 1. 打开微信开发者工具
// 2. 点击"云开发"
// 3. 进入"数据库"
// 4. 选择 carpool_participants 集合
// 5. 删除所有测试记录

// 方法2: 使用云函数清理数据
wx.cloud.callFunction({
  name: 'clean-test-data', // 需要创建这个云函数
  data: {},
  success: res => {
    console.log('清理测试数据成功:', res)
  },
  fail: err => {
    console.error('清理测试数据失败:', err)
  }
})

// 方法3: 在控制台中运行以下代码清理数据
/*
在云开发控制台的数据库中，选择 carpool_participants 集合，
然后点击"批量操作" -> "删除所有记录"
或者使用筛选条件删除特定的测试数据
*/ 
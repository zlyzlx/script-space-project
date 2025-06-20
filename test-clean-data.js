// 在微信开发者工具的控制台中运行此代码来清理测试数据

// 1. 首先部署 clean-test-data 云函数
// 2. 然后运行以下代码

wx.cloud.callFunction({
  name: 'clean-test-data',
  data: {},
  success: res => {
    console.log('✅ 清理测试数据成功:', res.result)
    if (res.result.success) {
      console.log('📊 清理详情:')
      console.log(`- 删除的参与者记录: ${res.result.details.deletedParticipants} 条`)
      console.log(`- 重置的拼车记录: ${res.result.details.resetCarpools} 条`)
      console.log(`- 剩余参与者记录: ${res.result.details.finalParticipantsCount} 条`)
      console.log(`- 招募中的拼车: ${res.result.details.finalRecruitingCarpools} 条`)
      console.log('🎉 现在拼车列表的人数应该显示为 0/X 了！')
    }
  },
  fail: err => {
    console.error('❌ 清理测试数据失败:', err)
  }
})

// 如果你想手动清理，也可以在云开发控制台中：
// 1. 进入"数据库"
// 2. 选择 "carpool_participants" 集合
// 3. 删除所有记录
// 4. 选择 "carpools" 集合
// 5. 将所有记录的 status 字段改为 "招募中" 
// 数据库初始化云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    console.log('开始初始化数据库...')
    
    // 1. 创建拼车信息集合的索引
    try {
      await db.collection('carpools').add({
        data: {
          _id: 'init_doc',
          title: '初始化文档',
          description: '用于创建集合，稍后会删除',
          createdAt: new Date()
        }
      })
      console.log('carpools 集合创建成功')
      
      // 删除初始化文档
      await db.collection('carpools').doc('init_doc').remove()
      
      // 创建索引
      await db.collection('carpools').createIndex({
        keys: {
          createdAt: -1
        },
        name: 'createdAt_index'
      })
      
      await db.collection('carpools').createIndex({
        keys: {
          departureTime: 1
        },
        name: 'departureTime_index'
      })
      
      await db.collection('carpools').createIndex({
        keys: {
          status: 1
        },
        name: 'status_index'
      })
      
    } catch (error) {
      console.log('carpools 集合可能已存在:', error.message)
    }
    
    // 2. 创建拼车参与者集合
    try {
      await db.collection('carpool_participants').add({
        data: {
          _id: 'init_doc',
          carpoolId: 'init',
          createdAt: new Date()
        }
      })
      console.log('carpool_participants 集合创建成功')
      
      // 删除初始化文档
      await db.collection('carpool_participants').doc('init_doc').remove()
      
      // 创建索引
      await db.collection('carpool_participants').createIndex({
        keys: {
          carpoolId: 1
        },
        name: 'carpoolId_index'
      })
      
      await db.collection('carpool_participants').createIndex({
        keys: {
          _openid: 1
        },
        name: 'openid_index'
      })
      
    } catch (error) {
      console.log('carpool_participants 集合可能已存在:', error.message)
    }
    
    // 3. 创建用户信息集合
    try {
      await db.collection('users').add({
        data: {
          _id: 'init_doc',
          nickName: '初始化用户',
          createdAt: new Date()
        }
      })
      console.log('users 集合创建成功')
      
      // 删除初始化文档
      await db.collection('users').doc('init_doc').remove()
      
      // 创建索引
      await db.collection('users').createIndex({
        keys: {
          _openid: 1
        },
        name: 'openid_index'
      })
      
      await db.collection('users').createIndex({
        keys: {
          createdAt: -1
        },
        name: 'createdAt_index'
      })
      
    } catch (error) {
      console.log('users 集合可能已存在:', error.message)
    }
    
    // 4. 创建测试数据（如果指定了 createTestData 参数）
    if (event.createTestData) {
      await createTestData()
    }
    
    // 初始化联系记录集合
    try {
      await db.createCollection('contact_records')
      console.log('联系记录集合创建成功')
    } catch (e) {
      console.log('联系记录集合已存在或创建失败：', e)
    }
    
    console.log('数据库初始化完成!')
    
    return {
      success: true,
      message: '数据库初始化完成，包括用户、拼局、行程记录和联系记录集合',
      collections: ['carpools', 'carpool_participants', 'users'],
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    }
    
  } catch (error) {
    console.error('数据库初始化失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 创建测试数据
async function createTestData() {
  try {
    console.log('开始创建测试数据...')
    
    // 创建测试用户
    const testUsers = [
      {
        _openid: 'test_user_1',
        nickName: '剧本杀爱好者',
        nickname: '剧本杀爱好者', // 兼容性字段
        avatarUrl: '',
        avatar: '', // 兼容性字段
        createTime: new Date(),
        updateTime: new Date()
      },
      {
        _openid: 'test_user_2', 
        nickName: '拼车达人',
        nickname: '拼车达人', // 兼容性字段
        avatarUrl: '',
        avatar: '', // 兼容性字段
        createTime: new Date(),
        updateTime: new Date()
      },
      {
        _openid: 'test_user_3',
        nickName: '社交高手',
        nickname: '社交高手', // 兼容性字段
        avatarUrl: '',
        avatar: '', // 兼容性字段
        createTime: new Date(),
        updateTime: new Date()
      }
    ]
    
    for (const user of testUsers) {
      try {
        await db.collection('users').add({ data: user })
        console.log(`创建测试用户: ${user.nickName}`)
      } catch (error) {
                  console.log(`用户 ${user.nickName} 可能已存在`)
      }
    }
    
    // 创建测试拼车
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfterTomorrow = new Date()
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
    
    const testCarpools = [
      {
        activityName: '《明日之后》沉浸式剧本杀',
        date: tomorrow.toISOString().split('T')[0],
        time: '14:00',
        location: '三里屯剧本杀馆',
        fullAddress: '朝阳区三里屯SOHO',
        maxCount: 6,
        price: 45,
        description: '末日题材剧本，需要6人，适合新手',
        requirements: '无经验要求',
        notes: '提供饮料和小食',
        organizerId: 'test_user_1',
        status: '招募中',
        publishTime: new Date(),
        updateTime: new Date()
      },
      {
        activityName: '《长安十二时辰》古风本',
        date: dayAfterTomorrow.toISOString().split('T')[0],
        time: '19:30',
        location: '王府井剧本推理馆',
        fullAddress: '东城区王府井大街',
        maxCount: 8,
        price: 68,
        description: '古风推理本，剧情丰富，角色饱满',
        requirements: '有一定剧本杀经验',
        notes: '古装道具齐全',
        organizerId: 'test_user_2',
        status: '招募中',
        publishTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
        updateTime: new Date()
      },
      {
        activityName: '《都市传说》恐怖本',
        date: tomorrow.toISOString().split('T')[0],
        time: '20:00',
        location: 'CBD密室逃脱馆',
        fullAddress: '朝阳区国贸中心',
        maxCount: 4,
        price: 88,
        description: '高难度恐怖本，胆小勿入！',
        requirements: '需要有恐怖本经验',
        notes: '18岁以下禁止参与',
        organizerId: 'test_user_3',
        status: '已满员',
        publishTime: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6小时前
        updateTime: new Date()
      }
    ]
    
    for (const carpool of testCarpools) {
      try {
        const result = await db.collection('carpools').add({ data: carpool })
        console.log(`创建测试拼车: ${carpool.activityName}`)
        
        // 为已满员的拼车创建参与者记录
        if (carpool.status === '已满员') {
          for (let i = 0; i < carpool.maxCount; i++) {
            const userId = i === 0 ? carpool.organizerId : `test_participant_${i}`
            await db.collection('carpool_participants').add({
              data: {
                carpoolId: result._id,
                userId: userId,
                status: 'active',
                joinTime: new Date(Date.now() - 1000 * 60 * 60 * (6 - i)) // 不同时间加入
              }
            })
          }
        }
      } catch (error) {
        console.log(`拼车 ${carpool.activityName} 可能已存在`)
      }
    }
    
    console.log('测试数据创建完成!')
    
  } catch (error) {
    console.error('创建测试数据失败:', error)
    throw error
  }
} 
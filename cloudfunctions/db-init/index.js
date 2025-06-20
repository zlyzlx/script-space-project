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
    
    console.log('数据库初始化完成!')
    
    return {
      success: true,
      message: '数据库初始化成功',
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
import { tmdbClient } from '../services/tmdbClient';

/**
 * 测试TMDb API连接
 * 用于验证API Key是否有效
 */
async function testTMDbConnection() {
  try {
    console.log('正在测试TMDb API连接...');
    
    const isConnected = await tmdbClient.testConnection();
    
    if (isConnected) {
      console.log('✅ TMDb API连接成功！');
      
      // 获取配置详情
      const config = await tmdbClient.getConfiguration();
      console.log('API配置信息:', JSON.stringify(config, null, 2));
      
      // 测试搜索功能
      const searchResult = await tmdbClient.searchTvShow('Stranger Things');
      console.log(`搜索结果包含 ${searchResult.results.length} 个项目`);
      if (searchResult.results.length > 0) {
        console.log('第一个结果:', {
          id: searchResult.results[0].id,
          name: searchResult.results[0].name,
          overview: searchResult.results[0].overview.slice(0, 100) + '...'
        });
      }
    } else {
      console.error('❌ TMDb API连接失败！请检查您的API Key是否有效。');
    }
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 执行测试
testTMDbConnection().catch(console.error); 
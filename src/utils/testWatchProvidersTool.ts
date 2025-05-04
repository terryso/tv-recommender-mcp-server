import { getWatchProviders } from '../tools/watchProviders';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 测试观看渠道查询工具
 */
async function testWatchProviders() {
  try {
    console.log('正在测试观看渠道查询工具...');
    
    // 测试美国地区的《绝命毒师》观看渠道
    console.log('\n测试一: 查询《绝命毒师》在美国的观看渠道');
    const result1 = await getWatchProviders({ show_title: '绝命毒师' });
    console.log(JSON.stringify(result1, null, 2));
    
    // 测试自定义国家/地区代码
    console.log('\n测试二: 查询《绝命毒师》在英国的观看渠道');
    const result2 = await getWatchProviders({ show_title: '绝命毒师', country_code: 'GB' });
    console.log(JSON.stringify(result2, null, 2));
    
    // 测试英文剧集名称
    console.log('\n测试三: 使用英文名称查询《怪奇物语》的观看渠道');
    const result3 = await getWatchProviders({ show_title: 'Stranger Things' });
    console.log(JSON.stringify(result3, null, 2));
    
    // 测试《永航员》在香港的观看渠道
    console.log('\n测试: 查询《永航员》在香港的观看渠道');
    const result = await getWatchProviders({ show_title: '永航员', country_code: 'HK' });
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n所有测试完成!');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 执行测试
testWatchProviders(); 
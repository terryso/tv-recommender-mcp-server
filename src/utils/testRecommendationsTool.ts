import { getRecommendationsByGenre, GetRecommendationsByGenreParams } from '../tools';

/**
 * 测试按类型获取推荐功能
 * 用于验证getRecommendationsByGenre工具是否正常工作
 */
async function testRecommendationsTool() {
  try {
    console.log('========== 测试按类型获取推荐工具 ==========');
    
    // 测试用例1：测试有效的中文类型
    console.log('\n测试用例1: 有效的中文类型 - "喜剧"');
    const result1 = await getRecommendationsByGenre({ genre: '喜剧' });
    console.log(result1);
    
    // 测试用例2：测试有效的英文类型
    console.log('\n测试用例2: 有效的英文类型 - "Drama"');
    const result2 = await getRecommendationsByGenre({ genre: 'Drama' });
    console.log(result2);
    
    // 测试用例3：测试类型别名
    console.log('\n测试用例3: 类型别名 - "科幻"');
    const result3 = await getRecommendationsByGenre({ genre: '科幻' });
    console.log(result3);
    
    // 测试用例4：测试无效的类型
    console.log('\n测试用例4: 无效的类型 - "不存在的类型"');
    const result4 = await getRecommendationsByGenre({ genre: '不存在的类型' });
    console.log(result4);
    
    // 测试用例5：测试空类型
    console.log('\n测试用例5: 空类型');
    const result5 = await getRecommendationsByGenre({ genre: '' });
    console.log(result5);
    
    console.log('\n========== 测试完成 ==========');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 执行测试
testRecommendationsTool().catch(console.error); 
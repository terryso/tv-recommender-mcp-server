import { getSimilarShows, GetSimilarShowsParams } from '../tools';

/**
 * 测试获取相似剧集功能
 * 用于验证getSimilarShows工具是否正常工作
 */
async function testSimilarShowsTool() {
  try {
    console.log('========== 测试获取相似剧集工具 ==========');
    
    // 测试用例1：测试有效的中文剧名
    console.log('\n测试用例1: 有效的中文剧名 - "怪奇物语"');
    const result1 = await getSimilarShows({ show_title: '怪奇物语' });
    console.log(result1);
    
    // 测试用例2：测试有效的英文剧名
    console.log('\n测试用例2: 有效的英文剧名 - "Breaking Bad"');
    const result2 = await getSimilarShows({ show_title: 'Breaking Bad' });
    console.log(result2);
    
    // 测试用例3：测试其他流行剧
    console.log('\n测试用例3: 其他流行剧 - "权力的游戏"');
    const result3 = await getSimilarShows({ show_title: '权力的游戏' });
    console.log(result3);
    
    // 测试用例4：测试无效的剧名
    console.log('\n测试用例4: 无效的剧名 - "这部剧不存在"');
    const result4 = await getSimilarShows({ show_title: '这部剧不存在' });
    console.log(result4);
    
    // 测试用例5：测试空剧名
    console.log('\n测试用例5: 空剧名');
    const result5 = await getSimilarShows({ show_title: '' });
    console.log(result5);
    
    console.log('\n========== 测试完成 ==========');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 执行测试
testSimilarShowsTool().catch(console.error); 
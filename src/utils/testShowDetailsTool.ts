/**
 * 测试剧集详情工具
 * 用于验证get_show_details工具是否正常工作
 */

import dotenv from 'dotenv';
import { getShowDetails } from '../tools';

// 加载环境变量
dotenv.config();

/**
 * 测试剧集详情获取功能
 */
async function testShowDetails() {
  // 测试用剧集名称
  const testCases = [
    { title: '西部世界', expected: '西部世界' },
    { title: 'Breaking Bad', expected: '绝命毒师' },
    { title: '一部不存在的剧', expected: '抱歉，未能找到' }
  ];

  console.log('开始测试剧集详情工具...\n');

  // 遍历测试用例
  for (const testCase of testCases) {
    console.log(`测试剧集名称: "${testCase.title}"`);
    try {
      const result = await getShowDetails({ show_title: testCase.title });
      
      // 输出结果
      if (typeof result === 'string') {
        console.log('返回错误信息:', result);
        // 检查错误消息是否符合预期
        if (result.includes(testCase.expected)) {
          console.log('✅ 测试通过: 符合预期的错误消息\n');
        } else {
          console.log('❌ 测试失败: 错误消息不符合预期\n');
        }
      } else {
        console.log('返回剧集详情:');
        console.log(JSON.stringify(result, null, 2));
        
        // 检查结果是否包含预期剧名
        if (result.title.includes(testCase.expected)) {
          console.log('✅ 测试通过: 剧集名称符合预期\n');
        } else {
          console.log('❌ 测试失败: 剧集名称不符合预期\n');
        }
      }
    } catch (error) {
      console.error('测试出错:', error);
      console.log('❌ 测试失败: 发生异常\n');
    }
  }

  console.log('剧集详情工具测试完成');
}

// 执行测试
testShowDetails().catch(error => {
  console.error('测试过程发生错误:', error);
  process.exit(1);
}); 
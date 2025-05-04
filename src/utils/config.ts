import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 配置接口
 */
export interface Config {
  tmdbApiKey: string;
  logLevel: string;
  isTestEnv: boolean;
}

/**
 * 从环境变量中获取配置
 */
export function getConfig(): Config {
  const isTestEnv = process.env.NODE_ENV === 'test';
  
  // 验证必要的环境变量
  let tmdbApiKey = process.env.TMDB_API_KEY;
  
  // 在测试环境中，如果没有提供API密钥，使用测试密钥
  if (!tmdbApiKey && isTestEnv) {
    tmdbApiKey = 'test_api_key_for_testing';
  } else if (!tmdbApiKey) {
    throw new Error('缺少必要的环境变量: TMDB_API_KEY');
  }
  
  return {
    tmdbApiKey,
    logLevel: process.env.LOG_LEVEL || 'info',
    isTestEnv
  };
}

// 导出默认配置
export default getConfig(); 
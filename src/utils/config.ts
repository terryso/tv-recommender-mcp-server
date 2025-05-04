import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 配置接口
 */
export interface Config {
  tmdbApiKey: string;
  logLevel: string;
}

/**
 * 从环境变量中获取配置
 */
export function getConfig(): Config {
  // 验证必要的环境变量
  const tmdbApiKey = process.env.TMDB_API_KEY;
  if (!tmdbApiKey) {
    throw new Error('缺少必要的环境变量: TMDB_API_KEY');
  }
  
  return {
    tmdbApiKey,
    logLevel: process.env.LOG_LEVEL || 'info'
  };
}

// 导出默认配置
export default getConfig(); 
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 配置接口
 */
export interface Config {
  tmdbApiKey: string | null;
  logLevel: string;
}

/**
 * 从环境变量中获取配置
 */
export function getConfig(): Config {
  return {
    tmdbApiKey: process.env.TMDB_API_KEY || null,
    logLevel: process.env.LOG_LEVEL || 'info'
  };
}

/**
 * 验证API密钥
 * 只在实际需要使用API时调用此函数
 * @throws Error 如果API密钥不存在
 */
export function validateApiKey(): string {
  const { tmdbApiKey } = getConfig();
  if (!tmdbApiKey) {
    throw new Error('缺少必要的环境变量: TMDB_API_KEY');
  }
  return tmdbApiKey;
}

// 导出默认配置
export default getConfig(); 
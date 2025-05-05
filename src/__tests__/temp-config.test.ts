import { getConfig, validateApiKey } from '../utils/config';

describe('Config Test', () => {
  // 保存原始环境变量
  const originalEnv = process.env;

  beforeEach(() => {
    // 设置环境变量
    process.env = { ...originalEnv };
    process.env.TMDB_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    // 恢复环境变量
    process.env = originalEnv;
  });

  it('getConfig应该正确返回配置', () => {
    const config = getConfig();
    expect(config.tmdbApiKey).toBe('test-api-key');
  });

  it('validateApiKey应该正确验证API密钥', () => {
    const apiKey = validateApiKey();
    expect(apiKey).toBe('test-api-key');
  });
}); 
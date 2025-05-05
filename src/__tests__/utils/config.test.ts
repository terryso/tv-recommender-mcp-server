import { getConfig, validateApiKey } from '../../utils/config';

// 模拟dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// 在导入config前模拟环境变量
jest.mock('../../utils/config', () => {
  // 设置默认环境变量
  process.env.TMDB_API_KEY = 'test-api-key';
  
  // 返回实际的模块，但使用我们的模拟环境变量
  const actualModule = jest.requireActual('../../utils/config');
  return {
    ...actualModule
  };
});

describe('Config Utils', () => {
  // 保存原始环境变量
  const originalEnv = process.env;

  beforeEach(() => {
    // 在每次测试前重置环境变量
    process.env = { ...originalEnv };
    jest.resetModules(); // 清除模块缓存
  });

  afterEach(() => {
    // 测试后恢复环境变量
    process.env = originalEnv;
  });

  it('应该正确获取配置，包含所有环境变量', () => {
    // 设置测试用的环境变量
    process.env.TMDB_API_KEY = 'test-api-key';
    
    const config = getConfig();
    
    expect(config).toHaveProperty('tmdbApiKey', 'test-api-key');
    expect(config).toHaveProperty('logLevel', 'info'); // 默认值
  });

  it('getConfig不应该在TMDB_API_KEY未设置时抛出错误', () => {
    // 测试API密钥未设置的情况
    process.env = { ...originalEnv };
    delete process.env.TMDB_API_KEY;
    
    const config = getConfig();
    expect(config.tmdbApiKey).toBeNull();
  });

  it('validateApiKey应该在API密钥未设置时抛出错误', () => {
    // 测试API密钥未设置时验证函数的行为
    process.env = { ...originalEnv };
    delete process.env.TMDB_API_KEY;
    
    expect(() => validateApiKey()).toThrow('缺少必要的环境变量: TMDB_API_KEY');
  });

  it('validateApiKey应该在API密钥已设置时返回密钥', () => {
    // 测试API密钥已设置时验证函数的行为
    process.env.TMDB_API_KEY = 'valid-key';
    
    const apiKey = validateApiKey();
    expect(apiKey).toBe('valid-key');
  });

  it('应该使用自定义的LOG_LEVEL环境变量', () => {
    // 设置测试用的环境变量
    process.env.TMDB_API_KEY = 'test-api-key';
    process.env.LOG_LEVEL = 'debug';
    
    const config = getConfig();
    
    expect(config).toHaveProperty('tmdbApiKey', 'test-api-key');
    expect(config).toHaveProperty('logLevel', 'debug');
  });
}); 
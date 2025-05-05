import axios from 'axios';
import * as config from '../utils/config';
import TMDbClient from '../services/tmdbClient';

// 模拟axios和config模块
jest.mock('axios');
jest.mock('../utils/config', () => ({
  validateApiKey: jest.fn().mockReturnValue('test-api-key')
}));

describe('TMDbClient Lazy Loading Test', () => {
  let client: TMDbClient;
  let mockAxiosGet: jest.Mock;
  let axiosCreateSpy: jest.SpyInstance;

  beforeEach(() => {
    // 清除所有模拟
    jest.clearAllMocks();
    
    // 创建模拟的axios get方法
    mockAxiosGet = jest.fn();
    
    // 监视axios.create并返回带有get方法的模拟
    axiosCreateSpy = jest.spyOn(axios, 'create').mockReturnValue({
      get: mockAxiosGet
    } as any);
    
    // 创建客户端实例
    client = new TMDbClient();
  });

  it('初始化时不应该调用validateApiKey或创建axios实例', () => {
    // 验证构造函数时不调用validateApiKey和axios.create
    expect(config.validateApiKey).not.toHaveBeenCalled();
    expect(axiosCreateSpy).not.toHaveBeenCalled();
  });

  it('调用方法时应该懒加载客户端', async () => {
    // 模拟成功响应
    mockAxiosGet.mockResolvedValueOnce({ status: 200 });
    
    // 调用方法，触发懒加载
    await client.testConnection();
    
    // 验证validateApiKey和axios.create被调用
    expect(config.validateApiKey).toHaveBeenCalledTimes(1);
    expect(axiosCreateSpy).toHaveBeenCalledTimes(1);
    expect(axiosCreateSpy).toHaveBeenCalledWith({
      baseURL: 'https://api.themoviedb.org/3',
      params: {
        api_key: 'test-api-key',
        language: 'zh-CN'
      }
    });
  });

  it('多次调用方法应该只初始化一次客户端', async () => {
    // 模拟成功响应
    mockAxiosGet.mockResolvedValue({ status: 200 });
    
    // 调用方法两次
    await client.testConnection();
    await client.testConnection();
    
    // 验证validateApiKey和axios.create只被调用一次
    expect(config.validateApiKey).toHaveBeenCalledTimes(1);
    expect(axiosCreateSpy).toHaveBeenCalledTimes(1);
  });
}); 
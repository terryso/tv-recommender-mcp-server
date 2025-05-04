import axios from 'axios';
import TMDbClient, { tmdbClient } from '../services/tmdbClient';
import config from '../utils/config';

// 获取真实 tmdbClient 实例，我们需要测试其实际实例而不是创建新实例
jest.mock('../services/tmdbClient', () => {
  const actual = jest.requireActual('../services/tmdbClient');
  return {
    ...actual,
    // 保持默认导出和单例导出
    tmdbClient: actual.tmdbClient
  };
});

// 模拟 axios
jest.mock('axios', () => {
  return {
    create: jest.fn().mockReturnValue({
      get: jest.fn()
    })
  };
});

// 模拟配置
jest.mock('../utils/config', () => ({
  tmdbApiKey: 'test-api-key'
}));

describe('TMDbClient', () => {
  let mockAxiosGet: jest.Mock;

  beforeEach(() => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 获取已创建的 axios 实例的 get 方法
    const mockAxiosInstance = (tmdbClient as unknown as { client: { get: jest.Mock } }).client;
    mockAxiosGet = mockAxiosInstance.get;
  });

  it('测试连接应该返回正确结果', async () => {
    // 成功情况
    mockAxiosGet.mockResolvedValueOnce({ status: 200 });
    expect(await tmdbClient.testConnection()).toBe(true);

    // 失败情况
    mockAxiosGet.mockRejectedValueOnce(new Error('连接失败'));
    expect(await tmdbClient.testConnection()).toBe(false);
  });

  it('getConfiguration应该正确调用API', async () => {
    const mockResponse = { data: { images: { base_url: 'http://image.tmdb.org/' } } };
    mockAxiosGet.mockResolvedValueOnce(mockResponse);

    const result = await tmdbClient.getConfiguration();
    
    expect(mockAxiosGet).toHaveBeenCalledWith('/configuration');
    expect(result).toEqual(mockResponse.data);
  });

  it('getConfiguration应该处理错误', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API错误'));
    
    await expect(tmdbClient.getConfiguration()).rejects.toThrow('获取TMDb配置失败');
  });

  it('searchTvShow应该正确调用API', async () => {
    const mockResponse = { data: { results: [] } };
    mockAxiosGet.mockResolvedValueOnce(mockResponse);

    const result = await tmdbClient.searchTvShow('测试剧集');
    
    expect(mockAxiosGet).toHaveBeenCalledWith('/search/tv', {
      params: { query: '测试剧集' }
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('searchTvShow应该处理错误', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API错误'));
    
    await expect(tmdbClient.searchTvShow('测试剧集')).rejects.toThrow('查询TV节目');
  });

  it('getRecommendationsByGenre应该正确调用API', async () => {
    const mockResponse = { data: { results: [{}, {}, {}] } };
    mockAxiosGet.mockResolvedValueOnce(mockResponse);

    const result = await tmdbClient.getRecommendationsByGenre(35, 2);
    
    expect(mockAxiosGet).toHaveBeenCalledWith('/discover/tv', {
      params: {
        with_genres: 35,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 100,
        page: 1
      }
    });
    // 验证结果被限制为2个
    expect(result.results.length).toBe(2);
  });

  it('getRecommendationsByGenre应该处理错误', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API错误'));
    
    await expect(tmdbClient.getRecommendationsByGenre(35)).rejects.toThrow('获取类型ID 35 的推荐失败');
  });

  it('getTvGenres应该正确调用API', async () => {
    const mockResponse = { data: { genres: [] } };
    mockAxiosGet.mockResolvedValueOnce(mockResponse);

    const result = await tmdbClient.getTvGenres();
    
    expect(mockAxiosGet).toHaveBeenCalledWith('/genre/tv/list');
    expect(result).toEqual(mockResponse.data);
  });

  it('getTvGenres应该处理错误', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API错误'));
    
    await expect(tmdbClient.getTvGenres()).rejects.toThrow('获取TV类型列表失败');
  });

  it('searchTvShowByTitle应该正确调用API', async () => {
    const mockResponse = { data: { results: [] } };
    mockAxiosGet.mockResolvedValueOnce(mockResponse);

    const result = await tmdbClient.searchTvShowByTitle('测试剧集');
    
    expect(mockAxiosGet).toHaveBeenCalledWith('/search/tv', {
      params: {
        query: '测试剧集',
        page: 1
      }
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('searchTvShowByTitle应该处理错误', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API错误'));
    
    await expect(tmdbClient.searchTvShowByTitle('测试剧集')).rejects.toThrow('搜索剧集');
  });

  it('getSimilarTvShows应该正确调用API', async () => {
    const mockResponse = { data: { results: [{}, {}, {}] } };
    mockAxiosGet.mockResolvedValueOnce(mockResponse);

    const result = await tmdbClient.getSimilarTvShows(123, 2);
    
    expect(mockAxiosGet).toHaveBeenCalledWith('/tv/123/similar');
    // 验证结果被限制为2个
    expect(result.results.length).toBe(2);
  });

  it('getSimilarTvShows应该处理错误', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API错误'));
    
    await expect(tmdbClient.getSimilarTvShows(123)).rejects.toThrow('获取剧集ID 123 的相似剧集失败');
  });

  it('getTvShowWatchProviders应该正确调用API', async () => {
    const mockResponse = { 
      data: { 
        results: { 
          US: { flatrate: [{ provider_name: 'Netflix' }] },
          CN: { buy: [{ provider_name: 'iTunes' }] }
        } 
      } 
    };
    mockAxiosGet.mockResolvedValueOnce(mockResponse);

    // 测试默认国家/地区代码
    const result1 = await tmdbClient.getTvShowWatchProviders(123);
    expect(mockAxiosGet).toHaveBeenCalledWith('/tv/123/watch/providers');
    expect(result1.results).toEqual(mockResponse.data.results.US);

    // 测试指定国家/地区代码
    mockAxiosGet.mockResolvedValueOnce(mockResponse);
    const result2 = await tmdbClient.getTvShowWatchProviders(123, 'CN');
    expect(result2.results).toEqual(mockResponse.data.results.CN);
  });

  it('getTvShowWatchProviders应该处理国家/地区不存在的情况', async () => {
    const mockResponse = { data: { results: { US: {} } } };
    mockAxiosGet.mockResolvedValueOnce(mockResponse);

    const result = await tmdbClient.getTvShowWatchProviders(123, 'XYZ');
    expect(result.results).toEqual({});
  });

  it('getTvShowWatchProviders应该处理错误', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API错误'));
    
    await expect(tmdbClient.getTvShowWatchProviders(123)).rejects.toThrow('获取剧集ID 123 的观看渠道失败');
  });

  it('discoverTvShows应该正确调用API', async () => {
    const mockResponse = { data: { results: [] } };
    mockAxiosGet.mockResolvedValueOnce(mockResponse);

    // 使用默认参数
    const result1 = await tmdbClient.discoverTvShows();
    expect(mockAxiosGet).toHaveBeenCalledWith('/discover/tv', {
      params: { page: 1 }
    });

    // 使用自定义参数
    mockAxiosGet.mockResolvedValueOnce(mockResponse);
    const result2 = await tmdbClient.discoverTvShows({
      with_genres: '35,18',
      sort_by: 'popularity.desc',
      page: 2
    });
    expect(mockAxiosGet).toHaveBeenCalledWith('/discover/tv', {
      params: {
        with_genres: '35,18',
        sort_by: 'popularity.desc',
        page: 2
      }
    });
  });

  it('discoverTvShows应该处理错误', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API错误'));
    
    await expect(tmdbClient.discoverTvShows()).rejects.toThrow('高级剧集发现失败');
  });

  it('searchPerson应该正确调用API', async () => {
    const mockResponse = { data: { results: [] } };
    mockAxiosGet.mockResolvedValueOnce(mockResponse);

    const result = await tmdbClient.searchPerson('演员名');
    
    expect(mockAxiosGet).toHaveBeenCalledWith('/search/person', {
      params: { query: '演员名' }
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('searchPerson应该处理错误', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API错误'));
    
    await expect(tmdbClient.searchPerson('演员名')).rejects.toThrow('搜索人物');
  });

  it('searchKeyword应该正确调用API', async () => {
    const mockResponse = { data: { results: [] } };
    mockAxiosGet.mockResolvedValueOnce(mockResponse);

    const result = await tmdbClient.searchKeyword('关键词');
    
    expect(mockAxiosGet).toHaveBeenCalledWith('/search/keyword', {
      params: { query: '关键词' }
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('searchKeyword应该处理错误', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API错误'));
    
    await expect(tmdbClient.searchKeyword('关键词')).rejects.toThrow('搜索关键词');
  });

  it('getNetworks应该正确调用API', async () => {
    const mockResponse = { data: { results: [] } };
    mockAxiosGet.mockResolvedValueOnce(mockResponse);

    const result = await tmdbClient.getNetworks();
    
    expect(mockAxiosGet).toHaveBeenCalledWith('/watch/providers/tv');
    expect(result).toEqual(mockResponse.data);
  });

  it('getNetworks应该处理错误', async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error('API错误'));
    
    await expect(tmdbClient.getNetworks()).rejects.toThrow('获取电视网络列表失败');
  });
}); 
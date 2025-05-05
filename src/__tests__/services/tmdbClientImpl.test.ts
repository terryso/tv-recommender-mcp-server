import axios from 'axios';
import type { AxiosInstance } from 'axios';
import TMDbClient from '../../services/tmdbClient';
import config, { validateApiKey } from '../../utils/config';

// 模拟axios和config
jest.mock('axios');
jest.mock('../../utils/config', () => ({
  tmdbApiKey: 'mock-api-key',
  validateApiKey: jest.fn().mockReturnValue('mock-api-key')
}));

// 使用Mock类型来声明模拟的方法
interface MockedAxiosInstance {
  get: jest.Mock;
  post: jest.Mock;
  put: jest.Mock;
  delete: jest.Mock;
}

describe('TMDbClient Implementation Tests', () => {
  let client: TMDbClient;
  let axiosCreateSpy: jest.SpyInstance;
  let axiosInstance: MockedAxiosInstance;

  beforeEach(() => {
    // 重置验证API密钥的模拟函数
    (validateApiKey as jest.Mock).mockClear();
    
    // 创建一个模拟的axios实例
    axiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };

    // 监视axios.create并返回模拟实例
    axiosCreateSpy = jest.spyOn(axios, 'create').mockReturnValue(axiosInstance as unknown as AxiosInstance);

    // 创建新的TMDbClient实例
    client = new TMDbClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosCreateSpy.mockRestore();
  });

  describe('Lazy Loading Client', () => {
    it('初始化时不应该创建axios实例', () => {
      // 构造函数不应该调用axios.create，应该是懒加载的
      expect(axiosCreateSpy).not.toHaveBeenCalled();
      expect(validateApiKey).not.toHaveBeenCalled();
    });

    it('第一次调用方法时应该创建axios实例', async () => {
      // 首次调用方法时应该创建axios实例
      axiosInstance.get.mockResolvedValueOnce({ status: 200 });
      await client.testConnection();
      
      // 验证axios.create被调用，并且只被调用了一次
      expect(axiosCreateSpy).toHaveBeenCalledTimes(1);
      expect(axiosCreateSpy).toHaveBeenCalledWith({
        baseURL: 'https://api.themoviedb.org/3',
        params: {
          api_key: 'mock-api-key',
          language: 'zh-CN'
        }
      });
      
      // 验证validateApiKey被调用
      expect(validateApiKey).toHaveBeenCalledTimes(1);
    });

    it('后续方法调用应该重用已创建的axios实例', async () => {
      // 首次调用
      axiosInstance.get.mockResolvedValue({ status: 200 });
      await client.testConnection();
      
      // 重置axios.create的调用计数
      axiosCreateSpy.mockClear();
      (validateApiKey as jest.Mock).mockClear();
      
      // 再次调用，不应该再创建新实例
      await client.getConfiguration();
      expect(axiosCreateSpy).not.toHaveBeenCalled();
      expect(validateApiKey).not.toHaveBeenCalled();
    });
  });

  describe('testConnection', () => {
    it('当API调用成功时应该返回true', async () => {
      axiosInstance.get.mockResolvedValueOnce({ status: 200, data: {} });

      const result = await client.testConnection();

      expect(result).toBe(true);
      expect(axiosInstance.get).toHaveBeenCalledWith('/configuration');
    });

    it('当API调用失败时应该返回false', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      const result = await client.testConnection();

      expect(result).toBe(false);
      expect(axiosInstance.get).toHaveBeenCalledWith('/configuration');
    });
  });

  describe('getConfiguration', () => {
    it('应该返回配置数据', async () => {
      const mockData = { images: { base_url: 'http://image.tmdb.org/t/p/' } };
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getConfiguration();

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/configuration');
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getConfiguration()).rejects.toThrow('API Error');
      expect(axiosInstance.get).toHaveBeenCalledWith('/configuration');
    });
  });

  describe('searchTvShow', () => {
    it('应该使用正确的参数调用API', async () => {
      const mockData = { results: [{ id: 1, name: '测试剧集' }] };
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.searchTvShow('测试查询');

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/search/tv', {
        params: { query: '测试查询' }
      });
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.searchTvShow('测试查询')).rejects.toThrow('API Error');
    });
  });

  describe('getRecommendationsByGenre', () => {
    it('应该使用正确的参数调用API，并限制结果数量', async () => {
      // 创建15个结果项的模拟数据
      const fullResults = Array(15).fill(0).map((_, i) => ({
        id: i + 1,
        name: `推荐剧集${i + 1}`
      }));
      
      axiosInstance.get.mockResolvedValueOnce({
        data: { results: fullResults }
      });

      // 使用默认限制(10)调用
      const result = await client.getRecommendationsByGenre(35);

      // 验证结果已限制为10个
      expect(result.results.length).toBe(10);
      expect(axiosInstance.get).toHaveBeenCalledWith('/discover/tv', {
        params: {
          with_genres: 35,
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100,
          page: 1
        }
      });
    });

    it('应该使用自定义限制数量', async () => {
      // 创建15个结果项的模拟数据
      const fullResults = Array(15).fill(0).map((_, i) => ({
        id: i + 1,
        name: `推荐剧集${i + 1}`
      }));
      
      axiosInstance.get.mockResolvedValueOnce({
        data: { results: fullResults }
      });

      // 使用自定义限制(5)调用
      const result = await client.getRecommendationsByGenre(35, 5);

      // 验证结果已限制为5个
      expect(result.results.length).toBe(5);
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getRecommendationsByGenre(35)).rejects.toThrow('API Error');
    });
  });

  describe('getTvGenres', () => {
    it('应该正确调用API并返回结果', async () => {
      const mockData = {
        genres: [
          { id: 35, name: '喜剧' },
          { id: 18, name: '剧情' }
        ]
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getTvGenres();

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/genre/tv/list');
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getTvGenres()).rejects.toThrow('API Error');
    });
  });

  describe('searchTvShowByTitle', () => {
    it('应该使用正确的参数调用API', async () => {
      const mockData = { results: [{ id: 66732, name: '怪奇物语' }] };
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.searchTvShowByTitle('怪奇物语');

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/search/tv', {
        params: {
          query: '怪奇物语',
          page: 1
        }
      });
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.searchTvShowByTitle('怪奇物语')).rejects.toThrow('API Error');
    });
  });

  describe('getSimilarTvShows', () => {
    it('应该使用正确的URL调用API，并限制结果数量', async () => {
      // 创建15个结果项的模拟数据
      const fullResults = Array(15).fill(0).map((_, i) => ({
        id: i + 1,
        name: `相似剧集${i + 1}`
      }));
      
      axiosInstance.get.mockResolvedValueOnce({
        data: { results: fullResults }
      });

      // 使用默认限制(10)调用
      const result = await client.getSimilarTvShows(66732);

      // 验证结果已限制为10个
      expect(result.results.length).toBe(10);
      expect(axiosInstance.get).toHaveBeenCalledWith('/tv/66732/similar');
    });

    it('应该使用自定义限制数量', async () => {
      // 创建15个结果项的模拟数据
      const fullResults = Array(15).fill(0).map((_, i) => ({
        id: i + 1,
        name: `相似剧集${i + 1}`
      }));
      
      axiosInstance.get.mockResolvedValueOnce({
        data: { results: fullResults }
      });

      // 使用自定义限制(5)调用
      const result = await client.getSimilarTvShows(66732, 5);

      // 验证结果已限制为5个
      expect(result.results.length).toBe(5);
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getSimilarTvShows(66732)).rejects.toThrow('API Error');
    });
  });

  describe('getTvShowWatchProviders', () => {
    it('应该返回指定地区的观看渠道信息', async () => {
      const mockData = {
        id: 66732,
        results: {
          US: {
            link: 'https://example.com/watch',
            flatrate: [{ provider_id: 8, provider_name: 'Netflix' }]
          },
          CN: {
            link: 'https://example.cn/watch',
            flatrate: [{ provider_id: 10, provider_name: 'iQiyi' }]
          }
        }
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      // 默认使用US
      const result = await client.getTvShowWatchProviders(66732);

      expect(result).toEqual({
        id: 66732,
        results: {
          link: 'https://example.com/watch',
          flatrate: [{ provider_id: 8, provider_name: 'Netflix' }]
        }
      });
      expect(axiosInstance.get).toHaveBeenCalledWith('/tv/66732/watch/providers');
    });

    it('应该支持自定义国家代码', async () => {
      const mockData = {
        id: 66732,
        results: {
          US: {
            link: 'https://example.com/watch',
            flatrate: [{ provider_id: 8, provider_name: 'Netflix' }]
          },
          CN: {
            link: 'https://example.cn/watch',
            flatrate: [{ provider_id: 10, provider_name: 'iQiyi' }]
          }
        }
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      // 使用CN
      const result = await client.getTvShowWatchProviders(66732, 'CN');

      expect(result).toEqual({
        id: 66732,
        results: {
          link: 'https://example.cn/watch',
          flatrate: [{ provider_id: 10, provider_name: 'iQiyi' }]
        }
      });
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getTvShowWatchProviders(66732)).rejects.toThrow('API Error');
    });

    it('当指定地区不存在数据时应返回空对象', async () => {
      const mockData = {
        id: 66732,
        results: {
          US: {
            link: 'https://example.com/watch',
            flatrate: [{ provider_id: 8, provider_name: 'Netflix' }]
          }
        }
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      // 使用不存在的地区代码
      const result = await client.getTvShowWatchProviders(66732, 'FR');

      expect(result).toEqual({
        id: 66732,
        results: {}
      });
    });
  });

  describe('discoverTvShows', () => {
    it('应该使用提供的参数调用API', async () => {
      const mockData = {
        page: 1,
        results: [{ id: 1, name: '发现剧集' }],
        total_pages: 10,
        total_results: 100
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const params = {
        with_genres: 28,
        sort_by: 'popularity.desc',
        'vote_average.gte': 7.5
      };
      
      const result = await client.discoverTvShows(params);

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/discover/tv', {
        params: {
          ...params,
          page: 1
        }
      });
    });

    it('应该使用默认页码1', async () => {
      const mockData = {
        page: 1,
        results: [{ id: 1, name: '发现剧集' }]
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      await client.discoverTvShows({});

      expect(axiosInstance.get).toHaveBeenCalledWith('/discover/tv', {
        params: { page: 1 }
      });
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.discoverTvShows()).rejects.toThrow('API Error');
    });
  });

  describe('searchPerson', () => {
    it('应该使用正确的参数调用API', async () => {
      const mockData = {
        results: [{ id: 123, name: '汤姆·汉克斯' }]
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.searchPerson('汤姆');

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/search/person', {
        params: { query: '汤姆' }
      });
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.searchPerson('汤姆')).rejects.toThrow('API Error');
    });
  });

  describe('searchKeyword', () => {
    it('应该使用正确的参数调用API', async () => {
      const mockData = {
        results: [{ id: 123, name: '超级英雄' }]
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.searchKeyword('英雄');

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/search/keyword', {
        params: { query: '英雄' }
      });
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.searchKeyword('英雄')).rejects.toThrow('API Error');
    });
  });

  describe('getPersonDetails', () => {
    it('应该使用正确的URL调用API', async () => {
      const mockData = {
        id: 123,
        name: '汤姆·汉克斯',
        biography: '著名演员...',
        birthday: '1956-07-09'
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getPersonDetails(123);

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/person/123');
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getPersonDetails(123)).rejects.toThrow('API Error');
    });
  });

  describe('getNetworks', () => {
    it('应该使用正确的URL调用API', async () => {
      const mockData = {
        results: [
          { provider_id: 8, provider_name: 'Netflix' },
          { provider_id: 9, provider_name: 'HBO' }
        ]
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getNetworks();

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/watch/providers/tv');
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getNetworks()).rejects.toThrow('API Error');
    });
  });

  describe('getPersonTvCredits', () => {
    it('应该使用正确的URL调用API', async () => {
      const mockData = {
        id: 123,
        cast: [
          { id: 1, name: '剧集1', character: '角色1' },
          { id: 2, name: '剧集2', character: '角色2' }
        ],
        crew: [
          { id: 3, name: '剧集3', job: '导演' }
        ]
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getPersonTvCredits(123);

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/person/123/tv_credits');
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getPersonTvCredits(123)).rejects.toThrow('API Error');
    });
  });

  describe('getTvShowReviews', () => {
    it('应该使用正确的URL和默认页码调用API', async () => {
      const mockData = {
        id: 123,
        page: 1,
        results: [
          { id: 'abc123', author: '用户1', content: '很棒的剧集!' },
          { id: 'def456', author: '用户2', content: '值得推荐.' }
        ],
        total_pages: 1,
        total_results: 2
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getTvShowReviews(123);

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/tv/123/reviews', {
        params: { page: 1 }
      });
    });

    it('应该支持自定义页码', async () => {
      const mockData = {
        id: 123,
        page: 2,
        results: [
          { id: 'ghi789', author: '用户3', content: '很精彩!' }
        ],
        total_pages: 2,
        total_results: 3
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getTvShowReviews(123, 2);

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/tv/123/reviews', {
        params: { page: 2 }
      });
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getTvShowReviews(123)).rejects.toThrow('API Error');
    });
  });

  describe('getPopularTvShows', () => {
    it('应该使用正确的URL和默认页码调用API', async () => {
      const mockData = {
        page: 1,
        results: [
          { id: 1, name: '热门剧集1' },
          { id: 2, name: '热门剧集2' }
        ],
        total_pages: 10,
        total_results: 200
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getPopularTvShows();

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/tv/popular', {
        params: { page: 1 }
      });
    });

    it('应该支持自定义页码', async () => {
      const mockData = {
        page: 2,
        results: [
          { id: 3, name: '热门剧集3' },
          { id: 4, name: '热门剧集4' }
        ],
        total_pages: 10,
        total_results: 200
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getPopularTvShows(2);

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/tv/popular', {
        params: { page: 2 }
      });
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getPopularTvShows()).rejects.toThrow('API Error');
    });
  });

  describe('getTrendingTvShows', () => {
    it('应该默认使用week时间窗口', async () => {
      const mockData = {
        page: 1,
        results: [
          { id: 1, name: '周趋势剧集1' },
          { id: 2, name: '周趋势剧集2' }
        ],
        total_pages: 5,
        total_results: 100
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getTrendingTvShows();

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/trending/tv/week', {
        params: { page: 1 }
      });
    });

    it('应该支持day时间窗口', async () => {
      const mockData = {
        page: 1,
        results: [
          { id: 3, name: '日趋势剧集1' },
          { id: 4, name: '日趋势剧集2' }
        ],
        total_pages: 3,
        total_results: 50
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getTrendingTvShows('day');

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/trending/tv/day', {
        params: { page: 1 }
      });
    });

    it('应该支持自定义页码', async () => {
      const mockData = {
        page: 2,
        results: [
          { id: 5, name: '周趋势剧集3' },
          { id: 6, name: '周趋势剧集4' }
        ],
        total_pages: 5,
        total_results: 100
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getTrendingTvShows('week', 2);

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/trending/tv/week', {
        params: { page: 2 }
      });
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getTrendingTvShows()).rejects.toThrow('API Error');
    });
  });

  describe('getTvShowVideos', () => {
    it('应该使用正确的URL调用API', async () => {
      const mockData = {
        id: 123,
        results: [
          { 
            id: 'v1', 
            key: 'abc123', 
            name: '预告片', 
            site: 'YouTube',
            type: 'Trailer',
            official: true
          }
        ]
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await client.getTvShowVideos(123);

      expect(result).toEqual(mockData);
      expect(axiosInstance.get).toHaveBeenCalledWith('/tv/123/videos');
    });

    it('当API调用失败时应该抛出错误', async () => {
      axiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(client.getTvShowVideos(123)).rejects.toThrow('API Error');
    });
  });
}); 
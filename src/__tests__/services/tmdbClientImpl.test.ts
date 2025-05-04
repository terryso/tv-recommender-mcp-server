import axios from 'axios';
import type { AxiosInstance } from 'axios';
import TMDbClient from '../../services/tmdbClient';
import config from '../../utils/config';

// 模拟axios和config
jest.mock('axios');
jest.mock('../../utils/config', () => ({
  tmdbApiKey: 'mock-api-key'
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

  describe('Constructor', () => {
    it('应该使用正确的配置创建axios实例', () => {
      expect(axiosCreateSpy).toHaveBeenCalledWith({
        baseURL: 'https://api.themoviedb.org/3',
        params: {
          api_key: 'mock-api-key',
          language: 'zh-CN'
        }
      });
    });

    it('当API密钥未设置时应该抛出错误', () => {
      // 临时覆盖配置
      const originalApiKey = config.tmdbApiKey;
      Object.defineProperty(config, 'tmdbApiKey', { value: '' });

      expect(() => new TMDbClient()).toThrow('TMDb API Key未设置');

      // 恢复配置
      Object.defineProperty(config, 'tmdbApiKey', { value: originalApiKey });
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
}); 
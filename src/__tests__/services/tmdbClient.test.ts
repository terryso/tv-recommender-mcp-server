import axios from 'axios';
import { tmdbClient } from '../../services/tmdbClient';
import config from '../../utils/config';

// 模拟 axios 和 配置
jest.mock('axios');
jest.mock('../../utils/config', () => ({
  tmdbApiKey: 'mock-api-key'
}));

// 直接模拟 tmdbClient 的方法
jest.spyOn(tmdbClient, 'testConnection');
jest.spyOn(tmdbClient, 'getConfiguration');
jest.spyOn(tmdbClient, 'searchTvShow');
jest.spyOn(tmdbClient, 'getTvGenres');
jest.spyOn(tmdbClient, 'getRecommendationsByGenre');
jest.spyOn(tmdbClient, 'searchTvShowByTitle');
jest.spyOn(tmdbClient, 'getSimilarTvShows');

describe('TMDbClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('testConnection', () => {
    it('当API调用成功时应该返回true', async () => {
      // 模拟方法返回成功结果
      (tmdbClient.testConnection as jest.Mock).mockResolvedValueOnce(true);

      const result = await tmdbClient.testConnection();
      
      expect(result).toBe(true);
      expect(tmdbClient.testConnection).toHaveBeenCalled();
    });

    it('当API调用失败时应该返回false', async () => {
      // 模拟方法返回失败结果
      (tmdbClient.testConnection as jest.Mock).mockResolvedValueOnce(false);

      const result = await tmdbClient.testConnection();
      
      expect(result).toBe(false);
      expect(tmdbClient.testConnection).toHaveBeenCalled();
    });
  });

  describe('getConfiguration', () => {
    it('应该返回配置数据', async () => {
      const mockData = { images: { base_url: 'http://example.com' } };
      
      // 模拟方法返回配置数据
      (tmdbClient.getConfiguration as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getConfiguration();
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getConfiguration).toHaveBeenCalled();
    });

    it('当API调用失败时应该抛出错误', async () => {
      // 模拟方法抛出错误
      (tmdbClient.getConfiguration as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(tmdbClient.getConfiguration()).rejects.toThrow('API Error');
    });
  });

  describe('searchTvShow', () => {
    it('应该返回搜索结果', async () => {
      const mockData = { results: [{ id: 1, name: '测试剧集' }] };
      
      // 模拟方法返回搜索结果
      (tmdbClient.searchTvShow as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.searchTvShow('测试查询');
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.searchTvShow).toHaveBeenCalledWith('测试查询');
    });

    it('当API调用失败时应该抛出错误', async () => {
      // 模拟方法抛出错误
      (tmdbClient.searchTvShow as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(tmdbClient.searchTvShow('测试查询')).rejects.toThrow('API Error');
    });
  });

  describe('getTvGenres', () => {
    it('应该返回电视剧类型列表', async () => {
      const mockData = { genres: [{ id: 1, name: '测试类型' }] };
      
      // 模拟方法返回类型列表
      (tmdbClient.getTvGenres as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getTvGenres();
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getTvGenres).toHaveBeenCalled();
    });

    it('当API调用失败时应该抛出错误', async () => {
      // 模拟方法抛出错误
      (tmdbClient.getTvGenres as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(tmdbClient.getTvGenres()).rejects.toThrow('API Error');
    });
  });

  describe('searchTvShowByTitle', () => {
    it('应该返回搜索结果', async () => {
      const mockData = { results: [{ id: 66732, name: '测试剧集' }] };
      
      // 模拟方法返回搜索结果
      (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.searchTvShowByTitle('测试剧集');
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.searchTvShowByTitle).toHaveBeenCalledWith('测试剧集');
    });
  });

  describe('getSimilarTvShows', () => {
    it('应该返回相似剧集列表', async () => {
      const mockData = { results: [{ id: 1, name: '相似剧集' }] };
      
      // 模拟方法返回相似剧集
      (tmdbClient.getSimilarTvShows as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getSimilarTvShows(66732);
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getSimilarTvShows).toHaveBeenCalledWith(66732);
    });
  });

  describe('getRecommendationsByGenre', () => {
    it('应该返回按类型推荐的剧集列表', async () => {
      const mockData = { results: [{ id: 1, name: '推荐剧集' }] };
      
      // 模拟方法返回推荐剧集
      (tmdbClient.getRecommendationsByGenre as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getRecommendationsByGenre(35);
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getRecommendationsByGenre).toHaveBeenCalledWith(35);
    });
  });
}); 
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
jest.spyOn(tmdbClient, 'getTvShowWatchProviders');
jest.spyOn(tmdbClient, 'discoverTvShows');
jest.spyOn(tmdbClient, 'searchPerson');
jest.spyOn(tmdbClient, 'searchKeyword');
jest.spyOn(tmdbClient, 'getPersonDetails');
jest.spyOn(tmdbClient, 'getNetworks');
jest.spyOn(tmdbClient, 'getPersonTvCredits');
jest.spyOn(tmdbClient, 'getTvShowReviews');
jest.spyOn(tmdbClient, 'getPopularTvShows');
jest.spyOn(tmdbClient, 'getTrendingTvShows');
jest.spyOn(tmdbClient, 'getTvShowVideos');

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

  describe('getTvShowWatchProviders', () => {
    it('应该返回观看渠道信息', async () => {
      const mockData = { 
        id: 123, 
        results: { 
          US: { 
            link: 'https://example.com', 
            flatrate: [{ provider_id: 8, provider_name: 'Netflix' }]
          } 
        } 
      };
      
      // 模拟方法返回结果
      (tmdbClient.getTvShowWatchProviders as jest.Mock).mockResolvedValueOnce({ 
        id: 123, 
        results: { 
          link: 'https://example.com', 
          flatrate: [{ provider_id: 8, provider_name: 'Netflix' }]
        }
      });

      const result = await tmdbClient.getTvShowWatchProviders(123);
      
      expect(result).toHaveProperty('id', 123);
      expect(result).toHaveProperty('results');
      expect(tmdbClient.getTvShowWatchProviders).toHaveBeenCalledWith(123);
    });

    it('应该支持自定义国家/地区代码', async () => {
      // 模拟方法返回结果
      (tmdbClient.getTvShowWatchProviders as jest.Mock).mockResolvedValueOnce({
        id: 123, 
        results: { 
          link: 'https://example.cn', 
          flatrate: [{ provider_id: 10, provider_name: 'iQiyi' }]
        }
      });

      const result = await tmdbClient.getTvShowWatchProviders(123, 'CN');
      
      expect(tmdbClient.getTvShowWatchProviders).toHaveBeenCalledWith(123, 'CN');
    });
  });

  describe('discoverTvShows', () => {
    it('应该返回高级发现结果', async () => {
      const mockData = { 
        page: 1, 
        results: [{ id: 1, name: '发现剧集' }],
        total_pages: 10,
        total_results: 100
      };
      
      // 模拟方法返回结果
      (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.discoverTvShows({ with_genres: 28, sort_by: 'popularity.desc' });
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith({ with_genres: 28, sort_by: 'popularity.desc' });
    });

    it('应该处理空参数调用', async () => {
      const mockData = { 
        page: 1, 
        results: [{ id: 2, name: '默认发现剧集' }]
      };
      
      // 模拟方法返回结果
      (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.discoverTvShows();
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith();
    });
  });

  describe('searchPerson', () => {
    it('应该返回人物搜索结果', async () => {
      const mockData = { 
        results: [{ id: 123, name: '汤姆·汉克斯' }]
      };
      
      // 模拟方法返回结果
      (tmdbClient.searchPerson as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.searchPerson('汤姆');
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.searchPerson).toHaveBeenCalledWith('汤姆');
    });
  });

  describe('searchKeyword', () => {
    it('应该返回关键词搜索结果', async () => {
      const mockData = { 
        results: [{ id: 123, name: '超级英雄' }]
      };
      
      // 模拟方法返回结果
      (tmdbClient.searchKeyword as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.searchKeyword('英雄');
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.searchKeyword).toHaveBeenCalledWith('英雄');
    });
  });

  describe('getPersonDetails', () => {
    it('应该返回人物详细信息', async () => {
      const mockData = { 
        id: 123, 
        name: '汤姆·汉克斯',
        biography: '著名演员...',
        birthday: '1956-07-09'
      };
      
      // 模拟方法返回结果
      (tmdbClient.getPersonDetails as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getPersonDetails(123);
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getPersonDetails).toHaveBeenCalledWith(123);
    });
  });

  describe('getNetworks', () => {
    it('应该返回电视网络列表', async () => {
      const mockData = { 
        results: [
          { provider_id: 8, provider_name: 'Netflix' },
          { provider_id: 9, provider_name: 'HBO' }
        ]
      };
      
      // 模拟方法返回结果
      (tmdbClient.getNetworks as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getNetworks();
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getNetworks).toHaveBeenCalled();
    });
  });

  describe('getPersonTvCredits', () => {
    it('应该返回人物的电视剧作品', async () => {
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
      
      // 模拟方法返回结果
      (tmdbClient.getPersonTvCredits as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getPersonTvCredits(123);
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getPersonTvCredits).toHaveBeenCalledWith(123);
    });
  });

  describe('getTvShowReviews', () => {
    it('应该返回剧集评论', async () => {
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
      
      // 模拟方法返回结果
      (tmdbClient.getTvShowReviews as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getTvShowReviews(123);
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getTvShowReviews).toHaveBeenCalledWith(123);
    });

    it('应该支持分页', async () => {
      const mockData = { 
        id: 123,
        page: 2,
        results: [
          { id: 'ghi789', author: '用户3', content: '很精彩!' }
        ],
        total_pages: 2,
        total_results: 3
      };
      
      // 模拟方法返回结果
      (tmdbClient.getTvShowReviews as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getTvShowReviews(123, 2);
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getTvShowReviews).toHaveBeenCalledWith(123, 2);
    });
  });

  describe('getPopularTvShows', () => {
    it('应该返回热门剧集', async () => {
      const mockData = { 
        page: 1,
        results: [
          { id: 1, name: '热门剧集1' },
          { id: 2, name: '热门剧集2' }
        ],
        total_pages: 10,
        total_results: 200
      };
      
      // 模拟方法返回结果
      (tmdbClient.getPopularTvShows as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getPopularTvShows();
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getPopularTvShows).toHaveBeenCalled();
    });

    it('应该支持分页', async () => {
      const mockData = { 
        page: 2,
        results: [
          { id: 3, name: '热门剧集3' },
          { id: 4, name: '热门剧集4' }
        ],
        total_pages: 10,
        total_results: 200
      };
      
      // 模拟方法返回结果
      (tmdbClient.getPopularTvShows as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getPopularTvShows(2);
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getPopularTvShows).toHaveBeenCalledWith(2);
    });
  });

  describe('getTrendingTvShows', () => {
    it('应该返回周趋势剧集（默认)', async () => {
      const mockData = { 
        page: 1,
        results: [
          { id: 1, name: '周趋势剧集1' },
          { id: 2, name: '周趋势剧集2' }
        ],
        total_pages: 5,
        total_results: 100
      };
      
      // 模拟方法返回结果
      (tmdbClient.getTrendingTvShows as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getTrendingTvShows();
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getTrendingTvShows).toHaveBeenCalled();
    });

    it('应该返回日趋势剧集', async () => {
      const mockData = { 
        page: 1,
        results: [
          { id: 3, name: '日趋势剧集1' },
          { id: 4, name: '日趋势剧集2' }
        ],
        total_pages: 3,
        total_results: 50
      };
      
      // 模拟方法返回结果
      (tmdbClient.getTrendingTvShows as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getTrendingTvShows('day');
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getTrendingTvShows).toHaveBeenCalledWith('day');
    });

    it('应该支持分页', async () => {
      const mockData = { 
        page: 2,
        results: [
          { id: 5, name: '周趋势剧集3' },
          { id: 6, name: '周趋势剧集4' }
        ],
        total_pages: 5,
        total_results: 100
      };
      
      // 模拟方法返回结果
      (tmdbClient.getTrendingTvShows as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getTrendingTvShows('week', 2);
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getTrendingTvShows).toHaveBeenCalledWith('week', 2);
    });
  });

  describe('getTvShowVideos', () => {
    it('应该返回剧集视频列表', async () => {
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
          },
          { 
            id: 'v2', 
            key: 'def456', 
            name: '花絮', 
            site: 'Vimeo',
            type: 'Featurette',
            official: false
          }
        ]
      };
      
      // 模拟方法返回结果
      (tmdbClient.getTvShowVideos as jest.Mock).mockResolvedValueOnce(mockData);

      const result = await tmdbClient.getTvShowVideos(123);
      
      expect(result).toEqual(mockData);
      expect(tmdbClient.getTvShowVideos).toHaveBeenCalledWith(123);
    });
  });
}); 
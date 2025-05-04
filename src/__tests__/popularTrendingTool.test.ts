import { getPopularShows, getTrendingShows } from '../tools/popularTrendingTool';
import { tmdbClient } from '../services/tmdbClient';

// 模拟tmdbClient
jest.mock('../services/tmdbClient', () => ({
  tmdbClient: {
    getPopularTvShows: jest.fn(),
    getTrendingTvShows: jest.fn()
  }
}));

describe('popularTrendingTool', () => {
  // 测试前重置所有模拟
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getPopularShows', () => {
    it('应该成功获取热门剧集', async () => {
      // 模拟热门剧集数据
      const mockPopularData = {
        page: 1,
        results: [
          {
            id: 1,
            name: '纸牌屋',
            overview: '政治剧...',
            poster_path: '/path/to/poster1.jpg',
            vote_average: 8.2,
            first_air_date: '2013-02-01'
          },
          {
            id: 2,
            name: '权力的游戏',
            overview: '奇幻剧...',
            poster_path: '/path/to/poster2.jpg',
            vote_average: 9.1,
            first_air_date: '2011-04-17'
          }
        ],
        total_pages: 100,
        total_results: 2000
      };
      
      // 设置模拟函数的返回值
      (tmdbClient.getPopularTvShows as jest.Mock).mockResolvedValue(mockPopularData);
      
      // 执行函数
      const result = await getPopularShows({ page: 2 });
      
      // 验证模拟函数是否被正确调用
      expect(tmdbClient.getPopularTvShows).toHaveBeenCalledWith(2);
      
      // 验证结果是否正确
      expect(result).toEqual({
        page: 1,
        results: [
          {
            id: 1,
            name: '纸牌屋',
            overview: '政治剧...',
            poster_path: '/path/to/poster1.jpg',
            vote_average: 8.2,
            first_air_date: '2013-02-01'
          },
          {
            id: 2,
            name: '权力的游戏',
            overview: '奇幻剧...',
            poster_path: '/path/to/poster2.jpg',
            vote_average: 9.1,
            first_air_date: '2011-04-17'
          }
        ],
        total_pages: 100,
        total_results: 2000
      });
    });
    
    it('应该使用默认页码1', async () => {
      // 模拟数据
      const mockData = {
        page: 1,
        results: [],
        total_pages: 0,
        total_results: 0
      };
      
      // 设置模拟函数返回值
      (tmdbClient.getPopularTvShows as jest.Mock).mockResolvedValue(mockData);
      
      // 执行函数，不指定页码
      await getPopularShows();
      
      // 验证使用了默认页码1
      expect(tmdbClient.getPopularTvShows).toHaveBeenCalledWith(1);
    });
    
    it('应该处理API错误情况', async () => {
      // 模拟API错误
      (tmdbClient.getPopularTvShows as jest.Mock).mockRejectedValue(new Error('网络错误'));
      
      // 执行并确认抛出正确的错误
      await expect(getPopularShows())
        .rejects
        .toThrow('获取热门剧集失败');
    });
    
    it('应该处理字段缺失的情况', async () => {
      // 模拟不完整的返回数据
      const mockIncompleteData = {
        page: 1,
        results: [
          {
            id: 3,
            name: null,
            // 缺少overview
            poster_path: null,
            // 缺少vote_average
          }
        ],
        total_pages: 1,
        total_results: 1
      };
      
      // 设置模拟函数返回值
      (tmdbClient.getPopularTvShows as jest.Mock).mockResolvedValue(mockIncompleteData);
      
      // 执行函数
      const result = await getPopularShows();
      
      // 验证结果处理了缺失字段
      expect(result.results[0]).toEqual({
        id: 3,
        name: null,
        overview: '暂无简介',
        poster_path: null,
        vote_average: 0,
        first_air_date: undefined
      });
    });
  });
  
  describe('getTrendingShows', () => {
    it('应该成功获取日趋势剧集', async () => {
      // 模拟趋势剧集数据
      const mockTrendingData = {
        page: 1,
        results: [
          {
            id: 10,
            name: '黑镜',
            overview: '科技剧...',
            poster_path: '/path/to/poster10.jpg',
            vote_average: 8.5,
            first_air_date: '2011-12-04'
          }
        ],
        total_pages: 10,
        total_results: 200
      };
      
      // 设置模拟函数的返回值
      (tmdbClient.getTrendingTvShows as jest.Mock).mockResolvedValue(mockTrendingData);
      
      // 执行函数
      const result = await getTrendingShows({ time_window: 'day' });
      
      // 验证模拟函数是否被正确调用
      expect(tmdbClient.getTrendingTvShows).toHaveBeenCalledWith('day', 1);
      
      // 验证结果是否正确
      expect(result).toEqual({
        page: 1,
        results: [
          {
            id: 10,
            name: '黑镜',
            overview: '科技剧...',
            poster_path: '/path/to/poster10.jpg',
            vote_average: 8.5,
            first_air_date: '2011-12-04'
          }
        ],
        total_pages: 10,
        total_results: 200
      });
    });
    
    it('应该使用指定的页码和时间窗口', async () => {
      // 模拟数据
      const mockData = {
        page: 2,
        results: [],
        total_pages: 1,
        total_results: 0
      };
      
      // 设置模拟函数返回值
      (tmdbClient.getTrendingTvShows as jest.Mock).mockResolvedValue(mockData);
      
      // 执行函数，指定页码为2
      await getTrendingShows({ time_window: 'week', page: 2 });
      
      // 验证调用了正确的参数
      expect(tmdbClient.getTrendingTvShows).toHaveBeenCalledWith('week', 2);
    });
    
    it('应该处理API错误情况', async () => {
      // 模拟API错误
      (tmdbClient.getTrendingTvShows as jest.Mock).mockRejectedValue(new Error('网络错误'));
      
      // 执行并确认抛出正确的错误
      await expect(getTrendingShows({ time_window: 'week' }))
        .rejects
        .toThrow('获取周趋势剧集失败');
    });
    
    it('应该处理原始名称的剧集', async () => {
      // 模拟包含original_name的数据
      const mockOriginalNameData = {
        page: 1,
        results: [
          {
            id: 20,
            // 无name字段
            original_name: '오징어 게임', // 鱿鱼游戏
            overview: '生存游戏...',
            poster_path: '/path/to/poster20.jpg',
            vote_average: 8.7,
            first_air_date: '2021-09-17'
          }
        ],
        total_pages: 1,
        total_results: 1
      };
      
      // 设置模拟函数返回值
      (tmdbClient.getTrendingTvShows as jest.Mock).mockResolvedValue(mockOriginalNameData);
      
      // 执行函数
      const result = await getTrendingShows({ time_window: 'week' });
      
      // 验证处理了original_name
      expect(result.results[0].name).toBe('오징어 게임');
    });
  });
}); 
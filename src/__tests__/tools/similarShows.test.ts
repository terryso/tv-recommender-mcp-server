import { getSimilarShows } from '../../tools/recommendations';
import { tmdbClient } from '../../services/tmdbClient';

// 模拟依赖
jest.mock('../../services/tmdbClient');

describe('getSimilarShows Tool', () => {
  // 初始化模拟对象
  const mockedTmdbClient = tmdbClient as jest.Mocked<typeof tmdbClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该成功获取相似剧集并返回格式化字符串', async () => {
    // 模拟搜索API响应
    mockedTmdbClient.searchTvShowByTitle.mockResolvedValue({
      page: 1,
      results: [
        {
          id: 66732,
          name: '怪奇物语',
          overview: '小镇上发生超自然事件',
          first_air_date: '2016-07-15'
        }
      ]
    });

    // 模拟相似剧集API响应
    mockedTmdbClient.getSimilarTvShows.mockResolvedValue({
      page: 1,
      results: [
        {
          id: 1,
          name: '黑镜',
          overview: '科技如何影响现代生活',
          first_air_date: '2011-12-04',
          vote_average: 8.3
        },
        {
          id: 2,
          name: '超感猎杀',
          overview: '八个陌生人发现彼此心灵相连',
          first_air_date: '2015-06-05',
          vote_average: 8.1
        }
      ]
    });
    
    // 调用工具函数
    const result = await getSimilarShows({ show_title: '怪奇物语' });
    
    // 验证输出
    expect(result).toContain('与 怪奇物语 相似的剧集推荐：');
    expect(result).toContain('1. 黑镜 (2011): 8.3 - 科技如何影响现代生活');
    expect(result).toContain('2. 超感猎杀 (2015): 8.1 - 八个陌生人发现彼此心灵相连');
    
    // 验证调用
    expect(mockedTmdbClient.searchTvShowByTitle).toHaveBeenCalledWith('怪奇物语');
    expect(mockedTmdbClient.getSimilarTvShows).toHaveBeenCalledWith(66732);
  });

  it('当搜索不到剧集时应该返回错误提示', async () => {
    // 模拟搜索API响应为空
    mockedTmdbClient.searchTvShowByTitle.mockResolvedValue({
      page: 1,
      results: []
    });
    
    // 调用工具函数
    const result = await getSimilarShows({ show_title: '不存在的剧集' });
    
    // 验证输出
    expect(result).toBe('抱歉，未能找到您提供的剧集"不存在的剧集"。');
    
    // 验证只调用了搜索，没有调用相似剧集API
    expect(mockedTmdbClient.searchTvShowByTitle).toHaveBeenCalledWith('不存在的剧集');
    expect(mockedTmdbClient.getSimilarTvShows).not.toHaveBeenCalled();
  });

  it('当没有相似剧集时应该返回相应提示', async () => {
    // 模拟搜索API响应
    mockedTmdbClient.searchTvShowByTitle.mockResolvedValue({
      page: 1,
      results: [
        {
          id: 999,
          name: '独特剧集',
          overview: '非常独特的剧集',
          first_air_date: '2020-01-01'
        }
      ]
    });

    // 模拟相似剧集API响应为空
    mockedTmdbClient.getSimilarTvShows.mockResolvedValue({
      page: 1,
      results: []
    });
    
    // 调用工具函数
    const result = await getSimilarShows({ show_title: '独特剧集' });
    
    // 验证输出
    expect(result).toBe('抱歉，未能找到与"独特剧集"相似的剧集。');
  });

  it('当缺少参数时应该返回错误信息', async () => {
    // 调用工具函数，传入空参数
    const result = await getSimilarShows({ show_title: '' });
    
    // 验证输出
    expect(result).toContain('获取相似剧集时发生错误');
  });

  it('当搜索API调用失败时应该返回错误信息', async () => {
    // 模拟搜索API调用失败
    mockedTmdbClient.searchTvShowByTitle.mockRejectedValue(new Error('API错误'));
    
    // 调用工具函数
    const result = await getSimilarShows({ show_title: '怪奇物语' });
    
    // 验证输出
    expect(result).toContain('获取相似剧集时发生错误');
  });

  it('当相似剧集API调用失败时应该返回错误信息', async () => {
    // 模拟搜索API响应
    mockedTmdbClient.searchTvShowByTitle.mockResolvedValue({
      page: 1,
      results: [{ id: 66732, name: '怪奇物语' }]
    });

    // 模拟相似剧集API调用失败
    mockedTmdbClient.getSimilarTvShows.mockRejectedValue(new Error('API错误'));
    
    // 调用工具函数
    const result = await getSimilarShows({ show_title: '怪奇物语' });
    
    // 验证输出
    expect(result).toContain('获取相似剧集时发生错误');
  });
}); 
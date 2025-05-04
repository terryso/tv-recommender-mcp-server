import { getRecommendationsByGenre } from '../../tools/recommendations';
import { tmdbClient } from '../../services/tmdbClient';
import * as genreMap from '../../utils/genreMap';

// 模拟依赖
jest.mock('../../services/tmdbClient');
jest.mock('../../utils/genreMap');

describe('getRecommendationsByGenre Tool', () => {
  // 初始化间谍/模拟对象
  const mockedTmdbClient = tmdbClient as jest.Mocked<typeof tmdbClient>;
  const mockedMapGenreToId = jest.spyOn(genreMap, 'mapGenreToId');
  const mockedGetGenreNameById = jest.spyOn(genreMap, 'getGenreNameById');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该成功获取推荐并返回格式化字符串', async () => {
    // 模拟类型映射
    mockedMapGenreToId.mockReturnValue(35); // 假设35是喜剧类型
    mockedGetGenreNameById.mockReturnValue('喜剧');

    // 模拟API响应
    mockedTmdbClient.getRecommendationsByGenre.mockResolvedValue({
      page: 1,
      results: [
        {
          id: 1,
          name: '老友记',
          overview: '六个朋友在纽约的生活故事',
          first_air_date: '1994-09-22',
          vote_average: 8.5
        },
        {
          id: 2,
          name: '生活大爆炸',
          overview: '四个天才科学家和他们的邻居',
          first_air_date: '2007-09-24',
          vote_average: 8.2
        }
      ]
    });
    
    // 调用工具函数
    const result = await getRecommendationsByGenre({ genre: '喜剧' });
    
    // 验证输出
    expect(result).toContain('根据您选择的喜剧，为您推荐以下剧集：');
    expect(result).toContain('1. 老友记 (1994): 8.5 - 六个朋友在纽约的生活故事');
    expect(result).toContain('2. 生活大爆炸 (2007): 8.2 - 四个天才科学家和他们的邻居');
    
    // 验证调用
    expect(mockedMapGenreToId).toHaveBeenCalledWith('喜剧');
    expect(mockedTmdbClient.getRecommendationsByGenre).toHaveBeenCalledWith(35);
  });

  it('当找不到类型时应该返回错误提示', async () => {
    // 模拟类型映射失败
    mockedMapGenreToId.mockReturnValue(undefined);
    
    // 调用工具函数
    const result = await getRecommendationsByGenre({ genre: '未知类型' });
    
    // 验证输出
    expect(result).toContain('抱歉，无法识别您提供的类型"未知类型"');
    
    // 验证未调用API
    expect(mockedTmdbClient.getRecommendationsByGenre).not.toHaveBeenCalled();
  });

  it('当API返回空结果时应该返回相应提示', async () => {
    // 模拟类型映射
    mockedMapGenreToId.mockReturnValue(999); // 假设999是一个罕见类型
    mockedGetGenreNameById.mockReturnValue('罕见类型');
    
    // 模拟API响应为空结果
    mockedTmdbClient.getRecommendationsByGenre.mockResolvedValue({
      page: 1,
      results: []
    });
    
    // 调用工具函数
    const result = await getRecommendationsByGenre({ genre: '罕见类型' });
    
    // 验证输出
    expect(result).toContain('抱歉，在"罕见类型"类型下没有找到推荐剧集');
  });

  it('当缺少参数时应该抛出错误', async () => {
    // 调用工具函数，传入空参数
    const result = await getRecommendationsByGenre({ genre: '' });
    
    // 验证输出
    expect(result).toContain('获取推荐时发生错误');
  });

  it('当API调用失败时应该返回错误信息', async () => {
    // 模拟类型映射
    mockedMapGenreToId.mockReturnValue(35);
    
    // 模拟API调用失败
    mockedTmdbClient.getRecommendationsByGenre.mockRejectedValue(new Error('API错误'));
    
    // 调用工具函数
    const result = await getRecommendationsByGenre({ genre: '喜剧' });
    
    // 验证输出
    expect(result).toContain('获取推荐时发生错误');
  });
}); 
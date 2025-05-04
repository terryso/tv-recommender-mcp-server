import { discoverShows, findShowsByPersonName, getRecommendationsByActor, findPersonId } from '../tools/discoverShowsTool';
import { tmdbClient } from '../services/tmdbClient';
import { ApiError } from '../utils/errorHandler';

// 模拟 tmdbClient 和其他依赖
jest.mock('../services/tmdbClient', () => {
  return {
    tmdbClient: {
      discoverTvShows: jest.fn(),
      searchPerson: jest.fn(),
      searchKeyword: jest.fn(),
      getPersonTvCredits: jest.fn(),
    }
  };
});

// 模拟 console.log 以便测试日志输出
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

jest.mock('../utils/genreMap', () => ({
  mapGenreToId: jest.fn(),
  getGenreNameById: jest.fn()
}));

jest.mock('../utils/errorHandler', () => {
  const original = jest.requireActual('../utils/errorHandler');
  return {
    ...original,
    formatErrorMessage: jest.fn(error => error instanceof Error ? error.message : String(error)),
    ApiError: original.ApiError
  };
});

describe('discoverShows Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 设置默认的 mapGenreToId 实现
    const { mapGenreToId } = require('../utils/genreMap');
    (mapGenreToId as jest.Mock).mockImplementation((genre) => {
      if (genre === '喜剧') return 35;
      if (genre === '科幻') return 10765;
      return null;
    });
  });

  it('应该使用默认参数正确调用API', async () => {
    // 模拟API响应
    const mockResponse = {
      page: 1,
      results: [
        {
          id: 1,
          name: '测试剧集1',
          overview: '测试简介1',
          poster_path: '/path1.jpg',
          vote_average: 8.5,
          first_air_date: '2022-01-01'
        },
        {
          id: 2,
          name: '测试剧集2',
          overview: '测试简介2',
          poster_path: '/path2.jpg',
          vote_average: 7.5,
          first_air_date: '2021-02-01'
        }
      ],
      total_pages: 10,
      total_results: 200
    };

    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    const result = await discoverShows({});

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        sort_by: 'popularity.desc',
        page: 1
      })
    );

    // 验证结果格式
    expect(result).toEqual({
      page: 1,
      results: [
        {
          id: 1,
          name: '测试剧集1',
          overview: '测试简介1',
          poster_path: '/path1.jpg',
          vote_average: 8.5,
          first_air_date: '2022-01-01'
        },
        {
          id: 2,
          name: '测试剧集2',
          overview: '测试简介2',
          poster_path: '/path2.jpg',
          vote_average: 7.5,
          first_air_date: '2021-02-01'
        }
      ],
      total_pages: 10,
      total_results: 2
    });
  });

  it('应该正确处理类型参数', async () => {
    // 模拟API响应
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };

    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      with_genres: ['喜剧', '科幻']
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        with_genres: '35,10765'
      })
    );
  });

  it('应该抛出错误当无法识别所有类型', async () => {
    const { mapGenreToId } = require('../utils/genreMap');
    (mapGenreToId as jest.Mock).mockReturnValue(null);

    // 执行测试并验证错误
    await expect(discoverShows({
      with_genres: ['未知类型']
    })).rejects.toThrow('无法识别提供的类型');
  });

  it('应该使用findShowsByPersonName查找演员参与的作品', async () => {
    // 模拟API响应
    const mockPersonResponse = {
      results: [{ id: 123 }]
    };

    const mockCreditsResponse = {
      cast: [
        {
          id: 1,
          name: '测试剧集1',
          overview: '测试简介1',
          poster_path: '/path1.jpg',
          vote_average: 8.5,
          first_air_date: '2022-01-01'
        }
      ]
    };

    (tmdbClient.searchPerson as jest.Mock).mockResolvedValue(mockPersonResponse);
    (tmdbClient.getPersonTvCredits as jest.Mock).mockResolvedValue(mockCreditsResponse);

    // 执行测试
    const result = await findShowsByPersonName('布莱恩·科兰斯顿');

    // 验证调用
    expect(tmdbClient.searchPerson).toHaveBeenCalledWith('布莱恩·科兰斯顿');
    expect(tmdbClient.getPersonTvCredits).toHaveBeenCalledWith(123);
    
    // 验证结果
    expect(result.results).toHaveLength(1);
    expect(result.results[0].name).toBe('测试剧集1');
  });

  it('应该使用getRecommendationsByActor获取演员推荐', async () => {
    // 模拟API响应
    const mockPersonResponse = {
      results: [{ id: 123 }]
    };

    const mockCreditsResponse = {
      cast: [
        {
          id: 1,
          name: '测试剧集1',
          overview: '测试简介1',
          poster_path: '/path1.jpg',
          vote_average: 8.5,
          first_air_date: '2022-01-01'
        },
        {
          id: 2,
          name: '测试剧集2',
          overview: '测试简介2',
          poster_path: '/path2.jpg',
          vote_average: 7.5,
          first_air_date: '2021-02-01'
        }
      ]
    };

    (tmdbClient.searchPerson as jest.Mock).mockResolvedValue(mockPersonResponse);
    (tmdbClient.getPersonTvCredits as jest.Mock).mockResolvedValue(mockCreditsResponse);

    // 执行测试
    const result = await getRecommendationsByActor('布莱恩·科兰斯顿', 5);

    // 验证调用
    expect(tmdbClient.searchPerson).toHaveBeenCalledWith('布莱恩·科兰斯顿');
    expect(tmdbClient.getPersonTvCredits).toHaveBeenCalledWith(123);
    
    // 验证结果
    expect(result.results).toHaveLength(2);
    // 验证按评分排序
    expect(result.results[0].vote_average).toBe(8.5);
    expect(result.results[1].vote_average).toBe(7.5);
  });

  it('findShowsByPersonName应该在找不到人物时抛出错误', async () => {
    (tmdbClient.searchPerson as jest.Mock).mockResolvedValue({ results: [] });

    // 执行测试并验证错误
    await expect(findShowsByPersonName('未知演员')).rejects.toThrow('未找到人物');
  });

  it('getRecommendationsByActor应该在找不到演员时抛出错误', async () => {
    (tmdbClient.searchPerson as jest.Mock).mockResolvedValue({ results: [] });

    // 执行测试并验证错误
    await expect(getRecommendationsByActor('未知演员')).rejects.toThrow('未找到演员');
  });

  it('应该正确处理年份参数并过滤结果', async () => {
    // 模拟API响应，包含不同年份的剧集
    const mockResponse = {
      page: 1,
      results: [
        {
          id: 1,
          name: '2022剧集',
          overview: '测试简介',
          poster_path: '/path.jpg',
          vote_average: 8.5,
          first_air_date: '2022-05-15'
        },
        {
          id: 2,
          name: '2023剧集',
          overview: '测试简介',
          poster_path: '/path.jpg',
          vote_average: 7.5,
          first_air_date: '2023-01-10'
        },
        {
          id: 3,
          name: '无日期剧集',
          overview: '测试简介',
          poster_path: '/path.jpg',
          vote_average: 6.5,
          first_air_date: null
        }
      ],
      total_pages: 1,
      total_results: 3
    };

    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    const result = await discoverShows({
      first_air_date_year: 2022
    });

    // 验证API调用参数
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        first_air_date_gte: '2022-01-01',
        first_air_date_lte: '2022-12-31'
      })
    );

    // 验证结果过滤
    expect(result.results.length).toBe(1);
    expect(result.results[0].name).toBe('2022剧集');
    expect(result.total_results).toBe(1);
    
    // 验证日志输出
    expect(console.log).toHaveBeenCalledWith('过滤前剧集数量: 3');
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('无日期剧集') && expect.stringContaining('缺少首播日期')
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('2023剧集') && expect.stringContaining('不匹配')
    );
    expect(console.log).toHaveBeenCalledWith('过滤后剧集数量: 1');
  });

  it('应该正确处理评分参数', async () => {
    // 模拟API响应
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };

    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      vote_average_gte: 8.0
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        vote_average_gte: 8.0
      })
    );
  });

  it('应该正确处理网络参数', async () => {
    // 模拟API响应
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };

    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      with_networks: [213, 19]
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        with_networks: '213,19'
      })
    );
  });

  it('应该正确处理关键词参数', async () => {
    // 模拟API响应
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };

    const mockKeywordResponse = {
      results: [{ id: 456 }]
    };

    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);
    (tmdbClient.searchKeyword as jest.Mock).mockResolvedValue(mockKeywordResponse);

    // 执行测试
    await discoverShows({
      with_keywords: ['太空']
    });

    // 验证调用
    expect(tmdbClient.searchKeyword).toHaveBeenCalledWith('太空');
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        with_keywords: '456'
      })
    );
  });

  it('应该抛出错误当找不到任何关键词', async () => {
    (tmdbClient.searchKeyword as jest.Mock).mockResolvedValue({ results: [] });

    // 执行测试并验证错误
    await expect(discoverShows({
      with_keywords: ['未知关键词']
    })).rejects.toThrow('无法找到关键词');
  });

  it('应该处理 searchKeyword 抛出的错误', async () => {
    (tmdbClient.searchKeyword as jest.Mock).mockRejectedValue(new Error('API错误'));

    // 执行测试并验证错误
    await expect(discoverShows({
      with_keywords: ['太空']
    })).rejects.toThrow('无法找到关键词');
  });

  it('应该正确处理API错误', async () => {
    (tmdbClient.discoverTvShows as jest.Mock).mockRejectedValue(new Error('API调用失败'));

    // 执行测试并验证错误
    await expect(discoverShows({})).rejects.toThrow(ApiError);
    await expect(discoverShows({})).rejects.toThrow('高级剧集发现失败');
  });

  it('应该处理结果中缺少部分字段的情况', async () => {
    // 模拟API响应中缺少部分字段
    const mockResponse = {
      page: 1,
      results: [
        {
          id: 1,
          name: '缺失字段剧集',
          // 没有overview、poster_path和vote_average
          first_air_date: '2022-01-01'
        }
      ],
      total_pages: 1,
      total_results: 1
    };

    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    const result = await discoverShows({});

    // 验证格式化后的结果包含默认值
    expect(result.results[0]).toEqual({
      id: 1,
      name: '缺失字段剧集',
      overview: '暂无简介',
      poster_path: null,
      vote_average: 0,
      first_air_date: '2022-01-01'
    });
  });
}); 
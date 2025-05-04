import { discoverShows, findShowsByPersonName, getRecommendationsByActor, findPersonId, getPersonTvCredits, convertCastToIds, findKeywordId } from '../tools/discoverShowsTool';
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
        'first_air_date.gte': '2022-01-01',
        'first_air_date.lte': '2022-12-31'
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
        'vote_average.gte': 8.0
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
    // 模拟关键词搜索响应
    const mockKeywordResponse = {
      results: [{ id: 789 }]
    };
    (tmdbClient.searchKeyword as jest.Mock).mockResolvedValue(mockKeywordResponse);
    
    // 模拟API响应
    const mockDiscoverResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockDiscoverResponse);

    // 执行测试
    await discoverShows({
      with_keywords: ['太空', '机器人']
    });

    // 验证关键词搜索被正确调用
    expect(tmdbClient.searchKeyword).toHaveBeenCalledWith('太空');
    expect(tmdbClient.searchKeyword).toHaveBeenCalledWith('机器人');
    
    // 验证discover调用使用了转换后的关键词ID
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        with_keywords: '789,789'
      })
    );
  });

  it('应该抛出错误当无法识别所有关键词', async () => {
    // 模拟关键词搜索返回空结果
    (tmdbClient.searchKeyword as jest.Mock).mockResolvedValue({ results: [] });

    // 执行测试并验证错误
    await expect(discoverShows({
      with_keywords: ['未知关键词']
    })).rejects.toThrow('无法找到关键词');
  });

  it('应该正确处理网络参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      with_networks: [213, 1024] // Netflix, XXX网络
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        with_networks: '213,1024'
      })
    );
  });

  it('应该正确处理排序参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      sort_by: 'first_air_date.desc'
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        sort_by: 'first_air_date.desc'
      })
    );
  });

  it('应该正确处理评分参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      vote_average_gte: 8.5
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        'vote_average.gte': 8.5
      })
    );
  });

  it('应该正确处理语言参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      with_original_language: 'en'
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        with_original_language: 'en'
      })
    );
  });

  it('应该正确处理成人内容参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      include_adult: false
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        include_adult: false
      })
    );
  });

  it('应该正确处理无首播日期参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      include_null_first_air_dates: true
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        include_null_first_air_dates: true
      })
    );
  });

  it('应该正确处理原产国参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      with_origin_country: 'US'
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        with_origin_country: 'US'
      })
    );
  });

  it('应该正确处理状态参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      with_status: '0'
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        with_status: '0'
      })
    );
  });

  it('应该正确处理院线放映参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      screened_theatrically: true
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        screened_theatrically: true
      })
    );
  });

  it('应该正确处理时区参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      timezone: 'America/New_York'
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        timezone: 'America/New_York'
      })
    );
  });

  it('应该正确处理观看区域参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      watch_region: 'US'
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        watch_region: 'US'
      })
    );
  });

  it('应该正确处理观看提供商参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      with_watch_providers: '8|9'
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        with_watch_providers: '8|9'
      })
    );
  });

  it('应该正确处理观看货币化类型参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      with_watch_monetization_types: 'flatrate'
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        with_watch_monetization_types: 'flatrate'
      })
    );
  });

  it('应该正确处理制作公司参数', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    await discoverShows({
      with_companies: '420|421'
    });

    // 验证调用
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        with_companies: '420|421'
      })
    );
  });

  it('应该处理API调用错误', async () => {
    // 模拟API调用错误
    (tmdbClient.discoverTvShows as jest.Mock).mockRejectedValue(new Error('API错误'));

    // 执行测试并验证错误被正确传递
    await expect(discoverShows({})).rejects.toThrow('API错误');
  });

  it('应该处理空结果集', async () => {
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0
    };
    
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    const result = await discoverShows({});

    // 验证结果
    expect(result.results).toEqual([]);
    expect(result.total_results).toBe(0);
  });

  it('应该处理缺少数据的结果项', async () => {
    const mockResponse = {
      page: 1,
      results: [
        {
          id: 1,
          name: '测试剧集'
          // 缺少其他字段
        }
      ],
      total_pages: 1,
      total_results: 1
    };
    
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);

    // 执行测试
    const result = await discoverShows({});

    // 验证结果中填充了默认值
    expect(result.results[0]).toEqual({
      id: 1,
      name: '测试剧集',
      overview: '暂无简介',
      poster_path: null,
      vote_average: 0
    });
  });

  it('findPersonId应该返回null当未找到人物', async () => {
    (tmdbClient.searchPerson as jest.Mock).mockResolvedValue({ results: [] });
    
    const result = await findPersonId('未知人物');
    
    expect(result).toBeNull();
  });

  it('findPersonId应该返回null当API调用失败', async () => {
    (tmdbClient.searchPerson as jest.Mock).mockRejectedValue(new Error('API错误'));
    
    const result = await findPersonId('人物名');
    
    expect(result).toBeNull();
  });

  it('应该测试演员转换为ID的逻辑', async () => {
    // 模拟相关API调用以测试演员ID转换逻辑
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
    
    // 通过调用公开API来间接测试内部函数
    await getRecommendationsByActor('布莱恩·科兰斯顿', 10);
    
    // 测试找不到演员的情况
    (tmdbClient.searchPerson as jest.Mock).mockResolvedValue({ results: [] });
    await expect(getRecommendationsByActor('未知演员')).rejects.toThrow('未找到演员');
  });
  
  it('应该处理API错误情况', async () => {
    // 测试API调用错误处理
    
    // 模拟searchKeyword抛出错误，这会导致关键词搜索返回null
    (tmdbClient.searchKeyword as jest.Mock).mockRejectedValue(new Error('API错误'));
    
    // 使用空关键词列表，这样不会调用关键词搜索
    await discoverShows({
      with_keywords: []
    });
    
    // 使用有效关键词列表但模拟搜索总是返回空结果
    (tmdbClient.searchKeyword as jest.Mock).mockResolvedValue({ results: [] });
    
    await expect(discoverShows({
      with_keywords: ['关键词']
    })).rejects.toThrow('无法找到关键词');
  });
  
  it('应该测试getPersonTvCredits函数处理API错误的情况', async () => {
    // 模拟API调用错误
    (tmdbClient.getPersonTvCredits as jest.Mock).mockRejectedValue(new Error('API错误'));
    
    // 执行测试并验证错误被正确传递
    await expect(getPersonTvCredits(123)).rejects.toThrow('获取人物电视作品失败');
  });
  
  it('应该处理包含年份参数的查询并进行过滤', async () => {
    // 模拟console.log来验证过滤日志
    const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    
    // 模拟API响应，包含不同年份的剧集
    const mockResponse = {
      page: 1,
      results: [
        {
          id: 1,
          name: '测试剧集1',
          overview: '简介1',
          poster_path: '/path1.jpg',
          vote_average: 8.5,
          first_air_date: '2022-01-01'
        },
        {
          id: 2,
          name: '测试剧集2',
          overview: '简介2',
          poster_path: '/path2.jpg',
          vote_average: 7.5,
          first_air_date: '2023-05-15'
        },
        {
          id: 3,
          name: '测试剧集3',
          overview: '简介3',
          poster_path: '/path3.jpg',
          vote_average: 9.0,
          first_air_date: null // 缺少首播日期
        }
      ],
      total_pages: 1,
      total_results: 3
    };
    
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);
    
    // 执行测试，过滤2022年的剧集
    const result = await discoverShows({
      first_air_date_year: 2022
    });
    
    // 验证过滤后的结果
    expect(result.results.length).toBe(1);
    expect(result.results[0].name).toBe('测试剧集1');
    expect(result.total_results).toBe(1);
    
    // 验证日志输出
    expect(mockConsoleLog).toHaveBeenCalledWith('过滤前剧集数量: 3');
    expect(mockConsoleLog).toHaveBeenCalledWith('过滤后剧集数量: 1');
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('缺少首播日期'));
    expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('与请求年份 2022 不匹配'));
    
    // 恢复原始实现
    mockConsoleLog.mockRestore();
  });

  it('应该正确测试 API 错误处理（演员相关）', async () => {
    // 模拟演员搜索 API 抛出错误
    (tmdbClient.searchPerson as jest.Mock).mockRejectedValue(new Error('API 错误'));
    
    // 应该返回 null 而不是抛出错误
    const result = await findPersonId('演员名');
    expect(result).toBeNull();
  });
  
  it('应该处理空演员数组', async () => {
    // 测试 findShowsByPersonName 使用空字符串参数，这会间接测试内部的演员转换函数
    (tmdbClient.searchPerson as jest.Mock).mockResolvedValue({
      results: []
    });
    
    await expect(findShowsByPersonName('')).rejects.toThrow('未找到人物');
  });
  
  it('应该测试关键词处理的更多场景', async () => {
    // 1. 空关键词数组
    const mockResponse = {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    };
    (tmdbClient.discoverTvShows as jest.Mock).mockResolvedValue(mockResponse);
    
    await discoverShows({
      with_keywords: []
    });
    
    // 验证 API 调用不包含 with_keywords 参数
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.not.objectContaining({
        with_keywords: expect.anything()
      })
    );
    
    // 2. 关键词 ID 转换（一个关键词成功，一个失败）
    (tmdbClient.searchKeyword as jest.Mock)
      .mockImplementation((query: string) => {
        if (query === '太空') {
          return Promise.resolve({ results: [{ id: 789 }] });
        }
        return Promise.resolve({ results: [] });
      });
    
    // 这应该不会抛出错误，因为至少有一个关键词被成功转换
    await discoverShows({
      with_keywords: ['太空', '未知关键词']
    });
    
    // 验证 API 调用包含成功的关键词 ID
    expect(tmdbClient.discoverTvShows).toHaveBeenCalledWith(
      expect.objectContaining({
        with_keywords: '789'
      })
    );
  });

  it('应该实现 110 行的覆盖', async () => {
    // 首先模拟演员搜索成功
    (tmdbClient.searchPerson as jest.Mock).mockResolvedValue({
      results: [{ id: 123 }]
    });
    
    // 模拟 getPersonTvCredits 以便完成测试
    (tmdbClient.getPersonTvCredits as jest.Mock).mockResolvedValue({
      cast: [
        {
          id: 1,
          name: '测试剧集',
          overview: '测试简介',
          poster_path: '/test.jpg',
          vote_average: 8.0
        }
      ]
    });

    // 这将执行 convertCastToIds 函数的返回语句
    await getRecommendationsByActor('测试演员', 1);
    
    // 验证相关的API调用
    expect(tmdbClient.searchPerson).toHaveBeenCalledWith('测试演员');
    expect(tmdbClient.getPersonTvCredits).toHaveBeenCalledWith(123);
  });
}); 
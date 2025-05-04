import { getWatchProviders } from '../../tools/watchProviders';
import { tmdbClient } from '../../services/tmdbClient';

// 模拟tmdbClient
jest.mock('../../services/tmdbClient', () => ({
  tmdbClient: {
    searchTvShowByTitle: jest.fn(),
    getTvShowWatchProviders: jest.fn()
  }
}));

describe('getWatchProviders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应当返回格式化的观看渠道信息', async () => {
    // 模拟搜索结果
    const mockSearchResults = {
      results: [
        { id: 1396, name: '绝命毒师' }
      ]
    };

    // 模拟观看渠道数据
    const mockWatchProvidersData = {
      id: 1396,
      results: {
        link: 'https://www.themoviedb.org/tv/1396-breaking-bad/watch?locale=US',
        flatrate: [
          { provider_id: 8, provider_name: 'Netflix', logo_path: '/logo1.jpg' }
        ],
        rent: [
          { provider_id: 2, provider_name: 'Apple TV', logo_path: '/logo2.jpg' }
        ],
        buy: [
          { provider_id: 3, provider_name: 'Amazon Prime Video', logo_path: '/logo3.jpg' }
        ]
      }
    };

    // 设置模拟函数返回值
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue(mockSearchResults);
    (tmdbClient.getTvShowWatchProviders as jest.Mock).mockResolvedValue(mockWatchProvidersData);

    // 执行测试
    const result = await getWatchProviders({ show_title: '绝命毒师' });

    // 验证结果
    expect(tmdbClient.searchTvShowByTitle).toHaveBeenCalledWith('绝命毒师');
    expect(tmdbClient.getTvShowWatchProviders).toHaveBeenCalledWith(1396, 'US');
    
    expect(result).toEqual({
      country: 'US',
      link: 'https://www.themoviedb.org/tv/1396-breaking-bad/watch?locale=US',
      streaming: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/logo1.jpg' }
      ],
      rent: [
        { provider_id: 2, provider_name: 'Apple TV', logo_path: '/logo2.jpg' }
      ],
      buy: [
        { provider_id: 3, provider_name: 'Amazon Prime Video', logo_path: '/logo3.jpg' }
      ]
    });
  });

  it('应当使用自定义国家/地区代码', async () => {
    // 模拟搜索结果
    const mockSearchResults = {
      results: [
        { id: 1396, name: '绝命毒师' }
      ]
    };

    // 模拟观看渠道数据 (针对中国)
    const mockWatchProvidersData = {
      id: 1396,
      results: {
        link: 'https://www.themoviedb.org/tv/1396-breaking-bad/watch?locale=CN',
        flatrate: [
          { provider_id: 100, provider_name: '爱奇艺', logo_path: '/logo-iqiyi.jpg' }
        ],
        rent: [],
        buy: []
      }
    };

    // 设置模拟函数返回值
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue(mockSearchResults);
    (tmdbClient.getTvShowWatchProviders as jest.Mock).mockResolvedValue(mockWatchProvidersData);

    // 执行测试
    const result = await getWatchProviders({ show_title: '绝命毒师', country_code: 'CN' });

    // 验证结果
    expect(tmdbClient.getTvShowWatchProviders).toHaveBeenCalledWith(1396, 'CN');
    expect(result.country).toBe('CN');
    expect(result.streaming).toHaveLength(1);
    expect(result.streaming[0].provider_name).toBe('爱奇艺');
  });

  it('应当处理未找到剧集的情况', async () => {
    // 模拟空搜索结果
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue({ results: [] });

    // 执行测试并验证抛出的错误
    await expect(getWatchProviders({ show_title: '不存在的剧集' }))
      .rejects
      .toThrow('未找到名为"不存在的剧集"的剧集');
  });

  it('应当处理没有观看渠道信息的情况', async () => {
    // 模拟搜索结果
    const mockSearchResults = {
      results: [
        { id: 9999, name: '冷门剧集' }
      ]
    };

    // 模拟空的观看渠道数据
    const mockEmptyWatchProvidersData = {
      id: 9999,
      results: {}
    };

    // 设置模拟函数返回值
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue(mockSearchResults);
    (tmdbClient.getTvShowWatchProviders as jest.Mock).mockResolvedValue(mockEmptyWatchProvidersData);

    // 执行测试
    const result = await getWatchProviders({ show_title: '冷门剧集' });

    // 验证结果
    expect(result).toEqual({
      country: 'US',
      streaming: [],
      rent: [],
      buy: []
    });
  });
}); 
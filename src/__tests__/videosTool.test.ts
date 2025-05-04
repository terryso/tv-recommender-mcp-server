import { getShowVideos } from '../tools/videosTool';
import { tmdbClient } from '../services/tmdbClient';
import { ApiError } from '../utils/errorHandler';

// 模拟tmdbClient
jest.mock('../services/tmdbClient', () => ({
  tmdbClient: {
    searchTvShowByTitle: jest.fn(),
    getTvShowVideos: jest.fn()
  }
}));

describe('videosTool', () => {
  // 测试前重置所有模拟
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('应该成功获取剧集视频', async () => {
    // 模拟搜索剧集结果
    const mockSearchResults = {
      results: [
        { id: 123, name: '权力的游戏' }
      ]
    };
    
    // 模拟视频数据
    const mockVideosData = {
      results: [
        {
          id: 'video1',
          name: '第一季预告',
          key: 'abc123',
          site: 'YouTube',
          type: 'Trailer',
          official: true,
          published_at: '2011-03-15T12:00:00.000Z'
        },
        {
          id: 'video2',
          name: '预览片段',
          key: 'def456',
          site: 'Vimeo',
          type: 'Teaser',
          official: false,
          published_at: '2011-03-01T10:00:00.000Z'
        }
      ]
    };
    
    // 设置模拟函数的返回值
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue(mockSearchResults);
    (tmdbClient.getTvShowVideos as jest.Mock).mockResolvedValue(mockVideosData);
    
    // 执行函数
    const result = await getShowVideos({ show_title: '权力的游戏' });
    
    // 验证模拟函数是否被正确调用
    expect(tmdbClient.searchTvShowByTitle).toHaveBeenCalledWith('权力的游戏');
    expect(tmdbClient.getTvShowVideos).toHaveBeenCalledWith(123);
    
    // 验证结果是否正确
    expect(result.show_id).toBe(123);
    expect(result.videos).toHaveLength(2);
    
    // 验证视频排序：官方的应该在前面
    expect(result.videos[0].official).toBe(true);
    expect(result.videos[0].name).toBe('第一季预告');
    
    // 验证URL生成
    expect(result.videos[0].url).toBe('https://www.youtube.com/watch?v=abc123');
    expect(result.videos[1].url).toBe('https://vimeo.com/def456');
  });
  
  it('应该处理搜索不到剧集的情况', async () => {
    // 模拟空搜索结果
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue({ results: [] });
    
    // 执行并确认抛出正确的错误
    await expect(getShowVideos({ show_title: '不存在的剧集' }))
      .rejects
      .toThrow('未找到名为"不存在的剧集"的剧集');
  });
  
  it('应该处理API错误情况', async () => {
    // 模拟API错误
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockRejectedValue(new Error('网络错误'));
    
    // 执行并确认抛出正确的错误
    await expect(getShowVideos({ show_title: '权力的游戏' }))
      .rejects
      .toThrow('获取剧集"权力的游戏"的预告片和视频失败');
  });
  
  it('应该处理无视频的剧集', async () => {
    // 模拟搜索结果
    const mockSearchResults = {
      results: [{ id: 456, name: '新剧集' }]
    };
    
    // 模拟空视频数据
    const mockEmptyVideos = {
      results: []
    };
    
    // 设置模拟函数返回值
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue(mockSearchResults);
    (tmdbClient.getTvShowVideos as jest.Mock).mockResolvedValue(mockEmptyVideos);
    
    // 执行函数
    const result = await getShowVideos({ show_title: '新剧集' });
    
    // 验证结果
    expect(result).toEqual({
      show_id: 456,
      videos: []
    });
  });
  
  it('应该正确处理不同平台的视频URL', async () => {
    // 模拟搜索结果
    const mockSearchResults = {
      results: [{ id: 789, name: '测试剧集' }]
    };
    
    // 模拟包含不同平台的视频数据
    const mockMultiPlatformVideos = {
      results: [
        {
          id: 'v1',
          name: 'YouTube视频',
          key: 'yt123',
          site: 'YouTube',
          type: 'Trailer',
          official: true,
          published_at: '2020-01-01T00:00:00.000Z'
        },
        {
          id: 'v2',
          name: 'Vimeo视频',
          key: 'vm456',
          site: 'Vimeo',
          type: 'Trailer',
          official: true,
          published_at: '2020-01-02T00:00:00.000Z'
        },
        {
          id: 'v3',
          name: '其他平台视频',
          key: 'other789',
          site: 'OtherSite',
          type: 'Trailer',
          official: true,
          published_at: '2020-01-03T00:00:00.000Z'
        }
      ]
    };
    
    // 设置模拟函数返回值
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue(mockSearchResults);
    (tmdbClient.getTvShowVideos as jest.Mock).mockResolvedValue(mockMultiPlatformVideos);
    
    // 执行函数
    const result = await getShowVideos({ show_title: '测试剧集' });
    
    // 验证不同平台URL的生成
    expect(result.videos[0].url).toBe('https://othersite.com/video/other789');
    expect(result.videos[1].url).toBe('https://vimeo.com/vm456');
    expect(result.videos[2].url).toBe('https://www.youtube.com/watch?v=yt123');
  });
  
  it('应该根据类型和官方性质对视频进行排序', async () => {
    // 模拟搜索结果
    const mockSearchResults = {
      results: [{ id: 101, name: '排序测试' }]
    };
    
    // 模拟需要排序的视频数据
    const mockSortingVideos = {
      results: [
        {
          id: 's1',
          name: '非官方预览',
          key: 'key1',
          site: 'YouTube',
          type: 'Teaser',
          official: false,
          published_at: '2020-01-01T00:00:00.000Z'
        },
        {
          id: 's2',
          name: '官方预告',
          key: 'key2',
          site: 'YouTube',
          type: 'Trailer',
          official: true,
          published_at: '2020-01-02T00:00:00.000Z'
        },
        {
          id: 's3',
          name: '官方预览',
          key: 'key3',
          site: 'YouTube',
          type: 'Teaser',
          official: true,
          published_at: '2020-01-03T00:00:00.000Z'
        },
        {
          id: 's4',
          name: '非官方预告',
          key: 'key4',
          site: 'YouTube',
          type: 'Trailer',
          official: false,
          published_at: '2020-01-04T00:00:00.000Z'
        }
      ]
    };
    
    // 设置模拟函数返回值
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue(mockSearchResults);
    (tmdbClient.getTvShowVideos as jest.Mock).mockResolvedValue(mockSortingVideos);
    
    // 执行函数
    const result = await getShowVideos({ show_title: '排序测试' });
    
    // 验证排序：官方 > 非官方，Trailer > Teaser
    expect(result.videos[0].name).toBe('官方预告'); // 官方 + Trailer
    expect(result.videos[1].name).toBe('官方预览'); // 官方 + Teaser
    expect(result.videos[2].name).toBe('非官方预告'); // 非官方 + Trailer
    expect(result.videos[3].name).toBe('非官方预览'); // 非官方 + Teaser
  });
}); 
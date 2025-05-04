import { getShowReviews } from '../tools/reviewsTool';
import { tmdbClient } from '../services/tmdbClient';
import { ApiError } from '../utils/errorHandler';

// 模拟tmdbClient
jest.mock('../services/tmdbClient', () => ({
  tmdbClient: {
    searchTvShowByTitle: jest.fn(),
    getTvShowReviews: jest.fn()
  }
}));

describe('reviewsTool', () => {
  // 测试前重置所有模拟
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('应该成功获取剧集评论', async () => {
    // 模拟搜索剧集结果
    const mockSearchResults = {
      results: [
        { id: 123, name: '绝命毒师' }
      ]
    };
    
    // 模拟评论数据
    const mockReviewsData = {
      page: 1,
      results: [
        {
          id: 'rev1',
          author: 'reviewer1',
          author_details: {
            name: '',
            username: 'reviewer1',
            avatar_path: '/path/to/avatar1.jpg',
            rating: 9.0
          },
          content: '这是一部杰作...',
          created_at: '2021-05-15T12:00:00.000Z',
          updated_at: '2021-05-15T12:00:00.000Z',
          url: 'https://www.themoviedb.org/review/rev1'
        },
        {
          id: 'rev2',
          author: 'reviewer2',
          author_details: {
            name: 'John',
            username: 'reviewer2',
            avatar_path: null,
            rating: 8.5
          },
          content: '这部剧太棒了...',
          created_at: '2021-06-20T14:30:00.000Z',
          updated_at: '2021-06-20T14:30:00.000Z',
          url: 'https://www.themoviedb.org/review/rev2'
        }
      ],
      total_pages: 2,
      total_results: 25
    };
    
    // 设置模拟函数的返回值
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue(mockSearchResults);
    (tmdbClient.getTvShowReviews as jest.Mock).mockResolvedValue(mockReviewsData);
    
    // 执行函数
    const result = await getShowReviews({ show_title: '绝命毒师', page: 1 });
    
    // 验证模拟函数是否被正确调用
    expect(tmdbClient.searchTvShowByTitle).toHaveBeenCalledWith('绝命毒师');
    expect(tmdbClient.getTvShowReviews).toHaveBeenCalledWith(123, 1);
    
    // 验证结果是否正确
    expect(result).toEqual({
      show_id: 123,
      page: 1,
      results: mockReviewsData.results,
      total_pages: 2,
      total_results: 25
    });
  });
  
  it('应该使用默认页码1', async () => {
    // 模拟搜索剧集结果
    const mockSearchResults = {
      results: [{ id: 123, name: '绝命毒师' }]
    };
    
    // 模拟评论数据
    const mockReviewsData = {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0
    };
    
    // 设置模拟函数的返回值
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue(mockSearchResults);
    (tmdbClient.getTvShowReviews as jest.Mock).mockResolvedValue(mockReviewsData);
    
    // 执行函数，不指定页码
    await getShowReviews({ show_title: '绝命毒师' });
    
    // 验证使用了默认页码1
    expect(tmdbClient.getTvShowReviews).toHaveBeenCalledWith(123, 1);
  });
  
  it('应该处理搜索不到剧集的情况', async () => {
    // 模拟空搜索结果
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue({ results: [] });
    
    // 执行并确认抛出正确的错误
    await expect(getShowReviews({ show_title: '不存在的剧集' }))
      .rejects
      .toThrow('未找到名为"不存在的剧集"的剧集');
  });
  
  it('应该处理API错误情况', async () => {
    // 模拟API错误
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockRejectedValue(new Error('网络错误'));
    
    // 执行并确认抛出正确的错误
    await expect(getShowReviews({ show_title: '绝命毒师' }))
      .rejects
      .toThrow('获取剧集"绝命毒师"的评论失败');
  });
  
  it('应该处理无评论的剧集', async () => {
    // 模拟搜索结果
    const mockSearchResults = {
      results: [{ id: 456, name: '新剧集' }]
    };
    
    // 模拟空评论数据
    const mockEmptyReviews = {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0
    };
    
    // 设置模拟函数返回值
    (tmdbClient.searchTvShowByTitle as jest.Mock).mockResolvedValue(mockSearchResults);
    (tmdbClient.getTvShowReviews as jest.Mock).mockResolvedValue(mockEmptyReviews);
    
    // 执行函数
    const result = await getShowReviews({ show_title: '新剧集' });
    
    // 验证结果
    expect(result).toEqual({
      show_id: 456,
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0
    });
  });
}); 
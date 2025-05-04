import { getActorDetailsAndCredits } from '../tools/actorInfoTool';
import { tmdbClient } from '../services/tmdbClient';
import { ApiError } from '../utils/errorHandler';

// 模拟tmdbClient
jest.mock('../services/tmdbClient', () => ({
  tmdbClient: {
    searchPerson: jest.fn(),
    getPersonDetails: jest.fn(),
    getPersonTvCredits: jest.fn()
  }
}));

describe('actorInfoTool', () => {
  // 测试前重置所有模拟
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('应该成功获取演员信息和作品列表', async () => {
    // 模拟搜索演员结果
    const mockSearchResults = {
      results: [
        { id: 123, name: '汤姆·汉克斯' }
      ]
    };
    
    // 模拟演员详细信息
    const mockPersonDetails = {
      id: 123,
      name: '汤姆·汉克斯',
      biography: '著名演员...',
      profile_path: '/path/to/profile.jpg',
      popularity: 95.6,
      birthday: '1956-07-09',
      place_of_birth: '美国加利福尼亚州',
      homepage: null,
      also_known_as: ['Tom Hanks']
    };
    
    // 模拟演员作品列表
    const mockPersonCredits = {
      cast: [
        {
          id: 1,
          name: '拯救大兵瑞恩',
          character: '米勒上尉',
          poster_path: '/path/to/poster1.jpg',
          vote_average: 8.6,
          first_air_date: '1998-07-24'
        },
        {
          id: 2,
          name: '阿甘正传',
          character: '阿甘',
          poster_path: '/path/to/poster2.jpg',
          vote_average: 8.8,
          first_air_date: '1994-06-23'
        }
      ]
    };
    
    // 设置模拟函数的返回值
    (tmdbClient.searchPerson as jest.Mock).mockResolvedValue(mockSearchResults);
    (tmdbClient.getPersonDetails as jest.Mock).mockResolvedValue(mockPersonDetails);
    (tmdbClient.getPersonTvCredits as jest.Mock).mockResolvedValue(mockPersonCredits);
    
    // 执行函数
    const result = await getActorDetailsAndCredits({ actor_name: '汤姆·汉克斯' });
    
    // 验证模拟函数是否被正确调用
    expect(tmdbClient.searchPerson).toHaveBeenCalledWith('汤姆·汉克斯');
    expect(tmdbClient.getPersonDetails).toHaveBeenCalledWith(123);
    expect(tmdbClient.getPersonTvCredits).toHaveBeenCalledWith(123);
    
    // 验证结果是否正确
    expect(result).toEqual({
      actor: {
        id: 123,
        name: '汤姆·汉克斯',
        biography: '著名演员...',
        profile_path: '/path/to/profile.jpg',
        popularity: 95.6,
        birthday: '1956-07-09',
        place_of_birth: '美国加利福尼亚州',
        homepage: null,
        also_known_as: ['Tom Hanks']
      },
      credits: [
        // 按评分降序排序，所以阿甘正传应该排在前面
        {
          show_id: 2,
          show_title: '阿甘正传',
          character: '阿甘',
          poster_path: '/path/to/poster2.jpg',
          vote_average: 8.8,
          first_air_date: '1994-06-23'
        },
        {
          show_id: 1,
          show_title: '拯救大兵瑞恩',
          character: '米勒上尉',
          poster_path: '/path/to/poster1.jpg',
          vote_average: 8.6,
          first_air_date: '1998-07-24'
        }
      ]
    });
  });
  
  it('应该处理搜索不到演员的情况', async () => {
    // 模拟空搜索结果
    (tmdbClient.searchPerson as jest.Mock).mockResolvedValue({ results: [] });
    
    // 执行并确认抛出正确的错误
    await expect(getActorDetailsAndCredits({ actor_name: '不存在的演员' }))
      .rejects
      .toThrow('未找到名为"不存在的演员"的演员');
  });
  
  it('应该处理API错误情况', async () => {
    // 模拟API错误
    (tmdbClient.searchPerson as jest.Mock).mockRejectedValue(new Error('网络错误'));
    
    // 执行并确认抛出正确的错误
    await expect(getActorDetailsAndCredits({ actor_name: '汤姆·汉克斯' }))
      .rejects
      .toThrow('获取演员"汤姆·汉克斯"的信息失败');
  });
  
  it('应该处理无作品的演员', async () => {
    // 模拟搜索结果
    const mockSearchResults = {
      results: [{ id: 456, name: '新演员' }]
    };
    
    // 模拟演员详情
    const mockPersonDetails = {
      id: 456,
      name: '新演员',
      biography: '',
      profile_path: null,
      popularity: 10
    };
    
    // 模拟空作品列表
    const mockEmptyCredits = { cast: [] };
    
    // 设置模拟函数返回值
    (tmdbClient.searchPerson as jest.Mock).mockResolvedValue(mockSearchResults);
    (tmdbClient.getPersonDetails as jest.Mock).mockResolvedValue(mockPersonDetails);
    (tmdbClient.getPersonTvCredits as jest.Mock).mockResolvedValue(mockEmptyCredits);
    
    // 执行函数
    const result = await getActorDetailsAndCredits({ actor_name: '新演员' });
    
    // 验证模拟函数被正确调用
    expect(tmdbClient.searchPerson).toHaveBeenCalledWith('新演员');
    expect(tmdbClient.getPersonDetails).toHaveBeenCalledWith(456);
    expect(tmdbClient.getPersonTvCredits).toHaveBeenCalledWith(456);
    
    // 验证结果
    expect(result).toEqual({
      actor: {
        id: 456,
        name: '新演员',
        biography: '暂无简介',
        profile_path: null,
        popularity: 10
      },
      credits: []
    });
  });
}); 
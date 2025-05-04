import axios from 'axios';
import { getShowDetails } from '../../tools/details';

// 模拟 axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getShowDetails Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确返回剧集详情', async () => {
    // 模拟搜索结果
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve({
      data: {
        results: [
          {
            id: 123,
            name: '西部世界',
            first_air_date: '2016-10-02'
          }
        ]
      }
    }));

    // 模拟详情结果
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve({
      data: {
        id: 123,
        name: '西部世界',
        overview: '这是一部关于机器人的剧集',
        first_air_date: '2016-10-02',
        genres: [
          { id: 1, name: '科幻' },
          { id: 2, name: '西部' }
        ],
        number_of_seasons: 4,
        status: 'Canceled',
        vote_average: 8.0,
        credits: {
          cast: [
            { name: '埃文·蕾切尔·伍德', order: 0 },
            { name: '坦迪·牛顿', order: 1 },
            { name: '杰弗里·怀特', order: 2 },
            { name: '詹姆斯·麦斯登', order: 3 },
            { name: '艾德·哈里斯', order: 4 }
          ]
        }
      }
    }));

    const result = await getShowDetails({ show_title: '西部世界' });
    expect(result).toEqual({
      title: '西部世界',
      year: 2016,
      rating: 8.0,
      genres: ['科幻', '西部'],
      overview: '这是一部关于机器人的剧集',
      cast: ['埃文·蕾切尔·伍德', '坦迪·牛顿', '杰弗里·怀特', '詹姆斯·麦斯登', '艾德·哈里斯'],
      numberOfSeasons: 4,
      status: '已取消'
    });

    // 验证 API 调用
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      1, 
      expect.stringContaining('/search/tv'), 
      expect.anything()
    );
    expect(mockedAxios.get).toHaveBeenNthCalledWith(
      2, 
      expect.stringContaining('/tv/123'), 
      expect.anything()
    );
  });

  it('应该处理找不到剧集的情况', async () => {
    // 模拟空搜索结果
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve({
      data: {
        results: []
      }
    }));

    const result = await getShowDetails({ show_title: '一部不存在的剧' });
    expect(result).toBe('抱歉，未能找到您提供的剧集"一部不存在的剧"。');

    // 验证只调用了搜索 API
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/search/tv'), 
      expect.anything()
    );
  });

  it('应该处理 API 调用失败的情况', async () => {
    // 模拟 API 调用失败
    mockedAxios.get.mockImplementationOnce(() => Promise.reject(new Error('API Error')));

    const result = await getShowDetails({ show_title: '西部世界' });
    expect(result).toBe('获取剧集信息时发生错误，请稍后再试。');

    // 验证 API 调用
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('应该正确映射剧集状态', async () => {
    // 测试不同的状态映射
    const statusTestCases = [
      { apiStatus: 'Ended', expectedStatus: '已完结' },
      { apiStatus: 'Returning Series', expectedStatus: '连载中' },
      { apiStatus: 'Canceled', expectedStatus: '已取消' },
      { apiStatus: 'In Production', expectedStatus: '制作中' },
      { apiStatus: 'Unknown Status', expectedStatus: '未知状态' }
    ];

    for (const testCase of statusTestCases) {
      jest.clearAllMocks();
      
      // 模拟搜索结果
      mockedAxios.get.mockImplementationOnce(() => Promise.resolve({
        data: {
          results: [{ id: 123, name: '测试剧集' }]
        }
      }));
      
      // 模拟详情结果
      mockedAxios.get.mockImplementationOnce(() => Promise.resolve({
        data: {
          id: 123,
          name: '测试剧集',
          overview: '测试简介',
          first_air_date: '2020-01-01',
          genres: [{ id: 1, name: '测试类型' }],
          number_of_seasons: 1,
          status: testCase.apiStatus,
          vote_average: 8.0,
          credits: { cast: [{ name: '测试演员', order: 0 }] }
        }
      }));

      const result = await getShowDetails({ show_title: '测试剧集' });
      expect(result).toHaveProperty('status', testCase.expectedStatus);
    }
  });

  it('应该处理缺少首播日期的情况', async () => {
    // 模拟搜索结果
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve({
      data: {
        results: [
          {
            id: 456,
            name: '未公布日期的剧集'
          }
        ]
      }
    }));

    // 模拟详情结果，但没有first_air_date
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve({
      data: {
        id: 456,
        name: '未公布日期的剧集',
        overview: '这是一部尚未公布日期的剧集',
        first_air_date: null, // 首播日期为空
        genres: [{ id: 1, name: '科幻' }],
        number_of_seasons: 1,
        status: 'In Production',
        vote_average: 7.5,
        credits: {
          cast: [{ name: '测试演员', order: 0 }]
        }
      }
    }));

    const result = await getShowDetails({ show_title: '未公布日期的剧集' });
    
    // 验证结果，年份应该为null
    expect(result).toHaveProperty('year', null);
    expect(result).toHaveProperty('title', '未公布日期的剧集');
  });
}); 
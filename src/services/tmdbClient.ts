import axios, { type AxiosInstance } from 'axios';
import config from '../utils/config';

/**
 * TMDb API客户端类
 * 用于与The Movie Database API进行交互
 */
class TMDbClient {
  private client: AxiosInstance;
  private apiKey: string;
  private isTestEnv: boolean;
  
  constructor() {
    this.apiKey = config.tmdbApiKey;
    this.isTestEnv = config.isTestEnv;
    
    if (!this.apiKey && !this.isTestEnv) {
      throw new Error('TMDb API Key未设置，请在.env文件中配置TMDB_API_KEY');
    }
    
    // 创建Axios实例
    this.client = axios.create({
      baseURL: 'https://api.themoviedb.org/3',
      params: {
        api_key: this.apiKey,
        language: 'zh-CN' // 默认使用中文
      }
    });
  }
  
  /**
   * 测试API连接是否正常
   * 通过获取API配置信息来验证API Key是否有效
   */
  async testConnection(): Promise<boolean> {
    if (this.isTestEnv) {
      return true; // 测试环境直接返回成功
    }
    
    try {
      const response = await this.client.get('/configuration');
      return response.status === 200;
    } catch (error) {
      // console.error('TMDb API连接测试失败:', error);
      return false;
    }
  }
  
  /**
   * 获取TV节目配置信息
   */
  async getConfiguration() {
    if (this.isTestEnv) {
      return { 
        images: { 
          base_url: 'http://image.tmdb.org/t/p/',
          secure_base_url: 'https://image.tmdb.org/t/p/',
          backdrop_sizes: ['w300', 'w780', 'w1280', 'original'],
          logo_sizes: ['w45', 'w92', 'w154', 'w185', 'w300', 'w500', 'original'],
          poster_sizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
          profile_sizes: ['w45', 'w185', 'h632', 'original'],
          still_sizes: ['w92', 'w185', 'w300', 'original']
        }
      };
    }
    
    try {
      const response = await this.client.get('/configuration');
      return response.data;
    } catch (error) {
      // console.error('获取TMDb配置失败:', error);
      throw error;
    }
  }
  
  /**
   * 查询TV节目
   * @param query 查询关键词
   */
  async searchTvShow(query: string) {
    if (this.isTestEnv) {
      return {
        page: 1,
        results: [
          {
            id: 123,
            name: query,
            overview: '这是测试简介',
            first_air_date: '2020-01-01'
          }
        ]
      };
    }
    
    try {
      const response = await this.client.get('/search/tv', {
        params: {
          query
        }
      });
      return response.data;
    } catch (error) {
      // console.error(`查询TV节目"${query}"失败:`, error);
      throw error;
    }
  }

  /**
   * 根据类型ID获取推荐电视剧
   * @param genreId 类型ID
   * @param limit 返回结果数量
   * @returns 推荐电视剧列表
   */
  async getRecommendationsByGenre(genreId: number, limit = 10) {
    if (this.isTestEnv) {
      return {
        page: 1,
        results: Array(limit).fill(0).map((_, index) => ({
          id: index + 1,
          name: `测试剧集 ${index + 1}`,
          overview: `测试简介 ${index + 1}`,
          first_air_date: '2020-01-01',
          vote_average: 8.0
        }))
      };
    }
    
    try {
      const response = await this.client.get('/discover/tv', {
        params: {
          with_genres: genreId,
          sort_by: 'vote_average.desc', // 按评分降序排序
          'vote_count.gte': 100, // 至少有100个评分，避免低质量内容
          page: 1
        }
      });
      
      // 限制返回结果数量
      response.data.results = response.data.results.slice(0, limit);
      
      return response.data;
    } catch (error) {
      // console.error(`获取类型ID ${genreId} 的推荐失败:`, error);
      throw error;
    }
  }

  /**
   * 获取所有TV类型列表
   * 用于初始化或验证类型映射
   */
  async getTvGenres() {
    if (this.isTestEnv) {
      return {
        genres: [
          { id: 10765, name: '科幻' },
          { id: 18, name: '剧情' },
          { id: 35, name: '喜剧' },
          { id: 80, name: '犯罪' }
        ]
      };
    }
    
    try {
      const response = await this.client.get('/genre/tv/list');
      return response.data;
    } catch (error) {
      // console.error('获取TV类型列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据剧集名称搜索剧集
   * @param title 剧集名称
   * @returns 搜索结果
   */
  async searchTvShowByTitle(title: string) {
    if (this.isTestEnv) {
      // 返回用于测试的模拟数据
      if (title === '不存在的剧集') {
        return { page: 1, results: [] };
      }
      
      return {
        page: 1,
        results: [
          {
            id: 123,
            name: title,
            overview: '这是测试简介',
            first_air_date: '2020-01-01'
          }
        ]
      };
    }
    
    try {
      const response = await this.client.get('/search/tv', {
        params: {
          query: title,
          page: 1
        }
      });
      return response.data;
    } catch (error) {
      // console.error(`搜索剧集"${title}"失败:`, error);
      throw error;
    }
  }

  /**
   * 获取与指定剧集相似的剧集
   * @param tvId: number 剧集ID
   * @param limit: number 返回结果数量
   * @returns 相似剧集列表
   */
  async getSimilarTvShows(tvId: number, limit = 10) {
    if (this.isTestEnv) {
      // 特殊测试场景：无相似剧集
      if (tvId === 999) {
        return { page: 1, results: [] };
      }
      
      return {
        page: 1,
        results: Array(limit).fill(0).map((_, index) => ({
          id: index + 100,
          name: `相似剧集 ${index + 1}`,
          overview: `这是与ID为${tvId}的剧集相似的剧集`,
          first_air_date: '2020-01-01',
          vote_average: 8.0
        }))
      };
    }
    
    try {
      const response = await this.client.get(`/tv/${tvId}/similar`);
      
      // 限制返回结果数量
      response.data.results = response.data.results.slice(0, limit);
      
      return response.data;
    } catch (error) {
      // console.log(`获取剧集ID ${tvId} 的相似剧集失败:`, error);
      throw error;
    }
  }
}

// 导出单例实例
export const tmdbClient = new TMDbClient();

// 导出类型以供其他文件使用
export default TMDbClient; 
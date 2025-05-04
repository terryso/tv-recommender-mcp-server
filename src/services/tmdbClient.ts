import axios, { type AxiosInstance } from 'axios';
import config from '../utils/config';

/**
 * TMDb API客户端类
 * 用于与The Movie Database API进行交互
 */
class TMDbClient {
  private client: AxiosInstance;
  private apiKey: string;
  
  constructor() {
    this.apiKey = config.tmdbApiKey;
    
    if (!this.apiKey) {
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
    try {
      const response = await this.client.get('/configuration');
      return response.data;
    } catch (error) {
      // 记录错误并重新抛出
      // console.error('获取TMDb配置失败:', error);
      throw new Error(`获取TMDb配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 查询TV节目
   * @param query 查询关键词
   */
  async searchTvShow(query: string) {
    try {
      const response = await this.client.get('/search/tv', {
        params: {
          query
        }
      });
      return response.data;
    } catch (error) {
      // 记录错误并重新抛出
      // console.error(`查询TV节目"${query}"失败:`, error);
      throw new Error(`查询TV节目"${query}"失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 根据类型ID获取推荐电视剧
   * @param genreId 类型ID
   * @param limit 返回结果数量
   * @returns 推荐电视剧列表
   */
  async getRecommendationsByGenre(genreId: number, limit = 10) {
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
      // 记录错误并重新抛出
      // console.error(`获取类型ID ${genreId} 的推荐失败:`, error);
      throw new Error(`获取类型ID ${genreId} 的推荐失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取所有TV类型列表
   * 用于初始化或验证类型映射
   */
  async getTvGenres() {
    try {
      const response = await this.client.get('/genre/tv/list');
      return response.data;
    } catch (error) {
      // 记录错误并重新抛出
      // console.error('获取TV类型列表失败:', error);
      throw new Error(`获取TV类型列表失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 根据剧集名称搜索剧集
   * @param title 剧集名称
   * @returns 搜索结果
   */
  async searchTvShowByTitle(title: string) {
    try {
      const response = await this.client.get('/search/tv', {
        params: {
          query: title,
          page: 1
        }
      });
      return response.data;
    } catch (error) {
      // 记录错误并重新抛出
      // console.error(`搜索剧集"${title}"失败:`, error);
      throw new Error(`搜索剧集"${title}"失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取与指定剧集相似的剧集
   * @param tvId 剧集ID
   * @param limit 返回结果数量
   * @returns 相似剧集列表
   */
  async getSimilarTvShows(tvId: number, limit = 10) {
    try {
      const response = await this.client.get(`/tv/${tvId}/similar`);
      
      // 限制返回结果数量
      response.data.results = response.data.results.slice(0, limit);
      
      return response.data;
    } catch (error) {
      // 记录错误并重新抛出
      // console.log(`获取剧集ID ${tvId} 的相似剧集失败:`, error);
      throw new Error(`获取剧集ID ${tvId} 的相似剧集失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取剧集的观看渠道信息
   * @param tvId 剧集ID
   * @param countryCode 国家/地区代码，如"US"、"CN"等
   * @returns 观看渠道信息
   */
  async getTvShowWatchProviders(tvId: number, countryCode = 'US') {
    try {
      const response = await this.client.get(`/tv/${tvId}/watch/providers`);
      const results = response.data.results || {};
      
      // 返回指定国家/地区的观看渠道信息，如果没有则返回空对象
      return {
        id: tvId,
        results: results[countryCode] || {}
      };
    } catch (error) {
      // 记录错误并重新抛出
      throw new Error(`获取剧集ID ${tvId} 的观看渠道失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 高级剧集发现API
   * 支持多种筛选条件组合搜索
   * @param params 搜索参数对象
   * @returns 发现结果
   */
  async discoverTvShows(params: Record<string, string | number | boolean | string[] | number[]> = {}) {
    try {
      const response = await this.client.get('/discover/tv', {
        params: {
          ...params,
          page: params.page || 1
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`高级剧集发现失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 搜索人物（演员、导演等）
   * @param query 人物名称
   * @returns 搜索结果
   */
  async searchPerson(query: string) {
    try {
      const response = await this.client.get('/search/person', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      throw new Error(`搜索人物"${query}"失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 搜索关键词
   * @param query 关键词文本
   * @returns 搜索结果
   */
  async searchKeyword(query: string) {
    try {
      const response = await this.client.get('/search/keyword', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      throw new Error(`搜索关键词"${query}"失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取人物详细信息
   * @param personId 人物ID
   * @returns 人物详细信息
   */
  async getPersonDetails(personId: number) {
    try {
      const response = await this.client.get(`/person/${personId}`);
      return response.data;
    } catch (error) {
      throw new Error(`获取人物ID ${personId} 的详细信息失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取电视网络列表
   * @returns 电视网络列表
   */
  async getNetworks() {
    try {
      // TMDb没有提供networks列表的API，但我们可以通过公司companies接口获取部分数据
      // 这里简化处理，实际应用中可能需要维护一个常用networks的映射表
      const response = await this.client.get('/watch/providers/tv');
      return response.data;
    } catch (error) {
      throw new Error(`获取电视网络列表失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取人物的电视剧作品列表
   * @param personId 人物ID
   * @returns 人物参与的电视剧列表
   */
  async getPersonTvCredits(personId: number) {
    try {
      const response = await this.client.get(`/person/${personId}/tv_credits`);
      return response.data;
    } catch (error) {
      throw new Error(`获取人物ID ${personId} 的电视剧作品失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取剧集的用户评论
   * @param tvId 剧集ID
   * @param page 页码，默认为1
   * @returns 用户评论列表
   */
  async getTvShowReviews(tvId: number, page = 1) {
    try {
      const response = await this.client.get(`/tv/${tvId}/reviews`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`获取剧集ID ${tvId} 的用户评论失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取热门剧集
   * @param page 页码，默认为1
   * @returns 热门剧集列表及分页信息
   */
  async getPopularTvShows(page = 1) {
    try {
      const response = await this.client.get('/tv/popular', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`获取热门剧集失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取趋势剧集
   * @param timeWindow 时间窗口，'day'表示日趋势，'week'表示周趋势
   * @param page 页码，默认为1
   * @returns 趋势剧集列表及分页信息
   */
  async getTrendingTvShows(timeWindow: 'day' | 'week' = 'week', page = 1) {
    try {
      const response = await this.client.get(`/trending/tv/${timeWindow}`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`获取${timeWindow === 'day' ? '日' : '周'}趋势剧集失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取剧集的预告片和相关视频
   * @param tvId 剧集ID
   * @returns 视频列表
   */
  async getTvShowVideos(tvId: number) {
    try {
      const response = await this.client.get(`/tv/${tvId}/videos`);
      return response.data;
    } catch (error) {
      throw new Error(`获取剧集ID ${tvId} 的预告片和视频失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// 导出单例实例
export const tmdbClient = new TMDbClient();

// 导出类型以供其他文件使用
export default TMDbClient; 
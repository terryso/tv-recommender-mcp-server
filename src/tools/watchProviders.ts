import { tmdbClient } from '../services/tmdbClient';

/**
 * 观看渠道查询参数类型
 */
export interface GetWatchProvidersParams {
  /** 剧集名称 */
  show_title: string;
  /** 可选的国家/地区代码 (默认为 'US') */
  country_code?: string;
}

/**
 * 提供商信息类型
 */
export interface Provider {
  /** 提供商ID */
  provider_id: number;
  /** 提供商名称 */
  provider_name: string;
  /** 提供商logo路径 */
  logo_path: string;
}

/**
 * 观看渠道响应类型
 */
export interface WatchProvidersResponse {
  /** 国家/地区代码 */
  country: string;
  /** TMDb观看页面链接 */
  link?: string;
  /** 流媒体提供商列表 */
  streaming: Provider[];
  /** 租赁提供商列表 */
  rent: Provider[];
  /** 购买提供商列表 */
  buy: Provider[];
}

/**
 * 获取指定剧集的观看渠道信息
 * @param params 包含剧集名称和可选国家/地区代码的参数对象
 * @returns 观看渠道信息
 */
export async function getWatchProviders(params: GetWatchProvidersParams): Promise<WatchProvidersResponse> {
  const { show_title, country_code = 'US' } = params;

  try {
    // 通过剧集名称查找剧集ID
    const searchResults = await tmdbClient.searchTvShowByTitle(show_title);
    
    // 如果没有找到任何结果，抛出错误
    if (!searchResults.results || searchResults.results.length === 0) {
      throw new Error(`未找到名为"${show_title}"的剧集`);
    }
    
    // 使用第一个搜索结果
    const tvId = searchResults.results[0].id;
    
    // 获取观看渠道信息
    const watchProvidersData = await tmdbClient.getTvShowWatchProviders(tvId, country_code);
    
    // 判断是否有观看渠道信息
    if (!watchProvidersData.results || Object.keys(watchProvidersData.results).length === 0) {
      return {
        country: country_code,
        streaming: [],
        rent: [],
        buy: []
      };
    }
    
    const providersInfo = watchProvidersData.results;
    
    return {
      country: country_code,
      link: providersInfo.link,
      streaming: providersInfo.flatrate || [],
      rent: providersInfo.rent || [],
      buy: providersInfo.buy || []
    };
  } catch (error) {
    // console.error('获取观看渠道失败:', error);
    throw error;
  }
} 
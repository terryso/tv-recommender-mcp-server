import { tmdbClient } from '../services/tmdbClient';

/**
 * 热门剧集查询参数接口
 */
export interface GetPopularShowsParams {
  /** 页码，默认为1 */
  page?: number;
}

/**
 * 趋势剧集查询参数接口
 */
export interface GetTrendingShowsParams {
  /** 时间窗口，'day'表示日趋势，'week'表示周趋势 */
  time_window: 'day' | 'week';
  /** 页码，默认为1 */
  page?: number;
}

/**
 * 剧集信息接口
 */
export interface ShowInfo {
  /** 剧集ID */
  id: number;
  /** 剧集名称 */
  name: string;
  /** 剧集简介 */
  overview: string;
  /** 剧集海报路径 */
  poster_path: string | null;
  /** 剧集评分 */
  vote_average: number;
  /** 首播日期 */
  first_air_date?: string;
}

/**
 * 剧集列表响应接口
 */
export interface ShowsListResponse {
  /** 当前页码 */
  page: number;
  /** 剧集列表 */
  results: ShowInfo[];
  /** 总页数 */
  total_pages?: number;
  /** 总结果数 */
  total_results?: number;
}

/**
 * 获取热门剧集
 * @param params 页码参数
 * @returns 热门剧集列表
 */
export async function getPopularShows(params: GetPopularShowsParams = {}): Promise<ShowsListResponse> {
  const { page = 1 } = params;

  try {
    const response = await tmdbClient.getPopularTvShows(page);
    
    // 格式化结果
    const result: ShowsListResponse = {
      page: response.page,
      results: response.results.map((show: any) => ({
        id: show.id,
        name: show.name,
        overview: show.overview || '暂无简介',
        poster_path: show.poster_path,
        vote_average: show.vote_average || 0,
        first_air_date: show.first_air_date
      })),
      total_pages: response.total_pages,
      total_results: response.total_results
    };
    
    return result;
  } catch (error) {
    throw new Error(`获取热门剧集失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 获取趋势剧集
 * @param params 包含时间窗口和页码的参数
 * @returns 趋势剧集列表
 */
export async function getTrendingShows(params: GetTrendingShowsParams): Promise<ShowsListResponse> {
  const { time_window, page = 1 } = params;

  try {
    const response = await tmdbClient.getTrendingTvShows(time_window, page);
    
    // 格式化结果
    const result: ShowsListResponse = {
      page: response.page,
      results: response.results.map((show: any) => ({
        id: show.id,
        name: show.name || show.original_name,
        overview: show.overview || '暂无简介',
        poster_path: show.poster_path,
        vote_average: show.vote_average || 0,
        first_air_date: show.first_air_date
      })),
      total_pages: response.total_pages,
      total_results: response.total_results
    };
    
    return result;
  } catch (error) {
    throw new Error(`获取${time_window === 'day' ? '日' : '周'}趋势剧集失败: ${error instanceof Error ? error.message : String(error)}`);
  }
} 
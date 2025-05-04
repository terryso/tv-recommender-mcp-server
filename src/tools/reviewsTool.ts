import { tmdbClient } from '../services/tmdbClient';
import { ApiError, formatErrorMessage } from '../utils/errorHandler';

/**
 * 获取剧集评论参数接口
 */
export interface GetShowReviewsParams {
  /** 剧集名称 */
  show_title: string;
  /** 页码，默认为1 */
  page?: number;
}

/**
 * 评论作者详情接口
 */
export interface AuthorDetails {
  /** 姓名 */
  name: string;
  /** 用户名 */
  username: string;
  /** 头像路径 */
  avatar_path?: string | null;
  /** 评分 */
  rating?: number | null;
}

/**
 * 单条评论信息接口
 */
export interface ReviewItem {
  /** 评论ID */
  id: string;
  /** 作者名称 */
  author: string;
  /** 作者详情 */
  author_details: AuthorDetails;
  /** 评论内容 */
  content: string;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
  /** 评论URL */
  url: string;
}

/**
 * 评论响应接口
 */
export interface ShowReviewsResponse {
  /** 剧集ID */
  show_id: number;
  /** 当前页 */
  page: number;
  /** 评论列表 */
  results: ReviewItem[];
  /** 总页数 */
  total_pages: number;
  /** 总评论数 */
  total_results: number;
}

/**
 * 获取剧集用户评论
 * @param params 包含剧集名称的参数对象
 * @returns 评论列表及分页信息
 */
export async function getShowReviews(params: GetShowReviewsParams): Promise<ShowReviewsResponse> {
  const { show_title, page = 1 } = params;

  try {
    // 通过剧集名称查找剧集ID
    const searchResults = await tmdbClient.searchTvShowByTitle(show_title);
    
    // 如果没有找到任何结果，抛出错误
    if (!searchResults.results || searchResults.results.length === 0) {
      throw new ApiError(`未找到名为"${show_title}"的剧集`, 404);
    }
    
    // 使用第一个搜索结果
    const tvId = searchResults.results[0].id;
    
    // 获取该剧集的评论
    const reviewsData = await tmdbClient.getTvShowReviews(tvId, page);
    
    return {
      show_id: tvId,
      page: reviewsData.page,
      results: reviewsData.results || [],
      total_pages: reviewsData.total_pages || 0,
      total_results: reviewsData.total_results || 0
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`获取剧集"${show_title}"的评论失败: ${error instanceof Error ? error.message : String(error)}`);
  }
} 
import { tmdbClient } from '../services/tmdbClient';
import { ApiError } from '../utils/errorHandler';

/**
 * 获取剧集视频参数接口
 */
export interface GetShowVideosParams {
  /** 剧集名称 */
  show_title: string;
}

/**
 * 视频信息接口
 */
export interface VideoInfo {
  /** 视频名称 */
  name: string;
  /** 视频key */
  key: string;
  /** 托管平台 */
  site: string;
  /** 视频类型 */
  type: string;
  /** 是否官方 */
  official: boolean;
  /** 完整URL */
  url: string;
  /** 发布日期 */
  published_at?: string;
  /** 视频ID */
  id?: string;
}

/**
 * 视频响应接口
 */
export interface ShowVideosResponse {
  /** 剧集ID */
  show_id: number;
  /** 视频列表 */
  videos: VideoInfo[];
}

/**
 * 根据视频平台和key构建视频URL
 * @param site 托管平台
 * @param key 视频key
 * @returns 完整的视频URL
 */
function buildVideoUrl(site: string, key: string): string {
  switch (site.toLowerCase()) {
    case 'youtube':
      return `https://www.youtube.com/watch?v=${key}`;
    case 'vimeo':
      return `https://vimeo.com/${key}`;
    default:
      return `https://${site.toLowerCase()}.com/video/${key}`;
  }
}

/**
 * 获取剧集预告片和视频
 * @param params 包含剧集名称的参数对象
 * @returns 视频列表
 */
export async function getShowVideos(params: GetShowVideosParams): Promise<ShowVideosResponse> {
  const { show_title } = params;

  try {
    // 通过剧集名称查找剧集ID
    const searchResults = await tmdbClient.searchTvShowByTitle(show_title);
    
    // 如果没有找到任何结果，抛出错误
    if (!searchResults.results || searchResults.results.length === 0) {
      throw new ApiError(`未找到名为"${show_title}"的剧集`, 404);
    }
    
    // 使用第一个搜索结果
    const tvId = searchResults.results[0].id;
    
    // 获取该剧集的视频
    const videosData = await tmdbClient.getTvShowVideos(tvId);
    
    // 格式化视频信息
    const videos: VideoInfo[] = (videosData.results || []).map((video: {
      id: string;
      name: string;
      key: string;
      site: string;
      type: string;
      official: boolean;
      published_at: string;
    }) => ({
      name: video.name,
      key: video.key,
      site: video.site,
      type: video.type,
      official: video.official,
      url: buildVideoUrl(video.site, video.key),
      published_at: video.published_at,
      id: video.id
    }));
    
    // 对视频排序：优先官方预告片
    videos.sort((a, b) => {
      // 优先官方
      if (a.official !== b.official) {
        return a.official ? -1 : 1;
      }
      
      // 其次按类型：Trailer > Teaser > 其他
      if (a.type !== b.type) {
        if (a.type === 'Trailer') return -1;
        if (b.type === 'Trailer') return 1;
        if (a.type === 'Teaser') return -1;
        if (b.type === 'Teaser') return 1;
      }
      
      // 最后按发布日期降序
      return (b.published_at || '') > (a.published_at || '') ? 1 : -1;
    });
    
    return {
      show_id: tvId,
      videos
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`获取剧集"${show_title}"的预告片和视频失败: ${error instanceof Error ? error.message : String(error)}`);
  }
} 
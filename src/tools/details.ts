/**
 * 剧集详情工具实现
 * 获取特定剧集的详细信息
 */

import axios from 'axios';
import config from '../utils/config';

// 定义工具参数接口
export interface GetShowDetailsParams {
  show_title: string;
}

// 定义剧集详情接口
export interface ShowDetails {
  title: string;
  year: number | null;
  rating: number;
  genres: string[];
  overview: string;
  cast: string[];
  numberOfSeasons: number;
  status: string;
}

/**
 * 状态映射表 - 将TMDb API返回的状态转换为中文
 */
const STATUS_MAP: Record<string, string> = {
  'Ended': '已完结',
  'Returning Series': '连载中',
  'Canceled': '已取消',
  'In Production': '制作中'
};

/**
 * 获取剧集详情
 * @param params 工具参数
 * @returns 剧集详情或错误提示
 */
export async function getShowDetails(params: GetShowDetailsParams): Promise<ShowDetails | string> {
  try {
    const { show_title } = params;

    // 1. 搜索剧集获取ID
    const searchUrl = `https://api.themoviedb.org/3/search/tv`;
    const searchResponse = await axios.get(searchUrl, {
      params: {
        api_key: config.tmdbApiKey,
        query: show_title,
        language: 'zh-CN',
        include_adult: false
      }
    });

    const searchResults = searchResponse.data.results;

    // 如果没有搜索结果
    if (!searchResults || searchResults.length === 0) {
      return `抱歉，未能找到您提供的剧集"${show_title}"。`;
    }

    // 2. 获取第一个匹配结果的ID
    const showId = searchResults[0].id;

    // 3. 获取剧集详情
    const detailsUrl = `https://api.themoviedb.org/3/tv/${showId}`;
    const detailsResponse = await axios.get(detailsUrl, {
      params: {
        api_key: config.tmdbApiKey,
        language: 'zh-CN',
        append_to_response: 'credits'
      }
    });

    const details = detailsResponse.data;

    // 4. 提取年份
    const year = details.first_air_date ? Number.parseInt(details.first_air_date.split('-')[0], 10) : null;

    // 5. 提取类型
    const genres = details.genres.map((genre: { name: string }) => genre.name);

    // 6. 提取主要演员 (前5名)
    const cast = details.credits.cast
      .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
      .slice(0, 5)
      .map((actor: { name: string }) => actor.name);

    // 7. 映射状态
    const status = STATUS_MAP[details.status] || '未知状态';

    // 8. 构建返回结果
    return {
      title: details.name,
      year,
      rating: details.vote_average,
      genres,
      overview: details.overview,
      cast,
      numberOfSeasons: details.number_of_seasons,
      status
    };
  } catch (error) {
    // console.error('获取剧集详情错误:', error);
    return '获取剧集信息时发生错误，请稍后再试。';
  }
} 
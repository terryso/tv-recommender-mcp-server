import { tmdbClient } from '../services/tmdbClient';
import { mapGenreToId, getGenreNameById } from '../utils/genreMap';
import { ApiError, formatErrorMessage } from '../utils/errorHandler';

/**
 * 剧集推荐结果接口
 * 用于内部处理，最终会被格式化为文本输出
 */
interface ShowRecommendation {
  title: string;   // 剧名
  year: number;    // 首播年份
  rating: number;  // 评分
  overview: string; // 简介
}

/**
 * 按类型获取推荐工具参数接口
 */
export interface GetRecommendationsByGenreParams {
  genre: string;  // 类型，如"喜剧"或"Comedy"
}

/**
 * 获取相似剧集工具参数接口
 */
export interface GetSimilarShowsParams {
  show_title: string; // 剧集名称，如"怪奇物语"或"Stranger Things"
}

/**
 * 从TMDb API响应中提取需要的信息并格式化
 * @param results TMDb API返回的剧集列表
 * @returns 格式化后的剧集推荐列表
 */
function formatShowResults(results: any[]): ShowRecommendation[] {
  return results.map(show => {
    // 从首播日期中提取年份
    const year = show.first_air_date ? 
      new Date(show.first_air_date).getFullYear() : 
      null;
    
    return {
      title: show.name,
      year: year || 0,  // 如果没有年份，用0表示未知
      rating: show.vote_average || 0,
      overview: show.overview || '暂无简介'
    };
  });
}

/**
 * 将推荐结果格式化为字符串
 * @param genre 查询的类型
 * @param recommendations 推荐结果列表
 * @returns 格式化的字符串
 */
function formatRecommendationsToString(
  genre: string, 
  recommendations: ShowRecommendation[]
): string {
  if (!recommendations || recommendations.length === 0) {
    return `抱歉，在"${genre}"类型下没有找到推荐剧集。`;
  }
  
  // 格式化头部
  let result = `根据您选择的${genre}，为您推荐以下剧集：\n`;
  
  // 格式化每个推荐
  recommendations.forEach((show, index) => {
    result += `${index + 1}. ${show.title} (${show.year}): ${show.rating.toFixed(1)} - ${show.overview}\n`;
  });
  
  return result;
}

/**
 * 将相似剧集结果格式化为字符串
 * @param originalTitle 原始剧集名称
 * @param recommendations 推荐结果列表
 * @returns 格式化的字符串
 */
function formatSimilarShowsToString(
  originalTitle: string,
  recommendations: ShowRecommendation[]
): string {
  if (!recommendations || recommendations.length === 0) {
    return `抱歉，未能找到与"${originalTitle}"相似的剧集。`;
  }
  
  // 格式化头部
  let result = `与 ${originalTitle} 相似的剧集推荐：\n`;
  
  // 格式化每个推荐
  recommendations.forEach((show, index) => {
    result += `${index + 1}. ${show.title} (${show.year}): ${show.rating.toFixed(1)} - ${show.overview}\n`;
  });
  
  return result;
}

/**
 * 按类型获取剧集推荐实现
 * @param params 参数对象，包含genre字段
 * @returns 推荐结果字符串
 */
export async function getRecommendationsByGenre(
  params: GetRecommendationsByGenreParams
): Promise<string> {
  try {
    // 检查参数
    if (!params.genre) {
      throw new ApiError('缺少必要参数：genre', 400);
    }
    
    // 将用户输入的类型映射到TMDb类型ID
    const genreId = mapGenreToId(params.genre);
    
    // 如果无法识别类型
    if (!genreId) {
      return `抱歉，无法识别您提供的类型"${params.genre}"，请尝试其他类型如"喜剧"、"科幻"等。`;
    }
    
    // 获取类型名称（使用中文）
    const genreName = getGenreNameById(genreId) || params.genre;
    
    // 调用TMDb API获取推荐
    const response = await tmdbClient.getRecommendationsByGenre(genreId);
    
    // 格式化结果
    const recommendations = formatShowResults(response.results);
    
    // 返回格式化的字符串
    return formatRecommendationsToString(genreName, recommendations);
    
  } catch (error) {
    console.error('获取推荐时发生错误:', error);
    return `获取推荐时发生错误: ${formatErrorMessage(error)}`;
  }
}

/**
 * 获取相似剧集推荐实现
 * @param params 参数对象，包含show_title字段
 * @returns 推荐结果字符串
 */
export async function getSimilarShows(
  params: GetSimilarShowsParams
): Promise<string> {
  try {
    // 检查参数
    if (!params.show_title) {
      throw new ApiError('缺少必要参数：show_title', 400);
    }
    
    // 第一步：根据剧名搜索剧集
    const searchResponse = await tmdbClient.searchTvShowByTitle(params.show_title);
    
    // 检查是否找到结果
    if (!searchResponse.results || searchResponse.results.length === 0) {
      return `抱歉，未能找到您提供的剧集"${params.show_title}"。`;
    }
    
    // 获取第一个搜索结果（最匹配的）
    const firstResult = searchResponse.results[0];
    const showId = firstResult.id;
    const showTitle = firstResult.name;
    
    // 第二步：获取相似剧集
    const similarResponse = await tmdbClient.getSimilarTvShows(showId);
    
    // 检查是否有相似剧集
    if (!similarResponse.results || similarResponse.results.length === 0) {
      return `抱歉，未能找到与"${showTitle}"相似的剧集。`;
    }
    
    // 格式化结果
    const recommendations = formatShowResults(similarResponse.results);
    
    // 返回格式化的字符串
    return formatSimilarShowsToString(showTitle, recommendations);
    
  } catch (error) {
    console.error('获取相似剧集时发生错误:', error);
    return `获取相似剧集时发生错误: ${formatErrorMessage(error)}`;
  }
} 
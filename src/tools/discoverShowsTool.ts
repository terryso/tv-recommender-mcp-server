import { tmdbClient } from '../services/tmdbClient';
import { mapGenreToId, getGenreNameById } from '../utils/genreMap';
import { ApiError, formatErrorMessage } from '../utils/errorHandler';

/**
 * 参数变更说明：
 * 根据TMDB API文档，discover/tv接口不支持'with_cast'参数。
 * TMDB的discover/tv接口目前没有直接按演员或人物筛选剧集的参数。
 * 如需按演员查找剧集，请考虑使用其他替代方法，如先获取演员信息，
 * 然后通过演员的TV作品列表筛选。
 */

/**
 * 发现剧集结果接口
 */
export interface DiscoverShowsResult {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  first_air_date?: string;
}

/**
 * 发现剧集响应接口
 */
export interface DiscoverShowsResponse {
  page: number;
  results: DiscoverShowsResult[];
  total_pages: number;
  total_results: number;
}

/**
 * 高级发现工具参数接口
 */
export interface DiscoverShowsParams {
  with_genres?: string[];         // 类型名称数组，内部会转换为ID
  // with_cast参数已不再支持，TMDB API的discover/tv不提供此功能
  first_air_date_year?: number;   // 首播年份（非标准参数，内部处理）
  vote_average_gte?: number;      // 最低评分
  with_networks?: number[];       // 电视网络ID数组
  with_keywords?: string[];       // 关键词数组，内部会转换为ID
  sort_by?: string;               // 排序方式，默认为'popularity.desc'
  page?: number;                  // 页码
  with_original_language?: string;// 原始语言，如'en'表示英语
  include_adult?: boolean;        // 是否包含成人内容
  include_null_first_air_dates?: boolean; // 是否包含无首播日期的节目 
  with_origin_country?: string;   // 原产国，如'US'
  with_status?: string;           // 状态，可能值为[0,1,2,3,4,5]
  screened_theatrically?: boolean;// 是否院线放映
  timezone?: string;              // 时区
  watch_region?: string;          // 观看区域
  with_companies?: string;        // 制作公司
  with_watch_providers?: string;  // 观看提供商
  with_watch_monetization_types?: string; // 观看货币化类型
}

/**
 * 将字符串类型数组转换为TMDb API所需的ID数组
 * @param genres 类型名称数组
 * @returns 类型ID数组字符串
 */
async function convertGenresToIds(genres: string[]): Promise<string> {
  if (!genres || !genres.length) return '';
  
  const genreIds = genres.map(genre => mapGenreToId(genre)).filter(id => id !== null);
  
  if (genreIds.length === 0) {
    throw new ApiError(`无法识别提供的类型: ${genres.join(', ')}`, 400);
  }
  
  return genreIds.join(',');
}

/**
 * 查找人物ID
 * @param personName 人物名称
 * @returns 人物ID
 */
export async function findPersonId(personName: string): Promise<number | null> {
  try {
    const response = await tmdbClient.searchPerson(personName);
    if (response.results && response.results.length > 0) {
      return response.results[0].id;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * 将演员名称数组转换为ID数组
 * @param cast 演员名称数组
 * @returns 演员ID数组字符串
 */
export async function convertCastToIds(cast: string[]): Promise<string> {
  if (!cast || !cast.length) return '';
  
  const castPromises = cast.map(name => findPersonId(name));
  const castIds = await Promise.all(castPromises);
  const validIds = castIds.filter(id => id !== null) as number[];
  
  if (validIds.length === 0) {
    throw new ApiError(`无法找到演员: ${cast.join(', ')}`, 400);
  }
  
  return validIds.join(',');
}

/**
 * 查找关键词ID
 * @param keyword 关键词
 * @returns 关键词ID
 */
export async function findKeywordId(keyword: string): Promise<number | null> {
  try {
    const response = await tmdbClient.searchKeyword(keyword);
    if (response.results && response.results.length > 0) {
      return response.results[0].id;
    }
    return null;
  } catch (error) {
    // console.error(`查找关键词"${keyword}"失败:`, error);
    return null;
  }
}

/**
 * 将关键词数组转换为ID数组
 * @param keywords 关键词数组
 * @returns 关键词ID数组字符串
 */
async function convertKeywordsToIds(keywords: string[]): Promise<string> {
  if (!keywords || !keywords.length) return '';
  
  const keywordPromises = keywords.map(keyword => findKeywordId(keyword));
  const keywordIds = await Promise.all(keywordPromises);
  const validIds = keywordIds.filter(id => id !== null) as number[];
  
  if (validIds.length === 0) {
    throw new ApiError(`无法找到关键词: ${keywords.join(', ')}`, 400);
  }
  
  return validIds.join(',');
}

/**
 * 格式化发现剧集结果
 * @param results TMDb API返回的结果
 * @returns 格式化后的结果
 */
function formatDiscoverResults(results: Array<{
  id: number;
  name: string;
  overview?: string;
  poster_path?: string;
  vote_average?: number;
  first_air_date?: string;
}>): DiscoverShowsResult[] {
  return results.map(show => ({
    id: show.id,
    name: show.name,
    overview: show.overview || '暂无简介',
    poster_path: show.poster_path || null,
    vote_average: show.vote_average || 0,
    first_air_date: show.first_air_date
  }));
}

/**
 * 高级剧集发现工具实现
 * @param params 多个可选筛选条件
 * @returns 发现结果
 */
export async function discoverShows(params: DiscoverShowsParams): Promise<DiscoverShowsResponse> {
  try {
    // 构建API请求参数
    const apiParams: Record<string, string | number | boolean> = {};
    
    // 处理类型参数
    if (params.with_genres?.length) {
      apiParams.with_genres = await convertGenresToIds(params.with_genres);
    }
    
    // 注释: TMDB API的discover/tv不支持按演员或人物筛选
    // 相关代码已移除
    
    // 存储请求的年份以便后续过滤
    const requestedYear = params.first_air_date_year;
    
    // 处理年份参数 - 修正参数名称为带点号格式
    if (requestedYear) {
      apiParams['first_air_date.gte'] = `${requestedYear}-01-01`;
      apiParams['first_air_date.lte'] = `${requestedYear}-12-31`;
    }
    
    // 处理评分参数 - 修正参数名称为带点号格式
    if (params.vote_average_gte) {
      apiParams['vote_average.gte'] = params.vote_average_gte;
    }
    
    // 处理网络参数
    if (params.with_networks?.length) {
      apiParams.with_networks = params.with_networks.join(',');
    }
    
    // 处理关键词参数
    if (params.with_keywords?.length) {
      apiParams.with_keywords = await convertKeywordsToIds(params.with_keywords);
    }
    
    // 处理排序参数
    if (params.sort_by) {
      apiParams.sort_by = params.sort_by;
    } else {
      apiParams.sort_by = 'popularity.desc';
    }
    
    // 处理分页参数
    apiParams.page = params.page || 1;
    
    // 处理语言参数
    if (params.with_original_language) {
      apiParams.with_original_language = params.with_original_language;
    }
    
    // 处理成人内容参数
    if (params.include_adult !== undefined) {
      apiParams.include_adult = params.include_adult;
    }
    
    // 处理无首播日期内容参数
    if (params.include_null_first_air_dates !== undefined) {
      apiParams.include_null_first_air_dates = params.include_null_first_air_dates;
    }
    
    // 处理原产国参数
    if (params.with_origin_country) {
      apiParams.with_origin_country = params.with_origin_country;
    }
    
    // 处理状态参数
    if (params.with_status) {
      apiParams.with_status = params.with_status;
    }
    
    // 处理院线放映参数
    if (params.screened_theatrically !== undefined) {
      apiParams.screened_theatrically = params.screened_theatrically;
    }
    
    // 处理时区参数
    if (params.timezone) {
      apiParams.timezone = params.timezone;
    }
    
    // 处理观看区域参数
    if (params.watch_region) {
      apiParams.watch_region = params.watch_region;
    }
    
    // 处理制作公司参数
    if (params.with_companies) {
      apiParams.with_companies = params.with_companies;
    }
    
    // 处理观看提供商参数
    if (params.with_watch_providers) {
      apiParams.with_watch_providers = params.with_watch_providers;
    }
    
    // 处理观看货币化类型参数
    if (params.with_watch_monetization_types) {
      apiParams.with_watch_monetization_types = params.with_watch_monetization_types;
    }
    
    // 调用TMDb API
    const response = await tmdbClient.discoverTvShows(apiParams);
    
    // 如果有指定年份，进行额外的过滤确保日期准确性
    let filteredResults = response.results || [];
    if (requestedYear) {
      console.log(`过滤前剧集数量: ${filteredResults.length}`);
      
      filteredResults = filteredResults.filter((show: {
        id: number;
        name: string;
        overview?: string;
        poster_path?: string;
        vote_average?: number;
        first_air_date?: string;
      }) => {
        // 确保有首播日期
        if (!show.first_air_date) {
          console.log(`剧集 "${show.name}" (ID: ${show.id}) 缺少首播日期，已过滤`);
          return false;
        }
        
        // 解析首播年份并与请求的年份比较
        const airDateYear = new Date(show.first_air_date).getFullYear();
        const matches = airDateYear === requestedYear;
        
        if (!matches) {
          console.log(`剧集 "${show.name}" (ID: ${show.id}) 首播日期 ${show.first_air_date} (${airDateYear}年) 与请求年份 ${requestedYear} 不匹配，已过滤`);
        }
        
        return matches;
      });
      
      console.log(`过滤后剧集数量: ${filteredResults.length}`);
    }
    
    // 格式化结果
    const results = formatDiscoverResults(filteredResults);
    
    // 构建响应
    return {
      page: response.page,
      results,
      total_pages: response.total_pages,
      total_results: filteredResults.length // 更新为过滤后的总数
    };
    
  } catch (error) {
    // console.error('高级剧集发现失败:', error);
    throw new ApiError(`高级剧集发现失败: ${formatErrorMessage(error)}`, 500);
  }
}

/**
 * 获取人物的电视作品
 * 这是一个替代方案，用于在discover/tv不支持按演员筛选的情况下使用
 * @param personId 人物ID
 * @returns 该人物参与的电视剧列表
 */
export async function getPersonTvCredits(personId: number): Promise<DiscoverShowsResponse> {
  try {
    // 调用person/{person_id}/tv_credits API获取此人参与的所有电视剧
    const response = await tmdbClient.getPersonTvCredits(personId);
    
    // 格式化结果以匹配DiscoverShowsResponse格式
    const results = response.cast || [];
    const formattedResults = formatDiscoverResults(results);
    
    return {
      page: 1,
      results: formattedResults,
      total_pages: 1,
      total_results: formattedResults.length
    };
  } catch (error) {
    throw new ApiError(`获取人物电视作品失败: ${formatErrorMessage(error)}`, 500);
  }
}

/**
 * 通过人物名称查找其参与的电视剧
 * @param personName 人物名称
 * @returns 该人物参与的电视剧列表
 */
export async function findShowsByPersonName(personName: string): Promise<DiscoverShowsResponse> {
  try {
    // 先查找人物ID
    const personId = await findPersonId(personName);
    if (!personId) {
      throw new ApiError(`未找到人物: ${personName}`, 404);
    }
    
    // 然后获取其电视作品
    return getPersonTvCredits(personId);
  } catch (error) {
    throw new ApiError(`查找人物电视作品失败: ${formatErrorMessage(error)}`, 500);
  }
}

/**
 * 根据演员名称查找推荐电视剧
 * 此函数提供了一种替代方法来弥补discover/tv接口不支持按演员筛选的限制
 * @param actorName 演员名称
 * @param limit 返回结果数量限制
 * @returns 包含该演员的电视剧列表
 */
export async function getRecommendationsByActor(actorName: string, limit = 10): Promise<DiscoverShowsResponse> {
  try {
    // 获取演员ID
    const actorId = await findPersonId(actorName);
    if (!actorId) {
      throw new ApiError(`未找到演员: ${actorName}`, 404);
    }
    
    // 获取演员的电视剧作品
    const response = await getPersonTvCredits(actorId);
    
    // 按流行度排序并限制结果数量
    let sortedResults = [...response.results];
    sortedResults.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    sortedResults = sortedResults.slice(0, limit);
    
    return {
      page: 1,
      results: sortedResults,
      total_pages: 1,
      total_results: sortedResults.length
    };
  } catch (error) {
    throw new ApiError(`获取演员推荐电视剧失败: ${formatErrorMessage(error)}`, 500);
  }
} 
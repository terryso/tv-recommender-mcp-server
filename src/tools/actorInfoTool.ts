import { tmdbClient } from '../services/tmdbClient';
import { ApiError, formatErrorMessage } from '../utils/errorHandler';

/**
 * 获取演员信息与作品参数接口
 */
export interface GetActorInfoParams {
  /** 演员姓名 */
  actor_name: string;
}

/**
 * 演员基本信息接口
 */
export interface ActorInfo {
  /** 演员ID */
  id: number;
  /** 演员姓名 */
  name: string;
  /** 演员简介 */
  biography: string;
  /** 演员照片路径 */
  profile_path: string | null;
  /** 演员人气 */
  popularity: number;
  /** 生日 */
  birthday?: string;
  /** 出生地 */
  place_of_birth?: string;
  /** 官方主页 */
  homepage?: string | null;
  /** 也被称为 */
  also_known_as?: string[];
}

/**
 * 演员参演作品接口
 */
export interface CreditInfo {
  /** 剧集ID */
  show_id: number;
  /** 剧集标题 */
  show_title: string;
  /** 角色名称 */
  character: string;
  /** 剧集海报路径 */
  poster_path: string | null;
  /** 剧集评分 */
  vote_average: number;
  /** 首播日期 */
  first_air_date?: string;
}

/**
 * 演员信息与作品响应接口
 */
export interface ActorInfoResponse {
  /** 演员基本信息 */
  actor: ActorInfo;
  /** 演员参演作品列表 */
  credits: CreditInfo[];
}

/**
 * 获取演员信息与参演作品
 * @param params 包含演员姓名的参数对象
 * @returns 演员信息与参演作品列表
 */
export async function getActorDetailsAndCredits(params: GetActorInfoParams): Promise<ActorInfoResponse> {
  const { actor_name } = params;

  try {
    // 通过演员姓名查找演员ID
    const searchResults = await tmdbClient.searchPerson(actor_name);
    
    // 如果没有找到任何结果，抛出错误
    if (!searchResults.results || searchResults.results.length === 0) {
      throw new ApiError(`未找到名为"${actor_name}"的演员`, 404);
    }
    
    // 使用第一个搜索结果
    const personId = searchResults.results[0].id;
    
    // 并行获取演员详情和参演作品列表
    const [personDetails, personCredits] = await Promise.all([
      tmdbClient.getPersonDetails(personId),
      tmdbClient.getPersonTvCredits(personId)
    ]);
    
    // 格式化演员信息
    const actorInfo: ActorInfo = {
      id: personDetails.id,
      name: personDetails.name,
      biography: personDetails.biography || '暂无简介',
      profile_path: personDetails.profile_path,
      popularity: personDetails.popularity || 0,
      birthday: personDetails.birthday,
      place_of_birth: personDetails.place_of_birth,
      homepage: personDetails.homepage,
      also_known_as: personDetails.also_known_as
    };
    
    // 格式化参演作品列表
    // 优先展示主演角色（cast）而非幕后角色（crew）
    const credits: CreditInfo[] = (personCredits.cast || []).map((credit: any) => ({
      show_id: credit.id,
      show_title: credit.name || credit.original_name,
      character: credit.character || '未知角色',
      poster_path: credit.poster_path,
      vote_average: credit.vote_average || 0,
      first_air_date: credit.first_air_date
    }));
    
    // 按评分降序排序
    credits.sort((a, b) => b.vote_average - a.vote_average);
    
    return {
      actor: actorInfo,
      credits
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`获取演员"${actor_name}"的信息失败: ${error instanceof Error ? error.message : String(error)}`);
  }
} 
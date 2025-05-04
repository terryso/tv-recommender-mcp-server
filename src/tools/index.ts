/**
 * MCP 工具导出文件
 * 集中导出所有MCP工具函数
 */

// 导出推荐相关工具
export { 
  getRecommendationsByGenre, 
  type GetRecommendationsByGenreParams,
  getSimilarShows,
  type GetSimilarShowsParams
} from './recommendations'; 

// 导出剧集详情工具
export {
  getShowDetails,
  type GetShowDetailsParams,
  type ShowDetails
} from './details'; 

// 导出观看渠道查询工具
export {
  getWatchProviders,
  type GetWatchProvidersParams,
  type WatchProvidersResponse
} from './watchProviders'; 

// 导出高级发现工具
export {
  discoverShows,
  type DiscoverShowsParams,
  type DiscoverShowsResponse,
  type DiscoverShowsResult,
  findShowsByPersonName,
  getRecommendationsByActor,
  findPersonId
} from './discoverShowsTool'; 

// 导出演员信息工具
export {
  getActorDetailsAndCredits,
  type GetActorInfoParams,
  type ActorInfoResponse,
  type ActorInfo,
  type CreditInfo
} from './actorInfoTool';

// 导出评论工具
export {
  getShowReviews,
  type GetShowReviewsParams,
  type ShowReviewsResponse,
  type ReviewItem,
  type AuthorDetails
} from './reviewsTool';

// 导出热门与趋势剧集工具
export {
  getPopularShows,
  getTrendingShows,
  type GetPopularShowsParams,
  type GetTrendingShowsParams,
  type ShowsListResponse,
  type ShowInfo
} from './popularTrendingTool';

// 导出视频工具
export {
  getShowVideos,
  type GetShowVideosParams,
  type ShowVideosResponse,
  type VideoInfo
} from './videosTool';
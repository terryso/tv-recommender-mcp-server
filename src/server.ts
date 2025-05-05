import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from 'dotenv';
import { registerGlobalErrorHandlers } from './utils/errorHandler';
import config from './utils/config';
import { 
  getRecommendationsByGenre, 
  type GetRecommendationsByGenreParams,
  getSimilarShows,
  type GetSimilarShowsParams,
  getShowDetails,
  type GetShowDetailsParams,
  getWatchProviders,
  type GetWatchProvidersParams,
  discoverShows,
  type DiscoverShowsParams,
  getActorDetailsAndCredits,
  getShowReviews,
  getPopularShows,
  getTrendingShows,
  getShowVideos
} from './tools';

// 加载环境变量
dotenv.config();

// 移除API密钥检查 - 实现懒加载策略
// API密钥将在实际调用工具时验证，允许在没有API密钥的情况下列出工具

// 初始化MCP服务器
const server = new McpServer({
  name: "tv-recommender-mcp-server",
  version: "1.0.0",
  description: "美剧推荐服务，基于TMDb API提供剧集推荐和详细信息"
});

// 注册get_recommendations_by_genre工具
server.tool("get_recommendations_by_genre",
  { genre: z.string().describe('电视剧类型，如"喜剧"、"科幻"、"悬疑"等，支持中英文') },
  async (params) => {
    console.log(`收到按类型获取推荐请求，类型: ${params.genre}`);
    const results = await getRecommendationsByGenre(params);
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

// 注册get_similar_shows工具
server.tool("get_similar_shows",
  { show_title: z.string().describe('剧集名称，如"怪奇物语"、"绝命毒师"等') },
  async (params) => {
    console.log(`收到获取相似剧集请求，剧集名称: ${params.show_title}`);
    const results = await getSimilarShows(params);
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

// 注册get_show_details工具
server.tool("get_show_details",
  { show_title: z.string().describe('剧集名称，用于获取详细信息') },
  async (params) => {
    console.log(`收到获取剧集详情请求，剧集名称: ${params.show_title}`);
    const results = await getShowDetails(params);
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

// 注册get_watch_providers工具
server.tool("get_watch_providers",
  { 
    show_title: z.string().describe('剧集名称，如"怪奇物语"、"绝命毒师"等'),
    country_code: z.string().optional().describe('可选的国家/地区代码，如"US"、"CN"等，默认为"US"')
  },
  async (params) => {
    console.log(`收到获取观看渠道请求，剧集名称: ${params.show_title}，国家/地区: ${params.country_code || 'US'}`);
    const results = await getWatchProviders(params);
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

// 注册discover_shows工具
server.tool("discover_shows",
  {
    with_genres: z.array(z.string()).optional().describe('类型数组，如["喜剧", "科幻"]'),
    first_air_date_year: z.number().optional().describe('首播年份，如2022'),
    vote_average_gte: z.number().optional().describe('最低评分，如8.0'),
    with_networks: z.array(z.number()).optional().describe('电视网络ID数组，如[213]表示Netflix'),
    with_keywords: z.array(z.string()).optional().describe('关键词数组，如["机器人", "太空"]'),
    sort_by: z.string().optional().describe('排序方式，如"popularity.desc"'),
    page: z.number().optional().describe('页码，默认为1'),
    with_original_language: z.string().optional().describe('原始语言，如"en"表示英语')
  },
  async (params) => {
    console.log('收到高级剧集发现请求，参数:', params);
    const results = await discoverShows(params);
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

// 注册获取演员作品的工具
server.tool("find_shows_by_actor",
  { 
    actor_name: z.string().describe('演员名称，如"布莱恩·科兰斯顿"、"安东尼·斯塔尔"等')
  },
  async (params) => {
    console.log(`收到获取演员作品请求，演员名称: ${params.actor_name}`);
    const { findShowsByPersonName } = require('./tools/discoverShowsTool');
    const results = await findShowsByPersonName(params.actor_name);
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

// 注册演员推荐工具
server.tool("get_recommendations_by_actor",
  { 
    actor_name: z.string().describe('演员名称，如"布莱恩·科兰斯顿"、"安东尼·斯塔尔"等'),
    limit: z.number().optional().default(10).describe('返回结果数量限制，默认为10')
  },
  async (params) => {
    console.log(`收到获取演员推荐请求，演员名称: ${params.actor_name}，限制: ${params.limit || 10}`);
    const { getRecommendationsByActor } = require('./tools/discoverShowsTool');
    const results = await getRecommendationsByActor(params.actor_name, params.limit);
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

// 注册获取演员信息和作品的工具
server.tool("get_actor_details_and_credits",
  { 
    actor_name: z.string().describe('演员名称，如"布莱恩·科兰斯顿"、"安东尼·斯塔尔"等')
  },
  async (params) => {
    console.log(`收到获取演员信息和作品请求，演员名称: ${params.actor_name}`);
    const results = await getActorDetailsAndCredits(params);
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

// 注册评论查询工具
server.tool("get_show_reviews",
  { 
    show_title: z.string().describe('剧集名称，用于获取评论'),
    page: z.number().optional().default(1).describe('页码，默认为1')
  },
  async (params) => {
    console.log(`收到获取剧集评论请求，剧集名称: ${params.show_title}，页码: ${params.page || 1}`);
    const results = await getShowReviews({
      show_title: params.show_title,
      page: params.page
    });
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

// 注册热门与趋势剧集查询工具
server.tool("get_popular_shows",
  { 
    page: z.number().optional().default(1).describe('页码，默认为1')
  },
  async (params) => {
    console.log(`收到获取热门剧集请求，页码: ${params.page || 1}`);
    const results = await getPopularShows(params);
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

server.tool("get_trending_shows",
  { 
    time_window: z.enum(['day', 'week']).default('week').describe('时间窗口，day表示日趋势，week表示周趋势，默认为week'),
    page: z.number().optional().default(1).describe('页码，默认为1')
  },
  async (params) => {
    console.log(`收到获取${params.time_window === 'day' ? '日' : '周'}趋势剧集请求，页码: ${params.page || 1}`);
    const results = await getTrendingShows(params);
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

// 注册视频查询工具
server.tool("get_show_videos",
  { 
    show_title: z.string().describe('剧集名称，用于获取预告片和视频')
  },
  async (params) => {
    console.log(`收到获取剧集视频请求，剧集名称: ${params.show_title}`);
    const results = await getShowVideos(params);
    return {
      content: [{ type: "text", text: JSON.stringify(results) }]
    };
  }
);

// 启动服务器
async function startServer() {
  try {
    // 创建标准输入/输出传输
    const transport = new StdioServerTransport();
    
    console.log('MCP服务器初始化中...');
    
    // 连接到传输
    await server.connect(transport);
    
    console.log('TV推荐MCP服务器启动成功，正在监听stdin/stdout...');
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();

// 注册全局错误处理器
registerGlobalErrorHandlers(); 
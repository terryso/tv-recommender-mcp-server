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
  type GetSimilarShowsParams
} from './tools';

// 加载环境变量
dotenv.config();

// 检查必要的环境变量
if (!config.tmdbApiKey) {
  console.error('错误: 缺少TMDB_API_KEY环境变量。请在.env文件中设置。');
  process.exit(1);
}

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
# TV推荐MCP服务器

基于TMDb API的美剧推荐MCP服务器，提供按类型推荐、相似剧集推荐和剧集详情功能。

## 项目描述

本项目是一个基于MCP(Model Context Protocol)的服务器，专门用于提供美剧推荐服务。服务器通过标准输入/输出(stdio)与支持MCP的客户端通信，并通过调用TMDb(The Movie Database) API获取数据。

## 功能特点

- 通过MCP协议与客户端通信
- 提供按类型推荐剧集功能
- 提供相似剧集推荐功能
- 提供剧集详情查询功能
- 使用TMDb API获取最新、最全面的剧集数据

## 技术栈

- **语言:** TypeScript
- **运行时环境:** Node.js
- **MCP SDK:** @modelcontextprotocol/sdk
- **类型验证:** zod
- **HTTP客户端:** axios
- **外部API:** TMDb (The Movie Database)
- **环境变量管理:** dotenv

## 安装步骤

1. 克隆仓库
   ```bash
   git clone <仓库地址>
   cd tv-recommender-mcp-server
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 配置环境变量
   - 复制`.env-example`为`.env`
   - 在[TMDb](https://www.themoviedb.org/)申请API密钥
   - 将API密钥填入`.env`文件的`TMDB_API_KEY`字段

4. 构建项目
   ```bash
   npm run build
   ```

## 运行服务器

```bash
npm start
```

## 开发模式

```bash
npm run dev
```

## 在Cursor中配置MCP服务器

要在Cursor中使用此MCP服务器，请按照以下步骤操作：

1. 在项目根目录创建（或编辑）`.cursor/mcp.json`文件

2. 在文件中配置服务器信息，格式如下：
   ```json
   {
     "mcpServers": {
       "TVRecommender": {
         "command": "node",
         "args": [
           "dist/server.js"
         ]
       }
     }
   }
   ```

3. 也可以使用环境变量传递配置（如API密钥）：
   ```json
   {
     "mcpServers": {
       "TVRecommender": {
         "command": "env",
         "args": [
           "TMDB_API_KEY=your_api_key_here",
           "node",
           "dist/server.js"
         ]
       }
     }
   }
   ```

4. 保存文件后，Cursor会自动检测并加载此MCP服务器

5. 现在，您可以在Cursor中通过以下方式使用此工具：
   - 在对话中输入 `/` 并选择 `TVRecommender` 工具
   - 输入相关查询，如 "推荐科幻类电视剧" 或 "查找与《权力的游戏》相似的剧集"

6. 如需调试或查看日志：
   - 在Cursor的开发者工具中（按 `Cmd+Option+I` 打开）查看控制台输出
   - 通过环境变量启用调试模式：`"DEBUG=mcp:*,node dist/server.js"`

## 工具说明

本MCP服务器提供以下工具(将在后续实现):

1. **get_recommendations_by_genre** - 按类型获取剧集推荐
2. **get_similar_shows** - 获取与指定剧集相似的推荐
3. **get_show_details** - 获取指定剧集的详细信息

## 贡献指南

欢迎提交Issue和Pull Request来帮助改进这个项目。

## 许可证

[ISC](LICENSE) 
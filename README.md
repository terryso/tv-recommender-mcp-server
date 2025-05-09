[English Version](README.en.md)

# TV推荐MCP服务器 🚀

[![codecov](https://codecov.io/github/terryso/tv-recommender-mcp-server/graph/badge.svg?token=ZMF2J8D636)](https://codecov.io/github/terryso/tv-recommender-mcp-server)
[![npm version](https://badge.fury.io/js/tv-recommender-mcp-server.svg)](https://badge.fury.io/js/tv-recommender-mcp-server)
![NPM Downloads](https://img.shields.io/npm/dw/tv-recommender-mcp-server)
[![Node.js Version](https://img.shields.io/node/v/tv-recommender-mcp-server)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/terryso/tv-recommender-mcp-server/pulls)
[![smithery badge](https://smithery.ai/badge/@terryso/tv-recommender-mcp-server)](https://smithery.ai/server/@terryso/tv-recommender-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![DeepWiki](https://img.shields.io/badge/DeepWiki-项目文档-blue)](https://deepwiki.com/terryso/tv-recommender-mcp-server)

> 基于TMDb API的美剧推荐MCP服务器，提供按类型推荐、相似剧集推荐和剧集详情功能。

## 项目描述

本项目是一个基于MCP(Model Context Protocol)的服务器，专门用于提供全面的美剧推荐和信息查询服务。服务器通过标准输入/输出(stdio)与支持MCP的客户端通信，并通过调用TMDb(The Movie Database) API获取数据。服务覆盖从剧集发现、详情查询到观看渠道、演员信息、用户评论等多方面功能，为用户提供一站式剧集探索体验。

### 项目背景与愿景

大型语言模型（LLM）在理解和生成文本方面表现出色，但在提供实时、个性化的美剧推荐方面存在局限性（如知识截止、缺乏用户偏好理解）。用户期望通过自然语言交互获得更精准、更及时的推荐，而现有LLM难以完全满足此需求。本项目旨在通过Model Context Protocol (MCP) Server扩展LLM的能力，解决这一痛点，抓住提供更智能影视发现体验的机会。

**愿景：** 让用户能够通过与LLM的自然对话，无缝地发现、了解并获取个性化、实时、可解释的美剧推荐，将LLM变为强大的个人娱乐顾问。

### 目标用户

主要目标用户是熟悉并使用支持MCP的LLM客户端（如Claude Desktop）的个人用户。他们是美剧爱好者，对通过AI获取信息持开放态度，并希望以更自然、交互的方式发现符合口味的新剧集。

## 系统架构

此MCP服务器采用模块化设计，具有明确的关注点分离。服务器初始化MCP框架，注册各种推荐工具，并使用TMDb客户端与TMDb API交互。配置设置（特别是TMDb API密钥）通过环境变量管理。

### 高级架构图

```mermaid
flowchart TD
    A["MCP客户端<br>(LLM工具)"] -- "MCP请求<br>(stdio)" --> B
    
    subgraph "服务器架构"
    B["MCP核心<br>(stdio)"] --> C["工具路由器"]
    C --> D["工具实现层"]
    D --> E["TMDb服务客户端"]
    D --> F["工具辅助功能<br>(如类型映射)"]
    E -- "HTTP请求" --> G["TMDb API"]
    D --> H["日志系统"]
    E --> H
    end
    
    G -- "HTTP响应" --> E
    B -- "发送响应" --> A
```

### 核心组件

- **MCP服务器实现**：服务器基于Model Context Protocol SDK for TypeScript构建，提供工具注册和客户端通信的基础。
- **TMDb客户端**：负责与TMDb API的所有交互，处理认证、构建API请求并处理响应。
- **推荐工具**：服务器公开各种工具，提供与电视节目发现和信息检索相关的特定功能。

## 功能与路线图 (Features & Roadmap)

以下是本项目的完整功能列表及开发状态 (基于 `.ai` 目录下的用户故事):

**Epic 1: 核心推荐工具 MVP (Core Recommendation Tools MVP)**
- [x] **MCP 服务器基础设置与 API 集成 (MCP Server Setup & API Integration)** (`story-1-1-setup-integration.md`)
- [x] **按类型推荐剧集 (Recommend Shows by Genre)** (`story-1-2-recommend-genre.md`) - 工具: `get_recommendations_by_genre`
- [x] **查找相似剧集 (Find Similar Shows)** (`story-1-3-recommend-similar.md`) - 工具: `get_similar_shows`
- [x] **获取剧集详情 (Get Show Details)** (`story-1-4-show-details.md`) - 工具: `get_show_details`

**Epic 2: 增强与扩展 (Enhancements & Expansion)**
- [ ] **基于关键词/主题发现 (Keyword/Theme Based Discovery)** (`story-2-1-keyword-discovery.md`)
- [ ] **发现演员早期作品 (Early Actor Works Discovery)** (`story-2-2-early-works.md`)
- [ ] **详细的单集信息与互动 (Detailed Episode Information & Interaction)** (`story-2-3-episode-details.md`)
- [ ] **内容聚合(按平台/网络/公司) (Provider/Network/Company Content Aggregation)** (`story-2-4-provider-aggregation.md`)
- [x] **查询演员信息及其作品 (Query Actor Information and Credits)** (`story-2-5-actor-info.md`) - 工具: `get_actor_details_and_credits`, `find_shows_by_actor`, `get_recommendations_by_actor`
- [x] **高级剧集发现 (Advanced Show Discovery)** (`story-2-6-advanced-discovery.md`) - 工具: `discover_shows`
- [x] **查询热门与趋势剧集 (Query Popular & Trending Shows)** (`story-2-7-popular-trending.md`) - 工具: `get_popular_shows`, `get_trending_shows`
- [x] **查询剧集用户评论 (Query Show User Reviews)** (`story-2-8-reviews-ratings.md`) - 工具: `get_show_reviews`
- [x] **查询剧集预告片与视频 (Query Show Trailers & Videos)** (`story-2-9-trailers.md`) - 工具: `get_show_videos`
- [x] **查询剧集观看渠道 (Query Show Watch Providers)** (`story-2-10-watch-providers.md`) - 工具: `get_watch_providers`

**Epic 3: 个性化与集成 (Personalization & Integration)**
- [ ] **智能追剧进度管理 (Smart Watch Progress Management)** (`story-3-1-watch-progress.md`)

**Epic 4: 可视化与探索 (Visualization & Exploration)**
- [ ] **可视化系列/宇宙探索 (Visual Franchise/Universe Exploration)** (`story-4-1-franchise-visualization.md`)

## 技术栈

- **语言:** TypeScript
- **运行时环境:** Node.js
- **MCP SDK:** @modelcontextprotocol/sdk
- **类型验证:** zod
- **HTTP客户端:** axios
- **外部API:** TMDb (The Movie Database)
- **环境变量管理:** dotenv

## 快速开始

使用npx可以快速运行服务器，无需安装：

```bash
# 设置TMDb API密钥（必须）
export TMDB_API_KEY=your_api_key_here

# 运行服务器
npx tv-recommender-mcp-server
```

## 安装步骤

1. 从NPM安装
   ```bash
   npm install -g tv-recommender-mcp-server
   ```

2. 配置环境变量
   ```bash
   export TMDB_API_KEY=your_api_key_here
   ```

3. 运行服务器
   ```bash
   tv-recommender-mcp-server
   ```

或者，您可以克隆仓库：

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

4. 构建并运行项目
   ```bash
   npm run build
   npm start
   ```

## 在Smithery平台中使用

要在Smithery平台中使用此MCP服务器，请按照以下步骤操作：

1. 访问 [Smithery平台](https://smithery.ai) 并登录您的账户
2. 搜索"@terryso/tv-recommender-mcp-server"或直接访问 [tv-recommender-mcp-server](https://smithery.ai/server/@terryso/tv-recommender-mcp-server)
3. 点击"Install"按钮安装此服务
4. **重要**: 在配置过程中，您需要提供一个TMDb API密钥
   - 您可以在 [TMDb](https://www.themoviedb.org/) 网站注册并申请免费API密钥
   - 在输入框中填入您的API密钥
5. 完成安装后，您可以在任何支持Smithery工具的AI聊天中使用此服务

## 在Cursor中配置MCP服务器

要在Cursor中使用此MCP服务器，请按照以下步骤操作：

1. 在项目根目录创建（或编辑）`.cursor/mcp.json`文件

2. 在文件中配置服务器信息，格式如下（使用npx方式）：
   ```json
   {
     "mcpServers": {
       "TVRecommender": {
         "command": "npx",
         "args": [
           "tv-recommender-mcp-server"
         ]
       }
     }
   }
   ```

3. 使用环境变量传递TMDb API密钥：
   ```json
   {
     "mcpServers": {
       "TVRecommender": {
         "command": "env",
         "args": [
           "TMDB_API_KEY=your_api_key_here",
           "npx",
           "tv-recommender-mcp-server"
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
   - 通过环境变量启用调试模式：`"DEBUG=mcp:*,npx tv-recommender-mcp-server"`

## 使用场景示例

以下是几个实际使用场景示例，展示如何结合多个工具获得更好的体验：

1. **发现新剧集**：
   - 使用 `get_popular_shows` 或 `get_trending_shows` 获取当前热门剧集
   - 找到感兴趣的剧集后，用 `get_show_details` 查看详情
   - 通过 `get_show_videos` 观看预告片
   - 使用 `get_watch_providers` 查找哪里可以观看

2. **基于喜爱的演员探索**：
   - 通过 `get_actor_details_and_credits` 查看喜欢的演员的所有作品
   - 使用 `get_recommendations_by_actor` 获取与该演员相关的推荐
   - 对感兴趣的剧集，用 `get_show_reviews` 查看其他观众的评价

3. **精确筛选剧集**：
   - 使用 `discover_shows` 结合多种条件（类型、年代、评分、关键词等）精确查找符合个人口味的剧集
   - 例如：查找2020年后的高分科幻剧集，或者查找特定电视网络（如HBO、Netflix）的原创剧集

4. **相似内容探索**：
   - 看完一部喜欢的剧集后，使用 `get_similar_shows` 寻找风格相似的其他剧集
   - 结合 `get_recommendations_by_genre` 探索更多同类型优质内容

以上功能可以在AI聊天中自然地组合使用，例如可以对AI说"推荐一些类似《怪奇物语》的科幻剧，并告诉我在哪里可以观看"，MCP工具会自动配合AI提供所需信息。

## 工具说明

本MCP服务器提供以下工具:

1. **get_recommendations_by_genre** - 按类型获取剧集推荐
2. **get_similar_shows** - 获取与指定剧集相似的推荐
3. **get_show_details** - 获取指定剧集的详细信息
4. **get_watch_providers** - 查询特定剧集在指定国家/地区的观看渠道（流媒体、租赁、购买）
5. **discover_shows** - 高级剧集发现，支持多种条件组合（如类型、评分、年份、关键词、播放平台等）
6. **find_shows_by_actor** - 查找演员参演的剧集
7. **get_recommendations_by_actor** - 获取演员推荐的剧集
8. **get_actor_details_and_credits** - 获取演员详细信息（如简介、照片）及其参演的剧集列表
9. **get_popular_shows** - 获取当前最热门的剧集
10. **get_trending_shows** - 获取近期趋势剧集（支持日趋势和周趋势）
11. **get_show_videos** - 获取指定剧集的预告片和相关视频
12. **get_show_reviews** - 查看其他用户对特定剧集的评论

### 工具详细文档

更多关于工具使用和系统架构的详细文档，请访问我们的[DeepWiki文档](https://deepwiki.com/terryso/tv-recommender-mcp-server)，其中包含：
- 工具实现架构
- 请求流程图
- 部署和配置指南
- 各工具的详细参数说明
- 开发和测试指南
- 项目路线图等

## 功能示例

以下是各工具的使用示例:

### 获取观看渠道
```
/TVRecommender get_watch_providers --show_title="怪奇物语" --country_code="US"
```

### 高级剧集发现
```
/TVRecommender discover_shows --with_genres=["科幻", "惊悚"] --vote_average_gte=8.0 --first_air_date_year=2022
```

### 查询演员信息及作品
```
/TVRecommender get_actor_details_and_credits --actor_name="布莱恩·科兰斯顿"
```

### 获取热门与趋势剧集
```
/TVRecommender get_popular_shows
/TVRecommender get_trending_shows --time_window="day"
```

### 获取剧集预告片与视频
```
/TVRecommender get_show_videos --show_title="权力的游戏"
```

### 查询剧集用户评论
```
/TVRecommender get_show_reviews --show_title="绝命毒师" --page=1
```

## 安全考量

- **API Key管理**：TMDb API密钥是敏感的，不应硬编码在源代码中或提交到版本控制系统。它将仅通过环境变量使用dotenv包加载。.env文件必须包含在.gitignore中。
- **输入验证**：尽管MCP通信通常在客户端/服务器之间受信任，但建议在工具实现中进行基本的输入参数验证。
- **速率限制**：请注意TMDb API的速率限制。如有必要，请在未来的迭代中实现基本的重试逻辑或缓存。
- **依赖项**：保持依赖项更新，以修补已知的漏洞。

## 开发模式

如果您希望参与开发，可以使用以下命令启动开发模式：

```bash
npm run dev
```

## 发布到NPM

本项目配置了GitHub Actions工作流，可以自动发布到NPM：

1. 确保更新了`package.json`中的版本号
2. 在GitHub仓库设置中添加以下密钥：
   - `NPM_TOKEN`: 您的NPM访问令牌
3. 在GitHub上创建一个新的Release或推送标签（v*格式）
4. GitHub Actions会自动构建并发布到NPM

您也可以手动触发工作流进行发布。

## 贡献指南

欢迎提交Issue和Pull Request来帮助改进这个项目。

## 许可证

[MIT](LICENSE) © 2023-present 
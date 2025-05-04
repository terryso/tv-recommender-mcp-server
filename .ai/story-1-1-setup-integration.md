# Epic-1 - Story-1.1

MCP Server 基础设置与 API 集成

**As a** 开发者 (Developer)
**I want** 建立一个基础的 TypeScript MCP 服务器项目并集成 TMDb API 客户端 (establish a basic TypeScript MCP server project and integrate the TMDb API client)
**so that** 为后续的推荐工具功能奠定基础 (I can lay the foundation for subsequent recommendation tool features)

## Status

完成 (Completed)

## Context

*   **Background:** 本项目旨在创建一个 MCP 服务器用于美剧推荐，解决 LLM 在此领域的局限性。
*   **Current state:** PRD (v0.2) 已定稿，明确了 MVP 范围和技术选型 (TypeScript, Node.js, TMDb, 本地部署)。
*   **Story justification:** 这是实现 MVP 功能的第一步，用于搭建项目骨架、配置核心依赖和外部 API 连接。
*   **Technical context:** 需要使用 `mcp-server` SDK，通过 stdio 与客户端通信，并使用 HTTP 客户端调用 TMDb API。
*   **Business drivers:** 尽快搭建可用框架，以便快速迭代核心推荐功能。
*   **Relevant history:** PRD 确认了使用 TypeScript 和 TMDb API。

## Estimation

Story Points: 1 (初步估计，搭建基础框架)

## Tasks

1.  - [x] **项目初始化与依赖**
    1.  - [x] 使用 `npm` 初始化 Node.js 项目 (`package.json`)。
    2.  - [x] 配置 TypeScript (`tsconfig.json`)。
    3.  - [x] 创建基本的项目目录结构 (`src`, `services`, `utils` 等)。
    4.  - [x] 添加核心依赖: `typescript`, `@types/node`, `mcp-server`, `axios`, `dotenv`。
    5.  - [x] 添加开发依赖: `ts-node`, `ts-node-dev`, `nodemon`。
    6.  - [x] 确保 `npm install` 成功。
    7.  - [x] 确保 `npm run build` 成功。
2.  - [x] **基础 MCP 服务器实现**
    1.  - [x] 创建 `src/server.ts`。
    2.  - [x] 实现 MCP 服务器启动逻辑，监听 `stdio`。
    3.  - [x] 实现对 `initialize` 请求的基本响应处理。
    4.  - [x] 确保 `npm start` 能启动服务器并响应 `initialize`。
3.  - [x] **TMDb API 集成与配置**
    1.  - [x] 创建 `src/services/tmdbClient.ts`。
    2.  - [x] 实现使用 `axios` 调用 TMDb API 的基础函数。
    3.  - [x] 创建 `.env-example` 文件，包含 `TMDB_API_KEY`。
    4.  - [x] 实现通过 `dotenv` 从 `.env` 文件或环境变量加载 `TMDB_API_KEY` 的逻辑。
    5.  - [x] 编写一个简单的测试函数或脚本验证 API Key 是否有效（例如，获取配置信息）。
    6.  - [x] 确保未设置 API Key 时有明确错误提示。
4.  - [x] **日志与错误处理**
    1.  - [x] 实现基础的日志记录 (使用 `console.log`)，记录服务器启动、请求接收、关键错误。
    2.  - [x] 实现基础的全局错误处理 (通过 `utils/errorHandler.ts` 中的 `registerGlobalErrorHandlers()` 函数)，防止服务器崩溃并记录错误。

## Constraints

*   开发语言必须是 TypeScript。
*   运行时环境为 Node.js。
*   外部 API 必须使用 TMDb。
*   MVP 阶段部署目标为本地运行。
*   API Key 必须通过环境变量管理，不能硬编码。

## Data Models / Schema

*   **Environment Variables:**
    ```
    TMDB_API_KEY=your_tmdb_api_key_here
    ```
*   **MCP `initialize` Request/Response (Conceptual):** (参考 MCP 规范)

## Structure

*   **实际项目结构:**
    ```text
    tv-recommender-mcp-server/
    ├── src/
    │   ├── server.ts       # MCP服务器初始化
    │   ├── tools/          # MCP工具实现目录(未来故事)
    │   ├── services/       # 外部API交互逻辑
    │   │   └── tmdbClient.ts # TMDb API客户端封装
    │   ├── types/          # 共享TypeScript类型/接口
    │   │   └── mcp-server.d.ts # MCP服务器类型定义
    │   └── utils/          # 辅助函数
    │       ├── config.ts     # 配置加载
    │       ├── errorHandler.ts # 错误处理工具
    │       └── testTMDbConnection.ts # TMDb连接测试工具
    ├── .env-example        # 环境变量示例
    ├── package.json
    ├── tsconfig.json
    └── README.md
    ```

## Diagrams

*   (暂无)

## Dev Notes

*   已经实现了使用TMDb API的基础功能，可以成功连接并获取数据。
*   通过`npm run test-api`命令验证API连接成功。
*   已经实现了基础的日志记录和错误处理。
*   MCP服务器已实现并可以正常启动，为后续的工具实现做好了准备。

## Chat Command Log

*   (用户请求创建 Story 1.1)
*   (AI 创建初始版本 Story 1.1)
*   (用户指出未遵循模板 @template-story.md)
*   (用户请求重写 Story 1.1 以符合模板)
*   (AI 创建 Story 1.1 的实现)
*   (用户确认 API 测试成功运行)
*   (AI 更新 Story 1.1 状态为已完成)

## Examples

*   **MCP服务器初始化代码:**
    ```typescript
    // 注册服务器初始化处理
    server.onInitialize(async () => {
      console.log('MCP服务器初始化中...');
      
      // 返回服务器的描述和可用工具
      return {
        name: 'tv-recommender-mcp-server',
        description: '美剧推荐服务，基于TMDb API提供剧集推荐和详细信息',
        tools: [] // 暂时为空，后续故事中会添加具体工具
      };
    });
    ```
*   **TMDb API客户端示例:**
    ```typescript
    // 测试API连接是否正常
    async testConnection(): Promise<boolean> {
      try {
        const response = await this.client.get('/configuration');
        return response.status === 200;
      } catch (error) {
        console.error('TMDb API连接测试失败:', error);
        return false;
      }
    }
    ```

--- 
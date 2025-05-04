# 1. Title: PRD for 美剧推荐 MCP 服务器

<version>0.2</version>

## Status: 定稿 (v0.2)

## Intro

本项目旨在开发一个 Model Context Protocol (MCP) 服务器，用于提供美剧推荐服务。该服务器将集成到支持 MCP 的大型语言模型 (LLM) 客户端（如 Claude Desktop）中，通过调用外部影视数据库 API（如 TMDb 或 TVmaze）来扩展 LLM 的能力，使用户能够通过自然语言交互获取实时、个性化和可解释的美剧推荐。

## Goals

- **业务目标:** 解决 LLM 在美剧推荐方面的局限性，提升用户通过 LLM 发现影视内容的体验，增加用户与 LLM 交互的价值。
- **产品目标 (MVP):**
    - 成功部署一个可通过 MCP 客户端调用的 TypeScript MCP 服务器。
    - 提供三个核心推荐工具：按类型推荐、查找相似剧集、获取剧集详情。
    - 确保与外部 API 的稳定集成和数据获取。
- **成功标准/KPIs:**
    - 实现高服务可用性（工具调用成功率 > 95%）。
    - 实现可接受的响应时间（P95 < 2 秒）。
    - （未来）用户反馈评分或推荐采纳率。

## Features and Requirements

- **功能性需求:**
    - 实现 MCP Server 基础框架 (TypeScript)。
    - 实现与外部影视 API (TMDb 或 TVmaze) 的集成。
    - 实现三个核心推荐工具的 MCP 接口。
    - 实现工具内部调用 API、处理数据和格式化响应的逻辑。
    - 实现基本的错误处理和日志记录。
- **非功能性需求:**
    - **性能:** API 调用及处理的 P95 响应时间 < 2 秒。
    - **可靠性:** 工具调用成功率 > 95%。
    - **安全性:** API Key 安全存储和使用。
    - **可维护性:** 代码结构清晰，遵循 TypeScript 最佳实践。
- **用户体验需求:**
    - 工具返回的推荐结果应清晰、相关且易于 LLM 理解和呈现。
    - 错误信息应转化为用户友好的提示 (❓Q6.2)。
- **集成需求:**
    - 服务器需能被标准 MCP 客户端发现和调用。
- **合规需求:**
    - 遵守所选外部 API 的服务条款和使用限制。

## Epic List

### Epic-1: 核心推荐工具 MVP
(包含 MVP 范围内的所有核心功能和故事)

### Epic-2: 增强与扩展 (Future Enhancement)
(包含获取热门剧集、查询观看平台、支持电影等)

### Epic-3: 个性化与集成 (Future Enhancement)
(包含连接 Trakt.tv 等用户个性化功能)

## Epic 1: Story List (核心推荐工具 MVP)

- **Story 1.1: MCP Server 基础设置与 API 集成**
  Status: ''
  Requirements:
    - 初始化 TypeScript 项目 (使用 Node.js)。
    - 添加 MCP TypeScript SDK 依赖。
    - 实现基础的 MCP Server 启动逻辑 (stdio transport)。
    - **决定并集成外部 API 客户端 (TMDb)。**
    - 实现 API Key 的安全配置方式 (e.g., 环境变量)。
    - 建立基础的错误处理和日志框架。
    - **处理剧集查找结果 (如果重名则默认选择第一个结果；如果找不到则返回明确的错误文本)。**

- **Story 1.2: 实现 `get_recommendations_by_genre` 工具**
  Status: ''
  Requirements:
    - 在 MCP Server 中定义 `get_recommendations_by_genre` 工具接口。
    - 工具接受 `genre` (string) 参数。 **(支持中文和英文类型名，需要内部映射)**
    - 实现调用外部 API 按类型查询剧集的逻辑。
    - **定义推荐标准 (按评分) 和数量 (默认 10 部)。**
    - 处理 API 结果，筛选并格式化推荐列表。**(返回格式应包含：年份、评分、简介)**
    - **实现无法识别类型或无结果时的响应逻辑 (返回明确的错误文本)。**

- **Story 1.3: 实现 `get_similar_shows` 工具**
  Status: ''
  Requirements:
    - 在 MCP Server 中定义 `get_similar_shows` 工具接口。
    - 工具接受 `show_title` (string) 参数。
    - 实现调用外部 API 通过标题查找剧集 ID 的逻辑。
    - **处理剧集查找结果 (如果重名则默认选择第一个结果；如果找不到则返回明确的错误文本)。**
    - 实现调用外部 API 通过 ID 查找相似剧集的逻辑 (基于 TMDb 的相似性标准)。
    - **定义推荐数量 (默认 10 部)。**
    - 处理并格式化相似剧集列表。**(返回格式应包含：年份、评分、简介)**

- **Story 1.4: 实现 `get_show_details` 工具**
  Status: ''
  Requirements:
    - 在 MCP Server 中定义 `get_show_details` 工具接口。
    - 工具接受 `show_title` (string) 参数。
    - 实现调用外部 API 通过标题查找剧集详情的逻辑。
    - **处理剧集查找结果 (如果重名则进行去重处理；如果找不到则返回明确的错误文本)。**
    - **定义返回的详细信息字段 (剧名、年份、评分、类型、简介、演员、季数、状态)。**
    - **格式化并返回结构化的剧集详情。**

## Technology Stack

| Technology          | Description                                         | Notes/Decision                                     |
| ------------------- | --------------------------------------------------- | -------------------------------------------------- |
| Language            | TypeScript                                          | User Preference                                    |
| Runtime             | Node.js                                             | Required for TypeScript execution                  |
| MCP SDK             | MCP TypeScript SDK                                  | Core dependency for MCP Server implementation    |
| HTTP Client         | `axios` or `node-fetch`                             | For making requests to external APIs               |
| External API        | **TMDb**                                            | User Decision                                      |
| Package Manager     | npm or yarn                                         | Standard for Node.js/TypeScript projects         |
| Deployment          | **Local**                                           | User Decision (MVP Stage)                          |
| API Key Management  | Environment Variables or Secrets Manager            | For securely storing API keys                    |

## Reference

{ Mermaid Diagrams, visual aids, citations, external URLs - Placeholder }

## Data Models, API Specs, Schemas, etc...

{ Key data structures returned by tools or used internally - Placeholder }

<example>
### Potential Tool Response Structure (Conceptual)

```typescript
// For get_recommendations_by_genre / get_similar_shows
interface ShowRecommendation {
  title: string;
  year?: number;
  rating?: number; // Or string representation
  summary?: string;
}

// For get_show_details
interface ShowDetails {
  title: string;
  year?: number;
  rating?: number; // Or string representation
  genres?: string[];
  overview: string;
  cast?: string[]; // Top N actors
  totalSeasons?: number;
  status?: 'Returning Series' | 'Ended' | 'Canceled' | 'In Production';
  // ... other fields decided in Q2.3.3
}

// Generic Tool Response
type ToolResult = string | ShowRecommendation[] | ShowDetails;
```

</example>

## Project Structure

{ Diagram the folder and file organization structure - Placeholder }

<example>

```text
tv-recommender-mcp-server/
├── src/
│   ├── server.ts       # Main MCP server initialization
│   ├── tools/          # Directory for MCP tool implementations
│   │   ├── recommendations.ts  # Genre/Similar recommendations logic
│   │   └── details.ts        # Show details logic
│   ├── services/       # External API interaction logic
│   │   └── tmdbClient.ts # (or tvmazeClient.ts) API client wrapper
│   ├── types/          # Shared TypeScript types/interfaces
│   └── utils/          # Helper functions (e.g., formatting)
├── tests/              # Unit/Integration tests
├── .env.example        # Example environment variables
├── package.json
├── tsconfig.json
└── README.md
```
</example>

## Change Log

| Change               | Story ID | Description                 |
| -------------------- | -------- | --------------------------- |
| Initial draft PRD    | N/A      | Created initial PRD draft   |
| Refactor to Template | N/A      | Restructured PRD per template |
| Finalize MVP Req.    | N/A      | Incorporated user decisions | 

---

请您再次审阅这份重构后的 PRD。它现在更符合模板的结构，包含了 Epics 和 Stories，并将之前的待澄清问题 `❓` 关联到了具体的 Story Requirements 或表格中。

接下来，我们应该聚焦于解决这些待澄清的问题，以完成这份 PRD。

## 1. Introduction

### 1.1. Overview
本项目旨在开发一个 Model Context Protocol (MCP) 服务器，用于提供美剧推荐服务。该服务器将集成到支持 MCP 的大型语言模型 (LLM) 客户端（如 Claude Desktop）中，通过调用外部影视数据库 API（如 TMDb 或 TVmaze）来扩展 LLM 的能力，使用户能够通过自然语言交互获取实时、个性化和可解释的美剧推荐。

### 1.2. Goals
*   **业务目标:** 解决 LLM 在美剧推荐方面的局限性，提升用户通过 LLM 发现影视内容的体验，增加用户与 LLM 交互的价值。
*   **产品目标 (MVP):**
    *   成功部署一个可通过 MCP 客户端调用的 TypeScript MCP 服务器。
    *   提供三个核心推荐工具：按类型推荐、查找相似剧集、获取剧集详情。
    *   确保与外部 API 的稳定集成和数据获取。
    *   实现高服务可用性（工具调用成功率 > 95%）和可接受的响应时间（P95 < 2 秒）。

### 1.3. Target Audience
熟悉并使用支持 MCP 的 LLM 客户端的个人用户，他们是美剧爱好者，寻求更自然、交互式的剧集发现方式。

## 2. MVP Features & User Stories

以下是 MVP 版本计划实现的核心功能和对应的初步用户故事。我们需要对这些故事进行细化。

### 2.1. 按类型推荐 (`get_recommendations_by_genre`)
*   **用户故事:** 作为一个想看特定类型美剧的用户，我希望可以告诉 LLM 我想看的类型（例如"喜剧"或"科幻"），以便它能给我推荐几部该类型下的高分剧集，并附带简短介绍。
*   **功能需求:**
    *   MCP Server 需暴露一个名为 `get_recommendations_by_genre` 的工具。
    *   工具接受一个参数：`genre` (类型名称，字符串)。**决策：需要同时支持中文和英文类型名，并进行内部映射。**
    *   服务器根据 `genre` 调用 TMDb API 查询剧集。
    *   服务器处理 API 返回结果，筛选出 **默认 10 部** 剧集，并 **按评分排序**。
    *   服务器将结果格式化为文本返回给 LLM。**决策：返回格式需包含剧名、年份、评分和简介。** 示例如下：
        ```
        根据您选择的[类型]，为您推荐以下剧集：
        1. [剧名1] ([年份]): [评分] - [简介]
        2. [剧名2] ([年份]): [评分] - [简介]
        ... (共10部)
        ```
    *   **决策：如果用户提供的类型无法识别或该类型下没有剧集，返回明确的错误文本给 LLM。**

### 2.2. 查找相似剧集 (`get_similar_shows`)
*   **用户故事:** 作为一个刚看完一部很喜欢的美剧的用户，我希望可以告诉 LLM 这部剧的名字，以便它能给我推荐几部风格或主题相似的其他剧集。
*   **功能需求:**
    *   MCP Server 需暴露一个名为 `get_similar_shows` 的工具。
    *   工具接受一个参数：`show_title` (剧集名称，字符串)。
    *   服务器首先需要通过 `show_title` 调用 TMDb API 找到对应的剧集 ID。**决策：如果找到多个同名剧集，默认选择第一个结果。如果找不到，返回明确的错误文本。**
    *   服务器使用剧集 ID 调用 TMDb API 的"查找相似"功能。
    *   服务器处理并格式化返回的相似剧集列表，**默认返回 10 部**。**决策：返回格式需包含剧名、年份、评分和简介。**

### 2.3. 获取剧集详情 (`get_show_details`)
*   **用户故事:** 作为一个对某部美剧感兴趣的用户，我希望可以告诉 LLM 这部剧的名字，以便它能告诉我关于这部剧的详细信息，如剧情简介、主要演员、评分、播出年份和季数等。
*   **功能需求:**
    *   MCP Server 需暴露一个名为 `get_show_details` 的工具。
    *   工具接受一个参数：`show_title` (剧集名称，字符串)。
    *   服务器通过 `show_title` 调用 TMDb API 查询剧集详情。**决策：如果找到多个同名剧集，进行去重处理。如果找不到，返回明确的错误文本。**
    *   服务器处理并格式化返回的剧集信息。**决策：返回的详细信息包含：剧名、年份、评分、类型、简介、演员、季数、状态。**
    *   **决策：返回格式应为结构化的数据（例如 JSON 对象），方便 LLM 解析和呈现。**
    *   增加对电影推荐的支持。

## 3. 技术需求与约束

*   **开发语言:** TypeScript
*   **核心依赖:** MCP TypeScript SDK, `axios` 或 `node-fetch` (用于 API 调用)
*   **外部依赖:**
    *   **影视数据库 API:** **TMDb** (The Movie Database)。
    *   需要申请并安全管理 TMDb API 的 Key。
*   **部署:** **本地运行** (MVP 阶段)。
*   **错误处理:** 需要为 API 调用失败、数据解析错误、速率限制等情况设计健壮的错误处理机制。

## 4. 非功能性需求

*   **性能:** API 调用及处理的 P95 响应时间应低于 2 秒。
*   **可靠性:** 工具调用成功率应高于 95%。需要监控 API 的可用性。
*   **安全性:** API Key 必须通过环境变量等方式安全存储和使用，不能硬编码。
*   **可维护性:** 代码结构清晰，遵循 TypeScript 最佳实践，易于扩展和维护。

## 5. 未来考虑 (Post-MVP)

*   实现 `get_trending_shows` 工具。
*   实现 `find_streaming_platform` 工具 (可能需要额外的数据源)。
*   支持更复杂的查询，例如结合类型和年份进行推荐。
*   考虑用户个性化，例如允许用户连接 Trakt.tv 账户。
*   增加对电影推荐的支持。

## 6. 开放问题与讨论点

*   **Q6.2:** 错误信息应该如何呈现给最终用户（通过 LLM）？ -> **决策: 转化为用户友好的提示文本。**

--- 
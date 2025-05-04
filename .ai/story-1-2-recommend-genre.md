# Epic-1 - Story-1.2

实现 `get_recommendations_by_genre` 工具

**As a** 美剧爱好者用户 (TV Show Enthusiast User)
**I want** 通过告诉 LLM 我想看的类型（如"喜剧"或 "Comedy"）来获取该类型下的美剧推荐 (request TV show recommendations by providing a genre like "喜剧" or "Comedy" to the LLM)
**so that** 我可以发现该类型下评分较高的剧集，并了解它们的年份、评分和简介 (I can discover highly-rated shows within that genre, along with their year, rating, and summary)

## Status

完成 (Completed)

## Context

*   **Background:** 此功能是 MVP 的核心推荐工具之一，旨在利用外部 API 扩展 LLM 的影视推荐能力。
*   **Current state:** Story 1.1 已完成基础 MCP 服务器设置和 TMDb 客户端集成。
*   **Story justification:** 实现第一个具体的推荐功能，验证 MCP 工具定义、API 调用和结果格式化的流程。
*   **Dependencies:** 依赖于 Story 1.1 中创建的 TMDb API 客户端 (`src/services/tmdbClient.ts`) 和基础服务器框架。

## Estimation

Story Points: 2 (初步估计，涉及 MCP 工具定义、API 调用、数据处理和映射)

## Tasks

1.  - [x] **MCP 工具定义**
    1.  - [x] 在 `src/server.ts` 中定义 `get_recommendations_by_genre` 工具。
    2.  - [x] 定义工具的输入参数: `genre` (类型: `string`)。
    3.  - [x] 定义工具的描述信息，以便 LLM 理解其功能。
2.  - [x] **类型映射**
    1.  - [x] 研究 TMDb API 的类型 ID 列表 (genres)。
    2.  - [x] 创建映射机制 (`src/utils/genreMap.ts`)，将用户可能输入的中文或英文类型名映射到对应的 TMDb 类型 ID。
    3.  - [x] 处理无法映射的类型名称（返回友好提示信息）。
3.  - [x] **TMDb API 调用**
    1.  - [x] 在 `src/services/tmdbClient.ts` 中添加 `getRecommendationsByGenre` 函数，用于根据类型 ID 调用 TMDb 的 `/discover/tv` 接口。
    2.  - [x] 配置 API 调用参数，确保按评分 (`sort_by=vote_average.desc`) 排序，并设置最低评分数阈值。
    3.  - [x] 处理 API 调用可能发生的错误（网络错误、API 限制、无效 ID 等）。
4.  - [x] **结果处理与格式化**
    1.  - [x] 在 `src/tools/recommendations.ts` 中调用 TMDb 客户端函数获取推荐结果。
    2.  - [x] 从 API 响应中提取所需字段：剧名 (`name`), 首播年份 (`first_air_date` -> year), 评分 (`vote_average`), 简介 (`overview`)。
    3.  - [x] 限制结果数量为 10 部。
    4.  - [x] 将结果格式化为 PRD 中定义的文本格式。
    5.  - [x] 处理没有找到推荐剧集的情况（返回特定提示）。
5.  - [x] **集成与测试**
    1.  - [x] 将类型映射、API 调用和结果处理逻辑集成到 `get_recommendations_by_genre` 工具的实现中 (`src/tools/recommendations.ts`)。
    2.  - [x] 添加测试脚本 (`src/utils/testRecommendationsTool.ts`)，覆盖不同类型输入、成功响应和错误处理场景。

## Constraints

*   必须支持中文和英文类型输入，并映射到 TMDb 类型 ID。
*   推荐结果必须按评分降序排列。
*   最多返回 10 部推荐剧集。
*   返回的每部剧集信息必须包含：剧名、年份、评分、简介。
*   如果类型无法识别或没有结果，必须返回明确的用户友好错误文本。
*   工具返回给 LLM 的最终结果应该是格式化的字符串。

## Data Models / Schema

*   **Tool Input Parameter:**
    ```typescript
    interface GetRecommendationsByGenreParams {
      genre: string; // e.g., "喜剧", "Comedy", "科幻", "Sci-Fi"
    }
    ```
*   **TMDb API Response Snippet (Conceptual - /discover/tv):**
    ```json
    {
      "page": 1,
      "results": [
        {
          "name": "Show Title",
          "overview": "Show overview...",
          "vote_average": 8.5,
          "first_air_date": "2023-01-15",
          // ... other fields
        }
        // ... more results
      ],
      "total_pages": N,
      "total_results": M
    }
    ```
*   **Final Tool Output (Formatted String):**
    ```
    根据您选择的[类型]，为您推荐以下剧集：
    1. [剧名1] ([年份]): [评分] - [简介]
    2. [剧名2] ([年份]): [评分] - [简介]
    ... (共10部)
    ```
    或错误提示文本：
    ```
    抱歉，无法识别您提供的类型"[用户输入类型]"或该类型下没有找到推荐剧集。
    ```

## Structure

*   Tool Definition: `src/server.ts`
*   Tool Implementation Logic: `src/tools/recommendations.ts`
*   Genre Mapping: `src/utils/genreMap.ts`
*   TMDb Client Function: `src/services/tmdbClient.ts` (添加 `getRecommendationsByGenre` 函数)
*   测试脚本: `src/utils/testRecommendationsTool.ts`

## Diagrams

*   (暂无)

## Dev Notes

*   已经实现了完整的类型映射系统，支持多种中英文输入和别名。
*   添加了模糊匹配功能，提高类型识别的灵活性。
*   TMDb API 调用添加了'vote_count.gte': 100参数，确保推荐的剧集有足够的评分数，避免低质量内容。
*   错误处理完善，对于无法识别的类型和空参数都提供了友好的错误提示。
*   测试脚本验证了所有主要功能和边缘情况，包括有效类型、别名、无效类型和空参数。

## Chat Command Log

*   (用户请求继续创建 Story 1.2)
*   (AI 实现 Story 1.2 的功能)
*   (用户运行测试，确认功能正常)
*   (AI 更新 Story 1.2 状态为已完成)

## Examples

*   **Input:** ` MCP Request: { tool_name: 'get_recommendations_by_genre', params: { genre: '喜剧' } } `
*   **Output (Success):** ` MCP Response: { tool_result: '根据您选择的喜剧，为您推荐以下剧集：\n1. 坏妈妈 (2023): 8.9 - 因为一起惨烈的事故，这名雄心勃勃的检察官心智变成了孩童，于是他和母亲被迫踏上了一场疗愈母子关系的旅程。\n2. 探险活宝：菲奥娜与蛋糕 (2023): 8.8 - 宝妹和皮姊在前冰霸王赛门帕特里克夫的帮助下穿梭多重宇宙进行冒险与自我探索之旅。\n...' } `
*   **Input:** ` MCP Request: { tool_name: 'get_recommendations_by_genre', params: { genre: '不存在的类型' } } `
*   **Output (Error):** ` MCP Response: { tool_result: '抱歉，无法识别您提供的类型"不存在的类型"，请尝试其他类型如"喜剧"、"科幻"等。' } `

--- 
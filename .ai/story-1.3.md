# Epic-1 - Story-1.3

实现 `get_similar_shows` 工具

**As a** 美剧爱好者用户 (TV Show Enthusiast User)
**I want** 告诉 LLM 我刚看完的一部剧的名称 (provide the title of a show I just watched and enjoyed to the LLM)
**so that** 我可以获取与该剧风格或主题相似的其他剧集推荐，包含年份、评分和简介 (I can get recommendations for other shows similar in style or theme, including their year, rating, and summary)

## Status

完成 (Completed)

## Context

*   **Background:** 这是 MVP 的核心推荐工具之一，用于提供基于用户已知剧集的发现体验。
*   **Current state:** Story 1.1 (基础设置) 和 Story 1.2 (按类型推荐) 已经完成。
*   **Story justification:** 实现第二个推荐功能，涉及更复杂的流程：先搜索剧集 ID，再根据 ID 查找相似剧集。
*   **Dependencies:** 依赖于 Story 1.1 中创建的 TMDb API 客户端 (`src/services/tmdbClient.ts`) 和基础服务器框架。

## Estimation

Story Points: 2 (初步估计，涉及搜索、ID 处理、相似推荐 API 调用、数据处理)

## Tasks

1.  - [x] **MCP 工具定义**
    1.  - [x] 在 `src/server.ts` 中定义 `get_similar_shows` 工具。
    2.  - [x] 定义工具的输入参数: `show_title` (类型: `string`)。
    3.  - [x] 定义工具的描述信息。
2.  - [x] **剧集搜索与 ID 获取**
    1.  - [x] 在 `src/services/tmdbClient.ts` 中添加 `searchTvShowByTitle` 函数，用于根据 `show_title` 调用 TMDb 的 `/search/tv` 接口。
    2.  - [x] 实现处理搜索结果的逻辑：
        *   如果找不到匹配的剧集，准备返回错误。
        *   如果找到多个匹配剧集，**默认选择第一个结果** 获取其 ID。
    3.  - [x] 处理 API 调用错误。
3.  - [x] **查找相似剧集**
    1.  - [x] 在 `src/services/tmdbClient.ts` 中添加 `getSimilarTvShows` 函数，用于根据剧集 ID 调用 TMDb 的 `/tv/{tv_id}/similar` 接口。
    2.  - [x] 处理此 API 调用可能发生的错误。
4.  - [x] **结果处理与格式化**
    1.  - [x] 调用 TMDb 客户端函数获取相似剧集列表。
    2.  - [x] 从 API 响应中提取所需字段：剧名 (`name`), 首播年份 (`first_air_date` -> year), 评分 (`vote_average`), 简介 (`overview`)。
    3.  - [x] 限制结果数量为 10 部。
    4.  - [x] 将结果格式化为与 Story 1.2 类似的文本格式。
    5.  - [x] 处理未能找到原始剧集或未能找到相似剧集的情况（返回特定提示）。
5.  - [x] **集成与测试**
    1.  - [x] 将搜索、ID 获取、相似查找和结果处理逻辑集成到 `get_similar_shows` 工具的实现中 (`src/tools/recommendations.ts`)。
    2.  - [x] 添加测试脚本 (`src/utils/testSimilarShowsTool.ts`)，覆盖剧集找到/找不到、有/无相似结果等场景。

## Constraints

*   工具接受 `show_title` 字符串作为输入。
*   如果搜索返回多个剧集，必须默认选择第一个结果。
*   如果搜索不到剧集，必须返回明确的用户友好错误文本。
*   最多返回 10 部相似剧集推荐。
*   返回的每部剧集信息必须包含：剧名、年份、评分、简介。
*   工具返回给 LLM 的最终结果应该是格式化的字符串。

## Data Models / Schema

*   **Tool Input Parameter:**
    ```typescript
    interface GetSimilarShowsParams {
      show_title: string; // e.g., "怪奇物语", "Stranger Things"
    }
    ```
*   **TMDb API Response Snippet (Conceptual - /search/tv):**
    ```json
    {
      "page": 1,
      "results": [
        {
          "id": 66732,
          "name": "Stranger Things",
          // ... other fields
        },
        // ... potentially more results
      ]
    }
    ```
*   **TMDb API Response Snippet (Conceptual - /tv/{tv_id}/similar):**
    ```json
    {
      "page": 1,
      "results": [
        {
          "name": "Similar Show Title",
          "overview": "Similar show overview...",
          "vote_average": 8.2,
          "first_air_date": "2022-05-20",
          // ... other fields
        }
        // ... more results
      ]
    }
    ```
*   **Final Tool Output (Formatted String):**
    ```
    与 [原始剧名] 相似的剧集推荐：
    1. [剧名1] ([年份]): [评分] - [简介]
    2. [剧名2] ([年份]): [评分] - [简介]
    ... (共10部)
    ```
    或错误提示文本：
    ```
    抱歉，未能找到您提供的剧集"[用户输入剧名]"。
    ```
    或
    ```
    抱歉，未能找到与"[原始剧名]"相似的剧集。
    ```

## Structure

*   Tool Definition: `src/server.ts`
*   Tool Implementation Logic: `src/tools/recommendations.ts`
*   TMDb Client Functions: `src/services/tmdbClient.ts` (`searchTvShowByTitle` 和 `getSimilarTvShows` 函数)
*   测试脚本: `src/utils/testSimilarShowsTool.ts`

## Diagrams

*   (暂无)

## Dev Notes

*   实现了完整的相似剧集推荐功能，包括剧集搜索和相似剧集查找
*   使用TMDb的 `/search/tv` 端点进行剧集搜索，并自动选择最匹配的结果
*   使用TMDb的 `/tv/{tv_id}/similar` 端点获取相似剧集
*   添加了完善的错误处理，区分"找不到原始剧集"和"找不到相似剧集"两种情况
*   格式化输出保持与按类型推荐相同的风格，便于用户阅读
*   测试脚本验证了功能在不同情况下的表现，包括有效剧名、无效剧名和空输入

## Chat Command Log

*   (用户请求继续创建 Story 1.3)
*   (AI 实现 Story 1.3 的功能)
*   (用户测试功能运行正常)
*   (AI 更新 Story 1.3 状态为已完成)

## Examples

*   **Input:** ` MCP Request: { tool_name: 'get_similar_shows', params: { show_title: '怪奇物语' } } `
*   **Output (Success):** ` MCP Response: { tool_result: '与 怪奇物语 相似的剧集推荐：\n1. 暗黑 (2017): 8.8 - 一个德国小镇四个家庭的秘密。\n2. 万物既奇迹 (2016): 8.6 - 一个关于信念和宇宙的故事。\n...' } `
*   **Input:** ` MCP Request: { tool_name: 'get_similar_shows', params: { show_title: '这部剧不存在' } } `
*   **Output (Error - Not Found):** ` MCP Response: { tool_result: '抱歉，未能找到您提供的剧集"这部剧不存在"。' } `

--- 
# Epic-1 - Story-1.4

实现 `get_show_details` 工具

**As a** 对某部美剧感兴趣的用户 (User interested in a specific TV show)
**I want** 通过告诉 LLM 剧集名称来获取该剧的详细信息 (request detailed information about a show by providing its title to the LLM)
**so that** 我可以获得结构化的数据，包含剧名、年份、评分、类型、简介、主要演员、季数和播出状态 (I can receive structured data including the show's title, year, rating, genres, overview, main cast, number of seasons, and status)

## Status

完成

## Context

*   **Background:** 这是 MVP 的核心工具之一，允许用户深入了解特定剧集。
*   **Current state:** Story 1.1 (基础设置) 已规划。
*   **Story justification:** 提供获取剧集详细信息的能力，补充推荐功能。
*   **Dependencies:** 依赖于 Story 1.1 中创建的 TMDb API 客户端 (`src/services/tmdbClient.ts`) 和基础服务器框架。剧集搜索逻辑可部分复用 Story 1.3。

## Estimation

Story Points: 2 (初步估计，涉及搜索、详情 API 调用、多字段提取、结构化数据格式化)

## Tasks

1.  - [x] **MCP 工具定义**
    1.  - [x] 在 `src/server.ts` 或工具注册文件中定义 `get_show_details` 工具。
    2.  - [x] 定义工具的输入参数: `show_title` (类型: `string`)。
    3.  - [x] 定义工具的描述信息。
2.  - [x] **剧集搜索与 ID 获取**
    1.  - [x] 复用或调整 Story 1.3 中的剧集搜索函数 (`/search/tv`)。
    2.  - [x] 实现处理搜索结果的逻辑：
        *   如果找不到匹配的剧集，准备返回错误。
        *   如果找到多个匹配剧集，**默认选择第一个结果** 获取其 ID。
    3.  - [x] 处理 API 调用错误。
3.  - [x] **获取剧集详情**
    1.  - [x] 在 `src/tools/details.ts` 中添加一个函数，用于根据剧集 ID 调用 TMDb 的 `/tv/{tv_id}` 接口。
    2.  - [x] **考虑使用 `append_to_response=credits` 来同时获取演职员信息**，以减少 API 调用次数。
    3.  - [x] 处理此 API 调用可能发生的错误。
4.  - [x] **结果处理与格式化**
    1.  - [x] 调用 TMDb 客户端函数获取剧集详情。
    2.  - [x] 从 API 响应中提取所需字段：
        *   剧名 (`name`)
        *   年份 (`first_air_date` -> year)
        *   评分 (`vote_average`)
        *   类型 (`genres` -> array of names)
        *   简介 (`overview`)
        *   演员 (`credits.cast` -> array of top N actor names)
        *   季数 (`number_of_seasons`)
        *   状态 (`status` - 可能需要映射为更友好的文本)
    3.  - [x] 将提取的数据构造成一个**结构化的 JSON 对象** (见 Data Models)。
    4.  - [x] 处理未能找到原始剧集的情况（返回特定提示）。
5.  - [x] **集成与测试**
    1.  - [x] 将搜索、ID 获取、详情获取和结果处理逻辑集成到 `get_show_details` 工具的实现中 (可能在 `src/tools/details.ts` 中)。
    2.  - [x] 添加基本的单元测试或集成测试，覆盖剧集找到/找不到、API 成功/失败等场景。

## Constraints

*   工具接受 `show_title` 字符串作为输入。
*   如果搜索返回多个剧集，必须默认选择第一个结果。
*   如果搜索不到剧集，必须返回明确的用户友好错误文本。
*   返回信息必须包含 PRD 定义的字段：剧名、年份、评分、类型、简介、演员、季数、状态。
*   工具返回给 LLM 的最终结果必须是**结构化的数据 (JSON 对象)** 或其字符串表示形式。

## Data Models / Schema

*   **Tool Input Parameter:**
    ```typescript
    interface GetShowDetailsParams {
      show_title: string; // e.g., "西部世界", "Westworld"
    }
    ```
*   **TMDb API Response Snippet (Conceptual - /tv/{tv_id}?append_to_response=credits):**
    ```json
    {
      "id": 123,
      "name": "Show Title",
      "overview": "...",
      "first_air_date": "2016-10-02",
      "genres": [ { "id": 1, "name": "Sci-Fi" }, { "id": 2, "name": "Western" } ],
      "number_of_seasons": 4,
      "status": "Ended", // or "Returning Series", etc.
      "vote_average": 8.5,
      "credits": {
        "cast": [
          { "name": "Actor One", "order": 0 },
          { "name": "Actor Two", "order": 1 },
          // ... more cast
        ],
        "crew": [ ... ]
      }
      // ... other fields
    }
    ```
*   **Final Tool Output (Structured JSON Object):**
    ```typescript
    interface ShowDetails {
      title: string;
      year: number;
      rating: number;
      genres: string[];
      overview: string;
      cast: string[]; // Top N actors
      numberOfSeasons: number;
      status: string; // e.g., "已完结", "连载中"
    }
    // Tool result will be an instance of ShowDetails or a stringified version.
    ```
    或错误提示文本：
    ```
    抱歉，未能找到您提供的剧集"[用户输入剧名]"。
    ```

## Structure

*   Tool Definition: `src/server.ts` (或 `src/tools/index.ts`)
*   Tool Implementation Logic: `src/tools/details.ts` (new)
*   TMDb Client Function: `src/services/tmdbClient.ts` (add get details function)
*   Shared Types: `src/types/index.ts` (add `ShowDetails` interface)

## Diagrams

*   (暂无)

## Dev Notes

*   需要使用 TMDb 的 `/search/tv` 和 `/tv/{tv_id}` 端点。
*   推荐使用 `append_to_response=credits` 获取演员信息。
*   需要确定提取多少位主要演员（例如，前 5 位）。
*   `status` 字段可能需要从英文映射到中文或其他用户友好的描述。
*   最终返回的是 JSON 对象，而不是格式化字符串。

## Chat Command Log

*   (用户请求继续创建 Story 1.4)
*   用户指出缺少单元测试，根据 workflows/dev.mdc 应该遵循 TDD 规范
*   添加 Jest 测试框架和相关配置
*   创建 `details.test.ts` 单元测试文件，按照 TDD 原则先编写测试
*   实现 `details.ts` 工具文件，满足测试要求
*   更新 tools/index.ts 导出工具
*   更新 server.ts 注册工具
*   创建集成测试脚本 testShowDetailsTool.ts
*   运行单元测试和集成测试，均通过

## Examples

*   **Input:** ` MCP Request: { tool_name: 'get_show_details', params: { show_title: '西部世界' } } `
*   **Output (Success):** ` MCP Response: { tool_result: { "title": "西部世界", "year": 2016, "rating": 8.0, "genres": ["Sci-Fi & Fantasy", "西部"], "overview": "...", "cast": ["埃文·蕾切尔·伍德", "坦迪·牛顿", ...], "numberOfSeasons": 4, "status": "已取消" } } `
*   **Input:** ` MCP Request: { tool_name: 'get_show_details', params: { show_title: '一部不存在的剧' } } `
*   **Output (Error - Not Found):** ` MCP Response: { tool_result: '抱歉，未能找到您提供的剧集"一部不存在的剧"。' } `

--- 
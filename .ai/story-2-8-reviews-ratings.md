# Epic-2 - Story-2.8

查询剧集用户评论 (Query Show User Reviews)

**As a** 用户 (User)
**I want** 查看其他用户对特定剧集的评论 (to see reviews written by other users for a specific TV show)
**so that** 我可以从其他观众的角度了解剧集，辅助我做观看决策 (I can understand the show from other viewers' perspectives to help my viewing decisions)

## Status

已完成 (Completed)

## Context

- 当前应用只显示了剧集的客观信息和平均评分。
- 此功能利用TMDB的 `/tv/{series_id}/reviews` API端点。
- 提供更丰富的用户生成内容，增强社区感和决策辅助。

## Estimation

Story Points: 1

## Tasks

1.  - [x] 定义新的MCP工具 `get_show_reviews`
    1.  - [x] 设计工具输入参数: `{ "show_title": string, "page"?: number }` (剧集名称, 可选页码)
    2.  - [x] 设计工具输出格式: 评论列表（作者, 内容, 创建时间, 评分, URL）、分页信息。
2.  - [x] 实现TMDB API调用逻辑
    1.  - [x] 添加函数：根据剧集名称搜索获取剧集ID (`search/tv`) (可复用已有逻辑)。
    2.  - [x] 添加函数：根据剧集ID获取评论列表 (`/tv/{series_id}/reviews`)。
    3.  - [x] 组合上述函数，处理分页和错误（如未找到剧集、无评论）。
3.  - [x] 编写单元测试
    1.  - [x] 测试剧集ID查找。
    2.  - [x] 测试获取评论列表。
    3.  - [x] 测试分页。
    4.  - [x] 测试错误处理。

## Constraints

- API返回结果是分页的。
- 评论内容可能很长，需要考虑如何在MCP工具的响应中展示。
- 评论内容可能包含用户生成的富文本或Markdown，需要安全处理。

## Data Models / Schema

- **Input:**
  ```json
  {
    "show_title": "string",
    "page": 1 // Optional
  }
  ```
- **Output (Example):**
  ```json
  {
    "show_id": 1399,
    "page": 1,
    "results": [
      {
        "author": "ReviewerName",
        "author_details": {
          "name": "",
          "username": "ReviewerName",
          "avatar_path": "/path/to/avatar.jpg",
          "rating": 9.0
        },
        "content": "这是评论内容...",
        "created_at": "2021-01-01T12:00:00.000Z",
        "id": "review_id_string",
        "updated_at": "2021-01-01T12:00:00.000Z",
        "url": "https://www.themoviedb.org/review/review_id_string"
      }
      // ... more reviews
    ],
    "total_pages": 5,
    "total_results": 100
  }
  ```

## Structure

- 新增工具实现文件: `src/tools/reviewsTool.ts`
- 更新服务层: `src/services/tmdbClient.ts` (添加新的 `getTvShowReviews` 方法)
- 更新服务器入口: `src/server.ts` (注册新工具)

## Diagrams

(暂无)

## Dev Notes

- 考虑限制返回的评论数量或内容长度，避免响应过大。
- 明确评论中 `author_details.rating` 的含义（可能是该用户对剧集的评分）。

## Chat Command Log

- 功能已完成实现，已添加 `getTvShowReviews` 方法到 `tmdbClient.ts`，新增 `reviewsTool.ts` 工具文件，并注册 `get_show_reviews` 工具。
- 实现的功能支持通过剧集名称搜索，获取用户评论列表，支持分页，并提供了完整的错误处理。 
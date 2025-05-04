# Epic-2 - Story-2.7

查询热门与趋势剧集 (Query Popular and Trending Shows)

**As a** 用户 (User)
**I want** 查看当前最热门的剧集以及近期趋势剧集 (to see the currently most popular TV shows and the trending shows for a recent period)
**so that** 我可以了解当下流行的剧集，紧跟潮流 (I can discover what shows are popular right now and keep up with trends)

## Status

已完成 (Completed)

## Context

- 应用目前缺乏发现当下流行内容的功能。
- 此功能利用TMDB的 `/tv/popular` 和 `/trending/tv/{time_window}` API端点。
- 帮助用户发现新剧集，了解社区热点。

## Estimation

Story Points: 1

## Tasks

1.  - [x] 定义新的MCP工具 `get_popular_shows`
    1.  - [x] 设计工具输入参数: (可选) `{ "page": number }`
    2.  - [x] 设计工具输出格式: 剧集列表（ID, 标题, 评分, 简介, 海报路径）、分页信息。
2.  - [x] 定义新的MCP工具 `get_trending_shows`
    1.  - [x] 设计工具输入参数: `{ "time_window": "day" | "week" }`
    2.  - [x] 设计工具输出格式: 剧集列表（ID, 标题, 评分, 简介, 海报路径）。
3.  - [x] 实现TMDB API调用逻辑
    1.  - [x] 添加函数：调用 `/tv/popular` API。
    2.  - [x] 添加函数：调用 `/trending/tv/{time_window}` API。
    3.  - [x] 处理分页和错误。
4.  - [x] 编写单元测试
    1.  - [x] 测试获取热门剧集。
    2.  - [x] 测试获取日/周趋势剧集。
    3.  - [x] 测试错误处理。

## Constraints

- API返回结果是分页的，需要正确处理。
- 海报路径需要结合TMDB配置API构建完整URL。

## Data Models / Schema

- **Input (Popular):** (Optional)
  ```json
  { "page": 1 }
  ```
- **Input (Trending):**
  ```json
  { "time_window": "week" }
  ```
- **Output (Example - 适用于两者):**
  ```json
  {
    "page": 1,
    "results": [
      {
        "id": 85271,
        "name": "WandaVision",
        "overview": "Wanda Maximoff and Vision—two super-powered beings living idealized suburban lives...",
        "poster_path": "/glKDfE6btIRcVB5zrjspRIs4r52.jpg",
        "vote_average": 8.3
      }
      // ... more show summaries
    ],
    "total_pages": 100, // 仅 Popular API 提供
    "total_results": 2000 // 仅 Popular API 提供
  }
  ```

## Structure

- 新增工具实现文件: `src/tools/popularTrendingTool.ts`
- 更新服务层: `src/services/tmdbClient.ts` (添加新的 `getPopularTvShows`, `getTrendingTvShows` 方法)
- 更新服务器入口: `src/server.ts` (注册新工具 `get_popular_shows`, `get_trending_shows`)

## Diagrams

(暂无)

## Dev Notes

- 考虑对热门和趋势结果进行缓存，避免频繁调用。

## Chat Command Log

- 功能已完成实现，已添加 `getPopularTvShows` 和 `getTrendingTvShows` 方法到 `tmdbClient.ts`，新增 `popularTrendingTool.ts` 工具文件，并注册 `get_popular_shows` 和 `get_trending_shows` 工具。
- 热门剧集支持分页查询，趋势剧集支持按日/周趋势查询，两者都提供格式统一的剧集信息列表。 
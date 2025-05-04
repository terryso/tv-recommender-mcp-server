# Epic-2 - Story-2.9

查询剧集预告片与视频 (Query Show Trailers and Videos)

**As a** 用户 (User)
**I want** 获取指定剧集的预告片或其他相关视频链接 (to get trailers or other related video links for a specific TV show)
**so that** 我可以快速预览剧集内容，判断是否感兴趣 (I can quickly preview the show's content and decide if I'm interested)

## Status

已完成 (Completed)

## Context

- 当前应用只提供文本和静态图片信息。
- 此功能利用TMDB的 `/tv/{series_id}/videos` API端点。
- 提供更直观的剧集预览方式。

## Estimation

Story Points: 1

## Tasks

1.  - [x] 定义新的MCP工具 `get_show_videos`
    1.  - [x] 设计工具输入参数: `{ "show_title": string }` (剧集名称)
    2.  - [x] 设计工具输出格式: 包含视频列表（名称, 类型如Trailer/Teaser, 站点如YouTube, 视频key）。
2.  - [x] 实现TMDB API调用逻辑
    1.  - [x] 添加函数：根据剧集名称搜索获取剧集ID (`search/tv`) (可复用已有逻辑)。
    2.  - [x] 添加函数：根据剧集ID获取视频列表 (`/tv/{series_id}/videos`)。
    3.  - [x] 组合上述函数，处理未找到剧集或无视频的情况。
3.  - [x] 编写单元测试
    1.  - [x] 测试剧集ID查找。
    2.  - [x] 测试获取视频列表。
    3.  - [x] 测试错误处理。

## Constraints

- 视频可能托管在外部平台（如YouTube, Vimeo），需要根据站点和key构建完整URL。
- 可能没有所有剧集的视频，或者没有中文视频。

## Data Models / Schema

- **Input:**
  ```json
  {
    "show_title": "string"
  }
  ```
- **Output (Example):**
  ```json
  {
    "show_id": 1399,
    "videos": [
      {
        "name": "Official Trailer",
        "key": "dQw4w9WgXcQ",
        "site": "YouTube",
        "type": "Trailer",
        "official": true,
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" // 构建好的URL
      }
      // ... more videos
    ]
  }
  ```

## Structure

- 新增工具实现文件: `src/tools/videosTool.ts`
- 更新服务层: `src/services/tmdbClient.ts` (添加新的 `getTvShowVideos` 方法)
- 更新服务器入口: `src/server.ts` (注册新工具)

## Diagrams

(暂无)

## Dev Notes

- 需要根据 `site` 字段构建不同平台的视频URL。
- 优先返回 `type` 为 `Trailer` 且 `official` 为 `true` 的视频。

## Chat Command Log

- 功能已完成实现，已添加 `getTvShowVideos` 方法到 `tmdbClient.ts`，新增 `videosTool.ts` 工具文件，并注册 `get_show_videos` 工具。
- 实现的功能支持通过剧集名称获取相关预告片和视频信息，将视频按照官方性质和类型（预告片/预览）排序，并提供了根据不同平台（如YouTube、Vimeo）自动生成的完整视频URL。 
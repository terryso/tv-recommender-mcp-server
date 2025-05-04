# Epic-1 - Story-1

查询剧集观看渠道 (Query Show Watch Providers)

**As a** 用户 (User)
**I want** 查询特定剧集在我的国家/地区有哪些可用的观看渠道（流媒体、租赁、购买） (to query the available watch providers (streaming, rent, buy) for a specific TV show in my country/region)
**so that** 我可以轻松找到在哪里观看我想看的剧集 (I can easily find where to watch the show I'm interested in)

## Status

Draft

## Context

- 当前应用只提供推荐和基本信息，用户需要自行查找观看平台。
- 此功能旨在利用TMDB的 `/tv/{series_id}/watch/providers` API端点解决用户痛点。
- 需要先能通过剧集名称获取到剧集ID。

## Estimation

Story Points: 1

## Tasks

1.  - [ ] 定义新的MCP工具 `get_watch_providers`
    1.  - [ ] 设计工具输入参数: `{ "show_title": string, "country_code"?: string }` (剧集名称，可选的国家/地区代码 - 默认为 'US')
    2.  - [ ] 设计工具输出格式 (包含国家/地区、TMDB链接、以及流媒体/租赁/购买的平台列表)
2.  - [ ] 实现TMDB API调用逻辑
    1.  - [ ] 添加函数：根据剧集名称搜索获取剧集ID (`search/tv`)
    2.  - [ ] 添加函数：调用 `/tv/{series_id}/watch/providers` API
    3.  - [ ] 组合上述函数，处理国家/地区代码和API错误
3.  - [ ] 编写单元测试
    1.  - [ ] 测试剧集ID查找
    2.  - [ ] 测试观看渠道API调用 (不同国家/地区)
    3.  - [ ] 测试错误处理 (剧集未找到、无观看渠道等)

## Constraints

- API可能不包含所有国家/地区的观看渠道数据。
- 需要处理API密钥的认证。
- 默认国家代码设为 'US'，后续可考虑更智能的判断。

## Data Models / Schema

- **Input:**
  ```json
  {
    "show_title": "string",
    "country_code": "string (ISO 3166-1)" // Optional, defaults to 'US'
  }
  ```
- **Output (Example):**
  ```json
  {
    "country": "US",
    "link": "https://www.themoviedb.org/tv/1396/watch?locale=US",
    "streaming": [
      { "provider_name": "Netflix", "logo_path": "/t2yyOv4cCmhXocSciB প্রভুtvYAT.jpg", "provider_id": 8 }
    ],
    "rent": [],
    "buy": [
      { "provider_name": "Apple TV", "logo_path": "/peURlLlr8jggOwK5AJfgL3BWmwl.jpg", "provider_id": 2 },
      { "provider_name": "Amazon Video", "logo_path": "/5NyLm42TmCqCMOZFvH4fcoSNKEW.jpg", "provider_id": 9 }
    ]
  }
  ```
  *注：`logo_path` 需要结合TMDB配置API中的 `images.secure_base_url` 来构建完整URL。*

## Structure

- 新增工具实现文件: `src/tools/watchProvidersTool.ts`
- 可能需要更新服务层: `src/services/tmdbService.ts` (添加新的API调用方法)
- 更新服务器入口: `src/server.ts` (注册新工具)

## Diagrams

(暂无)

## Dev Notes

- 需要先实现或确保已有通过剧集名称获取剧集ID的功能。
- 考虑缓存TMDB配置信息（如图基础URL）。

## Chat Command Log

- (待填充) 
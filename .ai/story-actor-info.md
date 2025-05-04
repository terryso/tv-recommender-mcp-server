# Epic-1 - Story-3

查询演员信息及其作品 (Query Actor Information and Credits)

**As a** 用户 (User)
**I want** 查询演员的详细信息（如简介、照片）以及他们参演的剧集列表 (to query detailed information about an actor (like biography, photo) and the list of TV shows they starred in)
**so that** 我可以了解我喜欢的演员并发现他们出演的其他作品 (I can learn about actors I like and discover other works they have appeared in)

## Status

已完成 (Completed)

## Context

- 当前应用缺少演员相关信息。
- 此功能利用TMDB的 `/search/person`, `/person/{person_id}` 和 `/person/{person_id}/tv_credits` API端点。
- 丰富了应用内容维度，满足了追星用户的需求。

## Estimation

Story Points: 2

## Tasks

1.  - [x] 定义新的MCP工具 `get_actor_details_and_credits`
    1.  - [x] 设计工具输入参数: `{ "actor_name": string }` (演员姓名)
    2.  - [x] 设计工具输出格式: 包含演员基本信息（ID, 姓名, 简介, 照片路径, 人气）和参演的剧集列表（剧集ID, 标题, 角色, 海报路径, 评分）。
2.  - [x] 实现TMDB API调用逻辑
    1.  - [x] 添加函数：根据演员姓名搜索获取演员ID (`search/person`)
    2.  - [x] 添加函数：根据演员ID获取演员详细信息 (`person/{person_id}`)
    3.  - [x] 添加函数：根据演员ID获取演员参演的剧集列表 (`person/{person_id}/tv_credits`)
    4.  - [x] 组合上述函数，处理未找到演员或无作品的情况。
3.  - [x] 编写单元测试
    1.  - [x] 测试演员ID查找。
    2.  - [x] 测试获取演员详情。
    3.  - [x] 测试获取演员作品列表。
    4.  - [x] 测试错误处理。

## Constraints

- 演员姓名搜索可能返回多个结果，需要策略选择（如选择最相关的第一个）。
- TMDB中可能没有某些演员的中文信息。
- 演员照片和剧集海报路径需要结合TMDB配置API构建完整URL。

## Data Models / Schema

- **Input:**
  ```json
  {
    "actor_name": "string"
  }
  ```
- **Output (Example):**
  ```json
  {
    "actor": {
      "id": 123,
      "name": "演员姓名",
      "biography": "演员简介...",
      "profile_path": "/path/to/profile.jpg",
      "popularity": 85.6
    },
    "credits": [
      {
        "show_id": 456,
        "show_title": "剧集标题",
        "character": "角色名称",
        "poster_path": "/path/to/poster.jpg",
        "vote_average": 8.8
      }
      // ... more credits
    ]
  }
  ```

## Structure

- 新增工具实现文件: `src/tools/actorInfoTool.ts`
- 更新服务层: `src/services/tmdbClient.ts` (添加新的 `searchPerson`, `getPersonDetails`, `getPersonTvCredits` 方法)
- 更新服务器入口: `src/server.ts` (注册新工具)

## Diagrams

(暂无)

## Dev Notes

- 考虑缓存演员信息和作品列表。
- 需要处理 TMDB API 返回的图片路径。

## Chat Command Log

- 功能已完成实现，已添加 `getPersonDetails` 方法到 `tmdbClient.ts`，新增 `actorInfoTool.ts` 工具文件，并注册 `get_actor_details_and_credits` 工具。
- 实现的功能支持通过演员姓名搜索，获取其基本信息和参演的剧集列表，并按评分降序排序。 
# Epic-3 - Story-3.1
# Smart Watch Progress Management

**As a** 追剧达人 (Binge Watcher)
**I want** 标记我已经看过的剧集，并且应用能清晰地提示我下一集未看的是哪一集
**so that** 我能无缝管理多部剧的观看进度

## Status

Draft

## Context

- **Background:** 用户同时追看多部电视剧时，容易忘记每部剧看到哪里。
- **Justification:** 提供实用的追剧辅助功能，解决用户痛点，提升应用工具性价值。
- **Technical:** 主要依赖**本地存储**来记录用户的观看状态 (例如，存储 `series_id`, `season_number`, `episode_number` 的观看记录)。需要结合 TMDB API `/tv/{series_id}/season/{season_number}` 获取完整的剧集列表来展示和标记。TMDB `account_states` 仅用于评分，不适用于"已看"标记。

## Estimation

Story Points: {?}

## Tasks

1.  - [ ] 设计用户观看状态的数据模型和本地存储方案 (e.g., localStorage, IndexedDB, or server-side database if accounts exist)
2.  - [ ] 实现标记剧集为"已看"/"未看"的功能接口
3.  - [ ] 在剧集列表 UI 中集成状态显示和标记操作
4.  - [ ] 实现"下一集未看"的提示逻辑
    1.  - [ ] 获取剧集列表 (TMDB API)
    2.  - [ ] 读取本地观看状态
    3.  - [ ] 计算下一集
5.  - [ ] 在电视剧详情页或专门的"追剧中"页面展示"下一集"提示
6.  - [ ] 添加测试

## Constraints

- "已看"状态存储在本地，更换设备或清除缓存可能导致数据丢失（除非实现账户同步）。
- 依赖 TMDB 提供准确的剧集列表结构。

## Data Models / Schema

- 需要定义用户观看记录的数据结构 (e.g., `userId`, `seriesId`, `watchedEpisodes: [{season: number, episode: number}]` or similar)

## Structure

- 本地存储模块
- 剧集状态管理逻辑
- UI 集成

## Diagrams

- 暂无

## Dev Notes

- 重点考虑本地存储的性能和可靠性。
- 如果未来有账户系统，需要考虑状态同步。
- UI 设计要清晰直观，方便用户标记和查看进度。

## Chat Command Log

- 暂无 
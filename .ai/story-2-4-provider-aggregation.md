# Epic-2 - Story-2.4
# Provider/Network/Company Content Aggregation

**As a** 特定平台（如 Netflix, HBO, Disney+）或制片厂（如 A24, 皮克斯）的忠实观众
**I want** 一站式浏览该平台/制片厂的所有电影和电视剧
**so that** 我能集中发现他们出品的优质内容

## Status

Draft

## Context

- **Background:** 用户可能对特定内容提供商或制作方的作品有偏好，但分散查找效率低。
- **Justification:** 满足特定偏好用户的聚合浏览需求，提供便捷的内容发现入口。
- **Technical:** 需要先获取目标平台/网络/公司的 ID (通过 `/watch/providers/tv`, `/watch/providers/movie`, `/network/{network_id}`, `/search/company` 等)，然后使用 `/discover/movie` 或 `/discover/tv` 并结合 `with_watch_providers`, `with_networks`, 或 `with_companies` 参数进行过滤。

## Estimation

Story Points: {?}

## Tasks

1.  - [ ] 获取可用的 Watch Providers 列表及 ID
    1.  - [ ] 集成 TMDB Watch Providers API
2.  - [ ] 获取 Networks 列表及 ID (可能需要手动维护或从 TMDB 获取常见 Networks)
3.  - [ ] 实现公司搜索功能以获取 Company ID
    1.  - [ ] 集成 TMDB Search Company API
4.  - [ ] 实现基于 Provider/Network/Company ID 的内容发现接口
    1.  - [ ] 集成 TMDB Discover API (带 `with_watch_providers`)
    2.  - [ ] 集成 TMDB Discover API (带 `with_networks`)
    3.  - [ ] 集成 TMDB Discover API (带 `with_companies`)
5.  - [ ] 设计和实现前端 UI 以支持选择或搜索 Provider/Network/Company 并展示聚合结果
6.  - [ ] 添加测试

## Constraints

- 依赖 TMDB API 提供准确的 Provider, Network, Company ID 及对应的内容关联。
- TMDB 的 Provider 数据可能因地区而异，需要考虑地域性。
- Network 和 Company 的完整列表可能不易直接获取，需要策略性选择或实现搜索。

## Data Models / Schema

- 可能需要定义 Provider, Network, Company 对象模型。

## Structure

- Provider/Network/Company ID 获取模块
- Discover API 调用模块 (带过滤参数)
- UI 展示模块

## Diagrams

- 暂无

## Dev Notes

- 考虑优先支持哪些主流的 Provider/Network/Company。
- 如何处理多地区 Provider 数据的问题 (可能需要允许用户选择地区)。
- UI 设计要方便用户选择或搜索目标聚合对象。

## Chat Command Log

- 暂无 
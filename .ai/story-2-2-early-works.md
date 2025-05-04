# Epic-2 - Story-2.2
# Early Actor Works Discovery

**As a** 某演员的粉丝 (Actor Fan)
**I want** 轻松查看他们早期或不太知名的作品列表（并按时间排序）
**so that** 我能了解他们的成长轨迹和发现被忽略的佳作

## Status

Draft

## Context

- **Background:** 演员作品列表通常默认按热度或其他方式排序，难以快速找到早期作品。
- **Justification:** 满足粉丝对演员职业生涯深度挖掘的需求，提供差异化功能。
- **Technical:** 需要获取 TMDB `/person/{person_id}/movie_credits` 和 `/person/{person_id}/tv_credits` 的数据，然后在后端或前端根据发行日期 (`release_date` 或 `first_air_date`) 进行排序。

## Estimation

Story Points: {?}

## Tasks

1.  - [ ] 获取演员参演的电影列表接口
    1.  - [ ] 集成 TMDB `/person/{person_id}/movie_credits` API
2.  - [ ] 获取演员参演的电视剧列表接口
    1.  - [ ] 集成 TMDB `/person/{person_id}/tv_credits` API
3.  - [ ] 实现作品列表按发行日期排序逻辑
4.  - [ ] 设计和实现前端 UI 以展示排序后的早期作品列表
5.  - [ ] 添加测试

## Constraints

- 依赖 TMDB API 提供准确的演员作品信息和发行日期。
- 部分早期作品可能缺少日期信息，影响排序准确性。

## Data Models / Schema

- 暂无特定新增模型

## Structure

- 待定

## Diagrams

- 暂无

## Dev Notes

- 注意处理电影 `release_date` 和电视剧 `first_air_date` 两种日期字段。
- 考虑如何处理日期缺失的作品。

## Chat Command Log

- 暂无 
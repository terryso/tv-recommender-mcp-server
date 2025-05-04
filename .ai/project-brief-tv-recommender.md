# Project Brief: 美剧推荐 MCP 服务器

## Introduction / Problem Statement

大型语言模型（LLM）在理解和生成文本方面表现出色，但在提供实时、个性化的美剧推荐方面存在局限性（如知识截止、缺乏用户偏好理解）。用户期望通过自然语言交互获得更精准、更及时的推荐，而现有 LLM 难以完全满足此需求。本项目旨在通过 Model Context Protocol (MCP) Server 扩展 LLM 的能力，解决这一痛点，抓住提供更智能影视发现体验的机会。

## Vision & Goals

-   **Vision:** 让用户能够通过与 LLM 的自然对话，无缝地发现、了解并获取个性化、实时、可解释的美剧推荐，将 LLM 变为强大的个人娱乐顾问。
-   **Primary Goals (MVP):**
    -   Goal 1: 成功开发并运行一个 MCP Server，能稳定连接并响应 MCP 客户端（如 Claude Desktop）的请求。
    -   Goal 2: 实现至少三个核心美剧推荐工具：按类型推荐 (`get_recommendations_by_genre`)、查找相似剧集 (`get_similar_shows`) 和获取剧集详情 (`get_show_details`)。
    -   Goal 3: 服务器能可靠地从至少一个外部影视数据库 API（如 TMDb 或 TVmaze）获取数据并进行处理。
    -   Goal 4: 工具的响应成功率达到 95% 以上。
-   **Success Metrics (Initial Ideas):**
    -   工具调用成功率。
    -   API 请求响应时间（例如，P95 < 2 秒）。
    -   （未来）用户反馈评分或推荐采纳率。

## Target Audience / Users

主要目标用户是熟悉并使用支持 MCP 的 LLM 客户端（如 Claude Desktop）的个人用户。他们是美剧爱好者，对通过 AI 获取信息持开放态度，并希望以更自然、交互的方式发现符合口味的新剧集。

## Key Features / Scope (High-Level Ideas for MVP)

-   按类型推荐美剧 (`get_recommendations_by_genre`)
-   查找相似美剧 (`get_similar_shows`)
-   获取美剧详情 (`get_show_details`)

*(注：获取热门剧集和查询观看平台等功能可作为后续迭代考虑。)*

## Known Technical Constraints or Preferences

-   **Constraints:**
    -   强依赖外部 API (TMDb/TVmaze) 的可用性、数据质量和速率限制。
    *   需要用户端拥有并配置 MCP 客户端才能使用。
    *   需要获取并安全管理外部 API Key。
-   **Preferences:**
    *   **开发语言倾向于使用 TypeScript。** (需要参考 MCP TypeScript SDK 进行开发)。
-   **Risks:**
    *   外部 API 服务中断、政策变更或数据格式调整。
    *   API Key 意外泄露的安全风险。
    *   推荐结果的相关性或准确性未能达到用户预期。
    *   MCP 协议或客户端兼容性问题。

## Relevant Research (Optional)

本项目简报的定义基于先前进行的市场调研。核心发现如下：

*   **市场需求:** 用户对通过 LLM 获取更智能、个性化的美剧推荐存在需求，但现有 LLM 在此方面尚有不足。用户期望交互式、可解释的推荐。
*   **现有方案:** 传统推荐引擎存在局限性，已有部分 AI/LLM 推荐工具出现（如 Streamie, Recommendarr），但结合 MCP Server 提供实时交互推荐仍有空间。
*   **目标用户:** 主要是熟悉 LLM 和流媒体的美剧爱好者，寻求高效内容发现。
*   **技术可行性:** TMDb 和 TVmaze 是可靠的 API 数据源，能够支持所需功能。使用 MCP 构建服务器技术上可行，但需关注 API 限制和数据处理。

*(详细调研报告可追溯至之前的讨论记录。)* 
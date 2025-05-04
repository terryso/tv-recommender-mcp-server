\
[中文版本](README.md)

# TV Recommender MCP Server

A TV show recommendation MCP server based on the TMDb API, providing recommendations by genre, similar shows, and show details.

## Project Description

This project is an MCP (Model Context Protocol) server designed to provide comprehensive TV show recommendations and information query services. The server communicates with MCP-enabled clients via standard input/output (stdio) and retrieves data by calling the TMDb (The Movie Database) API. The service covers various aspects, from show discovery and detail queries to watch providers, actor information, and user reviews, offering users a one-stop shop for exploring TV shows.

## Features

- Communicates with clients via the MCP protocol
- Provides TV show recommendations by genre
- Provides recommendations for similar TV shows
- Provides detailed TV show information queries
- Queries watch providers for TV shows (streaming, rent, buy platforms)
- Supports advanced show discovery with multiple combined criteria
- Queries actor information and their credits
- Gets currently popular and trending TV shows
- Gets trailers and related videos for TV shows
- Views user reviews for TV shows
- Uses the TMDb API for the latest and most comprehensive show data

## Tech Stack

- **Language:** TypeScript
- **Runtime Environment:** Node.js
- **MCP SDK:** @modelcontextprotocol/sdk
- **Type Validation:** zod
- **HTTP Client:** axios
- **External API:** TMDb (The Movie Database)
- **Environment Variable Management:** dotenv

## Quick Start

You can quickly run the server using npx without installation:

```bash
# Set the TMDb API key (required)
export TMDB_API_KEY=your_api_key_here

# Run the server
npx tv-recommender-mcp-server
```

## Installation Steps

1. Install from NPM
   ```bash
   npm install -g tv-recommender-mcp-server
   ```

2. Configure Environment Variables
   ```bash
   export TMDB_API_KEY=your_api_key_here
   ```

3. Run the Server
   ```bash
   tv-recommender-mcp-server
   ```

Alternatively, you can clone the repository:

1. Clone the Repository
   ```bash
   git clone <repository_url>
   cd tv-recommender-mcp-server
   ```

2. Install Dependencies
   ```bash
   npm install
   ```

3. Configure Environment Variables
   - Copy `.env-example` to `.env`
   - Apply for an API key at [TMDb](https://www.themoviedb.org/)
   - Fill the API key into the `TMDB_API_KEY` field in the `.env` file

4. Build and Run the Project
   ```bash
   npm run build
   npm start
   ```

## Configuring the MCP Server in Cursor

To use this MCP server in Cursor, follow these steps:

1. Create (or edit) the `.cursor/mcp.json` file in the project root directory

2. Configure the server information in the file as follows (using the npx method):
   ```json
   {
     "mcpServers": {
       "TVRecommender": {
         "command": "npx",
         "args": [
           "tv-recommender-mcp-server"
         ]
       }
     }
   }
   ```

3. Pass the TMDb API key using environment variables:
   ```json
   {
     "mcpServers": {
       "TVRecommender": {
         "command": "env",
         "args": [
           "TMDB_API_KEY=your_api_key_here",
           "npx",
           "tv-recommender-mcp-server"
         ]
       }
     }
   }
   ```

4. After saving the file, Cursor will automatically detect and load this MCP server

5. You can now use the tool in Cursor in the following ways:
   - Type `/` in the chat and select the `TVRecommender` tool
   - Enter relevant queries, such as "Recommend sci-fi TV shows" or "Find shows similar to Game of Thrones"

6. For debugging or viewing logs:
   - Check the console output in Cursor's Developer Tools (press `Cmd+Option+I` to open)
   - Enable debug mode via environment variables: `"DEBUG=mcp:*,npx tv-recommender-mcp-server"`

## Usage Scenario Examples

Here are some practical usage scenario examples demonstrating how to combine multiple tools for a better experience:

1. **Discover New Shows**:
   - Use `get_popular_shows` or `get_trending_shows` to get currently popular shows
   - Once you find an interesting show, use `get_show_details` to view details
   - Watch trailers using `get_show_videos`
   - Use `get_watch_providers` to find where to watch

2. **Explore Based on Favorite Actors**:
   - Use `get_actor_details_and_credits` to see all works of a favorite actor
   - Use `get_recommendations_by_actor` to get recommendations related to the actor
   - For interesting shows, use `get_show_reviews` to see other viewers' reviews

3. **Precisely Filter Shows**:
   - Use `discover_shows` with multiple criteria (genre, year, rating, keywords, etc.) to accurately find shows matching personal taste
   - Example: Find high-rated sci-fi shows after 2020, or find original shows from specific networks (like HBO, Netflix)

4. **Explore Similar Content**:
   - After watching a liked show, use `get_similar_shows` to find other shows with similar style or theme
   - Combine with `get_recommendations_by_genre` to explore more quality content of the same genre

These functions can be naturally combined in AI chat. For example, you can tell the AI "Recommend some sci-fi shows similar to Stranger Things and tell me where I can watch them," and the MCP tools will automatically cooperate with the AI to provide the required information.

## Tool Descriptions

This MCP server provides the following tools:

1. **get_recommendations_by_genre** - Get show recommendations by genre
2. **get_similar_shows** - Get recommendations similar to a specified show
3. **get_show_details** - Get detailed information for a specified show
4. **get_watch_providers** - Query watch providers (streaming, rent, buy) for a specific show in a specified country/region
5. **discover_shows** - Advanced show discovery, supporting multiple combined criteria (e.g., genre, rating, year, keywords, network)
6. **find_shows_by_actor** - Find shows an actor starred in
7. **get_recommendations_by_actor** - Get show recommendations related to an actor
8. **get_actor_details_and_credits** - Get detailed actor information (like bio, photo) and their credits list
9. **get_popular_shows** - Get the currently most popular shows
10. **get_trending_shows** - Get recent trending shows (supports daily and weekly trends)
11. **get_show_videos** - Get trailers and related videos for a specified show
12. **get_show_reviews** - View user reviews for a specific show

## Function Examples

Here are usage examples for various tools:

### Get Watch Providers
```
/TVRecommender get_watch_providers --show_title="Stranger Things" --country_code="US"
```

### Advanced Show Discovery
```
/TVRecommender discover_shows --with_genres=["Sci-Fi", "Thriller"] --vote_average_gte=8.0 --first_air_date_year=2022
```

### Query Actor Info and Credits
```
/TVRecommender get_actor_details_and_credits --actor_name="Bryan Cranston"
```

### Get Popular & Trending Shows
```
/TVRecommender get_popular_shows
/TVRecommender get_trending_shows --time_window="day"
```

### Get Show Trailers & Videos
```
/TVRecommender get_show_videos --show_title="Game of Thrones"
```

### Query Show User Reviews
```
/TVRecommender get_show_reviews --show_title="Breaking Bad" --page=1
```

## Development Mode

If you wish to participate in development, use the following command to start development mode:

```bash
npm run dev
```

## Publishing to NPM

This project is configured with a GitHub Actions workflow to automatically publish to NPM:

1. Ensure the version number in `package.json` is updated
2. Add the following secret in the GitHub repository settings:
   - `NPM_TOKEN`: Your NPM access token
3. Create a new Release on GitHub or push a tag (v* format)
4. GitHub Actions will automatically build and publish to NPM

You can also manually trigger the workflow for publishing.

## Contribution Guide

Feel free to submit Issues and Pull Requests to help improve this project.

## License

[MIT](LICENSE) © 2023-present 

## Roadmap

Below is the complete project roadmap (based on user stories in the `.ai` directory):

**Epic 1: Core Recommendation Tools MVP**
- [x] Story 1.1: MCP Server Basic Setup & API Integration (`story-1-1-setup-integration.md`)
- [x] Story 1.2: Implement `get_recommendations_by_genre` Tool (`story-1-2-recommend-genre.md`)
- [x] Story 1.3: Implement `get_similar_shows` Tool (`story-1-3-recommend-similar.md`)
- [x] Story 1.4: Implement `get_show_details` Tool (`story-1-4-show-details.md`)

**Epic 2: Enhancements & Expansion**
- [ ] Story 2.1: Keyword/Theme Based Discovery (`story-2-1-keyword-discovery.md`)
- [ ] Story 2.2: Early Actor Works Discovery (`story-2-2-early-works.md`)
- [ ] Story 2.3: Detailed Episode Information and Interaction (`story-2-3-episode-details.md`)
- [ ] Story 2.4: Provider/Network/Company Content Aggregation (`story-2-4-provider-aggregation.md`)
- [x] Story 2.5: Query Actor Information and Credits (`story-2-5-actor-info.md`)
- [x] Story 2.6: Implement Advanced Show Discovery (`story-2-6-advanced-discovery.md`)
- [x] Story 2.7: Query Popular and Trending Shows (`story-2-7-popular-trending.md`)
- [x] Story 2.8: Query Show User Reviews (`story-2-8-reviews-ratings.md`)
- [x] Story 2.9: Query Show Trailers and Videos (`story-2-9-trailers.md`)
- [x] Story 2.10: Query Show Watch Providers (`story-2-10-watch-providers.md`)

**Epic 3: Personalization & Integration**
- [ ] Story 3.1: Smart Watch Progress Management (`story-3-1-watch-progress.md`)

**Epic 4: Visualization & Exploration**
- [ ] Story 4.1: Visual Franchise/Universe Exploration (`story-4-1-franchise-visualization.md`) 
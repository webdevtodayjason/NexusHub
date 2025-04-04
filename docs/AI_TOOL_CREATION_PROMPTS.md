# AI Tool Creation Prompts for NexusHub

This document provides a collection of optimized prompts specifically designed for AI assistants to help you quickly and efficiently extend the NexusHub MCP server with new tools.

## Table of Contents

- [Quick Start Prompts](#quick-start-prompts)
- [API Integration Prompts](#api-integration-prompts)
- [Data Processing Prompts](#data-processing-prompts)
- [System Integration Prompts](#system-integration-prompts)
- [UI Enhancement Prompts](#ui-enhancement-prompts)
- [Tool Enhancement Prompts](#tool-enhancement-prompts)

## Quick Start Prompts

### Basic Tool Creation

```
Create a new NexusHub MCP tool called "{tool_name}" that {tool_purpose}.

The tool should:
- Accept parameters: {param1} ({type}), {param2} ({type})
- Return: {expected_return_value}
- Handle errors: {error_handling_requirements}

Please provide:
1. Complete tool definition with proper schema
2. Tool implementation with error handling
3. Code to update index.js and handler.js
```

### Quick File Operation Tool

```
Create a NexusHub file operation tool called "fs_{operation}_file" that {explains_purpose}.

Requirements:
- Must validate file paths for security
- Must handle common file operation errors
- Should have proper documentation for Claude

Provide the complete implementation including all necessary files and updates.
```

### Quick Database Tool

```
Create a NexusHub database tool called "db_{operation}" for {database_type} databases that {explains_purpose}.

The tool should:
- Safely handle SQL to prevent injection attacks
- Include proper error handling and connection management
- Return results in a structured format

Provide the full implementation including code for all required files.
```

## API Integration Prompts

### Generic API Integration

```
Create a NexusHub tool that integrates with the {API_NAME} API.

API details:
- Base URL: {base_url}
- Authentication method: {auth_method}
- Rate limits: {rate_limits}

The tool should:
- Be named "{api_prefix}_{operation}"
- Accept parameters: {list_parameters}
- Parse and format the JSON response to return: {desired_output_format}

Ensure proper error handling, input validation, and API key security.
```

### Weather API Tool

```
Create a NexusHub weather forecast tool using {preferred_weather_api}.

Features needed:
- Current weather conditions
- 5-day forecast
- Location search by city name or coordinates
- Temperature in Celsius and Fahrenheit
- Weather conditions (sunny, rainy, etc.)

Create a complete implementation with proper error handling, rate limiting, and caching when appropriate.
```

### News API Tool

```
Create a NexusHub news search tool using {preferred_news_api}.

Tool requirements:
- Search news by keyword, topic, or source
- Filter by date range
- Sort by relevance or recency
- Return headline, source, date, and summary
- Option to get full article content

Ensure the tool handles pagination, error cases, and provides usable summaries.
```

## Data Processing Prompts

### Text Analysis Tool

```
Create a NexusHub text analysis tool that processes text to extract:
- Key entities (people, places, organizations)
- Sentiment score (positive/negative/neutral)
- Main topics or themes
- Reading level assessment

Use {preferred_nlp_library} or a suitable text processing approach. The tool should handle text of variable length and return structured analysis results.
```

### Data Transformation Tool

```
Create a NexusHub data transformation tool that can:
- Convert between common formats (JSON, CSV, XML)
- Support filtering by field values
- Allow field selection/projection
- Enable sorting and grouping

The tool should be flexible enough to handle different schemas and data structures while maintaining good performance.
```

### Vector Search Enhancement

```
Enhance the NexusHub vector search capabilities with:
- Support for multiple vector databases
- Better document chunking strategies
- Improved metadata filtering
- Adjustable semantic relevance thresholds

The implementation should extend the existing vector-tools.js with these new features while maintaining backward compatibility.
```

## System Integration Prompts

### Docker Management Tools

```
Create additional Docker management tools for NexusHub that provide:
- Container creation from image
- Network management
- Volume attachment and management
- Container health monitoring
- Environment variable configuration

Each tool should follow NexusHub's security practices and provide clear error messages.
```

### File System Observation Tool

```
Create a NexusHub file system observation tool that can:
- Watch directories for changes
- Trigger actions when files are created/modified/deleted
- Filter events by file pattern
- Return structured change notifications

The tool should be efficient, avoid excessive resource usage, and handle file system edge cases properly.
```

### Process Management Tool

```
Create a NexusHub process management tool set that can:
- List running processes
- Start/stop processes
- Monitor resource usage
- Get process logs
- Set process priority

Ensure the tools have proper permission checks and cannot be used maliciously.
```

## UI Enhancement Prompts

### Dashboard Widget Tool

```
Create a NexusHub dashboard widget system that:
1. Allows dynamic creation of dashboard widgets
2. Provides a widget registry tool
3. Supports data visualization widgets
4. Includes status and monitoring widgets

The implementation should extend the dashboard with a widget framework and provide tools for Claude to manage widgets.
```

### Tool Usage Analytics

```
Create a NexusHub tool usage analytics feature that:
- Tracks tool invocations and success rates
- Records performance metrics
- Provides usage statistics tools
- Visualizes trends on the dashboard

The implementation should be lightweight, avoid performance impacts, and respect privacy.
```

### Interactive Tool Documentation

```
Create an interactive tool documentation system for NexusHub that:
- Auto-generates documentation from tool schemas
- Provides example usage
- Shows expected inputs and outputs
- Offers a testing interface

The implementation should enhance the dashboard with this documentation system and provide tools to access it.
```

## Tool Enhancement Prompts

### Batch Processing Tool

```
Create a NexusHub batch processing enhancement that:
- Allows executing multiple tools in sequence
- Passes outputs from one tool to inputs of another
- Supports conditional branching based on results
- Provides progress tracking

The implementation should follow NexusHub's architecture and provide a clear interface for Claude.
```

### Caching Enhancement

```
Add intelligent caching to NexusHub tools:
- Implement a configurable caching layer
- Cache frequent tool results when appropriate
- Add cache control parameters to tools
- Provide cache management tools

The implementation should be transparent to existing tools while improving performance.
```

### Tool Result Transformation

```
Create a NexusHub result transformation system that:
- Allows post-processing of tool results
- Supports filtering, mapping, and aggregation
- Enables format conversion
- Provides template-based formatting

The implementation should be flexible and work with all existing tools.
```

---

## Example Prompt Usage

Here's how you might use one of these prompts:

```
I'd like to extend NexusHub with a new tool. 

Create a NexusHub tool that integrates with the OpenWeatherMap API.

API details:
- Base URL: https://api.openweathermap.org/data/2.5
- Authentication method: API key as query parameter
- Rate limits: 60 calls/minute on free tier

The tool should:
- Be named "weather_get_forecast"
- Accept parameters: location (string), days (number, 1-7)
- Parse and format the JSON response to return a clean forecast with date, condition, temperature, and precipitation chance

Ensure proper error handling, input validation, and API key security.
```

This would give you a complete implementation of a weather forecast tool for NexusHub.

You can combine elements from different prompts or customize them to your specific needs.

## Tips for Best Results

1. **Be specific** about the functionality you need
2. **Provide context** about how the tool will be used
3. **Mention security requirements** explicitly
4. **Specify return formats** for easier integration
5. **Ask for complete implementation** including all necessary files

## Additional Resources

For more information about the Model Context Protocol and Claude integration:

- [Model Context Protocol Official Site](https://modelcontextprotocol.io)
- [MCP Quickstart for Claude Desktop Users](https://modelcontextprotocol.io/quickstart/user#for-claude-desktop-users)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)
- [Claude API Documentation](https://docs.anthropic.com)
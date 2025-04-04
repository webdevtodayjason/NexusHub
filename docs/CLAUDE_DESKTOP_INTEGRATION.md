# Integrating NexusHub with Claude Desktop

This guide explains how to properly connect NexusHub and its companion MCP servers with Claude Desktop for a powerful AI assistant experience with access to a wide range of tools.

## Table of Contents

1. [Overview](#overview)
2. [Configuration Methods](#configuration-methods)
3. [Setting Up in Claude Desktop](#setting-up-in-claude-desktop)
4. [Understanding Transport Mechanisms](#understanding-transport-mechanisms)
5. [Fixing Common Issues](#fixing-common-issues)
6. [Advanced Configuration](#advanced-configuration)

## Overview

Claude Desktop can be enhanced with external tools through the Model Context Protocol (MCP), allowing it to perform actions like file operations, database queries, and web searches. NexusHub provides a unified MCP server along with three companion servers:

1. **NexusHub** - Core functionality for filesystem, database, Docker operations
2. **Brave Search** - Web search capabilities
3. **GitHub** - Repository interaction tools
4. **Memory** - Knowledge graph and persistent memory

Together, these provide over 40 tools to Claude Desktop.

## Configuration Methods

There are two main methods to connect NexusHub to Claude Desktop:

### 1. HTTP Mode

This connects to NexusHub via HTTP endpoints. It's simpler but may have limitations with large data transfers.

### 2. STDIO Mode (Recommended)

This uses direct process communication for better performance and reliability. It requires the NexusHub code to be available locally but provides the most robust experience.

## Setting Up in Claude Desktop

### Prerequisites

1. NexusHub repository cloned locally
2. Docker and Docker Compose installed
3. Claude Desktop installed

### Step 1: Start NexusHub and companion servers

```bash
cd /path/to/nexushub
docker-compose up -d
```

This will start all four MCP servers:
- NexusHub (primary server)
- Brave Search MCP
- GitHub MCP
- Memory MCP

### Step 2: Prepare the MCP bridge scripts

Make the necessary scripts executable:

```bash
# For Docker-based installations (recommended)
chmod +x /path/to/nexushub/nexushub-docker-mcp.sh

# For local installations (if not using Docker)
chmod +x /path/to/nexushub/nexushub-mcp.sh
chmod +x /path/to/nexushub/src/mcp/adapters/stdio-wrapper.js
chmod +x /path/to/nexushub/src/mcp/stdio-adapter.js
```

### Step 3: Configure Claude Desktop

Open Claude Desktop and edit the configuration file (Settings → Edit Configuration):

#### Option 1: HTTP Mode Configuration

```json
{
  "mcpServers": {
    "nexushub": {
      "name": "NexusHub MCP Server",
      "description": "Centralized MCP server with multiple capabilities",
      "url": "http://localhost:8001/mcp",
      "enabled": true
    }
  }
}
```

#### Option 2: STDIO Mode with Docker (Recommended)

If you're running NexusHub in Docker (most common setup), use the Docker bridge script:

```json
{
  "mcpServers": {
    "nexushub": {
      "name": "NexusHub MCP Server",
      "description": "Centralized MCP server with multiple capabilities",
      "command": "/path/to/nexushub/nexushub-docker-mcp.sh",
      "enabled": true
    },
    "brave-search": {
      "name": "Brave Search MCP",
      "description": "Provides web search capabilities via Brave Search API.",
      "command": "docker",
      "args": ["exec", "-i", "mcp_brave_search", "node", "dist/index.js"],
      "enabled": true
    },
    "github": {
      "name": "GitHub MCP",
      "description": "Provides GitHub repository interaction.",
      "command": "docker",
      "args": ["exec", "-i", "mcp_github", "node", "dist/index.js"],
      "enabled": true
    },
    "memory": {
      "name": "Memory MCP",
      "description": "Persistent knowledge graph memory.",
      "command": "docker",
      "args": ["exec", "-i", "mcp_memory", "node", "dist/index.js"],
      "enabled": true
    }
  }
}
```

#### Option 3: STDIO Mode for Local Installation

If you're running NexusHub locally (not in Docker):

```json
{
  "mcpServers": {
    "nexushub": {
      "name": "NexusHub MCP Server",
      "description": "Centralized MCP server with multiple capabilities",
      "command": "/path/to/nexushub/nexushub-mcp.sh",
      "enabled": true
    },
    "brave-search": {
      "name": "Brave Search MCP",
      "description": "Provides web search capabilities via Brave Search API.",
      "command": "docker",
      "args": ["exec", "-i", "mcp_brave_search", "node", "dist/index.js"],
      "enabled": true
    },
    "github": {
      "name": "GitHub MCP",
      "description": "Provides GitHub repository interaction.",
      "command": "docker",
      "args": ["exec", "-i", "mcp_github", "node", "dist/index.js"],
      "enabled": true
    },
    "memory": {
      "name": "Memory MCP",
      "description": "Persistent knowledge graph memory.",
      "command": "docker",
      "args": ["exec", "-i", "mcp_memory", "node", "dist/index.js"],
      "enabled": true
    }
  }
}
```

**Important:** Replace `/path/to/nexushub` with your actual NexusHub installation path.

### Step 4: Restart Claude Desktop

After saving the configuration, restart Claude Desktop to apply the changes.

## Understanding Transport Mechanisms

### HTTP Transport

In HTTP mode, Claude Desktop communicates with NexusHub using JSON-RPC over HTTP:

```
Claude Desktop → HTTP requests → NexusHub MCP server
```

Benefits:
- Simple to set up
- Works with remote servers
- Doesn't require local files

Limitations:
- May have issues with large data transfers
- Network latency can affect performance
- No direct access to file system

### STDIO Transport

In STDIO mode, Claude Desktop starts the NexusHub process and communicates over standard input/output:

```
Claude Desktop → STDIO → nexushub-mcp.sh → stdio-wrapper.js → stdio-adapter.js
```

Benefits:
- Better performance
- No network constraints
- More reliable with large data
- Direct file system access

Limitations:
- Requires local access to files
- More complex to debug
- Must prevent non-JSON output on stdout

## Fixing Common Issues

### "Unexpected token" Errors

These errors occur when non-JSON data is sent to Claude Desktop through STDIO.

Solution:
1. If using Docker, make sure you're using the Docker bridge script (`nexushub-docker-mcp.sh`)
2. Check if the wrapper script is redirecting stderr properly
3. Verify that the wrapper is filtering non-JSON output
4. Look at log files:
   - For Docker bridge: `/tmp/nexushub-docker-debug-*.log`
   - For local installation: `/tmp/nexushub-debug-*.log`

### Missing Tools

If tools aren't showing up in Claude Desktop:

1. Check if all Docker containers are running:
   ```bash
   docker ps | grep mcp
   ```

2. Verify configuration paths are correct in claude_desktop_config.json

3. Check Docker logs for errors:
   ```bash
   docker logs nexushub_app
   docker logs mcp_brave_search
   docker logs mcp_github
   docker logs mcp_memory
   ```

### Connection Errors

If Claude Desktop can't connect to NexusHub:

1. Verify the HTTP server is running (for HTTP mode):
   ```bash
   curl http://localhost:8001/
   ```

2. Test the bridge script manually:
   ```bash
   # For Docker installations
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | /path/to/nexushub/nexushub-docker-mcp.sh
   
   # For local installations
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | /path/to/nexushub/nexushub-mcp.sh
   ```

### API Key Issues

If tools like GitHub or Brave Search aren't working:

1. Check that API keys are properly set in the `.env` file:
   ```bash
   cat /path/to/nexushub/.env
   ```

2. Restart containers after updating API keys:
   ```bash
   docker-compose restart
   ```

## Advanced Configuration

### Customizing the Wrapper Script

You can modify `nexushub-mcp.sh` for custom environment variables or logging:

```bash
#!/bin/bash
# Custom environment variables
export API_KEY="your_api_key"
export LOG_LEVEL="debug"

# Run with custom log file
exec node /path/to/nexushub/src/mcp/adapters/stdio-wrapper.js 2> /path/to/custom-log.log
```

### Adding Your Own Tools

After [adding new tools to NexusHub](./TOOL_DEVELOPMENT_GUIDE.md), restart all services:

```bash
docker-compose restart
```

Then restart Claude Desktop to pick up the new tools.

### Securing Your Configuration

For security:

1. Use separate API keys for different environments
2. Restrict filesystem access to specific directories
3. Use read-only SQL queries for database operations
4. Don't store sensitive API keys in the repository

## Additional Resources

- [Model Context Protocol Official Site](https://modelcontextprotocol.io)
- [MCP Quickstart for Claude Desktop Users](https://modelcontextprotocol.io/quickstart/user#for-claude-desktop-users)
- [Claude Desktop Documentation](https://docs.anthropic.com/en/docs/claude-desktop)
- [Troubleshooting MCP Connections](https://docs.anthropic.com/en/docs/claude-desktop/troubleshooting)
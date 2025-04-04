# Integrating NexusHub with Claude CLI

This guide explains how to integrate NexusHub MCP servers with Claude CLI, allowing you to access all NexusHub tools from the command line.

## Table of Contents

1. [Understanding Claude CLI MCP Commands](#understanding-claude-cli-mcp-commands)
2. [Setting Up NexusHub with Claude CLI](#setting-up-nexushub-with-claude-cli)
3. [STDIO vs HTTP Transport](#stdio-vs-http-transport)
4. [Configuration for Multiple MCP Servers](#configuration-for-multiple-mcp-servers)
5. [Command Reference](#command-reference)
6. [Advanced Configuration](#advanced-configuration)
7. [Troubleshooting](#troubleshooting)

## Understanding Claude CLI MCP Commands

Claude CLI provides a set of commands for managing MCP (Model Context Protocol) servers. These commands allow you to:

- Add an MCP server to Claude CLI
- List configured MCP servers
- Get details about a specific server
- Remove a server
- Import server configurations from Claude Desktop

Claude CLI supports different "scopes" for MCP servers:
- `local`: Available only in the current project (default)
- `project`: Shared with everyone in the project via `.mcp.json` file
- `user`: Available to you across all projects

## Setting Up NexusHub with Claude CLI

### Prerequisites

1. Install Claude CLI according to the [official documentation](https://docs.anthropic.com/en/docs/claude-code/overview)
2. Have NexusHub installed and running

### Option 1: Add NexusHub as a STDIO Server

The STDIO transport is recommended as it provides the most reliable communication with Claude CLI.

```bash
# Basic syntax for adding a STDIO server
claude mcp add <name> <command> [args...]

# Adding NexusHub as a STDIO server
claude mcp add nexushub /path/to/nexushub/nexushub-mcp.sh
```

### Option 2: Add NexusHub as an HTTP Server

If you prefer to use HTTP transport:

```bash
# Add NexusHub as an HTTP server
claude mcp add --transport sse nexushub-http http://localhost:8001/mcp
```

### Verify the Configuration

```bash
# List all configured MCP servers
claude mcp list

# Get details about the NexusHub server
claude mcp get nexushub
```

## STDIO vs HTTP Transport

NexusHub supports two transport methods for communication with Claude:

### STDIO Transport

**Pros:**
- More reliable for larger data exchanges
- Better error handling
- No network-related issues
- Better performance

**Cons:**
- Requires the script to be on the local machine
- More complex to debug

### HTTP Transport

**Pros:**
- Can connect to remote servers
- Easier to debug with standard HTTP tools
- Works across network boundaries

**Cons:**
- May have issues with network latency
- Might encounter connection timeouts with large files
- Requires managing HTTP security considerations

## Configuration for Multiple MCP Servers

NexusHub is designed to work alongside other MCP servers like Brave Search, GitHub, and Memory. You can configure all of them in Claude CLI:

```bash
# Add all MCP servers
claude mcp add nexushub /path/to/nexushub/nexushub-mcp.sh
claude mcp add brave-search docker exec -i mcp_brave_search node dist/index.js
claude mcp add github docker exec -i mcp_github node dist/index.js
claude mcp add memory docker exec -i mcp_memory node dist/index.js
```

### Project-Wide Configuration with .mcp.json

To share these configurations with your team, you can create a project-scoped configuration:

```bash
# Add servers with project scope
claude mcp add nexushub -s project /path/to/nexushub/nexushub-mcp.sh
claude mcp add brave-search -s project docker exec -i mcp_brave_search node dist/index.js
claude mcp add github -s project docker exec -i mcp_github node dist/index.js
claude mcp add memory -s project docker exec -i mcp_memory node dist/index.js
```

This will create or update a `.mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "nexushub": {
      "command": "/path/to/nexushub/nexushub-mcp.sh",
      "args": [],
      "env": {}
    },
    "brave-search": {
      "command": "docker",
      "args": ["exec", "-i", "mcp_brave_search", "node", "dist/index.js"],
      "env": {}
    },
    "github": {
      "command": "docker",
      "args": ["exec", "-i", "mcp_github", "node", "dist/index.js"],
      "env": {}
    },
    "memory": {
      "command": "docker",
      "args": ["exec", "-i", "mcp_memory", "node", "dist/index.js"],
      "env": {}
    }
  }
}
```

## Importing from Claude Desktop

If you've already configured NexusHub in Claude Desktop, you can import those settings:

```bash
# Import MCP servers from Claude Desktop
claude mcp add-from-claude-desktop
```

This will prompt you to select which servers to import from your Claude Desktop configuration.

## Command Reference

### Add an MCP Server

```bash
# Add an MCP server with STDIO transport (default)
claude mcp add <name> <command> [args...]

# Add an MCP server with SSE transport (HTTP)
claude mcp add --transport sse <name> <url>

# Add with environment variables
claude mcp add <name> -e KEY=value <command>

# Add with a specific scope
claude mcp add <name> -s <scope> <command>
```

### Manage MCP Servers

```bash
# List all servers
claude mcp list

# Get details about a server
claude mcp get <name>

# Remove a server
claude mcp remove <name>
```

### Import from Claude Desktop

```bash
# Import MCP servers from Claude Desktop
claude mcp add-from-claude-desktop

# Import to a specific scope
claude mcp add-from-claude-desktop -s <scope>
```

## Advanced Configuration

### Environment Variables

You can pass environment variables to your NexusHub server:

```bash
# Add environment variables
claude mcp add nexushub -e API_KEY=your_api_key -e LOG_LEVEL=debug /path/to/nexushub/nexushub-mcp.sh
```

### Timeout Configuration

Configure the MCP server startup timeout using the `MCP_TIMEOUT` environment variable:

```bash
# Set a 10-second timeout
MCP_TIMEOUT=10000 claude mcp add nexushub /path/to/nexushub/nexushub-mcp.sh
```

### Using Claude as an MCP Server

You can also use Claude Code itself as an MCP server:

```bash
# Start Claude as an MCP server
claude mcp serve
```

This allows other applications to connect to Claude Code and access its tools.

## Troubleshooting

### Server Not Found

If Claude CLI cannot find your NexusHub server:

1. Make sure the path to `nexushub-mcp.sh` is correct
2. Ensure the script has executable permissions:
   ```bash
   chmod +x /path/to/nexushub/nexushub-mcp.sh
   ```
3. Check that NexusHub is running:
   ```bash
   docker-compose ps
   ```

### Connection Issues

If Claude CLI cannot connect to NexusHub:

1. Make sure the Docker containers are running:
   ```bash
   docker-compose up -d
   ```
2. Check the logs for errors:
   ```bash
   docker-compose logs
   ```
3. Verify the HTTP endpoint is accessible (for HTTP transport):
   ```bash
   curl -X POST http://localhost:8001/mcp/tools/list \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
   ```

### Tool Errors

If you get errors when calling tools:

1. Check the tool exists in NexusHub:
   ```bash
   # In Claude CLI
   /mcp
   ```
   This will show all available tools from all configured MCP servers.

2. Check the Docker logs for more detailed error messages:
   ```bash
   docker logs nexushub_app
   docker logs mcp_github
   ```

3. Verify that all required API keys are configured in your `.env` file.

### STDIO Communication Issues

For "Unexpected token" errors or other STDIO communication issues:

1. Check the debug logs:
   ```bash
   tail -f /tmp/nexushub-debug-*.log
   ```

2. Make sure the wrapper script is correctly launching the STDIO adapter:
   ```bash
   cat /path/to/nexushub/nexushub-mcp.sh
   ```

---

## Additional Resources

- [Model Context Protocol Official Site](https://modelcontextprotocol.io)
- [MCP Quickstart for Claude CLI Users](https://modelcontextprotocol.io/quickstart/user)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)
- [Claude API Documentation](https://docs.anthropic.com)
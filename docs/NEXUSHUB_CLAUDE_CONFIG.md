# Configuring Claude Desktop with NexusHub Docker MCP Bridge

This guide provides instructions for configuring Claude Desktop to work with the NexusHub MCP server running in Docker using our custom bridge script.

## Background

When running NexusHub in Docker, the standard STDIO adapter doesn't work directly with Claude Desktop. The Docker bridge script we've created solves this problem by:

1. Forwarding all JSONRPC requests to the Docker container
2. Ensuring proper stdout/stderr handling for Claude Desktop compatibility 
3. Maintaining proper namespaced tool names (mcp__Nexushub__)

## Configuration Instructions

### Step 1: Make sure everything is running

Ensure Docker and the NexusHub containers are running:

```bash
docker-compose up -d
```

### Step 2: Verify the Docker MCP bridge is working

Test that the Docker MCP bridge script works:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | ./nexushub-docker-mcp.sh
```

You should see a list of available tools with the `mcp__Nexushub__` prefix.

### Step 3: Update Claude Desktop configuration

1. Open Claude Desktop
2. Go to Settings
3. Click "Edit Configuration"
4. Replace the configuration with the following, updating paths as needed:

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

Replace `/path/to/nexushub` with the absolute path to your NexusHub repository.

### Step 4: Restart Claude Desktop

Save the configuration and restart Claude Desktop to apply the changes.

## Troubleshooting

If you encounter issues, check the debug log at:

```
/tmp/nexushub-docker-debug-*.log
```

This file contains detailed logs from the bridge script and the Docker communication.

## How It Works

The Docker MCP bridge works as follows:

1. Claude Desktop sends JSONRPC requests to the bridge script
2. The bridge script forwards these requests to the Docker container
3. The Docker container processes the requests and returns the results
4. The bridge script forwards the results back to Claude Desktop

This approach allows Claude Desktop to communicate with the NexusHub MCP server running in Docker without modification to the core codebase.

## Security Considerations

The Docker MCP bridge script executes commands in the Docker container. Ensure that:

1. The Docker container is properly secured
2. The bridge script is only accessible to authorized users
3. API keys and sensitive data are properly protected

## Additional Resources

For more information about NexusHub and Claude Desktop integration, see:

- [Claude Desktop Integration](./CLAUDE_DESKTOP_INTEGRATION.md)
- [Tool Development Guide](./TOOL_DEVELOPMENT_GUIDE.md)
- [NexusHub Architecture](./ARCHITECTURE.md)
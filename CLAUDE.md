# CLAUDE.md - NexusHub Guide for Claude

This document provides comprehensive information about NexusHub to help Claude understand, debug, and enhance the system in future sessions.

## Project Overview

NexusHub is a unified MCP (Model Context Protocol) server that provides AI assistants like Claude with access to external tools and services. It bridges Claude Desktop with various capabilities including filesystem operations, database access, Docker management, web search, and semantic document search via vector embeddings.

### Key Components

- **HTTP Server**: Express-based server providing RESTful API and MCP over HTTP
- **STDIO Client**: Direct stdio-based interface for Claude Desktop
- **Web Dashboard**: Protocol design system admin interface with dark mode for configuration and management
- **MCP Integration**: Implements the Model Context Protocol for AI tool communication
- **External Services**: Integrates with Memory, GitHub, and Brave Search MCP servers

## Project Structure

```
/nexushub/
├── public/                # Static assets for the dashboard
├── src/
│   ├── dashboard/         # Dashboard routes and controllers
│   ├── database/          # Database connection and models
│   ├── mcp/               # MCP server implementation
│   │   ├── adapters/      # MCP protocol adapters
│   │   │   └── stdio-wrapper.js # Clean JSON protocol wrapper
│   │   ├── http-routes.js # HTTP-based MCP endpoints
│   │   ├── stdio-adapter.js # STDIO-based MCP adapter
│   │   ├── stdio-server.js # STDIO-based MCP server
│   │   └── tools/         # Tool implementations
│   │       ├── index.js   # Tool registry
│   │       ├── handler.js # Tool handling logic
│   │       ├── database-tools.js
│   │       ├── docker-tools.js
│   │       ├── filesystem-tools.js
│   │       ├── general-tools.js
│   │       ├── search-tools.js
│   │       └── vector-tools.js
│   ├── utils/             # Utility functions
│   │   └── logger.js      # Logging utility
│   ├── index.js           # Main entry point for HTTP server
│   └── stdio-client.js    # Entry point for STDIO client
├── .env                   # Environment variables (gitignored)
├── .env.example           # Example environment variables
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker build configuration
├── nexushub-mcp.sh        # Wrapper script for Claude Desktop
├── package.json           # Node.js dependencies and scripts
└── README.md              # Project documentation
```

## Key Technologies

- **Node.js**: JavaScript runtime environment
- **Express**: Web framework for HTTP API
- **Protocol Design System**: Modern design system based on Tailwind CSS for dashboard UI
- **Alpine.js**: Lightweight JavaScript framework for UI interactions
- **SQLite**: Simple file-based database (via better-sqlite3)
- **Docker**: Containerization for services
- **Vector Search**: Document embedding and semantic search capabilities

## Available Tools

NexusHub exposes the following tools to Claude:

### Filesystem Tools
- `fs_list_files`: Lists files in a directory
- `fs_read_file`: Reads file contents
- `fs_write_file`: Writes content to a file

### Database Tools
- `db_execute_query`: Executes a read-only SQL query
- `db_list_tables`: Lists all tables in the database
- `db_describe_table`: Describes table schema
- `db_insert_data`: Inserts data into a table

### Docker Tools
- `docker_list_containers`: Lists Docker containers
- `docker_start_container`: Starts a container
- `docker_stop_container`: Stops a container
- `docker_get_container_logs`: Gets container logs

### Search Tools
- `serper_search`: Performs web search via Serper API

### Vector Database Tools
- `ingest_docs`: Ingests documents into the vector store
- `vector_search`: Searches for similar documents

## Command Reference

### Development Commands

```bash
# Start HTTP server in development mode
npm run dev

# Start STDIO client for Claude Desktop
npm run stdio

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Docker Commands

```bash
# Build Docker image
npm run docker:build

# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Restart services
npm run docker:restart
```

## Configuration

NexusHub uses the following environment variables for configuration:

```
# Server Configuration
PORT=8001
NODE_ENV=development
LOG_LEVEL=debug

# Database Configuration
DATABASE_PATH=./data/nexushub.db

# Vector Store Configuration
DEFAULT_DOCS_SOURCE_DIR=docs
VECTOR_DB_PATH=./persistent_data/chroma_db

# API Keys
BRAVE_API_KEY=your_brave_api_key_here
GITHUB_TOKEN=your_github_personal_access_token_here
SERPER_API_KEY=your_serper_api_key_here
```

## Adding New Tools

To add a new tool to NexusHub, follow these steps:

1. **Create or extend a tool module** in `src/mcp/tools/`:

```javascript
// Example: src/mcp/tools/my-new-tools.js
export function getToolDefinitions() {
  return {
    my_new_tool: {
      name: 'my_new_tool',
      description: 'Description of what the tool does.',
      inputSchema: {
        type: 'object',
        properties: {
          param1: {
            type: 'string',
            description: 'Description of parameter 1'
          },
          param2: {
            type: 'number',
            description: 'Description of parameter 2'
          }
        },
        required: ['param1']
      }
    }
  };
}

export async function myNewTool(param1, param2 = 0) {
  // Implementation of your tool
  // ...
  return { result: 'Success!', data: { param1, param2 } };
}
```

2. **Import and register the tool** in `src/mcp/tools/index.js`:

```javascript
// Add to the imports
import * as myNewTools from './my-new-tools.js';

// Add to the getTools function
export async function getTools() {
  try {
    const allTools = [
      // ... existing tools ...
      
      // Add your new tools
      ...Object.values(myNewTools.getToolDefinitions()),
    ];
    
    return allTools;
  } catch (error) {
    // Error handling
  }
}
```

3. **Add the tool handler** in `src/mcp/tools/handler.js`:

```javascript
// Add to the imports
import * as myNewTools from './my-new-tools.js';

// Add to the handleToolCall function
export async function handleToolCall(toolName, params) {
  try {
    switch (toolName) {
      // ... existing tools ...
      
      // Add your new tool
      case 'my_new_tool':
        return await myNewTools.myNewTool(params.param1, params.param2);
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    // Error handling
  }
}
```

## Debugging Tips

### HTTP Server Issues

1. Check the server logs:
   ```bash
   npm run docker:logs
   ```

2. Verify the server is running:
   ```bash
   curl http://localhost:8001/
   ```

3. Test the MCP endpoint:
   ```bash
   curl -X POST http://localhost:8001/mcp/tools/list \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
   ```

### STDIO Client Issues

1. Test the STDIO client manually:
   ```bash
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | npm run stdio
   ```

2. Check Claude Desktop configuration:
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

3. Check STDIO adapter logs for troubleshooting:
   ```bash
   tail -f /tmp/nexushub-debug-*.log
   ```

4. Test wrapper scripts manually:
   ```bash
   # Test the stdio adapter directly
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node src/mcp/stdio-adapter.js
   
   # Test through the wrapper
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | ./nexushub-mcp.sh
   ```

### Docker Container Issues

1. Check container status:
   ```bash
   docker ps -a | grep nexushub
   ```

2. Inspect container logs:
   ```bash
   docker logs nexushub_app
   ```

3. Check network connectivity:
   ```bash
   docker exec -it nexushub_app curl -s http://localhost:8001/
   ```

## Common Tasks

### Update API Keys

1. Modify the `.env` file with new API keys
2. Use the dashboard UI to update keys at http://localhost:8001/dashboard
3. Restart the service: `npm run docker:restart`

### Add Document to Vector Database

1. Use the dashboard UI to upload documents
2. Use the `ingest_docs` tool programmatically
3. Add files directly to the `docs` directory and run ingestion

### Modify Dashboard UI

1. Dashboard HTML is located at `public/dashboard.html`
2. Dashboard routes are in `src/dashboard/routes.js`
3. After changes, restart the server to see updates

## Advanced Configuration

### Secure File Access

Filesystem operations are restricted to the `SECURE_FILES_BASE_PATH` directory for security.

### Custom Embedding Models

The vector database can be configured to use different embedding models by modifying the vector-tools.js implementation.

### Cross-Origin Resource Sharing

CORS can be configured via the `CORS_ORIGINS` environment variable to control which domains can access the API.

## Troubleshooting

### STDIO Adapter Architecture

NexusHub implements a multi-layer approach to ensure reliable communication with Claude Desktop:

1. **nexushub-mcp.sh**: Simple wrapper script that launches the Node.js STDIO wrapper
2. **stdio-wrapper.js**: Node.js wrapper that:
   - Spawns the MCP adapter as a child process
   - Captures all output from the adapter
   - Validates JSON before sending to stdout
   - Logs non-JSON output to debug files
3. **stdio-adapter.js**: Core MCP implementation that:
   - Redirects all console methods to stderr
   - Handles uncaught exceptions
   - Properly implements the MCP protocol
   - Ensures only valid JSON is written to stdout

This layered approach prevents "Unexpected token" errors in Claude Desktop by ensuring only valid JSON responses are sent to stdout.

### "Method not found" Errors

This typically indicates a mismatch between the MCP client and server protocol versions or an unsupported method.

### Database Connection Errors

Check that the SQLite database file exists and has proper permissions.

### Docker Permission Issues

If Docker operations fail, ensure the server has proper access to the Docker socket.

### Vector Search Problems

Verify that the vector database has been properly initialized and that documents have been ingested.

### "Unexpected token" Errors

If you see "Unexpected token" errors in Claude Desktop:
- Check the wrapper scripts are correctly configured and executable
- Look at the debug logs in `/tmp/nexushub-debug-*.log`
- Ensure only valid JSON is being sent to stdout
- Double-check the wrapper is capturing all Node.js startup messages

## MCP Protocol Notes

The MCP protocol is based on JSON-RPC 2.0 and requires proper handling of notifications, requests, and responses. Key methods include:

- `initialize`: Sets up the initial connection
- `tools/list`: Gets available tools
- `tools/call/{tool_name}`: Calls a specific tool
- `notifications/initialized`: Notification that initialization is complete

## Feature Roadmap

Planned features for future development:

1. **Authentication System**: User login and role-based access control
2. **Advanced Vector Search**: More document formats and chunking strategies
3. **Tool History**: Track and display tool usage history
4. **Custom Prompt Templates**: User-editable prompt templates
5. **Plugin System**: Allow dynamic loading of third-party tool modules
6. **Monitoring Dashboard**: Real-time metrics and usage statistics

## Support and Resources

For additional help, consult these resources:

- [GitHub Repository](https://github.com/webdevtodayjason/NexusHub)
- [Model Context Protocol Docs](https://github.com/anthropics/anthropic-tools)
- [Claude API Documentation](https://docs.anthropic.com)
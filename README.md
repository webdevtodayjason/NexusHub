<div align="center">

# 🚀 NexusHub

### Unified MCP Server for Claude AI Tools

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/webdevtodayjason/NexusHub)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)
[![MCP](https://img.shields.io/badge/MCP-compatible-purple.svg)](https://github.com/anthropics/anthropic-tools)

<p align="center">
  <img src="https://raw.githubusercontent.com/webdevtodayjason/NexusHub/main/public/nexushub-logo.png" alt="NexusHub Logo" width="300" />
</p>

<p>
  <strong>A powerful bridge between Claude AI and external services via Model Context Protocol.</strong><br>
  Enhance Claude Code with filesystem access, database operations, vector search, GitHub integration, and more.
</p>

[Demo](https://github.com/webdevtodayjason/NexusHub) •
[Documentation](https://github.com/webdevtodayjason/NexusHub/wiki) •
[Report Bug](https://github.com/webdevtodayjason/NexusHub/issues) •
[Request Feature](https://github.com/webdevtodayjason/NexusHub/issues)

</div>

---

## ✨ Features

- **📡 Dual Interface** - Supports both HTTP and stdio MCP protocols
- **💅 Modern Dashboard** - Beautiful Protocol design system admin interface with dark mode by default
- **🔌 Integrated Services** - Combines multiple MCP servers (Memory, GitHub, Brave Search)
- **🔍 Vector Database** - Document ingestion and semantic search capabilities
- **🔑 API Management** - Securely manage API keys and service configurations
- **🐳 Docker Integration** - Easy deployment with Docker and Docker Compose
- **📋 Advanced Prompts** - Pre-configured prompts for effective AI interactions
- **🔄 Real-time Status** - Monitor the health of all connected services

<div align="center">
  <br>
  <img src="https://raw.githubusercontent.com/webdevtodayjason/NexusHub/main/public/dashboard-screenshot.png" alt="NexusHub Dashboard" width="800" />
  <br>
  <em>The elegant NexusHub dashboard interface with Protocol design system</em>
  <br>
</div>

## 🏛️ Architecture

NexusHub uses a Node.js backend with Express for the HTTP interface and native stdio handling for the CLI interface. The server integrates with several key services:

```
┌─────────────────────────────────────────────────────┐
│                  Claude Desktop                     │
└───────────┬─────────────────┬───────────┬───────────┘
            │                 │           │
            ▼                 ▼           ▼           
┌───────────────────┐ ┌─────────────┐ ┌─────────────┐ 
│    NexusHub MCP   │ │ Memory MCP  │ │ GitHub MCP  │ 
│       Server      │ │   Server    │ │   Server    │ 
└─────────┬─────────┘ └─────────────┘ └─────────────┘ 
          │                  ▲                ▲        
          ▼                  │                │        
┌─────────────────┐          │                │        
│  Vector Store   │          │                │        
└─────────────────┘          │                │        
          │                  │                │        
          ▼                  │                │        
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│ Filesystem API  │ │ Database API│ │   Docker API    │
└─────────────────┘ └─────────────┘ └─────────────────┘
```

## 🛠️ Available Tools

NexusHub provides the following tools to Claude AI:

| Category | Tool | Description |
|----------|------|-------------|
| **Filesystem** | `fs_list_files` | List files in a directory |
| | `fs_read_file` | Read file contents |
| | `fs_write_file` | Write to a file |
| **Database** | `db_execute_query` | Execute a read-only SQL query |
| | `db_list_tables` | List all tables in the database |
| | `db_describe_table` | Get table schema |
| | `db_insert_data` | Insert data into a table |
| **Docker** | `docker_list_containers` | List Docker containers |
| | `docker_start_container` | Start a container |
| | `docker_stop_container` | Stop a container |
| | `docker_get_container_logs` | Get container logs |
| **Search** | `serper_search` | Perform web search via Serper API |
| **Vector DB** | `ingest_docs` | Ingest documents into the vector store |
| | `vector_search` | Search for similar documents |

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Python 3.8+ (for vector embedding)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/webdevtodayjason/NexusHub.git
   cd NexusHub
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env file with your API keys
   ```

3. **Start the services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the dashboard:**
   Open [http://localhost:8001/dashboard](http://localhost:8001/dashboard) in your browser

### Configuration for Claude Desktop

NexusHub supports two different integration methods with Claude Desktop:

#### 1. HTTP Mode

This mode connects to NexusHub via HTTP endpoints. Add to your `claude_desktop_config.json`:

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

#### 2. STDIO Mode (Recommended)

This mode uses direct process communication for better performance and reliability. It requires the NexusHub code to be available locally:

1. **Prepare the wrapper scripts:**
   ```bash
   # Make the wrapper script executable
   chmod +x /path/to/nexushub/nexushub-mcp.sh
   chmod +x /path/to/nexushub/src/mcp/adapters/stdio-wrapper.js
   chmod +x /path/to/nexushub/src/mcp/stdio-adapter.js
   ```

2. **Add to your `claude_desktop_config.json`:**
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

**Note:** Replace `/path/to/nexushub` with your actual NexusHub installation path.

#### Docker Containers

Make sure all Docker containers are running before starting Claude Desktop:

```bash
cd /path/to/nexushub
docker-compose up -d
```

This will start all required MCP servers:
- NexusHub (primary server with filesystem, database, Docker tools)
- Brave Search MCP (web search capabilities)
- GitHub MCP (repository interaction)
- Memory MCP (knowledge graph/persistent memory)

## 💡 Example Usage

Here are some examples of how to use NexusHub with Claude AI:

### File Operations

```
Please use fs_list_files to show me all the JavaScript files in the src directory, 
then read the content of any interesting files you find.
```

### Database Query

```
Can you use db_execute_query to find all users in the database who joined 
in the last month and have the "admin" role?
```

### Vector Search

```
Please use vector_search to find documentation related to "authentication flow" 
and summarize the key points.
```

### Combined Tools

```
First, use brave_web_search to find the latest best practices for React error boundaries. 
Then, use fs_read_file to examine our current implementation in ErrorBoundary.jsx, 
and suggest improvements based on what you found.
```

## 🧩 How to Add Your Own Tools

You can extend NexusHub with custom tools by adding new tool definitions to the `/src/mcp/tools/` directory:

```javascript
// src/mcp/tools/my-custom-tools.js

export function getToolDefinitions() {
  return {
    my_custom_tool: {
      name: 'my_custom_tool',
      description: 'Description of what the tool does.',
      inputSchema: {
        type: 'object',
        properties: {
          param1: {
            type: 'string',
            description: 'Description of parameter 1'
          }
          // Add more parameters as needed
        },
        required: ['param1']
      }
    }
  };
}

// Tool implementation
export async function myCustomTool(param1) {
  // Your custom tool logic here
  return { result: 'Success!' };
}
```

Then add the tool to `/src/mcp/tools/index.js` and `/src/mcp/tools/handler.js`.

## 🔄 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run in development mode:**
   ```bash
   npm run dev
   ```

3. **For stdio mode testing:**
   ```bash
   npm run stdio
   ```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "API Keys"
```

## 🔧 Troubleshooting

### Claude Desktop Integration Issues

1. **"Unexpected token" errors when starting Claude Desktop:**
   - Make sure your wrapper scripts have proper permissions: `chmod +x nexushub-mcp.sh`
   - Verify that all scripts filter non-JSON output correctly 
   - Check log files in `/tmp/nexushub-debug-*.log` for details

2. **MCP server not loading or tools not appearing:**
   - Ensure Docker containers are running: `docker ps | grep mcp`
   - Check container logs: `docker logs mcp_brave_search`
   - Verify Claude Desktop configuration has the correct paths/commands
   - Try restarting Claude Desktop after making changes

3. **Docker container issues:**
   - Clear Docker logs if they get too large: `docker system prune`
   - Restart containers: `docker-compose restart`
   - Check for port conflicts: `lsof -i :8001`

### Common Error Messages

| Error | Solution |
|-------|----------|
| "Method not found" | The MCP server doesn't support this method. Check if you're using the correct tool name. |
| "Socket hang up" | Connection issue. Check if the MCP server is running. |
| "ENOENT" | File or directory not found. Check paths in your configuration. |
| "Permission denied" | File permission issue. Check script permissions. |
| "Unexpected token" | JSON parsing error. Check the MCP server's stdout output. |

## 📚 Documentation

### Tool Development Guides
- [Quick Start Guide](./docs/QUICK_START_GUIDE.md) - Get up and running in 5 minutes
- [Tool Development Guide](./docs/TOOL_DEVELOPMENT_GUIDE.md) - Comprehensive guide to creating tools
- [AI Tool Creation Prompts](./docs/AI_TOOL_CREATION_PROMPTS.md) - Optimized prompts for AI-assisted tool creation

### Integration Guides
- [Claude Desktop Integration](./docs/CLAUDE_DESKTOP_INTEGRATION.md) - Connect NexusHub to Claude Desktop
- [Claude CLI Integration](./docs/CLAUDE_CLI_INTEGRATION.md) - Use NexusHub with Claude CLI

### MCP Resources
- [Model Context Protocol Official Site](https://modelcontextprotocol.io)
- [MCP Quickstart for Claude Desktop Users](https://modelcontextprotocol.io/quickstart/user#for-claude-desktop-users)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)

For complete documentation, visit the [NexusHub Wiki](https://github.com/webdevtodayjason/NexusHub/wiki).

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Author

[Jason Brashear](https://github.com/webdevtodayjason)

## 🙏 Acknowledgments

- [Claude AI](https://claude.ai/) - For the amazing AI capabilities
- [Model Context Protocol](https://github.com/anthropics/anthropic-tools) - For the protocol specification
- [Protocol Design System](https://protocol.tailwindui.com/) - For the modern UI design language
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/webdevtodayjason">Jason Brashear</a></sub>
</div>
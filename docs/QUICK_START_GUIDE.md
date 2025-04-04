# NexusHub Quick Start Guide

This guide provides a fast-track to getting started with adding new tools to NexusHub MCP Server. Follow these steps to quickly extend NexusHub with your own tools.

## Getting Started

### Prerequisites

- Basic understanding of JavaScript/Node.js
- NexusHub up and running
- Access to the NexusHub codebase

### Project Structure for Tools

The core files you'll be working with:

```
/nexushub/
└── src/
    └── mcp/
        └── tools/
            ├── index.js          # Tool registry
            ├── handler.js        # Tool request handler
            └── your-tools.js     # Your new tool module
```

## 5-Minute Tool Creation

Follow these steps to add a new tool in under 5 minutes:

### 1. Create Your Tool Module

Create a new file or add to an existing one in the `src/mcp/tools/` directory:

```javascript
// src/mcp/tools/quick-tools.js

// Define your tool
export function getToolDefinitions() {
  return {
    quick_hello: {
      name: 'quick_hello',
      description: 'A simple greeting tool that says hello',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name to greet'
          }
        },
        required: ['name']
      }
    }
  };
}

// Implement your tool
export async function quickHello(name) {
  return {
    message: `Hello, ${name}! Welcome to NexusHub.`
  };
}
```

### 2. Register Your Tool

Add your tool to the tool registry in `src/mcp/tools/index.js`:

```javascript
// Add this import
import * as quickTools from './quick-tools.js';

export async function getTools() {
  try {
    const allTools = [
      // Existing tools...
      
      // Add your new tools
      ...Object.values(quickTools.getToolDefinitions()),
    ];
    
    return allTools;
  } catch (error) {
    // Error handling
  }
}
```

### 3. Add Tool Handler

Update the handler in `src/mcp/tools/handler.js`:

```javascript
// Add this import
import * as quickTools from './quick-tools.js';

export async function handleToolCall(toolName, params) {
  try {
    switch (toolName) {
      // Existing tool cases...
      
      // Add your new tool
      case 'quick_hello':
        return await quickTools.quickHello(params.name);
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    // Error handling
  }
}
```

### 4. Restart NexusHub

Restart the NexusHub server to load your new tool:

```bash
npm run dev
```

### 5. Test Your Tool

You can test your tool using Claude Desktop or directly:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call/quick_hello","params":{"name":"World"}}' | npm run stdio
```

Congratulations! You've just created a new NexusHub tool.

## Common Tool Templates

Here are some templates for common types of tools:

### API Integration Tool

```javascript
export function getToolDefinitions() {
  return {
    api_fetch_data: {
      name: 'api_fetch_data',
      description: 'Fetches data from an external API',
      inputSchema: {
        type: 'object',
        properties: {
          endpoint: {
            type: 'string',
            description: 'API endpoint to call'
          },
          params: {
            type: 'object',
            description: 'Query parameters for the API call'
          }
        },
        required: ['endpoint']
      }
    }
  };
}

export async function apiFetchData(endpoint, params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}
```

### File Operation Tool

```javascript
import fs from 'fs/promises';
import path from 'path';

export function getToolDefinitions() {
  return {
    file_append: {
      name: 'file_append',
      description: 'Appends content to a file',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: {
            type: 'string',
            description: 'Path to the file'
          },
          content: {
            type: 'string',
            description: 'Content to append'
          }
        },
        required: ['filePath', 'content']
      }
    }
  };
}

export async function fileAppend(filePath, content) {
  try {
    // Secure the file path
    const basePath = process.env.SECURE_FILES_BASE_PATH || './data';
    const securePath = path.resolve(basePath, filePath);
    
    // Ensure path is within allowed directory
    if (!securePath.startsWith(path.resolve(basePath))) {
      throw new Error('Access denied: Path is outside the allowed directory');
    }
    
    // Append to file
    await fs.appendFile(securePath, content);
    
    return {
      success: true,
      message: `Content appended to ${filePath}`,
      filePath: securePath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Database Query Tool

```javascript
import { getDatabase } from '../../database/index.js';

export function getToolDefinitions() {
  return {
    db_count_records: {
      name: 'db_count_records',
      description: 'Counts records in a table with optional filters',
      inputSchema: {
        type: 'object',
        properties: {
          table: {
            type: 'string',
            description: 'Table name'
          },
          where: {
            type: 'string',
            description: 'WHERE clause (without the WHERE keyword)'
          }
        },
        required: ['table']
      }
    }
  };
}

export async function dbCountRecords(table, where = '') {
  try {
    const db = getDatabase();
    
    // Sanitize table name (simple approach)
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      throw new Error('Invalid table name');
    }
    
    // Construct query
    let query = `SELECT COUNT(*) as count FROM ${table}`;
    if (where) {
      query += ` WHERE ${where}`;
    }
    
    // Execute query
    const result = db.prepare(query).get();
    
    return {
      success: true,
      count: result.count
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

## Next Steps

- For more advanced tool development, see the [Tool Development Guide](./TOOL_DEVELOPMENT_GUIDE.md)
- For AI-assisted tool creation, check out the [AI Tool Creation Prompts](./AI_TOOL_CREATION_PROMPTS.md)
- Refer to the [NexusHub Documentation](../README.md) for overall architecture

## Troubleshooting

### Common Issues

1. **Tool not appearing in tools/list**
   - Check that you've registered it in `index.js`
   - Verify tool name matches exactly in all locations
   - Restart the NexusHub server

2. **Error when calling tool**
   - Check parameter names match between definition and implementation
   - Ensure required parameters are being provided
   - Check the logs for detailed error information

3. **Security or permission errors**
   - Ensure file paths are properly secured
   - Check API keys and environment variables
   - Verify database access permissions

For more detailed information, refer to the [Troubleshooting Guide](./TOOL_DEVELOPMENT_GUIDE.md#troubleshooting).

---

Happy building with NexusHub!

## Additional Resources

Learn more about the Model Context Protocol and Claude integration:

- [Model Context Protocol Official Site](https://modelcontextprotocol.io)
- [MCP Quickstart for Claude Desktop Users](https://modelcontextprotocol.io/quickstart/user#for-claude-desktop-users)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)
- [Claude API Documentation](https://docs.anthropic.com)
# NexusHub Tool Development Guide

This comprehensive guide explains how to extend NexusHub with new tools. Whether you're adding simple utilities or complex integrations, this document will walk you through the process with examples and best practices.

## Table of Contents

1. [Understanding the NexusHub Tool Architecture](#understanding-the-nexushub-tool-architecture)
2. [Tool Creation Workflow](#tool-creation-workflow)
3. [Tool Definition Structure](#tool-definition-structure)
4. [Step-by-Step Tool Creation](#step-by-step-tool-creation)
5. [Testing Your Tool](#testing-your-tool)
6. [Common Tool Patterns](#common-tool-patterns)
7. [Prompts for AI Tool Creation](#prompts-for-ai-tool-creation)
8. [Advanced Tool Development](#advanced-tool-development)
9. [Troubleshooting](#troubleshooting)

## Understanding the NexusHub Tool Architecture

NexusHub follows the Model Context Protocol (MCP) which allows AI models like Claude to interact with external tools. Each tool in NexusHub consists of:

1. **Tool Definition**: A JSON schema describing the tool's name, purpose, and parameters
2. **Tool Implementation**: The JavaScript function that executes when the tool is called
3. **Tool Registration**: Code that adds the tool to the NexusHub registry

The architecture is designed to be modular and extensible, making it easy to add new capabilities.

## Tool Creation Workflow

The high-level workflow for adding a new tool to NexusHub:

1. **Plan Your Tool**: Decide what functionality you want to add
2. **Create a Tool Module**: Add a new file or extend an existing one
3. **Define the Tool Schema**: Create the JSON schema for your tool
4. **Implement the Tool Function**: Write the code that executes when called
5. **Register the Tool**: Add it to the tool registry
6. **Test Your Tool**: Verify it works correctly

## Tool Definition Structure

Every tool requires a definition with this structure:

```javascript
{
  name: 'tool_name',            // Unique identifier, use snake_case
  description: 'What the tool does', // Clear, concise description
  inputSchema: {                // Parameters the tool accepts
    type: 'object',
    properties: {
      paramName: {
        type: 'string',         // Parameter type (string, number, boolean, array, object)
        description: 'Parameter description'
      },
      // Additional parameters...
    },
    required: ['paramName']     // List of required parameters
  }
}
```

## Step-by-Step Tool Creation

### 1. Create or Choose a Tool Module

Tools are organized by category. You can either:
- Add to an existing module (e.g., `src/mcp/tools/filesystem-tools.js`)
- Create a new module for a new category (e.g., `src/mcp/tools/my-category-tools.js`)

### 2. Define Your Tool

In your module, create a `getToolDefinitions` function that returns your tool definitions:

```javascript
// src/mcp/tools/my-category-tools.js
export function getToolDefinitions() {
  return {
    my_new_tool: {
      name: 'my_new_tool',
      description: 'Performs a specific function with the provided parameters',
      inputSchema: {
        type: 'object',
        properties: {
          inputText: {
            type: 'string',
            description: 'The text to process'
          },
          option: {
            type: 'boolean',
            description: 'Optional flag to enable additional processing',
            default: false
          }
        },
        required: ['inputText']
      }
    }
    // Add more tools in this category if needed
  };
}
```

### 3. Implement Your Tool Function

In the same file, implement the function that will be executed when the tool is called:

```javascript
// Implementation for my_new_tool
export async function myNewTool(inputText, option = false) {
  try {
    // Tool implementation
    let result = `Processed: ${inputText}`;
    
    if (option) {
      result += ' (with additional processing)';
    }
    
    return { 
      success: true,
      result: result
    };
  } catch (error) {
    // Error handling
    return {
      success: false,
      error: error.message
    };
  }
}
```

### 4. Register Your Tool in the Registry

Update the main tools index file to include your new module:

```javascript
// src/mcp/tools/index.js

// Add this import
import * as myCategoryTools from './my-category-tools.js';

export async function getTools() {
  try {
    const allTools = [
      // Existing tool categories...
      
      // Add your new tools
      ...Object.values(myCategoryTools.getToolDefinitions()),
    ];
    
    return allTools;
  } catch (error) {
    // Error handling
  }
}
```

### 5. Add the Tool Handler

Update the tool handler to handle calls to your tool:

```javascript
// src/mcp/tools/handler.js

// Add this import
import * as myCategoryTools from './my-category-tools.js';

export async function handleToolCall(toolName, params) {
  try {
    switch (toolName) {
      // Existing tool cases...
      
      // Add your new tool
      case 'my_new_tool':
        return await myCategoryTools.myNewTool(params.inputText, params.option);
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    // Error handling
  }
}
```

## Testing Your Tool

### 1. Manual Testing

Test your tool using the STDIO interface:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call/my_new_tool","params":{"inputText":"Hello world"}}' | npm run stdio
```

### 2. Using Claude Desktop

1. Make sure NexusHub is running
2. Connect Claude Desktop to NexusHub
3. Ask Claude to use your new tool:

```
Please use the my_new_tool to process the text "Hello world".
```

### 3. Unit Testing

Create tests for your tool in the appropriate test file:

```javascript
// test/tools/my-category-tools.test.js
import { expect } from 'chai';
import { myNewTool } from '../../src/mcp/tools/my-category-tools.js';

describe('My Category Tools', () => {
  describe('myNewTool', () => {
    it('should process the input text correctly', async () => {
      const result = await myNewTool('Hello world');
      expect(result.success).to.be.true;
      expect(result.result).to.equal('Processed: Hello world');
    });
    
    it('should handle the option parameter', async () => {
      const result = await myNewTool('Hello world', true);
      expect(result.success).to.be.true;
      expect(result.result).to.equal('Processed: Hello world (with additional processing)');
    });
  });
});
```

## Common Tool Patterns

### 1. API Integration Tool

```javascript
export async function apiTool(query, apiKey = process.env.DEFAULT_API_KEY) {
  try {
    const response = await fetch(`https://api.example.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, results: data.results };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 2. File Processing Tool

```javascript
import fs from 'fs/promises';
import path from 'path';

export async function fileProcessingTool(filePath, options = {}) {
  try {
    // Secure the file path
    const securePath = path.resolve(process.env.SECURE_FILES_BASE_PATH, filePath);
    
    // Check if file exists
    await fs.access(securePath);
    
    // Read and process the file
    const contents = await fs.readFile(securePath, 'utf8');
    const processed = processContents(contents, options);
    
    return { success: true, result: processed };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function processContents(contents, options) {
  // Implementation of your processing logic
  return contents.toUpperCase();
}
```

### 3. Database Query Tool

```javascript
import { getDatabase } from '../../database/index.js';

export async function databaseQueryTool(query, params = []) {
  try {
    const db = getDatabase();
    
    // Only allow read-only queries for security
    if (!/^SELECT\s/i.test(query)) {
      throw new Error('Only SELECT queries are allowed');
    }
    
    const results = db.prepare(query).all(params);
    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Prompts for AI Tool Creation

Use these prompts to help AI assistants create new tools for NexusHub:

### 1. Basic Tool Creation Prompt

```
Can you help me create a new tool for NexusHub called {tool_name} that {tool_purpose}?

I need:
1. The tool definition with a proper schema
2. The tool implementation function
3. The code to add to index.js and handler.js

The tool should accept these parameters:
- {param1}: {param1_description} ({param1_type})
- {param2}: {param2_description} ({param2_type})

The tool should return {expected_return_value}.
```

### 2. AI API Integration Tool Prompt

```
Please create a NexusHub tool that integrates with the {API_NAME} API. 

The tool should:
- Be named "{api_name}_query"
- Accept parameters for {main_functionality}
- Handle authentication with {auth_method}
- Process the API response to return {desired_output}

Include all necessary code for:
1. Tool definition
2. Tool implementation with proper error handling
3. Registration in index.js and handler.js
```

### 3. System Tool Integration Prompt

```
I need a NexusHub tool that integrates with {system_name} on the host system.

Tool requirements:
- Name: "{system_name}_{action}"
- Security: Ensure proper validation and sanitization
- Parameters: {list_of_parameters}
- Return data: {expected_return_format}

Please provide the complete implementation including:
1. Tool definition with detailed parameter descriptions
2. Implementation with proper error handling and security checks
3. Code for tool registration
```

### 4. Complex Data Processing Tool Prompt

```
I need a NexusHub tool for complex data processing that:
1. Takes input data from {source}
2. Processes it using {algorithm/method}
3. Returns the processed results in {format}

The tool should handle:
- Large datasets efficiently
- Various error conditions
- Input validation

Please provide the complete implementation with detailed comments explaining the processing logic.
```

## Advanced Tool Development

### Accessing Environment Variables

```javascript
// Access environment variables for configuration
const apiKey = process.env.MY_API_KEY;
const baseUrl = process.env.MY_SERVICE_URL || 'https://default-url.com';
```

### Tool Dependencies

If your tool depends on external npm packages:

1. Install the package:
```bash
npm install my-package
```

2. Import it in your tool module:
```javascript
import myPackage from 'my-package';
```

### Streaming Responses

For long-running operations, you can implement a streaming pattern:

```javascript
export async function streamingTool(query, callback) {
  const stream = getDataStream(query);
  
  stream.on('data', (chunk) => {
    // Send intermediate results
    callback({
      type: 'progress',
      data: chunk.toString()
    });
  });
  
  return new Promise((resolve, reject) => {
    let result = '';
    
    stream.on('data', (chunk) => {
      result += chunk.toString();
    });
    
    stream.on('end', () => {
      resolve({ success: true, result });
    });
    
    stream.on('error', (err) => {
      reject(err);
    });
  });
}
```

### File and Directory Management

For tools that work with files and directories:

```javascript
import fs from 'fs/promises';
import path from 'path';

// Safe path resolution
function getSecurePath(userPath) {
  const basePath = process.env.SECURE_FILES_BASE_PATH;
  const normalized = path.normalize(path.join(basePath, userPath));
  
  // Security check to prevent directory traversal
  if (!normalized.startsWith(basePath)) {
    throw new Error('Access denied: Path is outside the allowed directory');
  }
  
  return normalized;
}
```

## Troubleshooting

### Common Issues

1. **Tool not appearing in tools/list**
   - Check that you've correctly registered the tool in `index.js`
   - Verify that the tool name matches in all places
   - Restart the NexusHub server

2. **Parameters not being recognized**
   - Ensure parameter names match exactly between definition and implementation
   - Check for typos in the required array
   - Verify that the inputSchema is correctly formatted

3. **Tool returning errors**
   - Add better error handling with try/catch blocks
   - Add console.log statements for debugging
   - Check the server logs for more detailed error information

### Debugging Tips

1. Test your tool with explicit values before deployment

2. Use the following debug code in your tool:
```javascript
console.error('DEBUG:', { 
  toolName: 'my_new_tool',
  params: JSON.stringify(params),
  environment: process.env.NODE_ENV
});
```

3. Check logs for errors:
```bash
tail -f /tmp/nexushub-debug-*.log
```

---

## Example: Complete Weather API Tool

Here's a complete example of a weather API tool:

### Tool Module (`src/mcp/tools/weather-tools.js`):

```javascript
import fetch from 'node-fetch';

// Tool definitions
export function getToolDefinitions() {
  return {
    weather_forecast: {
      name: 'weather_forecast',
      description: 'Get the weather forecast for a specific location',
      inputSchema: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city or location to get weather for (e.g., "New York" or "London, UK")'
          },
          days: {
            type: 'number',
            description: 'Number of days for the forecast (1-7)',
            default: 3
          }
        },
        required: ['location']
      }
    }
  };
}

// Tool implementation
export async function weatherForecast(location, days = 3) {
  try {
    // Validate inputs
    if (!location || typeof location !== 'string') {
      throw new Error('A valid location is required');
    }
    
    days = Math.min(Math.max(1, days), 7); // Ensure days is between 1-7
    
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('Weather API key is not configured');
    }
    
    // Call the weather API
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=${days}&aqi=no&alerts=no`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format the response
    const forecast = data.forecast.forecastday.map(day => ({
      date: day.date,
      condition: day.day.condition.text,
      maxTemp: day.day.maxtemp_c,
      minTemp: day.day.mintemp_c,
      chanceOfRain: day.day.daily_chance_of_rain
    }));
    
    return {
      success: true,
      location: `${data.location.name}, ${data.location.country}`,
      forecast
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Index Registration (`src/mcp/tools/index.js`):

```javascript
import * as weatherTools from './weather-tools.js';

export async function getTools() {
  try {
    const allTools = [
      // Existing tools...
      
      // Add weather tools
      ...Object.values(weatherTools.getToolDefinitions()),
    ];
    
    return allTools;
  } catch (error) {
    // Error handling
  }
}
```

### Handler Registration (`src/mcp/tools/handler.js`):

```javascript
import * as weatherTools from './weather-tools.js';

export async function handleToolCall(toolName, params) {
  try {
    switch (toolName) {
      // Existing tools...
      
      // Weather tools
      case 'weather_forecast':
        return await weatherTools.weatherForecast(params.location, params.days);
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    // Error handling
  }
}
```

With this guide, you now have everything you need to extend NexusHub with powerful new tools. Happy building!

## Additional Resources

For more information about the Model Context Protocol and Claude integration:

- [Model Context Protocol Official Site](https://modelcontextprotocol.io)
- [MCP Quickstart for Claude Desktop Users](https://modelcontextprotocol.io/quickstart/user#for-claude-desktop-users)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)
- [Claude API Documentation](https://docs.anthropic.com)
// STDIO-based MCP server
import readline from 'readline';
import { stdioLog } from '../utils/logger.js';
import { getTools } from './tools/index.js';
import { handleToolCall } from './tools/handler.js';

// Set up the stdio server
export function setupStdioServer() {
  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  
  stdioLog('NexusHub MCP Server running on stdio');
  
  // Process lines from stdin
  rl.on('line', async (line) => {
    try {
      // Parse the JSON request
      const request = JSON.parse(line);
      stdioLog(`Received request: ${JSON.stringify(request)}`);
      
      // Process the request
      const response = await processRequest(request);
      
      // Send the response if there is one
      if (response) {
        console.log(JSON.stringify(response));
      }
    } catch (error) {
      stdioLog(`Error processing request: ${error.message}`);
      
      // Try to extract an ID from the line
      let id = null;
      try {
        const parsedLine = JSON.parse(line);
        id = parsedLine.id;
      } catch (e) {
        // Ignore parse errors
      }
      
      // Send an error response if we have an ID
      if (id !== null) {
        console.log(JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32000,
            message: `Error processing request: ${error.message}`
          }
        }));
      }
    }
  });
  
  // Handle process termination
  process.on('SIGTERM', () => {
    stdioLog('SIGTERM received, shutting down');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    stdioLog('SIGINT received, shutting down');
    process.exit(0);
  });
}

// Process a request from stdin
async function processRequest(request) {
  const { method, id } = request;
  
  // Handle different request types
  if (method === 'initialize') {
    return handleInitialize(request);
  } else if (method === 'tools/list') {
    return handleToolsList(request);
  } else if (method && method.startsWith('tools/call/')) {
    return handleToolCallRequest(request);
  } else if (method === 'notifications/initialized') {
    // This is a notification, no response needed
    return null;
  } else {
    // Method not found
    stdioLog(`Unsupported method: ${method}`);
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: 'Method not found'
      }
    };
  }
}

// Handle initialize request
function handleInitialize(request) {
  stdioLog('Handling initialize request');
  return {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: 'NexusHub MCP Server',
        version: '1.0.0'
      }
    }
  };
}

// Handle tools/list request
async function handleToolsList(request) {
  stdioLog('Handling tools/list request');
  try {
    const tools = await getTools();
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        tools
      }
    };
  } catch (error) {
    stdioLog(`Error getting tools: ${error.message}`);
    return {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32000,
        message: `Error getting tools: ${error.message}`
      }
    };
  }
}

// Handle tool call request
async function handleToolCallRequest(request) {
  const toolName = request.method.split('/').pop();
  stdioLog(`Handling tool call: ${toolName}`);
  
  try {
    // Support both namespaced and non-namespaced tool calls
    const result = await handleToolCall(toolName, request.params);
    return {
      jsonrpc: '2.0',
      id: request.id,
      result
    };
  } catch (error) {
    stdioLog(`Error calling tool ${toolName}: ${error.message}`);
    return {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32000,
        message: `Error calling tool ${toolName}: ${error.message}`
      }
    };
  }
}
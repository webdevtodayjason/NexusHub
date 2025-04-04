#!/usr/bin/env node
/**
 * NexusHub MCP STDIO Adapter
 * 
 * This script provides a standalone MCP server over STDIO
 * without using the HTTP server. It should be run through
 * the stdio-wrapper.js script to ensure clean JSON communication.
 */

// IMPORTANT: Make these changes before any other code runs
// This prevents any startup messages from breaking JSON protocol
process.on('uncaughtException', (err) => {
  process.stderr.write(`UNCAUGHT EXCEPTION: ${err.stack || err.message}\n`);
  // Don't exit - just log the error
});

// Override all console methods to use stderr
console.log = (...args) => process.stderr.write(`[log] ${args.join(' ')}\n`);
console.info = (...args) => process.stderr.write(`[info] ${args.join(' ')}\n`);
console.warn = (...args) => process.stderr.write(`[warn] ${args.join(' ')}\n`);
console.error = (...args) => process.stderr.write(`[error] ${args.join(' ')}\n`);
console.debug = (...args) => process.stderr.write(`[debug] ${args.join(' ')}\n`);

// Notify that we've started
process.stderr.write('NexusHub MCP STDIO Adapter starting...\n');

// Now we can safely import modules
import readline from 'readline';
import { getTools } from './tools/index.js';
import { handleToolCall } from './tools/handler.js';
import { initDatabase } from '../database/index.js';

// Initialize the database
process.stderr.write('Initializing database...\n');
try {
  await initDatabase();
  process.stderr.write('Database initialized successfully\n');
} catch (err) {
  process.stderr.write(`Database initialization error: ${err.message}\n`);
}

// Set up readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Process requests from stdin
rl.on('line', async (line) => {
  try {
    // Skip empty lines
    if (!line.trim()) return;
    
    // Log received line to stderr for debugging
    process.stderr.write(`Received line (${line.length} bytes)\n`);
    
    // Parse the request
    const request = JSON.parse(line);
    process.stderr.write(`Processing MCP request: ${request.method || 'unknown method'}\n`);

    // Handle the request
    const response = await processRequest(request);
    
    // Send the response if there is one
    if (response) {
      // Serialize response first to catch any JSON errors before writing to stdout
      try {
        const responseJson = JSON.stringify(response);
        // Only write to stdout for valid JSON responses
        process.stdout.write(responseJson + '\n');
        process.stderr.write(`Sent response for ${request.method || 'unknown method'}\n`);
      } catch (jsonError) {
        process.stderr.write(`Error serializing response: ${jsonError.message}\n`);
      }
    }
  } catch (error) {
    process.stderr.write(`Error processing MCP request: ${error.message}\n`);
    
    // Try to extract ID if we can
    let id = null;
    try {
      id = JSON.parse(line).id;
    } catch (e) {
      process.stderr.write(`Could not parse request JSON: ${e.message}\n`);
      // Don't write anything to stdout for unparseable requests
      return;
    }
    
    // Send error response
    if (id !== null) {
      const errorResponse = {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32000,
          message: `Error processing request: ${error.message}`
        }
      };
      
      try {
        // Serialize first to catch any JSON errors
        const errorJson = JSON.stringify(errorResponse);
        process.stdout.write(errorJson + '\n');
      } catch (jsonError) {
        process.stderr.write(`Error serializing error response: ${jsonError.message}\n`);
      }
    }
  }
});

// Process a request
async function processRequest(request) {
  const { method, id } = request;
  
  // Handle different request types
  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
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
  } else if (method === 'tools/list') {
    const tools = await getTools();
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools
      }
    };
  } else if (method && method.startsWith('tools/call/')) {
    const toolName = method.split('/').pop();
    try {
      const result = await handleToolCall(toolName, request.params);
      return {
        jsonrpc: '2.0',
        id,
        result
      };
    } catch (error) {
      process.stderr.write(`Error calling tool ${toolName}: ${error.message}\n`);
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32000,
          message: `Error calling tool ${toolName}: ${error.message}`
        }
      };
    }
  } else if (method === 'notifications/initialized') {
    // This is a notification, no response needed
    process.stderr.write(`Received initialization notification\n`);
    return null;
  } else {
    // Method not found
    process.stderr.write(`Unsupported method: ${method}\n`);
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

// Log to stderr that we're ready to process requests
process.stderr.write('NexusHub MCP STDIO Adapter running and ready for requests\n');
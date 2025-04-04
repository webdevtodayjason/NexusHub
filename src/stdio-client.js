#!/usr/bin/env node
/**
 * NexusHub MCP STDIO Client
 * 
 * This script provides a bridge between Claude Desktop and the NexusHub MCP server
 * using the Model Context Protocol over stdio.
 */

import readline from 'readline';
import { stdioLog } from './utils/logger.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const MCP_HTTP_URL = 'http://localhost:8001/mcp';

// Set up readline interface for stdio
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

/**
 * Send a request to the HTTP MCP server
 * 
 * @param {string} endpoint - The endpoint path
 * @param {string} method - The MCP method
 * @param {object} params - The parameters for the request
 * @param {string|number} id - The request ID
 * @returns {Promise<object>} - The response from the server
 */
async function sendRequest(endpoint, method, params, id) {
  try {
    const url = new URL(endpoint, MCP_HTTP_URL);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params: params || {}
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    stdioLog(`Error sending request to ${endpoint}: ${error.message}`);
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: `Error sending request: ${error.message}`
      }
    };
  }
}

/**
 * Fetch the list of available tools from the HTTP MCP server
 * 
 * @returns {Promise<Array>} - The list of tools
 */
async function fetchTools() {
  try {
    const response = await sendRequest('/tools/list', 'tools/list', {}, 'tools-fetch');
    return response.result?.tools || [];
  } catch (error) {
    stdioLog(`Error fetching tools: ${error.message}`);
    return [];
  }
}

/**
 * Handle initialize request
 * 
 * @param {object} request - The initialize request
 * @returns {object} - The response
 */
async function handleInitialize(request) {
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

/**
 * Handle tools/list request
 * 
 * @param {object} request - The tools/list request
 * @returns {object} - The response with the list of tools
 */
async function handleToolsList(request) {
  stdioLog('Handling tools/list request');
  
  const tools = await fetchTools();
  stdioLog(`Fetched ${tools.length} tools from HTTP server`);
  
  return {
    jsonrpc: '2.0',
    id: request.id,
    result: {
      tools
    }
  };
}

/**
 * Handle tool call
 * 
 * @param {object} request - The tool call request
 * @returns {object} - The response from the tool
 */
async function handleToolCall(request) {
  const method = request.method;
  const toolName = method.split('/').pop();
  
  stdioLog(`Handling tool call: ${toolName}`);
  
  try {
    const response = await sendRequest(
      `/tools/call/${toolName}`,
      method,
      request.params,
      request.id
    );
    
    return response;
  } catch (error) {
    stdioLog(`Error calling tool ${toolName}: ${error.message}`);
    return {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32000,
        message: `Error calling tool: ${error.message}`
      }
    };
  }
}

/**
 * Process incoming request
 * 
 * @param {object} request - The request object
 * @returns {Promise<object|null>} - The response object or null for notifications
 */
async function processRequest(request) {
  try {
    const { method, id } = request;
    
    // Handle different request types
    if (method === 'initialize') {
      return await handleInitialize(request);
    } else if (method === 'tools/list') {
      return await handleToolsList(request);
    } else if (method && method.startsWith('tools/call/')) {
      return await handleToolCall(request);
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
  } catch (error) {
    stdioLog(`Error processing request: ${error.message}`);
    return {
      jsonrpc: '2.0',
      id: request.id,
      error: {
        code: -32000,
        message: `Internal error: ${error.message}`
      }
    };
  }
}

// Main entry point
async function main() {
  stdioLog('NexusHub MCP STDIO Client starting');
  
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
      stdioLog(`Error handling message: ${error.message}`);
      
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
  
  stdioLog('NexusHub MCP STDIO Client running');
}

// Start the client
main().catch(error => {
  stdioLog(`Fatal error: ${error.message}`);
  process.exit(1);
});
// Tool definitions for NexusHub MCP Server
import { logger } from '../../utils/logger.js';
import * as fileSystemTools from './filesystem-tools.js';
import * as databaseTools from './database-tools.js';
import * as dockerTools from './docker-tools.js';
import * as searchTools from './search-tools.js';
import * as vectorTools from './vector-tools.js';

// Add Nexushub namespace to tool name
function addNamespace(tool) {
  return {
    ...tool,
    name: `mcp__Nexushub__${tool.name}`
  };
}

// Get all tools
export async function getTools() {
  try {
    // Combine all tool definitions and add namespace
    const allTools = [
      // Latest libraries tool
      addNamespace({
        name: 'get_latest_libs',
        description: 'Returns a JSON object with latest secure/stable package versions for Python.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }),
      
      // URL fetching tool
      addNamespace({
        name: 'fetch_url',
        description: 'Fetches content from a given URL.',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to fetch'
            },
            timeout: {
              type: 'number',
              description: 'Timeout in seconds (default: 30)'
            }
          },
          required: ['url']
        }
      }),
      
      // Filesystem tools
      ...Object.values(fileSystemTools.getToolDefinitions()).map(addNamespace),
      
      // Database tools
      ...Object.values(databaseTools.getToolDefinitions()).map(addNamespace),
      
      // Docker tools
      ...Object.values(dockerTools.getToolDefinitions()).map(addNamespace),
      
      // Search tools
      ...Object.values(searchTools.getToolDefinitions()).map(addNamespace),
      
      // Vector store tools
      ...Object.values(vectorTools.getToolDefinitions()).map(addNamespace)
    ];
    
    logger.debug(`Registered ${allTools.length} tools with Nexushub namespace`);
    return allTools;
  } catch (error) {
    logger.error(`Error getting tools: ${error.message}`);
    throw error;
  }
}
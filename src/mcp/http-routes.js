// HTTP routes for MCP Server
import express from 'express';
import { logger } from '../utils/logger.js';
import { getTools } from './tools/index.js';
import { handleToolCall } from './tools/handler.js';

// Set up MCP HTTP routes
export function setupMcpHttpRoutes(app) {
  const router = express.Router();
  
  // MCP event source endpoint
  router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send initial event to establish connection
    res.write('event: endpoint\n\n');
    
    // Close connection after a timeout
    setTimeout(() => {
      res.end();
    }, 2000);
  });
  
  // MCP initialize endpoint
  router.post('/initialize', (req, res) => {
    logger.debug('HTTP initialize request received');
    res.json({
      jsonrpc: '2.0',
      id: req.body.id,
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
    });
  });
  
  // MCP tools/list endpoint
  router.post('/tools/list', async (req, res) => {
    logger.debug('HTTP tools/list request received');
    try {
      const tools = await getTools();
      res.json({
        jsonrpc: '2.0',
        id: req.body.id,
        result: {
          tools
        }
      });
    } catch (error) {
      logger.error(`Error getting tools: ${error.message}`);
      res.status(500).json({
        jsonrpc: '2.0',
        id: req.body.id,
        error: {
          code: -32000,
          message: `Error getting tools: ${error.message}`
        }
      });
    }
  });
  
  // MCP tools/call endpoint
  router.post('/tools/call/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const { params } = req.body;
    
    logger.debug(`HTTP tools/call/${toolName} request received with params: ${JSON.stringify(params)}`);
    
    try {
      const result = await handleToolCall(toolName, params);
      res.json({
        jsonrpc: '2.0',
        id: req.body.id,
        result
      });
    } catch (error) {
      logger.error(`Error calling tool ${toolName}: ${error.message}`);
      res.status(500).json({
        jsonrpc: '2.0',
        id: req.body.id,
        error: {
          code: -32000,
          message: `Error calling tool ${toolName}: ${error.message}`
        }
      });
    }
  });
  
  // Mount router at /mcp path
  app.use('/mcp', router);
  
  logger.info('MCP HTTP routes set up successfully');
}
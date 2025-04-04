#!/usr/bin/env node
// Main entry point for the NexusHub MCP Server
// Supports both HTTP and stdio interfaces

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { setupMcpHttpRoutes } from './mcp/http-routes.js';
import { setupDashboardRoutes } from './dashboard/routes.js';
import { initDatabase } from './database/index.js';
import { logger } from './utils/logger.js';
import { setupStdioServer } from './mcp/stdio-server.js';

// Load environment variables
dotenv.config();

// Determine if we're in stdio mode
const isStdioMode = process.argv.includes('--stdio');

// Get current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the server
async function startServer() {
  try {
    // Initialize the database
    await initDatabase();
    
    // If we're in stdio mode, start the stdio server
    if (isStdioMode) {
      logger.info('Starting NexusHub MCP Server in stdio mode');
      setupStdioServer();
      return;
    }
    
    // Otherwise start the HTTP server
    const app = express();
    const PORT = process.env.PORT || 8001;
    
    // Apply middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Logging
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }
    
    // Serve static files from public directory
    app.use(express.static(join(__dirname, '../public')));
    
    // Set up routes
    setupMcpHttpRoutes(app);
    setupDashboardRoutes(app);
    
    // Root endpoint
    app.get('/', (req, res) => {
      res.json({ message: 'NexusHub MCP Server is running' });
    });
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      logger.error(`Error: ${err.message}`);
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
      });
    });
    
    // Start HTTP server
    const server = createServer(app);
    server.listen(PORT, () => {
      logger.info(`NexusHub MCP Server running on http://localhost:${PORT}`);
    });
    
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

// Start the server
startServer();
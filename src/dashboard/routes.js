// Dashboard routes for NexusHub MCP Server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getDb, getAll, runQuery } from '../database/index.js';
import { logger } from '../utils/logger.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up dashboard routes
export function setupDashboardRoutes(app) {
  const router = express.Router();
  
  // Dashboard root
  router.get('/', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.sendFile(path.join(__dirname, '../../public/dashboard.html'));
  });
  
  // API status
  router.get('/api/status', (req, res) => {
    res.json({
      status: 'online',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });
  
  // Get API keys
  router.get('/api/keys', async (req, res) => {
    try {
      const keys = await getAll('SELECT id, service FROM api_keys');
      res.json({ keys });
    } catch (error) {
      logger.error(`Error fetching API keys: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch API keys' });
    }
  });
  
  // Update API key
  router.post('/api/keys', async (req, res) => {
    try {
      const { service, key } = req.body;
      
      if (!service || !key) {
        return res.status(400).json({ error: 'Service and key are required' });
      }
      
      // Check if service exists
      const existing = await getAll('SELECT * FROM api_keys WHERE service = ?', [service]);
      
      if (existing && existing.length > 0) {
        // Update existing key
        await runQuery(
          'UPDATE api_keys SET key = ?, updated_at = CURRENT_TIMESTAMP WHERE service = ?',
          [key, service]
        );
      } else {
        // Insert new key
        await runQuery(
          'INSERT INTO api_keys (service, key, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [service, key]
        );
      }
      
      res.json({ success: true, message: `API key for ${service} updated` });
    } catch (error) {
      logger.error(`Error updating API key: ${error.message}`);
      res.status(500).json({ error: 'Failed to update API key' });
    }
  });
  
  // Get all projects
  router.get('/api/projects', async (req, res) => {
    try {
      logger.debug('Fetching all projects');
      const projects = await getAll('SELECT * FROM projects');
      res.json({ projects });
    } catch (error) {
      logger.error(`Error fetching projects: ${error.message}`);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });
  
  // Add a new project
  router.post('/api/projects', async (req, res) => {
    try {
      const { name, description, path } = req.body;
      
      if (!name || !path) {
        return res.status(400).json({ error: 'Name and path are required' });
      }
      
      const result = await runQuery(
        'INSERT INTO projects (name, description, path, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [name, description, path]
      );
      
      res.json({
        success: true,
        message: 'Project added successfully',
        project: {
          id: result.lastID,
          name,
          description,
          path
        }
      });
    } catch (error) {
      logger.error(`Error adding project: ${error.message}`);
      res.status(500).json({ error: 'Failed to add project' });
    }
  });
  
  // Vector document actions
  router.post('/api/vectors/ingest', async (req, res) => {
    try {
      const { source_dir } = req.body;
      
      // Call the ingest function (placeholder)
      res.json({
        success: true,
        message: `Started ingestion from ${source_dir || 'default directory'}`,
        job_id: `job-${Date.now()}`
      });
    } catch (error) {
      logger.error(`Error starting ingestion: ${error.message}`);
      res.status(500).json({ error: 'Failed to start ingestion' });
    }
  });
  
  // Mount router at /dashboard path
  app.use('/dashboard', router);
  
  logger.info('Dashboard routes set up successfully');
}
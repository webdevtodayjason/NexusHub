// Dashboard routes for NexusHub MCP Server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { db } from '../database/index.js';
import { logger } from '../utils/logger.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up dashboard routes
export function setupDashboardRoutes(app) {
  const router = express.Router();
  
  // Dashboard home
  router.get('/', (req, res) => {
    res.redirect('/dashboard/');
  });
  
  // Dashboard root
  router.get('/', (req, res) => {
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
      const keys = await db('api_keys').select('id', 'service');
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
      const existing = await db('api_keys').where({ service }).first();
      
      if (existing) {
        // Update existing key
        await db('api_keys').where({ service }).update({
          key,
          updated_at: new Date()
        });
      } else {
        // Insert new key
        await db('api_keys').insert({
          service,
          key,
          created_at: new Date(),
          updated_at: new Date()
        });
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
      const projects = await db('projects').select('*');
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
      
      const [id] = await db('projects').insert({
        name,
        description,
        path,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      res.json({
        success: true,
        message: 'Project added successfully',
        project: {
          id,
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
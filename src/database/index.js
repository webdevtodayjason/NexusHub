// Database setup for NexusHub MCP Server
import knex from 'knex';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database path from environment or use default
const dbPath = process.env.DATABASE_PATH || '../data/mcp_server.db';
const absoluteDbPath = join(__dirname, '../../', dbPath);

// Create database connection
export const db = knex({
  client: 'better-sqlite3',
  connection: {
    filename: absoluteDbPath
  },
  useNullAsDefault: true
});

// Initialize database
export async function initDatabase() {
  try {
    logger.info(`Connecting to SQLite database at ${absoluteDbPath}`);
    
    // Check if tables exist, if not create them
    const tablesExist = await db.schema.hasTable('api_keys');
    
    if (!tablesExist) {
      logger.info('Creating database tables...');
      
      // API Keys table
      await db.schema.createTable('api_keys', (table) => {
        table.increments('id').primary();
        table.string('service').notNullable().unique();
        table.string('key').notNullable();
        table.timestamps(true, true);
      });
      
      // Projects table
      await db.schema.createTable('projects', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('description');
        table.string('path').notNullable();
        table.timestamps(true, true);
      });
      
      // Vector documents table
      await db.schema.createTable('vector_documents', (table) => {
        table.increments('id').primary();
        table.string('document_id').notNullable().unique();
        table.string('source_path').notNullable();
        table.text('content').notNullable();
        table.string('title').notNullable();
        table.timestamps(true, true);
      });
      
      logger.info('Database tables created successfully');
    } else {
      logger.info('Database already initialized');
    }
    
    return db;
  } catch (error) {
    logger.error(`Database initialization error: ${error.message}`);
    throw error;
  }
}

// Export a function to close the database connection
export function closeDatabase() {
  return db.destroy();
}
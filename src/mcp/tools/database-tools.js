// Database tools
import { db } from '../../database/index.js';
import { logger } from '../../utils/logger.js';

// Tool definitions
export function getToolDefinitions() {
  return {
    db_execute_query: {
      name: 'db_execute_query',
      description: 'Executes a read-only SQL query against the database.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The SQL query to execute'
          },
          params: {
            type: 'object',
            description: 'Query parameters'
          }
        },
        required: ['query']
      }
    },
    db_list_tables: {
      name: 'db_list_tables',
      description: 'Lists all tables in the database.',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    db_describe_table: {
      name: 'db_describe_table',
      description: 'Describes the columns of a specific table.',
      inputSchema: {
        type: 'object',
        properties: {
          table_name: {
            type: 'string',
            description: 'The name of the table to describe'
          }
        },
        required: ['table_name']
      }
    },
    db_insert_data: {
      name: 'db_insert_data',
      description: 'Inserts a single row into the specified table.',
      inputSchema: {
        type: 'object',
        properties: {
          table_name: {
            type: 'string',
            description: 'The name of the table'
          },
          data: {
            type: 'object',
            description: 'The data to insert (column/value pairs)'
          }
        },
        required: ['table_name', 'data']
      }
    }
  };
}

// Execute read-only query
export async function executeQuery(query, params = {}) {
  try {
    // Security check - only allow SELECT queries
    if (!query.trim().toLowerCase().startsWith('select')) {
      throw new Error('Only SELECT queries are allowed');
    }
    
    const results = await db.raw(query, params);
    return results;
  } catch (error) {
    logger.error(`Error executing query: ${error.message}`);
    throw new Error(`Failed to execute query: ${error.message}`);
  }
}

// List tables
export async function listTables() {
  try {
    // Query list of tables
    const tables = await db.raw(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );
    
    return tables.map(table => table.name);
  } catch (error) {
    logger.error(`Error listing tables: ${error.message}`);
    throw new Error(`Failed to list tables: ${error.message}`);
  }
}

// Describe table
export async function describeTable(tableName) {
  try {
    // Query table info
    const columns = await db.raw(`PRAGMA table_info(${tableName});`);
    
    return columns.map(column => ({
      name: column.name,
      type: column.type,
      notnull: Boolean(column.notnull),
      dflt_value: column.dflt_value,
      pk: Boolean(column.pk)
    }));
  } catch (error) {
    logger.error(`Error describing table: ${error.message}`);
    throw new Error(`Failed to describe table: ${error.message}`);
  }
}

// Insert data
export async function insertData(tableName, data) {
  try {
    // Insert data
    const [id] = await db(tableName).insert(data);
    
    return {
      success: true,
      id,
      message: `Data inserted into ${tableName} successfully`
    };
  } catch (error) {
    logger.error(`Error inserting data: ${error.message}`);
    throw new Error(`Failed to insert data: ${error.message}`);
  }
}
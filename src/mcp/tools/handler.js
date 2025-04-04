// Tool handler for NexusHub MCP Server
import { logger } from '../../utils/logger.js';
import * as fileSystemTools from './filesystem-tools.js';
import * as databaseTools from './database-tools.js';
import * as dockerTools from './docker-tools.js';
import * as searchTools from './search-tools.js';
import * as vectorTools from './vector-tools.js';
import { getLatestLibs } from './general-tools.js';
import { fetchUrl } from './general-tools.js';

// Handle tool calls
export async function handleToolCall(toolName, params) {
  logger.debug(`Handling tool call: ${toolName} with params: ${JSON.stringify(params)}`);
  
  try {
    // Match tool name to implementation
    switch (toolName) {
      // General tools
      case 'get_latest_libs':
        return await getLatestLibs();
      case 'fetch_url':
        return await fetchUrl(params.url, params.timeout);
        
      // Filesystem tools
      case 'fs_list_files':
        return await fileSystemTools.listFiles(params.path);
      case 'fs_read_file':
        return await fileSystemTools.readFile(params.path);
      case 'fs_write_file':
        return await fileSystemTools.writeFile(params.path, params.content);
        
      // Database tools
      case 'db_execute_query':
        return await databaseTools.executeQuery(params.query, params.params);
      case 'db_list_tables':
        return await databaseTools.listTables();
      case 'db_describe_table':
        return await databaseTools.describeTable(params.table_name);
      case 'db_insert_data':
        return await databaseTools.insertData(params.table_name, params.data);
        
      // Docker tools
      case 'docker_list_containers':
        return await dockerTools.listContainers(params.all_containers);
      case 'docker_start_container':
        return await dockerTools.startContainer(params.container_id_or_name);
      case 'docker_stop_container':
        return await dockerTools.stopContainer(params.container_id_or_name, params.timeout);
      case 'docker_get_container_logs':
        return await dockerTools.getContainerLogs(params.container_id_or_name, params.tail);
        
      // Search tools
      case 'serper_search':
        return await searchTools.serperSearch(params.query, params.search_type, params);
        
      // Vector store tools
      case 'ingest_docs':
        return await vectorTools.ingestDocs(params.source_dir);
      case 'vector_search':
        return await vectorTools.vectorSearch(params.query, params.n_results);
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    logger.error(`Error in tool ${toolName}: ${error.message}`);
    throw error;
  }
}
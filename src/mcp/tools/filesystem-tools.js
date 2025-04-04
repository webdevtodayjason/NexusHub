// Filesystem tools
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger } from '../../utils/logger.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base secure path - all file operations must be within this directory
const SECURE_BASE_PATH = path.join(__dirname, '../../../../data/shared_fs');

// Tool definitions
export function getToolDefinitions() {
  return {
    fs_list_files: {
      name: 'fs_list_files',
      description: 'Lists files and directories within a secure path.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to list (relative to secure base path)'
          }
        }
      }
    },
    fs_read_file: {
      name: 'fs_read_file',
      description: 'Reads the content of a file within a secure path.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to file (relative to secure base path)'
          }
        },
        required: ['path']
      }
    },
    fs_write_file: {
      name: 'fs_write_file',
      description: 'Writes content to a file within a secure path.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to file (relative to secure base path)'
          },
          content: {
            type: 'string',
            description: 'Content to write to the file'
          }
        },
        required: ['path', 'content']
      }
    }
  };
}

// Ensure path is within secure base
function securePath(filePath = '.') {
  // Start with the base secure path
  const resolvedPath = path.resolve(SECURE_BASE_PATH, filePath);
  
  // Make sure the final path is still within the secure base
  if (!resolvedPath.startsWith(SECURE_BASE_PATH)) {
    throw new Error('Path traversal attempt detected');
  }
  
  return resolvedPath;
}

// List files in directory
export async function listFiles(dirPath = '.') {
  try {
    const secureDir = securePath(dirPath);
    
    // Ensure directory exists
    await fs.mkdir(secureDir, { recursive: true });
    
    // Read directory entries
    const entries = await fs.readdir(secureDir, { withFileTypes: true });
    
    // Format results
    const results = await Promise.all(entries.map(async (entry) => {
      const fullPath = path.join(secureDir, entry.name);
      const stats = await fs.stat(fullPath);
      
      return {
        name: entry.name,
        path: path.relative(SECURE_BASE_PATH, fullPath),
        type: entry.isDirectory() ? 'directory' : 'file',
        size: stats.size,
        modified: stats.mtime.toISOString()
      };
    }));
    
    return results;
  } catch (error) {
    logger.error(`Error listing files: ${error.message}`);
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

// Read file contents
export async function readFile(filePath) {
  try {
    const secureFilePath = securePath(filePath);
    const content = await fs.readFile(secureFilePath, 'utf8');
    return content;
  } catch (error) {
    logger.error(`Error reading file: ${error.message}`);
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

// Write file
export async function writeFile(filePath, content) {
  try {
    const secureFilePath = securePath(filePath);
    
    // Ensure the directory exists
    const dirPath = path.dirname(secureFilePath);
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write the file
    await fs.writeFile(secureFilePath, content);
    
    return {
      success: true,
      path: path.relative(SECURE_BASE_PATH, secureFilePath),
      message: 'File written successfully'
    };
  } catch (error) {
    logger.error(`Error writing file: ${error.message}`);
    throw new Error(`Failed to write file: ${error.message}`);
  }
}
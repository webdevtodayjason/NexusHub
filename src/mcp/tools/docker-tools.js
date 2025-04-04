// Docker tools
import { logger } from '../../utils/logger.js';
import { exec } from 'child_process';
import { promisify } from 'util';

// Promisify exec
const execAsync = promisify(exec);

// Tool definitions
export function getToolDefinitions() {
  return {
    docker_list_containers: {
      name: 'docker_list_containers',
      description: 'Lists Docker containers.',
      inputSchema: {
        type: 'object',
        properties: {
          all_containers: {
            type: 'boolean',
            description: 'Whether to list all containers or only running ones'
          }
        }
      }
    },
    docker_start_container: {
      name: 'docker_start_container',
      description: 'Starts a stopped Docker container.',
      inputSchema: {
        type: 'object',
        properties: {
          container_id_or_name: {
            type: 'string',
            description: 'The ID or name of the container to start'
          }
        },
        required: ['container_id_or_name']
      }
    },
    docker_stop_container: {
      name: 'docker_stop_container',
      description: 'Stops a running Docker container.',
      inputSchema: {
        type: 'object',
        properties: {
          container_id_or_name: {
            type: 'string',
            description: 'The ID or name of the container to stop'
          },
          timeout: {
            type: 'number',
            description: 'Timeout in seconds before the container is killed'
          }
        },
        required: ['container_id_or_name']
      }
    },
    docker_get_container_logs: {
      name: 'docker_get_container_logs',
      description: 'Fetches logs from a Docker container.',
      inputSchema: {
        type: 'object',
        properties: {
          container_id_or_name: {
            type: 'string',
            description: 'The ID or name of the container'
          },
          tail: {
            type: 'number',
            description: 'Number of lines to show from the end of the logs'
          }
        },
        required: ['container_id_or_name']
      }
    }
  };
}

// List containers
export async function listContainers(allContainers = false) {
  try {
    const cmd = allContainers ? 'docker ps -a --format json' : 'docker ps --format json';
    const { stdout } = await execAsync(cmd);
    
    // Docker >=24.0 outputs JSON Lines format, need to parse each line
    const containersJson = stdout.trim().split('\n');
    const containers = containersJson.map(line => JSON.parse(line));
    
    return containers;
  } catch (error) {
    logger.error(`Error listing containers: ${error.message}`);
    throw new Error(`Failed to list containers: ${error.message}`);
  }
}

// Start container
export async function startContainer(containerIdOrName) {
  try {
    const { stdout } = await execAsync(`docker start ${containerIdOrName}`);
    return {
      success: true,
      container: containerIdOrName,
      message: stdout.trim() || `Container ${containerIdOrName} started`
    };
  } catch (error) {
    logger.error(`Error starting container: ${error.message}`);
    throw new Error(`Failed to start container: ${error.message}`);
  }
}

// Stop container
export async function stopContainer(containerIdOrName, timeout = 10) {
  try {
    const { stdout } = await execAsync(`docker stop -t ${timeout} ${containerIdOrName}`);
    return {
      success: true,
      container: containerIdOrName,
      message: stdout.trim() || `Container ${containerIdOrName} stopped`
    };
  } catch (error) {
    logger.error(`Error stopping container: ${error.message}`);
    throw new Error(`Failed to stop container: ${error.message}`);
  }
}

// Get container logs
export async function getContainerLogs(containerIdOrName, tail = 100) {
  try {
    const { stdout } = await execAsync(`docker logs --tail ${tail} ${containerIdOrName}`);
    return stdout;
  } catch (error) {
    logger.error(`Error getting container logs: ${error.message}`);
    throw new Error(`Failed to get container logs: ${error.message}`);
  }
}
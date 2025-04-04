#!/usr/bin/env node
/**
 * Clean STDIO wrapper for the NexusHub MCP Server
 * 
 * This script creates a child process for the MCP server and ensures
 * only valid JSON is sent to stdout.
 */

import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a timestamped log file
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = createWriteStream(`/tmp/nexushub-${timestamp}.log`, { flags: 'a' });

// Log startup to file only, not to stdout or stderr
logFile.write(`Starting NexusHub MCP STDIO wrapper at ${new Date().toISOString()}\n`);

// Path to the adapter script
const adapterScript = join(__dirname, '../stdio-adapter.js');

// Spawn the child process
// Note: we use 'inherit' for stdin so that the child process can read from the parent's stdin
const child = spawn('node', [adapterScript], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: {
    ...process.env,
    // Force NODE_OPTIONS to ensure certain flags don't interfere with JSON output
    NODE_OPTIONS: '--no-warnings'
  }
});

// Handle child process stdout - only pass through valid JSON
child.stdout.on('data', (data) => {
  const dataStr = data.toString();
  logFile.write(`[Child stdout] ${dataStr}`);
  
  // Only write to parent stdout if it looks like valid JSON
  // This is the critical part that filters out non-JSON output
  try {
    dataStr.split('\n').forEach(line => {
      line = line.trim();
      if (!line) return;
      
      // Quick check if it looks like JSON before trying to parse
      if (line.startsWith('{') && line.endsWith('}')) {
        // Verify it's valid JSON by parsing it
        JSON.parse(line);
        // If we reach here, it's valid JSON
        process.stdout.write(line + '\n');
      } else {
        // Log non-JSON output to our log file
        logFile.write(`[Filtered non-JSON] ${line}\n`);
      }
    });
  } catch (error) {
    // If parsing fails, it's not valid JSON - log it but don't pass to stdout
    logFile.write(`[Invalid JSON] Error: ${error.message}, Data: ${dataStr}\n`);
  }
});

// Send all stderr output to our log file
child.stderr.on('data', (data) => {
  logFile.write(`[Child stderr] ${data.toString()}`);
});

// Handle process exit
child.on('exit', (code, signal) => {
  const exitMessage = `Child process exited with code ${code} and signal ${signal}\n`;
  logFile.write(exitMessage);
  
  // Ensure we exit with the same code
  process.exit(code);
});

// Handle errors
child.on('error', (error) => {
  logFile.write(`Error spawning child process: ${error.message}\n`);
  process.exit(1);
});

// Handle parent process exit
process.on('exit', () => {
  logFile.write(`Parent process exiting at ${new Date().toISOString()}\n`);
  logFile.close();
});

// Forward signals to child process
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
  process.on(signal, () => {
    logFile.write(`Received ${signal}, forwarding to child process\n`);
    child.kill(signal);
  });
});
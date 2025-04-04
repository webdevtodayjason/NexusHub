// General utility tools
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';
import { logger } from '../../utils/logger.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get latest libraries
export async function getLatestLibs() {
  try {
    // Path to latest libs JSON file
    const latestLibsPath = path.join(__dirname, '../../../../data/latest_libs.json');
    
    // Read the file
    const data = await fs.readFile(latestLibsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error(`Error getting latest libraries: ${error.message}`);
    throw new Error(`Failed to get latest libraries: ${error.message}`);
  }
}

// Fetch URL
export async function fetchUrl(url, timeout = 30) {
  try {
    // Validate URL
    const validatedUrl = new URL(url);
    
    // Set timeout
    const timeoutMs = parseInt(timeout) * 1000;
    
    // Fetch the URL
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(validatedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NexusHub MCP Server/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    // Get the content type
    const contentType = response.headers.get('content-type') || '';
    
    // If it's text or HTML, return as text
    if (contentType.includes('text/') || contentType.includes('application/json')) {
      return await response.text();
    } 
    
    // For binary content, return a message
    return `[Binary content of type ${contentType}]`;
  } catch (error) {
    logger.error(`Error fetching URL: ${error.message}`);
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
}
// Search tools
import fetch from 'node-fetch';
import { logger } from '../../utils/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get API key
const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Tool definitions
export function getToolDefinitions() {
  return {
    serper_search: {
      name: 'serper_search',
      description: 'Performs a search using the Serper API.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query'
          },
          search_type: {
            type: 'string',
            description: 'Type of search (search, news, images, etc.)',
            enum: ['search', 'news', 'images', 'places']
          },
          num_results: {
            type: 'number',
            description: 'Number of results to return'
          }
        },
        required: ['query']
      }
    }
  };
}

// Serper search
export async function serperSearch(query, searchType = 'search', options = {}) {
  try {
    // Check for API key
    if (!SERPER_API_KEY) {
      throw new Error('Serper API key is not configured');
    }
    
    // Set up request
    const url = 'https://google.serper.dev/search';
    
    // Build request body
    const body = {
      q: query,
      gl: options.gl || 'us',
      hl: options.hl || 'en',
      num: options.num_results || 10,
      ...options
    };
    
    // Handle specific search types
    if (searchType === 'news') {
      body.type = 'news';
    } else if (searchType === 'images') {
      body.type = 'images';
    } else if (searchType === 'places') {
      body.type = 'places';
    }
    
    // Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    // Check for errors
    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
    }
    
    // Return the results
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error(`Error performing search: ${error.message}`);
    throw new Error(`Failed to perform search: ${error.message}`);
  }
}
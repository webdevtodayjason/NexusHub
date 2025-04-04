#!/bin/bash
# Direct Docker wrapper for NexusHub MCP Server

# Log to a file
LOG_FILE="/tmp/nexushub-docker-debug-$$.log"
touch "$LOG_FILE"
chmod 666 "$LOG_FILE"

echo "Starting NexusHub Docker MCP bridge..." >> "$LOG_FILE" 2>&1

# Function to send requests to the Docker container's MCP adapter
function process_request() {
  # Execute the request in the Docker container
  docker exec -i nexushub_app node /app/src/mcp/stdio-adapter.js 2>> "$LOG_FILE"
}

# Handle initialize request
echo '{"jsonrpc":"2.0","id":0,"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"NexusHub Docker MCP Bridge","version":"1.0.0"}}}' 

# Process all incoming requests
cat | process_request

echo "NexusHub Docker MCP bridge exiting..." >> "$LOG_FILE" 2>&1
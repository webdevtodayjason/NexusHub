#!/bin/bash
# This script allows sending direct JSON-RPC requests to the MCP server running in Docker

# Function to send a JSON request to the Docker container
function send_request() {
  local method=$1
  local params=$2
  
  # Construct the JSON-RPC request
  local request="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"$method\",\"params\":$params}"
  
  # Send the request to the Docker container
  echo "$request" | docker exec -i nexushub_app node /app/src/mcp/stdio-adapter.js
}

# Handle command line arguments
if [ "$1" = "list" ]; then
  # List available tools
  send_request "tools/list" "{}"
elif [ "$1" = "call" ] && [ -n "$2" ]; then
  # Call a specific tool
  tool_name=$2
  params=${3:-"{}"}
  send_request "tools/call/$tool_name" "$params"
elif [ "$1" = "db_tables" ]; then
  # Shortcut to list database tables
  docker exec nexushub_app node -e "import('./src/database/index.js').then(db => db.getDb().then(result => console.log(JSON.stringify({ tables: result.getTables() }))));"
else
  echo "Usage:"
  echo "  $0 list                  - List all available tools"
  echo "  $0 call <tool_name> [params] - Call a specific tool with optional parameters"
  echo "  $0 db_tables             - List database tables (shortcut)"
  echo ""
  echo "Examples:"
  echo "  $0 call mcp__Nexushub__db_list_tables {}"
  echo "  $0 call mcp__Nexushub__fs_list_files {\"path\":\"\"}"
fi
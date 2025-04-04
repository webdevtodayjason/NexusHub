// Logger utility for NexusHub MCP Server
import winston from 'winston';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine log level from environment
const level = process.env.LOG_LEVEL || 'info';

// Create winston logger
export const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'nexushub-mcp' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...rest }) => {
          const restString = Object.keys(rest).length ? JSON.stringify(rest) : '';
          return `${timestamp} ${level}: ${message} ${restString}`;
        })
      )
    }),
    new winston.transports.File({ filename: 'nexushub-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'nexushub.log' })
  ]
});

// Special logging function for stdio mode that outputs to stderr
export function stdioLog(message) {
  if (typeof message !== 'string') {
    message = JSON.stringify(message);
  }
  console.error(`[${new Date().toISOString()}] ${message}`);
}
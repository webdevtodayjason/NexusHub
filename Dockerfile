FROM node:18-slim

# Set working directory
WORKDIR /app

# Update and install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    sqlite3 \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies for vector processing
RUN pip3 install --no-cache-dir sentence-transformers chromadb

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Create necessary directories
RUN mkdir -p ./data/shared_fs && \
    mkdir -p ./persistent_data/chroma_db

# Expose port
EXPOSE 8001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8001

# Set the default command
CMD ["node", "src/index.js"]
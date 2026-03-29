# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy configuration files
COPY package*.json tsconfig.json mcp.json* ./

# Install all dependencies (including devDependencies for tsc)
RUN npm install

# Copy source code
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled files from builder stage
COPY --from=builder /app/dist ./dist

# Default environment variables
ENV PORT=3000
ENV ROCKETREPORT_BASE_URL="https://api.rocketreport.io"

# Expose the port for SSE mode
EXPOSE 3000

# Entrypoint - By default starts in SSE mode for cloud deployment
ENTRYPOINT ["node", "dist/index.js", "--sse"]

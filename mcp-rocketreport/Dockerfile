# Use Node.js as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev

# Copy built files
COPY dist ./dist

# Define environment variable (should be overridden at runtime)
ENV ROCKETREPORT_API_KEY=""

# Expose no ports (MCP uses stdio)

# Entrypoint
ENTRYPOINT ["node", "dist/index.js"]

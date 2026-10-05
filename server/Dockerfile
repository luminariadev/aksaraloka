# Multi-stage build for Express.js backend
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies for building
RUN apk add --no-cache curl

# Development stage
FROM base AS development

COPY package.json package-lock.json* ./

RUN npm ci --include=dev

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS production

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodeuser
RUN adduser --system --uid 1001 --gid 1001 nodeuser

# Set ownership of app directory
RUN chown -R nodeuser:nodeuser ./

# Switch to non-root user
USER nodeuser

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the server
CMD ["node", "src/index.js"]
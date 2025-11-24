# Build stage
FROM oven/bun:1 AS builder

ARG GIT_SHA=unknown

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1

ARG GIT_SHA=unknown
LABEL git.sha="${GIT_SHA}"

WORKDIR /app

# Copy package files for production dependencies
COPY package.json bun.lock ./

# Install production dependencies only
RUN bun install --frozen-lockfile --production

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Copy server files
COPY server ./server

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Store git SHA in a file for runtime access
RUN echo "${GIT_SHA}" > /app/dist/version.txt

# Expose port 3000
EXPOSE 3000

# Start Bun server
CMD ["bun", "run", "server/index.ts"]

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
FROM nginx:alpine

ARG GIT_SHA=unknown
LABEL git.sha="${GIT_SHA}"

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Store git SHA in a file for runtime access
RUN echo "${GIT_SHA}" > /usr/share/nginx/html/version.txt

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

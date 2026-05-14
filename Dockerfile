# syntax=docker/dockerfile:1

# Base stage for common dependencies
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Copy workspace configuration and all package files for dependency resolution
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json tsconfig.json ./

# Copy all package.json files to allow for dependency installation caching
# We use a wild card approach to get most of them, then specific ones
COPY artifacts/*/package.json ./artifacts/
COPY lib/*/package.json ./lib/
COPY lib/integrations/*/package.json ./lib/integrations/ || true
COPY scripts/package.json ./scripts/ || true

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
COPY . .
RUN pnpm run build

# API Server Production stage
FROM node:24-slim AS api-server
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/api-server/package.json ./artifacts/api-server/package.json
# Shared workspace dependencies
COPY --from=builder /app/artifacts/api-zod ./artifacts/api-zod
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

EXPOSE 8080
CMD ["node", "./artifacts/api-server/dist/index.mjs"]

# Frontend Production stage (serving with Nginx)
FROM nginx:alpine AS frontend
COPY --from=builder /app/artifacts/konbini-compare/dist /usr/share/nginx/html
# Custom nginx config to handle SPA routing and API proxying
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://api-server:8080; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

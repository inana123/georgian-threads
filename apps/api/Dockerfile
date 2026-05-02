# --- Build stage ---
FROM node:20-bookworm-slim AS build

# Sharp + onnxruntime native deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential libvips-dev ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.33.2

# Copy workspace manifests first for caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install API deps only
RUN pnpm --filter @gt/api install --frozen-lockfile

# Copy source
COPY apps/api ./apps/api

# Generate Prisma client + compile TypeScript
RUN cd apps/api && pnpm exec prisma generate && pnpm exec tsc

# --- Runtime stage ---
FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy everything from build stage (simpler than reinstalling)
COPY --from=build /app /app

# Persistent volume mountpoints
ENV UPLOAD_DIR=/data/uploads
ENV TRANSFORMERS_CACHE=/data/hf-cache
RUN mkdir -p /data/uploads /data/hf-cache

EXPOSE 4000
WORKDIR /app/apps/api

# Run migrations on boot, then start
CMD sh -c "pnpm exec prisma migrate deploy && node dist/server.js"

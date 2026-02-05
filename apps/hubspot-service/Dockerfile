# Multi-stage Dockerfile for HubSpot Service

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY apps/hubspot-service/package.json ./apps/hubspot-service/
COPY packages/database/package.json ./packages/database/
COPY packages/events/package.json ./packages/events/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install dependencies
RUN yarn workspaces focus @vrm/hubspot-service

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn

# Copy source code
COPY . .

# Generate Prisma client
RUN yarn workspace @vrm/database prisma generate

# Build the service
RUN yarn workspace @vrm/hubspot-service build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/hubspot-service/dist ./apps/hubspot-service/dist
COPY --from=builder /app/apps/hubspot-service/package.json ./apps/hubspot-service/
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/hubspot-service

EXPOSE 4005

CMD ["node", "dist/main.js"]

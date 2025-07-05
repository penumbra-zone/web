# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./

# Copy all packages
COPY packages ./packages
COPY apps/veil ./apps/veil

# Install dependencies
RUN pnpm install --frozen-lockfile --filter "penumbra-veil..."

# Build argument for the public URL
ARG BASE_URL="http://localhost:3000"
ENV NEXT_PUBLIC_BASE_URL=$BASE_URL

# Build the application
RUN pnpm --filter penumbra-veil build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/veil/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/veil/.next/static ./apps/veil/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/veil/public ./apps/veil/public

# Copy certificate if it exists
COPY --from=builder --chown=nextjs:nodejs /app/apps/veil/cert*.pem ./apps/veil/ || true

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production

CMD ["node", "apps/veil/server.js"]
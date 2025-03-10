# Mostly boilerplate image spec, taken from nextjs docs:
# https://nextjs.org/docs/pages/building-your-application/deploying#docker-image

# Provide specific arg for setting the version of nodejs to use.
# Should match what's in .nvmrc for development.
ARG NODE_MAJOR_VERSION=22
FROM docker.io/node:${NODE_MAJOR_VERSION}-alpine AS base
# We no longer use `corepack enable pnpm` due to breakage documented in
# https://github.com/nodejs/corepack/issues/612
RUN npm install -g pnpm@${PNPM_VERSION}

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install  --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build the website as standalone output.
RUN pnpm --version && node --version
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
LABEL maintainer="team@penumbralabs.xyz"
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create normal user for app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Hack to add a semblance of logging to the nextjs server-side node instance,
# so that all route GETs are logged, which adds much-needed context when exceptions
# are thrown. Exceptions still log a full stack trace, rather than a succinct
# error message, but it's a start!
#
# Why this hack is necessary is beyond my ken. I assume it's an upsell attempt
# at hosting on a sass platform like vercel. Source:
# https://gist.github.com/x-yuri/f4a2f1363ae5c08981c257cc406e00ac
RUN sed -Ei \
    -e '/await requestHandler/iconst __start = new Date;' \
    -e '/await requestHandler/aconsole.log(`-- [${__start.toISOString()}] ${((new Date - __start) / 1000).toFixed(3)} ${req.method} ${req.url}`);' \
    node_modules/next/dist/server/lib/start-server.js

USER nextjs
EXPOSE 3000
ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js

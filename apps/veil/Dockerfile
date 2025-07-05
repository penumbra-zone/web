FROM node:22-bullseye

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/veil ./apps/veil

RUN pnpm install --filter "penumbra-veil..." --ignore-scripts

WORKDIR /app/apps/veil
RUN pnpm build

CMD ["pnpm", "start"]

FROM node:24-slim AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec nest build package-status-ms \
  && pnpm exec tsc-alias -p tsconfig.build.json \
  && pnpm prune --prod

FROM node:24-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

RUN groupadd --system nodejs \
  && useradd --system --gid nodejs --create-home nestjs

COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/libs/shared/src/infrastructure/contracts/proto ./libs/shared/src/infrastructure/contracts/proto

USER nestjs

EXPOSE 50055

CMD ["node", "dist/apps/package-status-ms/main.js"]

# Self-hosted DadaLink server (API + web app on one origin). Build from the repository root:
#   docker build -f apps/server-node/Dockerfile -t dadalink-server .
FROM node:24-slim
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile --filter "@dadalink/server-node..." --filter "@dadalink/web..." \
 && pnpm --filter @dadalink/web build
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DADALINK_DB_FILE=/data/dadalink.db \
    DADALINK_WEB_DIR=/app/apps/web/dist
VOLUME ["/data"]
EXPOSE 3000
USER node
CMD ["node", "apps/server-node/src/main.ts"]

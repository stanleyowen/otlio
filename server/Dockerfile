# syntax=docker/dockerfile:1
# Build context: server/  (see compose.yaml)
FROM node:24-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json yarn.lock ./
# bcrypt needs its install script (prebuilt binary download, or compile with the tools above).
RUN npx --yes yarn@1.22.22 install --frozen-lockfile --production && npx --yes yarn@1.22.22 cache clean && npm cache clean --force

FROM node:24-bookworm-slim
ENV PORT=3000
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --chmod=0444 package.json index.js ./
COPY --chmod=0555 lib ./lib
COPY --chmod=0555 models ./models
COPY --chmod=0555 routes ./routes
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/status').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "index.js"]

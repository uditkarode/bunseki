FROM oven/bun:latest AS base

FROM base AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run generate

FROM base AS runner
RUN apt update && apt install caddy --yes
COPY Caddyfile /etc
RUN mkdir -p /var/www
COPY --from=builder /app/.output/public /var/www/bunseki
EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/Caddyfile"]

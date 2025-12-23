FROM oven/bun:latest

WORKDIR /usr/src/app

COPY package.json ./
COPY bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

EXPOSE 52523

CMD bun run prod


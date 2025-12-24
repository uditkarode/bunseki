FROM oven/bun:latest

WORKDIR /usr/src/app

COPY package.json ./
COPY bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

ENV JMDICT_JSON=/usr/src/app/jmdict-eng-3.6.1.json

EXPOSE 52523

CMD ["bun", "prod"]

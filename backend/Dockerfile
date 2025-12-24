FROM oven/bun:latest

WORKDIR /usr/src/app

COPY package.json ./
COPY bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

# Download JMDict JSON file (not in git due to size)
RUN apt-get update && apt-get install -y curl && \
    curl -L -o jmdict-eng-3.6.1.json.zip "https://github.com/scriptin/jmdict-simplified/releases/download/3.6.1%2B20251222123221/jmdict-eng-3.6.1+20251222123221.json.zip" && \
    unzip jmdict-eng-3.6.1.json.zip && \
    mv jmdict-eng-3.6.1+20251222123221.json jmdict-eng-3.6.1.json && \
    rm jmdict-eng-3.6.1.json.zip && \
    apt-get remove -y curl && apt-get autoremove -y

ENV JMDICT_JSON=/usr/src/app/jmdict-eng-3.6.1.json

EXPOSE 52523

CMD ["bun", "prod"]

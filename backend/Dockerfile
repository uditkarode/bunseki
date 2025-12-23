FROM node:23.2-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn --frozen-lockfile

COPY . .

EXPOSE 52523

CMD yarn prod


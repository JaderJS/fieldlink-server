FROM node:22-alpine as build

WORKDIR /src/

COPY package.json package-lock.json /src/

COPY . /src/

RUN  npm ci

USER node

CMD npm run start
FROM node:8.2.1

ADD . /app
WORKDIR /app
RUN yarn --force

CMD node ./problematic.js
EXPOSE 8081
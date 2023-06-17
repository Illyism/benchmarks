FROM jrottenberg/ffmpeg:5-alpine AS ffmpeg
FROM node:19-alpine

# copy ffmpeg bins from first image
COPY --from=ffmpeg / /

RUN apk add --no-cache python3 py3-pip make g++

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
RUN npm install --omit=dev

COPY . /usr/src/app/

ENV PORT 8080

EXPOSE ${PORT}
CMD [ "node", "dist/server/server.js" ]
FROM alpine:latest

RUN apk add --update bash npm git python3 make g++ && \
    node -v && \
    npm -v && \
    git --version

COPY ./dist/container /simple-hook/container
COPY ./dist/common /simple-hook/common
COPY ./node_modules /simple-hook/node_modules

ENTRYPOINT ["sh", "./simple-hook/container/instance.sh"]

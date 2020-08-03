FROM alpine:latest

RUN apk add --update npm git && \
    node -v && \
    npm -v

COPY ./dist/container /simple-hook/container
COPY ./dist/common /simple-hook/common

ENTRYPOINT ["sh", "./simple-hook/container/instance.sh"]

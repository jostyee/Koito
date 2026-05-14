ARG NODE_VERSION=24
ARG GO_VERSION=1.26
ARG ALPINE_VERSION=3.23

# ---- Frontend build ----
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS frontend

ARG KOITO_VERSION

ENV VITE_KOITO_VERSION=${KOITO_VERSION} \
    BUILD_TARGET=docker

WORKDIR /client
COPY ./client .
RUN npm install -g corepack && \
    corepack enable && corepack prepare yarn@4 --activate && \
    yarn install && \
    yarn run build && \
    find ./build/client -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.svg" \) -exec gzip -k -9 {} \;

# ---- Backend build ----
FROM golang:${GO_VERSION}-alpine${ALPINE_VERSION} AS backend

ARG KOITO_VERSION

ENV CGO_ENABLED=1 \
    GOOS=linux

WORKDIR /app

COPY go.mod go.sum ./
# COPY . .
COPY cmd/ ./cmd/
COPY internal/ ./internal/
COPY engine/ ./engine/
COPY db/ ./db/
COPY queue/ ./queue/
COPY imagecache/ ./imagecache/

RUN apk add --no-cache \
    build-base \
    pkgconfig \
    vips-dev && \
    go mod download && \
    mkdir -p /out && \
    go build \
      -trimpath \
      -buildvcs=false \
      -ldflags="-s -w -X main.Version=${KOITO_VERSION}" \
      -o /out/app \
      ./cmd/api

# ---- Runtime ----
FROM alpine:${ALPINE_VERSION} AS final

RUN apk add --no-cache \
    vips \
    ca-certificates \
    su-exec \
    shadow && \
    addgroup -g 911 -S koito && \
    adduser -u 911 -S -D -H -G koito koito && \
    mkdir -p /config /app && \
    chown koito:koito /config

WORKDIR /app

COPY --from=backend /out/app ./app
COPY --from=frontend /client/build ./client/build
COPY assets/ ./assets/
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

VOLUME ["/config"]

EXPOSE 4110

ENTRYPOINT ["/entrypoint.sh"]
CMD ["./app"]
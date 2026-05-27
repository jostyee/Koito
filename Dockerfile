ARG NODE_VERSION=24
ARG GO_VERSION=1.26
ARG ALPINE_VERSION=3.23

# ---- Frontend build ----
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS frontend

ARG KOITO_VERSION

ENV VITE_KOITO_VERSION=${KOITO_VERSION} \
    BUILD_TARGET=docker

WORKDIR /client
RUN npm install -g corepack
RUN corepack enable && corepack prepare yarn@4 --activate
COPY ./client .
RUN yarn install

RUN yarn run build

RUN find ./build/client -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.svg" \) -exec gzip -k -9 {} \;

# ---- Backend build ----
FROM golang:${GO_VERSION}-alpine${ALPINE_VERSION} AS backend

ARG KOITO_VERSION

ENV CGO_ENABLED=1 \
    GOOS=linux

WORKDIR /app

RUN apk add --no-cache \
    build-base \
    pkgconfig \
    vips-dev

COPY go.mod go.sum ./

RUN go mod download

# COPY . .
COPY cmd/ ./cmd/
COPY internal/ ./internal/
COPY engine/ ./engine/
COPY db/ ./db/
COPY queue/ ./queue/
COPY imagecache/ ./imagecache/

RUN go build \
      -trimpath \
      -buildvcs=false \
      -ldflags="-s -w -X main.Version=${KOITO_VERSION}" \
      -o /app \
      ./cmd/api


# ---- Runtime ----
FROM alpine:${ALPINE_VERSION} AS final

RUN apk add --no-cache \
    vips-dev \
    build-base \
    ca-certificates \
    su-exec \
    shadow && \
    addgroup -g 911 -S koito && \
    adduser -u 911 -S -D -H -G koito koito && \
    mkdir -p /config /app && \
    chown koito:koito /config

WORKDIR /app

COPY --from=backend /app ./app
COPY --from=frontend /client/build ./client/build
COPY assets/ ./assets/
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

VOLUME ["/config"]

EXPOSE 4110

ENTRYPOINT ["/entrypoint.sh"]
CMD ["./app"]

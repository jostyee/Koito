#!/bin/sh
set -e

PUID=${PUID:-911}
PGID=${PGID:-911}

if [ "$(id -u koito)" != "$PUID" ] || [ "$(id -g koito)" != "$PGID" ]; then
	groupmod -o -g "$PGID" koito
	usermod -o -u "$PUID" -g "$PGID" koito
fi

chown -R koito:koito /app /config

exec su-exec koito "$@"


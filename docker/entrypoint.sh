#!/bin/sh
set -e

echo "[entrypoint] applying database migrations..."
./node_modules/.bin/prisma migrate deploy

if [ "${SEED_ON_START:-true}" = "true" ]; then
  echo "[entrypoint] seeding database (idempotent)..."
  ./node_modules/.bin/tsx prisma/seed.ts
fi

echo "[entrypoint] starting server..."
exec "$@"

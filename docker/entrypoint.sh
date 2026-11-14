#!/bin/sh
set -e

# Refuse to start with a missing or placeholder session secret.
case "${AUTH_SECRET}" in
  ""|*change-me*|*replace-with*|*placeholder*)
    echo "[entrypoint] AUTH_SECRET is missing or a placeholder. Set a random value in .env (openssl rand -base64 48)." >&2
    exit 1 ;;
esac
if [ "${#AUTH_SECRET}" -lt 32 ]; then
  echo "[entrypoint] AUTH_SECRET must be at least 32 characters." >&2
  exit 1
fi

echo "[entrypoint] applying database migrations..."
./node_modules/.bin/prisma migrate deploy

# First-run seed only: creates the admin account and sample products on an empty database.
# It never overwrites existing products or resets the admin password.
echo "[entrypoint] first-run seed check..."
./node_modules/.bin/tsx prisma/seed.ts

# The data cache persists on disk but its invalidation markers do not, so start each boot with a clean one.
# (Only cached query results are removed — never uploads or the database.)
rm -rf /app/.next/cache/fetch-cache

echo "[entrypoint] starting server..."
exec "$@"

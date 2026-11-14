#!/bin/sh
# Nightly PostgreSQL backup: one compressed dump per day, 14 days retained.
# Restore with:  gunzip -c backups/<file>.sql.gz | docker compose exec -T db psql -U aljamal -d al_jamal
set -e
mkdir -p /backups
while true; do
  STAMP=$(date +%Y-%m-%d_%H%M)
  FILE="/backups/al_jamal_${STAMP}.sql.gz"
  if pg_dump --clean --if-exists | gzip > "${FILE}.tmp"; then
    mv "${FILE}.tmp" "${FILE}"
    echo "[backup] wrote ${FILE}"
  else
    rm -f "${FILE}.tmp"
    echo "[backup] FAILED at ${STAMP}" >&2
  fi
  find /backups -name 'al_jamal_*.sql.gz' -mtime +14 -delete
  sleep 86400
done

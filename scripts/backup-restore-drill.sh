#!/usr/bin/env bash
#
# PostgreSQL backup and restore drill.
#
# Takes a logical backup of the running database, restores it into a brand-new
# disposable database, and compares row counts per table. The point is not that
# pg_dump exits zero — it is that the restored copy contains what the original
# contained, which is the only thing that makes a backup worth having.
#
# This drill is destructive only to the scratch database it creates itself
# (default: nexacommerce_restore_drill). It never writes to the source.
#
# Usage:
#   scripts/backup-restore-drill.sh [OUTPUT_DIR]
#
# Environment:
#   PGCONTAINER   Docker container running PostgreSQL (default nexacommerce-postgres)
#   PGUSER        Database superuser                  (default postgres)
#   SOURCE_DB     Database to back up                 (default nexacommerce_db)
#   RESTORE_DB    Scratch database to restore into    (default nexacommerce_restore_drill)

set -euo pipefail

PGCONTAINER="${PGCONTAINER:-nexacommerce-postgres}"
PGUSER="${PGUSER:-postgres}"
SOURCE_DB="${SOURCE_DB:-nexacommerce_db}"
RESTORE_DB="${RESTORE_DB:-nexacommerce_restore_drill}"
OUT_DIR="${1:-./backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DUMP_NAME="${SOURCE_DB}-${STAMP}.dump"

if [ "$SOURCE_DB" = "$RESTORE_DB" ]; then
  echo "FATAL: RESTORE_DB must differ from SOURCE_DB; refusing to restore over the source." >&2
  exit 2
fi

mkdir -p "$OUT_DIR"

psql_src() { docker exec -i "$PGCONTAINER" psql -U "$PGUSER" -d "$SOURCE_DB" -At -c "$1"; }
psql_dst() { docker exec -i "$PGCONTAINER" psql -U "$PGUSER" -d "$RESTORE_DB" -At -c "$1"; }

# Row counts per user table, as a stable sorted "schema.table<TAB>count" list.
COUNT_QUERY="
SELECT string_agg(line, E'\n' ORDER BY line) FROM (
  SELECT format('%s.%s\t%s', n.nspname, c.relname,
    (xpath('/row/c/text()',
      query_to_xml(format('SELECT count(*) AS c FROM %I.%I', n.nspname, c.relname),
      false, true, '')))[1]::text::bigint) AS line
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema')
) t;"

echo "==> Source: ${SOURCE_DB} (container ${PGCONTAINER})"
docker exec "$PGCONTAINER" pg_isready -U "$PGUSER" -d "$SOURCE_DB" >/dev/null

echo "==> Recording source row counts"
SRC_COUNTS="$(psql_src "$COUNT_QUERY")"
SRC_TABLES="$(printf '%s\n' "$SRC_COUNTS" | grep -c . || true)"
echo "    ${SRC_TABLES} tables"

echo "==> Backing up to ${OUT_DIR}/${DUMP_NAME}"
# Custom format so the restore can be parallelised and selectively replayed.
docker exec "$PGCONTAINER" pg_dump -U "$PGUSER" -d "$SOURCE_DB" -Fc --no-owner --no-acl \
  > "${OUT_DIR}/${DUMP_NAME}"
BYTES="$(wc -c < "${OUT_DIR}/${DUMP_NAME}" | tr -d ' ')"
if [ "$BYTES" -lt 1024 ]; then
  echo "FATAL: dump is only ${BYTES} bytes; treating as a failed backup." >&2
  exit 1
fi
echo "    ${BYTES} bytes"

echo "==> Recreating scratch database ${RESTORE_DB}"
docker exec -i "$PGCONTAINER" psql -U "$PGUSER" -d postgres \
  -c "DROP DATABASE IF EXISTS \"${RESTORE_DB}\" WITH (FORCE);" >/dev/null
docker exec -i "$PGCONTAINER" psql -U "$PGUSER" -d postgres \
  -c "CREATE DATABASE \"${RESTORE_DB}\";" >/dev/null

echo "==> Restoring"
docker exec -i "$PGCONTAINER" pg_restore -U "$PGUSER" -d "$RESTORE_DB" --no-owner --no-acl \
  < "${OUT_DIR}/${DUMP_NAME}"

echo "==> Comparing restored row counts"
DST_COUNTS="$(psql_dst "$COUNT_QUERY")"

if [ "$SRC_COUNTS" = "$DST_COUNTS" ]; then
  echo
  echo "RESTORE DRILL PASSED: ${SRC_TABLES} tables match exactly."
  echo "Backup: ${OUT_DIR}/${DUMP_NAME}"
  echo
  echo "The scratch database ${RESTORE_DB} is left in place for inspection."
  echo "Drop it with:"
  echo "  docker exec -i ${PGCONTAINER} psql -U ${PGUSER} -d postgres -c 'DROP DATABASE \"${RESTORE_DB}\" WITH (FORCE);'"
  exit 0
fi

echo
echo "RESTORE DRILL FAILED: restored row counts differ from the source." >&2
diff <(printf '%s\n' "$SRC_COUNTS") <(printf '%s\n' "$DST_COUNTS") || true
exit 1

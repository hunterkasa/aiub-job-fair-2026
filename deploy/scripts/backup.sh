#!/usr/bin/env bash
set -euo pipefail

# AIUB Job Fair 2026 - Database Backup Script
# Creates a compressed, timestamped pg_dump of PostgreSQL.

BACKUP_DIR="${BACKUP_DIR:-/backups}"
CONTAINER_NAME="${CONTAINER_NAME:-aiub_postgres_prod}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-aiub_jobfair}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -u)] Starting database backup for '${DB_NAME}' from container '${CONTAINER_NAME}'..."
docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip -9 > "${FILENAME}"

echo "[$(date -u)] Backup created successfully: ${FILENAME} ($(du -h "${FILENAME}" | cut -f1))"

# Retention: Delete backups older than 14 days
find "${BACKUP_DIR}" -type f -name "${DB_NAME}_backup_*.sql.gz" -mtime +14 -exec rm -f {} \;
echo "[$(date -u)] Cleanup completed. Backups older than 14 days removed."

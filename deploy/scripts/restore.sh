#!/usr/bin/env bash
set -euo pipefail

# AIUB Job Fair 2026 - Database Restore Script
# Usage: ./restore.sh /path/to/backup_file.sql.gz

if [ $# -lt 1 ]; then
    echo "Usage: $0 <path-to-compressed-backup-file.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="${CONTAINER_NAME:-aiub_postgres_prod}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-aiub_jobfair}"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file '${BACKUP_FILE}' does not exist."
    exit 1
fi

echo "WARNING: Restoring will overwrite existing data in '${DB_NAME}'!"
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
if [ "${CONFIRM}" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo "[$(date -u)] Restoring database '${DB_NAME}' from '${BACKUP_FILE}'..."
gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"

echo "[$(date -u)] Restore completed successfully."

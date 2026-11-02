# Operations Runbook

---

## 1. Quick Emergency Commands (Production VPS)

### Check Service Status
```bash
docker compose -f deploy/docker-compose.prod.yml ps
```

### View Live Logs
```bash
# View backend API logs
docker compose -f deploy/docker-compose.prod.yml logs -f api

# View Next.js web logs
docker compose -f deploy/docker-compose.prod.yml logs -f web

# View Caddy reverse proxy logs
docker compose -f deploy/docker-compose.prod.yml logs -f caddy
```

### Restart a Service
```bash
docker compose -f deploy/docker-compose.prod.yml restart api
```

---

## 2. Backup & Disaster Recovery

### Manual Backup
```bash
bash deploy/scripts/backup.sh
```
Backups are saved to `/backups` as compressed `.sql.gz` files.

### Restoring from Backup
```bash
bash deploy/scripts/restore.sh /backups/aiub_jobfair_backup_20261102_120000.sql.gz
```

---

## 3. Extending Deadlines via Database or Admin
Student and employer registration deadlines are controlled by records in `EventSetting`:
* `StudentRegistrationDeadlineUtc`
* `EmployerRegistrationDeadlineUtc`

To extend via SQL:
```sql
UPDATE "EventSettings"
SET "Value" = '2026-12-10T17:59:59Z', "UpdatedAtUtc" = NOW()
WHERE "Key" = 'StudentRegistrationDeadlineUtc';
```
Changes take effect immediately without restarting the application.

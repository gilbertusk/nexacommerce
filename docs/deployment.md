# Production Deployment Manual

This document details the guidelines, environment matrices, migration steps, reverse-proxy configurations, and database seeding procedures to run NexaCommerce in staging or production.

## 1. System Requirements & Prerequisites

For staging or production deployments, we recommend a Virtual Private Server (VPS) with the following minimum specifications:
- **OS:** Ubuntu 22.04 LTS (or equivalent Linux distribution)
- **CPU:** 2 vCPUs
- **RAM:** 4 GB minimum (needed to run 13 services + PostgreSQL + Redis + RabbitMQ concurrently)
- **Disk:** 40 GB SSD
- **Software:** Docker Engine 24+ and Docker Compose v2+ installed.

---

## 2. Docker Compose Production Deployment

The simplest way to deploy the entire microservices cluster is using Docker Compose profiles.

### Step 2.1: Clone Repository & Prepare Directory
```bash
git clone https://github.com/yourusername/nexacommerce.git /opt/nexacommerce
cd /opt/nexacommerce
```

### Step 2.2: Setup Environment Variables
Create the production environment file `/opt/nexacommerce/.env`:
```bash
cp .env.example .env
nano .env
```
Ensure you update database credentials, generate strong cryptographically secure keys for `JWT_SECRET` and `JWT_REFRESH_SECRET`, and insert your Midtrans integration key.

### Step 2.3: Start Services
Run the production profile to build multi-stage Docker images and start all 13 services:
```bash
docker compose --profile production up -d --build
```
This boots:
- Database (`postgres`), cache (`redis`), message broker (`rabbitmq`).
- All 13 microservices connected via the virtual bridge network `nexacommerce-network`.

### Step 2.4: Check Container Health
Wait 30-45 seconds for all containers to finish initialization:
```bash
docker compose --profile production ps
```
Verify that all services display the `healthy` status.

---

## 3. Database Migrations & Seeding

After the containers are up and healthy, apply database migrations and populate the database with seed accounts.

### Run Migrations:
```bash
# Run migration script via POSIX shell inside the monorepo context
docker compose exec api-gateway npm run db:migrate
```

### Seed Demo Accounts:
```bash
# Run database seeder
docker compose exec api-gateway npm run seed
```

---

## 4. Reverse Proxy Setup (Nginx & SSL)

In production, you should secure the API Gateway behind a reverse proxy (e.g., Nginx) and install SSL certificates (via Let's Encrypt / Certbot).

### Example Nginx Server Block `/etc/nginx/sites-available/nexacommerce`:
```nginx
server {
    listen 80;
    server_name api.nexacommerce.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Troubleshooting FAQ

### Problem: Database schema does not exist
* **Cause:** The database was created but microservice schemas were not loaded.
* **Solution:** Verify that `infra/postgres/init.sql` ran successfully, or connect to the postgres instance and check that schemas `auth`, `users`, `products`, etc. exist. If they do not, run:
  `docker compose exec postgres psql -U postgres -d nexacommerce_db -f /docker-entrypoint-initdb.d/init.sql` and run `db:migrate` again.

### Problem: Services crash with "Prisma client not found"
* **Cause:** The Prisma client was not generated inside the container during build or failed to copy to the dist output directory.
* **Solution:** Rebuild the containers using the `--no-cache` flag:
  `docker compose --profile production build --no-cache`

## Database backup and restore drill

A backup nobody has restored is a hope, not a backup. `scripts/backup-restore-drill.sh` takes a
logical dump of the running database, restores it into a **new, separate** scratch database, and
compares per-table row counts between source and restored copy. It fails if any count differs, if
the dump is implausibly small, or if `RESTORE_DB` is not distinct from `SOURCE_DB`. It never writes
to the source.

```bash
npm run db:backup-drill                # writes to ./backups
npm run db:backup-drill -- /srv/backups
```

Environment overrides: `PGCONTAINER`, `PGUSER`, `SOURCE_DB`, `RESTORE_DB`.

Local verification, 2026-09-25, PostgreSQL 16 in `nexacommerce-postgres`:

| Step | Result |
|---|---|
| `pg_dump -Fc` of `nexacommerce_db` | 276,569 bytes |
| Restore into a freshly created scratch database | Succeeded |
| Per-table row-count comparison | **143/143 tables match exactly** |

The dump uses custom format (`-Fc`), so a restore can be parallelised with `pg_restore -j` and
individual tables can be replayed selectively during an incident.

### What this drill does and does not prove

It proves that a logical dump of this schema restores completely and that no table silently loses
rows in the round trip.

It does **not** cover, and these remain open for production acceptance:

- **Point-in-time recovery.** PITR needs WAL archiving (`archive_mode`, `archive_command`, or a
  managed equivalent) plus a base backup, neither of which exists in the local single-node
  container. A logical dump can only restore to the instant it was taken.
- **Recovery time and recovery point objectives.** No RTO/RPO has been agreed, and the restore
  duration measured against a near-empty local database says nothing about production volume.
- **Off-host retention.** The dump is written to local disk. Production needs offsite, encrypted,
  access-controlled, retention-managed storage.
- **Restore into a different major version**, and restore of roles and grants, which `--no-owner
  --no-acl` deliberately skips.
- **Scheduling, monitoring, and alerting** on backup age and failure.

Treat this as local evidence that the backup mechanism works, not as disaster-recovery acceptance.

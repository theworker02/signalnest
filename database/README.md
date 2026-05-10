# Database

The canonical schema lives in `backend/prisma/schema.prisma`.

Files in this directory:

- `001_core_indexes.sql`: supplemental PostgreSQL indexes for high-volume query paths.
- `seed.sql`: local development seed records that mirror the product UI.
- `retention.sql`: cleanup statements for scheduled maintenance.

Prisma should run table migrations first; these SQL files are operational companions for database hardening and local data setup.

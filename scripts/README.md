# Scripts

Runnable maintenance scripts:

- `node scripts/check-env.mjs`: validates that `frontend/.env` and `backend/.env` contain the required variables from their matching examples.
- `node scripts/seed-database.mjs`: runs `database/seed.sql` against `DATABASE_URL` from `backend/.env`.
- `node scripts/prune-local-artifacts.mjs`: removes local build artifacts.

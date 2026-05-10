# Security Policy

SignalNest is not currently seeking external security review, penetration
testing, vulnerability research, bug bounty submissions, or unsolicited
security reports.

Do not test, scan, probe, exploit, fuzz, or attempt to bypass protections on
any SignalNest deployment you do not own or operate. This repository is a
controlled product prototype, and external security submissions are not being
reviewed at this time.

## Current posture

SignalNest includes secure-by-default foundations, but it should not be
treated as a fully audited production security boundary without additional
review by the project owner.

Implemented foundations include:

- Fastify Helmet secure headers
- CORS allow-listing
- CSRF protection
- Signed cookies
- Rate limiting
- Zod request validation
- Argon2id password hashing helpers
- Short-lived JWT access tokens and refresh token family support
- Session and audit log database models

## Known unfinished areas

- MFA enrollment is represented in UI state but is not connected to a TOTP or WebAuthn provider yet.
- Refresh token helper code exists, but full token-family persistence and revocation still need production wiring.
- Monitoring workers and snapshot fetchers need source-specific SSRF protections before public URL ingestion is enabled server-side.
- Payment fulfillment should be verified with billing provider webhooks before paid entitlements are trusted in production.

## External reports

External vulnerability reports are not being requested or accepted right now.
If this policy changes, this file will be updated with a private reporting
channel, safe harbor scope, supported targets, and response expectations.

## Production hardening checklist

- Use managed secret storage.
- Rotate JWT secrets and database credentials.
- Enforce MFA for privileged workspaces.
- Keep dependency scanning enabled.
- Store refresh tokens as hashes only.
- Verify hosted checkout completion server-side.
- Log authentication, export, alert, billing, and admin events to immutable audit storage.

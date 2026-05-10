-- Local development seed data.
-- Run after Prisma migrations if you want database-backed demo records.

INSERT INTO "User" ("id", "email", "passwordHash", "mfaEnabled", "createdAt", "updatedAt")
VALUES
  ('usr_signalnest_demo', 'operator@signalnest.local', '$argon2id$v=19$m=65536,t=3,p=4$development$replace-with-real-hash', true, now(), now())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Workspace" ("id", "userId", "name", "createdAt", "updatedAt", "settings")
VALUES
  ('wks_frontier', 'usr_signalnest_demo', 'Frontier Tech', now(), now(), '{"density":"comfortable","accent":"cyan"}')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Board" ("id", "workspaceId", "name", "layout", "createdAt", "updatedAt")
VALUES
  ('brd_launches', 'wks_frontier', 'Launch Radar', '{"left":34,"right":33,"bottom":true}', now(), now())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Tracker" ("id", "boardId", "kind", "title", "source", "intervalSeconds", "tags", "enabled", "createdAt", "updatedAt")
VALUES
  ('trk_arc_release_seed', 'brd_launches', 'website', 'Arc Browser Releases', 'https://arc.net/releases', 600, ARRAY['browser','product'], true, now(), now()),
  ('trk_next_repo_seed', 'brd_launches', 'github', 'Next.js Repository Velocity', 'https://github.com/vercel/next.js', 900, ARRAY['github','framework'], true, now(), now())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "AlertRule" ("id", "trackerId", "name", "condition", "priority", "enabled", "muteWindow", "createdAt", "updatedAt")
VALUES
  ('alr_pricing_seed', 'trk_arc_release_seed', 'Pricing or CTA changed', 'visual_delta > 12 OR currency_string_changed', 'high', true, '23:00-07:00', now(), now())
ON CONFLICT ("id") DO NOTHING;

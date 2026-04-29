# 🧵 Georgian Threads

A Vinted-style secondhand fashion marketplace, built for Georgia 🇬🇪.

## Stack
- **Backend:** Fastify + Prisma + SQLite (swap to Postgres later) + JWT auth
- **Web:** Next.js 14 + Tailwind
- **Mobile:** (planned — Expo / React Native)
- **Monorepo:** pnpm workspaces

## Quick start

```bash
# 1. Install everything
pnpm install

# 2. (One time) create the SQLite db + seed demo data
cd apps/api
pnpm exec prisma migrate dev --name init
pnpm seed
cd ../..

# 3. Run API + Web together (in two terminals or with pnpm dev)
pnpm dev
# OR separately:
pnpm dev:api   # http://localhost:4000
pnpm dev:web   # http://localhost:3000
```

Demo login: **demo@georgianthreads.ge** / **password123**

## What's working (Phase 1)
- ✅ Register / login / JWT auth
- ✅ Categories (in Georgian + English)
- ✅ Browse, search, filter items
- ✅ Item detail page
- ✅ Sell form with image upload
- ✅ Favorites
- ✅ Buyer ↔ seller messaging (polling-based)
- ✅ User profiles

## Roadmap
- **Phase 2:** Real-time chat (Socket.IO), reviews, follows, notifications
- **Phase 3:** Checkout, escrow, shipping labels (Georgian post / TBC Pay / BOG)
- **Phase 4:** Mobile app (Expo), admin dashboard, moderation
- **Phase 5:** Swap SQLite → Postgres, S3 image storage, deploy

## Project layout
```
apps/
  api/   Fastify + Prisma backend
  web/   Next.js frontend
packages/
  shared/  (placeholder for shared types later)
```

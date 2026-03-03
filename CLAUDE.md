# Abwaan v2 - Claude Code Context

## Project Overview
Digital archive for Somali poetry (Gabay) and proverbs (Maahmaahyo). Vue 3 SPA + Firebase backend.

## Tech Stack
- **Frontend:** Vue 3.5, Vite 7, TypeScript 5.9, Tailwind CSS 4, Pinia 3 (composition-style stores)
- **Backend:** Firebase — Firestore, Auth, Cloud Functions v2 (Node 20)
- **Package manager:** npm
- **No test framework** exists yet

## Project Structure
```
client/                      # Vue 3 SPA
  src/
    data/
      firebase/client.ts     # Firebase init (Firestore, Auth, Functions)
      firestore/*.repo.ts    # Repository pattern — Firestore CRUD
      functions/*.ts          # Cloud Function callable wrappers
      models/*.ts             # TypeScript interfaces
    features/                 # Feature-based folders
      auth/auth.store.ts
      submissions/submissions.store.ts
      comments/comments.store.ts
      favorites/favorites.store.ts
      reports/reports.store.ts
      profile/profile.store.ts
      public-profile/publicProfile.store.ts
    shared/                   # Shared components, utils, composables
    router/index.ts           # Vue Router with auth guards
    App.vue                   # Root component (splash screen, Lenis, online/offline)
    main.ts                   # Entry point
functions/                   # Firebase Cloud Functions
  src/index.ts               # All functions in one file
firestore.rules              # Security rules
ROADMAP.md                   # Technical debt tracking with checkboxes
```

## Key Architecture Patterns
- **Repository pattern:** `client/src/data/firestore/*.repo.ts` wrap Firestore SDK calls
- **Callable wrappers:** `client/src/data/functions/*.ts` wrap `httpsCallable` calls
- **Server-owned validation:** `createSubmission`, `updateSubmission`, `voteSubmission`, `claimUsername` are all Cloud Function callables with full server-side validation
- **Search fields:** `buildSubmissionSearchFields()` lives ONLY in `functions/src/index.ts` (single source of truth). Client never builds search fields.
- **Optimistic UI:** Vote system updates UI immediately, rolls back on failure
- **Promise-based auth readiness:** `waitForAuthReady()` / `waitForProfile()` used by router guards
- **Cursor-based pagination:** `startAfter` with `QueryDocumentSnapshot` cursors
- **Dual-query search:** prefix range + `array-contains` keyword queries, deduplicated client-side

## Build Commands
```bash
# Client
cd client && npx vite build

# Functions
cd functions && npm run build    # runs tsc

# Dev server
cd client && npm run dev
```

## Important: What's Been Done (see ROADMAP.md for full list)
**All items from the technical debt assessment are now complete.** Key changes:
1. Migrated deprecated Firestore persistence API to `persistentLocalCache`
2. Fixed hardcoded 2s splash screen (auth-readiness based with min/max bounds)
3. Removed dead `fn` alias, consolidated to `functions` export
4. Deduplicated `buildSubmissionSearchFields` — created `updateSubmission` callable, removed ~100 lines of dead client code
5. Subcollection cleanup on submission deletion via `bulkWriter`
6. Per-user rate limiting on all 4 Cloud Function callables (`rateLimits` collection)
7. Removed redundant `profileStore.start()` from router guard
8. Per-item `togglingIds` in favorites store (replaces global `busy` flag)
9. Lazy `useProfileStore()` in auth store (moved into `initAuthListener`)
10. Fixed search pagination — exhausted queries are now skipped on loadMore
11. Global `app.config.errorHandler` with toast notification
12. Structured logging via `firebase-functions/logger` in all triggers
13. Removed unused dependencies: axios, sass, duplicate .prettierrc.json, Lenis CSS, Flowbite config

## What's Remaining
All items from the initial technical debt assessment are complete. See ROADMAP.md for the full checklist.

## Rules for This Project
1. Do not hallucinate code — read files before modifying
2. Manage scope — if a fix cascades into a large refactor, stop and discuss
3. Track progress in ROADMAP.md — check off items as they're completed
4. Always verify with `npx vite build` (client) and `npm run build` (functions) after changes
5. Both builds must pass before marking any item complete

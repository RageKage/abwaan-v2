# AUDIT REPORT

- Date generated: 2026-02-16
- Repo: `abwaan-v2` (frontend package: `client`, backend package: `functions`)
- How to run the app:
  - `npm --prefix client install`
  - `npm --prefix functions install`
  - `firebase emulators:start --only auth,firestore,functions`
  - `npm --prefix functions run build` (or `npm --prefix functions run build:watch`)
  - `npm --prefix client run dev`
  - Source: `docs/Runbook.md:14-47`
- Commit hash: `c8a95aa`

## A) Repo Tree (Top-Level and `src/`)

### Top-level
- `.firebase/`
- `.git/`
- `client/`
- `docs/`
- `functions/`
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `dataset.json`
- `TEST_SUBMISSIONS.json`
- `.env.example`

### Frontend source tree (`client/src`)
- `app/router`
- `assets/`
- `data/firebase`
- `data/firestore`
- `data/functions`
- `data/models`
- `features/admin`
- `features/auth`
- `features/collections`
- `features/desk`
- `features/favorites`
- `features/home`
- `features/onboarding`
- `features/profile`
- `features/submissions`
- `shared/components`
- `shared/navigation`
- `shared/utils`

## B) Main Entry Points and Routing

- Frontend bootstrap: `client/src/main.ts` initializes Vue, Pinia, router, motion plugin.
- App shell: `client/src/App.vue` controls global loader/offline banner/chrome visibility.
- Router + guards: `client/src/app/router/index.ts` defines all routes and enforces auth, onboarding, and admin checks.
- Firebase client wiring: `client/src/data/firebase/client.ts` initializes Firebase app and connects emulators in DEV.
- Backend runtime: `functions/src/index.ts` defines auth triggers, Firestore triggers, and callable functions (`claimUsername`, `createSubmission`, `voteSubmission`).
- Access control: `firestore.rules` enforces profile/submission/comment/report permissions and data constraints.

## C) Where Search + Ingestion + AI Pipeline Live

- Search implementation:
  - Index generation: `functions/src/index.ts` function `buildSubmissionSearchFields` and usage in `createSubmission`.
  - Query execution: `client/src/data/firestore/submissions.repo.ts` function `searchSubmissions` (prefix query on `searchIndex` + keyword query on `searchKeywords`).
- Ingestion pipeline:
  - Seeder script: `functions/scripts/seed-submissions.cjs` (validates dataset, generates search fields, batch writes submissions).
  - Input datasets: `dataset.json`, `TEST_SUBMISSIONS.json`.
- AI/ML pipeline:
  - No implemented AI/ML runtime paths found (no embedding/model/vector inference services in `client/src` or `functions/src`).
  - Current “search intelligence” is lexical token matching only (`searchIndex`/`searchKeywords`) in `functions/src/index.ts` + `client/src/data/firestore/submissions.repo.ts`.

---

## 1) Project Map (1 page max)

### What the app does today (actual behavior)
- Users can register/login (email+password, Google), claim immutable username, and maintain profile basics.
  - Evidence: `client/src/features/auth/auth.store.ts`, `client/src/features/onboarding/UsernameOnboardingPage.vue`, `functions/src/index.ts` (`claimUsername`).
- Users can create submissions (proverb/poetry), view list/detail, edit/delete own entries, vote, comment, report, and favorite.
  - Evidence: `client/src/features/submissions/*`, `client/src/data/firestore/submissions.repo.ts`, `client/src/data/firestore/comments.repo.ts`, `client/src/data/firestore/favorites.repo.ts`, `functions/src/index.ts`.
- Admin users can review submissions/reports and toggle visibility hidden/published.
  - Evidence: `client/src/features/admin/AdminPage.vue`, `client/src/features/admin/reports.store.ts`, `client/src/data/firestore/reports.repo.ts`.
- Search/filter in collections works via Firestore lexical fields; pagination is implemented.
  - Evidence: `client/src/features/collections/CollectionsPage.vue`, `client/src/data/firestore/submissions.repo.ts`.

### What the app is trying to become (from docs/comments)
- A “universal archive” with richer discovery (thematic tagging/visualization), personal collections, ingestion backlog completion, and audio-centric experiences.
  - Evidence: `client/src/features/home/RoadmapPage.vue:35-107`, `docs/README.md:5-17`, `client/src/features/home/AboutPage.vue` narrative text.

### High-level architecture
- Frontend: Vue 3 + Pinia + Vue Router + Firebase SDK (`client/src/main.ts`, `client/package.json`).
- Data flow:
  - UI components call Pinia stores.
  - Stores call Firestore repos or callable Functions wrappers.
  - Firestore rules enforce direct-write constraints.
  - Cloud Functions handle privileged/atomic flows (`claimUsername`, `createSubmission`, `voteSubmission`) and lifecycle triggers (`onAuthUserCreate`, `onSubmissionCreate/delete`, `onReportCreate`).
- Key screens:
  - Home (`/`), Collections (`/collections`), Submission Detail (`/s/:id`), Contribute (`/contribute`), Desk (`/desk`), Settings (`/settings`), Admin (`/admin`).
  - Evidence: `client/src/app/router/index.ts`.
- Key services:
  - Firebase Auth/Firestore/Functions client: `client/src/data/firebase/client.ts`.
  - Firestore rules/indexes: `firestore.rules`, `firestore.indexes.json`.

### Single source of truth files
- Route/access truth: `client/src/app/router/index.ts`.
- Submission schema/types: `client/src/data/models/submission.ts`.
- Report/comment/favorite schemas: `client/src/data/models/report.ts`, `client/src/data/models/comment.ts`, `client/src/data/models/favorite.ts`.
- Server-side validation/business invariants: `functions/src/index.ts`.
- Client-side submission validation: `client/src/features/submissions/submission.validation.ts`.
- Authorization: `firestore.rules`.
- Query/index compatibility: `firestore.indexes.json`.
- Environment/runtime wiring: `firebase.json`, `client/src/data/firebase/client.ts`.

---

## 2) Missing / Incomplete Features Inventory

### Core features

| Item | Status | Evidence | Impact | Suggested fix | Effort |
|---|---|---|---|---|---|
| Profile docs are stale/incomplete compared to current doc set | Broken | `docs/README.md:5-17` references files that do not exist in `docs/` (`PROJECT_OVERVIEW.md`, `CURRENT_STATUS.md`, etc.) | New maintainers get wrong project status and miss real runbooks | Replace `docs/README.md` index with existing docs (`README.md`, `Runbook.md`) or add missing docs | S |
| Public profile “Total Contributions” shows currently loaded page count, not real total | Partially implemented | `client/src/features/profile/PublicProfilePage.vue:96` uses `submissions.length` | Misleading contributor metrics and incorrect trust signals | Render `profile.submissionCount` (from profile doc) and keep list length separate | S |
| Admin moderation relies on manual refresh loops after each action | Partially implemented | `client/src/features/admin/AdminPage.vue:111-131` (action then reload whole lists) | Extra latency, higher read costs, weaker operator UX | Optimistically patch local admin state and background refresh only on failure | M |

### Search / filtering / ranking

| Item | Status | Evidence | Impact | Suggested fix | Effort |
|---|---|---|---|---|---|
| Search is lexical-only (prefix + exact token), no fuzzy/semantic ranking | Partially implemented | `client/src/data/firestore/submissions.repo.ts:298-369`; `functions/src/index.ts:93-143` | Poor recall for typos/morphology/transliteration; relevance quality limited | Add normalized token expansion and score ordering; if AI desired, add embedding index and reranker | L |
| Merged search result ordering is unstable and not relevance-ranked | Partially implemented | `client/src/data/firestore/submissions.repo.ts:350-366` uses insertion order of `Map` from two independent queries | Inconsistent result order; pagination quality degrades | Compute explicit score + deterministic sort key (`score`, `createdAt`, `id`) before returning | M |
| Search scope ignores active filters when search term is present | Partially implemented | `client/src/features/collections/CollectionsPage.vue:69-77` calls `submissionsStore.search(term)` without type/language/sort constraints | Filter UI implies combined query but backend returns unfiltered search set | Extend `searchSubmissions` API to accept type/language/sort and wire from Collections page | M |

### Import / ingestion pipeline

| Item | Status | Evidence | Impact | Suggested fix | Effort |
|---|---|---|---|---|---|
| Seeder default emulator host value and log message conflict | Broken | `functions/scripts/seed-submissions.cjs:42-43` sets `127.0.0.1:4000` but logs `127.0.0.1:8080` | Easy to seed wrong emulator endpoint; confusing failures | Align default and log to same port (`8080`) | S |
| Seeder duplicates search/validation logic from runtime function | Partially implemented | Duplicated constants/functions in `functions/scripts/seed-submissions.cjs:69-133` and `functions/src/index.ts:32-143` | Drift risk: ingest behavior diverges from production callable validation | Extract shared validation/search utilities and import from both script and functions runtime | M |
| No idempotent seed strategy or duplicate guard | Partially implemented | `functions/scripts/seed-submissions.cjs:269-270` always creates random doc IDs | Re-seeding duplicates content and distorts counts/search | Add deterministic external ID key or hash-upsert option (`--dedupe-key`) | M |

### AI/ML pipeline (analysis, embeddings, models)

| Item | Status | Evidence | Impact | Suggested fix | Effort |
|---|---|---|---|---|---|
| No embeddings/vector index pipeline | Missing | Only lexical search fields exist: `functions/src/index.ts:88-143`, `client/src/data/firestore/submissions.repo.ts:325-339` | Cannot support semantic retrieval or robust multilingual discovery | Add offline embedding job + vector store (or hosted vector DB) with searchable embedding IDs | L |
| No model lifecycle/config for AI analysis | Missing | No AI model/config services in `client/src` or `functions/src`; runtime only Firebase CRUD/callables | No path for enrichment tasks (topic tagging, similarity, moderation assist) | Define AI service boundary (queue + worker + model config envs) and add typed analysis payload schema | L |

### Storage (DB/index), caching

| Item | Status | Evidence | Impact | Suggested fix | Effort |
|---|---|---|---|---|---|
| No server-side cache for expensive fan-out reads (favorites/report counts) | Partially implemented | `client/src/data/firestore/favorites.repo.ts:73-81`; `client/src/data/firestore/reports.repo.ts:88-101` | Higher read amplification as data grows | Add denormalized counters/materialized fields or callable endpoints with cached aggregate response | M |
| No explicit cache invalidation/versioning strategy for search results | Missing | Search store keeps cursors only in-memory: `client/src/features/submissions/submissions.store.ts:24-26,76-121` | Stale UX across route/session transitions | Add query-keyed cache with TTL + invalidation on create/update/delete events | M |

### UI/UX + states + accessibility

| Item | Status | Evidence | Impact | Suggested fix | Effort |
|---|---|---|---|---|---|
| Global app loader is time-based, not readiness-based | Hardcoded | `client/src/App.vue:51-53` fixed 2-second timeout | Artificial delay on fast networks; premature hide on slow boot | Tie loader state to first-route + auth/profile readiness promises | S |
| “System status” indicates browser network only, not backend/database health | Hardcoded | `client/src/shared/utils/dbStatus.ts:12-15`; consumed in `client/src/shared/navigation/Footer.vue:11-18,170-182` | False “online” confidence when Firestore/Functions are unreachable | Add lightweight Firestore/Functions heartbeat ping and map true service states | M |
| Newsletter/footer interaction is present but fully commented out | Stubbed | `client/src/shared/navigation/Footer.vue:184-201` | Dead UI path and unclear product intent | Remove dead block or wire to actual subscription endpoint + validation | S |
| Accessibility semantics are weak for some custom controls | Partially implemented | `client/src/shared/components/SubmissionCard.vue:33-41` uses `article role="link" tabindex="0"` + key handler | Screen reader/link semantics and navigation consistency risk | Use actual `<router-link>` wrapper or fully ARIA-compliant button-link pattern | M |

### Performance (virtualization, debouncing, batching)

| Item | Status | Evidence | Impact | Suggested fix | Effort |
|---|---|---|---|---|---|
| Large card grids render all loaded items with no virtualization | Partially implemented | `client/src/features/collections/CollectionsPage.vue:331-341`, `client/src/features/desk/DeskPage.vue:186-247`, `client/src/features/profile/PublicProfilePage.vue:110-118` | Growth causes render jank/memory pressure | Add windowed rendering (`vue-virtual-scroller`) on archive/desk/profile grids | M |
| Search calls are not debounced in active page path | Partially implemented | `CollectionsPage` uses enter key only (`client/src/features/collections/CollectionsPage.vue:235-238`); separate debounced `SearchBar.vue` is unused | Poor discoverability and bursty requests when users manually submit | Either wire existing debounced `SearchBar.vue` (`client/src/features/collections/SearchBar.vue`) or add input debounce in page | S |
| Report counts fetched in extra pass for each admin load | Partially implemented | `client/src/features/admin/AdminPage.vue:90-109` + `reports.repo.ts:88-101` | Additional queries for already-known moderation list | Denormalize open report count on submission doc and keep via trigger updates | M |

### Reliability (error handling, retries, idempotency)

| Item | Status | Evidence | Impact | Suggested fix | Effort |
|---|---|---|---|---|---|
| Report-trigger logic only handles create, not status updates/deletes | Broken | `functions/src/index.ts:205-242` defines `onReportCreate` only | `reportCount` and auto-hidden state can become stale after moderation changes | Add `onReportWrite` (create/update/delete) recalculation and consistent status transitions | M |
| Route guard blocks navigation on profile fetch with no timeout/fallback | Partially implemented | `client/src/app/router/index.ts:109-112` waits `profileStore.waitForProfile()` before route resolution | Potential navigation hangs during profile listener failure | Add timeout + degraded path (allow route with limited UI + retry banner) | M |
| Seeder is non-idempotent and can over-insert on repeated runs | Partially implemented | `functions/scripts/seed-submissions.cjs:269-283` uses `doc()` random IDs | Duplicate archive entries, polluted moderation/search | Add upsert mode with deterministic keys or pre-insert duplicate checks | M |

### Tests + tooling

| Item | Status | Evidence | Impact | Suggested fix | Effort |
|---|---|---|---|---|---|
| No project tests for frontend/backend logic | Missing | No test files outside dependencies (`find client functions -path '*/node_modules/*' -prune ...` returned empty) | Regressions likely in rules, stores, and function validation | Add Vitest for stores/repos + Emulator integration tests for `functions/src/index.ts` and `firestore.rules` | L |
| No CI script orchestration for test stage | Missing | `client/package.json` and `functions/package.json` have lint/build scripts but no `test` script | No automated quality gate for behavior changes | Add `test` scripts and workflow to run lint+typecheck+tests per PR | M |

---

## 3) Hardcoded / Temporary / “Replace later” List

| Hardcoded / Temporary Item | Evidence | What it should become | Risk |
|---|---|---|---|
| Fixed app splash delay (`2000ms`) | `client/src/App.vue:51-53` | Replace with readiness-based loader tied to auth/router/data bootstrap | Perceived slowness and inconsistent UX |
| Offline banner variable named `serverDown` but backed by `navigator.onLine` | `client/src/App.vue:21,25-30,93-110` | Replace with true backend health signal (`Firestore`/`Functions` heartbeat) | Misdiagnosis during incidents |
| Footer location/year hardcoded | `client/src/shared/navigation/Footer.vue:80-83` | Pull from config/build metadata or remove if not authoritative | Stale metadata in production |
| Roadmap phase statuses/content hardcoded in component | `client/src/features/home/RoadmapPage.vue:35-108` | Move to CMS/config JSON or backend-managed roadmap collection | Docs/product drift |
| Build date stamp format hardcoded `YYYY.MM.DD` | `client/scripts/write-build-date.js:4-9` | Add full timestamp/commit metadata (`buildDateTime`, `commit`) | Harder incident traceability |
| Seeder default host/message mismatch | `functions/scripts/seed-submissions.cjs:42-43` | Use single source for default host + log | Ingestion misconfiguration |
| Commented-out newsletter form path | `client/src/shared/navigation/Footer.vue:184-201` | Either implement endpoint or delete dead UI | Hidden unfinished feature |
| Test dataset contains unsupported `status: "pending"` records (for current runtime model) | `TEST_SUBMISSIONS.json:11,32,53,...`; submission status type in `client/src/data/models/submission.ts:5` only `published|hidden` | Align fixtures with runtime status model or isolate as explicit legacy fixture | Confusing local tests/manual seeding |
| SearchBar component exists but not wired in collections page | `client/src/features/collections/SearchBar.vue`; collections uses raw `<input>` at `CollectionsPage.vue:235-241` | Consolidate to single search component with debounce and analytics hooks | Divergent UX patterns |
| `docs/README.md` links to non-existent docs | `docs/README.md:6-17` | Update links or restore docs | Onboarding confusion |

---

## 4) Bugs & Footguns (Prioritized)

### P0

| Finding | Evidence | Why it bites | Repro |
|---|---|---|---|
| Report lifecycle is one-way on backend trigger path (stale moderation state) | `functions/src/index.ts:205-242` (`onReportCreate` only), `client/src/data/firestore/reports.repo.ts:67-79` updates report status but no trigger to recompute submission | `reportCount` and hidden state can drift from actual open report set after review/dismiss actions | 1) Create 3 reports to auto-hide submission. 2) Admin marks reports `reviewed`/`dismissed`. 3) Observe no automatic recalculation/unhide; submission remains hidden until manual admin toggle |

### P1

| Finding | Evidence | Why it bites | Repro |
|---|---|---|---|
| Seeder default host bug (writes may target wrong emulator) | `functions/scripts/seed-submissions.cjs:42-43` | Can silently point ingest to unintended emulator endpoint | Run seeder without `FIRESTORE_EMULATOR_HOST`; log says `8080` but env is set to `4000` |
| Public profile contribution count under-reports | `client/src/features/profile/PublicProfilePage.vue:96` | Trust metric is wrong for users with >1 page of submissions | Open profile with more than 12 submissions; header shows current loaded page count |
| Search result ordering is non-deterministic and non-ranked | `client/src/data/firestore/submissions.repo.ts:350-366` | Users see unstable ordering between searches/pages | Run same query repeatedly after data mutations; ordering can shift because merge order is query-source dependent |
| Route guard hard-blocks on profile readiness | `client/src/app/router/index.ts:109-112`, `client/src/features/profile/profile.store.ts:20-40` | Any listener stall delays route transitions globally | Simulate profile listener/network issues; navigation to protected routes can hang until store resolves |

### P2

| Finding | Evidence | Why it bites | Repro |
|---|---|---|---|
| Global load spinner is time-based, not app-state-based | `client/src/App.vue:51-53` | UX lag and inconsistency | Fresh load on fast machine still waits full 2s |
| “System online” is browser connectivity only | `client/src/shared/utils/dbStatus.ts:12-15`; `Footer.vue:170-182` | Misleading status during backend outages | Disable Firestore/Functions while browser still online; footer remains “SYSTEM ONLINE” |
| Collections filters are not applied during search calls | `client/src/features/collections/CollectionsPage.vue:69-77` | UI implies combined search+filters but query scope differs | Set language/type filters and run search; results do not enforce current filter state |

---

## 5) Performance Audit

| Issue | Evidence | Impact | Specific fix |
|---|---|---|---|
| No list virtualization in high-cardinality pages | `CollectionsPage.vue:331-341`, `DeskPage.vue:186-247`, `PublicProfilePage.vue:110-118` | Render/memory overhead grows linearly with loaded entries | Add windowed renderer; keep item heights predictable; load chunks by viewport |
| Search executes two Firestore queries per request and merges client-side | `client/src/data/firestore/submissions.repo.ts:345-348` | More read ops and merge overhead | Add server endpoint/callable for unified scoring + one paginated response cursor |
| Admin queue loads submissions and then separate report counts pass | `client/src/features/admin/AdminPage.vue:81-109` + `reports.repo.ts:88-101` | N+style extra reads on every refresh | Maintain `openReportCount` on submission documents via trigger and remove second pass |
| Favorites load does batched `in` reads after favorites fetch | `client/src/data/firestore/favorites.repo.ts:59-87` | Additional query rounds proportional to saved items | Denormalize key submission preview fields into favorite docs to avoid second fetch for list view |
| Repeated full reloads after admin actions | `client/src/features/admin/AdminPage.vue:115-127` | Extra network and UI jank | Local optimistic update + background refresh with stale-while-revalidate |

Recommended pagination strategy:
- Keep current cursor-based pagination, but emit deterministic sort key for search results and maintain per-query cache key: `term|type|language|status|sortBy|order|cursor`.

---

## 6) Security & Privacy Quick Pass (Pragmatic)

| Risk | Evidence | Why it matters | Action |
|---|---|---|---|
| Client performs direct submission updates (not callable) with partial rule validation only | `client/src/data/firestore/submissions.repo.ts:209-236`; rules at `firestore.rules:134-166` | Enum/business rule drift between client validation and rules can allow malformed but permitted writes | Move submission update to callable function with shared server validation; keep rules minimal/defensive |
| Private user data storage is broad under `privateUsers/{uid}` | `firestore.rules:112-115`; auth trigger stores `email`, `providerId` in `functions/src/index.ts:169-175` | PII footprint exists and should remain tightly controlled/log-safe | Ensure no UI logs/private exports include `privateUsers`; add explicit data retention policy |
| Console warnings/logs may expose payload structure during dev | `client/src/data/firestore/submissions.repo.ts:67-69` logs banned keys | Could leak sensitive fields in shared dev logs | Remove/guard logs behind explicit debug flag and redact keys |
| Environment variables for Firebase client are expected but not validated at startup | `client/src/data/firebase/client.ts:6-10` and `.env` docs at `docs/Runbook.md:20-30` | Misconfigurations cause runtime failures that can look like auth/service outages | Add startup env validation with actionable error UI |
| Storage is fully denied (secure default, but feature-blocking) | `storage.rules:7-10` | Any future upload feature will silently fail unless rules are intentionally opened | Keep deny-by-default, but document upload rollout plan before enabling file features |

What should move to env vars:
- Any future external API/model endpoints and keys (none currently in source runtime).

What should never be logged:
- `privateUsers` email/provider IDs, auth tokens, report details when containing personal data.

---

## 7) Next 10 Commits Plan

| # | Commit name | Scope | Likely files | Success criteria |
|---|---|---|---|---|
| 1 | Fix docs index and onboarding accuracy | Correct stale docs references and run instructions | `docs/README.md`, `docs/Runbook.md` | Docs links resolve; runbook matches actual scripts |
| 2 | Fix seeder emulator host mismatch | Align default host and message; add explicit CLI validation | `functions/scripts/seed-submissions.cjs` | Seeder defaults/logs consistent; no port ambiguity |
| 3 | Add moderation trigger parity | Recompute report counts on create/update/delete | `functions/src/index.ts` | Submission `reportCount` remains accurate after report resolution |
| 4 | Replace time-based app loader | Use readiness-based bootstrap state | `client/src/App.vue`, `client/src/app/router/index.ts`, `client/src/features/auth/auth.store.ts` | Loader disappears on true readiness, not fixed timeout |
| 5 | Wire filtered search contract | Apply type/language/sort constraints during search | `client/src/features/collections/CollectionsPage.vue`, `client/src/features/submissions/submissions.store.ts`, `client/src/data/firestore/submissions.repo.ts` | Search respects active filters and sort |
| 6 | Stabilize search ranking + order | Deterministic merge/scoring and pagination | `client/src/data/firestore/submissions.repo.ts` | Same query yields stable order across runs |
| 7 | Correct public profile metrics | Use authoritative contribution count | `client/src/features/profile/PublicProfilePage.vue`, possibly `profiles.repo.ts` | Header count equals profile `submissionCount` |
| 8 | Introduce project tests (phase 1) | Unit tests for stores/repos + basic function validation | Add `client` and `functions` test setup, plus test files | `npm test` exists and covers core CRUD/search/vote/report logic |
| 9 | Improve service health indicator | Replace navigator-only status with backend heartbeat | `client/src/shared/utils/dbStatus.ts`, `client/src/shared/navigation/Footer.vue`, small health probe module | Footer reflects Firestore/Functions availability, not only browser network |
| 10 | Remove dead/placeholder UI paths | Clean commented newsletter + unify search input component | `client/src/shared/navigation/Footer.vue`, `client/src/features/collections/SearchBar.vue`, `CollectionsPage.vue` | No dead commented feature blocks; one canonical search input path |

---

## Files Read (Top ~20 Most Important)

1. `client/src/main.ts`
2. `client/src/app/router/index.ts`
3. `client/src/App.vue`
4. `client/src/data/firebase/client.ts`
5. `client/src/data/firestore/submissions.repo.ts`
6. `client/src/features/submissions/submissions.store.ts`
7. `client/src/features/collections/CollectionsPage.vue`
8. `client/src/features/submissions/SubmissionDetailPage.vue`
9. `client/src/features/submissions/SubmissionCreatePage.vue`
10. `client/src/features/submissions/submission.validation.ts`
11. `client/src/features/admin/AdminPage.vue`
12. `client/src/features/admin/reports.store.ts`
13. `client/src/data/firestore/reports.repo.ts`
14. `client/src/data/firestore/comments.repo.ts`
15. `client/src/data/firestore/favorites.repo.ts`
16. `client/src/features/auth/auth.store.ts`
17. `client/src/features/profile/profile.store.ts`
18. `functions/src/index.ts`
19. `functions/scripts/seed-submissions.cjs`
20. `firestore.rules`
21. `firestore.indexes.json`
22. `docs/Runbook.md`
23. `docs/README.md`
24. `client/src/features/home/RoadmapPage.vue`
25. `client/src/features/profile/PublicProfilePage.vue`


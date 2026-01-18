# 0) Executive Summary

- What the app is: Abwaan is a digital archive for Somali poetry (Gabay) and proverbs (Maahmaahyo) with community contributions and exploration (docs/PROJECT_OVERVIEW.md:3-5; client/src/features/home/HomePage.vue:39-44).
- Who it is for: Somali community and diaspora, researchers/educators, and general readers interested in poetry, proverbs, and oral history (docs/PROJECT_OVERVIEW.md:6-9).
- Current state: Beta (UI labels call out "LIVE BETA") (client/src/features/home/AboutPage.vue:139-142; client/src/features/home/RoadmapPage.vue:197-199).

5 biggest strengths
1. Clear cultural mission and value proposition reinforced by UI copy (docs/PROJECT_OVERVIEW.md:3-5; client/src/features/home/HomePage.vue:39-44).
2. Core archive functionality is implemented end-to-end: create, list, view, search, and vote on submissions (client/src/features/submissions/SubmissionCreatePage.vue:76-107; client/src/features/collections/CollectionsPage.vue:24-321; client/src/features/submissions/SubmissionDetailPage.vue:819-841; client/src/data/firestore/submissions.repo.ts:170-401).
3. Auth + onboarding includes email/password, Google sign-in, and unique username claiming via Cloud Functions (client/src/features/auth/auth.store.ts:53-71; client/src/features/onboarding/UsernameOnboardingPage.vue:30-45; client/src/data/functions/usernames.ts:7-25; functions/src/index.ts:131-158).
4. Moderation/reporting pipeline exists with admin UI and automatic enforcement after report thresholds (client/src/features/admin/AdminPage.vue:262-380; client/src/data/firestore/reports.repo.ts:17-67; functions/src/index.ts:92-129).
5. Consistent UI system with shared empty/error states across major flows (docs/PROJECT_OVERVIEW.md:16-17; client/src/shared/components/EmptyState.vue:23-73; client/src/features/collections/CollectionsPage.vue:276-299).

10 biggest risks or gaps
1. Submissions are created client-side and default to `status: 'published'`, bypassing a moderation-first workflow (client/src/data/firestore/submissions.repo.ts:170-223) and rules currently allow only `published`/missing status on create (firestore.rules:90-95).
2. Server-side validation for submission fields is missing; validation is client-only (client/src/features/submissions/submission.validation.ts:34-97), and rules do not enforce lengths/types beyond status/ownership checks (firestore.rules:85-118).
3. `submissionCount` on profiles can be edited by the owner because rules only lock `username` and `isAdmin` (firestore.rules:55-65; client/src/data/firestore/profiles.repo.ts:35-37).
4. Report documents can contain arbitrary payloads; rules only verify `reporterUid` matches auth (firestore.rules:142-147), and the client sends report metadata without schema enforcement (client/src/data/firestore/reports.repo.ts:30-44).
5. Auto-moderation counts all distinct reporters ever; it does not filter by report status, so a restored submission can be re-pended indefinitely (functions/src/index.ts:100-129).
6. Search results have no pagination and are capped by two small Firestore queries (client/src/data/firestore/submissions.repo.ts:369-389; client/src/features/collections/CollectionsPage.vue:315-321).
7. Favorites list uses an N+1 pattern (one `getSubmission` per favorite), which will scale poorly (client/src/data/firestore/favorites.repo.ts:67-80).
8. `v-motion` directives are used but no Motion plugin is registered, leading to runtime warnings and dead code paths (client/src/shared/components/SubmissionCard.vue:32-35; client/src/features/home/HomePage.vue:15-28; client/src/main.ts:1-12).
9. Password reset/account recovery flow is not present (Not found in repo; no `sendPasswordResetEmail` usage).
10. Test coverage and CI/CD are missing (Not found in repo; no test files or pipeline configs).

3 fastest wins to improve quality immediately
1. Add a Cloud Function to create submissions with server-side validation and default `status: 'pending'` (client/src/data/firestore/submissions.repo.ts:170-223; functions/src/index.ts:1-249; firestore.rules:85-120).
2. Enforce report schema + one-report-per-user-per-submission in rules or Functions to reduce abuse (firestore.rules:142-147; client/src/data/firestore/reports.repo.ts:17-47; functions/src/index.ts:92-129).
3. Register Motion plugin or remove `v-motion` usage to avoid runtime warnings and dead directives (client/src/shared/components/SubmissionCard.vue:32-35; client/src/features/home/HomePage.vue:15-28; client/src/main.ts:1-12).

# 1) Product Overview

## 1.1 App mission & value prop (from README, UI copy, and code)
- Mission: preserve Somali oral literature and make the archive easy to explore/validate (docs/PROJECT_OVERVIEW.md:3-5).
- UI positioning: “A digital home for Gabay (Poetry) & Maahmaahyo (Proverbs)” (client/src/features/home/HomePage.vue:39-44).
- Content scope and audience are explicitly stated in project docs (docs/PROJECT_OVERVIEW.md:6-9).

## 1.2 Core user journeys (step-by-step)

Onboarding / auth flow
1. User lands on `/login` (router) and chooses register or login (client/src/app/router/index.ts:5-11; client/src/features/auth/LoginPage.vue:17-57).
2. Register: `auth.store.register` creates Firebase Auth user, profile displayName saved, then redirect to `/onboarding/username` (client/src/features/auth/auth.store.ts:53-56; client/src/features/auth/LoginPage.vue:39-49).
3. Profile bootstrap runs on auth create and writes profile/private user docs (functions/src/index.ts:32-64).
4. Username onboarding calls `claimUsername` callable function; success routes to `/` (client/src/features/onboarding/UsernameOnboardingPage.vue:30-45; client/src/data/functions/usernames.ts:7-25; functions/src/index.ts:131-158).

Create content flow
1. User navigates to `/contribute` (auth required) (client/src/app/router/index.ts:28-32).
2. Form validates via `validateSubmissionDraft`; on submit calls `submissionsStore.create` (client/src/features/submissions/SubmissionCreatePage.vue:31-107).
3. `createSubmission` writes to Firestore `submissions` with `status: 'published'` (client/src/data/firestore/submissions.repo.ts:170-223).
4. User is redirected to `/s/:id` (client/src/features/submissions/SubmissionCreatePage.vue:102-105).

Browse / search flow
1. User navigates to `/collections` and archive loads via `submissionsStore.loadLatest` (client/src/app/router/index.ts:18-21; client/src/features/collections/CollectionsPage.vue:56-69,165-167).
2. Filters (type, language) and sort update Firestore queries (client/src/features/collections/CollectionsPage.vue:24-39,174-178; client/src/data/firestore/submissions.repo.ts:225-263).
3. Search runs prefix + keyword queries (client/src/features/collections/CollectionsPage.vue:219-233; client/src/data/firestore/submissions.repo.ts:361-401).

Profile flow
1. `/settings` lets user update displayName/bio and claim username (client/src/app/router/index.ts:51-55; client/src/features/profile/ProfilePage.vue:42-203).
2. `/p/:uid` shows public profile and published submissions (client/src/app/router/index.ts:63-66; client/src/features/profile/PublicProfilePage.vue:58-129; client/src/features/profile/publicProfile.store.ts:37-50).
3. `/desk` shows user contributions and saved items (client/src/app/router/index.ts:45-49; client/src/features/desk/DeskPage.vue:159-260).

Admin / moderation flow
1. `/admin` requires auth + admin flag (client/src/app/router/index.ts:57-61; client/src/app/router/index.ts:115-116).
2. Admin loads submissions by status and can approve/hide (client/src/features/admin/AdminPage.vue:81-121,262-318; client/src/features/submissions/submissions.store.ts:165-191).
3. Reports are created from submission detail and reviewed in admin desk (client/src/features/submissions/SubmissionDetailPage.vue:276-308; client/src/features/admin/AdminPage.vue:323-380; client/src/data/firestore/reports.repo.ts:17-67).
4. Reports auto-trigger status change after 3 distinct reporters (functions/src/index.ts:92-129).

## 1.3 Feature inventory (Truth Table)

| Feature | Status | Where in UI (route/page) | Backend support exists? | Evidence | What’s missing |
| --- | --- | --- | --- | --- | --- |
| Auth (Email/Password + Google) | Done | `/login` | Yes | client/src/features/auth/LoginPage.vue:39-183; client/src/features/auth/auth.store.ts:53-71 | — |
| Session persistence | Done | App-wide | Yes | client/src/features/auth/auth.store.ts:84-87 | — |
| Username claiming | Done | `/onboarding/username`, `/settings` | Yes (callable) | client/src/features/onboarding/UsernameOnboardingPage.vue:30-45; client/src/data/functions/usernames.ts:7-25; functions/src/index.ts:131-158 | — |
| Profile settings (displayName/bio) | Done | `/settings` | Yes | client/src/features/profile/ProfilePage.vue:42-149; client/src/data/firestore/profiles.repo.ts:35-37 | — |
| Public profile page | Done | `/p/:uid` | Yes | client/src/features/profile/PublicProfilePage.vue:58-129; client/src/features/profile/publicProfile.store.ts:37-50 | — |
| Submission create | Partial | `/contribute` | Yes (client Firestore) | client/src/features/submissions/SubmissionCreatePage.vue:76-107; client/src/data/firestore/submissions.repo.ts:170-223 | No server-side create/validation or pending status gating |
| Submission view | Done | `/s/:id` | Yes | client/src/features/submissions/SubmissionDetailPage.vue:458-507; client/src/data/firestore/submissions.repo.ts:265-270 | — |
| Submission edit (author) | Done | `/s/:id` | Yes | client/src/features/submissions/SubmissionDetailPage.vue:311-345; client/src/data/firestore/submissions.repo.ts:272-299 | — |
| Submission delete (author) | Done | `/s/:id` | Yes | client/src/features/submissions/SubmissionDetailPage.vue:244-254; client/src/features/submissions/submissions.store.ts:253-268 | — |
| Moderation hide/restore | Done | `/admin`, `/s/:id` | Yes | client/src/features/admin/AdminPage.vue:111-121; client/src/features/submissions/SubmissionDetailPage.vue:940-957; client/src/data/firestore/submissions.repo.ts:301-313 | — |
| Moderation gating (published-only reads) | Partial | App-wide | Yes (rules) | firestore.rules:85-90 | New submissions default to `published` so gating isn’t protective on create |
| Reporting (submit) | Done | `/s/:id` | Yes | client/src/features/submissions/SubmissionDetailPage.vue:276-308; client/src/data/firestore/reports.repo.ts:17-47 | — |
| Report review queue | Done | `/admin` | Yes | client/src/features/admin/AdminPage.vue:323-380; client/src/features/admin/reports.store.ts:12-49 | — |
| Auto-report enforcement | Done | Background | Yes (function) | functions/src/index.ts:92-129 | No status-aware counting (all time) |
| Voting (up/down) | Done | `/s/:id` | Yes (callable) | client/src/features/submissions/SubmissionDetailPage.vue:819-841; client/src/data/functions/votes.ts:4-7; functions/src/index.ts:160-249 | — |
| Comments | Done | `/s/:id` | Yes | client/src/features/submissions/CommentForm.vue:56-92; client/src/data/firestore/comments.repo.ts:32-82; firestore.rules:122-135 | — |
| Favorites (save/unsave) | Done | `/s/:id`, `/desk` | Yes | client/src/features/submissions/SubmissionDetailPage.vue:870-893; client/src/features/desk/DeskPage.vue:211-260; client/src/data/firestore/favorites.repo.ts:29-41 | — |
| Desk: contributions + saved | Done | `/desk` | Yes | client/src/features/desk/DeskPage.vue:159-260 | — |
| Desk: “Favorites coming soon” tab | Placeholder | `/desk` | No | client/src/features/desk/DeskPage.vue:263-270 | Feature not implemented |
| Archive browsing + pagination | Done | `/collections` | Yes | client/src/features/collections/CollectionsPage.vue:260-321; client/src/shared/components/LoadMore.vue:15-36 | Search pagination missing |
| Search (prefix + keyword) | Done | `/collections` | Yes | client/src/features/collections/CollectionsPage.vue:219-233; client/src/data/firestore/submissions.repo.ts:361-401 | No pagination for search results |
| Filters: type/language + sort | Done | `/collections` | Yes | client/src/features/collections/CollectionsPage.vue:24-39; client/src/data/firestore/submissions.repo.ts:225-263; firestore.indexes.json:50-165 | — |
| Share link | Done | `/s/:id` | N/A | client/src/features/submissions/SubmissionDetailPage.vue:257-260 | No clipboard error handling |
| Roadmap page | Done (static) | `/roadmap` | N/A | client/src/features/home/RoadmapPage.vue:111-201 | Static content only |
| User collections (curated) | Not started | — | No | docs/PROJECT_OVERVIEW.md:19-24; client/src/features/home/RoadmapPage.vue:96-100 | Not found in repo |
| Tags/metadata UI | Not started | — | No | client/src/features/home/RoadmapPage.vue:101-105 | Not found in repo |
| Audio recitations | Not started | — | No | client/src/features/home/RoadmapPage.vue:91-95 | Not found in repo |
| Multi-language beyond `so/en` | Not started | — | No | client/src/data/models/submission.ts:2; client/src/features/submissions/SubmissionCreatePage.vue:176-180 | Not found in repo |
| Password reset | Not started | — | No | Not found in repo | Not found in repo |
| Footer social links | Placeholder | Global footer | No | client/src/shared/navigation/Footer.vue:167-170 | Placeholder “Coming Soon” |
| Empty/error states | Done | Many pages | N/A | client/src/shared/components/EmptyState.vue:23-73; client/src/features/collections/CollectionsPage.vue:276-299 | — |

# 2) Architecture & Codebase Map

## 2.1 Tech stack
- Frontend: Vue 3 + Vite + TypeScript + Tailwind CSS (client/package.json:1-52; client/vite.config.ts:4-15; client/tailwind.config.js:1-89).
- State: Pinia (client/package.json:18-19).
- Routing: Vue Router (client/package.json:20-21; client/src/app/router/index.ts:1-77).
- Backend: Firebase Auth/Firestore/Functions (client/package.json:15-17; functions/package.json:1-24; client/src/data/firebase/client.ts:1-26).
- Hosting: Firebase Hosting (firebase.json:47-71).

## 2.2 Folder structure map
- `client/`: Vue frontend, routes, features, shared components, data layer (client/src/app/router/index.ts:1-77; client/src/features/*; client/src/data/*).
- `functions/`: Firebase Cloud Functions (functions/src/index.ts:1-249).
- `docs/`: project documentation (docs/README.md:1-9).
- Firebase config/rules/indexes: `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `storage.rules` (firebase.json:1-71; firestore.rules:1-153; firestore.indexes.json:50-279; storage.rules:1-10).
- Seed/test data: `TEST_SUBMISSIONS.json` (TEST_SUBMISSIONS.json:1-40).

## 2.3 Routing map

| Route | Component | Auth required | Admin required | Evidence |
| --- | --- | --- | --- | --- |
| `/login` | LoginPage | No (guest only) | No | client/src/app/router/index.ts:5-11 |
| `/` | HomePage | No | No | client/src/app/router/index.ts:13-16 |
| `/collections` | CollectionsPage | No | No | client/src/app/router/index.ts:18-21 |
| `/about` | AboutPage | No | No | client/src/app/router/index.ts:23-26 |
| `/contribute` | SubmissionCreatePage | Yes | No | client/src/app/router/index.ts:28-32 |
| `/s/:id` | SubmissionDetailPage | No | No | client/src/app/router/index.ts:34-37 |
| `/onboarding/username` | UsernameOnboardingPage | Yes | No | client/src/app/router/index.ts:39-43 |
| `/desk` | DeskPage | Yes | No | client/src/app/router/index.ts:45-49 |
| `/settings` | ProfilePage | Yes | No | client/src/app/router/index.ts:51-55 |
| `/admin` | AdminPage | Yes | Yes | client/src/app/router/index.ts:57-61 |
| `/p/:uid` | PublicProfilePage | No | No | client/src/app/router/index.ts:63-66 |
| `/roadmap` | RoadmapPage | No | No | client/src/app/router/index.ts:68-71 |
| `/:pathMatch(.*)*` | NotFoundPage | No | No | client/src/app/router/index.ts:73-76 |

## 2.4 Data model map

profiles (`/profiles/{uid}`)
- Fields: `displayName`, `username`, `bio`, `photoURL`, `createdAt`, `lastLoginAt`, `submissionCount`, `isAdmin` (client/src/data/firestore/profiles.repo.ts:4-13; functions/src/index.ts:42-53).
- Written: on auth create (functions/src/index.ts:32-64), username claim (functions/src/index.ts:148-155), profile edits (client/src/data/firestore/profiles.repo.ts:35-37).
- Read: profile store + public profile store (client/src/data/firestore/profiles.repo.ts:15-33; client/src/features/profile/profile.store.ts:33-40; client/src/features/profile/publicProfile.store.ts:37-50).
- Validation: username format enforced by Cloud Function (functions/src/index.ts:17-28); no server validation for displayName/bio.
- Access rules: read public; create/update owner with username/isAdmin locked (firestore.rules:55-65).

privateUsers (`/privateUsers/{uid}`)
- Fields: `email`, `providerId`, `lastLoginAt` (functions/src/index.ts:58-63).
- Subcollections: `favorites` with `submissionId`, `savedAt` (client/src/data/models/favorite.ts:1-4).
- Access rules: owner-only (firestore.rules:68-76).

usernames (`/usernames/{name}`)
- Fields: `uid`, `usernameOriginal`, `createdAt` (functions/src/index.ts:148-152).
- Written via callable `claimUsername` (functions/src/index.ts:131-158); read-only in rules (firestore.rules:79-82).

submissions (`/submissions/{id}`)
- Fields: `uid`, `displayName`, `username`, `type`, `language`, `origin`, `status`, `title`, `text`, `meaning`, `translation`, `source`, `createdAt`, `updatedAt`, `voteUp`, `voteDown`, `voteScore`, `searchIndex`, `searchKeywords` (client/src/data/models/submission.ts:12-37).
- Written: create via `addDoc` (client/src/data/firestore/submissions.repo.ts:170-223); update via `updateDoc` (client/src/data/firestore/submissions.repo.ts:272-299); status updates (client/src/data/firestore/submissions.repo.ts:301-313).
- Search fields: built on create/update (client/src/data/firestore/submissions.repo.ts:93-137,280-290).
- Access rules: published reads + owner/admin, create constraints on uid/displayName/username, owner updates with locked system fields, admin override (firestore.rules:85-120).

comments (`/submissions/{id}/comments/{commentId}`)
- Fields: `submissionId`, `uid`, `displayName`, `username`, `body`, `createdAt`, `updatedAt` (client/src/data/models/comment.ts:1-10).
- Written/Read: `createComment`, `listComments` (client/src/data/firestore/comments.repo.ts:32-82).
- Validation: rule enforces body length 1..2000 (firestore.rules:124-132).

votes (`/submissions/{id}/votes/{uid}`)
- Fields: `value`, `updatedAt`, `createdAt` (functions/src/index.ts:232-245).
- Written via callable `voteSubmission` (functions/src/index.ts:160-249; client/src/data/functions/votes.ts:4-7).
- Access rules: read-only for owner uid (firestore.rules:137-139).

reports (`/reports/{id}`)
- Fields: `submissionId`, `submissionType`, `submissionTitle`, `submissionAuthorUid`, `submissionAuthorUsername`, `reporterUid`, `reporterUsername`, `reason`, `details`, `status`, `createdAt`, `reviewedAt`, `reviewedBy` (client/src/data/models/report.ts:6-20).
- Written/Read: `createReport`, `listReports`, `updateReportStatus` (client/src/data/firestore/reports.repo.ts:17-67).
- Access rules: create by signed-in reporter, read/update/delete admin-only (firestore.rules:142-147).

# 3) Backend / APIs / Auth

## 3.1 Auth overview
- Provider: Firebase Auth (client/src/data/firebase/client.ts:1-16).
- Sign-in methods: Email/Password + Google (client/src/features/auth/auth.store.ts:53-71).
- Session handling: browser local persistence (client/src/features/auth/auth.store.ts:84-87).
- Protected routes: `/contribute`, `/onboarding/username`, `/desk`, `/settings`, `/admin`; admin-only for `/admin` (client/src/app/router/index.ts:28-61,91-116).

## 3.2 API endpoints

Callable Functions (HTTPS)
| Name | Type | Request | Response | Caller locations | Evidence |
| --- | --- | --- | --- | --- | --- |
| `claimUsername` | Callable | `{ username: string }` | `{ ok: boolean, username: string }` | Username onboarding + settings | client/src/data/functions/usernames.ts:7-25; client/src/features/onboarding/UsernameOnboardingPage.vue:30-45; client/src/features/profile/ProfilePage.vue:53-66; functions/src/index.ts:131-158 |
| `voteSubmission` | Callable | `{ submissionId: string, value: 1 | -1 | 0 }` | `{ ok: boolean }` | Submission detail vote buttons | client/src/data/functions/votes.ts:4-7; client/src/features/submissions/submissions.store.ts:231-232; functions/src/index.ts:160-249 |

Background triggers (system)
- `onAuthUserCreate`: creates `profiles` and `privateUsers` docs (functions/src/index.ts:32-64).
- `onSubmissionCreate`/`onSubmissionDelete`: keeps `submissionCount` in sync (functions/src/index.ts:67-90).
- `onReportCreate`: moves submission to `pending` after 3 distinct reporters (functions/src/index.ts:92-129).

## 3.3 Security & access control
- Firestore rules enforce read access to published submissions or owner/admin (firestore.rules:85-90).
- Profiles are publicly readable; updates limited to owner and prevent `username`/`isAdmin` changes (firestore.rules:55-65).
- Reports: only admin can read/update/delete (firestore.rules:142-147).
- Comments: length validation for `body` (1..2000) in rules (firestore.rules:124-132).
- Storage is disabled (storage.rules:7-10).

Potential privilege escalation paths
- `submissionCount` can be altered by the profile owner (rules do not lock it) (firestore.rules:55-65; client/src/data/firestore/profiles.repo.ts:35-37).
- Reports allow arbitrary fields beyond `reporterUid` matching auth (firestore.rules:142-147; client/src/data/firestore/reports.repo.ts:30-44).

Secrets exposure
- No hard-coded secrets found; only `.env.example` placeholders (client/.env.example:1-9; functions/.env.example:1-2).

# 4) Data Integrity & Error Handling

Validation
- Client-side submission validation (lengths, required fields, URL checks) (client/src/features/submissions/submission.validation.ts:34-97).
- Username format enforced in Cloud Function (functions/src/index.ts:17-28).
- Comment length enforced by rules (firestore.rules:124-132).

Gaps and integrity risks
- Submissions can bypass client validation if written directly; rules do not enforce length/type for submission fields (firestore.rules:85-118).
- Report schema is not validated server-side (firestore.rules:142-147; client/src/data/firestore/reports.repo.ts:30-44).
- Profile `submissionCount` can be tampered with by owner updates (firestore.rules:55-65).

Failure handling
- Error handling is mostly toasts or simple state flags; errors are logged to console in stores (client/src/features/submissions/submissions.store.ts:62-64; client/src/features/profile/publicProfile.store.ts:51-52; client/src/features/submissions/comments.store.ts:50-55).
- Clipboard share has no error handling (client/src/features/submissions/SubmissionDetailPage.vue:257-259).

Retry/backoff
- Not found in repo.

Logging strategy
- Console logging only; no central logging/monitoring found (client/src/features/submissions/submissions.store.ts:62-64; client/src/features/profile/publicProfile.store.ts:51-52).

# 5) UI/UX Audit (no fluff, actionable)

Home (`/`)
- What it does: hero messaging + latest entries (client/src/features/home/HomePage.vue:1-180).
- Resolved: latest entries now show a loading skeleton when `submissionsStore.busy` and items are empty (client/src/features/home/HomePage.vue:161-186).

Collections (`/collections`)
- What it does: search, filter, sort, and paginate archive (client/src/features/collections/CollectionsPage.vue:24-321).
- Resolved: search results paginate and show `LoadMore` for search queries (client/src/features/collections/CollectionsPage.vue:311-346).
- Resolved: custom dropdown now has ARIA roles + keyboard navigation (client/src/shared/components/BaseDropdown.vue:1-199).

Contribute (`/contribute`)
- What it does: multi-step submission form with validation (client/src/features/submissions/SubmissionCreatePage.vue:115-419).
- Resolved: labels now use `for`/`id` across inputs and selects (client/src/features/submissions/SubmissionCreatePage.vue:146-397).

Submission detail (`/s/:id`)
- What it does: view entry, vote, save, report, edit, comment (client/src/features/submissions/SubmissionDetailPage.vue:458-1097).
- Resolved: share uses clipboard with legacy/prompt fallback (client/src/features/submissions/SubmissionDetailPage.vue:263-294).
- Resolved: report modal supports Escape close + focus return on close (client/src/features/submissions/SubmissionDetailPage.vue:327-474).
- Mobile/responsive risk: comments list uses a fixed internal scroll container (`max-h-[520px]`), creating nested scrolling (client/src/features/submissions/CommentList.vue:52-87).

Desk (`/desk`)
- What it does: contributions and saved entries (client/src/features/desk/DeskPage.vue:159-260).
- Resolved: removed the unused “Favorites coming soon” tab and view (client/src/features/desk/DeskPage.vue:7-24,200-260).

Settings (`/settings`)
- What it does: edit profile + claim username (client/src/features/profile/ProfilePage.vue:101-203).
- Resolved: labels now use `for`/`id` on profile inputs (client/src/features/profile/ProfilePage.vue:110-197).

Public profile (`/p/:uid`)
- What it does: shows profile and published works (client/src/features/profile/PublicProfilePage.vue:58-129).
- Missing state: none; empty state is implemented for no contributions (client/src/features/profile/PublicProfilePage.vue:131-138).

Admin (`/admin`)
- What it does: moderation queue + report review (client/src/features/admin/AdminPage.vue:173-380).
- Resolved: report filters include `dismissed` (client/src/features/admin/AdminPage.vue:221-231).

Login (`/login`)
- What it does: register/login with Google option (client/src/features/auth/LoginPage.vue:39-183).
- Missing state: password reset/recovery not present (Not found in repo).

Onboarding (`/onboarding/username`)
- What it does: claim username (client/src/features/onboarding/UsernameOnboardingPage.vue:30-122).
- Missing state: none; handles validation errors (client/src/features/onboarding/UsernameOnboardingPage.vue:30-45,124-126).

About (`/about`) and Roadmap (`/roadmap`)
- What they do: narrative/roadmap content; no functional interactions (client/src/features/home/AboutPage.vue:8-285; client/src/features/home/RoadmapPage.vue:111-201).

# 6) Performance Audit

- Bundle size risk: multiple large JPGs are imported into the Home and About bundles (client/src/features/home/HomePage.vue:190-198; client/src/features/home/AboutPage.vue:1-3).
- Image loading improved: hero images marked `eager` + `fetchpriority`, and below-fold logos are `lazy`; no responsive `srcset/sizes` yet (client/src/features/home/HomePage.vue:53-60; client/src/features/home/AboutPage.vue:48-54,242; client/src/shared/navigation/Footer.vue:58-64).
- Favorites list now batches submission fetches by document ID, removing N+1 reads (client/src/data/firestore/favorites.repo.ts:52-88).
- Search executes two Firestore queries per page (prefix + keyword) and merges results, doubling read cost per page (client/src/data/firestore/submissions.repo.ts:336-348,350-358).
- Fonts now load via `<link>` + `preconnect` in HTML instead of CSS `@import` (client/index.html:4-12; client/src/assets/style.css:1-3).
- Firestore offline persistence enabled (multi-tab) to reduce repeat reads (client/src/data/firebase/client.ts:1-21).

# 7) Testing & Quality

- Existing tests: Not found in repo.
- Missing tests (critical paths): auth flows, submission create/edit/delete, report creation + admin resolution, moderation status changes, Firestore rule verification.
- Lint/format tooling: ESLint + Prettier in client (client/eslint.config.ts:1-22; client/.prettierrc:1-9) and ESLint scripts in functions (functions/package.json:1-12).
- CI/CD: Not found in repo (no pipeline configs).

# 8) Operational Readiness

- Environments: local `.env` variables required; emulators used in dev (docs/RUNBOOK.md:17-33; client/src/data/firebase/client.ts:22-26).
- Deploy: documented Firebase Hosting + Functions deployment flow (docs/RUNBOOK.md:50-65; firebase.json:47-71).
- Monitoring/analytics: Not found in repo.
- Backups/migrations: Not found in repo.

# 9) Recommended Roadmap

## 9.1 Critical fixes (P0) - must do before public release

| Item | Why it matters | Specific files to touch | Effort | Dependencies |
| --- | --- | --- | --- | --- |
| Server-side submission create + validation + default `pending` | Prevents bypass of validation and supports moderation-first workflow | functions/src/index.ts; client/src/data/firestore/submissions.repo.ts; firestore.rules | L | Firebase Functions deploy |
| Lock `submissionCount` and validate report schema in rules | Protects data integrity and prevents tampered metrics/abusive reports | firestore.rules | M | None |
| Add report anti-duplication (one report per user per submission) | Reduces spam + cost; improves moderation signal quality | functions/src/index.ts or firestore.rules; client/src/data/firestore/reports.repo.ts | M | Depends on data model decision |

## 9.2 High-impact improvements (P1) - DONE

| Item | Why it matters | Specific files to touch | Effort | Dependencies |
| --- | --- | --- | --- | --- |
| Search pagination + result count | Improves discovery and avoids silent caps | client/src/features/collections/CollectionsPage.vue; client/src/features/submissions/submissions.store.ts; client/src/data/firestore/submissions.repo.ts | M | Firestore indexes for pagination |
| Add dismissed reports filter | Prevents “lost” reports after dismissal | client/src/features/admin/AdminPage.vue; client/src/features/admin/reports.store.ts | S | None |
| Register Motion plugin or remove `v-motion` | Eliminates runtime warnings + dead directives | client/src/main.ts; client/src/shared/components/SubmissionCard.vue; client/src/features/home/HomePage.vue | S | None |
| Password reset flow | Reduces account support burden | client/src/features/auth/LoginPage.vue; client/src/features/auth/auth.store.ts | M | Firebase Auth config |

## 9.3 Nice-to-haves (P2)  - ship next

| Item | Why it matters | Specific files to touch | Effort | Dependencies |
| --- | --- | --- | --- | --- |
| User-curated collections | Increases engagement and sharing | New data model + UI; likely client/src/features/desk/DeskPage.vue; firestore.rules | L | Data model + rules |
| Tags/metadata + themed discovery | Enables deeper search and browsing | New fields in submissions + UI; client/src/features/collections/CollectionsPage.vue | L | Firestore indexes |
| Audio recitations | Adds richness to oral tradition | Storage + media UI; storage.rules | L | Firebase Storage rules + UI |
| Analytics/monitoring | Improves product decisions + stability | New tooling; no current baseline | M | Provider selection |

# 10) “If I were maintaining this” checklist

- [ ] Review admin queue + reports daily (`/admin`) (client/src/app/router/index.ts:57-61; client/src/features/admin/AdminPage.vue:173-380).
- [ ] Monitor Firestore rules for integrity regressions (firestore.rules:1-153).
- [ ] Run `npm --prefix client run lint` and `npm --prefix client run type-check` before releases (client/package.json:10-18).
- [ ] Run `npm --prefix functions run lint` before deploying Functions (functions/package.json:1-12).
- [ ] Verify build stamp and version after deploy (`/roadmap` build stamp) (client/src/features/home/RoadmapPage.vue:18-33; client/public/build.json:1-3).

# Appendix

## A) TODO / FIXME
- Not found in repo.

## B) “Coming soon” / placeholders
- Desk tab placeholder: “Favorites coming soon” (client/src/features/desk/DeskPage.vue:263-270).
- Footer network placeholder: “Coming Soon” (client/src/shared/navigation/Footer.vue:167-170).

## C) Disabled UI controls
- Load more button disabled while loading (client/src/shared/components/LoadMore.vue:19).
- Username onboarding submit disabled while busy (client/src/features/onboarding/UsernameOnboardingPage.vue:113).
- Login submit disabled while auth busy (client/src/features/auth/LoginPage.vue:154).
- Google login disabled while auth busy (client/src/features/auth/LoginPage.vue:174).
- Submission create submit disabled when invalid (client/src/features/submissions/SubmissionCreatePage.vue:407).
- Profile save disabled while busy (client/src/features/profile/ProfilePage.vue:143).
- Username claim disabled while busy (client/src/features/profile/ProfilePage.vue:197).
- Submission edit save disabled when invalid/unchanged (client/src/features/submissions/SubmissionDetailPage.vue:785).
- Vote buttons disabled for guests or busy state (client/src/features/submissions/SubmissionDetailPage.vue:822,835).
- Favorite toggle disabled while busy (client/src/features/submissions/SubmissionDetailPage.vue:871).
- Edit mode toggle disabled while busy (client/src/features/submissions/SubmissionDetailPage.vue:932).
- Report submit disabled while busy (client/src/features/submissions/SubmissionDetailPage.vue:1090).
- Comment submit disabled while invalid (client/src/features/submissions/CommentForm.vue:88).

## D) Unfinished routes
- `/desk` has an unfinished “Favorites” (liked) tab with placeholder content (client/src/features/desk/DeskPage.vue:263-270).

## E) Keyword scan (coming soon / TODO / FIXME / disabled / placeholder / stub / mock / temp)

Not found in repo: TODO, FIXME, temp.

| Keyword | Exact string | File path | Line number(s) | Suggested completion action |
| --- | --- | --- | --- | --- |
| coming soon | `title="Favorites coming soon"` | `client/src/features/desk/DeskPage.vue` | 267 | Implement the favorites tab or remove the placeholder title. |
| placeholder | `placeholder="username"` | `client/src/features/onboarding/UsernameOnboardingPage.vue` | 101 | Confirm copy and ensure username rules are visible. |
| placeholder | `placeholder:text-gray-200` | `client/src/features/onboarding/UsernameOnboardingPage.vue` | 102 | Verify placeholder contrast meets accessibility guidelines. |
| placeholder | `placeholder?: string` | `client/src/features/collections/SearchBar.vue` | 5 | Document prop usage/defaults for search inputs. |
| placeholder | `:placeholder="placeholder || 'Search...'"` | `client/src/features/collections/SearchBar.vue` | 39 | Centralize copy (or i18n) if placeholder text is product-facing. |
| placeholder | `placeholder:text-gray-300` | `client/src/features/collections/SearchBar.vue` | 40 | Verify placeholder contrast meets accessibility guidelines. |
| placeholder | `placeholder="Full Name"` | `client/src/features/auth/LoginPage.vue` | 119 | Confirm copy matches validation requirements. |
| placeholder | `placeholder="Email Address"` | `client/src/features/auth/LoginPage.vue` | 133 | Confirm copy matches validation requirements. |
| placeholder | `placeholder="Password"` | `client/src/features/auth/LoginPage.vue` | 147 | Confirm copy matches validation requirements. |
| placeholder | `placeholder:text-gray-300` | `client/src/features/auth/LoginPage.vue` | 120, 134, 148 | Verify placeholder contrast meets accessibility guidelines. |
| placeholder | `placeholder="Search database..."` | `client/src/features/collections/CollectionsPage.vue` | 223 | Confirm copy and align with search scope. |
| placeholder | `placeholder:text-gray-400` | `client/src/features/collections/CollectionsPage.vue` | 224 | Verify placeholder contrast meets accessibility guidelines. |
| placeholder | `placeholder="Record a new note for this entry..."` | `client/src/features/submissions/CommentForm.vue` | 77 | Confirm copy and reflect max-length expectations. |
| placeholder | `placeholder:text-gray-300` | `client/src/features/submissions/CommentForm.vue` | 76 | Verify placeholder contrast meets accessibility guidelines. |
| placeholder | `placeholder="Enter title..."` | `client/src/features/submissions/SubmissionCreatePage.vue` | 211 | Confirm copy and align with poetry-only requirement. |
| placeholder | `placeholder="Begin writing here..."` | `client/src/features/submissions/SubmissionCreatePage.vue` | 231 | Confirm copy and align with max-length guidance. |
| placeholder | `placeholder="Explain the context..."` | `client/src/features/submissions/SubmissionCreatePage.vue` | 261 | Confirm copy and align with meaning/translation expectations. |
| placeholder | `placeholder="Literal translation..."` | `client/src/features/submissions/SubmissionCreatePage.vue` | 281 | Confirm copy and clarify optionality. |
| placeholder | `placeholder:text-gray-200` | `client/src/features/submissions/SubmissionCreatePage.vue` | 212 | Verify placeholder contrast meets accessibility guidelines. |
| placeholder | `placeholder:text-gray-300` | `client/src/features/submissions/SubmissionCreatePage.vue` | 232, 262, 282, 387 | Verify placeholder contrast meets accessibility guidelines. |
| placeholder | `placeholder="Enter title..."` | `client/src/features/submissions/SubmissionDetailPage.vue` | 602 | Confirm edit-mode copy and align with validation. |
| placeholder | `placeholder="Begin writing here..."` | `client/src/features/submissions/SubmissionDetailPage.vue` | 622 | Confirm edit-mode copy and align with validation. |
| placeholder | `placeholder="Explain the context..."` | `client/src/features/submissions/SubmissionDetailPage.vue` | 644 | Confirm edit-mode copy and align with validation. |
| placeholder | `placeholder="Literal translation..."` | `client/src/features/submissions/SubmissionDetailPage.vue` | 664 | Confirm edit-mode copy and align with validation. |
| placeholder | `placeholder="Share any context that helps the review."` | `client/src/features/submissions/SubmissionDetailPage.vue` | 1075 | Confirm copy and clarify optionality. |
| placeholder | `placeholder:text-gray-200` | `client/src/features/submissions/SubmissionDetailPage.vue` | 603 | Verify placeholder contrast meets accessibility guidelines. |
| placeholder | `placeholder:text-gray-300` | `client/src/features/submissions/SubmissionDetailPage.vue` | 623, 645, 665 | Verify placeholder contrast meets accessibility guidelines. |
| placeholder | `placeholder="e.g. Arawelo"` | `client/src/features/profile/ProfilePage.vue` | 117 | Confirm example is desired and aligns with display name rules. |
| placeholder | `placeholder="Tell the community about yourself..."` | `client/src/features/profile/ProfilePage.vue` | 129 | Confirm copy and align with any bio length guidance. |
| placeholder | `placeholder="username"` | `client/src/features/profile/ProfilePage.vue` | 191 | Confirm copy and surface username rules. |
| placeholder | `placeholder:text-gray-300` | `client/src/features/profile/ProfilePage.vue` | 119, 130 | Verify placeholder contrast meets accessibility guidelines. |
| disabled | `:disabled="loading"` | `client/src/shared/components/LoadMore.vue` | 19 | Ensure loading feedback is visible (spinner/aria-busy). |
| disabled | `disabled:opacity-50 disabled:cursor-wait` | `client/src/shared/components/LoadMore.vue` | 20 | Ensure styling only applies when the control is actually disabled. |
| disabled | `:disabled="busy || profileStore.busy"` | `client/src/features/onboarding/UsernameOnboardingPage.vue` | 113 | Keep busy state in sync with submission; show progress while disabled. |
| disabled | `disabled:opacity-50 disabled:cursor-not-allowed` | `client/src/features/onboarding/UsernameOnboardingPage.vue` | 114 | Ensure styling only applies when the control is actually disabled. |
| disabled | `:disabled="authStore.busy"` | `client/src/features/auth/LoginPage.vue` | 154, 174 | Ensure busy state resets on error and provides feedback. |
| disabled | `disabled:opacity-50 disabled:cursor-wait` | `client/src/features/auth/LoginPage.vue` | 155 | Ensure styling only applies when the control is actually disabled. |
| disabled | `:disabled="!canPost"` | `client/src/features/submissions/CommentForm.vue` | 88 | Surface validation reason when posting is disabled. |
| disabled | `disabled:opacity-50 disabled:cursor-not-allowed` | `client/src/features/submissions/CommentForm.vue` | 87 | Ensure styling only applies when the control is actually disabled. |
| disabled | `:disabled="!canSubmit"` | `client/src/features/submissions/SubmissionCreatePage.vue` | 407 | Expose validation summary when submit is disabled. |
| disabled | `disabled:opacity-50 disabled:cursor-not-allowed` | `client/src/features/submissions/SubmissionCreatePage.vue` | 408 | Ensure styling only applies when the control is actually disabled. |
| disabled | `:disabled="!canSave"` | `client/src/features/submissions/SubmissionDetailPage.vue` | 785 | Show why save is disabled (no changes or invalid input). |
| disabled | `:disabled="submissionsStore.busy || isGuest"` | `client/src/features/submissions/SubmissionDetailPage.vue` | 822, 835 | Provide login prompt for guests and busy-state feedback. |
| disabled | `:disabled="favoritesStore.busy"` | `client/src/features/submissions/SubmissionDetailPage.vue` | 871 | Show a brief busy indicator while toggling favorites. |
| disabled | `:disabled="submissionsStore.busy"` | `client/src/features/submissions/SubmissionDetailPage.vue` | 932 | Show a busy indicator when edit mode is locked. |
| disabled | `:disabled="reportBusy"` | `client/src/features/submissions/SubmissionDetailPage.vue` | 1090 | Show submitting feedback to prevent double submit. |
| disabled | `disabled:opacity-60` | `client/src/features/submissions/SubmissionDetailPage.vue` | 784, 872, 1089 | Ensure styling only applies when the control is actually disabled. |
| disabled | `disabled:opacity-50` | `client/src/features/submissions/SubmissionDetailPage.vue` | 823, 836 | Ensure styling only applies when the control is actually disabled. |
| disabled | `:disabled="profileStore.busy"` | `client/src/features/profile/ProfilePage.vue` | 143 | Show saving indicator and ensure busy state resets on error. |
| disabled | `disabled:opacity-50 disabled:cursor-not-allowed` | `client/src/features/profile/ProfilePage.vue` | 144 | Ensure styling only applies when the control is actually disabled. |
| disabled | `:disabled="claimBusy"` | `client/src/features/profile/ProfilePage.vue` | 197 | Show username claim progress and error state. |
| disabled | `disabled:opacity-50` | `client/src/features/profile/ProfilePage.vue` | 198 | Ensure styling only applies when the control is actually disabled. |
| mock | `"jest-mock": "30.2.0"` | `functions/package-lock.json` | 1192, 1268 | No product action; remove parent dependency and regenerate lockfile if unused. |
| mock | `"jest-mock": "30.2.0",` | `functions/package-lock.json` | 1239, 4069, 6001, 6229 | No product action; remove parent dependency and regenerate lockfile if unused. |
| mock | `"node_modules/jest-mock": {` | `functions/package-lock.json` | 6089 | No product action; lockfile entry is transitive. |
| mock | `"resolved": "https://registry.npmjs.org/jest-mock/-/jest-mock-30.2.0.tgz",` | `functions/package-lock.json` | 6091 | No product action; lockfile entry is transitive. |
| stub | `"stubs": "^3.0.0"` | `functions/package-lock.json` | 8329 | No product action; remove parent dependency and regenerate lockfile if unused. |
| stub | `"node_modules/stubs": {` | `functions/package-lock.json` | 8574 | No product action; lockfile entry is transitive. |
| stub | `"resolved": "https://registry.npmjs.org/stubs/-/stubs-3.0.0.tgz",` | `functions/package-lock.json` | 8576 | No product action; lockfile entry is transitive. |

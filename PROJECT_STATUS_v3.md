# PROJECT_STATUS_v3 — Abwaan

Context: Premium digital archive for Somali oral literature (Gabay/Poetry and Maahmaahyo/Proverbs) using Vue 3, Tailwind, Pinia, Firebase.

## 1. File Structure Audit

- Core structure is clear: `client/src/features` for pages, `client/src/shared` for common UI, `client/src/data` for repos/configs.
- Redundant/Frankenstein candidates:
  - Duplicate Firebase clients: `client/src/data/firebase/client.ts` and `client/src/data/firestore/client.ts` initialize apps differently. `client/src/data/firestore/api/votes.api.ts` uses the older module, while most other data access uses `client/src/data/firebase/client.ts`.
  - Mixed data access folders: `client/src/data/firestore/api` vs `client/src/data/functions` (two ways to reach Cloud Functions). Consider consolidating.
  - Unused logo variants: `client/src/assets/logo/Abwaan_1.svg`, `client/src/assets/logo/Abwaan_2.svg`, `client/src/assets/logo/Abwaan_3.svg` are not referenced (only `Abwaan_4.svg` is used in `client/src/shared/navigation/SiteLogo.vue`).
  - Brand blend in `client/src/features/home/HomePage.vue` (indigo accents) clashes with CarrotOrange palette; likely remnants from an older theme.
  - Legacy asset usage: `client/src/assets/images/wisdom_weyn_logo_2.svg` in `client/src/features/home/AboutPage.vue` is intentional for origin story, but it is an older brand artifact. Consider moving to a `historical` or `archive` folder if you keep it.
- Asset organization:
  - Images are centralized in `client/src/assets/images` and all current assets are referenced in `client/src/features/home/HomePage.vue` and `client/src/features/home/AboutPage.vue`.
  - Logos are centralized in `client/src/assets/logo`; only one is actively used.
- Components to split/merge:
  - No duplicate page components spotted, but several pages are monolithic (see section 4). Consider splitting into smaller sections/components.
  - `client/src/app` only contains the router; optional to flatten into `client/src/router` or keep for future app-level modules.

## 2. Database Schema vs Frontend Logic

### Inferred Firestore Schema

- `profiles/{uid}`
  - `displayName`, `username`, `bio`, `photoURL`, `createdAt`, `lastLoginAt`, `submissionCount`
  - Source: `functions/src/index.ts` + `client/src/data/firestore/profiles.repo.ts`
- `privateUsers/{uid}`
  - `email`, `providerId`, `lastLoginAt`
  - Source: `functions/src/index.ts`
- `usernames/{usernameLower}`
  - `uid`, `usernameOriginal`, `createdAt`
  - Source: `functions/src/index.ts`
- `submissions/{id}`
  - `uid`, `displayName`, `username`, `type`, `language`, `origin`, `status`,
    `title`, `text`, `meaning`, `translation`, `source`, `createdAt`, `updatedAt`,
    `voteUp`, `voteDown`, `voteScore`, `searchIndex`, `searchKeywords`
  - Source: `client/src/data/firestore/submissions.repo.ts`
- `submissions/{id}/votes/{uid}`
  - `value`, `createdAt`, `updatedAt`
  - Source: `functions/src/index.ts`

### Mismatches / Risks

- `Submission` model lacks `searchIndex`, but repos read/write it (`client/src/data/firestore/submissions.repo.ts`). Type mismatch and missing field in UI models.
- Firestore rules reference `personalName` in submissions updates (`firestore.rules`) but the frontend uses `displayName`. This is likely legacy and should be aligned.
- `submissionCount` in `UserProfile` is never incremented or updated when submissions are created/deleted.
- `status` is set to `'pending'` on create, but list/search queries do not filter by status — pending/hidden items can appear in public listings.
- Composite index coverage is likely incomplete for queries on `type` + `language` + `createdAt` or `voteScore` (only `uid + createdAt` is defined in `firestore.indexes.json`).
- Duplicate Firebase initialization increases risk of multiple app instances (one file guards with `getApps`, the other does not).

## 3. Feature Gap Analysis

| Feature | Status | Notes |
| --- | --- | --- |
| Email/password auth | ✅ Stable | `client/src/features/auth/LoginPage.vue`, `client/src/features/auth/auth.store.ts` |
| Google auth | ✅ Stable | `client/src/features/auth/LoginPage.vue`, `client/src/features/auth/auth.store.ts` |
| Auth persistence | ✅ Stable | `setPersistence` in `client/src/features/auth/auth.store.ts` |
| Username onboarding | ✅ Stable | `client/src/features/onboarding/UsernameOnboardingPage.vue` + Cloud Function |
| Collections browse + filters | 🚧 In Progress | Works, but no `status` filter and likely missing indexes |
| Search (prefix + keyword) | 🚧 In Progress | Requires consistent `searchIndex`/`searchKeywords` schema + indexes |
| Contribute submission | 🚧 In Progress | Writes `pending` but no moderation or publish workflow |
| Submission detail + vote | ✅ Stable | Voting works, report is placeholder |
| Delete submission | ✅ Stable | Owner delete works |
| Edit submission | 🔴 Missing | No edit UI or update flow |
| Report content | 🔴 Missing | `handleReport` only shows a toast |
| Profile edit (name/bio) | 🚧 In Progress | No avatar upload or success feedback |
| Public profile | ✅ Stable | `client/src/features/profile/PublicProfilePage.vue` |
| Moderation/admin tools | 🔴 Missing | No role or publish/hide workflow |

## 4. Code Quality & Consistency Check

- Hardcoded copy is extensive across pages (`client/src/features/home/HomePage.vue`, `client/src/features/home/AboutPage.vue`, `client/src/features/auth/LoginPage.vue`, `client/src/features/profile/ProfilePage.vue`, `client/src/features/collections/CollectionsPage.vue`). If localization or CMS is planned, start extracting.
- Typography inconsistency:
  - `App.vue` imports Varela Round for `font-sans`, but a serif system font is relied on without a defined `font-serif`.
  - `client/src/shared/utils/alerts.ts` uses `font-Kalam`, yet the font is not loaded globally.
- Design system drift:
  - `HomePage.vue` uses indigo accents which clash with CarrotOrange branding.
  - Multiple pages mix heavy gray palettes without clear light/dark mode tokens.
- Data layer fragmentation:
  - `client/src/data/firebase/client.ts` vs `client/src/data/firestore/client.ts` duplication.
  - `client/src/data/firestore/api/votes.api.ts` imports the older Firebase client module.
- Large components in need of refactor:
  - `client/src/features/home/HomePage.vue`
  - `client/src/features/collections/CollectionsPage.vue`
  - `client/src/features/submissions/SubmissionDetailPage.vue`
  - `client/src/features/profile/ProfilePage.vue`
  - `client/src/features/auth/LoginPage.vue`
- Inline content data (gallery items) is embedded in `HomePage.vue`. Consider moving to a data file or CMS later for cleaner separation.

## 5. Immediate Roadmap (Top 5 MVP Tasks)

- [ ] Implement moderation flow: only show `status === 'published'`, add admin or review tooling, and provide a publish/hide path.
- [ ] Implement missing flows: submission edit UI, real report submission storage.

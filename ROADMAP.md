# Abwaan v2 — Technical Assessment & Improvement Roadmap

## Evaluation

### Strengths

- Consistent Tailwind-only styling with a custom warm earth-tone palette (carrotOrange, saffron, redDamask, cinnabar) that reflects Somali heritage
- Good component reuse: `SubmissionCard`, `EmptyState`, `LoadMore`, `BaseDropdown` are generic and well-typed
- `BaseDropdown` has proper keyboard navigation and ARIA attributes — accessibility is above average for a project of this size
- Typography choices (Manrope, Cormorant Garamond, Kalam) create a distinct archival aesthetic
- All routes are lazy-loaded via dynamic imports

### Areas of Concern

- [x] ~~Some inline SVGs are repeated rather than extracted into components~~ — Created `ChevronDownIcon.vue` and `SearchIcon.vue` in `shared/components/icons/`. Replaced 6 chevron-down and 2 search icon instances across SubmissionCreatePage, SubmissionDetailPage, SearchBar, and CollectionsPage.
- [x] ~~The commented-out Flowbite reference in `tailwind.config.js` is dead config~~ — Removed.
- [ ] No dark mode infrastructure despite the color palette being ready for it
- [x] ~~Lenis smooth scrolling CSS is duplicated (imported from package AND manually defined in App.vue)~~ — Removed manual block.

---

## Data Flow & State

**State Management:** 7 Pinia composition-style stores.

**Data flow pattern:**

```
Vue Component → Pinia Store → Repository (data/firestore/*.repo.ts) → Firestore SDK
                    ↕
              Cloud Function Wrappers (data/functions/*.ts) → Firebase Cloud Functions
```

### Key Patterns

- **Promise-based readiness:** `authReady` and `waitForProfile()` ensure the auth and profile states resolve before route guards proceed. The router `beforeEach` awaits `authStore.waitForAuthReady()` before checking auth state.
- **Optimistic updates with rollback:** The vote system in `submissions.store.ts:220-277` updates counters and user vote state immediately, then rolls back on API failure. The rollback logic is correct.
- **Real-time listener:** Only the current user's profile uses `onSnapshot`. Everything else uses one-shot `getDoc`/`getDocs`. Appropriate choice — real-time listening on collections would be expensive.
- **Dual-query search:** `searchSubmissions` fires two parallel Firestore queries (prefix range on `searchIndex` + `array-contains` on `searchKeywords`), deduplicates results in a Map, and returns unified pagination cursors. Pragmatic workaround for Firestore's limited full-text search.
- **Favorites N+1 problem:** `listFavoriteSubmissions` first queries the favorites subcollection, then batch-loads the actual submission documents in groups of 10 using `where(documentId(), 'in', batch)`. Correct Firestore pattern but introduces sequential waterfall requests for large favorite lists.

### Security Rules

Rules at `firestore.rules` are thorough. Profile updates lock `username`, `isAdmin`, and `submissionCount` from client writes. Submissions can only be created via Cloud Function (`allow create: if false`). Report creation has exhaustive field validation. The `isAdmin()` helper reads the profile document, which counts against security rule reads but is the standard Firebase approach.

---

## Dependencies

### Client (`package.json` v2.0.15)

| Dependency | Status |
|---|---|
| `axios ^1.13.2` | **Unused.** All HTTP goes through Firebase SDK. Should be removed. |
| `sass ^1.97.1` | **Barely used.** Only Tailwind is used for styling. Candidate for removal. |
| `aos ^2.3.4` | Scroll animations. Imported in `main.ts`. Low usage — `@vueuse/motion` handles most animations. Potentially redundant. |
| `lenis ^1.3.17` | Smooth scrolling. Works but adds weight. Evaluate necessity. |
| `@vueuse/motion ^3.0.3` | Used for staggered card animations. Justified. |
| `firebase ^12.7.0` | Current. Good. |
| `pinia ^3.0.4` | Current. Good. |

### Functions (`package.json`)

| Dependency | Status |
|---|---|
| `eslint ^8.9.0` | **Outdated.** ESLint 9 is current (client uses it). |
| `@typescript-eslint/* ^5.12.0` | **Outdated.** v8 is current. |
| `eslint-config-google ^0.14.0` | **Deprecated/unmaintained.** Should migrate to flat config. |

### Missing

- No test runner (Vitest, Jest) anywhere in the project
- No e2e testing framework
- No i18n library despite bilingual content

---

## Technical Debt & Blind Spots

### High Priority

- [x] **~~Deprecated Firestore persistence API~~** (`client.ts`): ~~`enableMultiTabIndexedDbPersistence` is deprecated.~~ Migrated to `persistentLocalCache` with `persistentMultipleTabManager`.
- [x] **~~Hardcoded 2-second splash screen~~** (`App.vue`): ~~`setTimeout` blocks the app for 2 seconds on every load regardless of actual readiness.~~ Now awaits `authStore.waitForAuthReady()` with a 400ms floor and 5s safety cap.
- [x] **~~Dead `fn` export alias~~** (`client.ts`): ~~`export const fn = functions` was an inconsistent alias.~~ Removed and consolidated all consumers to import `functions` directly.
- [x] **~~Duplicated `buildSubmissionSearchFields`~~**: ~~This function existed in both `functions/src/index.ts` and `client/src/data/firestore/submissions.repo.ts`.~~ Created a new `updateSubmission` Cloud Function callable that owns search-field generation server-side. Removed the client copy entirely along with ~100 lines of dead code (`pickSubmissionPublicFields`, `BANNED_KEYS`, search constants). Client now delegates edits to the callable and uses the server-returned document. Also fixed a latent bug where partial patches would corrupt the search index (missing fields defaulted to empty string instead of reading from the existing document).
- [x] **~~Submission deletion doesn't clean up subcollections~~**: ~~`deleteSubmission` calls `deleteDoc` on the submission document, but Firestore doesn't cascade deletes to subcollections.~~ Expanded the `onSubmissionDelete` trigger to query and bulk-delete all documents in `votes`, `comments`, and `reports` subcollections using `bulkWriter`. Profile count decrement runs in parallel.
- [x] **~~No rate limiting on Cloud Functions~~**: ~~`createSubmission`, `voteSubmission`, and `claimUsername` had no rate limiting.~~ Added Firestore-based `checkRateLimit` helper with per-user, per-action sliding windows. Limits: `createSubmission` 10/hr, `updateSubmission` 30/hr, `voteSubmission` 60/min, `claimUsername` 5/hr. Exceeding throws `resource-exhausted`.

### Medium Priority

- [x] **~~Router guard calls `profileStore.start()` on every navigation~~**: ~~`start()` was called on every authenticated route navigation.~~ Removed the redundant `start()` call from the router guard. The auth listener in `auth.store.ts` already calls `start()` on auth state change; the router now only awaits `waitForProfile()`.
- [x] **~~`toggleFavorite` sets `busy.value = true` globally~~**: ~~Toggling a single favorite disabled the entire favorites UI.~~ Replaced global `busy` flag with per-item `togglingIds` Set. Added `isToggling(id)` helper for components to check individual item state.
- [x] **~~Search pagination edge case~~**: ~~The dual-query search fired both queries on loadMore even when one was exhausted, wasting Firestore reads.~~ Added `skipPrefix`/`skipKeyword` flags and per-query `prefixHasMore`/`keywordHasMore` tracking. The store now skips exhausted queries on loadMore.
- [x] **~~Auth store creates `profileStore` at module level~~**: ~~`const profileStore = useProfileStore()` ran at store initialization time, coupling the two stores.~~ Moved `useProfileStore()` inside `initAuthListener()` so it resolves lazily at runtime, eliminating circular dependency risk.
- [x] **~~No error boundary or global error handler~~**: ~~Uncaught promise rejections failed silently.~~ Added `app.config.errorHandler` in `main.ts` that logs to console and shows a toast via `toastError`.

### Low Priority

- [x] **~~`BANNED_KEYS` check only logs in DEV~~**: ~~Existed in `submissions.repo.ts`.~~ Removed entirely — server-side `updateSubmission` callable now validates allowed fields via an explicit allowlist, making client-side key stripping unnecessary.
- [x] **~~No structured logging in Cloud Functions~~**: ~~Errors were thrown as `HttpsError` but no operational logging existed.~~ Added `firebase-functions/logger` with `logger.info` for key operations (user creation, submission deletion) and `logger.error`/`logger.warn` for failures and auto-hide events.
- [x] **~~Two `.prettierrc` files~~**: ~~Both `.prettierrc` and `.prettierrc.json` existed.~~ Removed `.prettierrc.json` (stale `printWidth: 100`). Active config is `.prettierrc` (`printWidth: 120`).
- [x] **~~Commented-out Flowbite reference~~** in `tailwind.config.js`: Removed.
- [x] **~~Duplicate Lenis CSS~~**: ~~Smooth scrolling CSS was both imported from the package and manually defined in App.vue.~~ Removed manual block; `lenis/dist/lenis.css` import provides the same rules.
- [x] **~~Unused `axios` dependency~~**: Removed from `package.json`. Firebase SDK handles all HTTP.
- [x] **~~`sass` dependency~~**: ~~Installed but no `.scss` files or `lang="scss"` found anywhere.~~ Removed from `package.json`.

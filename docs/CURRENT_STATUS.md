# 🚀 Project Status: Master Tracker
**Last Updated:** 2026-01-08
**Source of Truth:** Live Codebase Analysis

## 1. Executive Summary
| Metric | Count | Status |
| :--- | :--- | :--- |
| **Total Features Tracked** | **31** | |
| **Verified Complete** | **17** | 🟢 Ready for QA |
| **In-Progress / Partial** | **2** | 🟡 Needs Polish |
| **Missing / Not Started** | **12** | 🔴 To Do |

---

## 2. ⚡ Immediate Sprint Priorities
*Based on critical "Missing" items identified in the audit.*

### 🎨 Frontend Focus
1.  **Search UX:** Add highlighting for search terms and "Active Filter" badges (`SubmissionCard.vue`).
2.  **Tags/Metadata:** Build UI for displaying and filtering by tags.
3.  **Collections:** Design and implement User-Curated Collections UI.

### ⚙️ Backend Focus
1.  **Submission Security:** Implement `createSubmission` Cloud Function to replace client-side `addDoc`.
2.  **Enforcement:** Add hook to auto-hide posts when report threshold is met.
3.  **Ingestion:** Build pipeline to import the 300+ proverbs archive.

---

## 3. Detailed Feature Audit

### 🔐 Core Platform
| Feature | Evidence (File Location) | Status | Action Item |
| :--- | :--- | :--- | :--- |
| **Auth** (Email/Pass + Google) | `auth.store.ts`, `LoginPage.vue` | 🟢 Done | Ready for QA |
| **Profiles** (Bio, Username, Public Page) | `ProfilePage.vue`, `PublicProfilePage.vue` | 🟢 Done | Ready for QA |
| **Submissions CRUD** (Create/View/Del) | `submissions.repo.ts`, `SubmissionDetailPage.vue` | 🟢 Done | Ready for QA |
| **Edit Submission Flow** | `SubmissionDetailPage.vue`, `submission.validation.ts` | 🟢 Done | **Audit Note:** Previously listed as missing. |
| **Voting System** | `votes.ts`, `submissions.store.ts` | 🟢 Done | Ready for QA |
| **Secure Creation (Cloud Func)** | *Not Found* | 🔴 Missing | **@Backend:** Replace client `addDoc` flow. |
| **Deletion Strategy** | `client/src/data/firestore/submissions.repo.ts` | 🟢 Done | **Decision:** Hard delete (cost-conscious). |

### 🛡️ Moderation & Safety
| Feature | Evidence (File Location) | Status | Action Item |
| :--- | :--- | :--- | :--- |
| **Public Gating** (Published Only) | `firestore.rules`, `submissions.repo.ts` | 🟢 Done | Ready for QA |
| **Admin Tools** (Hide/Restore) | `AdminPage.vue`, `SubmissionDetailPage.vue` | 🟢 Done | Ready for QA |
| **Report Persistence** | `reports.repo.ts`, `firestore.rules` | 🟢 Done | **Audit Note:** Previously listed as missing. |
| **Report Review Queue** | `AdminPage.vue`, `reports.store.ts` | 🟢 Done | Ready for QA |
| **Firestore Rules Hardening** | `firestore.rules` | 🟢 Done | Ready for QA |
| **Report Enforcement Hook** | `functions/src/index.ts` | 🟢 Done | Auto-move to `pending` after 3 distinct reports. |

### 🔍 Search & Discovery
| Feature | Evidence (File Location) | Status | Action Item |
| :--- | :--- | :--- | :--- |
| **Archive Browsing** | `CollectionsPage.vue`, `submissions.store.ts` | 🟢 Done | Ready for QA |
| **Search Logic** (Index/Query) | `submissions.repo.ts`, `firestore.indexes.json` | 🟢 Done | Ready for QA |
| **Favorites** (Save + List) | `favorites.store.ts`, `ProfilePage.vue` | 🟢 Done | **Audit Note:** Previously listed as "Later". |
| **Cap Keyword Growth** | `client/src/data/firestore/submissions.repo.ts` | 🟢 Done | Capped keywords + token length guard. |
| **External Search** (Algolia/Meili) | *Not Found* | 🔴 Missing | **Task:** Run spike/evaluation. |
| **Tags / Metadata UI** | *Not Found* | 🔴 Missing | **@FullStack:** Add fields + UI. |
| **User Collections** | *Not Found* | 🔴 Missing | **@FullStack:** Design model + UI. |

### 🎨 UI/UX & Design
| Feature | Evidence (File Location) | Status | Action Item |
| :--- | :--- | :--- | :--- |
| **Share Button** | `SubmissionDetailPage.vue` | 🟢 Done | Ready for QA |
| **Swiss Grid System** | `CollectionsPage.vue`, `ProfilePage.vue` | 🟢 Done | Ready for QA |
| **Empty States / Feedback** | `client/src/shared/components/EmptyState.vue`, `client/src/shared/utils/alerts.ts` | 🟢 Done | Ready for QA |

### 📚 Content & Expansion (Roadmap)
| Feature | Evidence (File Location) | Status | Action Item |
| :--- | :--- | :--- | :--- |
| **Import 300+ Proverbs** | *Not Found* | 🔴 Missing | **@Backend:** Build import script. |
| **Poem Context/Translation** | *Not Found* | 🔴 Missing | **@Content:** Define tooling. |
| **Audio Recitations** | *Not Found* | 🔴 Missing | **@FullStack:** Add media support. |
| **Comments** | `client/src/features/submissions/SubmissionDetailPage.vue`, `client/src/data/firestore/comments.repo.ts`, `firestore.rules` | 🟢 Done | Ready for QA |
| **Multi-Language Support** | *Not Found* | 🔴 Missing | **@FullStack:** Expand beyond SO/EN. |

---

## 4. 📝 Decision Log
* **Resolved:** `UX_AUDIT.md` claimed "Edit Flow" was missing. Code analysis confirmed it exists in `SubmissionDetailPage.vue`.
* **Resolved:** `ROADMAP.md` listed "Favorites" for Q3. Code analysis confirmed it is already live in `favorites.store.ts`.
* **Resolved:** Hard delete stays for now to keep storage costs low.

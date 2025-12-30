# Abwaan v2: Project Status & Audit

This report provides a snapshot of the current architecture, data model, and overall status of the Abwaan v2 project as of December 28, 2025.

## 1. Current Architecture Snapshot

The project is a monorepo containing a Vue.js client and a set of Firebase Functions for backend logic.

### High-Level Tree View

```
/
├── client/
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── app/
│   │   │   └── router/
│   │   │       └── index.ts       # <--- Main router config
│   │   ├── data/
│   │   │   ├── firebase/client.ts # <--- Firebase SDK init
│   │   │   ├── firestore/
│   │   │   │   ├── client.ts
│   │   │   │   ├── profiles.repo.ts
│   │   │   │   └── submissions.repo.ts
│   │   │   └── functions/
│   │   │       └── usernames.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── profile/
│   │   │   ├── submissions/
│   │   │   └── ... (other feature modules)
│   │   ├── shared/
│   │   │   └── components/
│   │   └── stores/
│   │       └── ... (Pinia stores)
│   └── vite.config.ts
│
└── functions/
    └── src/
        └── index.ts               # <--- All Cloud Functions
```

### Feature Modules

-   **Auth (`client/src/features/auth`):** Handles user authentication (login, registration, logout) via Firebase Auth. It includes a Pinia store (`auth.store.ts`) and a `LoginPage.vue` component.
-   **Profile (`client/src/features/profile`):** Manages user profiles. It contains a Pinia store (`profile.store.ts`) and a `ProfilePage.vue` for viewing and editing profile information.
-   **Submissions (`client/src/features/submissions`):** Manages user-generated content (submissions). It includes a Pinia store (`submissions.store.ts`) and components for creating (`SubmissionCreatePage.vue`) and viewing (`SubmissionDetailPage.vue`) submissions.
-   **Collections (`client/src/features/collections`):** Displays lists of submissions. Currently, it shows the latest submissions.
-   **Onboarding (`client/src/features/onboarding`):** Guides new users through initial setup, such as claiming a username.
-   **Navigation (`client/src/shared/navigation`):** Contains the main site navigation components (`TheNavigation.vue`, `DesktopNav.vue`, `MobileNav.vue`).
-   **Router (`client/src/app/router`):** Configures all frontend routes, including authentication guards.
-   **Data Layer (`client/src/data`):** Manages all communication with the backend. It's organized into subdirectories for Firestore repositories and Firebase Functions wrappers.

## 2. Routes + Pages

The main router configuration is located at `client/src/app/router/index.ts`.

| Path | Component | Auth Guard | Notes |
| :--- | :--- | :--- | :--- |
| `/` | `HomePage.vue` | None | |
| `/login` | `LoginPage.vue` | `guestOnly` | Only accessible to unauthenticated users. |
| `/collections` | `CollectionsPage.vue` | None | |
| `/contribute` | `SubmissionCreatePage.vue` | `requiresAuth` | Requires user to be logged in. |
| `/s/:id` | `SubmissionDetailPage.vue` | None | |
| `/onboarding/username`| `UsernameOnboardingPage.vue` | `requiresAuth` | Requires user to be logged in. |
| `/profile` | `ProfilePage.vue` | `requiresAuth` | Requires user to be logged in. |

**Dead Routes:**
- The file `client/src/router/index.ts` appears to be an unused, empty router configuration and should be removed.

## 3. Data Model + Collections

The application uses Firestore for data storage.

### `profiles`
-   **Collection:** `profiles/{uid}`
-   **Shape:**
    ```typescript
    interface UserProfile {
      personalName: string;
      username: string | null;
      bio: string;
      photoURL: string | null;
      createdAt: number;
      lastLoginAt: number | null;
      submissionCount: number;
    }
    ```
-   **Access:**
    -   **Read:** `observeProfile` (`profiles.repo.ts`)
    -   **Write:** `updateProfile` (`profiles.repo.ts`), `onAuthUserCreate` function (initial creation), `claimUsername` function (updates username).
-   **Privacy:** All fields are considered public.

### `submissions`
-   **Collection:** `submissions/{submissionId}`
-   **Shape:**
    ```typescript
    interface Submission {
      id: string;
      uid: string; // Author's UID
      personalName: string;
      username: string | null;
      type: 'Proverb' | 'Poetry';
      language: 'so' | 'en';
      origin: 'original' | 'shared' | 'unknown';
      status: 'published' | 'pending' | 'hidden';
      title: string | null;
      text: string;
      meaning: string;
      translation: string | null;
      source: { name: string; url: string | null; notes: string | null; } | null;
      createdAt: number;
      updatedAt: number | null;
      voteUp: number;
      voteDown: number;
      voteScore: number;
    }
    ```
-   **Access:**
    -   **Read:** `listLatestSubmissions`, `getSubmission` (`submissions.repo.ts`)
    -   **Write:** `createSubmission`, `updateSubmission` (`submissions.repo.ts`), `voteSubmission` function (updates vote counts).
-   **Privacy:** A `pickSubmissionPublicFields` utility in `submissions.repo.ts` prevents client-side updates to sensitive fields like `uid`, `username`, and status.

### `privateUsers`
-   **Collection:** `privateUsers/{uid}`
-   **Shape:**
    ```typescript
    interface PrivateUser {
      email: string;
      providerId: string | null;
      lastLoginAt: number;
    }
    ```
-   **Access:** This collection is only accessed by backend functions (`onAuthUserCreate`). It is not exposed to the client.
-   **Privacy:** Contains private user data and is protected by Firestore rules.

### `usernames`
-   **Collection:** `usernames/{username_lowercase}`
-   **Shape:**
    ```typescript
    interface Username {
      uid: string;
      usernameOriginal: string;
      createdAt: number;
    }
    ```
-   **Access:** Written to by the `claimUsername` backend function to ensure username uniqueness. Not directly accessed by the client.
-   **Privacy:** Backend-only.

### `submissions/{submissionId}/votes`
-   **Subcollection:** `submissions/{submissionId}/votes/{uid}`
-   **Shape:**
    ```typescript
    interface Vote {
      value: 1 | -1 | 0;
      updatedAt: number;
      createdAt: number;
    }
    ```
-   **Access:** Managed by the `voteSubmission` backend function.
-   **Privacy:** Backend-only.

## 4. Stores/Repos

### Pinia Stores

-   **`useAuthStore`:** Manages authentication state and actions.
-   **`useProfileStore`:** Manages the current user's profile data.
-   **`useSubmissionsStore`:** Manages submission data (loading, creating, updating).
-   **`useCounterStore`:** Unused default store. Should be removed.

### Repositories & APIs

-   **`profiles.repo.ts`:** CRUD operations for the `profiles` collection.
-   **`submissions.repo.ts`:** CRUD operations for the `submissions` collection.
    -   **Issue:** This repository has a direct dependency on `useProfileStore`, which is an architectural smell. Repos should be independent of the UI layer.
-   **`usernames.ts` / `usernames.api.ts`:** Wrappers for the `claimUsername` Firebase Function.
    -   **Issue:** This logic is duplicated across two files.
-   **`votes.api.ts`:** Wrapper for the `voteSubmission` Firebase Function.

### Missing Functions

-   **Voting:** No client-side implementation to call the `voteSubmission` function.
-   **Deletion:** No function to delete a submission.
-   **Moderation:** No functions for submission moderation (e.g., changing status from `pending` to `published`).

## 5. TODOs / Not-built-yet (Prioritized)

-   No `TODO` or `FIXME` comments were found in the codebase. However, several features are clearly not implemented.

### Must Fix Now (Bugs/Security)
-   **Decouple `submissions.repo.ts` from `useProfileStore`:** The user's profile information should be passed as an argument to repository functions instead of being accessed directly from the store.

### Next (Core Features)
-   **Implement Voting:** Add UI controls to `SubmissionDetailPage.vue` and `SubmissionCard.vue` to allow users to vote on submissions.
-   **Implement Deletion:** Add functionality to delete submissions (with appropriate permissions).
-   **Moderation Tools:** Create a UI for administrators/moderators to review and manage submissions (approve, hide, etc.).
-   **User Profiles:** Enhance the profile page to display a user's submissions.
-   **Search:** Implement a search feature to find submissions.

### Later (Nice-to-have)
-   **Edit Submissions:** Allow users to edit their own submissions.
-   **User Collections:** Expand the "Collections" feature to allow users to create and manage their own lists of favorite submissions.
-   **Pagination:** Add "load more" or pagination controls to the collections page.

## 6. Naming / Structure Cleanup

### Duplication and Unused Files

-   **`client/src/data/functions/usernames.ts`** and **`client/src/data/firestore/api/usernames.api.ts`** are duplicates and should be merged.
-   **`client/src/router/index.ts`** is an unused file and should be deleted.
-   **`client/src/stores/counter.ts`** is an unused file and should be deleted.

### Naming Conventions

-   The data models and code show some legacy naming conventions (`authorUid`, `authorUsername`). The current convention seems to be `uid` and `username`. This should be enforced consistently.
-   `personalName` in `UserProfile` could be renamed to `displayName` for consistency with Firebase Authentication's naming.

### Structure

-   The `client/src/data` directory could be reorganized for clarity. The distinction between `functions` and `firestore/api` is confusing. A single `data/functions` directory for all Firebase Function wrappers would be cleaner.
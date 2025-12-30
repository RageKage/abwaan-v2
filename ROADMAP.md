# Abwaan v2: Development Roadmap

This document outlines the development phases for Abwaan v2, ensuring we build on a solid and stable foundation.

## Phase 1: Architecture Repair (The "Must Fixes")
- [x] Refactor `submissions.repo.ts`: Remove the import of `useProfileStore`. Change the function signatures to accept `uid` or profile as arguments.
- [x] Merge Duplicate Files: Combine `client/src/data/functions/usernames.ts` and `usernames.api.ts` into a single source of truth.
- [x] Delete Dead Code: Remove `client/src/stores/counter.ts` and the unused router file to prevent confusion during testing.

## Phase 2: The "Walking Skeleton" (Functionality Verification)

- [x] Test `createSubmission`: Ensure it works with the newly refactored repo arguments.
- [x] Test `onAuthUserCreate`: Verify backend triggers without UI.
- [x] Verify Data Privacy: Add a meaningful check to ensure `pickSubmissionPublicFields` actually strips private data before it hits the UI.

## Phase 3: Core Feature Expansion

- [x] Implement Voting: Add the voting repo and UI.
- [x] Implement Deletion: Add the delete function.
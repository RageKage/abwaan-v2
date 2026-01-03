# Abwaan — Cleanup Notes & Roadmap

## Must Fix Now (Bugs / Security)

- **Decouple `submissions.repo.ts` from `useProfileStore`:**  
  Repository functions should not read from the UI store. Pass required profile/user fields as arguments instead.

---

## Next (Core Features)

- **Voting:** Add vote controls to `SubmissionDetailPage.vue` and `SubmissionCard.vue`.
- **Deletion:** Allow users (and/or moderators) to delete submissions with proper permission checks.
- **Moderation tools:** Build admin/mod UI to review submissions (publish / hide / reject).
- **User profiles:** Show a user’s submissions on their profile page.
- **Search:** Add search for submissions.

---

## Later (Nice-to-have)

- **Edit submissions:** Let users edit their own submissions (with rules + audit fields).
- **User collections:** Let users create/manage their own favorite lists.
- **Pagination:** Add “Load more” or pagination on collections (and anywhere lists grow large).
- **Comments:** Allow logged in users to comment under submissions
- **Favorite:** Allow users to favorite posts and then add that to their profile page
---

## Naming Conventions

- Standardize legacy fields:
  - Replace `authorUid` → `uid`
  - Replace `authorUsername` → `username`
- Consider renaming `UserProfile.personalName` → `displayName`  
  (matches Firebase Auth naming and reads cleaner).

---

## Project Structure

- Reorganize `client/src/data` for clarity. Current split between `functions` and `firestore/api` is confusing.
- Suggested direction:
  - `data/functions/` for all Cloud Function wrappers
  - `data/firestore/` for repositories + Firestore client setup

---

## Immediate Roadmap (Top 5 MVP Tasks)

- [ ] Moderation flow: only show `status === "published"` to the public, and provide publish/hide tooling for admins.
- [ ] Voting UI + storage (and rules).
- [ ] Deletion flow with permissions (soft delete vs hard delete decision).
- [ ] Edit submissions UI + update flow (only by owner, versioning optional).
- [ ] Reporting flow: store reports properly (not just UI) and make them visible to moderators.
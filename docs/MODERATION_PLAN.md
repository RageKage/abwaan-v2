# Admin & Moderation Plan

## Objectives
- Ensure community-contributed content is reviewed before becoming public
- Provide a secure dashboard for authorized moderators
- Prevent spam and low-quality submissions from reaching the main feed

## Data Model Changes

### Profiles (`/profiles/{uid}`)
- Add `isAdmin: boolean` (default `false`)
- Protect the field with Firestore rules (no self-escalation)

### Submissions (`/submissions/{id}`)
- Standardize `status`:
  - `pending`: newly created (visible only to author/admin)
  - `published`: reviewed and approved (public)
  - `hidden`: rejected or removed (admin only)

## Implementation Plan

### Phase A: Security & Filtering (Backend)
- Update Firestore rules to restrict public reads to `status == 'published'`
- Allow admins to read all submissions
- Restrict `status` updates to admins only

### Phase B: Repo + Store
- Add repo methods to list pending submissions and update status
- Add store actions: `loadPending`, `approve`, `reject`

### Phase C: UI
- Admin dashboard at `/admin` with approve/reject actions
- Only show admin links when `profile.isAdmin` is true

## Manual Setup (First Admin)
1. Open Firebase Console
2. Locate your `profiles/{uid}` document
3. Add `isAdmin: true`

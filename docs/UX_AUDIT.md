# UX/UI Audit

**Last Updated:** 2026-01-04

## Non-Functional or Incomplete UI
- **Report Button (`SubmissionDetailPage.vue`)**
  - Current: shows a toast only (no backend persistence)
  - Needed: store report + route to moderation queue
- **Edit Submission**
  - Current: no edit UI exposed
  - Needed: author-only edit flow with validation and audit fields

## Confirmed Working
- **Share Button (`SubmissionDetailPage.vue`)**
  - Copies the current URL to clipboard and shows feedback

## Consistency Checks (Visual)
- Auth: `LoginPage.vue`, `UsernameOnboardingPage.vue`
- Profile: `ProfilePage.vue`, `PublicProfilePage.vue`
- Collections: `CollectionsPage.vue`
- Navigation: `MobileNav.vue`, `DesktopNav.vue`

## Recommended Next Steps
1. Add report persistence + moderation intake
2. Implement edit submission flow for owners
3. Add empty-state polish and explicit action feedback where missing

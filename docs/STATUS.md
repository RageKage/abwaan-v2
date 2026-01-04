# Abwaan Status

**Status:** Beta
**Last Updated:** 2026-01-04

## What Works Today
- Submissions: create, view, and delete (owner-only) with Firestore-backed storage
- Collections: list, filter (type/language), sort, paginate
- Search: Firestore-backed prefix + keyword search
- Auth: email/password and Google sign-in
- Profiles: display name, bio, username claiming, public profile pages
- Voting: callable function updates vote counters with optimistic UI

## Gaps / Constraints
- Submission creation is client-side (no Cloud Function yet)
- Moderation workflow is not implemented (no admin tools, no status gating)
- Reports exist only as UI feedback (no persistence or review queue)
- Thematic tagging, audio recitations, collections, comments not implemented
- Language model is limited to `so` and `en`

## Data Note
- 300+ proverbs and 100+ poems exist in raw form but still need ingestion and enrichment.

## References
- Roadmap: `docs/ROADMAP.md`
- Moderation plan: `docs/MODERATION_PLAN.md`

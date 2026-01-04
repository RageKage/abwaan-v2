# Search

## Current Behavior
- `searchIndex` is generated on create:
  - Poetry uses `title`
  - Proverb uses `text`
  - Value is trimmed and lowercased
- `searchKeywords` array is generated from title/text/meaning/username/type
- Query strategy:
  - Prefix query on `searchIndex`
  - Keyword query on `searchKeywords` (`array-contains`)
  - Results are merged and deduplicated

## Known Constraints
- Firestore query limits apply (two queries, merged in memory)
- Keyword arrays can increase index size over time

## Improvements (Optional)
- Highlight the matched term in `SubmissionCard`
- Add "Author Match" badge when username matched
- Cap `searchKeywords` growth to keep indexes lean
- Evaluate external search (Algolia/Meilisearch) when scale increases

## Firestore Indexes (Required)
- `status ASC, searchIndex ASC`
- `status ASC, searchKeywords CONTAINS`

## Implementation References
- `client/src/data/firestore/submissions.repo.ts`
- `firestore.indexes.json`

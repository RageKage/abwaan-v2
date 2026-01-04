# Abwaan Project Overview

## Purpose
Abwaan is a digital archive for Somali poetry (Gabay) and proverbs (Maahmaahyo). It preserves oral literature, invites community contributions, and makes the archive easy to explore and validate.

## Audience
- Somali community and diaspora
- Cultural researchers and educators
- General readers interested in poetry, proverbs, and oral history

## Core Features (Current)
- Public archive with searchable submissions (proverbs and poetry)
- Submission detail pages with community voting
- User profiles with public contributions
- Profile settings to manage display name, bio, and handle
- Collections views with filters (type, language, sort)
- Consistent UI system (Swiss Grid layout)

## In Progress / Planned
- Moderation flow for submissions (publish/hide/reject)
- Reporting and safety tools
- Submission editing
- Favorites and personal collections
- Expanded public profile metadata

## Tech Stack
- Frontend: Vue 3 + Vite + TypeScript + Tailwind CSS
- State: Pinia
- Backend: Firebase (Auth, Firestore, Functions)
- Hosting: Firebase Hosting

## Data Model (High Level)
- `profiles`: `displayName`, `username`, `bio`, `createdAt`, `lastLoginAt`, `submissionCount`
- `submissions`: `type`, `language`, `origin`, `text/title`, `meaning`, `translation`, `votes`

## Project Structure (High Level)
- `client/src/features`: page-level features (home, collections, submissions, profile)
- `client/src/shared`: shared components, navigation, utilities
- `client/src/data`: Firebase client, Firestore repos, function wrappers
- `functions`: Firebase Cloud Functions

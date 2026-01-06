# Local + Preview Runbook

## Prereqs
- Node.js 20.x (functions runtime is Node 20)
- Firebase CLI: `npm install -g firebase-tools`
- Firebase login: `firebase login`
- Select project: `firebase use project-abwaan-dev-v2`

## Local Development

### 1) Install dependencies
```bash
npm --prefix client install
npm --prefix functions install
```

### 2) Environment variables
Set your local env in `client/.env`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_RECAPTCHA_SITE_KEY=...
```

### 3) Run emulators
```bash
firebase emulators:start --only auth,firestore,functions
```

### 4) Build functions during emulator use
```bash
npm --prefix functions run build
# or
npm --prefix functions run build:watch
```

### 5) Start the client
```bash
npm --prefix client run dev
```

Notes:
- The client connects to emulators only in `DEV` (`client/src/data/firebase/client.ts`).
- `submissionCount` updates require the Functions emulator and `functions/lib` build output.

## Preview Deployment (Firebase Hosting)

### Quick preview (hosting only)
```bash
npm --prefix client run build
firebase hosting:channel:deploy preview --project project-abwaan-dev-v2
```

### Full preview flow
```bash
npm --prefix client run build
firebase deploy --only firestore:rules,firestore:indexes
npm --prefix functions run build
firebase deploy --only functions
firebase hosting:channel:deploy preview --project project-abwaan-dev-v2

```

### Delete preview channel
```bash
firebase hosting:channel:delete preview --project project-abwaan-dev-v2

```

## Version Bump
The UI version is sourced from `client/package.json`.

```bash
cd client
npm version patch
```

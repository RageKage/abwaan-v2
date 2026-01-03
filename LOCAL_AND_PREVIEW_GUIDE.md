# Abwaan Local + Preview Runbook

This guide covers running the app locally and deploying a Firebase Hosting preview.

## Prereqs

- Node.js 20.x (functions runtime is Node 20).
- Firebase CLI: `npm install -g firebase-tools`
- Firebase login: `firebase login`
- Select project: `firebase use project-abwaan-dev`

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
VITE_FIREBASE_AUTH_DOMAIN=project-abwaan-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-abwaan-dev
VITE_FIREBASE_STORAGE_BUCKET=project-abwaan-dev.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_RECAPTCHA_SITE_KEY=...   # App Check site key
```

### 3) Run emulators
```bash
firebase emulators:start --only auth,firestore,functions
```

### 4) Build functions during emulator use
The Functions emulator uses `functions/lib`, so build or watch:
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
- `submissionCount` updates require the Functions emulator to be running and the build output in `functions/lib`.

## Preview Deployment (Firebase Hosting)

### Quick preview (hosting only)
```bash
npm --prefix client run build
firebase hosting:channel:deploy preview
```

Note: re-deploying to the same channel name keeps the preview URL unchanged.

### 1) Build the client
```bash
npm --prefix client run build
```

### 2) Deploy Firestore rules + indexes
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 3) Deploy Functions
```bash
npm --prefix functions run build
firebase deploy --only functions
```

### 4) Deploy preview channel
```bash
firebase hosting:channel:deploy preview --project project-abwaan-dev
```

### 5) Delete preview channel (when needed)
```bash
firebase hosting:channel:delete preview --project project-abwaan-dev
```

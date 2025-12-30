import { initializeApp, getApp, getApps } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
export const functions = getFunctions(firebaseApp)
export const fn = functions

const emulatorFlag = '__firebase_emulators_connected__'
const globalFlags = globalThis as unknown as Record<string, boolean>

if (import.meta.env.DEV && !globalFlags[emulatorFlag]) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  globalFlags[emulatorFlag] = true
}

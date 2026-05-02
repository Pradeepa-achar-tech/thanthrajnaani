// Re-export the shared Firebase instances so the copied genai tutorial keeps
// working without changing any of its internal imports.
export { app, auth, db, googleProvider } from '../../firebase.js'

// The clubbed portfolio handles auth at a higher level. Re-export the shared
// AuthProvider/useAuth so the rest of the copied catering tutorial keeps importing
// from this same path without modification.
export { AuthProvider, useAuth } from '../../../contexts/AuthContext.jsx'

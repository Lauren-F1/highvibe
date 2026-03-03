export const firebaseConfig = {
  "projectId": "studio-634317332-6568b",
  "appId": "1:453088920311:web:3cd91c0a68d9658b9989f2",
  "apiKey": "AIzaSyA1qUICYFshBbiEOLHFS0tqYQAIZkRhmtM",
  "authDomain": "studio-634317332-6568b.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "453088920311"
};

export const isFirebaseEnabled = !!firebaseConfig.apiKey;

/**
 * When true, the app uses mock data instead of Firestore queries.
 * Useful for local development without Firebase credentials.
 * Set via NEXT_PUBLIC_USE_MOCK_DATA=true in .env.local.
 */
export const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !isFirebaseEnabled;

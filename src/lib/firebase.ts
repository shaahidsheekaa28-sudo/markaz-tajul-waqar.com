import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import baseFirebaseConfig from "../../firebase-applet-config.json";

// Safe environment variable resolver supporting both Next.js (process.env) and Vite (import.meta.env)
const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return '';
};

// Furaawwan Next.js ykn Vite keessaa qulqulleessanii fudhachuu
const firebaseConfig = {
  apiKey:
    getEnv("NEXT_PUBLIC_FIREBASE_API_KEY") ||
    getEnv("VITE_FIREBASE_API_KEY") ||
    baseFirebaseConfig.apiKey ||
    "",
  authDomain:
    getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") ||
    getEnv("VITE_FIREBASE_AUTH_DOMAIN") ||
    baseFirebaseConfig.authDomain ||
    "",
  projectId:
    getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID") ||
    getEnv("VITE_FIREBASE_PROJECT_ID") ||
    baseFirebaseConfig.projectId ||
    "exemplary-hearth-xdw77",
  storageBucket:
    getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET") ||
    getEnv("VITE_FIREBASE_STORAGE_BUCKET") ||
    baseFirebaseConfig.storageBucket ||
    "",
  messagingSenderId:
    getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID") ||
    getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") ||
    baseFirebaseConfig.messagingSenderId ||
    "",
  appId:
    getEnv("NEXT_PUBLIC_FIREBASE_APP_ID") ||
    getEnv("VITE_FIREBASE_APP_ID") ||
    baseFirebaseConfig.appId ||
    "",
};

// Database ID Taajul Waqar addatti fudhachuu
const databaseId =
  getEnv("NEXT_PUBLIC_FIREBASE_DATABASE_ID") ||
  getEnv("VITE_FIREBASE_DATABASE_ID") ||
  (baseFirebaseConfig as any).firestoreDatabaseId ||
  "taajul-waqar-database";

// Firebase App banuu (Hoo duraan banamee jiraate isuma dhimma itti baayna)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Database Firestore koodii addaa Taajul Waqar kanaan banuu
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    databaseId
  );
} catch (e) {
  firestoreInstance = getFirestore(app, databaseId);
}

// Sirna Auth banuu
const auth = getAuth(app);
const db = firestoreInstance;

// Google Classroom / Account Scopes provider
const googleProvider = new GoogleAuthProvider();

const CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.addons.student',
  'https://www.googleapis.com/auth/classroom.addons.teacher',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
  'https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly',
  'https://www.googleapis.com/auth/classroom.guardianlinks.students',
  'https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/classroom.profile.photos',
  'https://www.googleapis.com/auth/classroom.push-notifications',
  'https://www.googleapis.com/auth/classroom.rosters',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
  'https://www.googleapis.com/auth/classroom.topics',
  'https://www.googleapis.com/auth/classroom.topics.readonly',
];

CLASSROOM_SCOPES.forEach((scope) => googleProvider.addScope(scope));

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export { app, db, auth, googleProvider, firebaseConfig, databaseId };

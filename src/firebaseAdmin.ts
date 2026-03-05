import admin from "firebase-admin";

let _app: admin.app.App | null = null;

function parseServiceAccount(): admin.ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    return obj as admin.ServiceAccount;
  } catch {
    // If provided as path, user should use GOOGLE_APPLICATION_CREDENTIALS instead.
    return null;
  }
}

export function getAdminApp(): admin.app.App {
  if (_app) return _app;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Missing FIREBASE_PROJECT_ID env");

  const sa = parseServiceAccount();
  if (sa) {
    _app = admin.initializeApp({
      credential: admin.credential.cert(sa),
      projectId,
    });
  } else {
    // Fallback: Application Default Credentials (ADC)
    _app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
    });
  }

  return _app;
}

export function getDb(): admin.firestore.Firestore {
  const app = getAdminApp();
  return admin.firestore(app);
}

export function serverTimestamp() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return admin.firestore.FieldValue.serverTimestamp();
}

export function getAuth(): admin.auth.Auth {
  const app = getAdminApp();
  return admin.auth(app);
}

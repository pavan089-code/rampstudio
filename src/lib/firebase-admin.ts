import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const ADMIN_APP_NAME = "ramp-studio-admin";

class FirebaseAdminConfigurationError extends Error {
  readonly code = "auth/admin-configuration";

  constructor(message: string) {
    super(message);
    this.name = "FirebaseAdminConfigurationError";
  }
}

function getAdminCredentials() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const publicProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const missing = [
    ["FIREBASE_PROJECT_ID", projectId],
    ["FIREBASE_CLIENT_EMAIL", clientEmail],
    ["FIREBASE_PRIVATE_KEY", privateKey],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new FirebaseAdminConfigurationError(
      `Firebase Admin credentials are missing: ${missing.join(", ")}.`
    );
  }

  if (publicProjectId && publicProjectId !== projectId) {
    throw new FirebaseAdminConfigurationError(
      "FIREBASE_PROJECT_ID does not match NEXT_PUBLIC_FIREBASE_PROJECT_ID."
    );
  }

  if (!clientEmail.endsWith(`@${projectId}.iam.gserviceaccount.com`)) {
    throw new FirebaseAdminConfigurationError(
      "FIREBASE_CLIENT_EMAIL does not belong to FIREBASE_PROJECT_ID."
    );
  }

  return { projectId, clientEmail, privateKey };
}

export function getFirebaseAdminApp() {
  const existingApp = getApps().find((app) => app.name === ADMIN_APP_NAME);

  if (existingApp) return existingApp;

  const { projectId, clientEmail, privateKey } = getAdminCredentials();

  return initializeApp(
    {
      credential: cert({ projectId, clientEmail, privateKey }),
    },
    ADMIN_APP_NAME
  );
}

export function getAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}

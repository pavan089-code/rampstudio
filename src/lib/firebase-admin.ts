import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const ADMIN_APP_NAME = "ramp-studio-admin";

export class FirebaseAdminConfigurationError extends Error {
  readonly code = "auth/admin-configuration";

  constructor(message: string) {
    super(message);
    this.name = "FirebaseAdminConfigurationError";
  }
}

function normalizeEnvString(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function normalizePrivateKey(value: string | undefined) {
  const unquoted = normalizeEnvString(value);
  if (!unquoted) return undefined;

  return unquoted.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}

function getAdminCredentials() {
  const projectId = normalizeEnvString(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = normalizeEnvString(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const publicProjectId = normalizeEnvString(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );

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

  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    throw new FirebaseAdminConfigurationError(
      "FIREBASE_PRIVATE_KEY is not a valid service account private key."
    );
  }

  if (!privateKey.includes("-----END PRIVATE KEY-----")) {
    throw new FirebaseAdminConfigurationError(
      "FIREBASE_PRIVATE_KEY is missing its private key footer."
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

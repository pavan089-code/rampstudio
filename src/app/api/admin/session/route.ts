import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
} from "@/lib/admin-session";
import { getAdminAuth } from "@/lib/firebase-admin";
import {
  ensureUserRoleDocument,
  isAdminRole,
  RbacAuthorizationError,
} from "@/lib/rbac-admin";

export const runtime = "nodejs";

type FirebaseErrorDetails = {
  code?: string;
  message: string;
  stack?: string;
};

function getFirebaseErrorDetails(error: unknown): FirebaseErrorDetails {
  if (error instanceof Error) {
    const code =
      "code" in error && typeof error.code === "string"
        ? error.code
        : undefined;

    return { code, message: error.message, stack: error.stack };
  }

  return { message: "Unknown Firebase Admin error." };
}

function logFirebaseError(error: unknown, phase: string) {
  const details = getFirebaseErrorDetails(error);

  console.error(`[admin/session] ${phase} failed`, {
    code: details.code,
    message: details.message,
    ...(process.env.NODE_ENV === "development" && { stack: details.stack }),
  });
}

function logSessionStage(phase: string, details?: Record<string, boolean | string>) {
  console.info(`[admin/session] ${phase}`, details);
}

export async function POST(request: NextRequest) {
  let phase = "request validation";

  try {
    const { idToken } = (await request.json()) as { idToken?: string };

    if (typeof idToken !== "string" || idToken.trim().length === 0) {
      return NextResponse.json(
        { error: "A Firebase ID token is required." },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    logSessionStage("admin initialization complete", {
      hasPublicProjectId: Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      hasAdminProjectId: Boolean(process.env.FIREBASE_PROJECT_ID),
      projectIdsMatch:
        Boolean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === process.env.FIREBASE_PROJECT_ID,
    });
    phase = "verifyIdToken";
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);
    logSessionStage("ID token verified");

    if (!decodedToken.uid || decodedToken.sub !== decodedToken.uid) {
      return NextResponse.json(
        { error: "The Firebase ID token does not identify a valid user." },
        { status: 401 }
      );
    }

    if (decodedToken.exp * 1000 <= Date.now()) {
      return NextResponse.json(
        { error: "The Firebase ID token has expired." },
        { status: 401 }
      );
    }

    if (!decodedToken.email) {
      return NextResponse.json(
        { error: "The Firebase account does not have an email address." },
        { status: 403 }
      );
    }

    phase = "RBAC provisioning";
    const role = await ensureUserRoleDocument(decodedToken);
    logSessionStage("RBAC verified", { role });

    if (!isAdminRole(role)) {
      return NextResponse.json(
        { error: "This Firebase account does not have admin access." },
        { status: 403 }
      );
    }

    phase = "createSessionCookie";
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: ADMIN_SESSION_MAX_AGE * 1000,
    });
    logSessionStage("session cookie created");
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    logFirebaseError(error, phase);
    const details = getFirebaseErrorDetails(error);
    const isConfigurationError = details.code === "auth/admin-configuration";
    const isAuthorizationError = error instanceof RbacAuthorizationError;

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? `${details.code ? `${details.code}: ` : ""}${details.message}`
            : isAuthorizationError
              ? "This Firebase account does not have admin access."
            : isConfigurationError
              ? "The secure admin session is not configured."
              : "Unable to authenticate this Firebase account.",
      },
      { status: isConfigurationError ? 500 : isAuthorizationError ? 403 : 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}

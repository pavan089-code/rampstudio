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

type AdminSessionStage =
  | "SESSION_REQUEST_RECEIVED"
  | "TOKEN_PRESENT"
  | "ADMIN_SDK_READY"
  | "TOKEN_VERIFICATION_STARTED"
  | "TOKEN_VERIFICATION_SUCCEEDED"
  | "RBAC_CHECK_STARTED"
  | "RBAC_CHECK_SUCCEEDED"
  | "SESSION_COOKIE_CREATION_STARTED"
  | "SESSION_COOKIE_CREATION_SUCCEEDED"
  | "SESSION_RESPONSE_SUCCEEDED";

type AdminSessionErrorCode =
  | "INVALID_SESSION_REQUEST"
  | "MISSING_ID_TOKEN"
  | "FIREBASE_ADMIN_CONFIGURATION_ERROR"
  | "TOKEN_VERIFICATION_FAILED"
  | "INVALID_ID_TOKEN"
  | "ADMIN_EMAIL_REQUIRED"
  | "ADMIN_RBAC_DENIED"
  | "SESSION_CREATION_FAILED"
  | "ADMIN_SESSION_INTERNAL_ERROR";

type FirebaseErrorDetails = {
  code?: string;
  message: string;
  name?: string;
  stack?: string;
};

function getFirebaseErrorDetails(error: unknown): FirebaseErrorDetails {
  if (error instanceof Error) {
    const code =
      "code" in error && typeof error.code === "string"
        ? error.code
        : undefined;

    return {
      code,
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return { message: "Unknown Firebase Admin error." };
}

function logSessionStage(
  stage: AdminSessionStage,
  details?: Record<string, boolean | string>
) {
  if (process.env.NODE_ENV !== "development") return;
  console.info(`[admin/session] ${stage}`, details);
}

function logSessionFailure({
  stage,
  status,
  code,
  error,
}: {
  stage: AdminSessionStage;
  status: number;
  code: AdminSessionErrorCode;
  error?: unknown;
}) {
  const details = getFirebaseErrorDetails(error);

  console.error(`[admin/session] ${stage} failed`, {
    status,
    code,
    firebaseCode: details.code,
    errorName: details.name,
    message: details.message,
    ...(process.env.NODE_ENV === "development" && { stack: details.stack }),
  });
}

function errorResponse({
  status,
  code,
  message,
  stage,
  error,
}: {
  status: number;
  code: AdminSessionErrorCode;
  message: string;
  stage: AdminSessionStage;
  error?: unknown;
}) {
  logSessionFailure({ stage, status, code, error });
  return NextResponse.json({ ok: false, code, message }, { status });
}

export async function POST(request: NextRequest) {
  let stage: AdminSessionStage = "SESSION_REQUEST_RECEIVED";
  logSessionStage(stage);

  try {
    let payload: { idToken?: unknown };

    try {
      payload = (await request.json()) as { idToken?: unknown };
    } catch (error) {
      return errorResponse({
        status: 400,
        code: "INVALID_SESSION_REQUEST",
        message: "Invalid admin session request.",
        stage,
        error,
      });
    }

    const { idToken } = payload;

    if (typeof idToken !== "string" || idToken.trim().length === 0) {
      return errorResponse({
        status: 400,
        code: "MISSING_ID_TOKEN",
        message: "A Firebase ID token is required.",
        stage,
      });
    }

    stage = "TOKEN_PRESENT";
    logSessionStage(stage);

    const publicProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
    const adminProjectId = process.env.FIREBASE_PROJECT_ID?.trim();

    stage = "ADMIN_SDK_READY";
    const adminAuth = getAdminAuth();
    logSessionStage(stage, {
      hasPublicProjectId: Boolean(publicProjectId),
      hasAdminProjectId: Boolean(adminProjectId),
      projectIdsMatch:
        Boolean(publicProjectId) && publicProjectId === adminProjectId,
    });

    stage = "TOKEN_VERIFICATION_STARTED";
    logSessionStage(stage);
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(idToken, true);
    } catch (error) {
      return errorResponse({
        status: 401,
        code: "TOKEN_VERIFICATION_FAILED",
        message: "Firebase ID token verification failed.",
        stage,
        error,
      });
    }

    stage = "TOKEN_VERIFICATION_SUCCEEDED";
    logSessionStage(stage);

    if (!decodedToken.uid || decodedToken.sub !== decodedToken.uid) {
      return errorResponse({
        status: 401,
        code: "INVALID_ID_TOKEN",
        message: "The Firebase ID token does not identify a valid user.",
        stage,
      });
    }

    if (decodedToken.exp * 1000 <= Date.now()) {
      return errorResponse({
        status: 401,
        code: "INVALID_ID_TOKEN",
        message: "The Firebase ID token has expired.",
        stage,
      });
    }

    if (!decodedToken.email) {
      return errorResponse({
        status: 403,
        code: "ADMIN_EMAIL_REQUIRED",
        message: "The Firebase account does not have an email address.",
        stage,
      });
    }

    stage = "RBAC_CHECK_STARTED";
    logSessionStage(stage, {
      hasBootstrapAdminEmail: Boolean(process.env.BOOTSTRAP_ADMIN_EMAIL),
    });
    const role = await ensureUserRoleDocument(decodedToken);
    stage = "RBAC_CHECK_SUCCEEDED";
    logSessionStage(stage, { role });

    if (!isAdminRole(role)) {
      return errorResponse({
        status: 403,
        code: "ADMIN_RBAC_DENIED",
        message: "Admin authorization failed.",
        stage,
      });
    }

    stage = "SESSION_COOKIE_CREATION_STARTED";
    logSessionStage(stage);
    let sessionCookie: string;

    try {
      sessionCookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn: ADMIN_SESSION_MAX_AGE * 1000,
      });
    } catch (error) {
      return errorResponse({
        status: 500,
        code: "SESSION_CREATION_FAILED",
        message: "The secure admin session could not be created.",
        stage,
        error,
      });
    }

    stage = "SESSION_COOKIE_CREATION_SUCCEEDED";
    logSessionStage(stage);
    const response = NextResponse.json({ ok: true, success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ADMIN_SESSION_MAX_AGE,
      path: "/",
    });

    stage = "SESSION_RESPONSE_SUCCEEDED";
    logSessionStage(stage);
    return response;
  } catch (error) {
    const details = getFirebaseErrorDetails(error);
    const isConfigurationError = details.code === "auth/admin-configuration";
    const isAuthorizationError = error instanceof RbacAuthorizationError;
    const status = isConfigurationError ? 500 : isAuthorizationError ? 403 : 500;
    const code: AdminSessionErrorCode = isConfigurationError
      ? "FIREBASE_ADMIN_CONFIGURATION_ERROR"
      : isAuthorizationError
        ? "ADMIN_RBAC_DENIED"
        : "ADMIN_SESSION_INTERNAL_ERROR";

    return errorResponse({
      status,
      code,
      message: isAuthorizationError
        ? "Admin authorization failed."
        : isConfigurationError
          ? "Server authentication configuration is invalid."
          : "Unable to authenticate this Firebase account.",
      stage,
      error,
    });
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

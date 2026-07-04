"use client";

import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { auth } from "@/lib/firebase";
import { createAdminSession } from "@/lib/admin-session";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);

  const getDevelopmentError = (error: unknown, fallback: string) =>
    process.env.NODE_ENV === "development" && error instanceof Error
      ? error.message
      : fallback;

  const getRedirectPath = () => {
    if (typeof window === "undefined") return "/admin/dashboard";

    const nextPath = new URLSearchParams(window.location.search).get("next");

    return nextPath?.startsWith("/admin/") &&
      !nextPath.startsWith("//") &&
      nextPath !== "/admin/login"
      ? nextPath
      : "/admin/dashboard";
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !submittingRef.current) {
        createAdminSession(user)
          .then(() => router.replace(getRedirectPath()))
          .catch((error) => {
            setError(
              getDevelopmentError(
                error,
                "Unable to restore the admin session. Please sign in again."
              )
            );
          });
      }
    });

    return unsubscribe;
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    submittingRef.current = true;

    let firebaseSignedIn = false;
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      firebaseSignedIn = true;
      await createAdminSession(credential.user);
      router.replace(getRedirectPath());
    } catch (error) {
      const fallback = firebaseSignedIn
        ? "Signed in, but the secure admin session could not be created."
        : "Invalid admin email or password.";

      setError(getDevelopmentError(error, fallback));
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-primary px-5 py-12 text-white md:grid-cols-[0.95fr_1.05fr] md:px-0 md:py-0">
      <section className="hidden border-r border-white/10 bg-[url('/marraige/hero.jpeg')] bg-cover bg-center md:block">
        <div className="flex h-full flex-col justify-end bg-black/55 p-12">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent-gold)]">
            Ramp Studio
          </p>
          <h1 className="mt-4 max-w-xl font-serif text-6xl leading-tight">
            Private studio command.
          </h1>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md border border-white/10 bg-white/[0.035] p-6 sm:p-8"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent-gold)]">
            Admin Login
          </p>
          <h2 className="mt-4 font-serif text-4xl text-white">
            Welcome back
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/55">
            Sign in with the Firebase admin account created for Ramp Studio.
          </p>

          {error && (
            <div className="mt-6 border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="mt-8 grid gap-5">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Admin email"
              required
              className="field-surface w-full px-4 py-3"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                required
                className="field-surface w-full px-4 py-3 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-white/55"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 bg-[var(--accent-gold)] px-5 py-3 text-sm font-medium text-black transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </button>
        </form>
      </section>
    </main>
  );
}

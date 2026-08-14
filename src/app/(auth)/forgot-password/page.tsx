// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link         from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email,     setEmail]   = useState("");
  const [loading,   setLoading] = useState(false);
  const [sent,      setSent]    = useState(false);
  const [error,     setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return setError("Enter your email address");
    setError(""); setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      if (res.ok) setSent(true);
      else {
        const d = await res.json();
        setError(d.error ?? "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Check your inbox</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We sent a reset link to <span className="font-medium text-foreground">{email}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Link expires in 1 hour</p>
              </div>
              <button onClick={() => { setSent(false); setEmail(""); }}
                className="text-xs text-primary hover:underline">
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Email address
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com" autoFocus
                  className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg">
                  <AlertCircle size={13} className="flex-shrink-0" /> {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-4">
          <Link href="/sign-in" className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5">
            <ArrowLeft size={12} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
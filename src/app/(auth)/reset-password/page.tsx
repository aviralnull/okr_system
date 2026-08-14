// src/app/(auth)/reset-password/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter }    from "next/navigation";
import Link                              from "next/link";
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get("token") ?? "";
  const email    = params.get("email") ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");

  const strength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

  useEffect(() => {
    if (!token || !email) setError("Invalid reset link. Request a new one.");
  }, [token, email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password)           return setError("Enter a new password");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setError(""); setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, email, password }),
      });
      const d = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/sign-in"), 2500);
      } else {
        setError(d.error ?? "Failed to reset password");
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
            <KeyRound size={22} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-2">Choose a strong password for your account</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {done ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Password reset!</p>
                <p className="text-xs text-muted-foreground mt-1">Redirecting you to sign in...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {email && (
                <div className="flex items-center gap-2 text-xs bg-muted/40 px-3 py-2.5 rounded-lg">
                  <span className="text-muted-foreground">Resetting password for</span>
                  <span className="font-medium text-foreground">{email}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">New password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)} autoFocus placeholder="Min. 8 characters"
                    className="w-full text-sm pl-3 pr-10 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all"
                          style={{ background: i <= strength ? strengthColor[strength] : "hsl(var(--muted))" }} />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Strength: <span className="font-medium">{strengthLabel[strength]}</span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Confirm password</label>
                <input
                  type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full text-sm px-3 py-2.5 rounded-lg border bg-background outline-none focus:ring-2 transition-all"
                  style={{ borderColor: confirm && confirm !== password ? "#ef4444" : undefined }}
                />
                {confirm && confirm !== password && (
                  <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg">
                  <AlertCircle size={13} className="flex-shrink-0" /> {error}
                </div>
              )}

              <button type="submit" disabled={loading || !!error && !password}
                className="w-full text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-4">
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
            Request a new link
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
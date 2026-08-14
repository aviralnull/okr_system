// "use client";

// import axios from "axios";

// import { useState }
// from "react";

// import {
//   useRouter,
//   useSearchParams,
// } from "next/navigation";

// import {
//   Card,
//   CardContent,
// } from "@/components/ui/card";

// import { Input }
// from "@/components/ui/input";

// import { Label }
// from "@/components/ui/label";

// import { Button }
// from "@/components/ui/button";

// export default function VerifyCodePage() {

//   const router =
//     useRouter();

//   const searchParams =
//     useSearchParams();

//   const email =
//     searchParams.get("email");

//   const [loading, setLoading] =
//     useState(false);

//   const [code, setCode] =
//     useState("");

//   const handleSubmit =
//     async (
//       e: React.FormEvent
//     ) => {

//       e.preventDefault();

//       try {

//         setLoading(true);

//         const response =
//           await axios.post(
//             "/api/verify-code",
//             {
//               email,
//               code,
//             }
//           );

//         const data =
//           response.data;

//         if (!data.success) {

//           alert(
//             data.message
//           );

//           return;
//         }

//         alert(
//           "Email verified successfully"
//         );

//         router.push("/sign-in");

//       } catch (error: any) {

//         console.log(error);

//         alert(
//           error?.response?.data
//             ?.message ||
//           "Something went wrong"
//         );

//       } finally {

//         setLoading(false);
//       }
//     };

//   return (

//     <div
//       className="
//         min-h-screen
//         bg-black
//         flex
//         items-center
//         justify-center
//         p-6
//       "
//     >

//       <Card
//         className="
//           w-full
//           max-w-md
//           bg-zinc-900
//           border-zinc-800
//         "
//       >

//         <CardContent
//           className="p-8"
//         >

//           <div className="mb-8">

//             <h1
//               className="
//                 text-3xl
//                 font-bold
//                 text-white
//               "
//             >
//               Verify Email
//             </h1>

//             <p
//               className="
//                 text-zinc-400
//                 mt-2
//               "
//             >
//               Enter the verification
//               code sent to:
//             </p>

//             <p
//               className="
//                 text-white
//                 mt-1
//                 font-medium
//               "
//             >
//               {email}
//             </p>

//           </div>

//           <form
//             onSubmit={
//               handleSubmit
//             }
//             className="
//               space-y-5
//             "
//           >

//             <div>

//               <Label
//                 className="
//                   text-zinc-300
//                 "
//               >
//                 Verification Code
//               </Label>

//               <Input
//                 value={code}
//                 onChange={(e) =>
//                   setCode(
//                     e.target.value
//                   )
//                 }
//                 placeholder="123456"
//                 maxLength={6}
//                 className="
//                   mt-2
//                   bg-zinc-800
//                   border-zinc-700
//                   text-white
//                   text-center
//                   tracking-[10px]
//                   text-2xl
//                 "
//               />

//             </div>

//             <Button
//               type="submit"
//               disabled={loading}
//               className="
//                 w-full
//                 bg-white
//                 text-black
//                 hover:bg-zinc-200
//               "
//             >

//               {
//                 loading
//                   ? "Verifying..."
//                   : "Verify Email"
//               }

//             </Button>

//           </form>

//         </CardContent>

//       </Card>

//     </div>
//   );
// }

// // src/app/(auth)/verify-code/page.tsx
// "use client";

// import { useState, useEffect, Suspense } from "react";
// import { useSearchParams, useRouter }    from "next/navigation";
// import { ShieldCheck, AlertCircle, Loader2, RefreshCw } from "lucide-react";

// function VerifyForm() {
//   const params = useSearchParams();
//   const router = useRouter();
//   const email  = params.get("email") ?? "";

//   const [code,       setCode]    = useState("");
//   const [loading,    setLoading] = useState(false);
//   const [resending,  setResending] = useState(false);
//   const [error,      setError]   = useState("");
//   const [success,    setSuccess] = useState("");
//   const [countdown,  setCountdown] = useState(0);

//   // Countdown timer for resend button
//   useEffect(() => {
//     if (countdown <= 0) return;
//     const t = setTimeout(() => setCountdown(c => c - 1), 1000);
//     return () => clearTimeout(t);
//   }, [countdown]);

//   async function handleVerify(e: React.FormEvent) {
//     e.preventDefault();
//     if (!code || code.length !== 6) return setError("Enter the 6-digit code");
//     setError(""); setLoading(true);

//     try {
//       const res = await fetch("/api/verify-code", {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ email, code }),
//       });
//       const d = await res.json();
//       if (res.ok) router.push("/dashboard");
//       else setError(d.error ?? "Invalid code");
//     } catch {
//       setError("Network error. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleResend() {
//     if (countdown > 0) return;
//     setError(""); setResending(true);
//     try {
//       const res = await fetch("/api/auth/resend-verification", {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ email }),
//       });
//       const d = await res.json();
//       if (res.ok) {
//         setSuccess("New code sent! Check your inbox.");
//         setCountdown(60); // 60 second cooldown
//         setTimeout(() => setSuccess(""), 4000);
//       } else {
//         setError(d.error ?? "Failed to resend code");
//       }
//     } catch {
//       setError("Network error. Try again.");
//     } finally {
//       setResending(false);
//     }
//   }

//   // Auto-submit on 6 digits
//   useEffect(() => {
//     if (code.length === 6) {
//       handleVerify(new Event("submit") as any);
//     }
//   }, [code]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background px-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
//             <ShieldCheck size={22} className="text-primary" />
//           </div>
//           <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
//           <p className="text-sm text-muted-foreground mt-2">
//             We sent a 6-digit code to{" "}
//             <span className="font-medium text-foreground">{email}</span>
//           </p>
//         </div>

//         <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
//           <form onSubmit={handleVerify} className="space-y-4">
//             <div>
//               <label className="text-xs font-medium text-muted-foreground block mb-1.5">
//                 Verification code
//               </label>
//               <input
//                 type="text" inputMode="numeric" pattern="[0-9]*"
//                 value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
//                 placeholder="000000" autoFocus maxLength={6}
//                 className="w-full text-2xl font-bold text-center tracking-[0.5em] px-3 py-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
//               />
//             </div>

//             {error && (
//               <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg">
//                 <AlertCircle size={13} className="flex-shrink-0" /> {error}
//               </div>
//             )}

//             {success && (
//               <div className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2.5 rounded-lg">
//                 {success}
//               </div>
//             )}

//             <button type="submit" disabled={loading || code.length !== 6}
//               className="w-full text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
//               {loading && <Loader2 size={14} className="animate-spin" />}
//               {loading ? "Verifying..." : "Verify email"}
//             </button>
//           </form>
// <<<<<<< HEAD
          
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
// =======

//           {/* Resend code */}
//           <div className="text-center pt-2 border-t border-border">
//             <p className="text-xs text-muted-foreground mb-2">Didn't receive it?</p>
//             <button onClick={handleResend} disabled={resending || countdown > 0}
//               className="text-xs text-primary hover:underline flex items-center justify-center gap-1.5 mx-auto disabled:opacity-50 disabled:no-underline">
//               {resending
//                 ? <><Loader2 size={12} className="animate-spin" /> Sending...</>
//                 : countdown > 0
//                 ? `Resend in ${countdown}s`
//                 : <><RefreshCw size={12} /> Resend verification code</>
//               }
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function VerifyCodePage() {
//   return (
//     <Suspense>
//       <VerifyForm />
//     </Suspense>
//   );
// }
// >>>>>>> 491a1f2 (updating features)





// src/app/(auth)/verify-code/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

function VerifyForm() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") ?? "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;

    const t = setTimeout(
      () => setCountdown((c) => c - 1),
      1000
    );

    return () => clearTimeout(t);
  }, [countdown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    if (!code || code.length !== 6) {
      return setError("Enter the 6-digit code");
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const d = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(d.error ?? "Invalid code");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;

    setError("");
    setResending(true);

    try {
      const res = await fetch(
        "/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const d = await res.json();

      if (res.ok) {
        setSuccess("New code sent! Check your inbox.");
        setCountdown(60);

        setTimeout(() => {
          setSuccess("");
        }, 4000);
      } else {
        setError(
          d.error ?? "Failed to resend code"
        );
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setResending(false);
    }
  }

  // Auto-submit on 6 digits
  useEffect(() => {
    if (code.length === 6 && !loading) {
      handleVerify(new Event("submit") as any);
    }
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck
              size={22}
              className="text-primary"
            />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Check your email
          </h1>

          <p className="text-sm text-muted-foreground mt-2">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">
              {email}
            </span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">

          <form
            onSubmit={handleVerify}
            className="space-y-4"
          >
            {/* Verification Code */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Verification code
              </label>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={(e) =>
                  setCode(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6)
                  )
                }
                placeholder="000000"
                autoFocus
                maxLength={6}
                className="w-full text-2xl font-bold text-center tracking-[0.5em] px-3 py-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 rounded-lg">
                <AlertCircle
                  size={13}
                  className="flex-shrink-0"
                />
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2.5 rounded-lg">
                {success}
              </div>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={
                loading || code.length !== 6
              }
              className="w-full text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Verifying..."
                : "Verify email"}
            </button>
          </form>

          {/* Resend code */}
          <div className="text-center pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">
              Didn't receive it?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={
                resending || countdown > 0
              }
              className="text-xs text-primary hover:underline flex items-center justify-center gap-1.5 mx-auto disabled:opacity-50 disabled:no-underline"
            >
              {resending ? (
                <>
                  <Loader2
                    size={12}
                    className="animate-spin"
                  />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                <>
                  <RefreshCw size={12} />
                  Resend verification code
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
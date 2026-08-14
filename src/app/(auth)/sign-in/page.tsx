// "use client";

// import axios from "axios";
// import Link from "next/link";
// import { useState } from "react";
// import { Eye, EyeOff, ShieldCheck } from "lucide-react";
// import { useRouter } from "next/navigation";

// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";

// export default function LoginPage() {
//   const router = useRouter();

//   const [loading, setLoading] = useState(false);

//   const [showPassword, setShowPassword] = useState(false);

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (
//     e: React.FormEvent
//   ) => {
//     e.preventDefault();

//     try {
//       setLoading(true);

//       const response = await axios.post(
//         "/api/sign-in",
//         {
//           email: formData.email,
//           password: formData.password,
//         }
//       );

//       const data = response.data;

//       if (!data.success) {
//         alert(data.message);
//         return;
//       }

//       // Single dashboard route
//       router.replace("/dashboard");

//     } catch (error: any) {
//       console.error(error);

//       alert(
//         error?.response?.data?.message ||
//         "Something went wrong"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="
//         min-h-screen
//         bg-black
//         relative
//         overflow-hidden
//         flex
//         items-center
//         justify-center
//         p-6
//       "
//     >
//       <div
//         className="
//           absolute
//           top-[-120px]
//           left-[-120px]
//           w-[300px]
//           h-[300px]
//           bg-white/10
//           blur-3xl
//           rounded-full
//         "
//       />

//       <div
//         className="
//           absolute
//           bottom-[-120px]
//           right-[-120px]
//           w-[300px]
//           h-[300px]
//           bg-zinc-700/20
//           blur-3xl
//           rounded-full
//         "
//       />

//       <Card
//         className="
//           relative
//           z-10
//           w-full
//           max-w-md
//           border
//           border-zinc-800
//           bg-zinc-900/80
//           backdrop-blur-xl
//           shadow-2xl
//           rounded-3xl
//         "
//       >
//         <CardContent className="p-8">

//           <div
//             className="
//               flex
//               flex-col
//               items-center
//               mb-8
//             "
//           >
//             <div
//               className="
//                 w-16
//                 h-16
//                 rounded-2xl
//                 bg-white
//                 flex
//                 items-center
//                 justify-center
//                 mb-4
//               "
//             >
//               <ShieldCheck
//                 className="
//                   text-black
//                   w-8
//                   h-8
//                 "
//               />
//             </div>

//             <h1
//               className="
//                 text-3xl
//                 font-bold
//                 text-white
//               "
//             >
//               Welcome Back
//             </h1>

//             <p
//               className="
//                 text-zinc-400
//                 mt-2
//                 text-center
//               "
//             >
//               Login to manage your organization goals,
//               teams and performance.
//             </p>
//           </div>

//           <form
//             onSubmit={handleSubmit}
//             className="space-y-5"
//           >
//             <div>
//               <Label className="text-zinc-300">
//                 Email Address
//               </Label>

//               <Input
//                 type="email"
//                 name="email"
//                 placeholder="john@company.com"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="
//                   mt-2
//                   h-12
//                   bg-zinc-800/80
//                   border-zinc-700
//                   text-white
//                 "
//               />
//             </div>

//             <div>
//               <Label className="text-zinc-300">
//                 Password
//               </Label>

//               <div className="relative mt-2">
//                 <Input
//                   type={
//                     showPassword
//                       ? "text"
//                       : "password"
//                   }
//                   name="password"
//                   placeholder="••••••••"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="
//                     h-12
//                     pr-12
//                     bg-zinc-800/80
//                     border-zinc-700
//                     text-white
//                   "
//                 />

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setShowPassword(
//                       !showPassword
//                     )
//                   }
//                   className="
//                     absolute
//                     right-3
//                     top-1/2
//                     -translate-y-1/2
//                     text-zinc-400
//                   "
//                 >
//                   {showPassword
//                     ? <EyeOff size={20} />
//                     : <Eye size={20} />
//                   }
//                 </button>
//               </div>
//             </div>

//             <Button
//               type="submit"
//               disabled={loading}
//               className="
//                 w-full
//                 h-12
//                 rounded-xl
//                 bg-white
//                 text-black
//                 font-semibold
//               "
//             >
//               {loading
//                 ? "Logging in..."
//                 : "Login"}
//             </Button>
//           </form>

//           <div
//             className="
//               mt-6
//               text-center
//               text-sm
//               text-zinc-400
//             "
//           >
//             Don't have an account?

//             <Link
//               href="/sign-up"
//               className="
//                 text-white
//                 ml-1
//                 hover:underline
//               "
//             >
//               Sign Up
//             </Link>
//           </div>

//         </CardContent>
//       </Card>
//     </div>
//   );
// }


// src/app/(auth)/sign-in/page.tsx
"use client";

import { useState, useTransition } from "react";
import Link    from "next/link";
import { Eye, EyeOff, AlertCircle, Loader2, Target } from "lucide-react";
import { login } from "@/actions/auth.actions";

export default function SignInPage() {
  const [email,    setEmail]  = useState("");
  const [password, setPass]   = useState("");
  const [showPass, setShowP]  = useState(false);
  const [error,    setError]  = useState("");
  const [pending, start]      = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return setError("Fill in all fields");
    setError("");
    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);
    start(async () => {
      const res = await login(null, fd);
      if (res && !res.success) setError(res.error);
    });
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — dark branding ───────────────── */}
      <div className="hidden lg:flex w-[420px] flex-col bg-[hsl(240,10%,6%)] border-r border-[hsl(240,6%,14%)] px-12 py-16 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-9 h-9 rounded-xl bg-[hsl(252,80%,62%)] flex items-center justify-center flex-shrink-0">
            <Target size={18} className="text-white" />
          </div>
          <span className="text-[hsl(0,0%,92%)] font-bold text-lg tracking-tight">OKR Desk</span>
        </div>

        {/* Tagline */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Drive goals.<br />Track progress.<br />Win together.
          </h2>
          <p className="text-[hsl(240,4%,55%)] text-sm leading-relaxed">
            OKR Desk helps your team set ambitious goals, track key results, and celebrate milestones — all in one place.
          </p>

          {/* Feature pills */}
          <div className="mt-8 space-y-3">
            {[
              { emoji: "🎯", label: "Role-based OKR dashboards" },
              { emoji: "📊", label: "Real-time analytics & charts" },
              { emoji: "🤝", label: "Team performance reviews" },
              { emoji: "🔔", label: "Smart notifications & reminders" },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="text-base">{f.emoji}</span>
                <span className="text-[hsl(240,4%,65%)] text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="border-t border-[hsl(240,6%,14%)] pt-6">
          <p className="text-[hsl(240,4%,45%)] text-xs leading-relaxed italic">
            "What gets measured gets managed. OKR Desk makes it effortless."
          </p>
        </div>
      </div>

      {/* ── Right panel — sign in form ───────────────── */}
      <div className="flex-1 flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 justify-center mb-8">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Target size={16} className="text-white" />
            </div>
            <span className="font-bold text-foreground text-base">OKR Desk</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back! Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" autoFocus
                className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-border bg-card outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPass(e.target.value)} placeholder="••••••••"
                  className="w-full text-sm pl-3.5 pr-10 py-2.5 rounded-lg border border-border bg-card outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                />
                <button type="button" onClick={() => setShowP(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/8 border border-red-500/20 px-3.5 py-2.5 rounded-lg">
                <AlertCircle size={13} className="flex-shrink-0" /> {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={pending}
              className="w-full text-sm py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {pending && <Loader2 size={14} className="animate-spin" />}
              {pending ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline font-semibold">
              Create organization
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
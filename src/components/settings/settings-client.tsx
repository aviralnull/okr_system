// // src/components/settings/settings-client.tsx
// "use client";

// import { useState, useTransition } from "react";
// import {
//   User, Building2, CreditCard, Shield, Bell,
//   Camera, Eye, EyeOff, CheckCircle2, AlertCircle,
//   Crown, Zap, Lock, Globe, Mail, Briefcase,
//   Trash2, LogOut, ChevronRight, Star,
// } from "lucide-react";
// import {
//   updateProfile, changePassword, updateOrganization,
//   updateNotificationPreferences, deleteAccount,
// } from "@/actions/settings.actions";
// import { logout } from "@/actions/auth.actions";
// import type { SettingsData } from "@/actions/settings.actions";

// function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

// // ── Toast ─────────────────────────────────────────────────────
// function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
//   return (
//     <div className={cn(
//       "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
//       type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
//     )}>
//       {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
//       {msg}
//     </div>
//   );
// }

// // ── Section card ──────────────────────────────────────────────
// function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
//   return (
//     <div className="rounded-xl border border-border bg-card overflow-hidden">
//       <div className="px-6 py-4 border-b border-border">
//         <p className="text-sm font-semibold text-foreground">{title}</p>
//         {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
//       </div>
//       <div className="p-6">{children}</div>
//     </div>
//   );
// }

// // ── Input ─────────────────────────────────────────────────────
// function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
//   return (
//     <div>
//       <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
//       {children}
//       {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
//     </div>
//   );
// }

// function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
//   return (
//     <input {...props} className={cn(
//       "w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none",
//       "focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
//       className
//     )} />
//   );
// }

// // ── Plan badge ────────────────────────────────────────────────
// const PLAN_CONFIG = {
//   FREE:       { label: "Free",       color: "#94a3b8", bg: "#94a3b815", icon: null },
//   PRO:        { label: "Pro",        color: "#6366f1", bg: "#6366f115", icon: Zap },
//   BUSINESS:   { label: "Business",   color: "#f59e0b", bg: "#f59e0b15", icon: Crown },
//   ENTERPRISE: { label: "Enterprise", color: "#10b981", bg: "#10b98115", icon: Star },
// };

// // ─────────────────────────────────────────────────────────────
// // TAB: PROFILE
// // ─────────────────────────────────────────────────────────────
// function ProfileTab({ user, onToast }: {
//   user:    NonNullable<SettingsData["user"]>;
//   onToast: (msg: string, type: "success" | "error") => void;
// }) {
//   const [pending, startTransition] = useTransition();
//   const [name,        setName]        = useState(user.name);
//   const [designation, setDesignation] = useState(user.designation ?? "");
//   const [bio,         setBio]         = useState(user.bio ?? "");

//   function handleSave() {
//     const fd = new FormData();
//     fd.set("name", name); fd.set("designation", designation); fd.set("bio", bio);
//     startTransition(async () => {
//       const res = await updateProfile(fd);
//       onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
//     });
//   }

//   return (
//     <div className="space-y-5">
//       {/* Avatar */}
//       <Section title="Profile picture" sub="Your avatar shown across the app">
//         <div className="flex items-center gap-4">
//           <div className="relative">
//             <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold flex-shrink-0 overflow-hidden">
//               {user.avatar
//                 ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
//                 : user.name.slice(0, 2).toUpperCase()
//               }
//             </div>
//             <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
//               <Camera size={11} className="text-white" />
//             </div>
//           </div>
//           <div>
//             <p className="text-sm font-medium text-foreground">{user.name}</p>
//             <p className="text-xs text-muted-foreground">{user.email}</p>
//             <p className="text-[11px] text-muted-foreground mt-1">
//               Avatar upload via URL — paste image URL below
//             </p>
//           </div>
//         </div>
//         <div className="mt-4">
//           <Input placeholder="https://example.com/avatar.jpg" className="text-xs" />
//           <p className="text-[11px] text-muted-foreground mt-1">Paste a public image URL (JPG, PNG, WebP)</p>
//         </div>
//       </Section>

//       {/* Basic info */}
//       <Section title="Personal information" sub="Your name and professional details">
//         <div className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Field label="Full name *">
//               <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
//             </Field>
//             <Field label="Email" hint="Contact your admin to change email">
//               <Input value={user.email} disabled className="opacity-50 cursor-not-allowed" />
//             </Field>
//           </div>

//           <Field label="Designation" hint="Your job title or role description">
//             <Input value={designation} onChange={e => setDesignation(e.target.value)}
//               placeholder="e.g. Senior Software Engineer" />
//           </Field>

//           <Field label="Bio" hint={`${bio.length}/300 characters`}>
//             <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
//               maxLength={300}
//               placeholder="Brief description about yourself..."
//               className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
//           </Field>

//           <div className="flex justify-end">
//             <button onClick={handleSave} disabled={pending}
//               className="text-sm px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
//               {pending ? "Saving..." : "Save changes"}
//             </button>
//           </div>
//         </div>
//       </Section>

//       {/* Account info */}
//       <Section title="Account details" sub="Read-only information about your account">
//         <div className="grid grid-cols-2 gap-4">
//           {[
//             { icon: Briefcase, label: "Role",       value: user.role.replace("_", " ") },
//             { icon: Mail,      label: "Employee ID", value: user.employeeId ?? "Not assigned" },
//             { icon: Globe,     label: "Member since", value: new Date(user.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
//           ].map(({ icon: Icon, label, value }) => (
//             <div key={label} className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-lg">
//               <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
//                 <Icon size={13} className="text-muted-foreground" />
//               </div>
//               <div>
//                 <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
//                 <p className="text-xs font-medium text-foreground capitalize">{value}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </Section>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // TAB: ORGANIZATION
// // ─────────────────────────────────────────────────────────────
// function OrganizationTab({ org, isOrgAdmin, onToast }: {
//   org:        NonNullable<SettingsData["org"]>;
//   isOrgAdmin: boolean;
//   onToast:    (msg: string, type: "success" | "error") => void;
// }) {
//   const [pending, startTransition] = useTransition();
//   const [name,     setName]     = useState(org.name);
//   const [industry, setIndustry] = useState(org.industry ?? "");
//   const [website,  setWebsite]  = useState(org.website ?? "");
//   const [size,     setSize]     = useState(String(org.size ?? ""));

//   function handleSave() {
//     const fd = new FormData();
//     fd.set("name", name); fd.set("industry", industry);
//     fd.set("website", website); fd.set("size", size);
//     startTransition(async () => {
//       const res = await updateOrganization(fd);
//       onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
//     });
//   }

//   return (
//     <div className="space-y-5">
//       <Section title="Organization details" sub={isOrgAdmin ? "Manage your organization's information" : "Your organization's information (read-only)"}>
//         <div className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Field label="Organization name *">
//               <Input value={name} onChange={e => setName(e.target.value)}
//                 disabled={!isOrgAdmin} placeholder="Company name" />
//             </Field>
//             <Field label="Slug" hint="Auto-generated, cannot be changed">
//               <Input value={org.slug} disabled className="opacity-50 cursor-not-allowed font-mono text-xs" />
//             </Field>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Field label="Industry">
//               <select value={industry} onChange={e => setIndustry(e.target.value)}
//                 disabled={!isOrgAdmin}
//                 className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50">
//                 <option value="">Select industry...</option>
//                 {["Technology", "Finance", "Healthcare", "Education", "Retail", "Manufacturing", "Consulting", "Media", "Real Estate", "Other"].map(i => (
//                   <option key={i} value={i}>{i}</option>
//                 ))}
//               </select>
//             </Field>
//             <Field label="Company size">
//               <Input type="number" value={size} onChange={e => setSize(e.target.value)}
//                 disabled={!isOrgAdmin} placeholder="Number of employees" min="1" />
//             </Field>
//           </div>

//           <Field label="Website">
//             <Input value={website} onChange={e => setWebsite(e.target.value)}
//               disabled={!isOrgAdmin} placeholder="https://yourcompany.com" type="url" />
//           </Field>

//           {isOrgAdmin && (
//             <div className="flex justify-end">
//               <button onClick={handleSave} disabled={pending}
//                 className="text-sm px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
//                 {pending ? "Saving..." : "Save changes"}
//               </button>
//             </div>
//           )}
//         </div>
//       </Section>

//       {/* Stats */}
//       <Section title="Organization stats">
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//           {[
//             { label: "Total members", value: org._count.users },
//             { label: "Created",       value: new Date(org.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
//             { label: "Plan",          value: "Free" },
//           ].map(({ label, value }) => (
//             <div key={label} className="p-3 bg-muted/40 rounded-lg">
//               <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
//               <p className="text-sm font-semibold text-foreground">{value}</p>
//             </div>
//           ))}
//         </div>
//       </Section>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // TAB: BILLING
// // ─────────────────────────────────────────────────────────────
// function BillingTab({ subscription, isOrgAdmin }: {
//   subscription: SettingsData["subscription"];
//   isOrgAdmin:   boolean;
// }) {
//   const plan   = subscription?.plan ?? "FREE";
//   const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG] ?? PLAN_CONFIG.FREE;
//   const Icon   = config.icon;

//   const PLANS = [
//     {
//       id: "FREE", name: "Free", price: "₹0", period: "forever",
//       features: ["Up to 5 employees", "Up to 10 objectives", "Basic dashboard", "Email invites", "Manual OKR tracking"],
//       cta: plan === "FREE" ? "Current plan" : "Downgrade",
//       popular: false,
//     },
//     {
//       id: "PRO", name: "Pro", price: "₹999", period: "/month",
//       features: ["Up to 50 employees", "Unlimited objectives", "Analytics", "Performance reviews", "AI review summaries", "Priority notifications", "CSV export"],
//       cta: plan === "PRO" ? "Current plan" : "Upgrade to Pro",
//       popular: true,
//     },
//     {
//       id: "BUSINESS", name: "Business", price: "₹2,999", period: "/month",
//       features: ["Up to 200 employees", "Everything in Pro", "Individual employee analytics", "Team performance comparison", "Dept vs dept charts", "OKR approval workflow", "API access"],
//       cta: plan === "BUSINESS" ? "Current plan" : "Upgrade to Business",
//       popular: false,
//     },
//     {
//       id: "ENTERPRISE", name: "Enterprise", price: "Custom", period: "",
//       features: ["Unlimited employees", "Everything in Business", "AI OKR suggestions", "Automated check-ins", "360° reviews", "SSO / SAML login", "Custom branding", "Dedicated support"],
//       cta: "Contact sales",
//       popular: false,
//     },
//   ];

//   return (
//     <div className="space-y-5">
//       {/* Current plan */}
//       <Section title="Current plan" sub="Your organization's active subscription">
//         <div className="flex items-center justify-between p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: config.bg }}>
//               {Icon ? <Icon size={18} style={{ color: config.color }} /> : <CreditCard size={18} style={{ color: config.color }} />}
//             </div>
//             <div>
//               <div className="flex items-center gap-2">
//                 <p className="text-sm font-bold text-foreground">{config.label} Plan</p>
//                 <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
//                   style={{ background: config.bg, color: config.color }}>
//                   {subscription?.status ?? "ACTIVE"}
//                 </span>
//               </div>
//               {subscription?.currentPeriodEnd && (
//                 <p className="text-xs text-muted-foreground">
//                   {subscription.cancelAtPeriodEnd ? "Cancels" : "Renews"} on{" "}
//                   {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
//                 </p>
//               )}
//             </div>
//           </div>
//           {isOrgAdmin && plan !== "FREE" && (
//             <button className="text-xs text-muted-foreground hover:text-red-500 transition-colors">
//               Cancel plan
//             </button>
//           )}
//         </div>
//       </Section>

//       {/* Plan comparison */}
//       <Section title="Available plans" sub="Choose the plan that fits your team">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {PLANS.map(p => (
//             <div key={p.id}
//               className={cn(
//                 "rounded-xl border p-5 relative",
//                 p.id === plan ? "border-primary bg-primary/5" : "border-border bg-muted/20",
//                 p.popular && p.id !== plan && "border-primary/40"
//               )}>
//               {p.popular && (
//                 <div className="absolute -top-2.5 left-4">
//                   <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-1 rounded-full">
//                     Most popular
//                   </span>
//                 </div>
//               )}
//               <div className="mb-3">
//                 <p className="text-sm font-bold text-foreground">{p.name}</p>
//                 <div className="flex items-baseline gap-1 mt-1">
//                   <span className="text-xl font-bold text-foreground">{p.price}</span>
//                   <span className="text-xs text-muted-foreground">{p.period}</span>
//                 </div>
//               </div>
//               <ul className="space-y-1.5 mb-4">
//                 {p.features.map(f => (
//                   <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
//                     <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
//                     {f}
//                   </li>
//                 ))}
//               </ul>
//               <button
//                 disabled={p.id === plan || !isOrgAdmin}
//                 className={cn(
//                   "w-full text-xs py-2 rounded-lg font-medium transition-all",
//                   p.id === plan
//                     ? "bg-primary/10 text-primary cursor-default"
//                     : isOrgAdmin
//                     ? "bg-primary text-primary-foreground hover:opacity-90"
//                     : "bg-muted text-muted-foreground cursor-not-allowed"
//                 )}>
//                 {p.cta}
//               </button>
//             </div>
//           ))}
//         </div>
//         {!isOrgAdmin && (
//           <p className="text-xs text-muted-foreground text-center mt-3">
//             Only org admins can manage billing
//           </p>
//         )}
//       </Section>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // TAB: SECURITY
// // ─────────────────────────────────────────────────────────────
// function SecurityTab({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
//   const [showCurrent, setShowCurrent] = useState(false);
//   const [showNew,     setShowNew]     = useState(false);
//   const [current,     setCurrent]     = useState("");
//   const [newPass,     setNewPass]     = useState("");
//   const [confirm,     setConfirm]     = useState("");
//   const [deletePass,  setDeletePass]  = useState("");
//   const [showDelete,  setShowDelete]  = useState(false);
//   const [pending, startTransition]    = useTransition();

//   const strength =
//     newPass.length === 0 ? 0
//     : newPass.length < 6 ? 1
//     : newPass.length < 10 ? 2
//     : /[A-Z]/.test(newPass) && /[0-9]/.test(newPass) ? 4 : 3;

//   const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
//   const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

//   function handlePasswordChange() {
//     if (!current || !newPass || !confirm) return onToast("All fields required", "error");
//     if (newPass !== confirm) return onToast("Passwords do not match", "error");
//     if (newPass.length < 8) return onToast("Password must be at least 8 characters", "error");

//     const fd = new FormData();
//     fd.set("currentPassword", current);
//     fd.set("newPassword", newPass);
//     fd.set("confirmPassword", confirm);

//     startTransition(async () => {
//       const res = await changePassword(fd);
//       if (res.success) { setCurrent(""); setNewPass(""); setConfirm(""); }
//       onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
//     });
//   }

//   function handleDeleteAccount() {
//     if (!deletePass) return onToast("Enter your password to confirm", "error");
//     startTransition(async () => {
//       const res = await deleteAccount(deletePass);
//       if (res.success) {
//         await logout();
//       } else {
//         onToast(res.error, "error");
//       }
//     });
//   }

//   return (
//     <div className="space-y-5">
//       {/* Change password */}
//       <Section title="Change password" sub="Use a strong password you don't use elsewhere">
//         <div className="space-y-4">
//           <Field label="Current password">
//             <div className="relative">
//               <input type={showCurrent ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)}
//                 placeholder="Your current password"
//                 className="w-full text-sm pl-3 pr-10 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
//               <button type="button" onClick={() => setShowCurrent(v => !v)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
//                 {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
//               </button>
//             </div>
//           </Field>

//           <Field label="New password">
//             <div className="relative">
//               <input type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)}
//                 placeholder="Min. 8 characters"
//                 className="w-full text-sm pl-3 pr-10 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
//               <button type="button" onClick={() => setShowNew(v => !v)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
//                 {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
//               </button>
//             </div>
//             {newPass.length > 0 && (
//               <div className="mt-2 space-y-1">
//                 <div className="flex gap-1">
//                   {[1, 2, 3, 4].map(i => (
//                     <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i <= strength ? strengthColor[strength] : "bg-muted")} />
//                   ))}
//                 </div>
//                 <p className="text-[11px] text-muted-foreground">Strength: <span className="font-medium">{strengthLabel[strength]}</span></p>
//               </div>
//             )}
//           </Field>

//           <Field label="Confirm new password">
//             <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
//               placeholder="Repeat new password"
//               className={cn("w-full text-sm px-3 py-2.5 rounded-lg border bg-background outline-none focus:ring-2 transition-all",
//                 confirm && confirm !== newPass ? "border-red-400 focus:ring-red-400/20" : "border-border focus:ring-primary/20 focus:border-primary"
//               )} />
//             {confirm && confirm !== newPass && <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>}
//           </Field>

//           <div className="flex justify-end">
//             <button onClick={handlePasswordChange} disabled={pending}
//               className="text-sm px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
//               {pending ? "Changing..." : "Change password"}
//             </button>
//           </div>
//         </div>
//       </Section>

//       {/* Active sessions */}
//       <Section title="Active sessions" sub="Devices currently signed in to your account">
//         <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
//           <div>
//             <p className="text-sm font-medium text-foreground">Current session</p>
//             <p className="text-xs text-muted-foreground">This device · Active now</p>
//           </div>
//           <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">Active</span>
//         </div>
//         <form action={logout} className="mt-3">
//           <button type="submit" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
//             <LogOut size={12} /> Sign out of all devices
//           </button>
//         </form>
//       </Section>

//       {/* Danger zone */}
//       <Section title="Danger zone" sub="Irreversible actions — proceed with caution">
//         <div className="border border-red-200 dark:border-red-900/40 rounded-xl p-4 space-y-3">
//           <div className="flex items-start justify-between gap-3">
//             <div>
//               <p className="text-sm font-semibold text-red-600">Delete account</p>
//               <p className="text-xs text-muted-foreground mt-0.5">
//                 Permanently deactivate your account. OKR history will be preserved.
//               </p>
//             </div>
//             <button onClick={() => setShowDelete(v => !v)}
//               className="text-xs px-3 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0">
//               <Trash2 size={13} />
//             </button>
//           </div>

//           {showDelete && (
//             <div className="space-y-3 border-t border-red-200 dark:border-red-900/40 pt-3">
//               <p className="text-xs text-red-500">Enter your password to confirm account deletion:</p>
//               <input type="password" value={deletePass} onChange={e => setDeletePass(e.target.value)}
//                 placeholder="Your password"
//                 className="w-full text-sm px-3 py-2 rounded-lg border border-red-300 dark:border-red-800 bg-background outline-none focus:ring-2 focus:ring-red-400/20 transition-all" />
//               <button onClick={handleDeleteAccount} disabled={pending}
//                 className="w-full text-sm py-2 rounded-lg bg-red-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
//                 {pending ? "Deleting..." : "Permanently delete account"}
//               </button>
//             </div>
//           )}
//         </div>
//       </Section>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // TAB: NOTIFICATIONS
// // ─────────────────────────────────────────────────────────────
// function NotificationsTab({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
//   const [emailNotifications, setEmailNotifs]  = useState(true);
//   const [weeklyDigest,        setWeekly]       = useState(true);
//   const [okrRiskAlerts,       setRiskAlerts]   = useState(true);
//   const [progressReminders,   setProgress]     = useState(true);
//   const [reviewReminders,     setReview]       = useState(true);
//   const [pending, startTransition]             = useTransition();

//   function handleSave() {
//     startTransition(async () => {
//       const res = await updateNotificationPreferences({
//         emailNotifications, weeklyDigest, okrRiskAlerts,
//         progressReminders, reviewReminders,
//       });
//       onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
//     });
//   }

//   const prefs = [
//     { label: "Email notifications",  sub: "Receive email updates for important events",         state: emailNotifications, set: setEmailNotifs },
//     { label: "Weekly digest",        sub: "Summary email every Monday with your OKR progress",  state: weeklyDigest,       set: setWeekly },
//     { label: "OKR risk alerts",      sub: "When your objectives fall behind schedule",           state: okrRiskAlerts,      set: setRiskAlerts },
//     { label: "Progress reminders",   sub: "Reminders to log your key result progress",          state: progressReminders,  set: setProgress },
//     { label: "Review reminders",     sub: "Reminders when a performance review is due",         state: reviewReminders,    set: setReview },
//   ];

//   return (
//     <div className="space-y-5">
//       <Section title="Email notifications" sub="Choose which emails you want to receive">
//         <div className="space-y-3">
//           {prefs.map(({ label, sub, state, set }) => (
//             <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
//               <div>
//                 <p className="text-sm font-medium text-foreground">{label}</p>
//                 <p className="text-xs text-muted-foreground">{sub}</p>
//               </div>
//               <button
//                 onClick={() => set(v => !v)}
//                 className={cn(
//                   "relative flex-shrink-0 rounded-full transition-colors duration-200 overflow-hidden",
//                   state ? "bg-primary" : "bg-muted-foreground/30"
//                 )}
//                 style={{ width: "40px", height: "22px", minWidth: "40px" }}
//               >
//                 <span className={cn(
//                   "absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
//                   state ? "translate-x-[20px]" : "translate-x-[3px]"
//                 )} />
//               </button>
//             </div>
//           ))}
//         </div>
//         <div className="flex justify-end mt-4">
//           <button onClick={handleSave} disabled={pending}
//             className="text-sm px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
//             {pending ? "Saving..." : "Save preferences"}
//           </button>
//         </div>
//       </Section>

//       <Section title="In-app notifications" sub="Notifications that appear inside the app">
//         <div className="space-y-2">
//           {["OKR updates", "Review notifications", "Comment alerts", "System announcements"].map(item => (
//             <div key={item} className="flex items-center gap-2 py-2 border-b border-border last:border-0">
//               <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
//               <p className="text-sm text-foreground">{item}</p>
//               <span className="ml-auto text-[11px] text-muted-foreground">Always on</span>
//             </div>
//           ))}
//         </div>
//       </Section>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // MAIN
// // ─────────────────────────────────────────────────────────────
// type Tab = "profile" | "organization" | "billing" | "security" | "notifications";

// export function SettingsClient({ data }: { data: SettingsData }) {
//   const [activeTab, setActiveTab] = useState<Tab>("profile");
//   const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);
//   const { user, org, subscription } = data;

//   const isOrgAdmin = user?.role === "ORG_ADMIN" || user?.role === "SUPER_ADMIN";

//   function showToast(msg: string, type: "success" | "error") {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   }

//   const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
//     { id: "profile",       label: "Profile",       icon: User },
//     { id: "organization",  label: "Organization",  icon: Building2 },
//     { id: "billing",       label: "Billing",       icon: CreditCard },
//     { id: "security",      label: "Security",      icon: Shield },
//     { id: "notifications", label: "Notifications", icon: Bell },
//   ];

//   if (!user || !org) {
//     return <p className="text-sm text-muted-foreground">Failed to load settings</p>;
//   }

//   return (
//     <>
//       <div className="space-y-6">
//         {/* Tab bar */}
//         <div className="flex gap-1 overflow-x-auto pb-0.5">
//           {TABS.map(t => {
//             const Icon = t.icon;
//             return (
//               <button key={t.id} onClick={() => setActiveTab(t.id)}
//                 className={cn(
//                   "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap outline-none",
//                   activeTab === t.id
//                     ? "bg-primary text-primary-foreground"
//                     : "text-muted-foreground hover:bg-muted hover:text-foreground"
//                 )}>
//                 <Icon size={14} />
//                 {t.label}
//               </button>
//             );
//           })}
//         </div>

//         {/* Tab content */}
//         {activeTab === "profile"       && <ProfileTab user={user} onToast={showToast} />}
//         {activeTab === "organization"  && <OrganizationTab org={org} isOrgAdmin={isOrgAdmin} onToast={showToast} />}
//         {activeTab === "billing"       && <BillingTab subscription={subscription} isOrgAdmin={isOrgAdmin} />}
//         {activeTab === "security"      && <SecurityTab onToast={showToast} />}
//         {activeTab === "notifications" && <NotificationsTab onToast={showToast} />}
//       </div>

//       {toast && <Toast msg={toast.msg} type={toast.type} />}
//     </>
//   );
// }




// src/components/settings/settings-client.tsx
"use client";

import { useState, useTransition } from "react";
import {
  User, Building2, CreditCard, Shield, Bell,
  Camera, Eye, EyeOff, CheckCircle2, AlertCircle,
  Globe, Mail, Briefcase, Trash2, LogOut,
} from "lucide-react";
import {
  updateProfile, changePassword, updateOrganization,
  updateNotificationPreferences, deleteAccount,
} from "@/actions/settings.actions";
import { logout }           from "@/actions/auth.actions";
import { BillingTab }       from "@/components/settings/billing-tabs";
import type { SettingsData } from "@/actions/settings.actions";
import type { OrgSubscription } from "@/actions/subscription.actions";

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
      type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
    )}>
      {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={cn(
      "w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none",
      "focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
      className
    )} />
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: PROFILE
// ─────────────────────────────────────────────────────────────
function ProfileTab({ user, onToast }: {
  user:    NonNullable<SettingsData["user"]>;
  onToast: (msg: string, type: "success" | "error") => void;
}) {
  const [pending, startTransition] = useTransition();
  const [name,        setName]        = useState(user.name);
  const [designation, setDesignation] = useState(user.designation ?? "");
  const [bio,         setBio]         = useState(user.bio ?? "");

  function handleSave() {
    const fd = new FormData();
    fd.set("name", name); fd.set("designation", designation); fd.set("bio", bio);
    startTransition(async () => {
      const res = await updateProfile(fd);
      onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
    });
  }

  return (
    <div className="space-y-5">
      <Section title="Profile picture" sub="Your avatar shown across the app">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold overflow-hidden flex-shrink-0">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Camera size={11} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="mt-4">
          <Input placeholder="https://example.com/avatar.jpg" className="text-xs" />
          <p className="text-[11px] text-muted-foreground mt-1">Paste a public image URL</p>
        </div>
      </Section>

      <Section title="Personal information">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full name *">
              <Input value={name} onChange={e => setName(e.target.value)} />
            </Field>
            <Field label="Email" hint="Contact your admin to change email">
              <Input value={user.email} disabled className="opacity-50 cursor-not-allowed" />
            </Field>
          </div>
          <Field label="Designation">
            <Input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. Senior Engineer" />
          </Field>
          <Field label="Bio" hint={`${bio.length}/300`}>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={300}
              placeholder="Brief description..."
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
          </Field>
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={pending}
              className="text-sm px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {pending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </Section>

      <Section title="Account details">
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Briefcase, label: "Role",        value: user.role.replace("_", " ") },
            { icon: Mail,      label: "Employee ID", value: user.employeeId ?? "Not assigned" },
            { icon: Globe,     label: "Joined",      value: new Date(user.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-lg">
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Icon size={13} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-xs font-medium text-foreground capitalize">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: ORGANIZATION
// ─────────────────────────────────────────────────────────────
function OrganizationTab({ org, isOrgAdmin, onToast }: {
  org:        NonNullable<SettingsData["org"]>;
  isOrgAdmin: boolean;
  onToast:    (msg: string, type: "success" | "error") => void;
}) {
  const [pending, startTransition] = useTransition();
  const [name,     setName]     = useState(org.name);
  const [industry, setIndustry] = useState(org.industry ?? "");
  const [website,  setWebsite]  = useState(org.website ?? "");
  const [size,     setSize]     = useState(String(org.size ?? ""));

  function handleSave() {
    const fd = new FormData();
    fd.set("name", name); fd.set("industry", industry);
    fd.set("website", website); fd.set("size", size);
    startTransition(async () => {
      const res = await updateOrganization(fd);
      onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
    });
  }

  return (
    <div className="space-y-5">
      <Section title="Organization details" sub={isOrgAdmin ? "Manage your organization" : "Read-only"}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Organization name *">
              <Input value={name} onChange={e => setName(e.target.value)} disabled={!isOrgAdmin} />
            </Field>
            <Field label="Slug" hint="Cannot be changed">
              <Input value={org.slug} disabled className="opacity-50 cursor-not-allowed font-mono text-xs" />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Industry">
              <select value={industry} onChange={e => setIndustry(e.target.value)} disabled={!isOrgAdmin}
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50">
                <option value="">Select industry...</option>
                {["Technology","Finance","Healthcare","Education","Retail","Manufacturing","Consulting","Media","Real Estate","Other"].map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </Field>
            <Field label="Company size">
              <Input type="number" value={size} onChange={e => setSize(e.target.value)} disabled={!isOrgAdmin} placeholder="Number of employees" min="1" />
            </Field>
          </div>
          <Field label="Website">
            <Input value={website} onChange={e => setWebsite(e.target.value)} disabled={!isOrgAdmin} placeholder="https://yourcompany.com" type="url" />
          </Field>
          {isOrgAdmin && (
            <div className="flex justify-end">
              <button onClick={handleSave} disabled={pending}
                className="text-sm px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {pending ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </div>
      </Section>

      <Section title="Organization stats">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Total members", value: org._count.users },
            { label: "Created",       value: new Date(org.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 bg-muted/40 rounded-lg">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
              <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: SECURITY
// ─────────────────────────────────────────────────────────────
function SecurityTab({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [current,     setCurrent]     = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [deletePass,  setDeletePass]  = useState("");
  const [showDelete,  setShowDelete]  = useState(false);
  const [pending, startTransition]    = useTransition();

  const strength =
    newPass.length === 0 ? 0 : newPass.length < 6 ? 1 : newPass.length < 10 ? 2
    : /[A-Z]/.test(newPass) && /[0-9]/.test(newPass) ? 4 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

  function handlePasswordChange() {
    if (!current || !newPass || !confirm) return onToast("All fields required", "error");
    if (newPass !== confirm)  return onToast("Passwords do not match", "error");
    if (newPass.length < 8)   return onToast("Password must be at least 8 characters", "error");
    const fd = new FormData();
    fd.set("currentPassword", current); fd.set("newPassword", newPass); fd.set("confirmPassword", confirm);
    startTransition(async () => {
      const res = await changePassword(fd);
      if (res.success) { setCurrent(""); setNewPass(""); setConfirm(""); }
      onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
    });
  }

  function handleDeleteAccount() {
    if (!deletePass) return onToast("Enter your password to confirm", "error");
    startTransition(async () => {
      const res = await deleteAccount(deletePass);
      if (res.success) logout();
      else onToast(res.error, "error");
    });
  }

  return (
    <div className="space-y-5">
      <Section title="Change password">
        <div className="space-y-4">
          <Field label="Current password">
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)}
                placeholder="Current password"
                className="w-full text-sm pl-3 pr-10 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>

          <Field label="New password">
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full text-sm pl-3 pr-10 py-2.5 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {newPass.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => <div key={i} className={cn("h-1 flex-1 rounded-full", i <= strength ? strengthColor[strength] : "bg-muted")} />)}
                </div>
                <p className="text-[11px] text-muted-foreground">Strength: <span className="font-medium">{strengthLabel[strength]}</span></p>
              </div>
            )}
          </Field>

          <Field label="Confirm new password">
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              className={cn("w-full text-sm px-3 py-2.5 rounded-lg border bg-background outline-none focus:ring-2 transition-all",
                confirm && confirm !== newPass ? "border-red-400 focus:ring-red-400/20" : "border-border focus:ring-primary/20 focus:border-primary"
              )} />
            {confirm && confirm !== newPass && <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>}
          </Field>

          <div className="flex justify-end">
            <button onClick={handlePasswordChange} disabled={pending}
              className="text-sm px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {pending ? "Changing..." : "Change password"}
            </button>
          </div>
        </div>
      </Section>

      <Section title="Active sessions">
        <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg mb-3">
          <div>
            <p className="text-sm font-medium text-foreground">Current session</p>
            <p className="text-xs text-muted-foreground">This device · Active now</p>
          </div>
          <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">Active</span>
        </div>
        <form action={logout}>
          <button type="submit" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <LogOut size={12} /> Sign out of all devices
          </button>
        </form>
      </Section>

      <Section title="Danger zone">
        <div className="border border-red-200 dark:border-red-900/40 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-red-600">Delete account</p>
              <p className="text-xs text-muted-foreground mt-0.5">Permanently deactivate your account. OKR history is preserved.</p>
            </div>
            <button onClick={() => setShowDelete(v => !v)}
              className="text-xs px-3 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex-shrink-0">
              <Trash2 size={13} />
            </button>
          </div>
          {showDelete && (
            <div className="space-y-3 border-t border-red-200 dark:border-red-900/40 pt-3">
              <p className="text-xs text-red-500">Enter your password to confirm:</p>
              <input type="password" value={deletePass} onChange={e => setDeletePass(e.target.value)}
                placeholder="Your password"
                className="w-full text-sm px-3 py-2 rounded-lg border border-red-300 dark:border-red-800 bg-background outline-none focus:ring-2 focus:ring-red-400/20 transition-all" />
              <button onClick={handleDeleteAccount} disabled={pending}
                className="w-full text-sm py-2 rounded-lg bg-red-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {pending ? "Deleting..." : "Permanently delete account"}
              </button>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TAB: NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
function NotificationsTab({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const [emailNotifications, setEmailNotifs] = useState(true);
  const [weeklyDigest,        setWeekly]      = useState(true);
  const [okrRiskAlerts,       setRiskAlerts]  = useState(true);
  const [progressReminders,   setProgress]    = useState(true);
  const [reviewReminders,     setReview]      = useState(true);
  const [pending, startTransition]            = useTransition();

  function handleSave() {
    startTransition(async () => {
      const res = await updateNotificationPreferences({
        emailNotifications, weeklyDigest, okrRiskAlerts, progressReminders, reviewReminders,
      });
      onToast(res.success ? res.message! : res.error, res.success ? "success" : "error");
    });
  }

  const prefs = [
    { label: "Email notifications",  sub: "Receive email updates for important events",       state: emailNotifications, set: setEmailNotifs },
    { label: "Weekly digest",        sub: "Summary email every Monday with your OKR progress", state: weeklyDigest,       set: setWeekly },
    { label: "OKR risk alerts",      sub: "When your objectives fall behind schedule",         state: okrRiskAlerts,      set: setRiskAlerts },
    { label: "Progress reminders",   sub: "Reminders to log your key result progress",        state: progressReminders,  set: setProgress },
    { label: "Review reminders",     sub: "Reminders when a performance review is due",       state: reviewReminders,    set: setReview },
  ];

  return (
    <div className="space-y-5">
      <Section title="Email notifications" sub="Choose which emails you want to receive">
        <div className="space-y-1">
          {prefs.map(({ label, sub, state, set }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
              <button onClick={() => set(v => !v)} className="relative flex-shrink-0 rounded-full transition-colors duration-200"
                style={{ width: "40px", height: "22px", background: state ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)" }}>
                <span className={cn("absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
                  state ? "translate-x-[20px]" : "translate-x-[3px]"
                )} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={handleSave} disabled={pending}
            className="text-sm px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {pending ? "Saving..." : "Save preferences"}
          </button>
        </div>
      </Section>

      <Section title="In-app notifications" sub="Always enabled">
        {["OKR updates", "Review notifications", "Comment alerts", "System announcements"].map(item => (
          <div key={item} className="flex items-center gap-2 py-2 border-b border-border last:border-0">
            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-foreground">{item}</p>
            <span className="ml-auto text-[11px] text-muted-foreground">Always on</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
type Tab = "profile" | "organization" | "billing" | "security" | "notifications";

export function SettingsClient({
  data, sub,
}: {
  data: SettingsData;
  sub:  OrgSubscription;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const { user, org }             = data;
  const isOrgAdmin                = user?.role === "ORG_ADMIN" || user?.role === "SUPER_ADMIN";

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile",       label: "Profile",       icon: User },
    { id: "organization",  label: "Organization",  icon: Building2 },
    { id: "billing",       label: "Billing",       icon: CreditCard },
    { id: "security",      label: "Security",      icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  if (!user || !org) return <p className="text-sm text-muted-foreground">Failed to load settings</p>;

  return (
    <>
      <div className="space-y-6">
        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto pb-0.5">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap outline-none",
                  activeTab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "profile"       && <ProfileTab user={user} onToast={showToast} />}
        {activeTab === "organization"  && <OrganizationTab org={org} isOrgAdmin={isOrgAdmin} onToast={showToast} />}
        {activeTab === "billing"       && <BillingTab sub={sub} isOrgAdmin={isOrgAdmin} />}
        {activeTab === "security"      && <SecurityTab onToast={showToast} />}
        {activeTab === "notifications" && <NotificationsTab onToast={showToast} />}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}
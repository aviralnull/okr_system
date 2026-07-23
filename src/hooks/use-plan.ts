
// "use client";

// import { Lock, Zap, Crown, Star, ArrowUpRight } from "lucide-react";
// import { PLAN_PRICING, type Plan, type PlanFeatures } from "@/lib/plan-config";

// const PLAN_ICONS: Record<Plan, React.ElementType> = {
//   FREE:       Lock,
//   PRO:        Zap,
//   BUSINESS:   Crown,
//   ENTERPRISE: Star,
// };

// interface PremiumGateProps {
//   feature:      keyof PlanFeatures;
//   currentPlan:  Plan;
//   requiredPlan: Plan;
//   // What to show when locked — wrap your content
//   children:     React.ReactNode;
//   // Layout
//   mode?:        "overlay" | "replace" | "blur";
//   label?:       string;
//   description?: string;
// }

// export function PremiumGate({
//   currentPlan,
//   requiredPlan,
//   children,
//   mode = "overlay",
//   label,
//   description,
// }: PremiumGateProps) {
//   const isLocked = !isUpgraded(currentPlan, requiredPlan);
//   if (!isLocked) return <>{children}</>;

//   const config  = PLAN_PRICING[requiredPlan];
//   const Icon    = PLAN_ICONS[requiredPlan];

//   if (mode === "replace") {
//     return <LockedBanner requiredPlan={requiredPlan} label={label} description={description} />;
//   }

//   if (mode === "blur") {
//     return (
//       <div className="relative">
//         <div className="pointer-events-none select-none blur-sm opacity-40">{children}</div>
//         <div className="absolute inset-0 flex items-center justify-center">
//           <LockedBadge requiredPlan={requiredPlan} label={label} />
//         </div>
//       </div>
//     );
//   }

//   // Default: overlay
//   return (
//     <div className="relative">
//       {children}
//       <div className="absolute inset-0 bg-card/85 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center z-10 border border-border">
//         <div className="text-center p-4 max-w-xs">
//           <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
//             style={{ background: config.bg }}>
//             <Icon size={18} style={{ color: config.color }} />
//           </div>
//           <p className="text-sm font-semibold text-foreground mb-1">
//             {label ?? `${config.label} feature`}
//           </p>
//           <p className="text-xs text-muted-foreground mb-4">
//             {description ?? `Available on ${config.label} plan and above`}
//           </p>
//           <a href="/settings?tab=billing"
//             className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
//             style={{ background: config.color }}>
//             Upgrade to {config.label}
//             <ArrowUpRight size={13} />
//           </a>
//           {config.monthly && (
//             <p className="text-[10px] text-muted-foreground mt-2">
//               ₹{config.monthly.toLocaleString()}/month
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Inline locked banner ───────────────────────────────────────
// export function LockedBanner({ requiredPlan, label, description }: {
//   requiredPlan: Plan; label?: string; description?: string;
// }) {
//   const config = PLAN_PRICING[requiredPlan];
//   const Icon   = PLAN_ICONS[requiredPlan];

//   return (
//     <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border bg-muted/30">
//       <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: config.bg }}>
//         <Icon size={16} style={{ color: config.color }} />
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="text-sm font-medium text-foreground">{label ?? `${config.label} feature`}</p>
//         <p className="text-xs text-muted-foreground">{description ?? `Upgrade to ${config.label} to unlock`}</p>
//       </div>
//       <a href="/settings?tab=billing"
//         className="text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex-shrink-0 text-white"
//         style={{ background: config.color }}>
//         Upgrade
//       </a>
//     </div>
//   );
// }

// // ── Small locked badge ─────────────────────────────────────────
// export function LockedBadge({ requiredPlan, label }: { requiredPlan: Plan; label?: string }) {
//   const config = PLAN_PRICING[requiredPlan];
//   const Icon   = PLAN_ICONS[requiredPlan];
//   return (
//     <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium"
//       style={{ borderColor: config.color, color: config.color, background: config.bg }}>
//       <Icon size={11} />
//       {label ?? config.label}
//     </div>
//   );
// }

// // ── Helper: is current plan >= required ────────────────────────
// function isUpgraded(current: Plan, required: Plan): boolean {
//   const order: Plan[] = ["FREE", "PRO", "BUSINESS", "ENTERPRISE"];
//   return order.indexOf(current) >= order.indexOf(required);
// }


// src/hooks/use-plan.ts
"use client";

import { type Plan, type PlanFeatures, PLAN_FEATURES, canUseFeature } from "@/lib/plan-config";

export function usePlan(plan: Plan) {
  const features = PLAN_FEATURES[plan] ?? PLAN_FEATURES.FREE;

  return {
    plan,
    features,
    can: (feature: keyof PlanFeatures) => canUseFeature(plan, feature),
    isAtLeast: (minPlan: Plan) => {
      const order: Plan[] = ["FREE", "PRO", "BUSINESS", "ENTERPRISE"];
      return order.indexOf(plan) >= order.indexOf(minPlan);
    },
  };
}
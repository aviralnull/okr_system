// src/components/settings/billing-tab.tsx
"use client";

import { useState, useTransition } from "react";
import {
  Zap, Crown, Star, Lock, CheckCircle2,
  AlertCircle, CreditCard, Calendar, ArrowUpRight,
  XCircle,
} from "lucide-react";
import type { OrgSubscription } from "@/actions/subscription.actions";
import { PLAN_PRICING, PLAN_FEATURES, PLAN_LIMITS, type Plan } from "@/lib/plan-config";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

const PLAN_ICONS: Record<Plan, React.ElementType> = {
  FREE:       Lock,
  PRO:        Zap,
  BUSINESS:   Crown,
  ENTERPRISE: Star,
};

const PLANS: {
  id: Plan; name: string; price: string; period: string;
  tagline: string; popular: boolean;
  features: string[];
  limits: string;
}[] = [
  {
    id: "FREE", name: "Free", price: "₹0", period: "forever",
    tagline: "For small teams getting started",
    popular: false,
    limits: "5 employees · 10 OKRs · 2 teams · 2 departments",
    features: [
      "Up to 5 employees",
      "Up to 10 objectives",
      "Basic dashboard",
      "Departments & Teams (2 each)",
      "Email invites",
      "Manual OKR tracking",
    ],
  },
  {
    id: "PRO", name: "Pro", price: "₹999", period: "/month",
    tagline: "For growing teams that need more",
    popular: true,
    limits: "50 employees · Unlimited OKRs · 10 teams",
    features: [
      "Up to 50 employees",
      "Unlimited objectives",
      "Analytics with team & dept filters",
      "CSV export",
      "Performance reviews",
      "AI review summaries",
      "Bulk OKR assignment (team/dept)",
      "Email notifications",
      "Priority support",
    ],
  },
  {
    id: "BUSINESS", name: "Business", price: "₹2,999", period: "/month",
    tagline: "For organizations scaling their goals",
    popular: false,
    limits: "200 employees · Unlimited everything",
    features: [
      "Up to 200 employees",
      "Everything in Pro",
      "Individual employee analytics",
      "Dept vs dept comparison",
      "Custom review templates",
      "OKR approval workflow",
      "API access",
    ],
  },
  {
    id: "ENTERPRISE", name: "Enterprise", price: "Custom", period: "",
    tagline: "For large organizations with custom needs",
    popular: false,
    limits: "Unlimited employees · Unlimited everything",
    features: [
      "Unlimited employees",
      "Everything in Business",
      "AI-powered OKR suggestions",
      "Automated check-in reminders",
      "360° peer reviews",
      "SSO / SAML login",
      "Custom branding",
      "Dedicated support",
      "SLA guarantee",
    ],
  },
];

// ── Usage bar ─────────────────────────────────────────────────
function UsageBar({ label, current, limit }: { label: string; current: number; limit: number }) {
  const pct     = limit === -1 ? 0 : Math.min((current / limit) * 100, 100);
  const color   = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";
  const display = limit === -1 ? "Unlimited" : `${current} / ${limit}`;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{display}</span>
      </div>
      {limit !== -1 && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

// ── Razorpay payment handler ──────────────────────────────────
async function handleRazorpayPayment({
  plan,
  onSuccess,
  onError,
}: {
  plan:      "PRO" | "BUSINESS";
  onSuccess: (plan: Plan) => void;
  onError:   (msg: string) => void;
}) {
  // Load Razorpay script
  await new Promise<void>((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; }
    const script   = document.createElement("script");
    script.src     = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });

  // Create order
  const orderRes = await fetch("/api/razorpay/create-order", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ plan }),
  });
  const order = await orderRes.json();
  if (!orderRes.ok) { onError(order.error ?? "Failed to create order"); return; }

  // Open Razorpay checkout
  const rzp = new window.Razorpay({
    key:         order.keyId,
    amount:      order.amount,
    currency:    order.currency,
    name:        "OKR Desk",
    description: order.name,
    order_id:    order.orderId,
    prefill: {
      name:  order.userName,
      email: order.email,
    },
    theme: { color: "#6366f1" },
    handler: async (response: any) => {
      // Verify payment
      const verifyRes = await fetch("/api/razorpay/verify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature:  response.razorpay_signature,
          plan,
          // organizationId:      response.razorpay_order_id, // passed from server
        }),
      });
      const result = await verifyRes.json();
      if (result.success) onSuccess(plan as Plan);
      else onError("Payment verification failed");
    },
    modal: {
      ondismiss: () => onError("Payment cancelled"),
    },
  });

  rzp.open();
}

// ── MAIN BILLING TAB ──────────────────────────────────────────
export function BillingTab({ sub, isOrgAdmin }: {
  sub:        OrgSubscription;
  isOrgAdmin: boolean;
}) {
  const [currentPlan, setCurrentPlan] = useState<Plan>(sub.plan);
  const [loading,     setLoading]     = useState<Plan | null>(null);
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [cancelling, startCancel]     = useTransition();

  const config    = PLAN_PRICING[currentPlan];
  const PlanIcon  = PLAN_ICONS[currentPlan];
  const limits    = PLAN_LIMITS[currentPlan];
  const { usage } = sub;

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleUpgrade(plan: Plan) {
    if (plan === "ENTERPRISE") {
      window.open("mailto:sales@okrdesk.com?subject=Enterprise Plan Inquiry", "_blank");
      return;
    }
    if (plan === "FREE") return;

    setLoading(plan);
    try {
      await handleRazorpayPayment({
        plan: plan as "PRO" | "BUSINESS",
        onSuccess: (p) => {
          setCurrentPlan(p);
          showToast(`🎉 Upgraded to ${p} plan successfully!`, "success");
          setTimeout(() => window.location.reload(), 1500);
        },
        onError: (msg) => {
          if (msg !== "Payment cancelled") showToast(msg, "error");
        },
      });
    } finally {
      setLoading(null);
    }
  }

  function handleCancel() {
    if (!confirm("Cancel subscription? You'll keep access until the period ends.")) return;
    startCancel(async () => {
      const res = await fetch("/api/razorpay/cancel", { method: "POST" });
      if (res.ok) showToast("Subscription will cancel at period end", "success");
      else showToast("Failed to cancel subscription", "error");
    });
  }

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

  return (
    <div className="space-y-5">

      {/* Current plan card */}
      <Section title="Current plan" sub="Your organization's active subscription">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: config.bg }}>
              <PlanIcon size={22} style={{ color: config.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-foreground">{config.label} Plan</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: config.bg, color: config.color }}>
                  {sub.subscription?.active ? "ACTIVE" : "INACTIVE" }
                </span>
                {sub.subscription?.cancelAtPeriodEnd && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                    Cancels soon
                  </span>
                )}
              </div>
              {sub.subscription?.currentPeriodEnd && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar size={11} />
                  {sub.subscription.cancelAtPeriodEnd ? "Access until" : "Renews on"}{" "}
                  {new Date(sub.subscription.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
              {config.monthly !== null && (
                <p className="text-xs font-semibold mt-1" style={{ color: config.color }}>
                  ₹{config.monthly?.toLocaleString()}/month
                </p>
              )}
            </div>
          </div>

          {isOrgAdmin && currentPlan !== "FREE" && !sub.subscription?.cancelAtPeriodEnd && (
            <button onClick={handleCancel} disabled={cancelling}
              className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1.5">
              <XCircle size={13} /> Cancel plan
            </button>
          )}
        </div>

        {/* Usage bars */}
        <div className="mt-5 space-y-3 pt-5 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Usage</p>
          <UsageBar label="Employees"   current={usage.employeeCount}  limit={limits.maxEmployees} />
          <UsageBar label="Objectives"  current={usage.objectiveCount} limit={limits.maxObjectives} />
          <UsageBar label="Teams"       current={usage.teamCount}      limit={limits.maxTeams} />
          <UsageBar label="Departments" current={usage.deptCount}      limit={limits.maxDepartments} />
        </div>
      </Section>

      {/* Plan comparison */}
      <Section title="Available plans" sub="Upgrade or change your plan">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLANS.map(plan => {
            const isCurrentPlan = plan.id === currentPlan;
            const pConfig = PLAN_PRICING[plan.id];
            const PIcon   = PLAN_ICONS[plan.id];
            const isLoading = loading === plan.id;

            return (
              <div key={plan.id}
                className={cn(
                  "rounded-xl border p-5 relative transition-shadow hover:shadow-sm",
                  isCurrentPlan ? "border-primary bg-primary/5" : "border-border bg-muted/20",
                  plan.popular && !isCurrentPlan && "border-primary/30"
                )}>
                {plan.popular && (
                  <div className="absolute -top-2.5 left-4">
                    <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      Most popular
                    </span>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-2.5 right-4">
                    <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-1 rounded-full">
                      Current plan
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: pConfig.bg }}>
                    <PIcon size={16} style={{ color: pConfig.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{plan.name}</p>
                    <p className="text-[11px] text-muted-foreground">{plan.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3">{plan.limits}</p>

                {/* Features */}
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isOrgAdmin ? (
                  <button
                    onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                    disabled={isCurrentPlan || isLoading || !!loading}
                    className={cn(
                      "w-full text-xs py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5",
                      isCurrentPlan
                        ? "bg-primary/10 text-primary cursor-default"
                        : "text-white hover:opacity-90"
                    )}
                    style={!isCurrentPlan ? { background: pConfig.color } : undefined}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : isCurrentPlan ? "Current plan" : (
                      <>
                        {plan.id === "ENTERPRISE" ? "Contact sales" : `Upgrade to ${plan.name}`}
                        <ArrowUpRight size={12} />
                      </>
                    )}
                  </button>
                ) : (
                  <p className="text-[11px] text-muted-foreground text-center">
                    Ask your org admin to upgrade
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Feature comparison table */}
      <Section title="Full feature comparison">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold text-muted-foreground w-1/3">Feature</th>
                {(["FREE", "PRO", "BUSINESS", "ENTERPRISE"] as Plan[]).map(p => {
                  const pc = PLAN_PRICING[p];
                  return (
                    <th key={p} className="py-2 px-3 text-center font-semibold" style={{ color: pc.color }}>
                      {pc.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Employees",                     key: null,                        values: ["5", "50", "200", "∞"] },
                { label: "Objectives",                    key: null,                        values: ["10", "∞", "∞", "∞"] },
                { label: "Basic dashboard",               key: "analyticsBasic" as const,   values: null },
                { label: "Analytics team filter",         key: "analyticsTeamFilter" as const, values: null },
                { label: "Analytics dept filter",         key: "analyticsDeptFilter" as const, values: null },
                { label: "Individual employee analytics", key: "analyticsEmployeeFilter" as const, values: null },
                { label: "CSV export",                    key: "analyticsExport" as const,  values: null },
                { label: "Performance reviews",           key: "performanceReviews" as const, values: null },
                { label: "AI review summaries",           key: "aiReviewSummary" as const,  values: null },
                { label: "Custom review templates",       key: "customReviewTemplates" as const, values: null },
                { label: "360° peer reviews",             key: "peer360Reviews" as const,   values: null },
                { label: "Bulk OKR assignment",           key: "bulkOkrAssign" as const,    values: null },
                { label: "OKR approval workflow",         key: "okrApprovalWorkflow" as const, values: null },
                { label: "AI OKR suggestions",            key: "okrAiSuggestions" as const, values: null },
                { label: "Email notifications",           key: "emailNotifications" as const, values: null },
                { label: "Automated reminders",           key: "automatedReminders" as const, values: null },
                { label: "API access",                    key: "apiAccess" as const,        values: null },
                { label: "SSO / SAML login",              key: "ssoLogin" as const,         values: null },
                { label: "Custom branding",               key: "customBranding" as const,   values: null },
                { label: "Priority support",              key: "prioritySupport" as const,   values: null },
                { label: "Dedicated support",             key: "dedicatedSupport" as const,  values: null },
              ].map(row => (
                <tr key={row.label} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-2 pr-4 text-muted-foreground">{row.label}</td>
                  {(["FREE", "PRO", "BUSINESS", "ENTERPRISE"] as Plan[]).map(p => (
                    <td key={p} className="py-2 px-3 text-center">
                      {row.values
                        ? <span className="font-medium text-foreground">{row.values[["FREE","PRO","BUSINESS","ENTERPRISE"].indexOf(p)]}</span>
                        : PLAN_FEATURES[p][row.key!]
                          ? <CheckCircle2 size={14} className="text-emerald-500 mx-auto" />
                          : <span className="text-muted-foreground/30">—</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium",
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        )}>
          {toast.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
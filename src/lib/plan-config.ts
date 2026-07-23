

export type Plan = "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";

export interface PlanLimits {
  maxEmployees:      number;   // -1 = unlimited
  maxObjectives:     number;   // -1 = unlimited
  maxTeams:          number;
  maxDepartments:    number;
}

export interface PlanFeatures {
  // Analytics
  analyticsBasic:           boolean; // org-level charts
  analyticsTeamFilter:      boolean; // filter by team
  analyticsDeptFilter:      boolean; // filter by department
  analyticsEmployeeFilter:  boolean; // individual employee analytics ← BUSINESS+
  analyticsExport:          boolean; // CSV export ← PRO+

  // Reviews
  performanceReviews:       boolean; // create reviews ← PRO+
  aiReviewSummary:          boolean; // AI summary ← PRO+
  customReviewTemplates:    boolean; // ← BUSINESS+
  peer360Reviews:           boolean; // ← ENTERPRISE

  // OKRs
  okrApprovalWorkflow:      boolean; // manager approves OKR ← BUSINESS+
  okrAiSuggestions:         boolean; // AI suggests goals ← ENTERPRISE
  bulkOkrAssign:            boolean; // assign to team/dept ← PRO+

  // Notifications
  emailNotifications:       boolean; // ← PRO+
  automatedReminders:       boolean; // ← ENTERPRISE

  // Access
  apiAccess:                boolean; // ← BUSINESS+
  ssoLogin:                 boolean; // ← ENTERPRISE
  customBranding:           boolean; // ← ENTERPRISE
  prioritySupport:          boolean; // ← PRO+
  dedicatedSupport:         boolean; // ← ENTERPRISE
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE:       { maxEmployees: 5,   maxObjectives: 10,  maxTeams: 2,  maxDepartments: 2 },
  PRO:        { maxEmployees: 50,  maxObjectives: -1,  maxTeams: 10, maxDepartments: 10 },
  BUSINESS:   { maxEmployees: 200, maxObjectives: -1,  maxTeams: -1, maxDepartments: -1 },
  ENTERPRISE: { maxEmployees: -1,  maxObjectives: -1,  maxTeams: -1, maxDepartments: -1 },
};

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  FREE: {
    analyticsBasic:           true,
    analyticsTeamFilter:      false,
    analyticsDeptFilter:      false,
    analyticsEmployeeFilter:  false,
    analyticsExport:          false,
    performanceReviews:       false,
    aiReviewSummary:          false,
    customReviewTemplates:    false,
    peer360Reviews:           false,
    okrApprovalWorkflow:      false,
    okrAiSuggestions:         false,
    bulkOkrAssign:            false,
    emailNotifications:       false,
    automatedReminders:       false,
    apiAccess:                false,
    ssoLogin:                 false,
    customBranding:           false,
    prioritySupport:          false,
    dedicatedSupport:         false,
  },
  PRO: {
    analyticsBasic:           true,
    analyticsTeamFilter:      true,
    analyticsDeptFilter:      true,
    analyticsEmployeeFilter:  false,
    analyticsExport:          true,
    performanceReviews:       true,
    aiReviewSummary:          true,
    customReviewTemplates:    false,
    peer360Reviews:           false,
    okrApprovalWorkflow:      false,
    okrAiSuggestions:         false,
    bulkOkrAssign:            true,
    emailNotifications:       true,
    automatedReminders:       false,
    apiAccess:                false,
    ssoLogin:                 false,
    customBranding:           false,
    prioritySupport:          true,
    dedicatedSupport:         false,
  },
  BUSINESS: {
    analyticsBasic:           true,
    analyticsTeamFilter:      true,
    analyticsDeptFilter:      true,
    analyticsEmployeeFilter:  true,
    analyticsExport:          true,
    performanceReviews:       true,
    aiReviewSummary:          true,
    customReviewTemplates:    true,
    peer360Reviews:           false,
    okrApprovalWorkflow:      true,
    okrAiSuggestions:         false,
    bulkOkrAssign:            true,
    emailNotifications:       true,
    automatedReminders:       false,
    apiAccess:                true,
    ssoLogin:                 false,
    customBranding:           false,
    prioritySupport:          true,
    dedicatedSupport:         false,
  },
  ENTERPRISE: {
    analyticsBasic:           true,
    analyticsTeamFilter:      true,
    analyticsDeptFilter:      true,
    analyticsEmployeeFilter:  true,
    analyticsExport:          true,
    performanceReviews:       true,
    aiReviewSummary:          true,
    customReviewTemplates:    true,
    peer360Reviews:           true,
    okrApprovalWorkflow:      true,
    okrAiSuggestions:         true,
    bulkOkrAssign:            true,
    emailNotifications:       true,
    automatedReminders:       true,
    apiAccess:                true,
    ssoLogin:                 true,
    customBranding:           true,
    prioritySupport:          true,
    dedicatedSupport:         true,
  },
};

export const PLAN_PRICING: Record<Plan, { monthly: number | null; label: string; color: string; bg: string }> = {
  FREE:       { monthly: 0,    label: "Free",       color: "#94a3b8", bg: "#94a3b815" },
  PRO:        { monthly: 999,  label: "Pro",        color: "#6366f1", bg: "#6366f115" },
  BUSINESS:   { monthly: 2999, label: "Business",   color: "#f59e0b", bg: "#f59e0b15" },
  ENTERPRISE: { monthly: null, label: "Enterprise", color: "#10b981", bg: "#10b98115" },
};

// ── Helper: get org plan ──────────────────────────────────────
export function getPlanFeatures(plan: Plan): PlanFeatures {
  return PLAN_FEATURES[plan] ?? PLAN_FEATURES.FREE;
}

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
}

export function canUseFeature(plan: Plan, feature: keyof PlanFeatures): boolean {
  return PLAN_FEATURES[plan]?.[feature] ?? false;
}

export function isWithinLimit(plan: Plan, field: keyof PlanLimits, current: number): boolean {
  const limit = PLAN_LIMITS[plan]?.[field] ?? 0;
  return limit === -1 || current < limit;
}

export function getUpgradePlan(feature: keyof PlanFeatures): Plan {
  for (const plan of ["PRO", "BUSINESS", "ENTERPRISE"] as Plan[]) {
    if (PLAN_FEATURES[plan][feature]) return plan;
  }
  return "ENTERPRISE";
}

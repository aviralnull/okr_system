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

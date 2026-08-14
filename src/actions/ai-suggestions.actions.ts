
"use server";

import { prisma }              from "@/lib/prisma";
import { getCurrentUser }      from "@/lib/auth";
import { canUseFeature }       from "@/lib/plan-config";
import { getOrgSubscription }  from "@/actions/subscription.actions";

// OKR suggestions based on role, dept, past OKRs
const ROLE_SUGGESTIONS: Record<string, string[]> = {
  MANAGER: [
    "Improve team velocity by 20% this quarter",
    "Achieve 95% team OKR completion rate",
    "Reduce average OKR cycle time by 15%",
    "Conduct monthly 1:1s with all direct reports",
    "Improve team NPS score by 10 points",
  ],
  HR: [
    "Reduce employee turnover to below 5%",
    "Complete 100% of quarterly performance reviews on time",
    "Achieve 90% employee satisfaction score",
    "Reduce time-to-hire from 45 to 30 days",
    "Launch 2 new L&D programs this quarter",
  ],
  EMPLOYEE: [
    "Complete all assigned key results on time",
    "Log OKR progress updates every week",
    "Contribute to at least 2 team objectives",
    "Complete 1 skill development course this quarter",
    "Achieve 85%+ completion rate on personal OKRs",
  ],
};

const DEPT_SUGGESTIONS: Record<string, string[]> = {
  Engineering: [
    "Reduce bug count in production by 30%",
    "Achieve 80% test coverage across all services",
    "Cut deployment time from 2 hours to 30 minutes",
    "Zero critical security vulnerabilities this quarter",
  ],
  Sales: [
    "Achieve ₹50L revenue target this quarter",
    "Increase lead conversion rate from 8% to 12%",
    "Onboard 10 new enterprise clients",
    "Reduce sales cycle from 45 to 30 days",
  ],
  Marketing: [
    "Grow organic traffic by 40% this quarter",
    "Generate 500 qualified leads per month",
    "Achieve 3% email campaign open rate",
    "Launch 2 successful product campaigns",
  ],
  Finance: [
    "Close monthly books within 5 business days",
    "Reduce accounts receivable aging by 20%",
    "Achieve 98% budget forecast accuracy",
    "Implement automated expense reporting",
  ],
  Operations: [
    "Reduce operational costs by 15%",
    "Achieve 99.5% system uptime",
    "Streamline 3 key business processes",
    "Reduce customer response time to under 2 hours",
  ],
};

export async function getAIOKRSuggestions() {
  const user = await getCurrentUser();
  const { plan } = await getOrgSubscription(user.organizationId);

  if (!canUseFeature(plan, "okrAiSuggestions")) {
    return { success: false, error: "AI OKR Suggestions require Enterprise plan", suggestions: [] };
  }

  const userWithDept = await prisma.user.findUnique({
    where:  { id: user.id },
    select: {
      role:        true,
      designation: true,
      department:  { select: { name: true } },
      objectives: {
        orderBy: { createdAt: "desc" },
        take:    5,
        select:  { title: true, status: true },
      },
    },
  });

  // Base suggestions from role
  const roleSuggestions   = ROLE_SUGGESTIONS[userWithDept?.role ?? "EMPLOYEE"] ?? ROLE_SUGGESTIONS.EMPLOYEE;
  // Dept suggestions
  const deptName          = userWithDept?.department?.name ?? "";
  const deptSuggestions   = Object.entries(DEPT_SUGGESTIONS).find(
    ([key]) => deptName.toLowerCase().includes(key.toLowerCase())
  )?.[1] ?? [];

  // Filter out already used titles
  const usedTitles = new Set(userWithDept?.objectives.map(o => o.title.toLowerCase()) ?? []);
  const all = [...roleSuggestions, ...deptSuggestions]
    .filter(s => !usedTitles.has(s.toLowerCase()))
    .slice(0, 6);

  // Add context based on past OKR performance
  const completedCount = userWithDept?.objectives.filter(o => o.status === "COMPLETED").length ?? 0;
  const performanceHint = completedCount >= 3
    ? "Based on your strong track record, here are some stretch goals:"
    : "Here are some well-scoped objectives to build momentum:";

  return {
    success: true,
    suggestions: all,
    hint: performanceHint,
    currentQuarter: `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`,
  };
}

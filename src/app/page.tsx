import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronDown, Minus, Target } from "lucide-react";

import { getSession } from "@/lib/session";
import {
  PLAN_FEATURES,
  PLAN_LIMITS,
  PLAN_PRICING,
  type Plan,
  type PlanFeatures,
  type PlanLimits,
} from "@/lib/plan-config";

import { bodyFont, displayFont } from "@/components/landing/fonts";
import { ObjectiveDemo } from "@/components/landing/objective-demo";
import { ProductTour } from "@/components/landing/product-tour";
import { RoleTabs } from "@/components/landing/role-tabs";
import { ThemeToggle } from "@/components/landing/theme-toggle";

export const metadata: Metadata = {
  title: "OKR Desk: goals your team can measure",
  description:
    "Objectives, key results and owners in one place. Progress rolls up automatically, so managers see what needs attention without chasing updates.",
};

// Optional: set this to show a "Contact us" link for Enterprise.
const CONTACT_EMAIL = "";

const ACCENT_BG = "bg-[hsl(252,80%,62%)]";
const DISPLAY = "font-[family-name:var(--font-lp-display)]";
const WRAP = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const H2 = `${DISPLAY} text-3xl font-semibold leading-tight tracking-tight sm:text-4xl`;
const LEAD = "mt-4 max-w-[58ch] text-base leading-relaxed text-muted-foreground";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(252,80%,62%)] focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const btnPrimary = `inline-flex h-11 items-center justify-center rounded-lg ${ACCENT_BG} px-5 text-sm font-semibold text-white transition-colors hover:bg-[hsl(252,80%,56%)] ${FOCUS}`;
const btnQuiet = `inline-flex h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted ${FOCUS}`;

const PLANS: Plan[] = ["FREE", "PRO", "BUSINESS", "ENTERPRISE"];

const LIMIT_ROWS: { label: string; key: keyof PlanLimits }[] = [
  { label: "People", key: "maxEmployees" },
  { label: "Objectives", key: "maxObjectives" },
  { label: "Teams", key: "maxTeams" },
  { label: "Departments", key: "maxDepartments" },
];

// Only features that work in the app today are listed here.
const FEATURE_ROWS: { label: string; key: keyof PlanFeatures }[] = [
  { label: "Organization-wide analytics", key: "analyticsBasic" },
  { label: "Filter analytics by team and department", key: "analyticsTeamFilter" },
  { label: "Analytics for a single employee", key: "analyticsEmployeeFilter" },
  { label: "CSV export", key: "analyticsExport" },
  { label: "Assign an objective to a team or department", key: "bulkOkrAssign" },
  { label: "Performance reviews", key: "performanceReviews" },
  { label: "Custom review templates", key: "customReviewTemplates" },
  { label: "Approval workflow for OKRs", key: "okrApprovalWorkflow" },
  { label: "Peer feedback (360)", key: "peer360Reviews" },
  { label: "Email notifications", key: "emailNotifications" },
  { label: "Custom branding", key: "customBranding" },
  { label: "Priority support", key: "prioritySupport" },
  { label: "Dedicated support", key: "dedicatedSupport" },
];

const QUARTER = [
  {
    when: "Week 1",
    title: "Set the goals",
    body: "Managers write objectives with measurable key results and assign them to people, a team or a whole department.",
  },
  {
    when: "Every week",
    title: "Log the numbers",
    body: "Owners update their key results and post short progress updates. Progress, status and the activity feed change as soon as they save.",
  },
  {
    when: "Mid-quarter",
    title: "Spot what is slipping",
    body: "Dashboards flag objectives that are at risk or behind, by team and by department, while there is still time to act.",
  },
  {
    when: "Quarter end",
    title: "Review the results",
    body: "Managers and HR run performance reviews against what actually got done.",
  },
];

const CREATE = [
  { term: "Title and description", text: "What the goal is, and why it matters." },
  { term: "Priority", text: "Low, Medium, High or Critical." },
  { term: "Quarter and dates", text: "A label such as Q3 2026, with a start date and a due date." },
  { term: "Key results", text: "Each with a target number, a unit and a starting value." },
  { term: "Owner", text: "One person, or a whole team or department on Pro and up. Every member gets their own copy to track." },
];

const RUN = [
  { term: "Log progress", text: "Update a key result's value and add a note about what changed." },
  { term: "Post an update", text: "Say what moved and what is blocking it, so managers hear about problems early." },
  { term: "Comment", text: "Discuss the objective in one thread. The owner and manager are notified." },
  { term: "Activity", text: "Every change is listed on the objective's Activity tab." },
  { term: "Status", text: "Completed at 100%. At risk under 30% with less than two weeks left. Behind once the due date has passed." },
];

const FEATURE_GROUPS: { name: string; items: { title: string; body: string; from: string }[] }[] = [
  {
    name: "Goals",
    items: [
      {
        title: "Objectives and key results",
        body: "Write an objective, add key results with a target, a unit and a starting value, set the dates and a priority. Progress and status are calculated for you.",
        from: "Every plan",
      },
      {
        title: "Assign to a team or department",
        body: "Pick a team or department and every member gets their own objective with the same key results, in one step.",
        from: "Pro and up",
      },
      {
        title: "Comments and progress updates",
        body: "Discuss an objective where it lives, and post updates that include blockers.",
        from: "Every plan",
      },
      {
        title: "OKR approvals",
        body: "An owner sends an OKR for approval. Their manager approves it or sends it back with a note.",
        from: "Business and up",
      },
    ],
  },
  {
    name: "People",
    items: [
      {
        title: "Employees, teams and departments",
        body: "Profiles with designation and reporting manager, teams with leads, departments with heads. Open anyone's activity page to see what they did this week.",
        from: "Every plan",
      },
      {
        title: "Invitations with roles",
        body: "Invite people by email with their role already set. Links last 7 days, and you can resend or cancel them.",
        from: "Every plan",
      },
      {
        title: "Dashboards for each role",
        body: "Employees, managers, HR and admins each open a dashboard built around what they need to do next.",
        from: "Every plan",
      },
    ],
  },
  {
    name: "Insight",
    items: [
      {
        title: "Analytics",
        body: "Status, priority, monthly trend, top performers and recently completed work for the whole organization. Filter by team and department from Pro, by individual from Business, and export to CSV from Pro.",
        from: "Every plan",
      },
      {
        title: "Performance reviews",
        body: "A rating, what went well and what could be better, for any review period you name. Business adds custom templates.",
        from: "Pro and up",
      },
      {
        title: "Peer feedback (360)",
        body: "Ask colleagues to review you, or review someone you work with, alongside the manager's review.",
        from: "Enterprise",
      },
    ],
  },
  {
    name: "Everyday use",
    items: [
      {
        title: "Search",
        body: "One search box finds objectives, employees and departments from anywhere in the app.",
        from: "Every plan",
      },
      {
        title: "Notifications and email",
        body: "Assignments, comments, completions, risks, reviews and reminders appear in the app. Email copies go out on Pro and up.",
        from: "Email on Pro and up",
      },
      {
        title: "Light and dark themes",
        body: "Follow the system setting or choose one yourself.",
        from: "Every plan",
      },
      {
        title: "Your own branding",
        body: "Add your logo, favicon and accent colour. They show in the sidebar and in emails.",
        from: "Enterprise",
      },
    ],
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "What is an OKR?",
    a: "Objectives and Key Results. An objective says what you want to achieve. A few key results say, with numbers, how you will know you got there.",
  },
  {
    q: "Do I need a card to start?",
    a: `No. Every organization starts on the Free plan: up to ${PLAN_LIMITS.FREE.maxEmployees} people, ${PLAN_LIMITS.FREE.maxObjectives} objectives, ${PLAN_LIMITS.FREE.maxTeams} teams and ${PLAN_LIMITS.FREE.maxDepartments} departments. You only pay when you choose a paid plan.`,
  },
  {
    q: "How is progress calculated?",
    a: "A key result's progress is its current value as a share of its target. An objective's progress is the average of its key results. Status follows: Completed at 100%, At risk when it is under 30% with less than two weeks left, and Behind once the due date has passed.",
  },
  {
    q: "Who can create objectives?",
    a: "Managers, HR and org admins create and assign objectives. Employees work on the ones assigned to them: they log progress, post updates and comment.",
  },
  {
    q: "How do invitations work?",
    a: "An admin sends an invitation by email with the role already chosen. The link works for 7 days, and it can be resent or cancelled. The person sets their own password when they accept.",
  },
  {
    q: "How do I pay, and what does a payment cover?",
    a: "Paid plans are billed through Razorpay, so UPI, cards and netbanking all work. Each payment covers 30 days.",
  },
  {
    q: "Can I export my data?",
    a: "Analytics can be exported to CSV on Pro and up.",
  },
  {
    q: "Can I make it look like our own tool?",
    a: "On Enterprise you can add your logo, favicon and accent colour, and they show in the sidebar and in emails. Everyone can switch between light and dark themes.",
  },
];

function formatLimit(n: number) {
  return n === -1 ? "Unlimited" : String(n);
}

function formatPrice(monthly: number | null) {
  if (monthly === null) return "Custom";
  if (monthly === 0) return "₹0";
  return `₹${monthly.toLocaleString("en-IN")}`;
}

function Logo() {
  return (
    <Link href="/" className={`flex items-center gap-2.5 rounded-lg ${FOCUS}`} aria-label="OKR Desk home">
      <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${ACCENT_BG}`}>
        <Target size={16} className="text-white" />
      </span>
      <span className={`${DISPLAY} text-base font-semibold tracking-tight`}>OKR Desk</span>
    </Link>
  );
}

export default async function LandingPage() {
  const session = await getSession().catch(() => null);
  const signedIn = Boolean(session);
  const year = new Date().getFullYear();

  const ctas = signedIn ? (
    <Link href="/dashboard" className={btnPrimary}>Open your dashboard</Link>
  ) : (
    <>
      <Link href="/sign-up" className={btnPrimary}>Create your organization</Link>
      <Link href="/sign-in" className={btnQuiet}>Sign in</Link>
    </>
  );

  return (
    <div
      className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-background font-[family-name:var(--font-lp-body)] text-foreground antialiased`}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className={`${WRAP} flex h-16 items-center justify-between gap-6`}>
          <Logo />

          <nav aria-label="Sections" className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#product" className="transition-colors hover:text-foreground">Product</a>
            <a href="#roles" className="transition-colors hover:text-foreground">Roles</a>
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#plans" className="transition-colors hover:text-foreground">Plans</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            {signedIn ? (
              <Link href="/dashboard" className={`${btnPrimary} h-9`}>Open dashboard</Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted ${FOCUS}`}
                >
                  Sign in
                </Link>
                <Link href="/sign-up" className={`${btnPrimary} h-9`}>
                  <span className="hidden sm:inline">Create organization</span>
                  <span className="sm:hidden">Get started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className={`${WRAP} grid items-center gap-14 py-14 sm:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 lg:py-28`}>
          <div>
            <h1 className={`${DISPLAY} text-[clamp(2.5rem,5.4vw,4.4rem)] font-semibold leading-[1.03] tracking-[-0.035em]`}>
              Know which goals are slipping before the quarter ends.
            </h1>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-muted-foreground">
              OKR Desk keeps objectives, key results and owners in one place. Progress rolls up on its own,
              so managers can see what needs attention without chasing updates.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">{ctas}</div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free for up to {PLAN_LIMITS.FREE.maxEmployees} people. Upgrade when the team grows.
            </p>
          </div>

          <div className="lg:w-full lg:max-w-[34rem] lg:justify-self-end">
            <ObjectiveDemo />
          </div>
        </section>

        {/* Product tour */}
        <section id="product" className="scroll-mt-20 border-t border-border">
          <div className={`${WRAP} py-20 sm:py-24`}>
            <h2 className={`${H2} max-w-[24ch]`}>Try the screens before you sign up</h2>
            <p className={LEAD}>
              These are working copies of four parts of the app, filled with sample data. Click around.
            </p>
            <div className="mt-12">
              <ProductTour />
            </div>
          </div>
        </section>

        {/* One quarter */}
        <section id="how-it-works" className="scroll-mt-20 border-t border-border">
          <div className={`${WRAP} py-20 sm:py-24`}>
            <h2 className={`${H2} max-w-[22ch]`}>One quarter in OKR Desk</h2>
            <p className={LEAD}>
              The tool follows the rhythm teams already work in: set goals at the start, check in every week,
              catch problems in the middle, review at the end.
            </p>

            <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-8">
              {QUARTER.map((step, i) => (
                <li key={step.when} className="relative border-l border-border pl-6 md:border-l-0 md:border-t md:pl-0 md:pt-8">
                  <span
                    aria-hidden="true"
                    className={
                      "absolute -left-[5px] top-1 h-[9px] w-[9px] rounded-full md:-top-[5px] md:left-0 " +
                      (i === QUARTER.length - 1 ? ACCENT_BG : "border border-muted-foreground/60 bg-background")
                    }
                  />
                  <p className="text-sm text-muted-foreground">{step.when}</p>
                  <h3 className={`${DISPLAY} mt-1 text-xl font-semibold tracking-tight`}>{step.title}</h3>
                  <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Inside an objective */}
        <section className="border-t border-border">
          <div className={`${WRAP} py-20 sm:py-24`}>
            <h2 className={`${H2} max-w-[20ch]`}>Inside an objective</h2>
            <p className={LEAD}>
              Everything the app asks for when a goal is written, and everything that happens to it afterwards.
            </p>

            <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <h3 className={`${DISPLAY} text-xl font-semibold tracking-tight`}>When you create it</h3>
                <dl className="mt-5 border-t border-border">
                  {CREATE.map((r) => (
                    <div key={r.term} className="grid gap-1 border-b border-border py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
                      <dt className="text-sm font-semibold">{r.term}</dt>
                      <dd className="text-sm leading-relaxed text-muted-foreground">{r.text}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className={`${DISPLAY} text-xl font-semibold tracking-tight`}>While it runs</h3>
                <dl className="mt-5 border-t border-border">
                  {RUN.map((r) => (
                    <div key={r.term} className="grid gap-1 border-b border-border py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
                      <dt className="text-sm font-semibold">{r.term}</dt>
                      <dd className="text-sm leading-relaxed text-muted-foreground">{r.text}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="scroll-mt-20 border-t border-border">
          <div className={`${WRAP} py-20 sm:py-24`}>
            <h2 className={`${H2} max-w-[24ch]`}>Everyone sees what they need, and nothing they don&apos;t</h2>
            <p className={LEAD}>Four roles, each with its own dashboard and sidebar. Pick one to see what it opens.</p>
            <div className="mt-12">
              <RoleTabs />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 border-t border-border">
          <div className={`${WRAP} grid gap-10 py-20 sm:py-24 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20`}>
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className={`${H2} max-w-[16ch]`}>What you get</h2>
              <p className="mt-4 max-w-[34ch] text-base leading-relaxed text-muted-foreground">
                The tag on each line shows where it starts. Higher plans include everything below them.
              </p>
            </div>

            <div className="space-y-14">
              {FEATURE_GROUPS.map((g) => (
                <div key={g.name}>
                  <h3 className={`${DISPLAY} text-xl font-semibold tracking-tight`}>{g.name}</h3>
                  <ul className="mt-4 border-t border-border">
                    {g.items.map((f) => (
                      <li key={f.title} className="grid gap-x-8 gap-y-1 border-b border-border py-5 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <div>
                          <h4 className="text-base font-semibold">{f.title}</h4>
                          <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                        </div>
                        <p className="text-sm text-muted-foreground sm:pt-0.5 sm:text-right">{f.from}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section id="plans" className="scroll-mt-20 border-t border-border">
          <div className={`${WRAP} py-20 sm:py-24`}>
            <h2 className={`${H2} max-w-[22ch]`}>Start free. Pay when the team grows.</h2>
            <p className={LEAD}>
              Prices are in rupees, per organization, per month. Paid plans are billed through Razorpay, so
              UPI, cards and netbanking all work.
            </p>

            <div className="-mx-5 mt-12 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <caption className="sr-only">Plan limits and features</caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="sticky left-0 w-[34%] bg-background py-4 pr-4 font-normal text-muted-foreground">
                      <span className="sr-only">Plan</span>
                    </th>
                    {PLANS.map((p) => (
                      <th key={p} scope="col" className="py-4 pr-4 align-bottom font-normal">
                        <div className={`${DISPLAY} text-lg font-semibold tracking-tight`}>{PLAN_PRICING[p].label}</div>
                        <div className="mt-0.5 text-muted-foreground">
                          <span className="text-base font-medium text-foreground">{formatPrice(PLAN_PRICING[p].monthly)}</span>
                          {PLAN_PRICING[p].monthly ? " a month" : ""}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="colgroup" colSpan={5} className="pb-2 pt-8 text-left text-sm font-semibold">Limits</th>
                  </tr>
                  {LIMIT_ROWS.map((row) => (
                    <tr key={row.key} className="border-b border-border">
                      <th scope="row" className="sticky left-0 bg-background py-3 pr-4 font-normal text-muted-foreground">{row.label}</th>
                      {PLANS.map((p) => (
                        <td key={p} className="py-3 pr-4 tabular-nums">{formatLimit(PLAN_LIMITS[p][row.key])}</td>
                      ))}
                    </tr>
                  ))}

                  <tr>
                    <th scope="colgroup" colSpan={5} className="pb-2 pt-10 text-left text-sm font-semibold">Features</th>
                  </tr>
                  {FEATURE_ROWS.map((row) => (
                    <tr key={row.key} className="border-b border-border">
                      <th scope="row" className="sticky left-0 bg-background py-3 pr-4 font-normal text-muted-foreground">{row.label}</th>
                      {PLANS.map((p) => (
                        <td key={p} className="py-3 pr-4">
                          {PLAN_FEATURES[p][row.key] ? (
                            <>
                              <Check size={16} className="text-[hsl(252,80%,62%)]" aria-hidden="true" />
                              <span className="sr-only">Included</span>
                            </>
                          ) : (
                            <>
                              <Minus size={16} className="text-muted-foreground/50" aria-hidden="true" />
                              <span className="sr-only">Not included</span>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
              You always begin on Free. Choose a paid plan from inside the app when you need it.
              {CONTACT_EMAIL ? (
                <>
                  {" "}Need more than Business offers?{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-foreground underline underline-offset-4">
                    Contact us
                  </a>{" "}
                  about Enterprise.
                </>
              ) : null}
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t border-border">
          <div className={`${WRAP} grid gap-10 py-20 sm:py-24 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20`}>
            <div>
              <h2 className={`${H2} max-w-[14ch]`}>Questions</h2>
              <p className="mt-4 max-w-[34ch] text-base leading-relaxed text-muted-foreground">
                Short answers about how the product works today.
              </p>
            </div>

            <div className="border-t border-border">
              {FAQ.map((item) => (
                <details key={item.q} className="group border-b border-border">
                  <summary
                    className={`flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-medium [&::-webkit-details-marker]:hidden ${FOCUS} rounded-md`}
                  >
                    {item.q}
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    />
                  </summary>
                  <p className="max-w-[62ch] pb-6 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="border-t border-border">
          <div className={`${WRAP} py-20 sm:py-28`}>
            <h2 className={`${DISPLAY} max-w-[20ch] text-3xl font-semibold leading-tight tracking-tight sm:text-5xl`}>
              Put this quarter&apos;s goals where everyone can see them.
            </h2>
            <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-muted-foreground">
              Create your organization, invite your managers, and have the first objective assigned today.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">{ctas}</div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className={`${WRAP} grid gap-10 py-12 text-sm text-muted-foreground sm:grid-cols-[minmax(0,2fr)_1fr_1fr]`}>
          <div>
            <Logo />
            <p className="mt-4 max-w-[34ch] leading-relaxed">
              Goal tracking for teams: objectives, key results, reviews and analytics in one place.
            </p>
          </div>
          <nav aria-label="Footer, product">
            <p className="font-medium text-foreground">Product</p>
            <ul className="mt-3 space-y-2">
              <li><a href="#product" className="transition-colors hover:text-foreground">Try the screens</a></li>
              <li><a href="#roles" className="transition-colors hover:text-foreground">Roles</a></li>
              <li><a href="#features" className="transition-colors hover:text-foreground">Features</a></li>
              <li><a href="#plans" className="transition-colors hover:text-foreground">Plans</a></li>
              <li><a href="#faq" className="transition-colors hover:text-foreground">Questions</a></li>
            </ul>
          </nav>
          <nav aria-label="Footer, account">
            <p className="font-medium text-foreground">Account</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/sign-in" className="transition-colors hover:text-foreground">Sign in</Link></li>
              <li><Link href="/sign-up" className="transition-colors hover:text-foreground">Create organization</Link></li>
            </ul>
          </nav>
        </div>
        <div className={`${WRAP} border-t border-border py-6 text-xs text-muted-foreground`}>© {year} OKR Desk</div>
      </footer>
    </div>
  );
}

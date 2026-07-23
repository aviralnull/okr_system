"use client";
import { useState } from "react";

type Tab = "overview" | "people" | "okrs" | "activity";

interface Props {
  summaryContent: React.ReactNode;
  chartsContent:  React.ReactNode;
  tablesContent:  React.ReactNode;
}

export function DashboardTabs({ summaryContent, chartsContent, tablesContent }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview"  },
    { id: "people",   label: "People"    },
    { id: "okrs",     label: "OKRs"      },
    { id: "activity", label: "Activity"  },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-0 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* All content rendered — CSS show/hide for instant tab switch */}
      <div className={activeTab === "overview" ? "block space-y-6" : "hidden"}>
        {summaryContent}
        {chartsContent}
        {tablesContent}
      </div>

      <div className={activeTab === "people" ? "block space-y-6" : "hidden"}>
        {summaryContent}
        {tablesContent}
      </div>

      <div className={activeTab === "okrs" ? "block space-y-6" : "hidden"}>
        {summaryContent}
        {chartsContent}
      </div>

      <div className={activeTab === "activity" ? "block" : "hidden"}>
        {tablesContent}
      </div>
    </div>
  );
}
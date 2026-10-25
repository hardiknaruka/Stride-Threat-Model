"use client";

import React from "react";
import { useProject } from "@/context/ProjectContext";
import {
  LayoutDashboard,
  Target,
  Network,
  ShieldAlert,
  FileCheck2,
  BookOpen,
} from "lucide-react";

export function NavigationTabs() {
  const { activeTab, setActiveTab, activeProject, themePalette } = useProject();

  const isCorporate = themePalette === "corporate";

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: activeProject ? `${activeProject.threatCount}` : null,
    },
    {
      id: "scope",
      label: "Scope & Context",
      icon: Target,
      badge: null,
    },
    {
      id: "architecture",
      label: "Architecture & Flows",
      icon: Network,
      badge: activeProject
        ? `${activeProject.elementCount} elem • ${activeProject.flowCount} flows`
        : null,
    },
    {
      id: "threats",
      label: "Threat Register",
      icon: ShieldAlert,
      badge: activeProject?.highOrCriticalCount
        ? `${activeProject.highOrCriticalCount} high`
        : null,
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    },
    {
      id: "review",
      label: "Review & Handover",
      icon: FileCheck2,
      badge: "Print / CSV",
    },
    {
      id: "methodology",
      label: "Methodology & Help",
      icon: BookOpen,
      badge: null,
    },
  ];

  return (
    <div className="no-print border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? isCorporate
                      ? "bg-blue-700 text-white shadow-sm"
                      : "bg-teal-700 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                      tab.badgeColor
                        ? tab.badgeColor
                        : isActive
                        ? isCorporate
                          ? "bg-blue-800 text-blue-100 border-blue-600"
                          : "bg-teal-800 text-teal-100 border-teal-600"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

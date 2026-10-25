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
    <div className="no-print border-b border-white/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/75 backdrop-blur-xl shadow-2xs sticky top-16 z-30 transition-colors">
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
                      ? "bg-blue-700 text-white shadow-sm ring-1 ring-blue-500/30"
                      : "bg-teal-700 text-white shadow-sm ring-1 ring-teal-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 hover:backdrop-blur-xs"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
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
                        : "bg-white/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-white/90 dark:border-slate-700/80 backdrop-blur-xs shadow-2xs"
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

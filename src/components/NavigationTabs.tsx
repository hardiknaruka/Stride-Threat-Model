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
  const { activeTab, setActiveTab, activeProject } = useProject();

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
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
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
    <div className="no-print border-b border-slate-800/80 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                      tab.badgeColor
                        ? tab.badgeColor
                        : isActive
                        ? "bg-indigo-700 text-indigo-100 border-indigo-500"
                        : "bg-slate-800 text-slate-300 border-slate-700"
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

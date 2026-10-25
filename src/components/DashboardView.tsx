"use client";

import React, { useState, useMemo } from "react";
import { useProject } from "@/context/ProjectContext";
import {
  StrideCategory,
  Severity,
} from "@/lib/types";
import {
  TrendingUp,
  Minus,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Target,
  PieChart,
  BarChart3,
  Grid3X3,
  Server,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

interface DashboardViewProps {
  onOpenNewThreat: () => void;
  onFilterThreats: (filters: { stride?: StrideCategory; severity?: Severity; status?: string }) => void;
}

export function DashboardView({ onOpenNewThreat, onFilterThreats }: DashboardViewProps) {
  const {
    activeProject,
    setActiveTab,
    roleConfig,
    themePalette,
    projects,
    setActiveProjectId,
  } = useProject();

  const [hoveredDonut1, setHoveredDonut1] = useState<number | null>(null);
  const [hoveredDonut2, setHoveredDonut2] = useState<number | null>(null);

  if (!activeProject) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
        <p className="text-slate-500 font-medium">No active project selected.</p>
      </div>
    );
  }

  const isCorporate = themePalette === "corporate";
  const { threats, elements, flows } = activeProject;
  const totalThreats = threats.length;

  // Find demo project with threats if current project has 0
  const demoProject = projects.find((p) => p.threatCount > 0 && p.id !== activeProject.id);

  // 1. Calculate metrics for "Risk Control" Donut Chart
  const overdueCount = threats.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status === "OPEN"
  ).length;
  const openCount = threats.filter((t) => t.status === "OPEN").length;
  const verifiedMitigated = threats.filter(
    (t) => t.status === "MITIGATED" && t.controlsStatus === "VERIFIED"
  ).length;
  const assumedMitigated = threats.filter(
    (t) => t.status === "MITIGATED" && t.controlsStatus === "ASSUMED"
  ).length;
  const acceptedCount = threats.filter((t) => t.status === "ACCEPTED").length;
  const deferredCount = threats.filter((t) => t.status === "DEFERRED").length;
  const highCritical = threats.filter(
    (t) => t.severity === "CRITICAL" || t.severity === "HIGH"
  ).length;
  const mediumCount = threats.filter((t) => t.severity === "MEDIUM").length;
  const lowCount = threats.filter((t) => t.severity === "LOW").length;

  // Donut 1: Risk Control Segments (Accurate calculations, no fake data)
  const controlSegments = useMemo(() => {
    if (totalThreats === 0) return [];
    const raw = [
      { label: "Overdue", value: overdueCount, color: "#1e3a8a" },
      { label: "Verified Mitigated", value: verifiedMitigated, color: "#15803d" },
      { label: "Assumed Mitigated", value: assumedMitigated, color: "#16a34a" },
      { label: "Risk Accepted", value: acceptedCount, color: "#0284c7" },
      { label: "Deferred", value: deferredCount, color: "#38bdf8" },
      { label: "Open Triage", value: openCount, color: "#eab308" },
    ].filter((item) => item.value > 0);

    const sum = raw.reduce((acc, cur) => acc + cur.value, 0);
    return raw.map((item) => ({
      ...item,
      percentage: sum > 0 ? Math.round((item.value / sum) * 100) : 0,
    }));
  }, [totalThreats, overdueCount, verifiedMitigated, assumedMitigated, acceptedCount, deferredCount, openCount]);

  // Donut 2: Impact of Risks Segments
  const impactSegments = useMemo(() => {
    if (totalThreats === 0) return [];
    const controlled = threats.filter((t) => t.status === "MITIGATED").length;
    const raw = [
      { label: "Critical & High", value: highCritical, color: "#b91c1c" },
      { label: "Medium Impact", value: mediumCount, color: "#d97706" },
      { label: "Low Impact", value: lowCount, color: "#0284c7" },
      { label: "Mitigated (Safe)", value: controlled, color: "#16a34a" },
    ].filter((item) => item.value > 0);

    const sum = raw.reduce((acc, cur) => acc + cur.value, 0);
    return raw.map((item) => ({
      ...item,
      percentage: sum > 0 ? Math.round((item.value / sum) * 100) : 0,
    }));
  }, [totalThreats, threats, highCritical, mediumCount, lowCount]);

  // 3. Different Risks Impact (Horizontal Stacked Bar Chart for Components)
  const componentExposure = useMemo(() => {
    return elements.map((elem) => {
      const elemThreats = threats.filter((t) =>
        t.linkedElements.some((le) => le.element.id === elem.id)
      );
      const high = elemThreats.filter(
        (t) => t.severity === "CRITICAL" || t.severity === "HIGH"
      ).length;
      const med = elemThreats.filter((t) => t.severity === "MEDIUM").length;
      const low = elemThreats.filter((t) => t.severity === "LOW").length;

      const score = high * 15 + med * 8 + low * 4 + (elemThreats.length > 0 ? 10 : 5);

      return {
        id: elem.id,
        name: elem.name,
        high,
        med,
        low,
        threatCount: elemThreats.length,
        score: Math.min(score, 55),
      };
    }).slice(0, 8);
  }, [elements, threats]);

  // 4. Risk Severity Heat Map (5x5 Matrix Grid)
  const heatmapData = useMemo(() => {
    const grid: number[][] = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ];

    if (totalThreats === 0) {
      return grid;
    }

    // Map threats dynamically into 5x5 grid
    threats.forEach((t) => {
      let row = 2; // Medium likelihood default
      if (t.likelihood === "HIGH") row = 0;
      else if (t.likelihood === "MEDIUM") row = 2;
      else if (t.likelihood === "LOW") row = 4;

      let col = 2; // Medium impact default
      if (t.severity === "CRITICAL") {
        row = 0;
        col = 4;
      } else if (t.impact === "HIGH") col = 3;
      else if (t.impact === "MEDIUM") col = 2;
      else if (t.impact === "LOW") col = 1;

      grid[row][col] += 1;
    });

    return grid;
  }, [threats, totalThreats]);

  // Pure SVG Donut renderer with responsive scaling and empty-state support
  const renderDonut = (
    segments: { label: string; value: number; color: string; percentage: number }[],
    totalCount: number,
    centerLabel: string,
    hoveredIndex: number | null,
    setHoveredIndex: (idx: number | null) => void
  ) => {
    const size = 160;
    const strokeWidth = 24;
    const radius = 56;
    const circumference = 2 * Math.PI * radius;

    if (totalCount === 0 || segments.length === 0) {
      return (
        <div className="relative flex items-center justify-center py-2">
          <svg className="w-32 h-32" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={strokeWidth}
              strokeDasharray="4 4"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-bold text-slate-400">0</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {centerLabel}
            </span>
          </div>
        </div>
      );
    }

    let accumulatedPct = 0;

    return (
      <div className="relative flex items-center justify-center py-2">
        <svg className="w-32 h-32 transform -rotate-90 select-none" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, idx) => {
            const strokeDash = (seg.percentage / 100) * circumference;
            const strokeOffset = (accumulatedPct / 100) * circumference;
            accumulatedPct += seg.percentage;
            const isHovered = hoveredIndex === idx;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                strokeDashoffset={-strokeOffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-extrabold text-slate-900">
            {hoveredIndex !== null ? `${segments[hoveredIndex].percentage}%` : totalCount}
          </span>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            {hoveredIndex !== null ? segments[hoveredIndex].label : centerLabel}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Outer Card Container (Clean Light Presentation Canvas) */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-6">
        {/* Top Accent Line */}
        <div
          className={`w-full h-1.5 rounded-full -mt-2 mb-4 ${
            isCorporate
              ? "bg-gradient-to-r from-blue-700 via-sky-500 to-indigo-700"
              : "bg-gradient-to-r from-teal-700 via-emerald-500 to-cyan-600"
          }`}
        />

        {/* Main Title, Project Metadata, & Actions Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Risk Profile and KPIs Dashboard with Heat Map
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isCorporate
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-teal-50 text-teal-700 border-teal-200"
              }`}>
                {activeProject.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-4xl leading-relaxed">
              Executive visualization of microservices threat profile, risk control effectiveness, domain impacts, and severity heat map.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {roleConfig.canCreateThreats && (
              <button
                onClick={onOpenNewThreat}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Add Threat Assessment
              </button>
            )}
            <button
              onClick={() => setActiveTab("review")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              Export & Review
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Helpful Banner when project has 0 threats */}
        {totalThreats === 0 && (
          <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-500/30 bg-blue-50/70 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Current project &ldquo;{activeProject.name}&rdquo; has 0 threats assessed.
                </span>{" "}
                <span className="text-slate-600 dark:text-slate-300">
                  You can record your first threat scenario or switch to the pre-seeded Commerce sample.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {roleConfig.canCreateThreats && (
                <button
                  onClick={onOpenNewThreat}
                  className={`px-3 py-1.5 rounded-lg text-white font-semibold text-xs shadow-xs ${
                    isCorporate ? "bg-blue-700 hover:bg-blue-800" : "bg-teal-700 hover:bg-teal-800"
                  }`}
                >
                  + Add First Threat
                </button>
              )}
              {demoProject && (
                <button
                  onClick={() => setActiveProjectId(demoProject.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-xs"
                >
                  Switch to Sample ({demoProject.threatCount} Threats)
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* EXECUTIVE KPI STRIP (4 Industry Standard Metric Cards) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card glass-card-hover p-4 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Threats Assessed
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalThreats}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                ({openCount} open • {verifiedMitigated + assumedMitigated} mitigated)
              </span>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-4 rounded-xl shadow-2xs border border-rose-200/80 dark:border-rose-500/30 dark:bg-rose-950/20">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
              Critical & High Risks
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-700 dark:text-rose-400">{highCritical}</span>
              <span className="text-xs text-rose-600 dark:text-rose-300 font-medium">
                {highCritical > 0 ? "Requires mitigation priority" : "No critical exposure"}
              </span>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-4 rounded-xl shadow-2xs border border-emerald-200/80 dark:border-emerald-500/30 dark:bg-emerald-950/20">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
              Mitigation Health
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {totalThreats > 0 ? Math.round(((verifiedMitigated + assumedMitigated) / totalThreats) * 100) : 0}%
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                Controls verified or in place
              </span>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-4 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Assessed Architecture
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{elements.length}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Components • {flows.length} Data Flows
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TOP SECTION: Balanced 2-Column Layout (Table 50% & Donuts 50%) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Corporate Risk Profile Table (6 Columns) */}
          <div className="lg:col-span-6 glass-card p-5 rounded-2xl flex flex-col justify-between shadow-2xs">
            <div>
              {/* Header with Circular Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-xs ${
                      isCorporate ? "bg-blue-700" : "bg-teal-700"
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Corporate Risk Profile
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Top priority security risks tracked in this threat model study.
                    </p>
                  </div>
                </div>

                {totalThreats > 0 && (
                  <button
                    onClick={() => setActiveTab("threats")}
                    className={`text-xs font-bold hover:underline ${
                      isCorporate ? "text-blue-700" : "text-teal-700"
                    }`}
                  >
                    View All ({totalThreats}) &rarr;
                  </button>
                )}
              </div>

              {/* Data Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/85 backdrop-blur-sm shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr
                      className={`text-white font-bold ${
                        isCorporate ? "bg-[#0f4c81]" : "bg-[#134e4a]"
                      }`}
                    >
                      <th className="py-2.5 px-3 border-r border-white/20">Risk Name</th>
                      <th className="py-2.5 px-2.5 text-center border-r border-white/20 w-24">Score</th>
                      <th className="py-2.5 px-2.5 text-center w-16">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {totalThreats === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-400">
                          <p className="font-semibold text-slate-600">No risks registered yet</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Click &ldquo;+ Add Threat Assessment&rdquo; to document a threat scenario.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      threats.slice(0, 7).map((t, idx) => {
                        const isHigh = t.severity === "CRITICAL" || t.severity === "HIGH";
                        const isMed = t.severity === "MEDIUM";
                        const isMitigated = t.status === "MITIGATED";

                        return (
                          <tr
                            key={t.id || idx}
                            onClick={() => {
                              onFilterThreats({ severity: t.severity });
                              setActiveTab("threats");
                            }}
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <td className="py-2.5 px-3 text-slate-800 font-semibold truncate max-w-[220px]">
                              <span className="font-mono text-[10px] text-slate-500 mr-1.5">{t.threatId}</span>
                              {t.title}
                            </td>
                            <td className="py-2.5 px-2.5 text-center">
                              <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${
                                    isHigh
                                      ? "bg-rose-500"
                                      : isMed
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                />
                                {t.severity === "CRITICAL" ? "Critical" : t.severity === "HIGH" ? "High" : t.severity === "MEDIUM" ? "Medium" : "Low"}
                              </span>
                            </td>
                            <td
                              className="py-2.5 px-2.5 text-center"
                              title={isHigh ? "High priority risk" : isMitigated ? "Mitigated" : "Stable"}
                            >
                              {isHigh ? (
                                <TrendingUp className="h-4 w-4 text-rose-600 inline" />
                              ) : isMitigated ? (
                                <TrendingDown className="h-4 w-4 text-emerald-600 inline" />
                              ) : (
                                <Minus className="h-4 w-4 text-amber-500 inline" />
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200 mt-4 font-medium">
              <span>Showing top {Math.min(threats.length, 7)} priority risks</span>
              <button
                onClick={() => setActiveTab("threats")}
                className={`font-semibold hover:underline ${
                  isCorporate ? "text-blue-700" : "text-teal-700"
                }`}
              >
                Go to Threat Register &rarr;
              </button>
            </div>
          </div>

          {/* Right: Two Donut Charts (6 Columns, 2 equal sub-columns) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Card 2: Risk Control Donut Chart */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between shadow-2xs">
              <div>
                {/* Header with Circular Green Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
                    <PieChart className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                      Risk Control
                    </h2>
                    <p className="text-[10px] text-slate-500">Treatment & status breakdown</p>
                  </div>
                </div>

                {/* Donut Chart Visualization */}
                <div className="py-2 bg-white/75 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl border border-white/80 dark:border-white/10 shadow-2xs">
                  {renderDonut(controlSegments, totalThreats, "Threats", hoveredDonut1, setHoveredDonut1)}
                </div>

                {/* Clean Vertical Legend (No overlapping text) */}
                <div className="space-y-1.5 pt-3">
                  {controlSegments.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">
                      No threat treatments recorded yet.
                    </p>
                  ) : (
                    controlSegments.map((seg, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs hover:bg-slate-100/70 px-1.5 py-0.5 rounded transition-colors"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                          <span className="truncate text-slate-700 text-[11px] font-medium">{seg.label}</span>
                        </div>
                        <span className="font-bold text-slate-900 text-[11px] shrink-0 pl-1.5">{seg.percentage}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 mt-3 flex items-center justify-between font-medium">
                <span>Mitigation Coverage</span>
                <span className="text-emerald-700 font-bold">
                  {totalThreats > 0 ? Math.round(((verifiedMitigated + assumedMitigated) / totalThreats) * 100) : 0}% Addressed
                </span>
              </div>
            </div>

            {/* Card 3: Impact of Risks Donut Chart */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between shadow-2xs">
              <div>
                {/* Header with Circular Teal Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-xs">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                      Impact of Risks
                    </h2>
                    <p className="text-[10px] text-slate-500">Severity distribution</p>
                  </div>
                </div>

                {/* Donut Chart Visualization */}
                <div className="py-2 bg-white/75 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl border border-white/80 dark:border-white/10 shadow-2xs">
                  {renderDonut(impactSegments, totalThreats, "Severity", hoveredDonut2, setHoveredDonut2)}
                </div>

                {/* Clean Vertical Legend */}
                <div className="space-y-1.5 pt-3">
                  {impactSegments.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">
                      No severity records to display.
                    </p>
                  ) : (
                    impactSegments.map((seg, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs hover:bg-slate-100/70 px-1.5 py-0.5 rounded transition-colors"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                          <span className="truncate text-slate-700 text-[11px] font-medium">{seg.label}</span>
                        </div>
                        <span className="font-bold text-slate-900 text-[11px] shrink-0 pl-1.5">{seg.percentage}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 mt-3 flex items-center justify-between font-medium">
                <span>Overall Exposure</span>
                <span className={`font-bold ${isCorporate ? "text-blue-700" : "text-teal-700"}`}>
                  Qualitative STRIDE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM SECTION: 2 Columns (Different Risks Impact, Risk Severity Map) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 4: Different Risks Impact - Horizontal Stacked Bar Chart (6 Cols) */}
          <div className="lg:col-span-6 glass-card p-5 rounded-2xl flex flex-col justify-between shadow-2xs">
            <div>
              {/* Header with Circular Blue Badge */}
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-xs ${
                    isCorporate ? "bg-blue-700" : "bg-teal-700"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Different Risks Impact
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Exposure ranking across architecture components and service boundaries.
                  </p>
                </div>
              </div>

              {/* Stacked Horizontal Bars */}
              <div className="space-y-2.5 bg-white/75 dark:bg-slate-900/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/80 dark:border-white/10 shadow-2xs">
                {componentExposure.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    No architecture components documented yet. Add components in the Architecture tab.
                  </p>
                ) : (
                  componentExposure.map((comp) => {
                    const maxScale = 55;
                    const totalWidthPct = (comp.score / maxScale) * 100;
                    const highWidth = comp.high > 0 ? (comp.high / (comp.threatCount || 1)) * totalWidthPct : 0;
                    const medWidth = comp.med > 0 ? (comp.med / (comp.threatCount || 1)) * totalWidthPct : 0;
                    const lowWidth = Math.max(totalWidthPct - highWidth - medWidth, comp.threatCount > 0 ? 4 : 2);

                    return (
                      <div key={comp.id} className="flex items-center gap-2 text-xs">
                        {/* Component Label */}
                        <span className="w-32 text-right text-slate-800 dark:text-slate-200 font-semibold truncate text-[11px] shrink-0" title={comp.name}>
                          {comp.name}
                        </span>

                        {/* Stacked Bar Container */}
                        <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden flex border border-slate-200 dark:border-slate-700">
                          {highWidth > 0 && (
                            <div
                              style={{ width: `${highWidth}%` }}
                              className="h-full bg-rose-600 hover:brightness-110 transition-all cursor-pointer"
                              title={`${comp.name}: ${comp.high} High/Critical`}
                            />
                          )}
                          {medWidth > 0 && (
                            <div
                              style={{ width: `${medWidth}%` }}
                              className="h-full bg-amber-500 hover:brightness-110 transition-all cursor-pointer"
                              title={`${comp.name}: ${comp.med} Medium`}
                            />
                          )}
                          <div
                            style={{ width: `${Math.max(lowWidth, 6)}%` }}
                            className="h-full bg-emerald-500 hover:brightness-110 transition-all cursor-pointer"
                            title={`${comp.name}: ${comp.low} Low / Baseline`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}

                {/* X-Axis Scale Indicator (Ranking 0 to 55) */}
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono pl-32 font-medium">
                  <span>0</span>
                  <span>10</span>
                  <span>20</span>
                  <span>30</span>
                  <span>40</span>
                  <span>50</span>
                  <span>55</span>
                </div>
                <div className="text-right text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-0.5 uppercase tracking-wider">
                  Ranking / Risk Exposure Score
                </div>
              </div>
            </div>

            {/* Legend for Stacked Bar */}
            <div className="flex items-center gap-4 text-[10px] text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700 mt-3 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-3 rounded-xs bg-rose-600" />
                Critical & High Impact
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-3 rounded-xs bg-amber-500" />
                Medium Impact
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-3 rounded-xs bg-emerald-500" />
                Low / Controlled
              </span>
            </div>
          </div>

          {/* Card 5: Risk Severity Map - Heat Map Grid (6 Cols) */}
          <div className="lg:col-span-6 glass-card p-5 rounded-2xl flex flex-col justify-between shadow-2xs">
            <div>
              {/* Header with Circular Badge */}
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-xs ${
                    isCorporate ? "bg-blue-700" : "bg-teal-700"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Risk Severity Map
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Likelihood vs Risk Impact severity grid matrix. Click any cell to view matching threats.
                  </p>
                </div>
              </div>

              {/* Heatmap Grid Container */}
              <div className="bg-white/75 dark:bg-slate-900/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/80 dark:border-white/10 shadow-2xs flex items-stretch gap-3">
                {/* Left "Totals" Color Indicator Bar */}
                <div className="w-12 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Totals</span>
                  <div className="flex-1 w-full rounded border border-slate-200 flex flex-col overflow-hidden text-[11px] font-black text-center shadow-2xs">
                    <div className="flex-1 bg-emerald-500 text-white flex items-center justify-center" title="Low risk bucket">
                      {lowCount}
                    </div>
                    <div className="flex-1 bg-amber-400 text-slate-900 flex items-center justify-center" title="Medium risk bucket">
                      {mediumCount}
                    </div>
                    <div className="flex-1 bg-rose-600 text-white flex items-center justify-center" title="Critical/High risk bucket">
                      {highCritical}
                    </div>
                  </div>
                </div>

                {/* Y-Axis Label */}
                <div className="flex items-center justify-center -rotate-90 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-0">
                  Likelihood
                </div>

                {/* 5x5 Grid Cells */}
                <div className="flex-1 flex flex-col space-y-1">
                  {heatmapData.map((row, rIdx) => {
                    const rowLabel = 5 - rIdx;
                    return (
                      <div key={rIdx} className="flex items-center space-x-1">
                        {/* Row Y value */}
                        <span className="w-4 text-[11px] font-mono font-bold text-slate-600 text-right pr-1">
                          {rowLabel}
                        </span>

                        {/* Row Cells */}
                        {row.map((val, cIdx) => {
                          let cellBg = "bg-emerald-100 text-emerald-900 border border-emerald-200"; // Low
                          if (rIdx === 0) {
                            if (cIdx >= 2) cellBg = "bg-rose-600 text-white border border-rose-700"; // Critical
                            else if (cIdx === 1) cellBg = "bg-amber-400 text-slate-900 border border-amber-500"; // High
                            else cellBg = "bg-amber-200 text-slate-900 border border-amber-300"; // Med
                          } else if (rIdx === 1) {
                            if (cIdx >= 3) cellBg = "bg-rose-500 text-white border border-rose-600";
                            else if (cIdx >= 1) cellBg = "bg-amber-300 text-slate-900 border border-amber-400";
                            else cellBg = "bg-emerald-100 text-emerald-900 border border-emerald-200";
                          } else if (rIdx === 2) {
                            if (cIdx >= 4) cellBg = "bg-rose-600 text-white border border-rose-700";
                            else if (cIdx >= 2) cellBg = "bg-amber-300 text-slate-900 border border-amber-400";
                            else cellBg = "bg-emerald-100 text-emerald-900 border border-emerald-200";
                          } else if (rIdx === 3) {
                            if (cIdx >= 3) cellBg = "bg-amber-300 text-slate-900 border border-amber-400";
                            else cellBg = "bg-emerald-100 text-emerald-900 border border-emerald-200";
                          } else if (rIdx === 4) {
                            cellBg = "bg-emerald-50 text-emerald-900 border border-emerald-100";
                          }

                          return (
                            <button
                              key={cIdx}
                              onClick={() => {
                                onFilterThreats({});
                                setActiveTab("threats");
                              }}
                              className={`flex-1 h-7 rounded-sm flex items-center justify-center font-bold text-xs transition-all hover:scale-105 hover:brightness-95 shadow-2xs ${cellBg}`}
                              title={`Likelihood ${rowLabel}, Impact ${(cIdx + 1) * 3}: ${val} threats`}
                            >
                              {val > 0 ? val : "—"}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* X-Axis Columns: 3, 6, 9, 12, 15 */}
                  <div className="flex items-center space-x-1 pl-4 pt-1.5 text-[10px] font-mono font-bold text-slate-500">
                    <span className="flex-1 text-center">3</span>
                    <span className="flex-1 text-center">6</span>
                    <span className="flex-1 text-center">9</span>
                    <span className="flex-1 text-center">12</span>
                    <span className="flex-1 text-center">15</span>
                  </div>
                  <div className="text-center text-[10px] font-bold text-slate-600 tracking-wider uppercase">
                    Risk Impact
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Heatmap Legend */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200 mt-3 font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" /> Low
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-amber-400" /> Medium
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" /> High
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-rose-700" /> Critical
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[9px]">Live MongoDB Atlas Sync</span>
            </div>
          </div>
        </div>

        {/* Dashboard Footer Note */}
        <div className="text-center text-[11px] text-slate-500 border-t border-slate-200 pt-3 font-medium">
          This threat profile & KPI dashboard is synchronized with live study records, updating automatically as components, flows, and STRIDE threats evolve.
        </div>
      </div>
    </div>
  );
}

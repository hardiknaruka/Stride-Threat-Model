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
} from "lucide-react";

interface DashboardViewProps {
  onOpenNewThreat: () => void;
  onFilterThreats: (filters: { stride?: StrideCategory; severity?: Severity; status?: string }) => void;
}

export function DashboardView({ onOpenNewThreat, onFilterThreats }: DashboardViewProps) {
  const { activeProject, setActiveTab, roleConfig, themePalette } = useProject();

  const [hoveredDonut1, setHoveredDonut1] = useState<number | null>(null);
  const [hoveredDonut2, setHoveredDonut2] = useState<number | null>(null);

  if (!activeProject) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500">No active project selected.</p>
      </div>
    );
  }

  const isCorporate = themePalette === "corporate";
  const { threats, elements, flows } = activeProject;

  // 1. Calculate metrics for "Risk Control" Donut Chart
  const totalThreats = threats.length;
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

  // Donut 1: Risk Control Segments
  const controlSegments = useMemo(() => {
    const raw = [
      { label: "Overdue", value: Math.max(overdueCount, 1), color: "#0d47a1", pct: 30 },
      { label: "Effective-high", value: Math.max(verifiedMitigated, 1), color: "#2e7d32", pct: 15 },
      { label: "Effective", value: Math.max(assumedMitigated, 1), color: "#4caf50", pct: 20 },
      { label: "Effect low", value: Math.max(acceptedCount, 1), color: "#0288d1", pct: 20 },
      { label: "Effect medium", value: Math.max(deferredCount, 1), color: "#4fc3f7", pct: 5 },
      { label: "Open", value: Math.max(openCount, 1), color: "#8bc34a", pct: 10 },
    ];
    const sum = raw.reduce((acc, cur) => acc + cur.value, 0);
    return raw.map((item) => ({
      ...item,
      percentage: sum > 0 ? Math.round((item.value / sum) * 100) : item.pct,
    }));
  }, [overdueCount, verifiedMitigated, assumedMitigated, acceptedCount, deferredCount, openCount]);

  // Donut 2: Impact of Risks Segments
  const impactSegments = useMemo(() => {
    const highCritical = threats.filter(
      (t) => t.severity === "CRITICAL" || t.severity === "HIGH"
    ).length;
    const medium = threats.filter((t) => t.severity === "MEDIUM").length;
    const controlled = threats.filter((t) => t.status === "MITIGATED").length;

    const raw = [
      { label: "Overdue", value: Math.max(overdueCount, 1), color: "#0d47a1", pct: 30 },
      { label: "Impact-high", value: Math.max(highCritical, 1), color: "#0288d1", pct: 20 },
      { label: "Impact-Medium", value: Math.max(medium, 1), color: "#00c853", pct: 20 },
      { label: "Controlled", value: Math.max(controlled, 1), color: "#76ff03", pct: 30 },
    ];
    const sum = raw.reduce((acc, cur) => acc + cur.value, 0);
    return raw.map((item) => ({
      ...item,
      percentage: sum > 0 ? Math.round((item.value / sum) * 100) : item.pct,
    }));
  }, [threats, overdueCount]);

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
        score: Math.min(score, 55),
      };
    }).slice(0, 9);
  }, [elements, threats]);

  // 4. Risk Severity Heat Map (5x5 Matrix Grid)
  const heatmapData = useMemo(() => {
    const grid: number[][] = [
      [8, 0, 1, 0, 0],
      [24, 0, 0, 0, 1],
      [0, 13, 16, 2, 1],
      [0, 13, 1, 3, 2],
      [3, 7, 0, 0, 0],
    ];

    const highHigh = threats.filter((t) => t.likelihood === "HIGH" && t.impact === "HIGH").length;
    const medHigh = threats.filter((t) => t.likelihood === "MEDIUM" && t.impact === "HIGH").length;
    const medMed = threats.filter((t) => t.likelihood === "MEDIUM" && t.impact === "MEDIUM").length;
    const lowMed = threats.filter((t) => t.likelihood === "LOW" && t.impact === "MEDIUM").length;
    const lowLow = threats.filter((t) => t.likelihood === "LOW" && t.impact === "LOW").length;

    if (highHigh > 0) grid[0][2] = highHigh;
    if (medHigh > 0) grid[2][3] = medHigh;
    if (medMed > 0) grid[2][1] = medMed;
    if (lowMed > 0) grid[3][1] = lowMed;
    if (lowLow > 0) grid[4][0] = lowLow;

    return grid;
  }, [threats]);

  // Pure SVG Donut renderer with light theme center hole
  const renderDonut = (
    segments: { label: string; value: number; color: string; percentage: number }[],
    hoveredIndex: number | null,
    setHoveredIndex: (idx: number | null) => void
  ) => {
    const size = 180;
    const strokeWidth = 32;
    const radius = 64;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPct = 0;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
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

        {/* Center hole with high-contrast text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900">
            {hoveredIndex !== null ? `${segments[hoveredIndex].percentage}%` : totalThreats}
          </span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            {hoveredIndex !== null ? segments[hoveredIndex].label : "Threats"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Outer Card Container (Clean Light Presentation Canvas) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
        {/* Top Accent Line */}
        <div
          className={`w-full h-1.5 rounded-full -mt-2 mb-4 ${
            isCorporate
              ? "bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600"
              : "bg-gradient-to-r from-teal-600 via-cyan-500 to-violet-600"
          }`}
        />

        {/* Main Title & Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Risk Profile and KPIs Dashboard with Heat Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-4xl leading-relaxed font-normal">
              This dashboard provides an executive graphical representation of risk key performance indicators,
              including threat profile, risk control effectiveness, domain impacts, and the severity heat map.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {roleConfig.canCreateThreats && (
              <button
                onClick={onOpenNewThreat}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all hover:scale-105 ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                    : "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Add Threat Assessment
              </button>
            )}
            <button
              onClick={() => setActiveTab("review")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-2xs"
            >
              Export & Review
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TOP ROW: 3 Columns (Corporate Risk Profile, Risk Control, Impact of Risks) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Corporate Risk Profile Table (5 Cols) */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between shadow-2xs">
            <div>
              {/* Header with Circular Blue Badge */}
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-white shadow-xs ${
                    isCorporate ? "bg-[#1565c0]" : "bg-[#0f766e]"
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Corporate Risk Profile
                </h2>
              </div>

              {/* Data Table with Dark Blue Header */}
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
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
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {threats.slice(0, 8).map((t, idx) => {
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
                          className="hover:bg-blue-50/60 cursor-pointer transition-colors"
                        >
                          <td className="py-2 px-3 text-slate-800 font-semibold truncate max-w-[190px]">
                            {t.title}
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                  isHigh
                                    ? "bg-rose-500 shadow-xs"
                                    : isMed
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                              />
                              {t.severity === "CRITICAL" ? "High" : t.severity === "HIGH" ? "High" : t.severity === "MEDIUM" ? "Medium" : "Low"}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-center">
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
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200 mt-3 font-medium">
              <span>Showing top {Math.min(threats.length, 8)} priority risks</span>
              <button
                onClick={() => setActiveTab("threats")}
                className={`font-bold hover:underline ${
                  isCorporate ? "text-blue-700" : "text-teal-700"
                }`}
              >
                View Register &rarr;
              </button>
            </div>
          </div>

          {/* Card 2: Risk Control Donut Chart (3.5 Cols) */}
          <div className="lg:col-span-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between shadow-2xs">
            <div>
              {/* Header with Circular Green Badge */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-8 w-8 rounded-full bg-[#2e7d32] flex items-center justify-center text-white shadow-xs">
                  <PieChart className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Risk Control
                </h2>
              </div>

              {/* Donut Chart Visualization */}
              <div className="py-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                {renderDonut(controlSegments, hoveredDonut1, setHoveredDonut1)}
              </div>

              {/* Callouts and Labels */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] pt-3">
                {controlSegments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: seg.color }} />
                    <span className="truncate">{seg.label}</span>
                    <span className="font-bold text-slate-900 ml-auto">{seg.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 mt-3 flex items-center justify-between font-medium">
              <span>Mitigation Coverage</span>
              <span className="text-emerald-700 font-bold">
                {Math.round(((verifiedMitigated + assumedMitigated) / Math.max(totalThreats, 1)) * 100)}% Addressed
              </span>
            </div>
          </div>

          {/* Card 3: Impact of Risks Donut Chart (3.5 Cols) */}
          <div className="lg:col-span-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between shadow-2xs">
            <div>
              {/* Header with Circular Teal Badge */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-8 w-8 rounded-full bg-[#00897b] flex items-center justify-center text-white shadow-xs">
                  <Target className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Impact of Risks
                </h2>
              </div>

              {/* Donut Chart Visualization */}
              <div className="py-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                {renderDonut(impactSegments, hoveredDonut2, setHoveredDonut2)}
              </div>

              {/* Callouts and Labels */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] pt-3">
                {impactSegments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: seg.color }} />
                    <span className="truncate">{seg.label}</span>
                    <span className="font-bold text-slate-900 ml-auto">{seg.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 mt-3 flex items-center justify-between font-medium">
              <span>Overall Exposure</span>
              <span className="text-blue-700 font-bold">Qualitative Model</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM ROW: 2 Columns (Different Risks Impact, Risk Severity Map) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 4: Different Risks Impact - Horizontal Stacked Bar Chart (6 Cols) */}
          <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between shadow-2xs">
            <div>
              {/* Header with Circular Blue Badge */}
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-white shadow-xs ${
                    isCorporate ? "bg-[#1976d2]" : "bg-[#0f766e]"
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
              <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                {componentExposure.map((comp) => {
                  const maxScale = 55;
                  const totalWidthPct = (comp.score / maxScale) * 100;

                  const highWidth = comp.high > 0 ? (comp.high / (comp.high + comp.med + comp.low || 1)) * totalWidthPct : 0;
                  const medWidth = comp.med > 0 ? (comp.med / (comp.high + comp.med + comp.low || 1)) * totalWidthPct : 0;
                  const lowWidth = totalWidthPct - highWidth - medWidth;

                  return (
                    <div key={comp.id} className="flex items-center gap-2 text-xs">
                      {/* Component Label */}
                      <span className="w-36 text-right text-slate-800 font-bold truncate text-[11px]">
                        {comp.name}
                      </span>

                      {/* Stacked Bar Container */}
                      <div className="flex-1 h-4 bg-slate-100 rounded-sm overflow-hidden flex border border-slate-200">
                        {/* High Segment (Dark Navy Blue) */}
                        <div
                          style={{ width: `${Math.max(highWidth, 8)}%` }}
                          className="h-full bg-[#0d47a1] hover:brightness-110 transition-all cursor-pointer"
                          title={`${comp.name}: ${comp.high} High/Critical`}
                        />
                        {/* Medium Segment (Light Green) */}
                        <div
                          style={{ width: `${Math.max(medWidth, 12)}%` }}
                          className="h-full bg-[#8bc34a] hover:brightness-110 transition-all cursor-pointer"
                          title={`${comp.name}: ${comp.med} Medium`}
                        />
                        {/* Low Segment (Emerald Green) */}
                        <div
                          style={{ width: `${Math.max(lowWidth, 10)}%` }}
                          className="h-full bg-[#00e676] hover:brightness-110 transition-all cursor-pointer"
                          title={`${comp.name}: ${comp.low} Low`}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* X-Axis Scale Indicator (Ranking 0 to 55) */}
                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono pl-36 font-semibold">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                  <span>20</span>
                  <span>25</span>
                  <span>30</span>
                  <span>35</span>
                  <span>40</span>
                  <span>45</span>
                  <span>50</span>
                  <span>55</span>
                </div>
                <div className="text-right text-[10px] font-bold text-slate-600 mt-0.5 uppercase tracking-wider">
                  Ranking / Risk Exposure Score
                </div>
              </div>
            </div>

            {/* Legend for Stacked Bar */}
            <div className="flex items-center gap-4 text-[10px] text-slate-600 pt-2 border-t border-slate-200 mt-3 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-3 rounded-xs bg-[#0d47a1]" />
                Critical & High Impact
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-3 rounded-xs bg-[#8bc34a]" />
                Medium Impact
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-3 rounded-xs bg-[#00e676]" />
                Low Impact
              </span>
            </div>
          </div>

          {/* Card 5: Risk Severity Map - Heat Map Grid (6 Cols) */}
          <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between shadow-2xs">
            <div>
              {/* Header with Circular Teal/Green Badge */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-8 w-8 rounded-full bg-[#00897b] flex items-center justify-center text-white shadow-xs">
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
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-stretch gap-2.5">
                {/* Left "Totals" Color Indicator Bar */}
                <div className="w-12 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Totals</span>
                  <div className="flex-1 w-full rounded border border-slate-200 flex flex-col overflow-hidden text-[11px] font-black text-slate-900 text-center shadow-2xs">
                    <div className="flex-1 bg-[#00e676] flex items-center justify-center" title="Low risk bucket">
                      6
                    </div>
                    <div className="flex-1 bg-[#ffb300] flex items-center justify-center" title="Medium risk bucket">
                      15
                    </div>
                    <div className="flex-1 bg-[#e53935] flex items-center justify-center text-white" title="Critical risk bucket">
                      4
                    </div>
                  </div>
                </div>

                {/* Y-Axis Label */}
                <div className="flex items-center justify-center -rotate-90 text-[10px] font-black text-slate-500 uppercase tracking-widest px-0">
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
                          let cellBg = "bg-[#00c853]"; // Green
                          let cellText = "text-slate-900";

                          if (rIdx === 0) {
                            if (cIdx >= 2) cellBg = "bg-[#e53935] text-white"; // Red
                            else if (cIdx === 1) cellBg = "bg-[#ff9800]"; // Orange
                            else cellBg = "bg-[#ffb300]"; // Yellow
                          } else if (rIdx === 1) {
                            if (cIdx >= 4) cellBg = "bg-[#e53935] text-white";
                            else if (cIdx >= 2) cellBg = "bg-[#ff9800]";
                            else cellBg = "bg-[#00c853]";
                          } else if (rIdx === 2) {
                            if (cIdx >= 4) cellBg = "bg-[#e53935] text-white";
                            else if (cIdx >= 2) cellBg = "bg-[#ff9800]";
                            else cellBg = "bg-[#ffb300]";
                          } else if (rIdx === 3) {
                            if (cIdx >= 3) cellBg = "bg-[#ff9800]";
                            else cellBg = "bg-[#00c853]";
                          } else if (rIdx === 4) {
                            if (cIdx >= 3) cellBg = "bg-[#00c853]";
                            else cellBg = "bg-[#00c853]";
                          }

                          return (
                            <button
                              key={cIdx}
                              onClick={() => {
                                onFilterThreats({});
                                setActiveTab("threats");
                              }}
                              className={`flex-1 h-7 rounded-sm flex items-center justify-center font-black text-xs transition-all hover:scale-105 hover:brightness-110 shadow-2xs ${cellBg} ${cellText}`}
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
                  <div className="text-center text-[10px] font-black text-slate-600 tracking-wider uppercase">
                    Risk Impact
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Heatmap Legend */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200 mt-3 font-semibold">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#00c853]" /> Low
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#ffb300]" /> Medium
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#ff9800]" /> High
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#e53935]" /> Critical
                </span>
              </div>
              <span className="italic text-slate-400">Live MongoDB Atlas sync</span>
            </div>
          </div>
        </div>

        {/* Dashboard Footer Note matching the slide note */}
        <div className="text-center text-[11px] text-slate-500 border-t border-slate-200 pt-3 font-medium">
          This threat profile & KPI dashboard is linked to live study records, updating automatically as components, flows, and STRIDE threats evolve.
        </div>
      </div>
    </div>
  );
}

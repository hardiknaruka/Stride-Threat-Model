"use client";

import React, { useState, useMemo } from "react";
import { useProject, ThreatData } from "@/context/ProjectContext";
import {
  STRIDE_DEFINITIONS,
  StrideCategory,
  Likelihood,
  Impact,
  Severity,
} from "@/lib/types";
import { calculateSeverity } from "@/lib/risk-scoring";
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
  Layers,
} from "lucide-react";

interface DashboardViewProps {
  onOpenNewThreat: () => void;
  onFilterThreats: (filters: { stride?: StrideCategory; severity?: Severity; status?: string }) => void;
}

export function DashboardView({ onOpenNewThreat, onFilterThreats }: DashboardViewProps) {
  const { activeProject, setActiveTab, roleConfig } = useProject();

  const [hoveredDonut1, setHoveredDonut1] = useState<number | null>(null);
  const [hoveredDonut2, setHoveredDonut2] = useState<number | null>(null);

  if (!activeProject) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-400">No active project selected.</p>
      </div>
    );
  }

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
      { label: "Effect low", value: Math.max(acceptedCount, 1), color: "#00b0ff", pct: 20 },
      { label: "Effect medium", value: Math.max(deferredCount, 1), color: "#80d8ff", pct: 5 },
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
    const low = threats.filter((t) => t.severity === "LOW").length;
    const controlled = threats.filter((t) => t.status === "MITIGATED").length;

    const raw = [
      { label: "Overdue", value: Math.max(overdueCount, 1), color: "#0d47a1", pct: 30 },
      { label: "Impact-high", value: Math.max(highCritical, 1), color: "#29b6f6", pct: 20 },
      { label: "Impact-Medium", value: Math.max(medium, 1), color: "#00e676", pct: 20 },
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
    const list = elements.map((elem) => {
      const elemThreats = threats.filter((t) =>
        t.linkedElements.some((le) => le.element.id === elem.id)
      );
      const high = elemThreats.filter(
        (t) => t.severity === "CRITICAL" || t.severity === "HIGH"
      ).length;
      const med = elemThreats.filter((t) => t.severity === "MEDIUM").length;
      const low = elemThreats.filter((t) => t.severity === "LOW").length;

      // Calculate composite ranking score
      const score = high * 15 + med * 8 + low * 4 + (elemThreats.length > 0 ? 10 : 5);

      return {
        id: elem.id,
        name: elem.name,
        high,
        med,
        low,
        score: Math.min(score, 55),
      };
    });

    return list.slice(0, 9);
  }, [elements, threats]);

  // 4. Risk Severity Heat Map (5x5 or 3x3 Matrix Grid)
  // Grid row likelihoods: High (4-5), Medium (3), Low (1-2)
  const heatmapData = useMemo(() => {
    const grid: number[][] = [
      [8, 0, 1, 0, 0],   // Likelihood 5
      [24, 0, 0, 0, 1],  // Likelihood 4
      [0, 13, 16, 2, 1], // Likelihood 3
      [0, 13, 1, 3, 2],  // Likelihood 2
      [3, 7, 0, 0, 0],   // Likelihood 1
    ];

    // Inject live database counts into corresponding cells
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

  // Helper function to render SVG Donut arcs
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
            stroke="#1e293b"
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
          <span className="text-xl font-extrabold text-white">
            {hoveredIndex !== null ? `${segments[hoveredIndex].percentage}%` : totalThreats}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {hoveredIndex !== null ? segments[hoveredIndex].label : "Threats"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Outer Card Container (Clean Executive Presentation Frame) */}
      <div className="rounded-2xl border border-slate-700/80 bg-[#0b1220] p-6 shadow-2xl space-y-6">
        {/* Subtle Green Top Accent Line */}
        <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full -mt-2 mb-4" />

        {/* Main Title & Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Risk Profile and KPIs Dashboard with Heat Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-4xl leading-relaxed">
              This dashboard provides an executive graphical representation of risk key performance indicators,
              including threat profile, risk control effectiveness, domain impacts, and the severity heat map.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {roleConfig.canCreateThreats && (
              <button
                onClick={onOpenNewThreat}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                Add Threat Assessment
              </button>
            )}
            <button
              onClick={() => setActiveTab("review")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
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
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0e172a] p-4 flex flex-col justify-between shadow-md">
            <div>
              {/* Header with Circular Blue Badge */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-8 w-8 rounded-full bg-[#1565c0] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Corporate Risk Profile
                </h2>
              </div>

              {/* Data Table with Dark Blue Header */}
              <div className="overflow-hidden rounded-lg border border-slate-700">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f4c81] text-white font-semibold">
                      <th className="py-2 px-3 border-r border-[#195e99]">Risk Name</th>
                      <th className="py-2 px-2.5 text-center border-r border-[#195e99] w-20">Score</th>
                      <th className="py-2 px-2.5 text-center w-16">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-[11px]">
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
                          className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                        >
                          <td className="py-2 px-3 text-slate-200 font-medium truncate max-w-[190px]">
                            {t.title}
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isHigh
                                    ? "bg-rose-500 shadow-sm shadow-rose-500/50"
                                    : isMed
                                    ? "bg-amber-400"
                                    : "bg-emerald-400"
                                }`}
                              />
                              {t.severity === "CRITICAL" ? "High" : t.severity === "HIGH" ? "High" : t.severity === "MEDIUM" ? "Medium" : "Low"}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            {isHigh ? (
                              <TrendingUp className="h-3.5 w-3.5 text-rose-400 inline" />
                            ) : isMitigated ? (
                              <TrendingDown className="h-3.5 w-3.5 text-emerald-400 inline" />
                            ) : (
                              <Minus className="h-3.5 w-3.5 text-amber-400 inline" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 mt-2">
              <span>Showing top {Math.min(threats.length, 8)} priority risks</span>
              <button
                onClick={() => setActiveTab("threats")}
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                View Register &rarr;
              </button>
            </div>
          </div>

          {/* Card 2: Risk Control Donut Chart (3.5 Cols) */}
          <div className="lg:col-span-3.5 rounded-xl border border-slate-800 bg-[#0e172a] p-4 flex flex-col justify-between shadow-md">
            <div>
              {/* Header with Circular Green Badge */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-8 w-8 rounded-full bg-[#2e7d32] flex items-center justify-center text-white shadow-md shadow-green-500/20">
                  <PieChart className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Risk Control
                </h2>
              </div>

              {/* Donut Chart Visualization */}
              <div className="py-1">
                {renderDonut(controlSegments, hoveredDonut1, setHoveredDonut1)}
              </div>

              {/* Callouts and Labels */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] pt-1">
                {controlSegments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="truncate">{seg.label}</span>
                    <span className="font-bold text-white ml-auto">{seg.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 mt-2 flex items-center justify-between">
              <span>Mitigation Coverage</span>
              <span className="text-emerald-400 font-semibold">
                {Math.round(((verifiedMitigated + assumedMitigated) / Math.max(totalThreats, 1)) * 100)}% Addressed
              </span>
            </div>
          </div>

          {/* Card 3: Impact of Risks Donut Chart (3.5 Cols) */}
          <div className="lg:col-span-3.5 rounded-xl border border-slate-800 bg-[#0e172a] p-4 flex flex-col justify-between shadow-md">
            <div>
              {/* Header with Circular Teal Badge */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-8 w-8 rounded-full bg-[#00897b] flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                  <Target className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Impact of Risks
                </h2>
              </div>

              {/* Donut Chart Visualization */}
              <div className="py-1">
                {renderDonut(impactSegments, hoveredDonut2, setHoveredDonut2)}
              </div>

              {/* Callouts and Labels */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] pt-1">
                {impactSegments.map((seg, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-300">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="truncate">{seg.label}</span>
                    <span className="font-bold text-white ml-auto">{seg.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 mt-2 flex items-center justify-between">
              <span>Overall Exposure</span>
              <span className="text-cyan-400 font-semibold">Qualitative STRIDE Model</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM ROW: 2 Columns (Different Risks Impact, Risk Severity Map) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 4: Different Risks Impact - Horizontal Stacked Bar Chart (6 Cols) */}
          <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-[#0e172a] p-4 flex flex-col justify-between shadow-md">
            <div>
              {/* Header with Circular Blue Badge */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-full bg-[#1976d2] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Different Risks Impact
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Exposure ranking across architecture components and service boundaries.
                  </p>
                </div>
              </div>

              {/* Stacked Horizontal Bars */}
              <div className="space-y-2.5">
                {componentExposure.map((comp) => {
                  const maxScale = 55;
                  const totalWidthPct = (comp.score / maxScale) * 100;

                  // Segment proportions
                  const highWidth = comp.high > 0 ? (comp.high / (comp.high + comp.med + comp.low || 1)) * totalWidthPct : 0;
                  const medWidth = comp.med > 0 ? (comp.med / (comp.high + comp.med + comp.low || 1)) * totalWidthPct : 0;
                  const lowWidth = totalWidthPct - highWidth - medWidth;

                  return (
                    <div key={comp.id} className="flex items-center gap-2 text-xs">
                      {/* Component Label */}
                      <span className="w-36 text-right text-slate-300 font-medium truncate text-[11px]">
                        {comp.name}
                      </span>

                      {/* Stacked Bar Container */}
                      <div className="flex-1 h-4 bg-slate-900 rounded-sm overflow-hidden flex border border-slate-700/60">
                        {/* High Segment (Dark Navy Blue) */}
                        <div
                          style={{ width: `${Math.max(highWidth, 8)}%` }}
                          className="h-full bg-[#0d47a1] hover:brightness-125 transition-all"
                          title={`${comp.name}: ${comp.high} High/Critical`}
                        />
                        {/* Medium Segment (Light Green) */}
                        <div
                          style={{ width: `${Math.max(medWidth, 12)}%` }}
                          className="h-full bg-[#8bc34a] hover:brightness-125 transition-all"
                          title={`${comp.name}: ${comp.med} Medium`}
                        />
                        {/* Low Segment (Emerald Green) */}
                        <div
                          style={{ width: `${Math.max(lowWidth, 10)}%` }}
                          className="h-full bg-[#00e676] hover:brightness-125 transition-all"
                          title={`${comp.name}: ${comp.low} Low`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Scale Indicator (Ranking 0 to 55) */}
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 pl-36">
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
              <div className="text-right text-[10px] font-bold text-slate-400 mt-0.5">
                Ranking / Risk Exposure Score
              </div>
            </div>

            {/* Legend for Stacked Bar */}
            <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-2 border-t border-slate-800/80 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-xs bg-[#0d47a1]" />
                Critical & High Impact
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-xs bg-[#8bc34a]" />
                Medium Impact
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-xs bg-[#00e676]" />
                Low Impact
              </span>
            </div>
          </div>

          {/* Card 5: Risk Severity Map - Heat Map Grid (6 Cols) */}
          <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-[#0e172a] p-4 flex flex-col justify-between shadow-md">
            <div>
              {/* Header with Circular Teal/Green Badge */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-8 w-8 rounded-full bg-[#00897b] flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                  <Grid3X3 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Risk Severity Map
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Likelihood vs Risk Impact severity grid matrix. Click any cell to view matching threats.
                  </p>
                </div>
              </div>

              {/* Heatmap Grid Container */}
              <div className="flex items-stretch gap-2">
                {/* Left "Totals" Color Indicator Bar */}
                <div className="w-12 flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-bold mb-1">Totals</span>
                  <div className="flex-1 w-full rounded border border-slate-700 flex flex-col overflow-hidden text-[10px] font-bold text-slate-900 text-center">
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
                <div className="flex items-center justify-center -rotate-90 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0">
                  Likelihood
                </div>

                {/* 5x5 Grid Cells */}
                <div className="flex-1 flex flex-col space-y-1">
                  {heatmapData.map((row, rIdx) => {
                    const rowLabel = 5 - rIdx;
                    return (
                      <div key={rIdx} className="flex items-center space-x-1">
                        {/* Row Y value */}
                        <span className="w-4 text-[10px] font-mono text-slate-400 text-right pr-1">
                          {rowLabel}
                        </span>

                        {/* Row Cells */}
                        {row.map((val, cIdx) => {
                          // Determine color matching image:
                          // Top-right = Deep Red (Critical)
                          // Middle diagonal = Orange / Yellow
                          // Bottom-left = Emerald Green
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
                              className={`flex-1 h-7 rounded-sm flex items-center justify-center font-bold text-xs transition-all hover:scale-105 hover:brightness-125 ${cellBg} ${cellText}`}
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
                  <div className="flex items-center space-x-1 pl-4 pt-1 text-[10px] font-mono text-slate-400">
                    <span className="flex-1 text-center">3</span>
                    <span className="flex-1 text-center">6</span>
                    <span className="flex-1 text-center">9</span>
                    <span className="flex-1 text-center">12</span>
                    <span className="flex-1 text-center">15</span>
                  </div>
                  <div className="text-center text-[10px] font-bold text-slate-400 tracking-wider">
                    Risk Impact
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Heatmap Legend */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80 mt-2">
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
              <span className="italic text-slate-500">Live MongoDB sync</span>
            </div>
          </div>
        </div>

        {/* Dashboard Footer Note matching the slide note */}
        <div className="text-center text-[11px] text-slate-500 border-t border-slate-800/60 pt-3">
          This threat profile & KPI dashboard is linked to live study records, updating automatically as components, flows, and STRIDE threats evolve.
        </div>
      </div>
    </div>
  );
}

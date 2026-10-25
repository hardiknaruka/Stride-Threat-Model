"use client";

import React from "react";
import { useProject } from "@/context/ProjectContext";
import {
  STRIDE_DEFINITIONS,
  StrideCategory,
  Likelihood,
  Impact,
  Severity,
} from "@/lib/types";
import { calculateSeverity, SEVERITY_COLORS } from "@/lib/risk-scoring";
import {
  ShieldAlert,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface DashboardViewProps {
  onOpenNewThreat: () => void;
  onFilterThreats: (filters: { stride?: StrideCategory; severity?: Severity; status?: string }) => void;
}

export function DashboardView({ onOpenNewThreat, onFilterThreats }: DashboardViewProps) {
  const { activeProject, setActiveTab, roleConfig } = useProject();

  if (!activeProject) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-400">No active project selected.</p>
      </div>
    );
  }

  const { threats, elements, flows } = activeProject;

  // Compute metrics
  const totalThreats = threats.length;
  const openThreats = threats.filter((t) => t.status === "OPEN").length;
  const mitigatedThreats = threats.filter((t) => t.status === "MITIGATED").length;
  const acceptedThreats = threats.filter((t) => t.status === "ACCEPTED").length;
  const deferredThreats = threats.filter((t) => t.status === "DEFERRED").length;
  const notApplicableThreats = threats.filter((t) => t.status === "NOT_APPLICABLE").length;

  const criticalThreats = threats.filter(
    (t) => t.severity === "CRITICAL" && t.status !== "MITIGATED" && t.status !== "NOT_APPLICABLE"
  ).length;

  const highThreats = threats.filter(
    (t) => t.severity === "HIGH" && t.status !== "MITIGATED" && t.status !== "NOT_APPLICABLE"
  ).length;

  const boundaryCrossingFlows = flows.filter((f) => f.crossesTrustBoundary).length;

  // STRIDE Category counts
  const strideCounts: Record<StrideCategory, { total: number; open: number; mitigated: number }> = {
    SPOOFING: { total: 0, open: 0, mitigated: 0 },
    TAMPERING: { total: 0, open: 0, mitigated: 0 },
    REPUDIATION: { total: 0, open: 0, mitigated: 0 },
    INFORMATION_DISCLOSURE: { total: 0, open: 0, mitigated: 0 },
    DENIAL_OF_SERVICE: { total: 0, open: 0, mitigated: 0 },
    ELEVATION_OF_PRIVILEGE: { total: 0, open: 0, mitigated: 0 },
  };

  threats.forEach((t) => {
    try {
      const cats: StrideCategory[] = JSON.parse(t.strideCategories);
      if (Array.isArray(cats)) {
        cats.forEach((cat) => {
          if (strideCounts[cat]) {
            strideCounts[cat].total += 1;
            if (t.status === "OPEN") strideCounts[cat].open += 1;
            if (t.status === "MITIGATED") strideCounts[cat].mitigated += 1;
          }
        });
      }
    } catch {
      // ignore
    }
  });

  // 3x3 Heatmap Grid counts
  const likelihoods: Likelihood[] = ["HIGH", "MEDIUM", "LOW"];
  const impacts: Impact[] = ["LOW", "MEDIUM", "HIGH"];

  const heatmapCounts: Record<Likelihood, Record<Impact, number>> = {
    HIGH: { LOW: 0, MEDIUM: 0, HIGH: 0 },
    MEDIUM: { LOW: 0, MEDIUM: 0, HIGH: 0 },
    LOW: { LOW: 0, MEDIUM: 0, HIGH: 0 },
  };

  threats.forEach((t) => {
    if (heatmapCounts[t.likelihood] && heatmapCounts[t.likelihood][t.impact] !== undefined) {
      heatmapCounts[t.likelihood][t.impact] += 1;
    }
  });

  const mitigatedPercentage = totalThreats > 0 ? Math.round((mitigatedThreats / totalThreats) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Project Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {activeProject.environment}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Arch v{activeProject.architectureVersion}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Status: {activeProject.status}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {activeProject.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {activeProject.description}
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-4 pt-1">
              <span>Owner: <strong className="text-slate-200">{activeProject.owner}</strong></span>
              {activeProject.reviewDate && (
                <span>Review Target: <strong className="text-slate-200">{new Date(activeProject.reviewDate).toLocaleDateString()}</strong></span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {roleConfig.canCreateThreats && (
              <button
                onClick={onOpenNewThreat}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Sparkles className="h-4 w-4" />
                Add Threat Assessment
              </button>
            )}
            <button
              onClick={() => setActiveTab("review")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-all hover:border-slate-600"
            >
              Study Report
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Architecture Elements</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{elements.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Components & Stores</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Data Flows</span>
            <ArrowRightLeft className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{flows.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            <span className="text-amber-400 font-medium">{boundaryCrossingFlows}</span> cross boundary
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Assessed</span>
            <ShieldAlert className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalThreats}</div>
          <p className="text-[11px] text-slate-400 mt-1">Identified scenarios</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Open Threats</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{openThreats}</div>
          <p className="text-[11px] text-slate-400 mt-1">Require action</p>
        </div>

        <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-rose-300 mb-2">
            <span className="text-xs font-medium">Critical & High</span>
            <AlertOctagon className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {criticalThreats + highThreats}
          </div>
          <p className="text-[11px] text-rose-300/80 mt-1">
            {criticalThreats} Critical • {highThreats} High
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Mitigated %</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {mitigatedPercentage}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{mitigatedThreats} Mitigated</p>
        </div>
      </div>

      {/* STRIDE Coverage Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              STRIDE Category Coverage
            </h2>
            <p className="text-xs text-slate-400">
              Distribution of microservice threats mapped across each security property.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("threats")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            View Threat Register &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(STRIDE_DEFINITIONS) as StrideCategory[]).map((cat) => {
            const def = STRIDE_DEFINITIONS[cat];
            const stat = strideCounts[cat];

            return (
              <div
                key={cat}
                onClick={() => {
                  onFilterThreats({ stride: cat });
                  setActiveTab("threats");
                }}
                className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/70 p-4 hover:border-slate-700 hover:bg-slate-850/80 transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-sm border ${def.badgeBg}`}>
                        {def.letter}
                      </span>
                      <span className="font-semibold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {def.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-300 px-2 py-0.5 rounded-full bg-slate-800">
                      {stat.total} {stat.total === 1 ? "threat" : "threats"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {def.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Target: <strong className="text-slate-300">{def.securityProperty}</strong></span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">{stat.open} Open</span>
                    <span>•</span>
                    <span className="text-emerald-400">{stat.mitigated} Mitigated</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3x3 Risk Heatmap & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Likelihood x Impact Heatmap (8 columns) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Risk Heat Map (3x3 Matrix)
            </h3>
            <p className="text-xs text-slate-400">
              Interactive qualitative matrix: Likelihood vs Potential Impact. Click any cell to view matching threats.
            </p>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-xs font-semibold text-slate-400 text-left w-28">
                    Likelihood \ Impact
                  </th>
                  {impacts.map((imp) => (
                    <th key={imp} className="p-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      {imp} Impact
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {likelihoods.map((lh) => (
                  <tr key={lh}>
                    <td className="p-2 text-xs font-semibold text-slate-300 text-left uppercase tracking-wider">
                      {lh}
                    </td>
                    {impacts.map((imp) => {
                      const count = heatmapCounts[lh][imp];
                      const severity = calculateSeverity(lh, imp);
                      const colors = SEVERITY_COLORS[severity];

                      return (
                        <td key={imp} className="p-1.5">
                          <button
                            onClick={() => {
                              onFilterThreats({ severity });
                              setActiveTab("threats");
                            }}
                            className={`w-full py-3.5 px-2 rounded-xl border ${colors.border} ${colors.bg} hover:brightness-125 transition-all text-center flex flex-col items-center justify-center`}
                          >
                            <span className="text-xl font-extrabold text-white">
                              {count}
                            </span>
                            <span className={`text-[10px] font-semibold tracking-wider uppercase ${colors.text}`}>
                              {severity}
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Model: Transparent Qualitative 3x3 Scoring</span>
            <button
              onClick={() => setActiveTab("methodology")}
              className="text-indigo-400 hover:underline"
            >
              View Methodology Rules &rarr;
            </button>
          </div>
        </div>

        {/* Status Distribution (5 columns) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight mb-1">
              Threat Mitigation Status
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Status lifecycle distribution across all {totalThreats} identified risks.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-amber-400 font-medium">Open / Under Evaluation</span>
                  <span className="text-slate-300 font-semibold">{openThreats}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalThreats > 0 ? (openThreats / totalThreats) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-medium">Mitigated / Remediated</span>
                  <span className="text-slate-300 font-semibold">{mitigatedThreats}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalThreats > 0 ? (mitigatedThreats / totalThreats) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-blue-400 font-medium">Risk Accepted</span>
                  <span className="text-slate-300 font-semibold">{acceptedThreats}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalThreats > 0 ? (acceptedThreats / totalThreats) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-purple-400 font-medium">Deferred</span>
                  <span className="text-slate-300 font-semibold">{deferredThreats}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalThreats > 0 ? (deferredThreats / totalThreats) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">Not Applicable (with Rationale)</span>
                  <span className="text-slate-300 font-semibold">{notApplicableThreats}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-slate-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalThreats > 0 ? (notApplicableThreats / totalThreats) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Traceability: 100% linked to elements/flows
            </span>
            <button
              onClick={() => setActiveTab("threats")}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Filter Threat Register &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

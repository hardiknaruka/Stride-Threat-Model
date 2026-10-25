"use client";

import React, { useState, useMemo } from "react";
import { useProject, ThreatData } from "@/context/ProjectContext";
import {
  StrideCategory,
  STRIDE_DEFINITIONS,
  Severity,
  ThreatStatus,
} from "@/lib/types";
import { SEVERITY_COLORS } from "@/lib/risk-scoring";
import {
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit2,
  Layers,
  ArrowRightLeft,
  Calendar,
  User,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

interface ThreatRegisterViewProps {
  onOpenNewThreat: () => void;
  onEditThreat: (threat: ThreatData) => void;
  initialFilters?: {
    stride?: StrideCategory;
    severity?: Severity;
    status?: string;
  };
}

export function ThreatRegisterView({
  onOpenNewThreat,
  onEditThreat,
  initialFilters,
}: ThreatRegisterViewProps) {
  const { activeProject, refreshActiveProject, roleConfig } = useProject();

  const [search, setSearch] = useState("");
  const [filterStride, setFilterStride] = useState<string>(initialFilters?.stride || "ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>(initialFilters?.severity || "ALL");
  const [filterStatus, setFilterStatus] = useState<string>(initialFilters?.status || "ALL");
  const [filterElementId, setFilterElementId] = useState<string>("ALL");
  const [filterFlowId, setFilterFlowId] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"severity" | "id" | "updated" | "due">("severity");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (!activeProject) return null;

  const { threats, elements, flows } = activeProject;

  // Filter threats
  const filteredThreats = useMemo(() => {
    return threats.filter((t) => {
      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesText =
          t.title.toLowerCase().includes(q) ||
          t.threatId.toLowerCase().includes(q) ||
          t.scenario.toLowerCase().includes(q) ||
          (t.mitigation && t.mitigation.toLowerCase().includes(q)) ||
          (t.owner && t.owner.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      // STRIDE filter
      if (filterStride !== "ALL") {
        try {
          const cats = JSON.parse(t.strideCategories);
          if (!Array.isArray(cats) || !cats.includes(filterStride)) {
            return false;
          }
        } catch {
          return false;
        }
      }

      // Severity filter
      if (filterSeverity !== "ALL" && t.severity !== filterSeverity) {
        return false;
      }

      // Status filter
      if (filterStatus !== "ALL" && t.status !== filterStatus) {
        return false;
      }

      // Element filter
      if (
        filterElementId !== "ALL" &&
        !t.linkedElements.some((le) => le.element.id === filterElementId)
      ) {
        return false;
      }

      // Flow filter
      if (
        filterFlowId !== "ALL" &&
        !t.linkedFlows.some((lf) => lf.flow.id === filterFlowId)
      ) {
        return false;
      }

      return true;
    });
  }, [threats, search, filterStride, filterSeverity, filterStatus, filterElementId, filterFlowId]);

  // Sort threats
  const sortedThreats = useMemo(() => {
    const list = [...filteredThreats];
    const severityWeight: Record<Severity, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return list.sort((a, b) => {
      if (sortBy === "severity") {
        const diff = severityWeight[b.severity] - severityWeight[a.severity];
        return sortOrder === "asc" ? -diff : diff;
      }
      if (sortBy === "id") {
        return sortOrder === "asc"
          ? a.threatId.localeCompare(b.threatId)
          : b.threatId.localeCompare(a.threatId);
      }
      if (sortBy === "due") {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      // default: updated
      const timeA = new Date(a.updatedAt).getTime();
      const timeB = new Date(b.updatedAt).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });
  }, [filteredThreats, sortBy, sortOrder]);

  const handleDeleteThreat = async (threatId: string) => {
    if (!confirm("Are you sure you want to delete this threat assessment record?")) return;
    try {
      await fetch(`/api/projects/${activeProject.id}/threats/${threatId}`, {
        method: "DELETE",
      });
      await refreshActiveProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickStatusChange = async (threat: ThreatData, newStatus: ThreatStatus) => {
    if (newStatus === "NOT_APPLICABLE" && !threat.notApplicableRationale) {
      onEditThreat(threat);
      return;
    }
    try {
      await fetch(`/api/projects/${activeProject.id}/threats/${threat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await refreshActiveProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilterStride("ALL");
    setFilterSeverity("ALL");
    setFilterStatus("ALL");
    setFilterElementId("ALL");
    setFilterFlowId("ALL");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top action & export bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Threat Register & Risk Ledger
          </h2>
          <p className="text-xs text-slate-400">
            {sortedThreats.length} of {threats.length} threats matching active filters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/projects/${activeProject.id}/export/csv`}
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
          {roleConfig.canCreateThreats && (
            <button
              onClick={onOpenNewThreat}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              New Threat
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, ID, scenario, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* STRIDE Category */}
          <div>
            <select
              value={filterStride}
              onChange={(e) => setFilterStride(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All STRIDE Categories</option>
              {(Object.keys(STRIDE_DEFINITIONS) as StrideCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  [{STRIDE_DEFINITIONS[cat].letter}] {STRIDE_DEFINITIONS[cat].name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="MITIGATED">Mitigated</option>
              <option value="ACCEPTED">Risk Accepted</option>
              <option value="DEFERRED">Deferred</option>
              <option value="NOT_APPLICABLE">Not Applicable</option>
            </select>
          </div>

          {/* Component Filter */}
          <div>
            <select
              value={filterElementId}
              onChange={(e) => setFilterElementId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Components</option>
              {elements.map((elem) => (
                <option key={elem.id} value={elem.id}>
                  {elem.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Bar: Sorting & Quick Reset */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-medium">Sort by:</span>
            <button
              onClick={() => {
                if (sortBy === "severity") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else { setSortBy("severity"); setSortOrder("desc"); }
              }}
              className={`hover:text-white ${sortBy === "severity" ? "text-indigo-400 font-bold" : ""}`}
            >
              Severity {sortBy === "severity" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
            <button
              onClick={() => {
                if (sortBy === "id") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else { setSortBy("id"); setSortOrder("asc"); }
              }}
              className={`hover:text-white ${sortBy === "id" ? "text-indigo-400 font-bold" : ""}`}
            >
              Threat ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => {
                if (sortBy === "due") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else { setSortBy("due"); setSortOrder("asc"); }
              }}
              className={`hover:text-white ${sortBy === "due" ? "text-indigo-400 font-bold" : ""}`}
            >
              Due Date {sortBy === "due" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>

          {(search || filterStride !== "ALL" || filterSeverity !== "ALL" || filterStatus !== "ALL" || filterElementId !== "ALL") && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Threats List Cards */}
      {sortedThreats.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
          <ShieldAlert className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Threats Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No threat records match your active search or filters. Reset filters or create a new threat assessment.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
          >
            Clear Active Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedThreats.map((threat) => {
            const colors = SEVERITY_COLORS[threat.severity];

            let strideList: StrideCategory[] = [];
            try {
              const parsed = JSON.parse(threat.strideCategories);
              if (Array.isArray(parsed)) strideList = parsed;
            } catch {
              // ignore
            }

            return (
              <div
                key={threat.id}
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900/90 transition-all shadow-md space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
                        {threat.threatId}
                      </span>

                      {/* Severity Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.badge}`}>
                        {threat.severity}
                      </span>

                      {/* Overridden indicator */}
                      {threat.isOverridden && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          title={`Score overridden: ${threat.severityRationale}`}
                        >
                          Overridden
                        </span>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          threat.status === "MITIGATED"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : threat.status === "ACCEPTED"
                            ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                            : threat.status === "NOT_APPLICABLE"
                            ? "bg-slate-700/50 text-slate-400 border-slate-600"
                            : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {threat.status}
                      </span>

                      {/* STRIDE badges */}
                      {strideList.map((cat) => {
                        const def = STRIDE_DEFINITIONS[cat];
                        return (
                          <span
                            key={cat}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${def.badgeBg}`}
                            title={`${def.name}: ${def.securityProperty}`}
                          >
                            [{def.letter}] {def.name}
                          </span>
                        );
                      })}
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {threat.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {/* Quick status dropdown */}
                    {roleConfig.canChangeStatus && (
                      <select
                        value={threat.status}
                        onChange={(e) => handleQuickStatusChange(threat, e.target.value as ThreatStatus)}
                        className="px-2 py-1 rounded-lg border border-slate-700 bg-slate-950 text-slate-300 text-xs focus:outline-none"
                      >
                        <option value="OPEN">Open</option>
                        <option value="MITIGATED">Mitigated</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="DEFERRED">Deferred</option>
                        <option value="NOT_APPLICABLE">Not Applicable</option>
                      </select>
                    )}

                    <button
                      onClick={() => onEditThreat(threat)}
                      className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      title="View & Edit Threat Assessment"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    {roleConfig.canDelete && (
                      <button
                        onClick={() => handleDeleteThreat(threat.id)}
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Threat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scenario */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {threat.scenario}
                </p>

                {/* Preconditions & Mitigation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  {threat.existingControls && (
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Existing Controls
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            threat.controlsStatus === "VERIFIED"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {threat.controlsStatus}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{threat.existingControls}</p>
                    </div>
                  )}

                  {threat.mitigation && (
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
                        Recommended Mitigation
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {threat.mitigation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Not applicable rationale */}
                {threat.status === "NOT_APPLICABLE" && threat.notApplicableRationale && (
                  <div className="p-2.5 rounded-lg border border-slate-700 bg-slate-950/80 text-xs">
                    <span className="font-semibold text-slate-400">Not Applicable Justification: </span>
                    <span className="text-slate-300">{threat.notApplicableRationale}</span>
                  </div>
                )}

                {/* Footer metadata: Traceability links, owner, due date */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Linked elements */}
                    {threat.linkedElements.length > 0 && (
                      <div className="flex items-center gap-1 text-slate-300">
                        <Layers className="h-3.5 w-3.5 text-indigo-400" />
                        <span>
                          {threat.linkedElements.map((le) => le.element.name).join(", ")}
                        </span>
                      </div>
                    )}

                    {/* Linked flows */}
                    {threat.linkedFlows.length > 0 && (
                      <div className="flex items-center gap-1 text-slate-300">
                        <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-400" />
                        <span>
                          {threat.linkedFlows.map((lf) => lf.flow.name).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {threat.owner && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="h-3 w-3 text-slate-500" />
                        {threat.owner}
                      </span>
                    )}

                    {threat.dueDate && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        Due: {new Date(threat.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { STRIDE_DEFINITIONS, StrideCategory } from "@/lib/types";
import { RISK_MODEL_DOCUMENTATION, RISK_MATRIX } from "@/lib/risk-scoring";
import {
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Database,
  Terminal,
  Server,
  Lock,
  Trash2,
} from "lucide-react";
import { DeleteProjectModal } from "@/components/DeleteProjectModal";
import { ProjectSummary } from "@/context/ProjectContext";

export function SettingsView() {
  const {
    reseedDemo,
    isLoading,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    projects,
    themePalette,
  } = useProject();
  const isCorporate = themePalette === "corporate";
  const [reseedSuccess, setReseedSuccess] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectSummary | null>(null);

  const handleReseed = async () => {
    if (confirm("Reset and re-seed the fictional Commerce Microservices Threat Model sample?")) {
      await reseedDemo();
      setReseedSuccess(true);
      setTimeout(() => setReseedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="glass-panel p-5 rounded-xl shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BookOpen className={`h-5 w-5 ${isCorporate ? "text-blue-700 dark:text-blue-400" : "text-teal-700 dark:text-teal-400"}`} />
          STRIDE Methodology & Workspace Diagnostics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Security reference guide, qualitative risk scoring specification, data boundaries, and local database settings.
        </p>
      </div>

      {/* STRIDE Deep Dive Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            STRIDE Threat Model Reference for Microservices
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(STRIDE_DEFINITIONS) as StrideCategory[]).map((cat) => {
            const def = STRIDE_DEFINITIONS[cat];
            return (
              <div
                key={cat}
                className="p-5 rounded-xl glass-card glass-card-hover space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-2xs">
                      {def.letter}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{def.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Desired Property: {def.securityProperty}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {def.description}
                </p>

                {/* Scenarios & Mitigations Box - Deep Dark Container with high-contrast text */}
                <div className="stride-box p-3.5 rounded-lg border text-[11px] space-y-2 shadow-2xs">
                  <div>
                    <span className="font-bold text-rose-700 dark:text-rose-400">Microservice Attack Scenarios:</span>{" "}
                    <span className="text-slate-700 dark:text-slate-200 leading-relaxed">{def.examples}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Typical Countermeasures:</span>{" "}
                    <span className="text-slate-700 dark:text-slate-200 leading-relaxed">{def.typicalMitigations}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Scoring Model Specification */}
      <div className="p-6 rounded-xl glass-card space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {RISK_MODEL_DOCUMENTATION.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {RISK_MODEL_DOCUMENTATION.summary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Matrix Prioritization Logic:</h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside">
              {RISK_MODEL_DOCUMENTATION.guidelines.map((g, idx) => (
                <li key={idx} className="leading-relaxed">{g}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/30 backdrop-blur-xs text-xs space-y-2">
            <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              Methodology Transparency & Limitations
            </span>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-[11px]">
              {RISK_MODEL_DOCUMENTATION.disclaimer}
            </p>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-[11px]">
              Severity overrides are tracked with a mandatory audit rationale to uphold governance.
            </p>
          </div>
        </div>
      </div>

      {/* Database & Environment Diagnostics */}
      <div className="p-6 rounded-xl glass-card space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Storage & MongoDB Runtime
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configured for MongoDB with Prisma ORM (MongoDB Atlas or Local MongoDB).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="stride-box p-4 rounded-lg border backdrop-blur-xs space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              Active Database Provider: MongoDB
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Environment Key: <code className="text-sky-700 dark:text-sky-400 font-mono font-bold">DATABASE_URL</code>
              <br />
              Supports MongoDB Atlas clusters (Replica Sets) and local instances seamlessly.
            </p>
          </div>

          <div className="stride-box p-4 rounded-lg border backdrop-blur-xs space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Connection String Setup
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              In your <code className="text-slate-800 dark:text-slate-200 font-mono font-bold">.env</code> file:
              <br />
              Atlas: <code className="text-blue-700 dark:text-blue-400 font-mono">mongodb+srv://...</code>
              <br />
              Local: <code className="text-blue-700 dark:text-blue-400 font-mono">mongodb://localhost:27017/stride_threat_model</code>
            </p>
          </div>
        </div>
      </div>

      {/* Threat Modeling Projects Management */}
      <div className="p-6 rounded-xl glass-card space-y-4 shadow-xs border border-rose-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-rose-500/10 border border-rose-500/30 text-rose-500 shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Threat Modeling Projects Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your saved threat models or permanently delete obsolete projects.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            {projects.length} {projects.length === 1 ? "Project" : "Projects"}
          </span>
        </div>

        <div className="space-y-2.5 pt-2">
          {projects.map((proj) => {
            const isActive = proj.id === activeProject?.id;
            return (
              <div
                key={proj.id}
                className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isActive
                    ? "stride-box border-blue-500/40 dark:border-blue-500/40 ring-1 ring-blue-500/20"
                    : "stride-box"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {proj.name}
                    </span>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                        Active Study
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {proj.environment}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Lead: {proj.owner} • Status: {proj.status} • {proj.threatCount} Threats ({proj.highOrCriticalCount} High/Critical)
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {!isActive && (
                    <button
                      onClick={() => setActiveProjectId(proj.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
                    >
                      Switch To
                    </button>
                  )}
                  <button
                    onClick={() => setProjectToDelete(proj)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 transition-colors shadow-2xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Project
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sample Data Management */}
      <div className="p-6 rounded-xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Reset / Re-seed Fictional Commerce Project
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recreates the 8 microservice components, 6 flows, and 7 STRIDE threat scenarios.
          </p>
          {reseedSuccess && (
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block pt-1">
              ✓ Successfully re-seeded demo data!
            </span>
          )}
        </div>

        <button
          onClick={handleReseed}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 ${
            isCorporate
              ? "bg-blue-700 hover:bg-blue-800"
              : "bg-teal-700 hover:bg-teal-800"
          }`}
        >
          <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Re-seed Demo Data
        </button>
      </div>

      {/* Delete Project Confirmation Modal */}
      <DeleteProjectModal
        isOpen={!!projectToDelete}
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
      />
    </div>
  );
}

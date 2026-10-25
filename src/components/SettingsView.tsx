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
} from "lucide-react";

export function SettingsView() {
  const { reseedDemo, isLoading, activeProject } = useProject();
  const [reseedSuccess, setReseedSuccess] = useState(false);

  const handleReseed = async () => {
    if (confirm("Reset and re-seed the fictional Commerce Microservices Threat Model sample?")) {
      await reseedDemo();
      setReseedSuccess(true);
      setTimeout(() => setReseedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          STRIDE Methodology & Workspace Diagnostics
        </h2>
        <p className="text-xs text-slate-400">
          Security reference guide, qualitative risk scoring specification, data boundaries, and local database settings.
        </p>
      </div>

      {/* STRIDE Deep Dive Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">
            STRIDE Threat Model Reference for Microservices
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(STRIDE_DEFINITIONS) as StrideCategory[]).map((cat) => {
            const def = STRIDE_DEFINITIONS[cat];
            return (
              <div
                key={cat}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-sm border ${def.badgeBg}`}>
                      {def.letter}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-white">{def.name}</span>
                      <span className="text-[10px] text-slate-400 block">Property: {def.securityProperty}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {def.description}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                  <div>
                    <span className="font-semibold text-rose-300">Microservice Attack Scenarios:</span>{" "}
                    <span className="text-slate-400">{def.examples}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800/60">
                    <span className="font-semibold text-emerald-300">Typical Countermeasures:</span>{" "}
                    <span className="text-slate-400">{def.typicalMitigations}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Scoring Model Specification */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              {RISK_MODEL_DOCUMENTATION.name}
            </h3>
            <p className="text-xs text-slate-400">
              {RISK_MODEL_DOCUMENTATION.summary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-200">Matrix Prioritization Logic:</h4>
            <ul className="space-y-1 text-slate-400 list-disc list-inside">
              {RISK_MODEL_DOCUMENTATION.guidelines.map((g, idx) => (
                <li key={idx} className="leading-relaxed">{g}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs space-y-2">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Methodology Transparency & Limitations
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {RISK_MODEL_DOCUMENTATION.disclaimer}
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Severity overrides are tracked with a mandatory audit rationale to uphold governance.
            </p>
          </div>
        </div>
      </div>

      {/* Database & Environment Diagnostics */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              Data Storage & Environment Runtime
            </h3>
            <p className="text-xs text-slate-400">
              Zero-config local SQLite storage with optional PostgreSQL Docker Compose setup.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Database: SQLite (Local Zero-Config)
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Connection string: <code className="text-cyan-300 font-mono">file:./dev.db</code>
              <br />
              All components, flows, threats, and scope records persist safely to the local disk via Prisma ORM.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-400" />
              PostgreSQL Docker Compose Support
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              To connect PostgreSQL instead:
              <br />
              1. Run <code className="text-indigo-300 font-mono">docker compose up -d</code>
              <br />
              2. Change <code className="text-indigo-300 font-mono">DATABASE_URL</code> in <code className="text-indigo-300 font-mono">.env</code> to Postgres
              <br />
              3. Run <code className="text-indigo-300 font-mono">npx prisma db push</code>
            </p>
          </div>
        </div>
      </div>

      {/* Sample Data Management */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            Reset / Re-seed Fictional Commerce Project
          </h3>
          <p className="text-xs text-slate-400">
            Recreates the 8 microservice components, 6 flows, and 7 STRIDE threat scenarios.
          </p>
          {reseedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold block pt-1">
              ✓ Successfully re-seeded demo data!
            </span>
          )}
        </div>

        <button
          onClick={handleReseed}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Re-seed Demo Data
        </button>
      </div>
    </div>
  );
}

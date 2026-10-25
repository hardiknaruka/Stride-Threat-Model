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
  const { reseedDemo, isLoading, activeProject, themePalette } = useProject();
  const isCorporate = themePalette === "corporate";
  const [reseedSuccess, setReseedSuccess] = useState(false);

  const handleReseed = async () => {
    if (confirm("Reset and re-seed the fictional Commerce Microservices Threat Model sample?")) {
      await reseedDemo();
      setReseedSuccess(true);
      setTimeout(() => setReseedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className={`h-5 w-5 ${isCorporate ? "text-blue-700" : "text-teal-700"}`} />
          STRIDE Methodology & Workspace Diagnostics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Security reference guide, qualitative risk scoring specification, data boundaries, and local database settings.
        </p>
      </div>

      {/* STRIDE Deep Dive Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            STRIDE Threat Model Reference for Microservices
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(STRIDE_DEFINITIONS) as StrideCategory[]).map((cat) => {
            const def = STRIDE_DEFINITIONS[cat];
            return (
              <div
                key={cat}
                className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-800 border border-slate-300">
                      {def.letter}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-slate-900">{def.name}</span>
                      <span className="text-[10px] text-slate-500 block font-medium">Desired Property: {def.securityProperty}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {def.description}
                </p>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1.5">
                  <div>
                    <span className="font-bold text-rose-700">Microservice Attack Scenarios:</span>{" "}
                    <span className="text-slate-600">{def.examples}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200">
                    <span className="font-bold text-emerald-700">Typical Countermeasures:</span>{" "}
                    <span className="text-slate-600">{def.typicalMitigations}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Scoring Model Specification */}
      <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {RISK_MODEL_DOCUMENTATION.name}
            </h3>
            <p className="text-xs text-slate-500">
              {RISK_MODEL_DOCUMENTATION.summary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800">Matrix Prioritization Logic:</h4>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              {RISK_MODEL_DOCUMENTATION.guidelines.map((g, idx) => (
                <li key={idx} className="leading-relaxed">{g}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-xs space-y-2">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              Methodology Transparency & Limitations
            </span>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              {RISK_MODEL_DOCUMENTATION.disclaimer}
            </p>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Severity overrides are tracked with a mandatory audit rationale to uphold governance.
            </p>
          </div>
        </div>
      </div>

      {/* Database & Environment Diagnostics */}
      <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-sky-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Data Storage & MongoDB Runtime
            </h3>
            <p className="text-xs text-slate-500">
              Configured for MongoDB with Prisma ORM (MongoDB Atlas or Local MongoDB).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              Active Database Provider: MongoDB
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Environment Key: <code className="text-sky-700 font-mono font-bold">DATABASE_URL</code>
              <br />
              Supports MongoDB Atlas clusters (Replica Sets) and local instances seamlessly.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-blue-600" />
              Connection String Setup
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              In your <code className="text-slate-800 font-mono font-bold">.env</code> file:
              <br />
              Atlas: <code className="text-blue-700 font-mono">mongodb+srv://...</code>
              <br />
              Local: <code className="text-blue-700 font-mono">mongodb://localhost:27017/stride_threat_model</code>
            </p>
          </div>
        </div>
      </div>

      {/* Sample Data Management */}
      <div className="p-6 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">
            Reset / Re-seed Fictional Commerce Project
          </h3>
          <p className="text-xs text-slate-500">
            Recreates the 8 microservice components, 6 flows, and 7 STRIDE threat scenarios.
          </p>
          {reseedSuccess && (
            <span className="text-xs text-emerald-700 font-bold block pt-1">
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
    </div>
  );
}

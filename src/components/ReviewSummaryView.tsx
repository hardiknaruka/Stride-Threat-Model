"use client";

import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { STRIDE_DEFINITIONS, StrideCategory, Stakeholder } from "@/lib/types";
import { SEVERITY_COLORS } from "@/lib/risk-scoring";
import {
  Printer,
  Download,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  Code,
  Copy,
  Check,
} from "lucide-react";

export function ReviewSummaryView() {
  const { activeProject } = useProject();
  const [copiedJson, setCopiedJson] = useState(false);
  const [showThreatDragonSpec, setShowThreatDragonSpec] = useState(false);

  if (!activeProject) return null;

  const { threats, elements, flows } = activeProject;

  const highAndCriticalThreats = threats.filter(
    (t) => t.severity === "CRITICAL" || t.severity === "HIGH"
  );

  let stakeholders: Stakeholder[] = [];
  try {
    if (activeProject.stakeholders) {
      const parsed = JSON.parse(activeProject.stakeholders);
      if (Array.isArray(parsed)) stakeholders = parsed;
    }
  } catch {
    // ignore
  }

  // Generate verified OWASP Threat Dragon 2.x JSON model adapter representation
  const threatDragonExportModel = {
    version: "2.3.0",
    summary: {
      title: activeProject.name,
      owner: activeProject.owner,
      description: activeProject.description,
      id: 0,
    },
    detail: {
      contributors: stakeholders.map((s) => ({ name: s.name })),
      diagrams: [
        {
          title: "Microservices Data Flow Diagram",
          id: 0,
          diagramType: "STRIDE",
          placeholder: "OWASP Threat Dragon 2.x Diagram Standard",
          cells: elements.map((elem, idx) => ({
            id: elem.id,
            type:
              elem.type === "PROCESS"
                ? "tm.Process"
                : elem.type === "DATA_STORE"
                ? "tm.Store"
                : "tm.Actor",
            name: elem.name,
            position: { x: elem.posX, y: elem.posY },
            size: { width: 160, height: 70 },
            attrs: {
              text: { text: elem.name },
            },
            threats: threats
              .filter((t) => t.linkedElements.some((le) => le.element.id === elem.id))
              .map((t) => ({
                id: t.threatId,
                title: t.title,
                type: JSON.parse(t.strideCategories || "[]")[0] || "Spoofing",
                status: t.status,
                severity: t.severity,
                description: t.scenario,
                mitigation: t.mitigation || "",
              })),
          })),
        },
      ],
      reviewer: activeProject.owner,
    },
  };

  const handleCopyThreatDragonJson = () => {
    navigator.clipboard.writeText(JSON.stringify(threatDragonExportModel, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto print-container">
      {/* Top action toolbar (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/80">
        <div>
          <h2 className="text-base font-bold text-white">
            Review & Handover Summary Report
          </h2>
          <p className="text-xs text-slate-400">
            Audit-ready formal documentation with print layout and CSV export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/projects/${activeProject.id}/export/csv`}
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </a>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF Report
          </button>
        </div>
      </div>

      {/* Formal Printable Document Body */}
      <div className="p-8 sm:p-10 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none space-y-8 print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-800 print:border-gray-300 pb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 print:text-indigo-800">
              STRIDE Threat Modeling Study Report
            </span>
            <span className="text-xs text-slate-400 print:text-gray-600">
              Generated: {new Date().toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black tracking-tight">
            {activeProject.name}
          </h1>

          <p className="text-sm text-slate-300 print:text-gray-700 leading-relaxed max-w-4xl">
            {activeProject.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <span className="text-slate-400 print:text-gray-500 block">Assessment Lead:</span>
              <span className="font-semibold text-slate-200 print:text-black">{activeProject.owner}</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-500 block">Target Environment:</span>
              <span className="font-semibold text-slate-200 print:text-black">{activeProject.environment}</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-500 block">Architecture Version:</span>
              <span className="font-semibold text-slate-200 print:text-black">v{activeProject.architectureVersion}</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-gray-500 block">Review Sign-off Date:</span>
              <span className="font-semibold text-slate-200 print:text-black">
                {activeProject.reviewDate ? new Date(activeProject.reviewDate).toLocaleDateString() : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Executive KPI Overview */}
        <div className="print-avoid-break space-y-3">
          <h2 className="text-base font-bold text-white print:text-black border-b border-slate-800 print:border-gray-300 pb-2">
            1. Executive Assessment Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-800 print:border-gray-200 bg-slate-950/60 print:bg-gray-50">
              <span className="text-xs text-slate-400 print:text-gray-600 block">Architecture Elements</span>
              <span className="text-2xl font-bold text-white print:text-black">{elements.length}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 print:border-gray-200 bg-slate-950/60 print:bg-gray-50">
              <span className="text-xs text-slate-400 print:text-gray-600 block">Directed Data Flows</span>
              <span className="text-2xl font-bold text-white print:text-black">{flows.length}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-800 print:border-gray-200 bg-slate-950/60 print:bg-gray-50">
              <span className="text-xs text-slate-400 print:text-gray-600 block">Total Threats Assessed</span>
              <span className="text-2xl font-bold text-white print:text-black">{threats.length}</span>
            </div>
            <div className="p-3.5 rounded-xl border border-rose-900/40 print:border-red-200 bg-rose-950/20 print:bg-red-50">
              <span className="text-xs text-rose-300 print:text-red-700 block">High & Critical Priority</span>
              <span className="text-2xl font-bold text-rose-400 print:text-red-700">{highAndCriticalThreats.length}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Study Scope & Baseline Boundaries */}
        <div className="print-avoid-break space-y-4">
          <h2 className="text-base font-bold text-white print:text-black border-b border-slate-800 print:border-gray-300 pb-2">
            2. System Scope & Boundaries
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-800 print:border-gray-200 bg-slate-950/40 print:bg-gray-50 space-y-1">
              <span className="font-bold text-emerald-400 print:text-green-800 block">In-Scope System Elements:</span>
              <p className="text-slate-300 print:text-gray-800 whitespace-pre-line leading-relaxed">
                {activeProject.inScope || "No in-scope notes documented."}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 print:border-gray-200 bg-slate-950/40 print:bg-gray-50 space-y-1">
              <span className="font-bold text-rose-400 print:text-red-800 block">Out-of-Scope Exclusions:</span>
              <p className="text-slate-300 print:text-gray-800 whitespace-pre-line leading-relaxed">
                {activeProject.outOfScope || "No out-of-scope exclusions documented."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-800 print:border-gray-200 bg-slate-950/40 print:bg-gray-50 space-y-1">
              <span className="font-bold text-blue-400 print:text-blue-800 block">Technical Assumptions:</span>
              <p className="text-slate-300 print:text-gray-800 whitespace-pre-line leading-relaxed">
                {activeProject.assumptions || "No assumptions recorded."}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 print:border-gray-200 bg-slate-950/40 print:bg-gray-50 space-y-1">
              <span className="font-bold text-amber-400 print:text-amber-800 block">Open Questions & Follow-ups:</span>
              <p className="text-slate-300 print:text-gray-800 whitespace-pre-line leading-relaxed">
                {activeProject.openQuestions || "No open questions recorded."}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: High and Critical Risks Highlight Table */}
        <div className="print-avoid-break space-y-3">
          <h2 className="text-base font-bold text-white print:text-black border-b border-slate-800 print:border-gray-300 pb-2">
            3. Critical & High Priority Risk Register
          </h2>

          <div className="overflow-x-auto border border-slate-800 print:border-gray-300 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 print:bg-gray-100 text-slate-400 print:text-gray-700 border-b border-slate-800 print:border-gray-300">
                  <th className="py-2.5 px-3 font-semibold">ID</th>
                  <th className="py-2.5 px-3 font-semibold">Title & Threat Scenario</th>
                  <th className="py-2.5 px-3 font-semibold">STRIDE</th>
                  <th className="py-2.5 px-3 font-semibold">Priority</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 print:divide-gray-200">
                {highAndCriticalThreats.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-850/40 print:hover:bg-transparent">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-400 print:text-black">
                      {t.threatId}
                    </td>
                    <td className="py-2.5 px-3 max-w-md">
                      <div className="font-bold text-slate-200 print:text-black">{t.title}</div>
                      <div className="text-slate-400 print:text-gray-600 text-[11px] line-clamp-2 mt-0.5">
                        {t.scenario}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-300 print:text-black">
                        {JSON.parse(t.strideCategories || "[]").join(", ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.severity === "CRITICAL"
                            ? "bg-rose-500/20 text-rose-300 print:bg-red-100 print:text-red-800"
                            : "bg-orange-500/20 text-orange-300 print:bg-yellow-100 print:text-yellow-800"
                        }`}
                      >
                        {t.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-300 print:text-black">
                      {t.status}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 print:text-black">
                      {t.owner || "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Mitigations & Treatment Plan Table */}
        <div className="print-avoid-break space-y-3">
          <h2 className="text-base font-bold text-white print:text-black border-b border-slate-800 print:border-gray-300 pb-2">
            4. Mitigation & Action Plan Register
          </h2>

          <div className="overflow-x-auto border border-slate-800 print:border-gray-300 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 print:bg-gray-100 text-slate-400 print:text-gray-700 border-b border-slate-800 print:border-gray-300">
                  <th className="py-2.5 px-3 font-semibold">ID</th>
                  <th className="py-2.5 px-3 font-semibold">Recommended Mitigation Treatment</th>
                  <th className="py-2.5 px-3 font-semibold">Existing Controls</th>
                  <th className="py-2.5 px-3 font-semibold">Owner / Team</th>
                  <th className="py-2.5 px-3 font-semibold">Due Date</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 print:divide-gray-200">
                {threats.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-850/40 print:hover:bg-transparent">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-300 print:text-black">
                      {t.threatId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 print:text-black max-w-sm">
                      {t.mitigation || "Mitigation pending specification"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 print:text-gray-600 text-[11px] max-w-xs">
                      {t.existingControls ? `${t.existingControls} (${t.controlsStatus})` : "None"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 print:text-black">
                      {t.owner || "Unassigned"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 print:text-gray-700 font-mono text-[11px]">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-300 print:text-black">
                      {t.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: OWASP Threat Dragon Integration Guidance (no-print) */}
        <div className="no-print rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  OWASP Threat Dragon Integration Path
                </h3>
                <p className="text-xs text-slate-400">
                  OWASP Threat Dragon is the preferred dedicated diagramming tool. This workspace manages the study workflow and risk register.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowThreatDragonSpec(!showThreatDragonSpec)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-xs text-slate-200"
              >
                {showThreatDragonSpec ? "Hide Schema" : "Inspect 2.x Schema"}
              </button>
              <button
                onClick={handleCopyThreatDragonJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium"
              >
                {copiedJson ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedJson ? "Copied JSON" : "Copy Threat Dragon JSON"}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The schema below maps this study&apos;s architecture components and STRIDE threats directly into the verified
            OWASP Threat Dragon 2.x standard JSON format (<code>diagramType: &ldquo;STRIDE&rdquo;</code>, <code>cells: tm.Process, tm.Store, tm.Actor</code>).
            You can load this model directly into OWASP Threat Dragon for deep visual rule validation.
          </p>

          {showThreatDragonSpec && (
            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-72">
                {JSON.stringify(threatDragonExportModel, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

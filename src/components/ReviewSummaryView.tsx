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
  Trash2,
} from "lucide-react";
import { DeleteProjectModal } from "@/components/DeleteProjectModal";

export function ReviewSummaryView() {
  const { activeProject, themePalette } = useProject();
  const isCorporate = themePalette === "corporate";

  const [copiedJson, setCopiedJson] = useState(false);
  const [showThreatDragonSpec, setShowThreatDragonSpec] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
          cells: elements.map((elem) => ({
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
    <div className="space-y-6 max-w-5xl mx-auto print-container">
      {/* Top action toolbar (hidden on print) */}
      <div className="no-print glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className={`h-5 w-5 ${isCorporate ? "text-blue-700" : "text-teal-700"}`} />
            Review & Handover Summary Report
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready formal documentation with print layout and CSV export.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setShowDeleteModal(true)}
            title="Permanently delete this threat model project"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-300/80 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-semibold shadow-xs transition-colors backdrop-blur-sm"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span> Project
          </button>

          <a
            href={`/api/projects/${activeProject.id}/export/csv`}
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200/80 bg-white/80 hover:bg-white text-slate-700 dark:text-slate-200 dark:border-slate-700 dark:bg-slate-800/80 text-xs font-semibold shadow-xs transition-colors backdrop-blur-sm"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </a>

          <button
            onClick={handlePrint}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] ${
              isCorporate
                ? "bg-blue-700 hover:bg-blue-800"
                : "bg-teal-700 hover:bg-teal-800"
            }`}
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF Report
          </button>
        </div>
      </div>

      {/* Formal Printable Document Body */}
      <div className="p-8 sm:p-10 rounded-xl glass-card print:bg-white print:text-black print:border-none print:shadow-none space-y-8 print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-200 print:border-gray-300 pb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-widest ${
              isCorporate ? "text-blue-700" : "text-teal-700"
            }`}>
              STRIDE Threat Modeling Study Report
            </span>
            <span className="text-xs text-slate-500 print:text-gray-600">
              Generated: {new Date().toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 print:text-black tracking-tight">
            {activeProject.name}
          </h1>

          <p className="text-sm text-slate-600 print:text-gray-700 leading-relaxed max-w-4xl">
            {activeProject.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <span className="text-slate-500 print:text-gray-500 block font-medium">Assessment Lead:</span>
              <span className="font-bold text-slate-900 print:text-black">{activeProject.owner}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-500 block font-medium">Target Environment:</span>
              <span className="font-bold text-slate-900 print:text-black">{activeProject.environment}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-500 block font-medium">Architecture Version:</span>
              <span className="font-bold text-slate-900 print:text-black">v{activeProject.architectureVersion}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-500 block font-medium">Review Sign-off Date:</span>
              <span className="font-bold text-slate-900 print:text-black">
                {activeProject.reviewDate ? new Date(activeProject.reviewDate).toLocaleDateString() : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Executive KPI Overview */}
        <div className="print-avoid-break space-y-3">
          <h2 className="text-base font-bold text-slate-900 print:text-black border-b border-slate-200 print:border-gray-300 pb-2">
            1. Executive Assessment Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Architecture Elements</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{elements.length}</span>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Directed Data Flows</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{flows.length}</span>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Threats Assessed</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{threats.length}</span>
            </div>
            <div className="p-3.5 rounded-lg border border-rose-200/80 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/20 backdrop-blur-xs">
              <span className="text-xs text-rose-700 dark:text-rose-400 block font-medium">High & Critical Priority</span>
              <span className="text-2xl font-bold text-rose-700 dark:text-rose-400">{highAndCriticalThreats.length}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Study Scope & Baseline Boundaries */}
        <div className="print-avoid-break space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white print:text-black border-b border-slate-200 dark:border-slate-800 print:border-gray-300 pb-2">
            2. System Scope & Boundaries
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-400 block">In-Scope System Elements:</span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {activeProject.inScope || "No in-scope notes documented."}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs space-y-1">
              <span className="font-bold text-rose-800 dark:text-rose-400 block">Out-of-Scope Exclusions:</span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {activeProject.outOfScope || "No out-of-scope exclusions documented."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs space-y-1">
              <span className="font-bold text-blue-800 dark:text-blue-400 block">Technical Assumptions:</span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {activeProject.assumptions || "No assumptions recorded."}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-400 block">Open Questions & Follow-ups:</span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {activeProject.openQuestions || "No open questions recorded."}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: High and Critical Risks Highlight Table */}
        <div className="print-avoid-break space-y-3">
          <h2 className="text-base font-bold text-slate-900 print:text-black border-b border-slate-200 print:border-gray-300 pb-2">
            3. Critical & High Priority Risk Register
          </h2>

          <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-bold">ID</th>
                  <th className="py-2.5 px-3 font-bold">Title & Threat Scenario</th>
                  <th className="py-2.5 px-3 font-bold">STRIDE</th>
                  <th className="py-2.5 px-3 font-bold">Priority</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {highAndCriticalThreats.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {t.threatId}
                    </td>
                    <td className="py-2.5 px-3 max-w-md">
                      <div className="font-bold text-slate-900">{t.title}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">
                        {t.scenario}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-700">
                        {JSON.parse(t.strideCategories || "[]").join(", ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.severity === "CRITICAL"
                            ? "bg-rose-100/90 text-rose-800 border border-rose-300"
                            : "bg-amber-100/90 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {t.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {t.status}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
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
          <h2 className="text-base font-bold text-slate-900 print:text-black border-b border-slate-200 print:border-gray-300 pb-2">
            4. Mitigation & Action Plan Register
          </h2>

          <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-bold">ID</th>
                  <th className="py-2.5 px-3 font-bold">Recommended Mitigation Treatment</th>
                  <th className="py-2.5 px-3 font-bold">Existing Controls</th>
                  <th className="py-2.5 px-3 font-bold">Owner / Team</th>
                  <th className="py-2.5 px-3 font-bold">Due Date</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {threats.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {t.threatId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 max-w-sm">
                      {t.mitigation || "Mitigation pending specification"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs">
                      {t.existingControls ? `${t.existingControls} (${t.controlsStatus})` : "None"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {t.owner || "Unassigned"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {t.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: OWASP Threat Dragon Integration Guidance (no-print) */}
        <div className="no-print rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className={`h-5 w-5 ${isCorporate ? "text-blue-700 dark:text-blue-400" : "text-teal-700 dark:text-teal-400"}`} />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  OWASP Threat Dragon Integration Path
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  OWASP Threat Dragon is the preferred dedicated diagramming tool. This workspace manages the study workflow and risk register.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowThreatDragonSpec(!showThreatDragonSpec)}
                className="px-3 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-700 bg-white/90 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs backdrop-blur-xs"
              >
                {showThreatDragonSpec ? "Hide Schema" : "Inspect 2.x Schema"}
              </button>
              <button
                onClick={handleCopyThreatDragonJson}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs text-white font-semibold shadow-xs transition-colors ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                {copiedJson ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedJson ? "Copied JSON" : "Copy Threat Dragon JSON"}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The schema below maps this study&apos;s architecture components and STRIDE threats directly into the verified
            OWASP Threat Dragon 2.x standard JSON format (<code>diagramType: &ldquo;STRIDE&rdquo;</code>, <code>cells: tm.Process, tm.Store, tm.Actor</code>).
            You can load this model directly into OWASP Threat Dragon for deep visual rule validation.
          </p>

          {showThreatDragonSpec && (
            <div className="relative">
              <pre className="p-4 rounded-lg bg-white/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-72 shadow-2xs">
                {JSON.stringify(threatDragonExportModel, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Delete Project Confirmation Modal */}
      <DeleteProjectModal
        isOpen={showDeleteModal}
        project={activeProject}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

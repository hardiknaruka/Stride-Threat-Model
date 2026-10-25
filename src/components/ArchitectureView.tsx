"use client";

import React, { useState } from "react";
import { useProject, ArchitectureElementData, DataFlowData } from "@/context/ProjectContext";
import { ElementType } from "@/lib/types";
import {
  Layers,
  ArrowRightLeft,
  Plus,
  Trash2,
  Edit2,
  ShieldAlert,
  Server,
  Database,
  Globe,
  Lock,
  ExternalLink,
  Info,
  CheckCircle2,
  X,
} from "lucide-react";

interface ArchitectureViewProps {
  onOpenNewThreatForElement?: (elementId: string) => void;
}

export function ArchitectureView({ onOpenNewThreatForElement }: ArchitectureViewProps) {
  const { activeProject, refreshActiveProject, roleConfig, themePalette } = useProject();
  const isCorporate = themePalette === "corporate";

  const [activeSubTab, setActiveSubTab] = useState<"diagram" | "elements" | "flows">("diagram");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Element modal state
  const [showElementModal, setShowElementModal] = useState(false);
  const [editingElement, setEditingElement] = useState<ArchitectureElementData | null>(null);
  const [elementForm, setElementForm] = useState<{
    name: string;
    type: ElementType;
    description: string;
    technology: string;
    trustZone: string;
    posX: number;
    posY: number;
  }>({
    name: "",
    type: "PROCESS",
    description: "",
    technology: "",
    trustZone: "Internal VPC Core",
    posX: 250,
    posY: 200,
  });

  // Flow modal state
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [editingFlow, setEditingFlow] = useState<DataFlowData | null>(null);
  const [flowForm, setFlowForm] = useState<{
    name: string;
    sourceElementId: string;
    targetElementId: string;
    protocol: string;
    dataCategory: string;
    authContext: string;
    crossesTrustBoundary: boolean;
    notes: string;
  }>({
    name: "",
    sourceElementId: "",
    targetElementId: "",
    protocol: "HTTPS/REST",
    dataCategory: "",
    authContext: "OAuth 2.0 / Bearer JWT",
    crossesTrustBoundary: false,
    notes: "",
  });

  if (!activeProject) return null;

  const { elements, flows, threats } = activeProject;

  const handleOpenAddElement = () => {
    setEditingElement(null);
    setElementForm({
      name: "",
      type: "PROCESS",
      description: "",
      technology: "",
      trustZone: "Internal VPC Core",
      posX: 200 + Math.random() * 200,
      posY: 100 + Math.random() * 200,
    });
    setShowElementModal(true);
  };

  const handleOpenEditElement = (elem: ArchitectureElementData) => {
    setEditingElement(elem);
    setElementForm({
      name: elem.name,
      type: elem.type,
      description: elem.description || "",
      technology: elem.technology || "",
      trustZone: elem.trustZone || "Internal VPC Core",
      posX: elem.posX,
      posY: elem.posY,
    });
    setShowElementModal(true);
  };

  const handleSaveElement = async () => {
    if (!elementForm.name.trim()) return;

    try {
      if (editingElement) {
        await fetch(`/api/projects/${activeProject.id}/elements/${editingElement.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(elementForm),
        });
      } else {
        await fetch(`/api/projects/${activeProject.id}/elements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(elementForm),
        });
      }
      await refreshActiveProject();
      setShowElementModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteElement = async (elemId: string) => {
    if (!confirm("Are you sure you want to delete this component? Associated data flows will also be removed.")) {
      return;
    }
    try {
      await fetch(`/api/projects/${activeProject.id}/elements/${elemId}`, {
        method: "DELETE",
      });
      if (selectedElementId === elemId) setSelectedElementId(null);
      await refreshActiveProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddFlow = () => {
    if (elements.length < 2) {
      alert("At least 2 architecture components are required to create a data flow.");
      return;
    }
    setEditingFlow(null);
    setFlowForm({
      name: "",
      sourceElementId: elements[0].id,
      targetElementId: elements[1].id,
      protocol: "HTTPS/REST",
      dataCategory: "",
      authContext: "OAuth 2.0 / Bearer JWT",
      crossesTrustBoundary: false,
      notes: "",
    });
    setShowFlowModal(true);
  };

  const handleOpenEditFlow = (flow: DataFlowData) => {
    setEditingFlow(flow);
    setFlowForm({
      name: flow.name,
      sourceElementId: flow.sourceElementId,
      targetElementId: flow.targetElementId,
      protocol: flow.protocol,
      dataCategory: flow.dataCategory || "",
      authContext: flow.authContext || "",
      crossesTrustBoundary: flow.crossesTrustBoundary,
      notes: flow.notes || "",
    });
    setShowFlowModal(true);
  };

  const handleSaveFlow = async () => {
    if (!flowForm.name.trim() || !flowForm.sourceElementId || !flowForm.targetElementId) {
      return;
    }

    try {
      if (editingFlow) {
        await fetch(`/api/projects/${activeProject.id}/flows/${editingFlow.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flowForm),
        });
      } else {
        await fetch(`/api/projects/${activeProject.id}/flows`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flowForm),
        });
      }
      await refreshActiveProject();
      setShowFlowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (!confirm("Are you sure you want to delete this data flow?")) return;
    try {
      await fetch(`/api/projects/${activeProject.id}/flows/${flowId}`, {
        method: "DELETE",
      });
      await refreshActiveProject();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to count threats linked to an element
  const getElementThreatCount = (elemId: string) => {
    return threats.filter((t) =>
      t.linkedElements.some((le) => le.element.id === elemId)
    ).length;
  };

  // Helper to count threats linked to a flow
  const getFlowThreatCount = (flowId: string) => {
    return threats.filter((t) =>
      t.linkedFlows.some((lf) => lf.flow.id === flowId)
    ).length;
  };

  const selectedElement = elements.find((e) => e.id === selectedElementId);
  const selectedElementThreats = selectedElement
    ? threats.filter((t) =>
        t.linkedElements.some((le) => le.element.id === selectedElement.id)
      )
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className={`h-5 w-5 ${isCorporate ? "text-blue-700" : "text-teal-700"}`} />
            Architecture Inventory & Data Flows
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Microservices, data stores, external entities, trust boundaries, and directed communication channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-view toggle */}
          <div className="flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setActiveSubTab("diagram")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeSubTab === "diagram"
                  ? isCorporate
                    ? "bg-blue-700 text-white shadow-xs"
                    : "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Interactive Graph
            </button>
            <button
              onClick={() => setActiveSubTab("elements")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeSubTab === "elements"
                  ? isCorporate
                    ? "bg-blue-700 text-white shadow-xs"
                    : "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Components ({elements.length})
            </button>
            <button
              onClick={() => setActiveSubTab("flows")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeSubTab === "flows"
                  ? isCorporate
                    ? "bg-blue-700 text-white shadow-xs"
                    : "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Data Flows ({flows.length})
            </button>
          </div>

          {roleConfig.canEditArchitecture && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddElement}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Component
              </button>
              <button
                onClick={handleOpenAddFlow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Flow
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUB-VIEW 1: Interactive Architecture Graph Canvas */}
      {activeSubTab === "diagram" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 px-1 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className={`h-3 w-3 rounded-sm border ${isCorporate ? "bg-blue-100 border-blue-600" : "bg-teal-100 border-teal-600"}`} />
                  <span className="font-medium text-slate-700">Process</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-emerald-100 border border-emerald-600" />
                  <span className="font-medium text-slate-700">Data Store</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-sky-100 border border-sky-600" />
                  <span className="font-medium text-slate-700">External Entity</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-4 border-t-2 border-dashed border-rose-500" />
                  <span className="font-medium text-slate-700">Trust Boundary Flow</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Click any component node to inspect details & linked STRIDE threats
              </span>
            </div>

            {/* SVG Diagram Canvas */}
            <div className="relative w-full h-[520px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
              <svg
                className="w-full h-full select-none"
                viewBox="0 0 1000 480"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Arrowhead marker standard */}
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill={isCorporate ? "#1d4ed8" : "#0f766e"} />
                  </marker>
                  {/* Arrowhead marker boundary */}
                  <marker
                    id="arrowhead-boundary"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#e11d48" />
                  </marker>
                </defs>

                {/* Grid dots background */}
                <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.2" fill="#cbd5e1" />
                </pattern>
                <rect width="1000" height="480" fill="url(#grid)" />

                {/* Render Directed Data Flows (Edges) */}
                {flows.map((flow) => {
                  const source = elements.find((e) => e.id === flow.sourceElementId);
                  const target = elements.find((e) => e.id === flow.targetElementId);
                  if (!source || !target) return null;

                  const sx = source.posX + 80;
                  const sy = source.posY + 35;
                  const tx = target.posX + 80;
                  const ty = target.posY + 35;

                  // Curved path coordinates
                  const dx = tx - sx;
                  const dy = ty - sy;
                  const cx1 = sx + dx * 0.5;
                  const cy1 = sy;
                  const cx2 = sx + dx * 0.5;
                  const cy2 = ty;

                  const isCrossing = flow.crossesTrustBoundary;
                  const strokeColor = isCrossing ? "#e11d48" : isCorporate ? "#2563eb" : "#0d9488";
                  const markerId = isCrossing ? "url(#arrowhead-boundary)" : "url(#arrowhead)";

                  const midX = (sx + tx) / 2;
                  const midY = (sy + ty) / 2 - 8;

                  const isConnected =
                    selectedElementId === source.id || selectedElementId === target.id;

                  return (
                    <g key={flow.id} className="transition-all duration-200">
                      <path
                        d={`M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isConnected ? 3 : 2}
                        strokeDasharray={isCrossing ? "5,4" : undefined}
                        markerEnd={markerId}
                        opacity={selectedElementId && !isConnected ? 0.35 : 0.9}
                      />
                      {/* Flow label */}
                      <rect
                        x={midX - 55}
                        y={midY - 10}
                        width="110"
                        height="16"
                        rx="4"
                        fill="#ffffff"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        opacity={selectedElementId && !isConnected ? 0.35 : 0.95}
                      />
                      <text
                        x={midX}
                        y={midY + 1}
                        fill="#334155"
                        fontSize="9"
                        fontWeight="600"
                        textAnchor="middle"
                        className="font-mono select-none"
                        opacity={selectedElementId && !isConnected ? 0.35 : 1}
                      >
                        {flow.name.length > 15 ? flow.name.substring(0, 14) + "…" : flow.name}
                      </text>
                    </g>
                  );
                })}

                {/* Render Architecture Component Nodes */}
                {elements.map((elem) => {
                  const isSelected = selectedElementId === elem.id;
                  const threatCount = getElementThreatCount(elem.id);

                  let borderColor = isCorporate ? "stroke-blue-600" : "stroke-teal-600";
                  let headerColor = isCorporate ? "fill-blue-50" : "fill-teal-50";
                  let badgeFill = isCorporate ? "#1d4ed8" : "#0f766e";

                  if (elem.type === "DATA_STORE") {
                    borderColor = "stroke-emerald-600";
                    headerColor = "fill-emerald-50";
                    badgeFill = "#059669";
                  } else if (elem.type === "EXTERNAL_ENTITY") {
                    borderColor = "stroke-sky-600";
                    headerColor = "fill-sky-50";
                    badgeFill = "#0284c7";
                  }

                  return (
                    <g
                      key={elem.id}
                      onClick={() => setSelectedElementId(elem.id)}
                      className="cursor-pointer transition-transform duration-150 hover:brightness-95"
                      transform={`translate(${elem.posX}, ${elem.posY})`}
                    >
                      {/* Node Box */}
                      <rect
                        width="160"
                        height="70"
                        rx="8"
                        fill="#ffffff"
                        className={`${borderColor} ${
                          isSelected ? "stroke-[3px]" : "stroke-[1.5px]"
                        }`}
                        filter={isSelected ? "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" : "drop-shadow(0 1px 3px rgba(0,0,0,0.06))"}
                      />

                      {/* Header bar */}
                      <rect
                        x="1"
                        y="1"
                        width="158"
                        height="26"
                        rx="7"
                        className={headerColor}
                      />

                      {/* Header line */}
                      <text
                        x="12"
                        y="18"
                        fill="#0f172a"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        {elem.name.length > 18 ? elem.name.substring(0, 16) + "..." : elem.name}
                      </text>

                      {/* Tech & Zone */}
                      <text
                        x="12"
                        y="42"
                        fill="#475569"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="500"
                      >
                        {elem.technology ? elem.technology.substring(0, 20) : elem.type}
                      </text>

                      <text
                        x="12"
                        y="58"
                        fill="#64748b"
                        fontSize="9"
                      >
                        Zone: {elem.trustZone || "Core"}
                      </text>

                      {/* Threat count badge */}
                      {threatCount > 0 && (
                        <g transform="translate(142, 4)">
                          <circle cx="6" cy="6" r="9" fill="#e11d48" />
                          <text
                            x="6"
                            y="9.5"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {threatCount}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-3 px-1 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                OWASP Threat Dragon integration compatible for complete DFD diagrams.
              </span>
              <span className="font-medium text-slate-600">{elements.length} components • {flows.length} directed flows</span>
            </div>
          </div>

          {/* Component Inspector Drawer (4 columns) */}
          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-4 flex flex-col justify-between shadow-xs">
            {selectedElement ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isCorporate ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-teal-50 text-teal-700 border border-teal-200"
                    }`}>
                      {selectedElement.type}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">
                      {selectedElement.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {selectedElement.technology || "No technology stack noted"}
                    </p>
                  </div>
                  {roleConfig.canEditArchitecture && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditElement(selectedElement)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                        title="Edit component"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteElement(selectedElement.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        title="Delete component"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Trust Zone:</span>{" "}
                    <span className="text-slate-800 font-semibold">{selectedElement.trustZone || "Default"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Description:</span>{" "}
                    <span className="text-slate-700 leading-relaxed block mt-0.5">
                      {selectedElement.description || "No description provided."}
                    </span>
                  </div>
                </div>

                {/* Linked Threats for Selected Component */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-rose-600" />
                      Linked STRIDE Threats ({selectedElementThreats.length})
                    </span>
                    {onOpenNewThreatForElement && roleConfig.canCreateThreats && (
                      <button
                        onClick={() => onOpenNewThreatForElement(selectedElement.id)}
                        className={`text-xs font-semibold hover:underline ${
                          isCorporate ? "text-blue-700" : "text-teal-700"
                        }`}
                      >
                        + Link Threat
                      </button>
                    )}
                  </div>

                  {selectedElementThreats.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No threats specifically linked to this component yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {selectedElementThreats.map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-700 font-bold">
                              {t.threatId}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                t.severity === "CRITICAL"
                                  ? "bg-rose-100 text-rose-700 border border-rose-200"
                                  : t.severity === "HIGH"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {t.severity}
                            </span>
                          </div>
                          <div className="font-bold text-slate-800 line-clamp-1">{t.title}</div>
                          <div className="text-slate-500 text-[11px] line-clamp-2">{t.mitigation || "Mitigation pending"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Server className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No Component Selected</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Click any microservice, database, or external entity in the graph to inspect properties and associated threats.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>OWASP Threat Dragon ready</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Components Table */}
      {activeSubTab === "elements" && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-900">
              Architecture Inventory ({elements.length} components)
            </h3>
            {roleConfig.canEditArchitecture && (
              <button
                onClick={handleOpenAddElement}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Component
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-700">
                  <th className="py-2.5 px-4 font-bold">Component Name</th>
                  <th className="py-2.5 px-4 font-bold">Type</th>
                  <th className="py-2.5 px-4 font-bold">Technology</th>
                  <th className="py-2.5 px-4 font-bold">Trust Zone</th>
                  <th className="py-2.5 px-4 font-bold">Linked Threats</th>
                  <th className="py-2.5 px-4 font-bold">Description</th>
                  {roleConfig.canEditArchitecture && <th className="py-2.5 px-4 text-right font-bold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {elements.map((elem) => {
                  const threatCount = getElementThreatCount(elem.id);
                  return (
                    <tr key={elem.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {elem.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {elem.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {elem.technology || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {elem.trustZone || "—"}
                      </td>
                      <td className="py-3 px-4">
                        {threatCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {threatCount} threats
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {elem.description || "—"}
                      </td>
                      {roleConfig.canEditArchitecture && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditElement(elem)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteElement(elem.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Data Flows Table */}
      {activeSubTab === "flows" && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-900">
              Directed Data Flows Register ({flows.length} flows)
            </h3>
            {roleConfig.canEditArchitecture && (
              <button
                onClick={handleOpenAddFlow}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Data Flow
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-700">
                  <th className="py-2.5 px-4 font-bold">Flow Name</th>
                  <th className="py-2.5 px-4 font-bold">Source &rarr; Target</th>
                  <th className="py-2.5 px-4 font-bold">Protocol / Channel</th>
                  <th className="py-2.5 px-4 font-bold">Data Category</th>
                  <th className="py-2.5 px-4 font-bold">Authentication Context</th>
                  <th className="py-2.5 px-4 font-bold">Crosses Boundary</th>
                  <th className="py-2.5 px-4 font-bold">Linked Threats</th>
                  {roleConfig.canEditArchitecture && <th className="py-2.5 px-4 text-right font-bold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flows.map((flow) => {
                  const threatCount = getFlowThreatCount(flow.id);
                  return (
                    <tr key={flow.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {flow.name}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-semibold text-slate-900">{flow.sourceElement?.name || "Source"}</span>
                        <span className={`mx-1.5 font-bold ${isCorporate ? "text-blue-600" : "text-teal-600"}`}>&rarr;</span>
                        <span className="font-semibold text-slate-900">{flow.targetElement?.name || "Target"}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {flow.protocol}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {flow.dataCategory || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {flow.authContext || "—"}
                      </td>
                      <td className="py-3 px-4">
                        {flow.crossesTrustBoundary ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Yes (Boundary Cross)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200">
                            Internal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {threatCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {threatCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      {roleConfig.canEditArchitecture && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditFlow(flow)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFlow(flow.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ELEMENT MODAL */}
      {showElementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingElement ? "Edit Architecture Component" : "Add Architecture Component"}
              </h3>
              <button
                onClick={() => setShowElementModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Component Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Order Service, Redis Cache, API Gateway"
                  value={elementForm.name}
                  onChange={(e) => setElementForm({ ...elementForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Element Type *</label>
                  <select
                    value={elementForm.type}
                    onChange={(e) => setElementForm({ ...elementForm, type: e.target.value as ElementType })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="PROCESS">Process / Microservice</option>
                    <option value="DATA_STORE">Data Store / Database</option>
                    <option value="EXTERNAL_ENTITY">External Entity / Third Party</option>
                    <option value="TRUST_BOUNDARY">Trust Boundary Box</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Trust Zone</label>
                  <input
                    type="text"
                    placeholder="e.g., Public Internet, DMZ, VPC Core"
                    value={elementForm.trustZone}
                    onChange={(e) => setElementForm({ ...elementForm, trustZone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Technology Stack</label>
                <input
                  type="text"
                  placeholder="e.g., Node.js / Express, PostgreSQL 16, Envoy Proxy"
                  value={elementForm.technology}
                  onChange={(e) => setElementForm({ ...elementForm, technology: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description & Role</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the responsibilities and architectural placement..."
                  value={elementForm.description}
                  onChange={(e) => setElementForm({ ...elementForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowElementModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveElement}
                className={`px-4 py-2 rounded-lg text-xs text-white font-semibold shadow-xs ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                Save Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOW MODAL */}
      {showFlowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingFlow ? "Edit Data Flow" : "Add Directed Data Flow"}
              </h3>
              <button
                onClick={() => setShowFlowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Flow Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Authenticate User, Forward Order, Publish Kafka Event"
                  value={flowForm.name}
                  onChange={(e) => setFlowForm({ ...flowForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Source Component *</label>
                  <select
                    value={flowForm.sourceElementId}
                    onChange={(e) => setFlowForm({ ...flowForm, sourceElementId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {elements.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Component *</label>
                  <select
                    value={flowForm.targetElementId}
                    onChange={(e) => setFlowForm({ ...flowForm, targetElementId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {elements.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Protocol / Channel *</label>
                  <input
                    type="text"
                    placeholder="e.g., HTTPS/REST, gRPC, Kafka AMQP, TLS"
                    value={flowForm.protocol}
                    onChange={(e) => setFlowForm({ ...flowForm, protocol: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Data Category</label>
                  <input
                    type="text"
                    placeholder="e.g., Auth Tokens, Order Payload, Public Catalog"
                    value={flowForm.dataCategory}
                    onChange={(e) => setFlowForm({ ...flowForm, dataCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Authentication Context</label>
                <input
                  type="text"
                  placeholder="e.g., OAuth 2.0 PKCE, mTLS Service Mesh, API Key, Session Cookie"
                  value={flowForm.authContext}
                  onChange={(e) => setFlowForm({ ...flowForm, authContext: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="crossesTrust"
                  checked={flowForm.crossesTrustBoundary}
                  onChange={(e) => setFlowForm({ ...flowForm, crossesTrustBoundary: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="crossesTrust" className="text-slate-800 font-medium">
                  Crosses Trust Boundary (requires higher scrutiny under STRIDE)
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Flow Notes & Controls</label>
                <textarea
                  rows={2}
                  placeholder="Security notes, rate limiting, encryption details..."
                  value={flowForm.notes}
                  onChange={(e) => setFlowForm({ ...flowForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowFlowModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFlow}
                className={`px-4 py-2 rounded-lg text-xs text-white font-semibold shadow-xs ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                Save Data Flow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

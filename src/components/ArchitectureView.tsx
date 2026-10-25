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
} from "lucide-react";

interface ArchitectureViewProps {
  onOpenNewThreatForElement?: (elementId: string) => void;
}

export function ArchitectureView({ onOpenNewThreatForElement }: ArchitectureViewProps) {
  const { activeProject, refreshActiveProject, roleConfig } = useProject();

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
    if (!confirm("Are you sure you want to delete this architecture component and its associated flows?")) return;
    try {
      await fetch(`/api/projects/${activeProject.id}/elements/${elemId}`, {
        method: "DELETE",
      });
      await refreshActiveProject();
      if (selectedElementId === elemId) setSelectedElementId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddFlow = () => {
    if (elements.length < 2) {
      alert("Please create at least two architecture components before adding a data flow.");
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
    if (!flowForm.name.trim() || !flowForm.sourceElementId || !flowForm.targetElementId) return;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Architecture Inventory & Data Flows
          </h2>
          <p className="text-xs text-slate-400">
            Microservices, data stores, external entities, trust boundaries, and directed communication channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-view toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab("diagram")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeSubTab === "diagram"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Interactive Graph
            </button>
            <button
              onClick={() => setActiveSubTab("elements")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeSubTab === "elements"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Components ({elements.length})
            </button>
            <button
              onClick={() => setActiveSubTab("flows")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeSubTab === "flows"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Data Flows ({flows.length})
            </button>
          </div>

          {roleConfig.canEditArchitecture && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddElement}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Component
              </button>
              <button
                onClick={handleOpenAddFlow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
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
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 px-2 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-indigo-500/20 border border-indigo-500" />
                  Process
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-emerald-500/20 border border-emerald-500" />
                  Data Store
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-cyan-500/20 border border-cyan-500" />
                  External Entity
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-4 border-t-2 border-dashed border-rose-500" />
                  Trust Boundary Flow
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Click any component node to inspect details & linked STRIDE threats
              </span>
            </div>

            {/* SVG Diagram Canvas */}
            <div className="relative w-full h-[540px] bg-[#070b14] rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
              <svg
                className="w-full h-full select-none"
                viewBox="0 0 1000 480"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Arrowhead marker */}
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
                  </marker>
                  <marker
                    id="arrowhead-boundary"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#f43f5e" />
                  </marker>
                </defs>

                {/* Grid dots background */}
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#1e293b" />
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
                  const strokeColor = isCrossing ? "#f43f5e" : "#6366f1";
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
                        opacity={selectedElementId && !isConnected ? 0.3 : 0.85}
                      />
                      {/* Flow label */}
                      <text
                        x={midX}
                        y={midY}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="middle"
                        className="font-mono bg-slate-950 px-1"
                        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                      >
                        {flow.name} ({flow.protocol})
                      </text>
                    </g>
                  );
                })}

                {/* Render Architecture Component Nodes */}
                {elements.map((elem) => {
                  const isSelected = selectedElementId === elem.id;
                  const threatCount = getElementThreatCount(elem.id);

                  let borderColor = "stroke-indigo-500";
                  let bgColor = "fill-[#0f172a]";
                  if (elem.type === "DATA_STORE") {
                    borderColor = "stroke-emerald-500";
                    bgColor = "fill-[#06201b]";
                  } else if (elem.type === "EXTERNAL_ENTITY") {
                    borderColor = "stroke-cyan-500";
                    bgColor = "fill-[#081e28]";
                  }

                  return (
                    <g
                      key={elem.id}
                      onClick={() => setSelectedElementId(elem.id)}
                      className="cursor-pointer transition-transform duration-150 hover:brightness-125"
                      transform={`translate(${elem.posX}, ${elem.posY})`}
                    >
                      {/* Node Box */}
                      <rect
                        width="160"
                        height="70"
                        rx="10"
                        className={`${bgColor} ${borderColor} ${
                          isSelected ? "stroke-[3px]" : "stroke-[1.5px]"
                        }`}
                        filter={isSelected ? "drop-shadow(0 0 10px rgba(99,102,241,0.5))" : undefined}
                      />

                      {/* Header line */}
                      <text
                        x="12"
                        y="24"
                        fill="#f8fafc"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {elem.name.length > 18 ? elem.name.substring(0, 16) + "..." : elem.name}
                      </text>

                      {/* Tech & Zone */}
                      <text
                        x="12"
                        y="42"
                        fill="#94a3b8"
                        fontSize="10"
                        fontFamily="monospace"
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
                        <g transform="translate(142, 6)">
                          <circle cx="6" cy="6" r="9" fill="#e11d48" />
                          <text
                            x="6"
                            y="10"
                            fill="#ffffff"
                            fontSize="10"
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

            <div className="mt-3 px-2 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                Dedicated diagramming: Use OWASP Threat Dragon for complex threat tree modeling.
              </span>
              <span>{elements.length} components • {flows.length} directed flows</span>
            </div>
          </div>

          {/* Component Inspector Drawer (4 columns) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between">
            {selectedElement ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300">
                      {selectedElement.type}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {selectedElement.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedElement.technology || "No technology stack noted"}
                    </p>
                  </div>
                  {roleConfig.canEditArchitecture && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditElement(selectedElement)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                        title="Edit component"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteElement(selectedElement.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                        title="Delete component"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400">Trust Zone:</span>{" "}
                    <span className="text-slate-200 font-medium">{selectedElement.trustZone || "Default"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Description:</span>{" "}
                    <span className="text-slate-300 leading-relaxed block mt-0.5">
                      {selectedElement.description || "No description provided."}
                    </span>
                  </div>
                </div>

                {/* Linked Threats for Selected Component */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-rose-400" />
                      Linked STRIDE Threats ({selectedElementThreats.length})
                    </span>
                    {onOpenNewThreatForElement && roleConfig.canCreateThreats && (
                      <button
                        onClick={() => onOpenNewThreatForElement(selectedElement.id)}
                        className="text-indigo-400 hover:underline text-[11px]"
                      >
                        + Link Threat
                      </button>
                    )}
                  </div>

                  {selectedElementThreats.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      No threats specifically linked to this component yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {selectedElementThreats.map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-400 font-bold">
                              {t.threatId}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                t.severity === "CRITICAL"
                                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : t.severity === "HIGH"
                                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              }`}
                            >
                              {t.severity}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-200 line-clamp-1">{t.title}</div>
                          <div className="text-slate-400 text-[11px] line-clamp-2">{t.mitigation || "Mitigation pending"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Server className="h-10 w-10 text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-400">No Component Selected</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Click any microservice, database, or external entity in the graph to inspect properties and associated threats.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>OWASP Threat Dragon integration available</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Components Table */}
      {activeSubTab === "elements" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Architecture Inventory ({elements.length} components)
            </h3>
            {roleConfig.canEditArchitecture && (
              <button
                onClick={handleOpenAddElement}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Component
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400">
                  <th className="py-2.5 px-4 font-semibold">Component Name</th>
                  <th className="py-2.5 px-4 font-semibold">Type</th>
                  <th className="py-2.5 px-4 font-semibold">Technology</th>
                  <th className="py-2.5 px-4 font-semibold">Trust Zone</th>
                  <th className="py-2.5 px-4 font-semibold">Linked Threats</th>
                  <th className="py-2.5 px-4 font-semibold">Description</th>
                  {roleConfig.canEditArchitecture && <th className="py-2.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {elements.map((elem) => {
                  const threatCount = getElementThreatCount(elem.id);
                  return (
                    <tr key={elem.id} className="hover:bg-slate-850/40">
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {elem.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300">
                          {elem.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {elem.technology || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {elem.trustZone || "—"}
                      </td>
                      <td className="py-3 px-4">
                        {threatCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {threatCount} threats
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {elem.description || "—"}
                      </td>
                      {roleConfig.canEditArchitecture && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditElement(elem)}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteElement(elem.id)}
                              className="p-1 text-slate-400 hover:text-rose-400"
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Directed Data Flows Register ({flows.length} flows)
            </h3>
            {roleConfig.canEditArchitecture && (
              <button
                onClick={handleOpenAddFlow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Data Flow
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400">
                  <th className="py-2.5 px-4 font-semibold">Flow Name</th>
                  <th className="py-2.5 px-4 font-semibold">Source &rarr; Target</th>
                  <th className="py-2.5 px-4 font-semibold">Protocol / Channel</th>
                  <th className="py-2.5 px-4 font-semibold">Data Category</th>
                  <th className="py-2.5 px-4 font-semibold">Authentication Context</th>
                  <th className="py-2.5 px-4 font-semibold">Crosses Boundary</th>
                  <th className="py-2.5 px-4 font-semibold">Linked Threats</th>
                  {roleConfig.canEditArchitecture && <th className="py-2.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {flows.map((flow) => {
                  const threatCount = getFlowThreatCount(flow.id);
                  return (
                    <tr key={flow.id} className="hover:bg-slate-850/40">
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {flow.name}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="text-slate-200 font-medium">{flow.sourceElement?.name || "Source"}</span>
                        <span className="text-indigo-400 mx-1.5">&rarr;</span>
                        <span className="text-slate-200 font-medium">{flow.targetElement?.name || "Target"}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-300">
                        {flow.protocol}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {flow.dataCategory || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {flow.authContext || "—"}
                      </td>
                      <td className="py-3 px-4">
                        {flow.crossesTrustBoundary ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Yes (Boundary Cross)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] text-slate-400 bg-slate-800">
                            Internal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {threatCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {threatCount}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      {roleConfig.canEditArchitecture && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditFlow(flow)}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFlow(flow.id)}
                              className="p-1 text-slate-400 hover:text-rose-400"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingElement ? "Edit Architecture Component" : "Add Architecture Component"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Component Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Order Service, Redis Cache, API Gateway"
                  value={elementForm.name}
                  onChange={(e) => setElementForm({ ...elementForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Element Type *</label>
                  <select
                    value={elementForm.type}
                    onChange={(e) => setElementForm({ ...elementForm, type: e.target.value as ElementType })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PROCESS">Process / Microservice</option>
                    <option value="DATA_STORE">Data Store / Database</option>
                    <option value="EXTERNAL_ENTITY">External Entity / Third Party</option>
                    <option value="TRUST_BOUNDARY">Trust Boundary Box</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Trust Zone</label>
                  <input
                    type="text"
                    placeholder="e.g., Public Internet, DMZ, VPC Core"
                    value={elementForm.trustZone}
                    onChange={(e) => setElementForm({ ...elementForm, trustZone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Technology Stack</label>
                <input
                  type="text"
                  placeholder="e.g., Node.js / Express, PostgreSQL 16, Envoy Proxy"
                  value={elementForm.technology}
                  onChange={(e) => setElementForm({ ...elementForm, technology: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description & Role</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the responsibilities and architectural placement..."
                  value={elementForm.description}
                  onChange={(e) => setElementForm({ ...elementForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowElementModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveElement}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold"
              >
                Save Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOW MODAL */}
      {showFlowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingFlow ? "Edit Data Flow" : "Add Directed Data Flow"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Flow Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Authenticate User, Forward Order, Publish Kafka Event"
                  value={flowForm.name}
                  onChange={(e) => setFlowForm({ ...flowForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Source Component *</label>
                  <select
                    value={flowForm.sourceElementId}
                    onChange={(e) => setFlowForm({ ...flowForm, sourceElementId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {elements.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Component *</label>
                  <select
                    value={flowForm.targetElementId}
                    onChange={(e) => setFlowForm({ ...flowForm, targetElementId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
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
                  <label className="block text-slate-400 font-semibold mb-1">Protocol / Channel *</label>
                  <input
                    type="text"
                    placeholder="e.g., HTTPS/REST, gRPC, Kafka AMQP, TLS"
                    value={flowForm.protocol}
                    onChange={(e) => setFlowForm({ ...flowForm, protocol: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Data Category</label>
                  <input
                    type="text"
                    placeholder="e.g., Auth Tokens, Order Payload, Public Catalog"
                    value={flowForm.dataCategory}
                    onChange={(e) => setFlowForm({ ...flowForm, dataCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Authentication Context</label>
                <input
                  type="text"
                  placeholder="e.g., OAuth 2.0 PKCE, mTLS Service Mesh, API Key, Session Cookie"
                  value={flowForm.authContext}
                  onChange={(e) => setFlowForm({ ...flowForm, authContext: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="crossesTrust"
                  checked={flowForm.crossesTrustBoundary}
                  onChange={(e) => setFlowForm({ ...flowForm, crossesTrustBoundary: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="crossesTrust" className="text-slate-300 font-medium">
                  Crosses Trust Boundary (requires higher scrutiny under STRIDE)
                </label>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Flow Notes & Controls</label>
                <textarea
                  rows={2}
                  placeholder="Security notes, rate limiting, encryption details..."
                  value={flowForm.notes}
                  onChange={(e) => setFlowForm({ ...flowForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowFlowModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFlow}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold"
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

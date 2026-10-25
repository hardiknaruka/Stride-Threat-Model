"use client";

import React, { useState, useEffect } from "react";
import { useProject, ThreatData } from "@/context/ProjectContext";
import {
  StrideCategory,
  STRIDE_DEFINITIONS,
  Likelihood,
  Impact,
  Severity,
  ControlsStatus,
  ThreatStatus,
} from "@/lib/types";
import { calculateSeverity, SEVERITY_COLORS } from "@/lib/risk-scoring";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  Layers,
  ArrowRightLeft,
  X,
} from "lucide-react";

interface ThreatModalProps {
  isOpen: boolean;
  onClose: () => void;
  threatToEdit?: ThreatData | null;
  defaultElementId?: string;
}

export function ThreatModal({
  isOpen,
  onClose,
  threatToEdit,
  defaultElementId,
}: ThreatModalProps) {
  const { activeProject, refreshActiveProject, roleConfig } = useProject();

  const [threatId, setThreatId] = useState("");
  const [title, setTitle] = useState("");
  const [scenario, setScenario] = useState("");
  const [selectedStride, setSelectedStride] = useState<StrideCategory[]>(["SPOOFING"]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  const [preconditions, setPreconditions] = useState("");

  // Impact scope breakdown
  const [confidentialityImpact, setConfidentialityImpact] = useState("MEDIUM");
  const [integrityImpact, setIntegrityImpact] = useState("MEDIUM");
  const [availabilityImpact, setAvailabilityImpact] = useState("LOW");
  const [privacyImpact, setPrivacyImpact] = useState("LOW");
  const [businessImpact, setBusinessImpact] = useState("");

  // Scoring
  const [likelihood, setLikelihood] = useState<Likelihood>("MEDIUM");
  const [impact, setImpact] = useState<Impact>("MEDIUM");
  const [isOverridden, setIsOverridden] = useState(false);
  const [overriddenSeverity, setOverriddenSeverity] = useState<Severity>("HIGH");
  const [severityRationale, setSeverityRationale] = useState("");

  // Controls & Mitigation
  const [existingControls, setExistingControls] = useState("");
  const [controlsStatus, setControlsStatus] = useState<ControlsStatus>("ASSUMED");
  const [mitigation, setMitigation] = useState("");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<ThreatStatus>("OPEN");
  const [notApplicableRationale, setNotApplicableRationale] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (threatToEdit) {
      setThreatId(threatToEdit.threatId);
      setTitle(threatToEdit.title);
      setScenario(threatToEdit.scenario);
      try {
        const parsed = JSON.parse(threatToEdit.strideCategories);
        setSelectedStride(Array.isArray(parsed) ? parsed : ["SPOOFING"]);
      } catch {
        setSelectedStride(["SPOOFING"]);
      }
      setSelectedElements(threatToEdit.linkedElements.map((le) => le.element.id));
      setSelectedFlows(threatToEdit.linkedFlows.map((lf) => lf.flow.id));
      setPreconditions(threatToEdit.preconditions || "");
      setConfidentialityImpact(threatToEdit.confidentialityImpact || "MEDIUM");
      setIntegrityImpact(threatToEdit.integrityImpact || "MEDIUM");
      setAvailabilityImpact(threatToEdit.availabilityImpact || "LOW");
      setPrivacyImpact(threatToEdit.privacyImpact || "LOW");
      setBusinessImpact(threatToEdit.businessImpact || "");
      setLikelihood(threatToEdit.likelihood);
      setImpact(threatToEdit.impact);
      setIsOverridden(threatToEdit.isOverridden);
      setOverriddenSeverity(threatToEdit.severity);
      setSeverityRationale(threatToEdit.severityRationale || "");
      setExistingControls(threatToEdit.existingControls || "");
      setControlsStatus(threatToEdit.controlsStatus);
      setMitigation(threatToEdit.mitigation || "");
      setOwner(threatToEdit.owner || "");
      setDueDate(
        threatToEdit.dueDate
          ? new Date(threatToEdit.dueDate).toISOString().split("T")[0]
          : ""
      );
      setStatus(threatToEdit.status);
      setNotApplicableRationale(threatToEdit.notApplicableRationale || "");
    } else {
      // New Threat Defaults
      setThreatId("");
      setTitle("");
      setScenario("");
      setSelectedStride(["SPOOFING"]);
      setSelectedElements(defaultElementId ? [defaultElementId] : []);
      setSelectedFlows([]);
      setPreconditions("");
      setConfidentialityImpact("MEDIUM");
      setIntegrityImpact("MEDIUM");
      setAvailabilityImpact("LOW");
      setPrivacyImpact("LOW");
      setBusinessImpact("");
      setLikelihood("MEDIUM");
      setImpact("MEDIUM");
      setIsOverridden(false);
      setOverriddenSeverity("MEDIUM");
      setSeverityRationale("");
      setExistingControls("");
      setControlsStatus("ASSUMED");
      setMitigation("");
      setOwner("");
      setDueDate("");
      setStatus("OPEN");
      setNotApplicableRationale("");
    }
    setValidationError(null);
  }, [threatToEdit, defaultElementId, isOpen]);

  if (!isOpen || !activeProject) return null;

  const calculatedSeverity = calculateSeverity(likelihood, impact);
  const effectiveSeverity = isOverridden ? overriddenSeverity : calculatedSeverity;
  const severityColors = SEVERITY_COLORS[effectiveSeverity];

  const toggleStrideCategory = (cat: StrideCategory) => {
    if (selectedStride.includes(cat)) {
      if (selectedStride.length === 1) return; // Keep at least one
      setSelectedStride(selectedStride.filter((c) => c !== cat));
    } else {
      setSelectedStride([...selectedStride, cat]);
    }
  };

  const toggleElementLink = (elemId: string) => {
    if (selectedElements.includes(elemId)) {
      setSelectedElements(selectedElements.filter((id) => id !== elemId));
    } else {
      setSelectedElements([...selectedElements, elemId]);
    }
  };

  const toggleFlowLink = (flowId: string) => {
    if (selectedFlows.includes(flowId)) {
      setSelectedFlows(selectedFlows.filter((id) => id !== flowId));
    } else {
      setSelectedFlows([...selectedFlows, flowId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Client validation checks
    if (!title.trim() || title.length < 3) {
      setValidationError("Threat title must be at least 3 characters.");
      return;
    }
    if (!scenario.trim() || scenario.length < 10) {
      setValidationError("Threat scenario description must be at least 10 characters.");
      return;
    }
    if (selectedStride.length === 0) {
      setValidationError("Please select at least one applicable STRIDE category.");
      return;
    }
    if (isOverridden && (!severityRationale.trim() || severityRationale.length < 8)) {
      setValidationError("A documented rationale of at least 8 characters is required when overriding the calculated risk score.");
      return;
    }
    if (status === "NOT_APPLICABLE" && (!notApplicableRationale.trim() || notApplicableRationale.length < 6)) {
      setValidationError("A rationale explaining why this threat is Not Applicable is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        threatId: threatId.trim() || undefined,
        title: title.trim(),
        scenario: scenario.trim(),
        strideCategories: selectedStride,
        linkedElementIds: selectedElements,
        linkedFlowIds: selectedFlows,
        preconditions: preconditions.trim() || null,
        confidentialityImpact,
        integrityImpact,
        availabilityImpact,
        privacyImpact,
        businessImpact: businessImpact.trim() || null,
        likelihood,
        impact,
        severity: effectiveSeverity,
        isOverridden,
        severityRationale: isOverridden ? severityRationale.trim() : null,
        existingControls: existingControls.trim() || null,
        controlsStatus,
        mitigation: mitigation.trim() || null,
        owner: owner.trim() || null,
        dueDate: dueDate || null,
        status,
        notApplicableRationale: status === "NOT_APPLICABLE" ? notApplicableRationale.trim() : null,
      };

      const url = threatToEdit
        ? `/api/projects/${activeProject.id}/threats/${threatToEdit.id}`
        : `/api/projects/${activeProject.id}/threats`;
      const method = threatToEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save threat");
      }

      await refreshActiveProject();
      onClose();
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : "Failed to save threat");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {threatToEdit ? `Edit Assessment: ${threatToEdit.threatId}` : "Record STRIDE Threat Assessment"}
              </h2>
              <p className="text-xs text-slate-400">
                Traceable risk scenario, qualitative matrix derivation, and mitigation treatment.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Scrollable Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 text-xs flex-1">
          {validationError && (
            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Identification & Title */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Threat Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g., THR-008 (auto if blank)"
                  value={threatId}
                  onChange={(e) => setThreatId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-slate-400 font-semibold mb-1">
                  Threat Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Insecure JWT Signature Verification on Microservice Gateway"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* STRIDE Category Multi-Select */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Applicable STRIDE Categories * (Select one or more)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {(Object.keys(STRIDE_DEFINITIONS) as StrideCategory[]).map((cat) => {
                  const def = STRIDE_DEFINITIONS[cat];
                  const isChecked = selectedStride.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => toggleStrideCategory(cat)}
                      className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isChecked
                          ? `${def.badgeBg} border-indigo-500/60 shadow-sm`
                          : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm">{def.letter}</span>
                        {isChecked && <CheckCircle className="h-3.5 w-3.5 text-indigo-400" />}
                      </div>
                      <div className="font-semibold text-[11px] mt-1">{def.name}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{def.securityProperty}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scenario & Description */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Threat Scenario / Vulnerability Mechanism *
              </label>
              <textarea
                rows={3}
                placeholder="Explain how an adversary could exploit this condition, attacker motivations, and data paths..."
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Traceability - Linked Elements & Flows */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-3">
            <div className="font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Traceability: Affected Components & Data Flows</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Linked Components */}
              <div>
                <label className="block text-slate-400 text-[11px] font-medium mb-1">
                  Affected Architecture Components
                </label>
                <div className="max-h-32 overflow-y-auto p-2 rounded-lg border border-slate-800 bg-slate-900 space-y-1">
                  {activeProject.elements.map((elem) => (
                    <label
                      key={elem.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800/60 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedElements.includes(elem.id)}
                        onChange={() => toggleElementLink(elem.id)}
                        className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-200 font-medium">{elem.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({elem.type})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Linked Flows */}
              <div>
                <label className="block text-slate-400 text-[11px] font-medium mb-1">
                  Affected Directed Data Flows
                </label>
                <div className="max-h-32 overflow-y-auto p-2 rounded-lg border border-slate-800 bg-slate-900 space-y-1">
                  {activeProject.flows.map((flow) => (
                    <label
                      key={flow.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800/60 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFlows.includes(flow.id)}
                        onChange={() => toggleFlowLink(flow.id)}
                        className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-200 font-medium truncate">{flow.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">({flow.protocol})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Preconditions & Potential Impact Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Preconditions & Technical Assumptions
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Attacker already holds unprivileged tenant access; mTLS is misconfigured on pod ingress..."
                value={preconditions}
                onChange={(e) => setPreconditions(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Business & Operational Impact
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Financial loss, regulatory non-compliance (PCI-DSS), reputational damage..."
                value={businessImpact}
                onChange={(e) => setBusinessImpact(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* CIA + Privacy Impact Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Confidentiality</label>
              <select
                value={confidentialityImpact}
                onChange={(e) => setConfidentialityImpact(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="NONE">None</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Integrity</label>
              <select
                value={integrityImpact}
                onChange={(e) => setIntegrityImpact(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="NONE">None</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Availability</label>
              <select
                value={availabilityImpact}
                onChange={(e) => setAvailabilityImpact(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="NONE">None</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Privacy Impact</label>
              <select
                value={privacyImpact}
                onChange={(e) => setPrivacyImpact(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="NONE">None</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Section 4: Risk Scoring Engine & Overrides */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-xs">
                  Qualitative Risk Scoring (Likelihood x Impact)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Derives Severity priority rating via the 3x3 STRIDE qualitative model.
                </p>
              </div>

              {/* Result Pill */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Resulting Priority:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${severityColors.badge}`}>
                  {effectiveSeverity}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Assessed Likelihood</label>
                <select
                  value={likelihood}
                  onChange={(e) => setLikelihood(e.target.value as Likelihood)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="LOW">Low (Requires exceptional preconditions or specialized access)</option>
                  <option value="MEDIUM">Medium (Plausible under standard network ingress)</option>
                  <option value="HIGH">High (Trivial to execute or automated exploit script exists)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Assessed Impact</label>
                <select
                  value={impact}
                  onChange={(e) => setImpact(e.target.value as Impact)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="LOW">Low (Minor localized disruption, minimal blast radius)</option>
                  <option value="MEDIUM">Medium (Service degradation or limited unauthorized disclosure)</option>
                  <option value="HIGH">High (Critical service outage, full tenant takeover, or data breach)</option>
                </select>
              </div>
            </div>

            {/* Reviewer Override Toggle */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOverridden}
                    onChange={(e) => setIsOverridden(e.target.checked)}
                    disabled={!roleConfig.canOverrideRisk}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-300 font-medium">
                    Authorize Severity Rating Override (Security Lead / Owner)
                  </span>
                </label>
                {!roleConfig.canOverrideRisk && (
                  <span className="text-[10px] text-amber-400">Requires Lead/Owner role</span>
                )}
              </div>

              {isOverridden && (
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-amber-200 font-semibold mb-1">
                        Manual Severity Selection
                      </label>
                      <select
                        value={overriddenSeverity}
                        onChange={(e) => setOverriddenSeverity(e.target.value as Severity)}
                        className="w-full px-2.5 py-1.5 rounded border border-amber-600/40 bg-slate-950 text-amber-200 focus:outline-none"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-amber-200 font-semibold mb-1">
                      Required Override Justification Rationale * (min 8 chars)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Compensatory rate limiting at ingress restricts blast radius to minor..."
                      value={severityRationale}
                      onChange={(e) => setSeverityRationale(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-amber-600/40 bg-slate-950 text-amber-100 placeholder:text-amber-300/40 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Controls, Mitigation & Ownership */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">
                  Existing Security Controls
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cloudflare edge WAF active, TLS 1.3 enforced, Kubernetes network policies"
                  value={existingControls}
                  onChange={(e) => setExistingControls(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Controls Verification Status
                </label>
                <select
                  value={controlsStatus}
                  onChange={(e) => setControlsStatus(e.target.value as ControlsStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="VERIFIED">Verified in Testing / Production</option>
                  <option value="ASSUMED">Assumed / Unverified Control</option>
                  <option value="NONE">No Controls Implemented</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Recommended Mitigation / Countermeasure Strategy
              </label>
              <textarea
                rows={2}
                placeholder="Specific architectural changes, library upgrades, or configuration hardening required..."
                value={mitigation}
                onChange={(e) => setMitigation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Assigned Owner / Team
                </label>
                <input
                  type="text"
                  placeholder="e.g., Carlos Mendez (AppSec)"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Remediation Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Threat Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ThreatStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="OPEN">Open (Requires Remediation)</option>
                  <option value="MITIGATED">Mitigated (Control Verified)</option>
                  <option value="ACCEPTED">Accepted (Business Risk Sign-off)</option>
                  <option value="DEFERRED">Deferred (Roadmap Milestone)</option>
                  <option value="NOT_APPLICABLE">Not Applicable (With Rationale)</option>
                </select>
              </div>
            </div>

            {/* If NOT_APPLICABLE, required rationale */}
            {status === "NOT_APPLICABLE" && (
              <div className="p-3 rounded-lg border border-slate-700 bg-slate-950/80 space-y-1">
                <label className="block text-slate-300 font-semibold">
                  Rationale for Not Applicable Status * (min 6 characters)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Physical hardware threat does not apply to this 100% cloud-hosted platform..."
                  value={notApplicableRationale}
                  onChange={(e) => setNotApplicableRationale(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              * Required fields. Strict validation applied on save.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : threatToEdit ? "Update Threat" : "Create Threat"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

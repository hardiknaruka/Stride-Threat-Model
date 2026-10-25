"use client";

import React, { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";
import { Stakeholder } from "@/lib/types";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Users,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  FileText,
} from "lucide-react";

export function ScopeView() {
  const { activeProject, refreshActiveProject, roleConfig } = useProject();

  const [inScope, setInScope] = useState("");
  const [outOfScope, setOutOfScope] = useState("");
  const [assumptions, setAssumptions] = useState("");
  const [openQuestions, setOpenQuestions] = useState("");
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // New stakeholder form state
  const [newStakeholder, setNewStakeholder] = useState<Stakeholder>({
    name: "",
    role: "",
    email: "",
    team: "",
  });
  const [showAddStakeholder, setShowAddStakeholder] = useState(false);

  useEffect(() => {
    if (activeProject) {
      setInScope(activeProject.inScope || "");
      setOutOfScope(activeProject.outOfScope || "");
      setAssumptions(activeProject.assumptions || "");
      setOpenQuestions(activeProject.openQuestions || "");

      try {
        if (activeProject.stakeholders) {
          const parsed = JSON.parse(activeProject.stakeholders);
          if (Array.isArray(parsed)) {
            setStakeholders(parsed);
          }
        } else {
          setStakeholders([]);
        }
      } catch {
        setStakeholders([]);
      }
    }
  }, [activeProject]);

  const handleSave = async () => {
    if (!activeProject) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/projects/${activeProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inScope,
          outOfScope,
          assumptions,
          openQuestions,
          stakeholders: JSON.stringify(stakeholders),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update project scope");
      }

      await refreshActiveProject();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStakeholder = () => {
    if (!newStakeholder.name.trim() || !newStakeholder.role.trim()) return;
    setStakeholders([...stakeholders, newStakeholder]);
    setNewStakeholder({ name: "", role: "", email: "", team: "" });
    setShowAddStakeholder(false);
  };

  const handleRemoveStakeholder = (index: number) => {
    setStakeholders(stakeholders.filter((_, i) => i !== index));
  };

  if (!activeProject) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Sensitive Data Notice Alert */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-300">
            Mandatory Security Boundary & Sensitive Data Guidelines
          </p>
          <p className="leading-relaxed text-amber-200/90">
            Keep sensitive data out of this workspace. Never enter real production credentials,
            API access tokens, production personal identifiable information (PII), or confidential
            business secrets into scope notes, technical assumptions, or threat scenarios.
          </p>
        </div>
      </div>

      {/* Header and Save Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Study Scope, Assumptions & Context
          </h2>
          <p className="text-xs text-slate-400">
            Define boundaries, system baseline assumptions, unknown questions, and accountable review stakeholders.
          </p>
        </div>

        {roleConfig.canEditScope && (
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Changes saved
              </span>
            )}
            {saveError && (
              <span className="text-xs text-rose-400 font-medium">{saveError}</span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* 2-Column Grid: In Scope vs Out of Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* In Scope */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Target Systems & Components In-Scope</span>
          </div>
          <p className="text-xs text-slate-400">
            List microservices, protocols, authentication boundaries, and data stores assessed in this study.
          </p>
          <textarea
            value={inScope}
            onChange={(e) => setInScope(e.target.value)}
            disabled={!roleConfig.canEditScope}
            rows={7}
            placeholder="• Service A to Service B API gateway calls&#10;• JWT token signing and propagation&#10;• Database persistence"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>

        {/* Out of Scope */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <XCircle className="h-4 w-4" />
            <span>Systems & Boundaries Out-of-Scope</span>
          </div>
          <p className="text-xs text-slate-400">
            Explicitly list items excluded from the threat model to prevent scope ambiguity during audits.
          </p>
          <textarea
            value={outOfScope}
            onChange={(e) => setOutOfScope(e.target.value)}
            disabled={!roleConfig.canEditScope}
            rows={7}
            placeholder="• Physical datacenter security&#10;• Corporate office network&#10;• Cloud provider hypervisor internals"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>
      </div>

      {/* 2-Column Grid: Assumptions & Open Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assumptions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <FileText className="h-4 w-4" />
            <span>Architectural Assumptions & Baseline Controls</span>
          </div>
          <p className="text-xs text-slate-400">
            Document core environmental premises (e.g., mTLS active in cluster, cloud HSM key management).
          </p>
          <textarea
            value={assumptions}
            onChange={(e) => setAssumptions(e.target.value)}
            disabled={!roleConfig.canEditScope}
            rows={6}
            placeholder="• Kubernetes network policies isolate pod namespaces&#10;• TLS 1.3 enforced at edge ingress&#10;• Secrets injected via cloud secret manager"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>

        {/* Open Questions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <HelpCircle className="h-4 w-4" />
            <span>Open Questions & Investigation Items</span>
          </div>
          <p className="text-xs text-slate-400">
            Record unresolved technical questions requiring follow-up with infrastructure or feature teams.
          </p>
          <textarea
            value={openQuestions}
            onChange={(e) => setOpenQuestions(e.target.value)}
            disabled={!roleConfig.canEditScope}
            rows={6}
            placeholder="• Does payment processor support webhook HMAC signature verification?&#10;• Is broker partition key hashed to avoid hot spot DoS?"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>
      </div>

      {/* Stakeholders Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Users className="h-4 w-4" />
            <span>Assigned Study Stakeholders & Reviewers</span>
          </div>
          {roleConfig.canEditScope && (
            <button
              onClick={() => setShowAddStakeholder(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Stakeholder
            </button>
          )}
        </div>

        {showAddStakeholder && (
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-950/80 space-y-3 animate-in fade-in duration-150">
            <div className="text-xs font-semibold text-slate-300">New Stakeholder Record</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Full Name *"
                value={newStakeholder.name}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Role / Title *"
                value={newStakeholder.role}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newStakeholder.email}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, email: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Team / Org"
                value={newStakeholder.team}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, team: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowAddStakeholder(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStakeholder}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium"
              >
                Save Stakeholder
              </button>
            </div>
          </div>
        )}

        {stakeholders.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No stakeholders recorded yet. Add architecture leads, security champions, and engineering owners.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3 font-semibold">Name</th>
                  <th className="py-2 px-3 font-semibold">Role</th>
                  <th className="py-2 px-3 font-semibold">Team</th>
                  <th className="py-2 px-3 font-semibold">Email</th>
                  {roleConfig.canEditScope && <th className="py-2 px-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stakeholders.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/40">
                    <td className="py-2.5 px-3 font-medium text-slate-200">{s.name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{s.role}</td>
                    <td className="py-2.5 px-3 text-slate-400">{s.team || "—"}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{s.email || "—"}</td>
                    {roleConfig.canEditScope && (
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleRemoveStakeholder(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove stakeholder"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

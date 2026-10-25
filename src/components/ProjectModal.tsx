"use client";

import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { X, Server, AlertTriangle } from "lucide-react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const { refreshProjects, setActiveProjectId, themePalette } = useProject();
  const isCorporate = themePalette === "corporate";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [architectureVersion, setArchitectureVersion] = useState("1.0.0");
  const [status, setStatus] = useState("In Assessment");
  const [reviewDate, setReviewDate] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim() || name.length < 2) {
      setValidationError("Project name must be at least 2 characters.");
      return;
    }
    if (!description.trim() || description.length < 5) {
      setValidationError("Please describe the scope/system under assessment (at least 5 characters).");
      return;
    }
    if (!owner.trim() || owner.length < 2) {
      setValidationError("Project owner / study lead is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          owner: owner.trim(),
          environment,
          architectureVersion: architectureVersion.trim() || "1.0.0",
          status,
          reviewDate: reviewDate || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const created = await res.json();
      await refreshProjects();
      setActiveProjectId(created.id);
      onClose();
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-modal rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${
              isCorporate
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-teal-50 border-teal-200 text-teal-700"
            }`}>
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                New Threat Modeling Project
              </h2>
              <p className="text-xs text-slate-500">
                Initialize a microservices STRIDE threat assessment study.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {validationError && (
          <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Project Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Billing & Invoicing Microservices Study"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              System Purpose & Description *
            </label>
            <textarea
              rows={3}
              placeholder="Describe the architectural scope, business purpose, and high-level boundaries..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Study Owner / AppSec Lead *
              </label>
              <input
                type="text"
                placeholder="e.g., Jane Doe (Security Lead)"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Development">Development</option>
                <option value="Multi-Region Cloud">Multi-Region Cloud</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Arch Version
              </label>
              <input
                type="text"
                value={architectureVersion}
                onChange={(e) => setArchitectureVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Study Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="In Assessment">In Assessment</option>
                <option value="Planning">Planning</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Review Target Date
              </label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-lg text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50 ${
                isCorporate
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-teal-700 hover:bg-teal-800"
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

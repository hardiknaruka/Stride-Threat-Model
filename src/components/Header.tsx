"use client";

import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { UserRole, USER_ROLES } from "@/lib/types";
import {
  ShieldAlert,
  ChevronDown,
  Plus,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  Server,
  ExternalLink,
} from "lucide-react";

interface HeaderProps {
  onOpenNewProject: () => void;
}

export function Header({ onOpenNewProject }: HeaderProps) {
  const {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    activeRole,
    setActiveRole,
    reseedDemo,
    isLoading,
  } = useProject();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const role = USER_ROLES[activeRole];

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                STRIDE Studio
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Threat Modeling
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Microservices Security Architecture & Risk Register
            </p>
          </div>
        </div>

        {/* Project Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 hover:bg-slate-800/90 text-sm text-slate-200 transition-colors max-w-xs truncate"
          >
            <Server className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="truncate font-medium">
              {activeProject ? activeProject.name : "Select Project..."}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          {projectDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
              <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Threat Modeling Projects
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProjectId(p.id);
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      p.id === activeProjectId
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {p.threatCount} threats • {p.environment}
                      </div>
                    </div>
                    {p.highOrCriticalCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                        {p.highOrCriticalCount} high
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    setProjectDropdownOpen(false);
                    onOpenNewProject();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Project
                </button>
                <button
                  onClick={async () => {
                    setProjectDropdownOpen(false);
                    await reseedDemo();
                  }}
                  disabled={isLoading}
                  title="Reset or re-seed fictional Commerce demo project"
                  className="flex items-center justify-center p-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right action group: Role Switcher & Security Notice */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sensitive Data Notice Badge */}
          <button
            onClick={() => setShowDisclaimerModal(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            title="Click to view security and sensitive data guidelines"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Local / Demo Prototype</span>
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800/80 text-xs text-slate-200 transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-slate-400">Current Role</div>
                <div className="font-semibold text-xs leading-none">{role.label}</div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
                <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Switch Active Role
                </div>
                <div className="space-y-1 mt-1">
                  {(Object.keys(USER_ROLES) as UserRole[]).map((rKey) => {
                    const r = USER_ROLES[rKey];
                    const isSelected = activeRole === rKey;
                    return (
                      <button
                        key={rKey}
                        onClick={() => {
                          setActiveRole(rKey);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                          isSelected
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        <div className="font-semibold">{r.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {r.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security & Data Handling Modal */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Local / Prototype Mode Notice
                </h3>
                <p className="text-xs text-slate-400">
                  Data Handling & Security Boundaries
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">Zero Real Secrets Policy:</strong>{" "}
                Never enter production credentials, private keys, API secrets, or
                real personal identifiable information (PII) into threat
                scenarios. Always use abstract references (e.g., &ldquo;bearer token&rdquo;, &ldquo;tokenized card ID&rdquo;).
              </p>
              <p>
                <strong className="text-white">Local Prototype Environment:</strong>{" "}
                This instance runs as an offline/local development tool.
                Authentication and RBAC are implemented via role simulation for
                collaborative review rather than production identity federation.
              </p>
              <p>
                <strong className="text-white">OWASP Threat Dragon:</strong>{" "}
                Threat Dragon is the dedicated diagramming tool. This application
                manages the study workflow, component catalog, and risk register,
                providing integration guidance and clean export paths.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDisclaimerModal(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

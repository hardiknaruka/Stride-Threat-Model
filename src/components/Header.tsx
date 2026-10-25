"use client";

import React, { useState } from "react";
import { useProject, ThemePalette } from "@/context/ProjectContext";
import { UserRole, USER_ROLES } from "@/lib/types";
import {
  ShieldAlert,
  ChevronDown,
  Plus,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  Server,
  Palette,
  Check,
  Moon,
  Sun,
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
    themePalette,
    setThemePalette,
    themeMode,
    setThemeMode,
  } = useProject();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [paletteDropdownOpen, setPaletteDropdownOpen] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const role = USER_ROLES[activeRole];

  const isCorporate = themePalette === "corporate";

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-white/80 bg-white/75 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl p-0.5 shadow-sm flex items-center justify-center ${
              isCorporate
                ? "bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500"
                : "bg-gradient-to-tr from-teal-700 via-teal-600 to-cyan-500"
            }`}
          >
            <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center">
              <ShieldAlert
                className={`h-5 w-5 ${isCorporate ? "text-blue-700" : "text-teal-700"}`}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                STRIDE Studio
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full border ${
                  isCorporate
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-teal-50 text-teal-700 border-teal-200"
                }`}
              >
                Threat Modeling
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">
              Microservices Security Architecture & Risk Register
            </p>
          </div>
        </div>

        {/* Project Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/80 bg-white/80 hover:bg-white text-sm text-slate-800 transition-all max-w-xs truncate shadow-2xs font-medium backdrop-blur-sm"
          >
            <Server className={`h-4 w-4 shrink-0 ${isCorporate ? "text-blue-600" : "text-teal-600"}`} />
            <span className="truncate">
              {activeProject ? activeProject.name : "Select Project..."}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          </button>

          {projectDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl border border-white/90 bg-white/90 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in duration-100">
              <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
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
                        ? isCorporate
                          ? "bg-blue-50 text-blue-800 border border-blue-200 font-semibold"
                          : "bg-teal-50 text-teal-800 border border-teal-200 font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {p.threatCount} threats • {p.environment}
                      </div>
                    </div>
                    {p.highOrCriticalCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                        {p.highOrCriticalCount} high
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    setProjectDropdownOpen(false);
                    onOpenNewProject();
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-colors ${
                    isCorporate ? "bg-blue-700 hover:bg-blue-800" : "bg-teal-700 hover:bg-teal-800"
                  }`}
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
                  className="flex items-center justify-center p-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right action group: Theme Toggle, Palette Switcher, Security Notice & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Theme Mode Toggle */}
          <button
            onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-2xs backdrop-blur-sm"
            title={`Switch to ${themeMode === "dark" ? "Light Mode" : "Dark Mode"}`}
          >
            {themeMode === "dark" ? (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden sm:inline">Light</span>
              </>
            )}
          </button>

          {/* Color Palette Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPaletteDropdownOpen(!paletteDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/80 bg-white/80 hover:bg-white text-xs font-semibold text-slate-700 transition-all shadow-2xs backdrop-blur-sm"
              title="Switch light color palette"
            >
              <Palette className={`h-3.5 w-3.5 ${isCorporate ? "text-blue-600" : "text-teal-600"}`} />
              <span className="hidden md:inline">
                {isCorporate ? "Corporate Blue" : "Modern Teal"}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {paletteDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/90 bg-white/90 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in duration-100">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Select Color Palette
                </div>
                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => {
                      setThemePalette("corporate");
                      setPaletteDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isCorporate
                        ? "bg-blue-50 text-blue-800 font-bold border border-blue-200"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-blue-600 border border-blue-700" />
                      <div>
                        <div>Corporate Royal</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          Executive Blue & Emerald
                        </div>
                      </div>
                    </div>
                    {isCorporate && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setThemePalette("tech");
                      setPaletteDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      !isCorporate
                        ? "bg-teal-50 text-teal-800 font-bold border border-teal-200"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-teal-600 border border-teal-700" />
                      <div>
                        <div>Modern Teal</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          Deep Teal & Violet
                        </div>
                      </div>
                    </div>
                    {!isCorporate && <Check className="h-3.5 w-3.5 text-teal-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sensitive Data Notice Badge */}
          <button
            onClick={() => setShowDisclaimerModal(true)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
            title="Click to view security and sensitive data guidelines"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>Local / Demo Prototype</span>
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/80 bg-white/80 hover:bg-white text-xs text-slate-800 transition-all shadow-2xs font-medium backdrop-blur-sm"
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <div className="text-left hidden sm:block">
                <div className="text-[10px] text-slate-500 font-normal">Active Role</div>
                <div className="font-bold text-xs leading-none text-slate-900">{role.label}</div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/90 bg-white/90 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in duration-100">
                <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
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
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="font-bold text-slate-900">{r.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full glass-modal border border-white/95 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Local / Prototype Mode Notice
                </h3>
                <p className="text-xs text-slate-500">
                  Data Handling & Security Boundaries
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-900">Zero Real Secrets Policy:</strong>{" "}
                Never enter production credentials, private keys, API secrets, or
                real personal identifiable information (PII) into threat scenarios. Always use abstract references (e.g., &ldquo;bearer token&rdquo;, &ldquo;tokenized card ID&rdquo;).
              </p>
              <p>
                <strong className="text-slate-900">Connected Database:</strong>{" "}
                Data is stored in your MongoDB Atlas cluster (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">stride_threat_model</code>).
              </p>
              <p>
                <strong className="text-slate-900">OWASP Threat Dragon:</strong>{" "}
                Threat Dragon is the dedicated diagramming tool. This workspace manages the study workflow, component catalog, and risk register.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDisclaimerModal(false)}
                className={`px-4 py-2 rounded-lg text-white text-xs font-bold transition-colors ${
                  isCorporate ? "bg-blue-700 hover:bg-blue-800" : "bg-teal-700 hover:bg-teal-800"
                }`}
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

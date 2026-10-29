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
  Trash2,
  Menu,
  X,
} from "lucide-react";
import { DeleteProjectModal } from "@/components/DeleteProjectModal";
import { ProjectSummary } from "@/context/ProjectContext";

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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [paletteDropdownOpen, setPaletteDropdownOpen] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectSummary | null>(null);

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

        {/* Desktop Project Switcher Dropdown */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-sm text-slate-800 dark:text-slate-100 transition-all max-w-xs truncate shadow-2xs font-medium backdrop-blur-sm"
          >
            <Server className={`h-4 w-4 shrink-0 ${isCorporate ? "text-blue-600 dark:text-blue-400" : "text-teal-600 dark:text-teal-400"}`} />
            <span className="truncate">
              {activeProject ? activeProject.name : "Select Project..."}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          </button>

          {projectDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl border border-white/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in duration-100">
              <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Threat Modeling Projects
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className={`w-full group rounded-lg text-xs transition-colors flex items-center justify-between p-1.5 ${
                      p.id === activeProjectId
                        ? isCorporate
                          ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-semibold"
                          : "bg-teal-50/80 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveProjectId(p.id);
                        setProjectDropdownOpen(false);
                      }}
                      className="flex-1 text-left truncate px-1.5 py-1"
                    >
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                        {p.threatCount} threats • {p.environment}
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {p.highOrCriticalCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shrink-0">
                          {p.highOrCriticalCount} high
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectDropdownOpen(false);
                          setProjectToDelete(p);
                        }}
                        title={`Delete project "${p.name}"`}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
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
                  className="flex items-center justify-center p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Right Action Group */}
        <div className="hidden lg:flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Theme Mode Toggle */}
          <button
            onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-2xs backdrop-blur-sm"
            title={`Switch to ${themeMode === "dark" ? "Light Mode" : "Dark Mode"}`}
          >
            {themeMode === "dark" ? (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Light</span>
              </>
            )}
          </button>

          {/* Color Palette Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPaletteDropdownOpen(!paletteDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-2xs backdrop-blur-sm"
              title="Switch light color palette"
            >
              <Palette className={`h-3.5 w-3.5 ${isCorporate ? "text-blue-600 dark:text-blue-400" : "text-teal-600 dark:text-teal-400"}`} />
              <span>{isCorporate ? "Corporate Blue" : "Modern Teal"}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {paletteDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in duration-100">
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
                        ? "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
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
                        ? "bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
            title="Click to view security and sensitive data guidelines"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Local / Demo Prototype</span>
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-xs text-slate-800 dark:text-slate-100 transition-all shadow-2xs font-medium backdrop-blur-sm"
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <div className="text-left">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Active Role</div>
                <div className="font-bold text-xs leading-none text-slate-900 dark:text-white">{role.label}</div>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/90 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-2 shadow-2xl z-50 animate-in fade-in duration-100">
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
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="font-bold text-slate-900 dark:text-white">{r.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
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

        {/* Mobile Header Action Group (< lg) */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
          {/* Mobile Theme Toggle */}
          <button
            onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border border-white/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all shadow-2xs backdrop-blur-sm"
            title={`Switch to ${themeMode === "dark" ? "Light Mode" : "Dark Mode"}`}
            aria-label="Toggle dark/light theme"
          >
            {themeMode === "dark" ? (
              <Moon className="h-4 w-4 text-indigo-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all shadow-2xs backdrop-blur-sm font-semibold text-xs"
            aria-label="Toggle workspace navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4 text-rose-500" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
            <span className="hidden xs:inline">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation & Settings Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/80 dark:border-white/10 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-2xl px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          {/* Active Project Switcher Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-blue-600" />
                Active Project
              </span>
              <span className="text-[11px] font-normal normal-case text-slate-400">
                {projects.length} available
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className={`w-full group rounded-lg text-xs transition-colors flex items-center justify-between p-2 border ${
                    p.id === activeProjectId
                      ? isCorporate
                        ? "bg-blue-50/90 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-bold"
                        : "bg-teal-50/90 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800 font-bold"
                      : "bg-white/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <button
                    onClick={() => {
                      setActiveProjectId(p.id);
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 text-left truncate mr-2"
                  >
                    <div className="truncate font-semibold">{p.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      {p.threatCount} threats • {p.environment}
                    </div>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    {p.highOrCriticalCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shrink-0">
                        {p.highOrCriticalCount} high
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(p);
                      }}
                      title={`Delete project "${p.name}"`}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenNewProject();
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-white shadow-xs ${
                  isCorporate ? "bg-blue-700 hover:bg-blue-800" : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                New Project
              </button>
              <button
                onClick={async () => {
                  await reseedDemo();
                  setMobileMenuOpen(false);
                }}
                disabled={isLoading}
                title="Reset or re-seed fictional Commerce demo project"
                className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>

          {/* Active Role Selector Section */}
          <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              Active Role: <span className="text-slate-900 dark:text-white font-bold">{role.label}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(USER_ROLES) as UserRole[]).map((rKey) => {
                const r = USER_ROLES[rKey];
                const isSelected = activeRole === rKey;
                return (
                  <button
                    key={rKey}
                    onClick={() => setActiveRole(rKey)}
                    className={`p-2 rounded-lg text-left text-xs transition-colors border ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-bold"
                        : "bg-white/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{r.label}</span>
                      {isSelected && <Check className="h-3 w-3 text-emerald-600" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5">
                      {r.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Palette & Disclaimer in Mobile */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Palette:</span>
              <button
                onClick={() => setThemePalette("corporate")}
                className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${
                  isCorporate
                    ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300"
                    : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}
              >
                Corporate Blue
              </button>
              <button
                onClick={() => setThemePalette("tech")}
                className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${
                  !isCorporate
                    ? "bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/50 dark:text-teal-300"
                    : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}
              >
                Modern Teal
              </button>
            </div>

            <button
              onClick={() => {
                setShowDisclaimerModal(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            >
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              <span>Data Guidelines</span>
            </button>
          </div>
        </div>
      )}

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

      {/* Project Deletion Confirmation Modal */}
      <DeleteProjectModal
        isOpen={!!projectToDelete}
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
      />
    </header>
  );
}

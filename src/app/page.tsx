"use client";

import React, { useState } from "react";
import { ProjectProvider, useProject, ThreatData } from "@/context/ProjectContext";
import { Header } from "@/components/Header";
import { NavigationTabs } from "@/components/NavigationTabs";
import { DashboardView } from "@/components/DashboardView";
import { ScopeView } from "@/components/ScopeView";
import { ArchitectureView } from "@/components/ArchitectureView";
import { ThreatRegisterView } from "@/components/ThreatRegisterView";
import { ReviewSummaryView } from "@/components/ReviewSummaryView";
import { SettingsView } from "@/components/SettingsView";
import { ThreatModal } from "@/components/ThreatModal";
import { ProjectModal } from "@/components/ProjectModal";
import { StrideCategory, Severity } from "@/lib/types";
import { ShieldAlert, Plus, Sparkles, RotateCcw } from "lucide-react";

function MainAppContent() {
  const {
    activeProject,
    activeTab,
    setActiveTab,
    isLoading,
    reseedDemo,
  } = useProject();

  // Modals state
  const [isThreatModalOpen, setIsThreatModalOpen] = useState(false);
  const [threatToEdit, setThreatToEdit] = useState<ThreatData | null>(null);
  const [defaultElementId, setDefaultElementId] = useState<string | undefined>();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Cross-view filters for threat register
  const [threatFilters, setThreatFilters] = useState<{
    stride?: StrideCategory;
    severity?: Severity;
    status?: string;
  }>({});

  const handleOpenNewThreat = (elementId?: string) => {
    setThreatToEdit(null);
    setDefaultElementId(elementId);
    setIsThreatModalOpen(true);
  };

  const handleEditThreat = (threat: ThreatData) => {
    setThreatToEdit(threat);
    setDefaultElementId(undefined);
    setIsThreatModalOpen(true);
  };

  const handleFilterThreatsFromDashboard = (filters: {
    stride?: StrideCategory;
    severity?: Severity;
    status?: string;
  }) => {
    setThreatFilters(filters);
    setActiveTab("threats");
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900">
      <Header onOpenNewProject={() => setIsProjectModalOpen(true)} />
      <NavigationTabs />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
              <ShieldAlert className="h-6 w-6 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              Loading Threat Modeling Workspace...
            </p>
          </div>
        ) : !activeProject ? (
          /* Empty State when no projects exist */
          <div className="max-w-lg mx-auto py-16 text-center space-y-6 bg-white p-8 rounded-xl border border-slate-200 shadow-xs">
            <div className="h-14 w-14 mx-auto rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Welcome to STRIDE Studio
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                No threat modeling projects found in your local workspace. You can seed the fictional
                Commerce Microservices sample to explore right away, or initialize a clean project.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={reseedDemo}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Seed Fictional Demo Project
              </button>
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Empty Project
              </button>
            </div>
          </div>
        ) : (
          /* Active Project Tab Content */
          <>
            {activeTab === "dashboard" && (
              <DashboardView
                onOpenNewThreat={() => handleOpenNewThreat()}
                onFilterThreats={handleFilterThreatsFromDashboard}
              />
            )}

            {activeTab === "scope" && <ScopeView />}

            {activeTab === "architecture" && (
              <ArchitectureView
                onOpenNewThreatForElement={(elemId) => handleOpenNewThreat(elemId)}
              />
            )}

            {activeTab === "threats" && (
              <ThreatRegisterView
                onOpenNewThreat={() => handleOpenNewThreat()}
                onEditThreat={handleEditThreat}
                initialFilters={threatFilters}
              />
            )}

            {activeTab === "review" && <ReviewSummaryView />}

            {activeTab === "methodology" && <SettingsView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-white/80 bg-white/70 backdrop-blur-xl py-4 text-center text-[11px] text-slate-500 font-medium shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>STRIDE Threat Modeling Workspace • Connected to MongoDB Atlas</span>
          <span>Zero Secrets Policy: Keep sensitive credentials out of threat records</span>
        </div>
      </footer>

      {/* Global Threat Create / Edit Modal */}
      <ThreatModal
        isOpen={isThreatModalOpen}
        onClose={() => setIsThreatModalOpen(false)}
        threatToEdit={threatToEdit}
        defaultElementId={defaultElementId}
      />

      {/* Global Project Create Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <ProjectProvider>
      <MainAppContent />
    </ProjectProvider>
  );
}

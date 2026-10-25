"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserRole, USER_ROLES } from "@/lib/types";

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: string;
  architectureVersion: string;
  environment: string;
  reviewDate: string | null;
  createdAt: string;
  updatedAt: string;
  elementCount: number;
  flowCount: number;
  threatCount: number;
  highOrCriticalCount: number;
  openThreatsCount: number;
  mitigatedCount: number;
}

export interface ArchitectureElementData {
  id: string;
  projectId: string;
  name: string;
  type: "EXTERNAL_ENTITY" | "PROCESS" | "DATA_STORE" | "TRUST_BOUNDARY";
  description: string | null;
  technology: string | null;
  trustZone: string | null;
  posX: number;
  posY: number;
  threatLinks?: { threatId: string }[];
}

export interface DataFlowData {
  id: string;
  projectId: string;
  name: string;
  sourceElementId: string;
  targetElementId: string;
  protocol: string;
  dataCategory: string | null;
  authContext: string | null;
  crossesTrustBoundary: boolean;
  notes: string | null;
  sourceElement: { id: string; name: string; type: string };
  targetElement: { id: string; name: string; type: string };
  threatLinks?: { threatId: string }[];
}

export interface ThreatData {
  id: string;
  projectId: string;
  threatId: string;
  title: string;
  scenario: string;
  strideCategories: string; // JSON array
  preconditions: string | null;
  confidentialityImpact: string | null;
  integrityImpact: string | null;
  availabilityImpact: string | null;
  privacyImpact: string | null;
  businessImpact: string | null;
  likelihood: "LOW" | "MEDIUM" | "HIGH";
  impact: "LOW" | "MEDIUM" | "HIGH";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  severityRationale: string | null;
  isOverridden: boolean;
  existingControls: string | null;
  controlsStatus: "VERIFIED" | "ASSUMED" | "NONE";
  mitigation: string | null;
  owner: string | null;
  dueDate: string | null;
  status: "OPEN" | "ACCEPTED" | "MITIGATED" | "DEFERRED" | "NOT_APPLICABLE";
  notApplicableRationale: string | null;
  createdAt: string;
  updatedAt: string;
  linkedElements: { element: { id: string; name: string; type: string } }[];
  linkedFlows: { flow: { id: string; name: string; protocol: string } }[];
}

export interface FullProjectData extends ProjectSummary {
  inScope: string | null;
  outOfScope: string | null;
  assumptions: string | null;
  openQuestions: string | null;
  stakeholders: string | null;
  elements: ArchitectureElementData[];
  flows: DataFlowData[];
  threats: ThreatData[];
}

interface ProjectContextValue {
  projects: ProjectSummary[];
  activeProject: FullProjectData | null;
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  refreshProjects: () => Promise<void>;
  refreshActiveProject: () => Promise<void>;
  reseedDemo: () => Promise<void>;
  roleConfig: typeof USER_ROLES[UserRole];
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<FullProjectData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>("SECURITY_LEAD");
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const refreshProjects = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      const data: ProjectSummary[] = await res.json();
      setProjects(data);

      if (data.length > 0) {
        if (!activeProjectId || !data.some((p) => p.id === activeProjectId)) {
          setActiveProjectId(data[0].id);
        }
      } else {
        setActiveProjectId(null);
        setActiveProject(null);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, [activeProjectId]);

  const refreshActiveProject = useCallback(async () => {
    if (!activeProjectId) {
      setActiveProject(null);
      return;
    }
    try {
      const res = await fetch(`/api/projects/${activeProjectId}`);
      if (!res.ok) throw new Error("Failed to load active project");
      const data: FullProjectData = await res.json();
      setActiveProject(data);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to fetch project details");
    }
  }, [activeProjectId]);

  const reseedDemo = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/seed", { method: "POST" });
      if (!res.ok) throw new Error("Failed to reseed database");
      const result = await res.json();
      await refreshProjects();
      if (result.project?.id) {
        setActiveProjectId(result.project.id);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to reseed demo project");
    } finally {
      setIsLoading(false);
    }
  }, [refreshProjects]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    if (activeProjectId) {
      refreshActiveProject();
    }
  }, [activeProjectId, refreshActiveProject]);

  const roleConfig = USER_ROLES[activeRole];

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeProjectId,
        setActiveProjectId,
        isLoading,
        error,
        activeRole,
        setActiveRole,
        activeTab,
        setActiveTab,
        refreshProjects,
        refreshActiveProject,
        reseedDemo,
        roleConfig,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

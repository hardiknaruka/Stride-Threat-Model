"use client";

import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

interface DeleteProjectModalProps {
  project: {
    id: string;
    name: string;
    threatCount?: number;
    elementCount?: number;
    flowCount?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteProjectModal({
  project,
  isOpen,
  onClose,
  onSuccess,
}: DeleteProjectModalProps) {
  const { deleteProject } = useProject();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const result = await deleteProject(project.id);
    if (result.success) {
      setIsDeleting(false);
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError(result.error || "Failed to delete project");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-modal rounded-2xl shadow-2xl p-6 space-y-4 border border-rose-500/20">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-rose-500/15 border border-rose-500/30 text-rose-500 shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Threat Model Project
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Permanent deletion confirmation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-500/30 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Warning: This action is irreversible</span>
            </div>
            <p className="text-rose-700 dark:text-rose-300/90 leading-relaxed text-[11px]">
              You are about to delete <span className="font-bold underline">{project.name}</span>.
              All associated microservice architecture elements, data flow diagrams, STRIDE threat register items, and audit records will be permanently erased.
            </p>
          </div>

          {(project.threatCount !== undefined ||
            project.elementCount !== undefined ||
            project.flowCount !== undefined) && (
            <div className="p-3 rounded-lg stride-box border text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-800 dark:text-slate-100 block">
                Resources that will be deleted:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {project.threatCount !== undefined && (
                  <li>{project.threatCount} STRIDE Threat Scenarios</li>
                )}
                {project.elementCount !== undefined && (
                  <li>{project.elementCount} Microservice Architecture Elements</li>
                )}
                {project.flowCount !== undefined && (
                  <li>{project.flowCount} Communication Data Flows</li>
                )}
              </ul>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700 shadow-xs transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting Project...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Yes, Delete Project
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

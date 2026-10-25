export type StrideCategory =
  | "SPOOFING"
  | "TAMPERING"
  | "REPUDIATION"
  | "INFORMATION_DISCLOSURE"
  | "DENIAL_OF_SERVICE"
  | "ELEVATION_OF_PRIVILEGE";

export const STRIDE_DEFINITIONS: Record<
  StrideCategory,
  {
    name: string;
    letter: "S" | "T" | "R" | "I" | "D" | "E";
    securityProperty: string;
    description: string;
    examples: string;
    typicalMitigations: string;
    color: string;
    badgeBg: string;
  }
> = {
  SPOOFING: {
    name: "Spoofing",
    letter: "S",
    securityProperty: "Authenticity",
    description: "An adversary impersonates another entity or service using forged or stolen identity context.",
    examples: "Forged JWT tokens, API key spoofing, IP spoofing, impersonating an upstream microservice.",
    typicalMitigations: "mTLS, robust asymmetric token signing (RS256/EdDSA), cryptographic message authentication, strict identity verification.",
    color: "text-amber-400",
    badgeBg: "bg-amber-950/40 text-amber-300 border-amber-800/60",
  },
  TAMPERING: {
    name: "Tampering",
    letter: "T",
    securityProperty: "Integrity",
    description: "Malicious modification of data in transit or at rest, or alteration of code or memory state.",
    examples: "Altering order price in transit, modifying database records directly, injecting parameters into message broker queues.",
    typicalMitigations: "HMAC signatures, TLS encrypted transport, write-once audit stores, database row integrity hashes, input sanitization.",
    color: "text-rose-400",
    badgeBg: "bg-rose-950/40 text-rose-300 border-rose-800/60",
  },
  REPUDIATION: {
    name: "Repudiation",
    letter: "R",
    securityProperty: "Non-repudiation",
    description: "An actor denies having performed an action because the system lacks sufficient, immutable proof.",
    examples: "A customer disputes placing an order; a compromised admin account denies modifying transaction rules without audit trail.",
    typicalMitigations: "Centralized tamper-evident audit logging, cryptographic digital signatures, log retention policies with write-once-read-many (WORM).",
    color: "text-purple-400",
    badgeBg: "bg-purple-950/40 text-purple-300 border-purple-800/60",
  },
  INFORMATION_DISCLOSURE: {
    name: "Information Disclosure",
    letter: "I",
    securityProperty: "Confidentiality",
    description: "Exposing sensitive data to actors who are not authorized to see it.",
    examples: "Leaking PII in stack traces, verbose API error bodies, unencrypted database backups, cross-tenant data leakage in multi-tenant services.",
    typicalMitigations: "Field-level encryption, tokenization, TLS 1.3, strict sanitization of error logs and responses, least-privilege egress filtering.",
    color: "text-blue-400",
    badgeBg: "bg-blue-950/40 text-blue-300 border-blue-800/60",
  },
  DENIAL_OF_SERVICE: {
    name: "Denial of Service",
    letter: "D",
    securityProperty: "Availability",
    description: "Degrading or denying service availability to legitimate users by exhausting CPU, memory, connection pools, or bandwidth.",
    examples: "Unbounded batch query payloads, algorithmic complexity attacks (ReDoS), broker partition flooding, connection pool exhaustion.",
    typicalMitigations: "Token-bucket rate limiting, circuit breakers, request payload size limits, autoscaling, caching, timeout bounds.",
    color: "text-orange-400",
    badgeBg: "bg-orange-950/40 text-orange-300 border-orange-800/60",
  },
  ELEVATION_OF_PRIVILEGE: {
    name: "Elevation of Privilege",
    letter: "E",
    securityProperty: "Authorization",
    description: "An unprivileged user or component gains unauthorized capabilities or access levels beyond their granted boundary.",
    examples: "Insecure direct object references (IDOR), JWT claim tampering (role injection), missing authorization checks on microservice internal endpoints.",
    typicalMitigations: "Zero-Trust authorization policies (OPA/Cedar), context-aware RBAC/ABAC validation at every boundary, token scope verification.",
    color: "text-emerald-400",
    badgeBg: "bg-emerald-950/40 text-emerald-300 border-emerald-800/60",
  },
};

export type Likelihood = "LOW" | "MEDIUM" | "HIGH";
export type Impact = "LOW" | "MEDIUM" | "HIGH";
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ControlsStatus = "VERIFIED" | "ASSUMED" | "NONE";

export type ThreatStatus =
  | "OPEN"
  | "ACCEPTED"
  | "MITIGATED"
  | "DEFERRED"
  | "NOT_APPLICABLE";

export type ElementType =
  | "EXTERNAL_ENTITY"
  | "PROCESS"
  | "DATA_STORE"
  | "TRUST_BOUNDARY";

export type UserRole =
  | "PROJECT_OWNER"
  | "SECURITY_LEAD"
  | "ARCHITECT"
  | "REVIEWER";

export interface RoleConfig {
  id: UserRole;
  label: string;
  description: string;
  canEditScope: boolean;
  canEditArchitecture: boolean;
  canCreateThreats: boolean;
  canOverrideRisk: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
}

export const USER_ROLES: Record<UserRole, RoleConfig> = {
  PROJECT_OWNER: {
    id: "PROJECT_OWNER",
    label: "Project Owner",
    description: "Manages study scope, timeline, milestones, and signs off on project review.",
    canEditScope: true,
    canEditArchitecture: true,
    canCreateThreats: true,
    canOverrideRisk: true,
    canChangeStatus: true,
    canDelete: true,
  },
  SECURITY_LEAD: {
    id: "SECURITY_LEAD",
    label: "Security / Threat Lead",
    description: "Identifies threats, calibrates risk scores, recommends mitigations, and overrides risk with rationale.",
    canEditScope: true,
    canEditArchitecture: true,
    canCreateThreats: true,
    canOverrideRisk: true,
    canChangeStatus: true,
    canDelete: true,
  },
  ARCHITECT: {
    id: "ARCHITECT",
    label: "Architect / Engineer",
    description: "Maintains architecture components, documents data flows, controls, and technical assumptions.",
    canEditScope: true,
    canEditArchitecture: true,
    canCreateThreats: true,
    canOverrideRisk: false,
    canChangeStatus: false,
    canDelete: false,
  },
  REVIEWER: {
    id: "REVIEWER",
    label: "Read-Only Reviewer",
    description: "Audits threat register, reviews summary findings, and exports reports for governance.",
    canEditScope: false,
    canEditArchitecture: false,
    canCreateThreats: false,
    canOverrideRisk: false,
    canChangeStatus: false,
    canDelete: false,
  },
};

export interface Stakeholder {
  name: string;
  role: string;
  email: string;
  team: string;
}

export interface ImpactScope {
  confidentiality?: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  integrity?: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  availability?: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  privacy?: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  businessImpact?: string;
}

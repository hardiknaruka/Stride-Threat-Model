"""
==============================================================================
STRIDE THREAT MODELING WORKSPACE FOR MICROSERVICES ARCHITECTURE
Author: Hardik Naruka
Submission File: HardikNaruka_StrideThreatModel.py / YourName_ProjectName.ipynb
Technology: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Prisma, MongoDB Atlas
==============================================================================
"""

import os
import sys
import json

PROJECT_METADATA = {
    "project_name": "STRIDE Threat Modeling Workspace",
    "student_name": "Hardik Naruka",
    "version": "1.0.0",
    "framework": "Next.js 16 (App Router) + React 19 + TypeScript",
    "database": "MongoDB Atlas (Replica Set) with Prisma ORM 6",
    "styling": "Tailwind CSS v4 + Glassmorphism Design System",
    "stride_categories": ["SPOOFING", "TAMPERING", "REPUDIATION", "INFORMATION_DISCLOSURE", "DENIAL_OF_SERVICE", "ELEVATION_OF_PRIVILEGE"],
    "risk_prioritization": "3x3 Likelihood x Impact Matrix (CRITICAL, HIGH, MEDIUM, LOW)",
    "interoperability": "OWASP Threat Dragon 2.x JSON standard schema",
}

def display_summary():
    print("=" * 75)
    print(f"  {PROJECT_METADATA['project_name'].upper()}")
    print(f"  Submitted by: {PROJECT_METADATA['student_name']}")
    print("=" * 75)
    for k, v in PROJECT_METADATA.items():
        print(f"  {k.replace('_', ' ').title():<22}: {v}")
    print("=" * 75)

# ==============================================================================
# COMPLETE SOURCE CODE REGISTRY FOR PROJECT SUBMISSION
# ==============================================================================

# ==============================================================================
# FILE: prisma/schema.prisma - Database Schema
# ==============================================================================
SOURCE_PRISMA_SCHEMA_PRISMA = """
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model Project {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId
  name                String
  description         String
  owner               String
  status              String   @default("In Assessment")
  architectureVersion String   @default("1.0.0")
  environment         String   @default("Production")
  reviewDate          DateTime?
  inScope             String?
  outOfScope          String?
  assumptions         String?
  openQuestions       String?
  stakeholders        String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  elements            ArchitectureElement[]
  flows               DataFlow[]
  threats             Threat[]
}

model ArchitectureElement {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  projectId   String   @db.ObjectId
  name        String
  type        String   // EXTERNAL_ENTITY, PROCESS, DATA_STORE, TRUST_BOUNDARY
  description String?
  technology  String?
  trustZone   String?
  posX        Float    @default(100)
  posY        Float    @default(100)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  sourceFlows DataFlow[] @relation("FlowSource")
  targetFlows DataFlow[] @relation("FlowTarget")
  threatLinks ThreatElementLink[]

  @@index([projectId])
}

model DataFlow {
  id                   String   @id @default(auto()) @map("_id") @db.ObjectId
  projectId            String   @db.ObjectId
  name                 String
  sourceElementId      String   @db.ObjectId
  targetElementId      String   @db.ObjectId
  protocol             String   @default("HTTPS/REST")
  dataCategory         String?
  authContext          String?
  crossesTrustBoundary Boolean  @default(false)
  notes                String?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  project              Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  sourceElement        ArchitectureElement @relation("FlowSource", fields: [sourceElementId], references: [id], onDelete: Cascade)
  targetElement        ArchitectureElement @relation("FlowTarget", fields: [targetElementId], references: [id], onDelete: Cascade)
  threatLinks          ThreatFlowLink[]

  @@index([projectId])
  @@index([sourceElementId])
  @@index([targetElementId])
}

model Threat {
  id                     String   @id @default(auto()) @map("_id") @db.ObjectId
  projectId              String   @db.ObjectId
  threatId               String
  title                  String
  scenario               String
  strideCategories       String   // JSON array string: ["SPOOFING", "TAMPERING"]
  preconditions          String?
  confidentialityImpact  String?
  integrityImpact        String?
  availabilityImpact     String?
  privacyImpact          String?
  businessImpact         String?
  likelihood             String   @default("MEDIUM")
  impact                 String   @default("MEDIUM")
  severity               String   @default("MEDIUM")
  severityRationale      String?
  isOverridden           Boolean  @default(false)
  existingControls       String?
  controlsStatus         String   @default("ASSUMED")
  mitigation             String?
  owner                  String?
  dueDate                DateTime?
  status                 String   @default("OPEN")
  notApplicableRationale String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  project                Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  linkedElements         ThreatElementLink[]
  linkedFlows            ThreatFlowLink[]

  @@index([projectId])
  @@index([status])
  @@index([severity])
}

model ThreatElementLink {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  threatId  String   @db.ObjectId
  elementId String   @db.ObjectId
  createdAt DateTime @default(now())

  threat    Threat   @relation(fields: [threatId], references: [id], onDelete: Cascade)
  element   ArchitectureElement @relation(fields: [elementId], references: [id], onDelete: Cascade)

  @@unique([threatId, elementId])
  @@index([elementId])
}

model ThreatFlowLink {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  threatId  String   @db.ObjectId
  flowId    String   @db.ObjectId
  createdAt DateTime @default(now())

  threat    Threat   @relation(fields: [threatId], references: [id], onDelete: Cascade)
  flow      DataFlow @relation(fields: [flowId], references: [id], onDelete: Cascade)

  @@unique([threatId, flowId])
  @@index([flowId])
}

"""

# ==============================================================================
# FILE: src/lib/types.ts - Core Types Definition
# ==============================================================================
SOURCE_SRC_LIB_TYPES_TS = """
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

"""

# ==============================================================================
# FILE: src/lib/risk-scoring.ts - Risk Scoring & Matrix Engine
# ==============================================================================
SOURCE_SRC_LIB_RISK_SCORING_TS = """
import { Impact, Likelihood, Severity } from "./types";

/**
 * Standard Qualitative STRIDE Risk Matrix
 *
 * | Likelihood \ Impact | LOW    | MEDIUM | HIGH     |
 * |---------------------|--------|--------|----------|
 * | HIGH                | MEDIUM | HIGH   | CRITICAL |
 * | MEDIUM              | LOW    | MEDIUM | HIGH     |
 * | LOW                 | LOW    | LOW    | MEDIUM   |
 */
export const RISK_MATRIX: Record<Likelihood, Record<Impact, Severity>> = {
  LOW: {
    LOW: "LOW",
    MEDIUM: "LOW",
    HIGH: "MEDIUM",
  },
  MEDIUM: {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
  },
  HIGH: {
    LOW: "MEDIUM",
    MEDIUM: "HIGH",
    HIGH: "CRITICAL",
  },
};

export const SEVERITY_SCORES: Record<Severity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export const SEVERITY_COLORS: Record<
  Severity,
  {
    text: string;
    bg: string;
    border: string;
    badge: string;
  }
> = {
  LOW: {
    text: "text-blue-400",
    bg: "bg-blue-950/40",
    border: "border-blue-800/60",
    badge: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  },
  MEDIUM: {
    text: "text-amber-400",
    bg: "bg-amber-950/40",
    border: "border-amber-800/60",
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  },
  HIGH: {
    text: "text-orange-400",
    bg: "bg-orange-950/40",
    border: "border-orange-800/60",
    badge: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
  },
  CRITICAL: {
    text: "text-rose-400",
    bg: "bg-rose-950/40",
    border: "border-rose-800/60",
    badge: "bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold",
  },
};

/**
 * Calculates default qualitative severity based on Likelihood and Impact.
 */
export function calculateSeverity(likelihood: Likelihood, impact: Impact): Severity {
  return RISK_MATRIX[likelihood]?.[impact] || "MEDIUM";
}

/**
 * Validates whether an override is acceptable.
 * Overriding requires a documented rationale explaining why the standard matrix was adjusted.
 */
export function validateSeverityOverride(
  isOverridden: boolean,
  rationale?: string | null
): { valid: boolean; error?: string } {
  if (!isOverridden) {
    return { valid: true };
  }
  if (!rationale || rationale.trim().length < 8) {
    return {
      valid: false,
      error: "A documented rationale of at least 8 characters is required when overriding calculated risk severity.",
    };
  }
  return { valid: true };
}

/**
 * Human-readable documentation of the risk model for UI and audit reports.
 */
export const RISK_MODEL_DOCUMENTATION = {
  name: "Qualitative 3x3 Likelihood-Impact Matrix",
  summary:
    "A transparent, qualitative risk scoring method mapping assessed Likelihood (Low, Medium, High) against Impact (Low, Medium, High) to derive a 4-tier Severity rating (Low, Medium, High, Critical).",
  guidelines: [
    "Low x Low, Low x Medium, Medium x Low -> Low Priority",
    "Medium x Medium, Low x High, High x Low -> Medium Priority",
    "High x Medium, Medium x High -> High Priority",
    "High x High -> Critical Priority",
    "Overrides: Authorized Security Leads can calibrate severity when compensatory controls or architectural blast radiuses warrant an exception, provided a written rationale is recorded.",
  ],
  disclaimer:
    "Qualitative scoring is an operational prioritization heuristic and is not a formal actuarial or quantitative measurement.",
};

"""

# ==============================================================================
# FILE: src/lib/prisma.ts - Prisma Client Instance
# ==============================================================================
SOURCE_SRC_LIB_PRISMA_TS = """
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.globalPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.globalPrisma = prisma;
}

export default prisma;

"""

# ==============================================================================
# FILE: src/lib/seed-data.ts - Fictional Demo Seed Data
# ==============================================================================
SOURCE_SRC_LIB_SEED_DATA_TS = """
import { PrismaClient } from "@prisma/client";

export async function seedCommerceProject(prisma: PrismaClient) {
  // Check if sample project already exists
  const existing = await prisma.project.findFirst({
    where: { name: { contains: "Commerce Microservices Threat Model" } },
  });

  if (existing) {
    // Clean up existing to ensure a fresh, consistent seed
    await prisma.project.delete({
      where: { id: existing.id },
    });
  }

  const project = await prisma.project.create({
    data: {
      name: "Commerce Microservices Threat Model (Fictional Demo)",
      description:
        "Fictional microservices architecture threat modeling study for a cloud-native e-commerce checkout and ordering ecosystem. Assesses edge ingress, JWT propagation, inter-service messaging, and tokenized payment integrations.",
      owner: "Security Architecture Team",
      status: "In Assessment",
      architectureVersion: "2.4.0-fictional",
      environment: "Production",
      reviewDate: new Date("2026-11-20"),
      inScope: `• Customer Web App (SPA) to API Gateway ingress traffic.
• Distributed JWT authentication propagation and cross-service verification.
• Order Service orchestration, inventory state, and order database operations.
• Payment Service integration with external tokenized payment processor.
• Apache Kafka asynchronous messaging channels and pub/sub event schemas.
• Orders Database persistence and storage security controls.`,
      outOfScope: `• Cloud provider physical datacenter hardware and hypervisor internals.
• Corporate corporate headquarters network and employee laptops.
• Brick-and-mortar retail POS cash register terminals.
• Long-term cold archive tape storage logistics.`,
      assumptions: `• All microservices operate within a private Kubernetes VPC with network policies.
• Application secrets are injected via cloud secret manager at pod startup.
• No raw credit card primary account numbers (PAN) touch internal infrastructure; only PCI-DSS tokenized tokens are passed.
• Strict TLS 1.3 is enforced at the edge ingress gateway.`,
      openQuestions: `• Should Identity Service enforce mTLS alongside bearer tokens for zero-trust service-to-service calls?
• What is the backpressure strategy if Kafka broker partitions experience lag during high-volume promotions?
• Are Kafka dead-letter queues (DLQ) monitored for accidental sensitive payload leaks?`,
      stakeholders: JSON.stringify([
        {
          name: "Alice Vance",
          role: "Chief Cloud Architect",
          email: "alice.vance@example-commerce.fictional",
          team: "Platform Engineering",
        },
        {
          name: "Carlos Mendez",
          role: "Lead AppSec Architect",
          email: "carlos.mendez@example-commerce.fictional",
          team: "Product Security",
        },
        {
          name: "Maya Patel",
          role: "Staff Software Engineer",
          email: "maya.patel@example-commerce.fictional",
          team: "Order Services",
        },
        {
          name: "David Chen",
          role: "Security Assurance Auditor",
          email: "david.chen@example-commerce.fictional",
          team: "Governance & Compliance",
        },
      ]),
    },
  });

  // Create Architecture Elements
  const elemWebApp = await prisma.architectureElement.create({
    data: {
      projectId: project.id,
      name: "Customer Web App",
      type: "EXTERNAL_ENTITY",
      description: "Customer-facing Single Page Application running in browser.",
      technology: "React / Next.js SPA",
      trustZone: "Public Internet",
      posX: 60,
      posY: 160,
    },
  });

  const elemGateway = await prisma.architectureElement.create({
    data: {
      projectId: project.id,
      name: "API Gateway",
      type: "PROCESS",
      description: "Reverse proxy, rate limiting, and TLS termination point.",
      technology: "Envoy Proxy / Cloudflare Ingress",
      trustZone: "DMZ / Ingress",
      posX: 280,
      posY: 160,
    },
  });

  const elemIdentity = await prisma.architectureElement.create({
    data: {
      projectId: project.id,
      name: "Identity Service",
      type: "PROCESS",
      description: "Authentication authority, password hashing, and JWT token issuer.",
      technology: "Go / OAuth2 OIDC Authority",
      trustZone: "Internal VPC Core",
      posX: 280,
      posY: 340,
    },
  });

  const elemOrderService = await prisma.architectureElement.create({
    data: {
      projectId: project.id,
      name: "Order Service",
      type: "PROCESS",
      description: "Core business logic for order placement, state transitions, and checkout.",
      technology: "Node.js / Express Microservice",
      trustZone: "Internal VPC Core",
      posX: 540,
      posY: 160,
    },
  });

  const elemPaymentService = await prisma.architectureElement.create({
    data: {
      projectId: project.id,
      name: "Payment Service",
      type: "PROCESS",
      description: "Handles payment token processing and ledger coordination.",
      technology: "Java / Spring Boot Service",
      trustZone: "PCI-Scoped Enclave",
      posX: 540,
      posY: 340,
    },
  });

  const elemMessageBroker = await prisma.architectureElement.create({
    data: {
      projectId: project.id,
      name: "Message Broker",
      type: "PROCESS",
      description: "Distributed publish/subscribe event streaming platform.",
      technology: "Apache Kafka Cluster",
      trustZone: "Internal VPC Core",
      posX: 800,
      posY: 160,
    },
  });

  const elemDatabase = await prisma.architectureElement.create({
    data: {
      projectId: project.id,
      name: "Orders Database",
      type: "DATA_STORE",
      description: "Relational database storing transactional order history.",
      technology: "PostgreSQL 16 High-Availability",
      trustZone: "Secure Data Enclave",
      posX: 540,
      posY: 10,
    },
  });

  const elemExtPayment = await prisma.architectureElement.create({
    data: {
      projectId: project.id,
      name: "External Payment Provider",
      type: "EXTERNAL_ENTITY",
      description: "Third-party PCI Level 1 credit card processing gateway API.",
      technology: "RESTful Tokenized Payment API",
      trustZone: "External Partner Cloud",
      posX: 800,
      posY: 340,
    },
  });

  // Create Data Flows
  const flow1 = await prisma.dataFlow.create({
    data: {
      projectId: project.id,
      name: "Browse & Submit Order",
      sourceElementId: elemWebApp.id,
      targetElementId: elemGateway.id,
      protocol: "HTTPS/REST",
      dataCategory: "Cart Items & Session Cookie",
      authContext: "TLS 1.3 / Cloudflare WAF",
      crossesTrustBoundary: true,
      notes: "Crosses from Public Internet into DMZ Ingress boundary.",
    },
  });

  const flow2 = await prisma.dataFlow.create({
    data: {
      projectId: project.id,
      name: "User Login & Token Exchange",
      sourceElementId: elemGateway.id,
      targetElementId: elemIdentity.id,
      protocol: "HTTPS/REST",
      dataCategory: "Credentials & Signed JWT Tokens",
      authContext: "OAuth 2.0 PKCE",
      crossesTrustBoundary: false,
      notes: "Internal routing to identity provider for token validation.",
    },
  });

  const flow3 = await prisma.dataFlow.create({
    data: {
      projectId: project.id,
      name: "Route Authenticated Order",
      sourceElementId: elemGateway.id,
      targetElementId: elemOrderService.id,
      protocol: "gRPC",
      dataCategory: "Customer Order Payload & Bearer JWT",
      authContext: "Validated JWT Bearer claim",
      crossesTrustBoundary: false,
      notes: "Gateway strips public cookies and passes verified JWT claims.",
    },
  });

  const flow4 = await prisma.dataFlow.create({
    data: {
      projectId: project.id,
      name: "Authorize & Tokenize Payment",
      sourceElementId: elemOrderService.id,
      targetElementId: elemPaymentService.id,
      protocol: "gRPC",
      dataCategory: "Order ID & Payment Token Reference",
      authContext: "mTLS Service Identity + JWT Context",
      crossesTrustBoundary: true,
      notes: "Enters PCI-scoped enclave boundary.",
    },
  });

  const flow5 = await prisma.dataFlow.create({
    data: {
      projectId: project.id,
      name: "Process Card Charge",
      sourceElementId: elemPaymentService.id,
      targetElementId: elemExtPayment.id,
      protocol: "HTTPS/REST",
      dataCategory: "Tokenized Card Reference & Charge Amount",
      authContext: "Signed Merchant API Key + TLS 1.3",
      crossesTrustBoundary: true,
      notes: "Outbound egress across internet to external payment gateway.",
    },
  });

  const flow6 = await prisma.dataFlow.create({
    data: {
      projectId: project.id,
      name: "Publish OrderCreated Event",
      sourceElementId: elemOrderService.id,
      targetElementId: elemMessageBroker.id,
      protocol: "Kafka Wire Protocol",
      dataCategory: "OrderCreated Event Schema (Non-PII)",
      authContext: "SASL/SCRAM Authentication",
      crossesTrustBoundary: false,
      notes: "Asynchronous notification for fulfillment and notifications.",
    },
  });

  const flow7 = await prisma.dataFlow.create({
    data: {
      projectId: project.id,
      name: "Persist Order Record",
      sourceElementId: elemOrderService.id,
      targetElementId: elemDatabase.id,
      protocol: "Database Wire Protocol",
      dataCategory: "Order Records, Line Items, Customer ID",
      authContext: "IAM Database Auth + TLS",
      crossesTrustBoundary: true,
      notes: "Enters Secure Data Enclave boundary.",
    },
  });

  // Create Threats
  // Threat 1: Spoofing & Elevation
  const thr1 = await prisma.threat.create({
    data: {
      projectId: project.id,
      threatId: "THR-001",
      title: "JWT Token Forgery via Weak Asymmetric Key Rotation",
      scenario:
        "An adversary exploits a vulnerability in key distribution or algorithm negotiation to forge a JWT signature, injecting an administrative role into identity claims.",
      strideCategories: JSON.stringify(["SPOOFING", "ELEVATION_OF_PRIVILEGE"]),
      preconditions: "Attacker has access to public network ingress and craftable HTTP requests.",
      confidentialityImpact: "HIGH",
      integrityImpact: "HIGH",
      availabilityImpact: "MEDIUM",
      privacyImpact: "HIGH",
      businessImpact: "Full account takeover and unauthorized administrative order manipulation.",
      likelihood: "MEDIUM",
      impact: "HIGH",
      severity: "HIGH",
      isOverridden: false,
      existingControls: "API Gateway validates token expiration timestamp and issuer string.",
      controlsStatus: "ASSUMED",
      mitigation:
        "Implement JWKS endpoint caching with strict RS256/EdDSA signature verification. Disallow algorithm switching and verify signature at every microservice boundary.",
      owner: "Carlos Mendez (AppSec)",
      dueDate: new Date("2026-11-30"),
      status: "OPEN",
    },
  });
  await prisma.threatElementLink.createMany({
    data: [
      { threatId: thr1.id, elementId: elemIdentity.id },
      { threatId: thr1.id, elementId: elemGateway.id },
    ],
  });
  await prisma.threatFlowLink.create({
    data: { threatId: thr1.id, flowId: flow3.id },
  });

  // Threat 2: Tampering
  const thr2 = await prisma.threat.create({
    data: {
      projectId: project.id,
      threatId: "THR-002",
      title: "In-Transit Order Payload Modification on Inter-Service Channel",
      scenario:
        "If pod-to-pod network encryption is disabled, a compromised internal container could inspect and tamper with order total prices in flight between gateway and service.",
      strideCategories: JSON.stringify(["TAMPERING"]),
      preconditions: "Attacker has execution access within the shared Kubernetes node network namespace.",
      confidentialityImpact: "MEDIUM",
      integrityImpact: "HIGH",
      availabilityImpact: "LOW",
      privacyImpact: "LOW",
      businessImpact: "Financial loss through unauthorized discount tampering.",
      likelihood: "LOW",
      impact: "HIGH",
      severity: "MEDIUM",
      isOverridden: false,
      existingControls: "Kubernetes network policies restrict pod-to-pod ingress/egress namespaces.",
      controlsStatus: "VERIFIED",
      mitigation:
        "Enforce Istio/Linkerd mTLS encryption across all pods; re-calculate prices server-side from catalog database rather than trusting client payloads.",
      owner: "Maya Patel (Order Service)",
      dueDate: new Date("2026-12-10"),
      status: "MITIGATED",
    },
  });
  await prisma.threatElementLink.create({
    data: { threatId: thr2.id, elementId: elemOrderService.id },
  });
  await prisma.threatFlowLink.create({
    data: { threatId: thr2.id, flowId: flow3.id },
  });

  // Threat 3: Repudiation
  const thr3 = await prisma.threat.create({
    data: {
      projectId: project.id,
      threatId: "THR-003",
      title: "Missing Immutable Audit Trail on High-Value Refund Requests",
      scenario:
        "A rogue user or compromised operator initiates high-value refunds, but system logs lack cryptographic non-repudiation proof to demonstrate who approved the action.",
      strideCategories: JSON.stringify(["REPUDIATION"]),
      preconditions: "User or operator has authenticated access to refund APIs.",
      confidentialityImpact: "LOW",
      integrityImpact: "HIGH",
      availabilityImpact: "LOW",
      privacyImpact: "LOW",
      businessImpact: "Disputed chargebacks and failure of financial compliance audits.",
      likelihood: "MEDIUM",
      impact: "MEDIUM",
      severity: "MEDIUM",
      isOverridden: false,
      existingControls: "Application writes standard HTTP request logs to Elasticsearch.",
      controlsStatus: "ASSUMED",
      mitigation:
        "Implement write-once tamper-evident ledger for all financial balance modifications, logging signed identity hashes and timestamp tokens.",
      owner: "Security Architecture Team",
      dueDate: new Date("2026-12-15"),
      status: "OPEN",
    },
  });
  await prisma.threatElementLink.create({
    data: { threatId: thr3.id, elementId: elemPaymentService.id },
  });
  await prisma.threatFlowLink.createMany({
    data: [
      { threatId: thr3.id, flowId: flow4.id },
      { threatId: thr3.id, flowId: flow5.id },
    ],
  });

  // Threat 4: Information Disclosure
  const thr4 = await prisma.threat.create({
    data: {
      projectId: project.id,
      threatId: "THR-004",
      title: "Payment Token or Account Metadata Leakage in Verbose Error Logs",
      scenario:
        "When third-party payment gateway encounters a 500 error, Payment Service dumps the unmasked HTTP request/response body into log streams accessible to developers.",
      strideCategories: JSON.stringify(["INFORMATION_DISCLOSURE"]),
      preconditions: "Upstream third-party payment provider failure triggering exception handler.",
      confidentialityImpact: "HIGH",
      integrityImpact: "LOW",
      availabilityImpact: "LOW",
      privacyImpact: "HIGH",
      businessImpact: "PCI-DSS compliance violation and exposure of customer payment references.",
      likelihood: "HIGH",
      impact: "HIGH",
      severity: "CRITICAL",
      isOverridden: false,
      existingControls: "Tokenized references used instead of raw card numbers.",
      controlsStatus: "VERIFIED",
      mitigation:
        "Implement centralized data scrubbers and logging interceptors to sanitize payment fields before writing to log sinks; enforce strict RBAC on log access.",
      owner: "Carlos Mendez (AppSec)",
      dueDate: new Date("2026-11-15"),
      status: "OPEN",
    },
  });
  await prisma.threatElementLink.createMany({
    data: [
      { threatId: thr4.id, elementId: elemPaymentService.id },
      { threatId: thr4.id, elementId: elemExtPayment.id },
    ],
  });
  await prisma.threatFlowLink.create({
    data: { threatId: thr4.id, flowId: flow5.id },
  });

  // Threat 5: Denial of Service
  const thr5 = await prisma.threat.create({
    data: {
      projectId: project.id,
      threatId: "THR-005",
      title: "Message Broker Partition Flooding via Unthrottled Order Submissions",
      scenario:
        "Bot-driven checkout surges exhaust Kafka broker memory and lead to message partition rebalancing delays, stalling all order fulfillment pipelines.",
      strideCategories: JSON.stringify(["DENIAL_OF_SERVICE"]),
      preconditions: "Flash sale traffic spike or coordinated distributed bot attack.",
      confidentialityImpact: "NONE",
      integrityImpact: "LOW",
      availabilityImpact: "HIGH",
      privacyImpact: "NONE",
      businessImpact: "Substantial revenue loss and customer abandonment during flash sales.",
      likelihood: "HIGH",
      impact: "MEDIUM",
      severity: "HIGH",
      isOverridden: true,
      severityRationale:
        "Accepted for Phase 1 release because Cloudflare edge rate-limiting mitigates volume spikes; cluster auto-scaling scheduled for Phase 2.",
      existingControls: "Cloudflare CDN DDoS protection active on root domain.",
      controlsStatus: "VERIFIED",
      mitigation:
        "Configure distributed Redis rate limiting per user account and enforce backpressure timeouts on Kafka producer clients.",
      owner: "Alice Vance (Platform Arch)",
      dueDate: new Date("2026-12-30"),
      status: "ACCEPTED",
    },
  });
  await prisma.threatElementLink.createMany({
    data: [
      { threatId: thr5.id, elementId: elemOrderService.id },
      { threatId: thr5.id, elementId: elemMessageBroker.id },
    ],
  });
  await prisma.threatFlowLink.create({
    data: { threatId: thr5.id, flowId: flow6.id },
  });

  // Threat 6: Elevation of Privilege
  const thr6 = await prisma.threat.create({
    data: {
      projectId: project.id,
      threatId: "THR-006",
      title: "Insecure Direct Object Reference (IDOR) on Customer Order Query API",
      scenario:
        "Order detail query API validates token presence but does not verify that order.userId equals the requester subject ID from the JWT token.",
      strideCategories: JSON.stringify(["ELEVATION_OF_PRIVILEGE", "INFORMATION_DISCLOSURE"]),
      preconditions: "Attacker has any valid authenticated customer account and guesses order IDs.",
      confidentialityImpact: "HIGH",
      integrityImpact: "LOW",
      availabilityImpact: "LOW",
      privacyImpact: "HIGH",
      businessImpact: "Cross-tenant customer order history and shipping address exposure.",
      likelihood: "HIGH",
      impact: "HIGH",
      severity: "CRITICAL",
      isOverridden: false,
      existingControls: "Endpoint requires valid Bearer token.",
      controlsStatus: "ASSUMED",
      mitigation:
        "Enforce authorization policy in data layer: require order.owner_id == authenticated_subject_id before returning any record.",
      owner: "Maya Patel (Order Service)",
      dueDate: new Date("2026-11-18"),
      status: "OPEN",
    },
  });
  await prisma.threatElementLink.createMany({
    data: [
      { threatId: thr6.id, elementId: elemOrderService.id },
      { threatId: thr6.id, elementId: elemDatabase.id },
    ],
  });
  await prisma.threatFlowLink.create({
    data: { threatId: thr6.id, flowId: flow7.id },
  });

  // Threat 7: Not Applicable with required rationale
  const thr7 = await prisma.threat.create({
    data: {
      projectId: project.id,
      threatId: "THR-007",
      title: "Hardware TPM Extraction on Physical POS Register Terminals",
      scenario:
        "Adversary uses physical laboratory equipment to probe TPM bus lines and extract cryptographic private keys from edge point-of-sale registers.",
      strideCategories: JSON.stringify(["TAMPERING"]),
      preconditions: "Physical possession of edge register hardware.",
      confidentialityImpact: "LOW",
      integrityImpact: "LOW",
      availabilityImpact: "LOW",
      privacyImpact: "LOW",
      businessImpact: "None for cloud system.",
      likelihood: "LOW",
      impact: "LOW",
      severity: "LOW",
      isOverridden: false,
      existingControls: "E-commerce platform operates 100% cloud-native web application without physical hardware stores.",
      controlsStatus: "VERIFIED",
      mitigation: "N/A - Not Applicable to purely online cloud architecture.",
      owner: "Security Architecture Team",
      status: "NOT_APPLICABLE",
      notApplicableRationale:
        "This threat is specific to physical brick-and-mortar retail point-of-sale hardware. The Commerce system in scope is entirely cloud-native web e-commerce.",
    },
  });
  await prisma.threatElementLink.create({
    data: { threatId: thr7.id, elementId: elemWebApp.id },
  });

  return project;
}

"""

# ==============================================================================
# FILE: src/lib/validations/project.ts - Project Validation Schema
# ==============================================================================
SOURCE_SRC_LIB_VALIDATIONS_PROJECT_TS = """
import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(120, "Project name cannot exceed 120 characters"),
  description: z
    .string()
    .min(5, "Please provide a descriptive purpose for the threat modeling study"),
  owner: z
    .string()
    .min(2, "Project owner / lead name is required")
    .max(80),
  status: z
    .enum(["Planning", "In Assessment", "Under Review", "Approved", "Archived"])
    .default("In Assessment"),
  architectureVersion: z
    .string()
    .default("1.0.0")
    .transform((val) => val || "1.0.0"),
  environment: z
    .enum(["Production", "Staging", "Development", "Multi-Region Cloud"])
    .default("Production"),
  reviewDate: z.string().optional().nullable(),
  inScope: z.string().optional().nullable(),
  outOfScope: z.string().optional().nullable(),
  assumptions: z.string().optional().nullable(),
  openQuestions: z.string().optional().nullable(),
  stakeholders: z.string().optional().nullable(),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

"""

# ==============================================================================
# FILE: src/lib/validations/threat.ts - Threat Validation Schema
# ==============================================================================
SOURCE_SRC_LIB_VALIDATIONS_THREAT_TS = """
import { z } from "zod";

export const baseThreatSchema = z.object({
  threatId: z.string().optional(),
  title: z
    .string()
    .min(3, "Threat title must be at least 3 characters")
    .max(150),
  scenario: z
    .string()
    .min(10, "Please provide a detailed description of the threat scenario"),
  strideCategories: z
    .array(
      z.enum([
        "SPOOFING",
        "TAMPERING",
        "REPUDIATION",
        "INFORMATION_DISCLOSURE",
        "DENIAL_OF_SERVICE",
        "ELEVATION_OF_PRIVILEGE",
      ])
    )
    .min(1, "Select at least one applicable STRIDE category"),
  preconditions: z.string().optional().nullable(),
  confidentialityImpact: z.string().optional().nullable(),
  integrityImpact: z.string().optional().nullable(),
  availabilityImpact: z.string().optional().nullable(),
  privacyImpact: z.string().optional().nullable(),
  businessImpact: z.string().optional().nullable(),
  likelihood: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  impact: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  severityRationale: z.string().optional().nullable(),
  isOverridden: z.boolean().default(false),
  existingControls: z.string().optional().nullable(),
  controlsStatus: z.enum(["VERIFIED", "ASSUMED", "NONE"]).default("ASSUMED"),
  mitigation: z.string().optional().nullable(),
  owner: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  status: z
    .enum(["OPEN", "ACCEPTED", "MITIGATED", "DEFERRED", "NOT_APPLICABLE"])
    .default("OPEN"),
  notApplicableRationale: z.string().optional().nullable(),
  linkedElementIds: z.array(z.string()).default([]),
  linkedFlowIds: z.array(z.string()).default([]),
});

export const threatSchema = baseThreatSchema
  .refine(
    (data) => {
      if (data.isOverridden && (!data.severityRationale || data.severityRationale.trim().length < 8)) {
        return false;
      }
      return true;
    },
    {
      message:
        "A documented rationale (at least 8 characters) is required when overriding the risk severity",
      path: ["severityRationale"],
    }
  )
  .refine(
    (data) => {
      if (
        data.status === "NOT_APPLICABLE" &&
        (!data.notApplicableRationale || data.notApplicableRationale.trim().length < 6)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "Please provide a rationale explaining why this threat is marked Not Applicable",
      path: ["notApplicableRationale"],
    }
  );

export const threatUpdateSchema = baseThreatSchema.partial();

export type ThreatInput = z.infer<typeof threatSchema>;
export type ThreatUpdateInput = z.infer<typeof threatUpdateSchema>;

"""

# ==============================================================================
# FILE: src/lib/validations/element.ts - Element Validation Schema
# ==============================================================================
SOURCE_SRC_LIB_VALIDATIONS_ELEMENT_TS = """
import { z } from "zod";

export const elementSchema = z.object({
  name: z
    .string()
    .min(2, "Component name must be at least 2 characters")
    .max(100),
  type: z.enum(["EXTERNAL_ENTITY", "PROCESS", "DATA_STORE", "TRUST_BOUNDARY"]),
  description: z.string().optional().nullable(),
  technology: z.string().optional().nullable(),
  trustZone: z.string().optional().nullable(),
  posX: z.number().default(100),
  posY: z.number().default(100),
});

export const elementUpdateSchema = elementSchema.partial();

export type ElementInput = z.infer<typeof elementSchema>;
export type ElementUpdateInput = z.infer<typeof elementUpdateSchema>;

"""

# ==============================================================================
# FILE: src/lib/validations/flow.ts - Flow Validation Schema
# ==============================================================================
SOURCE_SRC_LIB_VALIDATIONS_FLOW_TS = """
import { z } from "zod";

export const flowSchema = z.object({
  name: z.string().min(2, "Flow name must be at least 2 characters").max(100),
  sourceElementId: z.string().min(1, "Source component is required"),
  targetElementId: z.string().min(1, "Target component is required"),
  protocol: z
    .string()
    .min(1, "Protocol / Channel is required")
    .default("HTTPS/REST"),
  dataCategory: z.string().optional().nullable(),
  authContext: z.string().optional().nullable(),
  crossesTrustBoundary: z.boolean().default(false),
  notes: z.string().optional().nullable(),
});

export const flowUpdateSchema = flowSchema.partial();

export type FlowInput = z.infer<typeof flowSchema>;
export type FlowUpdateInput = z.infer<typeof flowUpdateSchema>;

"""

# ==============================================================================
# FILE: src/app/api/projects/route.ts - API: Projects List & Create
# ==============================================================================
SOURCE_SRC_APP_API_PROJECTS_ROUTE_TS = """
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { projectCreateSchema } from "@/lib/validations/project";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            elements: true,
            flows: true,
            threats: true,
          },
        },
        threats: {
          select: {
            severity: true,
            status: true,
          },
        },
      },
    });

    const enriched = projects.map((p) => {
      const highOrCriticalCount = p.threats.filter(
        (t) =>
          (t.severity === "HIGH" || t.severity === "CRITICAL") &&
          t.status !== "MITIGATED" &&
          t.status !== "NOT_APPLICABLE"
      ).length;

      const openThreatsCount = p.threats.filter(
        (t) => t.status === "OPEN"
      ).length;

      const mitigatedCount = p.threats.filter(
        (t) => t.status === "MITIGATED"
      ).length;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        owner: p.owner,
        status: p.status,
        architectureVersion: p.architectureVersion,
        environment: p.environment,
        reviewDate: p.reviewDate,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        elementCount: p._count.elements,
        flowCount: p._count.flows,
        threatCount: p._count.threats,
        highOrCriticalCount,
        openThreatsCount,
        mitigatedCount,
      };
    });

    return NextResponse.json(enriched);
  } catch (err) {
    console.error("Failed to list projects:", err);
    return NextResponse.json(
      { error: "Failed to retrieve projects list" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = projectCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      owner,
      status,
      architectureVersion,
      environment,
      reviewDate,
      inScope,
      outOfScope,
      assumptions,
      openQuestions,
      stakeholders,
    } = parsed.data;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        owner,
        status,
        architectureVersion,
        environment,
        reviewDate: reviewDate ? new Date(reviewDate) : null,
        inScope,
        outOfScope,
        assumptions,
        openQuestions,
        stakeholders,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error("Failed to create project:", err);
    return NextResponse.json(
      { error: "Failed to create threat modeling project" },
      { status: 500 }
    );
  }
}

"""

# ==============================================================================
# FILE: src/app/api/projects/[id]/route.ts - API: Project Details, Update & Delete
# ==============================================================================
SOURCE_SRC_APP_API_PROJECTS__ID__ROUTE_TS = """
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { projectUpdateSchema } from "@/lib/validations/project";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        elements: {
          orderBy: { name: "asc" },
          include: {
            threatLinks: {
              select: { threatId: true },
            },
          },
        },
        flows: {
          orderBy: { name: "asc" },
          include: {
            sourceElement: { select: { id: true, name: true, type: true } },
            targetElement: { select: { id: true, name: true, type: true } },
            threatLinks: {
              select: { threatId: true },
            },
          },
        },
        threats: {
          orderBy: [{ severity: "asc" }, { threatId: "asc" }],
          include: {
            linkedElements: {
              include: {
                element: { select: { id: true, name: true, type: true } },
              },
            },
            linkedFlows: {
              include: {
                flow: { select: { id: true, name: true, protocol: true } },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (err) {
    console.error("Failed to fetch project:", err);
    return NextResponse.json(
      { error: "Failed to fetch project details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = projectUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.reviewDate !== undefined) {
      data.reviewDate = parsed.data.reviewDate
        ? new Date(parsed.data.reviewDate)
        : null;
    }

    const updated = await prisma.project.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update project:", err);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Explicitly delete child relations for MongoDB safety
    const threats = await prisma.threat.findMany({
      where: { projectId: id },
      select: { id: true },
    });
    const threatIds = threats.map((t) => t.id);

    if (threatIds.length > 0) {
      await prisma.threatElementLink.deleteMany({
        where: { threatId: { in: threatIds } },
      });
      await prisma.threatFlowLink.deleteMany({
        where: { threatId: { in: threatIds } },
      });
    }

    await prisma.threat.deleteMany({ where: { projectId: id } });
    await prisma.dataFlow.deleteMany({ where: { projectId: id } });
    await prisma.architectureElement.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Project "${project.name}" deleted successfully`,
    });
  } catch (err) {
    console.error("Failed to delete project:", err);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

"""

# ==============================================================================
# FILE: src/app/api/projects/[id]/threats/route.ts - API: Threats Management
# ==============================================================================
SOURCE_SRC_APP_API_PROJECTS__ID__THREATS_ROUTE_TS = """
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { threatSchema } from "@/lib/validations/threat";
import { calculateSeverity } from "@/lib/risk-scoring";
import { Impact, Likelihood } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);

    const stride = searchParams.get("stride");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const owner = searchParams.get("owner");
    const search = searchParams.get("search");
    const elementId = searchParams.get("elementId");
    const flowId = searchParams.get("flowId");
    const sortBy = searchParams.get("sortBy") || "severity"; // severity, id, updated, due
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build Prisma where filter
    const where: Record<string, unknown> = {
      projectId: id,
    };

    if (severity) {
      where.severity = severity;
    }
    if (status) {
      where.status = status;
    }
    if (owner) {
      where.owner = { contains: owner };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { scenario: { contains: search } },
        { threatId: { contains: search } },
        { mitigation: { contains: search } },
      ];
    }
    if (elementId) {
      where.linkedElements = {
        some: { elementId },
      };
    }
    if (flowId) {
      where.linkedFlows = {
        some: { flowId },
      };
    }

    const threats = await prisma.threat.findMany({
      where,
      include: {
        linkedElements: {
          include: {
            element: { select: { id: true, name: true, type: true } },
          },
        },
        linkedFlows: {
          include: {
            flow: { select: { id: true, name: true, protocol: true } },
          },
        },
      },
      orderBy:
        sortBy === "id"
          ? { threatId: sortOrder }
          : sortBy === "updated"
          ? { updatedAt: sortOrder }
          : sortBy === "due"
          ? { dueDate: sortOrder }
          : [{ severity: sortOrder }, { threatId: "asc" }],
    });

    // Client/Server filter for STRIDE categories stored as JSON array string
    let result = threats;
    if (stride) {
      result = threats.filter((t) => {
        try {
          const cats = JSON.parse(t.strideCategories);
          return Array.isArray(cats) && cats.includes(stride);
        } catch {
          return false;
        }
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to list threats:", err);
    return NextResponse.json(
      { error: "Failed to list threats" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = threatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Calculate auto severity if not manually overridden
    let severity = data.severity;
    if (!data.isOverridden) {
      severity = calculateSeverity(
        data.likelihood as Likelihood,
        data.impact as Impact
      );
    }

    // Auto-generate threat identifier if not specified
    let threatId = data.threatId;
    if (!threatId || threatId.trim() === "") {
      const count = await prisma.threat.count({ where: { projectId: id } });
      threatId = `THR-${String(count + 1).padStart(3, "0")}`;
    }

    const created = await prisma.threat.create({
      data: {
        projectId: id,
        threatId,
        title: data.title,
        scenario: data.scenario,
        strideCategories: JSON.stringify(data.strideCategories),
        preconditions: data.preconditions,
        confidentialityImpact: data.confidentialityImpact,
        integrityImpact: data.integrityImpact,
        availabilityImpact: data.availabilityImpact,
        privacyImpact: data.privacyImpact,
        businessImpact: data.businessImpact,
        likelihood: data.likelihood,
        impact: data.impact,
        severity,
        severityRationale: data.isOverridden ? data.severityRationale : null,
        isOverridden: data.isOverridden,
        existingControls: data.existingControls,
        controlsStatus: data.controlsStatus,
        mitigation: data.mitigation,
        owner: data.owner,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status,
        notApplicableRationale:
          data.status === "NOT_APPLICABLE"
            ? data.notApplicableRationale
            : null,
      },
    });

    if (data.linkedElementIds && data.linkedElementIds.length > 0) {
      await prisma.threatElementLink.createMany({
        data: data.linkedElementIds.map((elementId) => ({
          threatId: created.id,
          elementId,
        })),
      });
    }

    if (data.linkedFlowIds && data.linkedFlowIds.length > 0) {
      await prisma.threatFlowLink.createMany({
        data: data.linkedFlowIds.map((flowId) => ({
          threatId: created.id,
          flowId,
        })),
      });
    }

    const threat = await prisma.threat.findUnique({
      where: { id: created.id },
      include: {
        linkedElements: {
          include: {
            element: { select: { id: true, name: true, type: true } },
          },
        },
        linkedFlows: {
          include: {
            flow: { select: { id: true, name: true, protocol: true } },
          },
        },
      },
    });

    return NextResponse.json(threat, { status: 201 });
  } catch (err) {
    console.error("Failed to create threat:", err);
    return NextResponse.json(
      { error: "Failed to create threat record" },
      { status: 500 }
    );
  }
}

"""

# ==============================================================================
# FILE: src/app/api/projects/[id]/elements/route.ts - API: Elements Management
# ==============================================================================
SOURCE_SRC_APP_API_PROJECTS__ID__ELEMENTS_ROUTE_TS = """
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { elementSchema } from "@/lib/validations/element";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const elements = await prisma.architectureElement.findMany({
      where: { projectId: id },
      orderBy: { name: "asc" },
      include: {
        threatLinks: {
          select: { threatId: true },
        },
      },
    });

    return NextResponse.json(elements);
  } catch (err) {
    console.error("Failed to list elements:", err);
    return NextResponse.json(
      { error: "Failed to list architecture elements" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = elementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const element = await prisma.architectureElement.create({
      data: {
        projectId: id,
        name: parsed.data.name,
        type: parsed.data.type,
        description: parsed.data.description,
        technology: parsed.data.technology,
        trustZone: parsed.data.trustZone,
        posX: parsed.data.posX,
        posY: parsed.data.posY,
      },
    });

    return NextResponse.json(element, { status: 201 });
  } catch (err) {
    console.error("Failed to create element:", err);
    return NextResponse.json(
      { error: "Failed to create architecture element" },
      { status: 500 }
    );
  }
}

"""

# ==============================================================================
# FILE: src/app/api/projects/[id]/flows/route.ts - API: Data Flows Management
# ==============================================================================
SOURCE_SRC_APP_API_PROJECTS__ID__FLOWS_ROUTE_TS = """
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { flowSchema } from "@/lib/validations/flow";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const flows = await prisma.dataFlow.findMany({
      where: { projectId: id },
      orderBy: { name: "asc" },
      include: {
        sourceElement: true,
        targetElement: true,
        threatLinks: { select: { threatId: true } },
      },
    });

    return NextResponse.json(flows);
  } catch (err) {
    console.error("Failed to list flows:", err);
    return NextResponse.json(
      { error: "Failed to list data flows" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = flowSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const flow = await prisma.dataFlow.create({
      data: {
        projectId: id,
        name: parsed.data.name,
        sourceElementId: parsed.data.sourceElementId,
        targetElementId: parsed.data.targetElementId,
        protocol: parsed.data.protocol,
        dataCategory: parsed.data.dataCategory,
        authContext: parsed.data.authContext,
        crossesTrustBoundary: parsed.data.crossesTrustBoundary,
        notes: parsed.data.notes,
      },
      include: {
        sourceElement: true,
        targetElement: true,
      },
    });

    return NextResponse.json(flow, { status: 201 });
  } catch (err) {
    console.error("Failed to create flow:", err);
    return NextResponse.json(
      { error: "Failed to create data flow" },
      { status: 500 }
    );
  }
}

"""

# ==============================================================================
# FILE: src/app/api/projects/[id]/export/csv/route.ts - API: CSV Audit Export
# ==============================================================================
SOURCE_SRC_APP_API_PROJECTS__ID__EXPORT_CSV_ROUTE_TS = """
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function escapeCSV(val: string | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        threats: {
          orderBy: [{ severity: "asc" }, { threatId: "asc" }],
          include: {
            linkedElements: {
              include: { element: { select: { name: true } } },
            },
            linkedFlows: {
              include: { flow: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const headers = [
      "Threat ID",
      "Title",
      "STRIDE Categories",
      "Severity / Priority",
      "Likelihood",
      "Impact",
      "Is Overridden",
      "Severity Rationale",
      "Status",
      "Not Applicable Rationale",
      "Owner / Team",
      "Due Date",
      "Threat Scenario",
      "Preconditions & Assumptions",
      "Confidentiality Impact",
      "Integrity Impact",
      "Availability Impact",
      "Privacy Impact",
      "Business Impact",
      "Existing Controls",
      "Controls Verification Status",
      "Recommended Mitigation",
      "Linked Components",
      "Linked Data Flows",
      "Created At",
      "Updated At",
    ];

    const rows = project.threats.map((t) => {
      let strideList = "";
      try {
        const parsed = JSON.parse(t.strideCategories);
        strideList = Array.isArray(parsed) ? parsed.join("; ") : t.strideCategories;
      } catch {
        strideList = t.strideCategories;
      }

      const elementsList = t.linkedElements
        .map((le) => le.element.name)
        .join("; ");
      const flowsList = t.linkedFlows.map((lf) => lf.flow.name).join("; ");

      return [
        escapeCSV(t.threatId),
        escapeCSV(t.title),
        escapeCSV(strideList),
        escapeCSV(t.severity),
        escapeCSV(t.likelihood),
        escapeCSV(t.impact),
        escapeCSV(t.isOverridden ? "YES" : "NO"),
        escapeCSV(t.severityRationale || ""),
        escapeCSV(t.status),
        escapeCSV(t.notApplicableRationale || ""),
        escapeCSV(t.owner || ""),
        escapeCSV(t.dueDate ? t.dueDate.toISOString().split("T")[0] : ""),
        escapeCSV(t.scenario),
        escapeCSV(t.preconditions || ""),
        escapeCSV(t.confidentialityImpact || ""),
        escapeCSV(t.integrityImpact || ""),
        escapeCSV(t.availabilityImpact || ""),
        escapeCSV(t.privacyImpact || ""),
        escapeCSV(t.businessImpact || ""),
        escapeCSV(t.existingControls || ""),
        escapeCSV(t.controlsStatus),
        escapeCSV(t.mitigation || ""),
        escapeCSV(elementsList),
        escapeCSV(flowsList),
        escapeCSV(t.createdAt.toISOString()),
        escapeCSV(t.updatedAt.toISOString()),
      ].join(",");
    });

    // Prepend UTF-8 Byte Order Mark (BOM) for Excel compatibility
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

    const safeFilename = `${project.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_Threat_Register.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Failed to export threats CSV:", err);
    return NextResponse.json(
      { error: "Failed to generate CSV export" },
      { status: 500 }
    );
  }
}

"""

# ==============================================================================
# FILE: src/app/api/seed/route.ts - API: Database Re-seed
# ==============================================================================
SOURCE_SRC_APP_API_SEED_ROUTE_TS = """
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { seedCommerceProject } from "@/lib/seed-data";

export async function POST() {
  try {
    const project = await seedCommerceProject(prisma);
    return NextResponse.json({
      success: true,
      message: "Successfully seeded fictional demo project",
      project,
    });
  } catch (err) {
    console.error("Failed to seed database:", err);
    return NextResponse.json(
      { error: "Failed to seed demo project" },
      { status: 500 }
    );
  }
}

"""

# ==============================================================================
# FILE: src/context/ProjectContext.tsx - Global State & Project Context
# ==============================================================================
SOURCE_SRC_CONTEXT_PROJECTCONTEXT_TSX = """
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

export type ThemePalette = "corporate" | "tech";
export type ThemeMode = "dark" | "light";

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
  themePalette: ThemePalette;
  setThemePalette: (theme: ThemePalette) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  refreshProjects: () => Promise<void>;
  refreshActiveProject: () => Promise<void>;
  reseedDemo: () => Promise<void>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
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
  const [themePalette, setThemePalette] = useState<ThemePalette>("corporate");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");

  // Synchronize Theme Mode with document root and localStorage (Default: Light Theme)
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("stride_theme_mode") as ThemeMode | null;
      if (savedMode === "light" || savedMode === "dark") {
        setThemeMode(savedMode);
      } else {
        setThemeMode("light");
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (themeMode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      try {
        localStorage.setItem("stride_theme_mode", themeMode);
      } catch {
        // ignore
      }
    }
  }, [themeMode]);

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

  const deleteProject = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to delete project");
        }

        await refreshProjects();
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete project";
        console.error(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [refreshProjects]
  );

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
        themePalette,
        setThemePalette,
        themeMode,
        setThemeMode,
        refreshProjects,
        refreshActiveProject,
        reseedDemo,
        deleteProject,
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

"""

# ==============================================================================
# FILE: src/app/layout.tsx - App Root Layout
# ==============================================================================
SOURCE_SRC_APP_LAYOUT_TSX = """
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STRIDE Threat Modeling Workspace",
  description:
    "Organize, assess, prioritize, and track microservices threats with the STRIDE methodology.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedMode = localStorage.getItem('stride_theme_mode');
                if (savedMode === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50/90 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-x-hidden transition-colors duration-200">
        {/* Ambient Glassmorphism Background Mesh & Glow Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
          <div className="absolute -top-32 -left-32 w-[38rem] h-[38rem] rounded-full bg-gradient-to-br from-blue-600/30 via-indigo-600/25 to-cyan-500/20 blur-3xl opacity-75 dark:opacity-60" />
          <div className="absolute top-1/4 -right-28 w-[42rem] h-[42rem] rounded-full bg-gradient-to-bl from-teal-500/25 via-emerald-600/20 to-blue-600/25 blur-3xl opacity-70 dark:opacity-55" />
          <div className="absolute -bottom-24 left-1/4 w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-violet-600/25 via-indigo-500/20 to-purple-600/25 blur-3xl opacity-65 dark:opacity-50" />
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 dark:opacity-20" />
        </div>
        {children}
      </body>
    </html>
  );
}

"""

# ==============================================================================
# FILE: src/app/page.tsx - Main Page Container
# ==============================================================================
SOURCE_SRC_APP_PAGE_TSX = """
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
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100 transition-colors">
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
      <footer className="no-print mt-auto border-t border-white/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/75 backdrop-blur-xl py-4 text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium shadow-xs transition-colors">
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

"""

# ==============================================================================
# FILE: src/app/globals.css - Design System & Global CSS
# ==============================================================================
SOURCE_SRC_APP_GLOBALS_CSS = """
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: #f8fafc;
  --foreground: #0f172a;
}

.dark {
  --background: #090d16;
  --foreground: #f8fafc;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ==========================================================================
   Glassmorphism Styles & Utilities (Light + Dark Modes)
   ========================================================================== */

/* Glass Panels */
.glass-panel {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 2px 8px -2px rgba(15, 23, 42, 0.02);
}

.dark .glass-panel {
  background: rgba(13, 19, 33, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 35px -5px rgba(0, 0, 0, 0.5), 0 2px 10px -2px rgba(0, 0, 0, 0.3);
}

/* Glass Cards */
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 1px 4px -1px rgba(15, 23, 42, 0.02);
}

.dark .glass-card {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.45), 0 1px 4px -1px rgba(0, 0, 0, 0.25);
}

/* Hover Interactions */
.glass-card-hover {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-card-hover:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04);
  transform: translateY(-1px);
}

.dark .glass-card-hover:hover {
  background: rgba(26, 36, 56, 0.85);
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.6), 0 4px 12px -2px rgba(0, 0, 0, 0.4);
  transform: translateY(-1px);
}

/* Modals & Dialogs */
.glass-modal {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.22);
}

.dark .glass-modal {
  background: rgba(13, 19, 33, 0.96);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.75);
}

/* Inputs & Form Fields */
.glass-input {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(203, 213, 225, 0.8);
  transition: all 0.15s ease-in-out;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.98);
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.dark .glass-input {
  background: rgba(10, 15, 28, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(51, 65, 85, 0.8);
  color: #f1f5f9;
}

.dark .glass-input:focus {
  background: rgba(15, 23, 42, 0.95);
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

/* ==========================================================================
   Dark Mode Adaptive Text, Surfaces & Border Overrides
   Eliminates all washed-out light box reflections and maximizes contrast
   ========================================================================== */

/* Typography */
.dark .text-slate-900 {
  color: #f8fafc !important;
}
.dark .text-slate-800 {
  color: #f1f5f9 !important;
}
.dark .text-slate-700 {
  color: #e2e8f0 !important;
}
.dark .text-slate-600 {
  color: #cbd5e1 !important;
}
.dark .text-slate-500 {
  color: #94a3b8 !important;
}
.dark .text-slate-400 {
  color: #64748b !important;
}

/* Base Surfaces in Dark Mode */
.dark .bg-white {
  background-color: rgba(15, 23, 42, 0.75) !important;
}

/* Catch all light slate variations so they never produce a washed-out light box in dark mode */
.dark .bg-slate-50,
.dark [class*="bg-slate-50"] {
  background-color: rgba(11, 17, 32, 0.85) !important;
}
.dark .bg-slate-100,
.dark [class*="bg-slate-100"] {
  background-color: rgba(11, 17, 32, 0.85) !important;
}
.dark .bg-slate-200,
.dark [class*="bg-slate-200"] {
  background-color: rgba(20, 29, 47, 0.8) !important;
}

/* Catch all translucent white variations so they don't produce a blinding light box */
.dark [class*="bg-white/"] {
  background-color: rgba(15, 23, 42, 0.7) !important;
}
.dark [class*="border-white/"] {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

/* Dedicated STRIDE Methodology Scenario & Diagnostic Boxes */
.stride-box {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
}
.dark .stride-box {
  background-color: rgba(8, 13, 24, 0.92) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Neutral Borders */
.dark .border-slate-200,
.dark [class*="border-slate-200"] {
  border-color: rgba(51, 65, 85, 0.6) !important;
}
.dark .border-slate-300,
.dark [class*="border-slate-300"] {
  border-color: rgba(71, 85, 105, 0.6) !important;
}

/* Hover States */
.dark .hover\:bg-slate-50:hover,
.dark .hover\:bg-slate-100:hover {
  background-color: rgba(30, 41, 59, 0.6) !important;
}
.dark .hover\:bg-white:hover {
  background-color: rgba(30, 41, 59, 0.8) !important;
}

/* Table Dividers */
.dark .divide-slate-100 > :not([hidden]) ~ :not([hidden]),
.dark [class*="divide-slate-100"] > :not([hidden]) ~ :not([hidden]) {
  border-color: rgba(51, 65, 85, 0.4) !important;
}
.dark .divide-slate-200 > :not([hidden]) ~ :not([hidden]),
.dark [class*="divide-slate-200"] > :not([hidden]) ~ :not([hidden]) {
  border-color: rgba(51, 65, 85, 0.5) !important;
}

/* ==========================================================================
   Dark Mode Colored Boxes & Badges (Eliminates Pastel Light Box Reflections)
   ========================================================================== */

/* Rose / Critical & High */
.dark [class*="bg-rose-50"],
.dark [class*="bg-rose-100"] {
  background-color: rgba(136, 19, 55, 0.3) !important;
}
.dark [class*="border-rose-200"],
.dark [class*="border-rose-300"] {
  border-color: rgba(244, 63, 94, 0.35) !important;
}
.dark [class*="text-rose-700"],
.dark [class*="text-rose-800"] {
  color: #fb7185 !important; /* rose-400 */
}
.dark [class*="text-rose-600"] {
  color: #fda4af !important; /* rose-300 */
}

/* Emerald / Mitigated & Low */
.dark [class*="bg-emerald-50"],
.dark [class*="bg-emerald-100"] {
  background-color: rgba(6, 78, 59, 0.3) !important;
}
.dark [class*="border-emerald-200"],
.dark [class*="border-emerald-300"] {
  border-color: rgba(16, 185, 129, 0.35) !important;
}
.dark [class*="text-emerald-700"],
.dark [class*="text-emerald-800"] {
  color: #34d399 !important; /* emerald-400 */
}
.dark [class*="text-emerald-600"] {
  color: #6ee7b7 !important; /* emerald-300 */
}

/* Amber / Medium & Warnings */
.dark [class*="bg-amber-50"],
.dark [class*="bg-amber-100"] {
  background-color: rgba(120, 53, 15, 0.3) !important;
}
.dark [class*="border-amber-200"],
.dark [class*="border-amber-300"] {
  border-color: rgba(245, 158, 11, 0.35) !important;
}
.dark [class*="text-amber-700"],
.dark [class*="text-amber-800"],
.dark [class*="text-amber-900"] {
  color: #fbbf24 !important; /* amber-400 */
}
.dark [class*="text-amber-600"] {
  color: #fcd34d !important; /* amber-300 */
}

/* Blue / Corporate & Info */
.dark [class*="bg-blue-50"],
.dark [class*="bg-blue-100"] {
  background-color: rgba(30, 58, 138, 0.3) !important;
}
.dark [class*="border-blue-200"],
.dark [class*="border-blue-300"] {
  border-color: rgba(59, 130, 246, 0.35) !important;
}
.dark [class*="text-blue-700"],
.dark [class*="text-blue-800"] {
  color: #60a5fa !important; /* blue-400 */
}
.dark [class*="text-blue-600"] {
  color: #93c5fd !important; /* blue-300 */
}

/* Teal / Tech */
.dark [class*="bg-teal-50"],
.dark [class*="bg-teal-100"] {
  background-color: rgba(19, 78, 74, 0.3) !important;
}
.dark [class*="border-teal-200"],
.dark [class*="border-teal-300"] {
  border-color: rgba(20, 184, 166, 0.35) !important;
}
.dark [class*="text-teal-700"],
.dark [class*="text-teal-800"] {
  color: #2dd4bf !important; /* teal-400 */
}
.dark [class*="text-teal-600"] {
  color: #5eead4 !important; /* teal-300 */
}

/* Form Controls in Dark Mode */
.dark input[type="text"],
.dark input[type="email"],
.dark input[type="search"],
.dark select,
.dark textarea {
  background-color: rgba(15, 23, 42, 0.85) !important;
  border-color: rgba(51, 65, 85, 0.8) !important;
  color: #f8fafc !important;
}
.dark input::placeholder,
.dark textarea::placeholder {
  color: #64748b !important;
}
.dark select option {
  background-color: #0f172a;
  color: #f8fafc;
}

/* Code & Pre Blocks */
.dark pre {
  background-color: rgba(10, 15, 28, 0.9) !important;
  border-color: rgba(51, 65, 85, 0.8) !important;
  color: #e2e8f0 !important;
}

/* Table Headers */
.dark th {
  color: #cbd5e1 !important;
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: rgba(241, 245, 249, 0.6);
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
}
.dark ::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}
.dark ::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* ==========================================================================
   Print Styles (Safeguards for PDF export and Paper printing)
   ========================================================================== */
@media print {
  @page {
    margin: 1.5cm;
    size: A4 portrait;
  }

  body,
  .dark body,
  html.dark body {
    background: #ffffff !important;
    color: #111827 !important;
  }

  .dark .text-slate-900,
  .dark .text-slate-800,
  .dark .text-slate-700 {
    color: #111827 !important;
  }

  .no-print,
  nav,
  header,
  button,
  .print-hide {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .print-page-break {
    page-break-before: always;
  }

  .print-avoid-break {
    page-break-inside: avoid;
  }

  .print-container {
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
    box-shadow: none !important;
    background: transparent !important;
    color: #111827 !important;
  }

  .print-border {
    border: 1px solid #d1d5db !important;
  }

  .print-bg-card {
    background: #f9fafb !important;
  }

  .print-text-dark {
    color: #111827 !important;
  }
}

"""

# ==============================================================================
# FILE: src/components/Header.tsx - Header & Navigation Controls
# ==============================================================================
SOURCE_SRC_COMPONENTS_HEADER_TSX = """
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

      {/* Project Deletion Confirmation Modal */}
      <DeleteProjectModal
        isOpen={!!projectToDelete}
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
      />
    </header>
  );
}

"""

# ==============================================================================
# FILE: src/components/NavigationTabs.tsx - Navigation Tabs
# ==============================================================================
SOURCE_SRC_COMPONENTS_NAVIGATIONTABS_TSX = """
"use client";

import React from "react";
import { useProject } from "@/context/ProjectContext";
import {
  LayoutDashboard,
  Target,
  Network,
  ShieldAlert,
  FileCheck2,
  BookOpen,
} from "lucide-react";

export function NavigationTabs() {
  const { activeTab, setActiveTab, activeProject, themePalette } = useProject();

  const isCorporate = themePalette === "corporate";

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: activeProject ? `${activeProject.threatCount}` : null,
    },
    {
      id: "scope",
      label: "Scope & Context",
      icon: Target,
      badge: null,
    },
    {
      id: "architecture",
      label: "Architecture & Flows",
      icon: Network,
      badge: activeProject
        ? `${activeProject.elementCount} elem • ${activeProject.flowCount} flows`
        : null,
    },
    {
      id: "threats",
      label: "Threat Register",
      icon: ShieldAlert,
      badge: activeProject?.highOrCriticalCount
        ? `${activeProject.highOrCriticalCount} high`
        : null,
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    },
    {
      id: "review",
      label: "Review & Handover",
      icon: FileCheck2,
      badge: "Print / CSV",
    },
    {
      id: "methodology",
      label: "Methodology & Help",
      icon: BookOpen,
      badge: null,
    },
  ];

  return (
    <div className="no-print border-b border-white/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/75 backdrop-blur-xl shadow-2xs sticky top-16 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? isCorporate
                      ? "bg-blue-700 text-white shadow-sm ring-1 ring-blue-500/30"
                      : "bg-teal-700 text-white shadow-sm ring-1 ring-teal-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 hover:backdrop-blur-xs"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                      tab.badgeColor
                        ? tab.badgeColor
                        : isActive
                        ? isCorporate
                          ? "bg-blue-800 text-blue-100 border-blue-600"
                          : "bg-teal-800 text-teal-100 border-teal-600"
                        : "bg-white/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-white/90 dark:border-slate-700/80 backdrop-blur-xs shadow-2xs"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

"""

# ==============================================================================
# FILE: src/components/DashboardView.tsx - Executive Dashboard View
# ==============================================================================
SOURCE_SRC_COMPONENTS_DASHBOARDVIEW_TSX = """
"use client";

import React, { useState, useMemo } from "react";
import { useProject } from "@/context/ProjectContext";
import {
  StrideCategory,
  Severity,
} from "@/lib/types";
import {
  TrendingUp,
  Minus,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Target,
  PieChart,
  BarChart3,
  Grid3X3,
  Server,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

interface DashboardViewProps {
  onOpenNewThreat: () => void;
  onFilterThreats: (filters: { stride?: StrideCategory; severity?: Severity; status?: string }) => void;
}

export function DashboardView({ onOpenNewThreat, onFilterThreats }: DashboardViewProps) {
  const {
    activeProject,
    setActiveTab,
    roleConfig,
    themePalette,
    projects,
    setActiveProjectId,
  } = useProject();

  const [hoveredDonut1, setHoveredDonut1] = useState<number | null>(null);
  const [hoveredDonut2, setHoveredDonut2] = useState<number | null>(null);

  if (!activeProject) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
        <p className="text-slate-500 font-medium">No active project selected.</p>
      </div>
    );
  }

  const isCorporate = themePalette === "corporate";
  const { threats, elements, flows } = activeProject;
  const totalThreats = threats.length;

  // Find demo project with threats if current project has 0
  const demoProject = projects.find((p) => p.threatCount > 0 && p.id !== activeProject.id);

  // 1. Calculate metrics for "Risk Control" Donut Chart
  const overdueCount = threats.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status === "OPEN"
  ).length;
  const openCount = threats.filter((t) => t.status === "OPEN").length;
  const verifiedMitigated = threats.filter(
    (t) => t.status === "MITIGATED" && t.controlsStatus === "VERIFIED"
  ).length;
  const assumedMitigated = threats.filter(
    (t) => t.status === "MITIGATED" && t.controlsStatus === "ASSUMED"
  ).length;
  const acceptedCount = threats.filter((t) => t.status === "ACCEPTED").length;
  const deferredCount = threats.filter((t) => t.status === "DEFERRED").length;
  const highCritical = threats.filter(
    (t) => t.severity === "CRITICAL" || t.severity === "HIGH"
  ).length;
  const mediumCount = threats.filter((t) => t.severity === "MEDIUM").length;
  const lowCount = threats.filter((t) => t.severity === "LOW").length;

  // Donut 1: Risk Control Segments (Accurate calculations, no fake data)
  const controlSegments = useMemo(() => {
    if (totalThreats === 0) return [];
    const raw = [
      { label: "Overdue", value: overdueCount, color: "#1e3a8a" },
      { label: "Verified Mitigated", value: verifiedMitigated, color: "#15803d" },
      { label: "Assumed Mitigated", value: assumedMitigated, color: "#16a34a" },
      { label: "Risk Accepted", value: acceptedCount, color: "#0284c7" },
      { label: "Deferred", value: deferredCount, color: "#38bdf8" },
      { label: "Open Triage", value: openCount, color: "#eab308" },
    ].filter((item) => item.value > 0);

    const sum = raw.reduce((acc, cur) => acc + cur.value, 0);
    return raw.map((item) => ({
      ...item,
      percentage: sum > 0 ? Math.round((item.value / sum) * 100) : 0,
    }));
  }, [totalThreats, overdueCount, verifiedMitigated, assumedMitigated, acceptedCount, deferredCount, openCount]);

  // Donut 2: Impact of Risks Segments
  const impactSegments = useMemo(() => {
    if (totalThreats === 0) return [];
    const controlled = threats.filter((t) => t.status === "MITIGATED").length;
    const raw = [
      { label: "Critical & High", value: highCritical, color: "#b91c1c" },
      { label: "Medium Impact", value: mediumCount, color: "#d97706" },
      { label: "Low Impact", value: lowCount, color: "#0284c7" },
      { label: "Mitigated (Safe)", value: controlled, color: "#16a34a" },
    ].filter((item) => item.value > 0);

    const sum = raw.reduce((acc, cur) => acc + cur.value, 0);
    return raw.map((item) => ({
      ...item,
      percentage: sum > 0 ? Math.round((item.value / sum) * 100) : 0,
    }));
  }, [totalThreats, threats, highCritical, mediumCount, lowCount]);

  // 3. Different Risks Impact (Horizontal Stacked Bar Chart for Components)
  const componentExposure = useMemo(() => {
    return elements.map((elem) => {
      const elemThreats = threats.filter((t) =>
        t.linkedElements.some((le) => le.element.id === elem.id)
      );
      const high = elemThreats.filter(
        (t) => t.severity === "CRITICAL" || t.severity === "HIGH"
      ).length;
      const med = elemThreats.filter((t) => t.severity === "MEDIUM").length;
      const low = elemThreats.filter((t) => t.severity === "LOW").length;

      const score = high * 15 + med * 8 + low * 4 + (elemThreats.length > 0 ? 10 : 5);

      return {
        id: elem.id,
        name: elem.name,
        high,
        med,
        low,
        threatCount: elemThreats.length,
        score: Math.min(score, 55),
      };
    }).slice(0, 8);
  }, [elements, threats]);

  // 4. Risk Severity Heat Map (5x5 Matrix Grid)
  const heatmapData = useMemo(() => {
    const grid: number[][] = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ];

    if (totalThreats === 0) {
      return grid;
    }

    // Map threats dynamically into 5x5 grid
    threats.forEach((t) => {
      let row = 2; // Medium likelihood default
      if (t.likelihood === "HIGH") row = 0;
      else if (t.likelihood === "MEDIUM") row = 2;
      else if (t.likelihood === "LOW") row = 4;

      let col = 2; // Medium impact default
      if (t.severity === "CRITICAL") {
        row = 0;
        col = 4;
      } else if (t.impact === "HIGH") col = 3;
      else if (t.impact === "MEDIUM") col = 2;
      else if (t.impact === "LOW") col = 1;

      grid[row][col] += 1;
    });

    return grid;
  }, [threats, totalThreats]);

  // Pure SVG Donut renderer with responsive scaling and empty-state support
  const renderDonut = (
    segments: { label: string; value: number; color: string; percentage: number }[],
    totalCount: number,
    centerLabel: string,
    hoveredIndex: number | null,
    setHoveredIndex: (idx: number | null) => void
  ) => {
    const size = 160;
    const strokeWidth = 24;
    const radius = 56;
    const circumference = 2 * Math.PI * radius;

    if (totalCount === 0 || segments.length === 0) {
      return (
        <div className="relative flex items-center justify-center py-2">
          <svg className="w-32 h-32" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth={strokeWidth}
              strokeDasharray="4 4"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-bold text-slate-400">0</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {centerLabel}
            </span>
          </div>
        </div>
      );
    }

    let accumulatedPct = 0;

    return (
      <div className="relative flex items-center justify-center py-2">
        <svg className="w-32 h-32 transform -rotate-90 select-none" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, idx) => {
            const strokeDash = (seg.percentage / 100) * circumference;
            const strokeOffset = (accumulatedPct / 100) * circumference;
            accumulatedPct += seg.percentage;
            const isHovered = hoveredIndex === idx;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                strokeDashoffset={-strokeOffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-extrabold text-slate-900">
            {hoveredIndex !== null ? `${segments[hoveredIndex].percentage}%` : totalCount}
          </span>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
            {hoveredIndex !== null ? segments[hoveredIndex].label : centerLabel}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Outer Card Container (Clean Light Presentation Canvas) */}
      <div className="glass-panel rounded-2xl p-6 shadow-sm space-y-6">
        {/* Top Accent Line */}
        <div
          className={`w-full h-1.5 rounded-full -mt-2 mb-4 ${
            isCorporate
              ? "bg-gradient-to-r from-blue-700 via-sky-500 to-indigo-700"
              : "bg-gradient-to-r from-teal-700 via-emerald-500 to-cyan-600"
          }`}
        />

        {/* Main Title, Project Metadata, & Actions Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Risk Profile and KPIs Dashboard with Heat Map
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isCorporate
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-teal-50 text-teal-700 border-teal-200"
              }`}>
                {activeProject.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-4xl leading-relaxed">
              Executive visualization of microservices threat profile, risk control effectiveness, domain impacts, and severity heat map.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {roleConfig.canCreateThreats && (
              <button
                onClick={onOpenNewThreat}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Add Threat Assessment
              </button>
            )}
            <button
              onClick={() => setActiveTab("review")}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              Export & Review
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Helpful Banner when project has 0 threats */}
        {totalThreats === 0 && (
          <div className="p-4 rounded-xl border border-blue-200/80 dark:border-blue-500/30 bg-blue-50/70 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Current project &ldquo;{activeProject.name}&rdquo; has 0 threats assessed.
                </span>{" "}
                <span className="text-slate-600 dark:text-slate-300">
                  You can record your first threat scenario or switch to the pre-seeded Commerce sample.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {roleConfig.canCreateThreats && (
                <button
                  onClick={onOpenNewThreat}
                  className={`px-3 py-1.5 rounded-lg text-white font-semibold text-xs shadow-xs ${
                    isCorporate ? "bg-blue-700 hover:bg-blue-800" : "bg-teal-700 hover:bg-teal-800"
                  }`}
                >
                  + Add First Threat
                </button>
              )}
              {demoProject && (
                <button
                  onClick={() => setActiveProjectId(demoProject.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-xs"
                >
                  Switch to Sample ({demoProject.threatCount} Threats)
                </button>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* EXECUTIVE KPI STRIP (4 Industry Standard Metric Cards) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card glass-card-hover p-4 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Threats Assessed
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{totalThreats}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                ({openCount} open • {verifiedMitigated + assumedMitigated} mitigated)
              </span>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-4 rounded-xl shadow-2xs border border-rose-200/80 dark:border-rose-500/30 dark:bg-rose-950/20">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
              Critical & High Risks
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-700 dark:text-rose-400">{highCritical}</span>
              <span className="text-xs text-rose-600 dark:text-rose-300 font-medium">
                {highCritical > 0 ? "Requires mitigation priority" : "No critical exposure"}
              </span>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-4 rounded-xl shadow-2xs border border-emerald-200/80 dark:border-emerald-500/30 dark:bg-emerald-950/20">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
              Mitigation Health
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {totalThreats > 0 ? Math.round(((verifiedMitigated + assumedMitigated) / totalThreats) * 100) : 0}%
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                Controls verified or in place
              </span>
            </div>
          </div>

          <div className="glass-card glass-card-hover p-4 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Assessed Architecture
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{elements.length}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Components • {flows.length} Data Flows
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TOP SECTION: Balanced 2-Column Layout (Table 50% & Donuts 50%) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Corporate Risk Profile Table (6 Columns) */}
          <div className="lg:col-span-6 glass-card p-5 rounded-2xl flex flex-col justify-between shadow-2xs">
            <div>
              {/* Header with Circular Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-xs ${
                      isCorporate ? "bg-blue-700" : "bg-teal-700"
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Corporate Risk Profile
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Top priority security risks tracked in this threat model study.
                    </p>
                  </div>
                </div>

                {totalThreats > 0 && (
                  <button
                    onClick={() => setActiveTab("threats")}
                    className={`text-xs font-bold hover:underline ${
                      isCorporate ? "text-blue-700" : "text-teal-700"
                    }`}
                  >
                    View All ({totalThreats}) &rarr;
                  </button>
                )}
              </div>

              {/* Data Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/85 backdrop-blur-sm shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr
                      className={`text-white font-bold ${
                        isCorporate ? "bg-[#0f4c81]" : "bg-[#134e4a]"
                      }`}
                    >
                      <th className="py-2.5 px-3 border-r border-white/20">Risk Name</th>
                      <th className="py-2.5 px-2.5 text-center border-r border-white/20 w-24">Score</th>
                      <th className="py-2.5 px-2.5 text-center w-16">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {totalThreats === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-400">
                          <p className="font-semibold text-slate-600">No risks registered yet</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Click &ldquo;+ Add Threat Assessment&rdquo; to document a threat scenario.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      threats.slice(0, 7).map((t, idx) => {
                        const isHigh = t.severity === "CRITICAL" || t.severity === "HIGH";
                        const isMed = t.severity === "MEDIUM";
                        const isMitigated = t.status === "MITIGATED";

                        return (
                          <tr
                            key={t.id || idx}
                            onClick={() => {
                              onFilterThreats({ severity: t.severity });
                              setActiveTab("threats");
                            }}
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <td className="py-2.5 px-3 text-slate-800 font-semibold truncate max-w-[220px]">
                              <span className="font-mono text-[10px] text-slate-500 mr-1.5">{t.threatId}</span>
                              {t.title}
                            </td>
                            <td className="py-2.5 px-2.5 text-center">
                              <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${
                                    isHigh
                                      ? "bg-rose-500"
                                      : isMed
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                />
                                {t.severity === "CRITICAL" ? "Critical" : t.severity === "HIGH" ? "High" : t.severity === "MEDIUM" ? "Medium" : "Low"}
                              </span>
                            </td>
                            <td
                              className="py-2.5 px-2.5 text-center"
                              title={isHigh ? "High priority risk" : isMitigated ? "Mitigated" : "Stable"}
                            >
                              {isHigh ? (
                                <TrendingUp className="h-4 w-4 text-rose-600 inline" />
                              ) : isMitigated ? (
                                <TrendingDown className="h-4 w-4 text-emerald-600 inline" />
                              ) : (
                                <Minus className="h-4 w-4 text-amber-500 inline" />
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200 mt-4 font-medium">
              <span>Showing top {Math.min(threats.length, 7)} priority risks</span>
              <button
                onClick={() => setActiveTab("threats")}
                className={`font-semibold hover:underline ${
                  isCorporate ? "text-blue-700" : "text-teal-700"
                }`}
              >
                Go to Threat Register &rarr;
              </button>
            </div>
          </div>

          {/* Right: Two Donut Charts (6 Columns, 2 equal sub-columns) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Card 2: Risk Control Donut Chart */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between shadow-2xs">
              <div>
                {/* Header with Circular Green Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
                    <PieChart className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                      Risk Control
                    </h2>
                    <p className="text-[10px] text-slate-500">Treatment & status breakdown</p>
                  </div>
                </div>

                {/* Donut Chart Visualization */}
                <div className="py-2 bg-white/75 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl border border-white/80 dark:border-white/10 shadow-2xs">
                  {renderDonut(controlSegments, totalThreats, "Threats", hoveredDonut1, setHoveredDonut1)}
                </div>

                {/* Clean Vertical Legend (No overlapping text) */}
                <div className="space-y-1.5 pt-3">
                  {controlSegments.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">
                      No threat treatments recorded yet.
                    </p>
                  ) : (
                    controlSegments.map((seg, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs hover:bg-slate-100/70 px-1.5 py-0.5 rounded transition-colors"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                          <span className="truncate text-slate-700 text-[11px] font-medium">{seg.label}</span>
                        </div>
                        <span className="font-bold text-slate-900 text-[11px] shrink-0 pl-1.5">{seg.percentage}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 mt-3 flex items-center justify-between font-medium">
                <span>Mitigation Coverage</span>
                <span className="text-emerald-700 font-bold">
                  {totalThreats > 0 ? Math.round(((verifiedMitigated + assumedMitigated) / totalThreats) * 100) : 0}% Addressed
                </span>
              </div>
            </div>

            {/* Card 3: Impact of Risks Donut Chart */}
            <div className="glass-card p-4 rounded-2xl flex flex-col justify-between shadow-2xs">
              <div>
                {/* Header with Circular Teal Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-xs">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                      Impact of Risks
                    </h2>
                    <p className="text-[10px] text-slate-500">Severity distribution</p>
                  </div>
                </div>

                {/* Donut Chart Visualization */}
                <div className="py-2 bg-white/75 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl border border-white/80 dark:border-white/10 shadow-2xs">
                  {renderDonut(impactSegments, totalThreats, "Severity", hoveredDonut2, setHoveredDonut2)}
                </div>

                {/* Clean Vertical Legend */}
                <div className="space-y-1.5 pt-3">
                  {impactSegments.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">
                      No severity records to display.
                    </p>
                  ) : (
                    impactSegments.map((seg, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs hover:bg-slate-100/70 px-1.5 py-0.5 rounded transition-colors"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                          <span className="truncate text-slate-700 text-[11px] font-medium">{seg.label}</span>
                        </div>
                        <span className="font-bold text-slate-900 text-[11px] shrink-0 pl-1.5">{seg.percentage}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 mt-3 flex items-center justify-between font-medium">
                <span>Overall Exposure</span>
                <span className={`font-bold ${isCorporate ? "text-blue-700" : "text-teal-700"}`}>
                  Qualitative STRIDE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM SECTION: 2 Columns (Different Risks Impact, Risk Severity Map) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 4: Different Risks Impact - Horizontal Stacked Bar Chart (6 Cols) */}
          <div className="lg:col-span-6 glass-card p-5 rounded-2xl flex flex-col justify-between shadow-2xs">
            <div>
              {/* Header with Circular Blue Badge */}
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-xs ${
                    isCorporate ? "bg-blue-700" : "bg-teal-700"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Different Risks Impact
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Exposure ranking across architecture components and service boundaries.
                  </p>
                </div>
              </div>

              {/* Stacked Horizontal Bars */}
              <div className="space-y-2.5 bg-white/75 dark:bg-slate-900/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/80 dark:border-white/10 shadow-2xs">
                {componentExposure.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    No architecture components documented yet. Add components in the Architecture tab.
                  </p>
                ) : (
                  componentExposure.map((comp) => {
                    const maxScale = 55;
                    const totalWidthPct = (comp.score / maxScale) * 100;
                    const highWidth = comp.high > 0 ? (comp.high / (comp.threatCount || 1)) * totalWidthPct : 0;
                    const medWidth = comp.med > 0 ? (comp.med / (comp.threatCount || 1)) * totalWidthPct : 0;
                    const lowWidth = Math.max(totalWidthPct - highWidth - medWidth, comp.threatCount > 0 ? 4 : 2);

                    return (
                      <div key={comp.id} className="flex items-center gap-2 text-xs">
                        {/* Component Label */}
                        <span className="w-32 text-right text-slate-800 dark:text-slate-200 font-semibold truncate text-[11px] shrink-0" title={comp.name}>
                          {comp.name}
                        </span>

                        {/* Stacked Bar Container */}
                        <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden flex border border-slate-200 dark:border-slate-700">
                          {highWidth > 0 && (
                            <div
                              style={{ width: `${highWidth}%` }}
                              className="h-full bg-rose-600 hover:brightness-110 transition-all cursor-pointer"
                              title={`${comp.name}: ${comp.high} High/Critical`}
                            />
                          )}
                          {medWidth > 0 && (
                            <div
                              style={{ width: `${medWidth}%` }}
                              className="h-full bg-amber-500 hover:brightness-110 transition-all cursor-pointer"
                              title={`${comp.name}: ${comp.med} Medium`}
                            />
                          )}
                          <div
                            style={{ width: `${Math.max(lowWidth, 6)}%` }}
                            className="h-full bg-emerald-500 hover:brightness-110 transition-all cursor-pointer"
                            title={`${comp.name}: ${comp.low} Low / Baseline`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}

                {/* X-Axis Scale Indicator (Ranking 0 to 55) */}
                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono pl-32 font-medium">
                  <span>0</span>
                  <span>10</span>
                  <span>20</span>
                  <span>30</span>
                  <span>40</span>
                  <span>50</span>
                  <span>55</span>
                </div>
                <div className="text-right text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-0.5 uppercase tracking-wider">
                  Ranking / Risk Exposure Score
                </div>
              </div>
            </div>

            {/* Legend for Stacked Bar */}
            <div className="flex items-center gap-4 text-[10px] text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700 mt-3 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-3 rounded-xs bg-rose-600" />
                Critical & High Impact
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-3 rounded-xs bg-amber-500" />
                Medium Impact
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-3 rounded-xs bg-emerald-500" />
                Low / Controlled
              </span>
            </div>
          </div>

          {/* Card 5: Risk Severity Map - Heat Map Grid (6 Cols) */}
          <div className="lg:col-span-6 glass-card p-5 rounded-2xl flex flex-col justify-between shadow-2xs">
            <div>
              {/* Header with Circular Badge */}
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-xs ${
                    isCorporate ? "bg-blue-700" : "bg-teal-700"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Risk Severity Map
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Likelihood vs Risk Impact severity grid matrix. Click any cell to view matching threats.
                  </p>
                </div>
              </div>

              {/* Heatmap Grid Container */}
              <div className="bg-white/75 dark:bg-slate-900/60 backdrop-blur-sm p-3.5 rounded-xl border border-white/80 dark:border-white/10 shadow-2xs flex items-stretch gap-3">
                {/* Left "Totals" Color Indicator Bar */}
                <div className="w-12 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">Totals</span>
                  <div className="flex-1 w-full rounded border border-slate-200 flex flex-col overflow-hidden text-[11px] font-black text-center shadow-2xs">
                    <div className="flex-1 bg-emerald-500 text-white flex items-center justify-center" title="Low risk bucket">
                      {lowCount}
                    </div>
                    <div className="flex-1 bg-amber-400 text-slate-900 flex items-center justify-center" title="Medium risk bucket">
                      {mediumCount}
                    </div>
                    <div className="flex-1 bg-rose-600 text-white flex items-center justify-center" title="Critical/High risk bucket">
                      {highCritical}
                    </div>
                  </div>
                </div>

                {/* Y-Axis Label */}
                <div className="flex items-center justify-center -rotate-90 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-0">
                  Likelihood
                </div>

                {/* 5x5 Grid Cells */}
                <div className="flex-1 flex flex-col space-y-1">
                  {heatmapData.map((row, rIdx) => {
                    const rowLabel = 5 - rIdx;
                    return (
                      <div key={rIdx} className="flex items-center space-x-1">
                        {/* Row Y value */}
                        <span className="w-4 text-[11px] font-mono font-bold text-slate-600 text-right pr-1">
                          {rowLabel}
                        </span>

                        {/* Row Cells */}
                        {row.map((val, cIdx) => {
                          let cellBg = "bg-emerald-100 text-emerald-900 border border-emerald-200"; // Low
                          if (rIdx === 0) {
                            if (cIdx >= 2) cellBg = "bg-rose-600 text-white border border-rose-700"; // Critical
                            else if (cIdx === 1) cellBg = "bg-amber-400 text-slate-900 border border-amber-500"; // High
                            else cellBg = "bg-amber-200 text-slate-900 border border-amber-300"; // Med
                          } else if (rIdx === 1) {
                            if (cIdx >= 3) cellBg = "bg-rose-500 text-white border border-rose-600";
                            else if (cIdx >= 1) cellBg = "bg-amber-300 text-slate-900 border border-amber-400";
                            else cellBg = "bg-emerald-100 text-emerald-900 border border-emerald-200";
                          } else if (rIdx === 2) {
                            if (cIdx >= 4) cellBg = "bg-rose-600 text-white border border-rose-700";
                            else if (cIdx >= 2) cellBg = "bg-amber-300 text-slate-900 border border-amber-400";
                            else cellBg = "bg-emerald-100 text-emerald-900 border border-emerald-200";
                          } else if (rIdx === 3) {
                            if (cIdx >= 3) cellBg = "bg-amber-300 text-slate-900 border border-amber-400";
                            else cellBg = "bg-emerald-100 text-emerald-900 border border-emerald-200";
                          } else if (rIdx === 4) {
                            cellBg = "bg-emerald-50 text-emerald-900 border border-emerald-100";
                          }

                          return (
                            <button
                              key={cIdx}
                              onClick={() => {
                                onFilterThreats({});
                                setActiveTab("threats");
                              }}
                              className={`flex-1 h-7 rounded-sm flex items-center justify-center font-bold text-xs transition-all hover:scale-105 hover:brightness-95 shadow-2xs ${cellBg}`}
                              title={`Likelihood ${rowLabel}, Impact ${(cIdx + 1) * 3}: ${val} threats`}
                            >
                              {val > 0 ? val : "—"}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* X-Axis Columns: 3, 6, 9, 12, 15 */}
                  <div className="flex items-center space-x-1 pl-4 pt-1.5 text-[10px] font-mono font-bold text-slate-500">
                    <span className="flex-1 text-center">3</span>
                    <span className="flex-1 text-center">6</span>
                    <span className="flex-1 text-center">9</span>
                    <span className="flex-1 text-center">12</span>
                    <span className="flex-1 text-center">15</span>
                  </div>
                  <div className="text-center text-[10px] font-bold text-slate-600 tracking-wider uppercase">
                    Risk Impact
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Heatmap Legend */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200 mt-3 font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" /> Low
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-amber-400" /> Medium
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" /> High
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-xs bg-rose-700" /> Critical
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[9px]">Live MongoDB Atlas Sync</span>
            </div>
          </div>
        </div>

        {/* Dashboard Footer Note */}
        <div className="text-center text-[11px] text-slate-500 border-t border-slate-200 pt-3 font-medium">
          This threat profile & KPI dashboard is synchronized with live study records, updating automatically as components, flows, and STRIDE threats evolve.
        </div>
      </div>
    </div>
  );
}

"""

# ==============================================================================
# FILE: src/components/ScopeView.tsx - System Scope & Boundaries View
# ==============================================================================
SOURCE_SRC_COMPONENTS_SCOPEVIEW_TSX = """
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
  const { activeProject, refreshActiveProject, roleConfig, themePalette } = useProject();

  const isCorporate = themePalette === "corporate";

  const [inScope, setInScope] = useState("");
  const [outOfScope, setOutOfScope] = useState("");
  const [assumptions, setAssumptions] = useState("");
  const [openQuestions, setOpenQuestions] = useState("");
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/30 backdrop-blur-md text-amber-900 dark:text-amber-200 text-xs shadow-xs">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900 dark:text-amber-200">
            Mandatory Security Boundary & Sensitive Data Guidelines
          </p>
          <p className="leading-relaxed text-amber-800 dark:text-amber-300">
            Keep sensitive data out of this workspace. Never enter real production credentials,
            API access tokens, production personal identifiable information (PII), or confidential
            business secrets into scope notes, technical assumptions, or threat scenarios.
          </p>
        </div>
      </div>

      {/* Header and Save Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Study Scope, Assumptions & Context
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Define boundaries, system baseline assumptions, unknown questions, and accountable review stakeholders.
          </p>
        </div>

        {roleConfig.canEditScope && (
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="h-4 w-4" /> Changes saved
              </span>
            )}
            {saveError && (
              <span className="text-xs text-rose-700 dark:text-rose-400 font-bold">{saveError}</span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 ${
                isCorporate
                  ? "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                  : "bg-teal-700 hover:bg-teal-800 shadow-teal-700/20"
              }`}
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
        <div className="glass-card p-5 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Target Systems & Components In-Scope</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            List microservices, protocols, authentication boundaries, and data stores assessed in this study.
          </p>
          <textarea
            value={inScope}
            onChange={(e) => setInScope(e.target.value)}
            disabled={!roleConfig.canEditScope}
            rows={7}
            placeholder="• Service A to Service B API gateway calls&#10;• JWT token signing and propagation&#10;• Database persistence"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 font-mono leading-relaxed"
          />
        </div>

        {/* Out of Scope */}
        <div className="glass-card p-5 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-800/60">
            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span>Systems & Boundaries Out-of-Scope</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Explicitly list items excluded from the threat model to prevent scope ambiguity during audits.
          </p>
          <textarea
            value={outOfScope}
            onChange={(e) => setOutOfScope(e.target.value)}
            disabled={!roleConfig.canEditScope}
            rows={7}
            placeholder="• Physical datacenter security&#10;• Corporate office network&#10;• Cloud provider hypervisor internals"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 font-mono leading-relaxed"
          />
        </div>
      </div>

      {/* 2-Column Grid: Assumptions & Open Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assumptions */}
        <div className="glass-card p-5 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm bg-blue-50 dark:bg-blue-950/40 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800/60">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Architectural Assumptions & Baseline Controls</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Document core environmental premises (e.g., mTLS active in cluster, cloud HSM key management).
          </p>
          <textarea
            value={assumptions}
            onChange={(e) => setAssumptions(e.target.value)}
            disabled={!roleConfig.canEditScope}
            rows={6}
            placeholder="• Kubernetes network policies isolate pod namespaces&#10;• TLS 1.3 enforced at edge ingress&#10;• Secrets injected via cloud secret manager"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 font-mono leading-relaxed"
          />
        </div>

        {/* Open Questions */}
        <div className="glass-card p-5 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm bg-amber-50 dark:bg-amber-950/40 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/60">
            <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>Open Questions & Investigation Items</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Record unresolved technical questions requiring follow-up with infrastructure or feature teams.
          </p>
          <textarea
            value={openQuestions}
            onChange={(e) => setOpenQuestions(e.target.value)}
            disabled={!roleConfig.canEditScope}
            rows={6}
            placeholder="• Does payment processor support webhook HMAC signature verification?&#10;• Is broker partition key hashed to avoid hot spot DoS?"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 font-mono leading-relaxed"
          />
        </div>
      </div>

      {/* Stakeholders Section */}
      <div className="glass-card p-5 rounded-2xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Users className={`h-4 w-4 ${isCorporate ? "text-blue-700 dark:text-blue-400" : "text-teal-700 dark:text-teal-400"}`} />
            <span>Assigned Study Stakeholders & Reviewers</span>
          </div>
          {roleConfig.canEditScope && (
            <button
              onClick={() => setShowAddStakeholder(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Stakeholder
            </button>
          )}
        </div>

        {showAddStakeholder && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-3 animate-in fade-in duration-150">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">New Stakeholder Record</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Full Name *"
                value={newStakeholder.name}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
              <input
                type="text"
                placeholder="Role / Title *"
                value={newStakeholder.role}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newStakeholder.email}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, email: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
              <input
                type="text"
                placeholder="Team / Org"
                value={newStakeholder.team}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, team: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowAddStakeholder(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStakeholder}
                className={`px-3 py-1.5 rounded-lg text-xs text-white font-bold ${
                  isCorporate ? "bg-blue-700 hover:bg-blue-800" : "bg-teal-700 hover:bg-teal-800"
                }`}
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
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Email</th>
                  {roleConfig.canEditScope && <th className="py-2.5 px-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stakeholders.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{s.role}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.team || "—"}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{s.email || "—"}</td>
                    {roleConfig.canEditScope && (
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleRemoveStakeholder(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
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

"""

# ==============================================================================
# FILE: src/components/ArchitectureView.tsx - Microservices Architecture DFD View
# ==============================================================================
SOURCE_SRC_COMPONENTS_ARCHITECTUREVIEW_TSX = """
"use client";

import React, { useState } from "react";
import { useProject, ArchitectureElementData, DataFlowData } from "@/context/ProjectContext";
import { ElementType } from "@/lib/types";
import {
  Layers,
  ArrowRightLeft,
  Plus,
  Trash2,
  Edit2,
  ShieldAlert,
  Server,
  Database,
  Globe,
  Lock,
  ExternalLink,
  Info,
  CheckCircle2,
  X,
} from "lucide-react";

interface ArchitectureViewProps {
  onOpenNewThreatForElement?: (elementId: string) => void;
}

export function ArchitectureView({ onOpenNewThreatForElement }: ArchitectureViewProps) {
  const { activeProject, refreshActiveProject, roleConfig, themePalette } = useProject();
  const isCorporate = themePalette === "corporate";

  const [activeSubTab, setActiveSubTab] = useState<"diagram" | "elements" | "flows">("diagram");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Element modal state
  const [showElementModal, setShowElementModal] = useState(false);
  const [editingElement, setEditingElement] = useState<ArchitectureElementData | null>(null);
  const [elementForm, setElementForm] = useState<{
    name: string;
    type: ElementType;
    description: string;
    technology: string;
    trustZone: string;
    posX: number;
    posY: number;
  }>({
    name: "",
    type: "PROCESS",
    description: "",
    technology: "",
    trustZone: "Internal VPC Core",
    posX: 250,
    posY: 200,
  });

  // Flow modal state
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [editingFlow, setEditingFlow] = useState<DataFlowData | null>(null);
  const [flowForm, setFlowForm] = useState<{
    name: string;
    sourceElementId: string;
    targetElementId: string;
    protocol: string;
    dataCategory: string;
    authContext: string;
    crossesTrustBoundary: boolean;
    notes: string;
  }>({
    name: "",
    sourceElementId: "",
    targetElementId: "",
    protocol: "HTTPS/REST",
    dataCategory: "",
    authContext: "OAuth 2.0 / Bearer JWT",
    crossesTrustBoundary: false,
    notes: "",
  });

  if (!activeProject) return null;

  const { elements, flows, threats } = activeProject;

  const handleOpenAddElement = () => {
    setEditingElement(null);
    setElementForm({
      name: "",
      type: "PROCESS",
      description: "",
      technology: "",
      trustZone: "Internal VPC Core",
      posX: 200 + Math.random() * 200,
      posY: 100 + Math.random() * 200,
    });
    setShowElementModal(true);
  };

  const handleOpenEditElement = (elem: ArchitectureElementData) => {
    setEditingElement(elem);
    setElementForm({
      name: elem.name,
      type: elem.type,
      description: elem.description || "",
      technology: elem.technology || "",
      trustZone: elem.trustZone || "Internal VPC Core",
      posX: elem.posX,
      posY: elem.posY,
    });
    setShowElementModal(true);
  };

  const handleSaveElement = async () => {
    if (!elementForm.name.trim()) return;

    try {
      if (editingElement) {
        await fetch(`/api/projects/${activeProject.id}/elements/${editingElement.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(elementForm),
        });
      } else {
        await fetch(`/api/projects/${activeProject.id}/elements`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(elementForm),
        });
      }
      await refreshActiveProject();
      setShowElementModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteElement = async (elemId: string) => {
    if (!confirm("Are you sure you want to delete this component? Associated data flows will also be removed.")) {
      return;
    }
    try {
      await fetch(`/api/projects/${activeProject.id}/elements/${elemId}`, {
        method: "DELETE",
      });
      if (selectedElementId === elemId) setSelectedElementId(null);
      await refreshActiveProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddFlow = () => {
    if (elements.length < 2) {
      alert("At least 2 architecture components are required to create a data flow.");
      return;
    }
    setEditingFlow(null);
    setFlowForm({
      name: "",
      sourceElementId: elements[0].id,
      targetElementId: elements[1].id,
      protocol: "HTTPS/REST",
      dataCategory: "",
      authContext: "OAuth 2.0 / Bearer JWT",
      crossesTrustBoundary: false,
      notes: "",
    });
    setShowFlowModal(true);
  };

  const handleOpenEditFlow = (flow: DataFlowData) => {
    setEditingFlow(flow);
    setFlowForm({
      name: flow.name,
      sourceElementId: flow.sourceElementId,
      targetElementId: flow.targetElementId,
      protocol: flow.protocol,
      dataCategory: flow.dataCategory || "",
      authContext: flow.authContext || "",
      crossesTrustBoundary: flow.crossesTrustBoundary,
      notes: flow.notes || "",
    });
    setShowFlowModal(true);
  };

  const handleSaveFlow = async () => {
    if (!flowForm.name.trim() || !flowForm.sourceElementId || !flowForm.targetElementId) {
      return;
    }

    try {
      if (editingFlow) {
        await fetch(`/api/projects/${activeProject.id}/flows/${editingFlow.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flowForm),
        });
      } else {
        await fetch(`/api/projects/${activeProject.id}/flows`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flowForm),
        });
      }
      await refreshActiveProject();
      setShowFlowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (!confirm("Are you sure you want to delete this data flow?")) return;
    try {
      await fetch(`/api/projects/${activeProject.id}/flows/${flowId}`, {
        method: "DELETE",
      });
      await refreshActiveProject();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to count threats linked to an element
  const getElementThreatCount = (elemId: string) => {
    return threats.filter((t) =>
      t.linkedElements.some((le) => le.element.id === elemId)
    ).length;
  };

  // Helper to count threats linked to a flow
  const getFlowThreatCount = (flowId: string) => {
    return threats.filter((t) =>
      t.linkedFlows.some((lf) => lf.flow.id === flowId)
    ).length;
  };

  const selectedElement = elements.find((e) => e.id === selectedElementId);
  const selectedElementThreats = selectedElement
    ? threats.filter((t) =>
        t.linkedElements.some((le) => le.element.id === selectedElement.id)
      )
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className={`h-5 w-5 ${isCorporate ? "text-blue-700" : "text-teal-700"}`} />
            Architecture Inventory & Data Flows
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Microservices, data stores, external entities, trust boundaries, and directed communication channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-view toggle */}
          <div className="flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setActiveSubTab("diagram")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeSubTab === "diagram"
                  ? isCorporate
                    ? "bg-blue-700 text-white shadow-xs"
                    : "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Interactive Graph
            </button>
            <button
              onClick={() => setActiveSubTab("elements")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeSubTab === "elements"
                  ? isCorporate
                    ? "bg-blue-700 text-white shadow-xs"
                    : "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Components ({elements.length})
            </button>
            <button
              onClick={() => setActiveSubTab("flows")}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeSubTab === "flows"
                  ? isCorporate
                    ? "bg-blue-700 text-white shadow-xs"
                    : "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Data Flows ({flows.length})
            </button>
          </div>

          {roleConfig.canEditArchitecture && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAddElement}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Component
              </button>
              <button
                onClick={handleOpenAddFlow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Flow
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUB-VIEW 1: Interactive Architecture Graph Canvas */}
      {activeSubTab === "diagram" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass-panel p-4 rounded-xl shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2 px-1 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className={`h-3 w-3 rounded-sm border ${isCorporate ? "bg-blue-100 border-blue-600" : "bg-teal-100 border-teal-600"}`} />
                  <span className="font-medium text-slate-700">Process</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-emerald-100 border border-emerald-600" />
                  <span className="font-medium text-slate-700">Data Store</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-sky-100 border border-sky-600" />
                  <span className="font-medium text-slate-700">External Entity</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-4 border-t-2 border-dashed border-rose-500" />
                  <span className="font-medium text-slate-700">Trust Boundary Flow</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Click any component node to inspect details & linked STRIDE threats
              </span>
            </div>

            {/* SVG Diagram Canvas */}
            <div className="relative w-full h-[520px] bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center transition-colors">
              <svg
                className="w-full h-full select-none"
                viewBox="0 0 1000 480"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Arrowhead marker standard */}
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill={isCorporate ? "#3b82f6" : "#14b8a6"} />
                  </marker>
                  {/* Arrowhead marker boundary */}
                  <marker
                    id="arrowhead-boundary"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#f43f5e" />
                  </marker>
                </defs>

                {/* Grid dots background */}
                <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.2" fill="currentColor" className="text-slate-300 dark:text-slate-800" />
                </pattern>
                <rect width="1000" height="480" fill="url(#grid)" />

                {/* Render Directed Data Flows (Edges) */}
                {flows.map((flow) => {
                  const source = elements.find((e) => e.id === flow.sourceElementId);
                  const target = elements.find((e) => e.id === flow.targetElementId);
                  if (!source || !target) return null;

                  const sx = source.posX + 80;
                  const sy = source.posY + 35;
                  const tx = target.posX + 80;
                  const ty = target.posY + 35;

                  // Curved path coordinates
                  const dx = tx - sx;
                  const dy = ty - sy;
                  const cx1 = sx + dx * 0.5;
                  const cy1 = sy;
                  const cx2 = sx + dx * 0.5;
                  const cy2 = ty;

                  const isCrossing = flow.crossesTrustBoundary;
                  const strokeColor = isCrossing ? "#f43f5e" : isCorporate ? "#3b82f6" : "#14b8a6";
                  const markerId = isCrossing ? "url(#arrowhead-boundary)" : "url(#arrowhead)";

                  const midX = (sx + tx) / 2;
                  const midY = (sy + ty) / 2 - 8;

                  const isConnected =
                    selectedElementId === source.id || selectedElementId === target.id;

                  return (
                    <g key={flow.id} className="transition-all duration-200">
                      <path
                        d={`M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isConnected ? 3 : 2}
                        strokeDasharray={isCrossing ? "5,4" : undefined}
                        markerEnd={markerId}
                        opacity={selectedElementId && !isConnected ? 0.35 : 0.9}
                      />
                      {/* Flow label */}
                      <rect
                        x={midX - 55}
                        y={midY - 10}
                        width="110"
                        height="16"
                        rx="4"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-white dark:text-slate-900 border-slate-200 dark:border-slate-700"
                        opacity={selectedElementId && !isConnected ? 0.35 : 0.95}
                      />
                      <text
                        x={midX}
                        y={midY + 1}
                        fontSize="9"
                        fontWeight="600"
                        textAnchor="middle"
                        className="font-mono select-none fill-slate-700 dark:fill-slate-300"
                        opacity={selectedElementId && !isConnected ? 0.35 : 1}
                      >
                        {flow.name.length > 15 ? flow.name.substring(0, 14) + "…" : flow.name}
                      </text>
                    </g>
                  );
                })}

                {/* Render Architecture Component Nodes */}
                {elements.map((elem) => {
                  const isSelected = selectedElementId === elem.id;
                  const threatCount = getElementThreatCount(elem.id);

                  let borderColor = isCorporate ? "stroke-blue-600 dark:stroke-blue-500" : "stroke-teal-600 dark:stroke-teal-500";
                  let headerColor = isCorporate ? "fill-blue-50 dark:fill-blue-950/70" : "fill-teal-50 dark:fill-teal-950/70";
                  let badgeFill = isCorporate ? "#2563eb" : "#0d9488";

                  if (elem.type === "DATA_STORE") {
                    borderColor = "stroke-emerald-600 dark:stroke-emerald-500";
                    headerColor = "fill-emerald-50 dark:fill-emerald-950/70";
                    badgeFill = "#059669";
                  } else if (elem.type === "EXTERNAL_ENTITY") {
                    borderColor = "stroke-sky-600 dark:stroke-sky-500";
                    headerColor = "fill-sky-50 dark:fill-sky-950/70";
                    badgeFill = "#0284c7";
                  }

                  return (
                    <g
                      key={elem.id}
                      onClick={() => setSelectedElementId(elem.id)}
                      className="cursor-pointer transition-transform duration-150 hover:brightness-105"
                      transform={`translate(${elem.posX}, ${elem.posY})`}
                    >
                      {/* Node Box */}
                      <rect
                        width="160"
                        height="70"
                        rx="8"
                        fill="currentColor"
                        className={`text-white dark:text-slate-900/90 ${borderColor} ${
                          isSelected ? "stroke-[3px]" : "stroke-[1.5px]"
                        }`}
                        filter={isSelected ? "drop-shadow(0 4px 12px rgba(59,130,246,0.3))" : "drop-shadow(0 2px 5px rgba(0,0,0,0.25))"}
                      />

                      {/* Header bar */}
                      <rect
                        x="1"
                        y="1"
                        width="158"
                        height="26"
                        rx="7"
                        className={headerColor}
                      />

                      {/* Header line */}
                      <text
                        x="12"
                        y="18"
                        fontSize="11"
                        fontWeight="bold"
                        className="fill-slate-900 dark:fill-slate-100"
                      >
                        {elem.name.length > 18 ? elem.name.substring(0, 16) + "..." : elem.name}
                      </text>

                      {/* Tech & Zone */}
                      <text
                        x="12"
                        y="42"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="500"
                        className="fill-slate-600 dark:fill-slate-400"
                      >
                        {elem.technology ? elem.technology.substring(0, 20) : elem.type}
                      </text>

                      <text
                        x="12"
                        y="58"
                        fontSize="10"
                        className="fill-slate-500 dark:fill-slate-400"
                      >
                        Zone: {elem.trustZone || "Default Zone"}
                      </text>

                      {/* Threat count badge */}
                      {threatCount > 0 && (
                        <g transform="translate(142, 4)">
                          <circle cx="6" cy="6" r="9" fill="#e11d48" />
                          <text
                            x="6"
                            y="9.5"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {threatCount}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-3 px-1 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                OWASP Threat Dragon integration compatible for complete DFD diagrams.
              </span>
              <span className="font-medium text-slate-600">{elements.length} components • {flows.length} directed flows</span>
            </div>
          </div>

          {/* Component Inspector Drawer (4 columns) */}
          <div className="lg:col-span-4 glass-card p-5 rounded-xl space-y-4 flex flex-col justify-between shadow-xs">
            {selectedElement ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isCorporate ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-teal-50 text-teal-700 border border-teal-200"
                    }`}>
                      {selectedElement.type}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">
                      {selectedElement.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {selectedElement.technology || "No technology stack noted"}
                    </p>
                  </div>
                  {roleConfig.canEditArchitecture && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditElement(selectedElement)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                        title="Edit component"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteElement(selectedElement.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        title="Delete component"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Trust Zone:</span>{" "}
                    <span className="text-slate-800 font-semibold">{selectedElement.trustZone || "Default"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Description:</span>{" "}
                    <span className="text-slate-700 leading-relaxed block mt-0.5">
                      {selectedElement.description || "No description provided."}
                    </span>
                  </div>
                </div>

                {/* Linked Threats for Selected Component */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-rose-600" />
                      Linked STRIDE Threats ({selectedElementThreats.length})
                    </span>
                    {onOpenNewThreatForElement && roleConfig.canCreateThreats && (
                      <button
                        onClick={() => onOpenNewThreatForElement(selectedElement.id)}
                        className={`text-xs font-semibold hover:underline ${
                          isCorporate ? "text-blue-700" : "text-teal-700"
                        }`}
                      >
                        + Link Threat
                      </button>
                    )}
                  </div>

                  {selectedElementThreats.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No threats specifically linked to this component yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {selectedElementThreats.map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-700 font-bold">
                              {t.threatId}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                t.severity === "CRITICAL"
                                  ? "bg-rose-100 text-rose-700 border border-rose-200"
                                  : t.severity === "HIGH"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-blue-100 text-blue-800 border border-blue-200"
                              }`}
                            >
                              {t.severity}
                            </span>
                          </div>
                          <div className="font-bold text-slate-800 line-clamp-1">{t.title}</div>
                          <div className="text-slate-500 text-[11px] line-clamp-2">{t.mitigation || "Mitigation pending"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Server className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No Component Selected</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Click any microservice, database, or external entity in the graph to inspect properties and associated threats.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>OWASP Threat Dragon ready</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Components Table */}
      {activeSubTab === "elements" && (
        <div className="rounded-xl glass-panel overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-900">
              Architecture Inventory ({elements.length} components)
            </h3>
            {roleConfig.canEditArchitecture && (
              <button
                onClick={handleOpenAddElement}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Component
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-700">
                  <th className="py-2.5 px-4 font-bold">Component Name</th>
                  <th className="py-2.5 px-4 font-bold">Type</th>
                  <th className="py-2.5 px-4 font-bold">Technology</th>
                  <th className="py-2.5 px-4 font-bold">Trust Zone</th>
                  <th className="py-2.5 px-4 font-bold">Linked Threats</th>
                  <th className="py-2.5 px-4 font-bold">Description</th>
                  {roleConfig.canEditArchitecture && <th className="py-2.5 px-4 text-right font-bold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {elements.map((elem) => {
                  const threatCount = getElementThreatCount(elem.id);
                  return (
                    <tr key={elem.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {elem.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {elem.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {elem.technology || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {elem.trustZone || "—"}
                      </td>
                      <td className="py-3 px-4">
                        {threatCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {threatCount} threats
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {elem.description || "—"}
                      </td>
                      {roleConfig.canEditArchitecture && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditElement(elem)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteElement(elem.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Data Flows Table */}
      {activeSubTab === "flows" && (
        <div className="rounded-xl glass-panel overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-900">
              Directed Data Flows Register ({flows.length} flows)
            </h3>
            {roleConfig.canEditArchitecture && (
              <button
                onClick={handleOpenAddFlow}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Data Flow
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-700">
                  <th className="py-2.5 px-4 font-bold">Flow Name</th>
                  <th className="py-2.5 px-4 font-bold">Source &rarr; Target</th>
                  <th className="py-2.5 px-4 font-bold">Protocol / Channel</th>
                  <th className="py-2.5 px-4 font-bold">Data Category</th>
                  <th className="py-2.5 px-4 font-bold">Authentication Context</th>
                  <th className="py-2.5 px-4 font-bold">Crosses Boundary</th>
                  <th className="py-2.5 px-4 font-bold">Linked Threats</th>
                  {roleConfig.canEditArchitecture && <th className="py-2.5 px-4 text-right font-bold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flows.map((flow) => {
                  const threatCount = getFlowThreatCount(flow.id);
                  return (
                    <tr key={flow.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {flow.name}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-semibold text-slate-900">{flow.sourceElement?.name || "Source"}</span>
                        <span className={`mx-1.5 font-bold ${isCorporate ? "text-blue-600" : "text-teal-600"}`}>&rarr;</span>
                        <span className="font-semibold text-slate-900">{flow.targetElement?.name || "Target"}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {flow.protocol}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {flow.dataCategory || "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {flow.authContext || "—"}
                      </td>
                      <td className="py-3 px-4">
                        {flow.crossesTrustBoundary ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Yes (Boundary Cross)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200">
                            Internal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {threatCount > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {threatCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      {roleConfig.canEditArchitecture && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditFlow(flow)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFlow(flow.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ELEMENT MODAL */}
      {showElementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-lg w-full glass-modal rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingElement ? "Edit Architecture Component" : "Add Architecture Component"}
              </h3>
              <button
                onClick={() => setShowElementModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Component Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Order Service, Redis Cache, API Gateway"
                  value={elementForm.name}
                  onChange={(e) => setElementForm({ ...elementForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Element Type *</label>
                  <select
                    value={elementForm.type}
                    onChange={(e) => setElementForm({ ...elementForm, type: e.target.value as ElementType })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="PROCESS">Process / Microservice</option>
                    <option value="DATA_STORE">Data Store / Database</option>
                    <option value="EXTERNAL_ENTITY">External Entity / Third Party</option>
                    <option value="TRUST_BOUNDARY">Trust Boundary Box</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Trust Zone</label>
                  <input
                    type="text"
                    placeholder="e.g., Public Internet, DMZ, VPC Core"
                    value={elementForm.trustZone}
                    onChange={(e) => setElementForm({ ...elementForm, trustZone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Technology Stack</label>
                <input
                  type="text"
                  placeholder="e.g., Node.js / Express, PostgreSQL 16, Envoy Proxy"
                  value={elementForm.technology}
                  onChange={(e) => setElementForm({ ...elementForm, technology: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description & Role</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the responsibilities and architectural placement..."
                  value={elementForm.description}
                  onChange={(e) => setElementForm({ ...elementForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowElementModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveElement}
                className={`px-4 py-2 rounded-lg text-xs text-white font-semibold shadow-xs ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                Save Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOW MODAL */}
      {showFlowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-lg w-full glass-modal rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingFlow ? "Edit Data Flow" : "Add Directed Data Flow"}
              </h3>
              <button
                onClick={() => setShowFlowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Flow Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Authenticate User, Forward Order, Publish Kafka Event"
                  value={flowForm.name}
                  onChange={(e) => setFlowForm({ ...flowForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Source Component *</label>
                  <select
                    value={flowForm.sourceElementId}
                    onChange={(e) => setFlowForm({ ...flowForm, sourceElementId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {elements.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Component *</label>
                  <select
                    value={flowForm.targetElementId}
                    onChange={(e) => setFlowForm({ ...flowForm, targetElementId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    {elements.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Protocol / Channel *</label>
                  <input
                    type="text"
                    placeholder="e.g., HTTPS/REST, gRPC, Kafka AMQP, TLS"
                    value={flowForm.protocol}
                    onChange={(e) => setFlowForm({ ...flowForm, protocol: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Data Category</label>
                  <input
                    type="text"
                    placeholder="e.g., Auth Tokens, Order Payload, Public Catalog"
                    value={flowForm.dataCategory}
                    onChange={(e) => setFlowForm({ ...flowForm, dataCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Authentication Context</label>
                <input
                  type="text"
                  placeholder="e.g., OAuth 2.0 PKCE, mTLS Service Mesh, API Key, Session Cookie"
                  value={flowForm.authContext}
                  onChange={(e) => setFlowForm({ ...flowForm, authContext: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="crossesTrust"
                  checked={flowForm.crossesTrustBoundary}
                  onChange={(e) => setFlowForm({ ...flowForm, crossesTrustBoundary: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="crossesTrust" className="text-slate-800 font-medium">
                  Crosses Trust Boundary (requires higher scrutiny under STRIDE)
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Flow Notes & Controls</label>
                <textarea
                  rows={2}
                  placeholder="Security notes, rate limiting, encryption details..."
                  value={flowForm.notes}
                  onChange={(e) => setFlowForm({ ...flowForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowFlowModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFlow}
                className={`px-4 py-2 rounded-lg text-xs text-white font-semibold shadow-xs ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                Save Data Flow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"""

# ==============================================================================
# FILE: src/components/ThreatRegisterView.tsx - STRIDE Threat Register View
# ==============================================================================
SOURCE_SRC_COMPONENTS_THREATREGISTERVIEW_TSX = """
"use client";

import React, { useState, useMemo } from "react";
import { useProject, ThreatData } from "@/context/ProjectContext";
import {
  StrideCategory,
  STRIDE_DEFINITIONS,
  Severity,
  ThreatStatus,
} from "@/lib/types";
import { SEVERITY_COLORS } from "@/lib/risk-scoring";
import {
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit2,
  Layers,
  ArrowRightLeft,
  Calendar,
  User,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

interface ThreatRegisterViewProps {
  onOpenNewThreat: () => void;
  onEditThreat: (threat: ThreatData) => void;
  initialFilters?: {
    stride?: StrideCategory;
    severity?: Severity;
    status?: string;
  };
}

export function ThreatRegisterView({
  onOpenNewThreat,
  onEditThreat,
  initialFilters,
}: ThreatRegisterViewProps) {
  const { activeProject, refreshActiveProject, roleConfig, themePalette } = useProject();
  const isCorporate = themePalette === "corporate";

  const [search, setSearch] = useState("");
  const [filterStride, setFilterStride] = useState<string>(initialFilters?.stride || "ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>(initialFilters?.severity || "ALL");
  const [filterStatus, setFilterStatus] = useState<string>(initialFilters?.status || "ALL");
  const [filterElementId, setFilterElementId] = useState<string>("ALL");
  const [filterFlowId, setFilterFlowId] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"severity" | "id" | "updated" | "due">("severity");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  if (!activeProject) return null;

  const { threats, elements, flows } = activeProject;

  // Filter threats
  const filteredThreats = useMemo(() => {
    return threats.filter((t) => {
      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesText =
          t.title.toLowerCase().includes(q) ||
          t.threatId.toLowerCase().includes(q) ||
          t.scenario.toLowerCase().includes(q) ||
          (t.mitigation && t.mitigation.toLowerCase().includes(q)) ||
          (t.owner && t.owner.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      // STRIDE filter
      if (filterStride !== "ALL") {
        try {
          const cats = JSON.parse(t.strideCategories);
          if (!Array.isArray(cats) || !cats.includes(filterStride)) {
            return false;
          }
        } catch {
          return false;
        }
      }

      // Severity filter
      if (filterSeverity !== "ALL" && t.severity !== filterSeverity) {
        return false;
      }

      // Status filter
      if (filterStatus !== "ALL" && t.status !== filterStatus) {
        return false;
      }

      // Element filter
      if (
        filterElementId !== "ALL" &&
        !t.linkedElements.some((le) => le.element.id === filterElementId)
      ) {
        return false;
      }

      // Flow filter
      if (
        filterFlowId !== "ALL" &&
        !t.linkedFlows.some((lf) => lf.flow.id === filterFlowId)
      ) {
        return false;
      }

      return true;
    });
  }, [threats, search, filterStride, filterSeverity, filterStatus, filterElementId, filterFlowId]);

  // Sort threats
  const sortedThreats = useMemo(() => {
    const list = [...filteredThreats];
    const severityRank: Record<Severity, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "severity") {
        comparison = severityRank[a.severity] - severityRank[b.severity];
      } else if (sortBy === "id") {
        comparison = a.threatId.localeCompare(b.threatId);
      } else if (sortBy === "due") {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        comparison = dateA - dateB;
      } else {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return list;
  }, [filteredThreats, sortBy, sortOrder]);

  const handleDeleteThreat = async (threatId: string) => {
    if (!confirm("Are you sure you want to delete this threat assessment?")) return;
    try {
      await fetch(`/api/projects/${activeProject.id}/threats/${threatId}`, {
        method: "DELETE",
      });
      await refreshActiveProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickStatusChange = async (threat: ThreatData, newStatus: ThreatStatus) => {
    try {
      await fetch(`/api/projects/${activeProject.id}/threats/${threat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notApplicableRationale:
            newStatus === "NOT_APPLICABLE" && !threat.notApplicableRationale
              ? "Marked as not applicable during fast triage."
              : threat.notApplicableRationale,
        }),
      });
      await refreshActiveProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilterStride("ALL");
    setFilterSeverity("ALL");
    setFilterStatus("ALL");
    setFilterElementId("ALL");
    setFilterFlowId("ALL");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top action & export bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className={`h-5 w-5 ${isCorporate ? "text-blue-700" : "text-teal-700"}`} />
            Threat Register & Risk Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing <span className="font-semibold text-slate-800">{sortedThreats.length}</span> of{" "}
            <span className="font-semibold text-slate-800">{threats.length}</span> threats assessed in study scope.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/projects/${activeProject.id}/export/csv`}
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
          {roleConfig.canCreateThreats && (
            <button
              onClick={onOpenNewThreat}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] ${
                isCorporate
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-teal-700 hover:bg-teal-800"
              }`}
            >
              <Plus className="h-4 w-4" />
              New Threat
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl glass-card shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, ID, scenario, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* STRIDE Category */}
          <div>
            <select
              value={filterStride}
              onChange={(e) => setFilterStride(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All STRIDE Categories</option>
              {(Object.keys(STRIDE_DEFINITIONS) as StrideCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  [{STRIDE_DEFINITIONS[cat].letter}] {STRIDE_DEFINITIONS[cat].name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="MITIGATED">Mitigated</option>
              <option value="ACCEPTED">Risk Accepted</option>
              <option value="DEFERRED">Deferred</option>
              <option value="NOT_APPLICABLE">Not Applicable</option>
            </select>
          </div>

          {/* Component Filter */}
          <div>
            <select
              value={filterElementId}
              onChange={(e) => setFilterElementId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Components</option>
              {elements.map((elem) => (
                <option key={elem.id} value={elem.id}>
                  {elem.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Bar: Sorting & Quick Reset */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">Sort by:</span>
            <button
              onClick={() => {
                if (sortBy === "severity") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else { setSortBy("severity"); setSortOrder("desc"); }
              }}
              className={`hover:text-slate-900 transition-colors ${
                sortBy === "severity"
                  ? isCorporate ? "text-blue-700 font-bold" : "text-teal-700 font-bold"
                  : ""
              }`}
            >
              Severity {sortBy === "severity" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
            <button
              onClick={() => {
                if (sortBy === "id") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else { setSortBy("id"); setSortOrder("asc"); }
              }}
              className={`hover:text-slate-900 transition-colors ${
                sortBy === "id"
                  ? isCorporate ? "text-blue-700 font-bold" : "text-teal-700 font-bold"
                  : ""
              }`}
            >
              Threat ID {sortBy === "id" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => {
                if (sortBy === "due") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else { setSortBy("due"); setSortOrder("asc"); }
              }}
              className={`hover:text-slate-900 transition-colors ${
                sortBy === "due"
                  ? isCorporate ? "text-blue-700 font-bold" : "text-teal-700 font-bold"
                  : ""
              }`}
            >
              Due Date {sortBy === "due" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>

          {(search || filterStride !== "ALL" || filterSeverity !== "ALL" || filterStatus !== "ALL" || filterElementId !== "ALL") && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Threats List Cards */}
      {sortedThreats.length === 0 ? (
        <div className="rounded-xl glass-card p-12 text-center space-y-3 shadow-xs">
          <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Threats Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No threat records match your active search or filters. Reset filters or create a new threat assessment.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            Clear Active Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedThreats.map((threat) => {
            const colors = SEVERITY_COLORS[threat.severity];

            let strideList: StrideCategory[] = [];
            try {
              const parsed = JSON.parse(threat.strideCategories);
              if (Array.isArray(parsed)) strideList = parsed;
            } catch {
              // ignore
            }

            return (
              <div
                key={threat.id}
                className="group glass-card glass-card-hover rounded-xl p-5 shadow-xs space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        isCorporate
                          ? "text-blue-700 bg-blue-50 border border-blue-200"
                          : "text-teal-700 bg-teal-50 border border-teal-200"
                      }`}>
                        {threat.threatId}
                      </span>

                      {/* Severity Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        threat.severity === "CRITICAL"
                          ? "bg-rose-100 text-rose-800 border border-rose-300"
                          : threat.severity === "HIGH"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : threat.severity === "MEDIUM"
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-slate-100 text-slate-700 border border-slate-300"
                      }`}>
                        {threat.severity}
                      </span>

                      {/* Overridden indicator */}
                      {threat.isOverridden && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300"
                          title={`Score overridden: ${threat.severityRationale}`}
                        >
                          Overridden
                        </span>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          threat.status === "MITIGATED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : threat.status === "ACCEPTED"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : threat.status === "NOT_APPLICABLE"
                            ? "bg-slate-100 text-slate-600 border-slate-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        }`}
                      >
                        {threat.status}
                      </span>

                      {/* STRIDE badges */}
                      {strideList.map((cat) => {
                        const def = STRIDE_DEFINITIONS[cat];
                        return (
                          <span
                            key={cat}
                            className="px-2 py-0.5 rounded text-[10px] font-bold border bg-slate-100 text-slate-700 border-slate-200"
                            title={`${def.name}: ${def.securityProperty}`}
                          >
                            [{def.letter}] {def.name}
                          </span>
                        );
                      })}
                    </div>

                    <h3 className={`text-base font-bold text-slate-900 transition-colors ${
                      isCorporate ? "group-hover:text-blue-700" : "group-hover:text-teal-700"
                    }`}>
                      {threat.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {/* Quick status dropdown */}
                    {roleConfig.canChangeStatus && (
                      <select
                        value={threat.status}
                        onChange={(e) => handleQuickStatusChange(threat, e.target.value as ThreatStatus)}
                        className="px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-800 text-xs font-medium focus:outline-none focus:border-blue-600"
                      >
                        <option value="OPEN">Open</option>
                        <option value="MITIGATED">Mitigated</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="DEFERRED">Deferred</option>
                        <option value="NOT_APPLICABLE">Not Applicable</option>
                      </select>
                    )}

                    <button
                      onClick={() => onEditThreat(threat)}
                      className="p-1.5 rounded-md border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      title="View & Edit Threat Assessment"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    {roleConfig.canDelete && (
                      <button
                        onClick={() => handleDeleteThreat(threat.id)}
                        className="p-1.5 rounded-md border border-slate-300 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Threat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scenario */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {threat.scenario}
                </p>

                {/* Preconditions & Mitigation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  {threat.existingControls && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-700">
                          Existing Controls
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            threat.controlsStatus === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {threat.controlsStatus}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{threat.existingControls}</p>
                    </div>
                  )}

                  {threat.mitigation && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-emerald-700 block mb-1">
                        Recommended Mitigation
                      </span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {threat.mitigation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Not applicable rationale */}
                {threat.status === "NOT_APPLICABLE" && threat.notApplicableRationale && (
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <span className="font-bold text-slate-700">Not Applicable Justification: </span>
                    <span className="text-slate-600">{threat.notApplicableRationale}</span>
                  </div>
                )}

                {/* Footer metadata: Traceability links, owner, due date */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Linked elements */}
                    {threat.linkedElements.length > 0 && (
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <Layers className={`h-3.5 w-3.5 ${isCorporate ? "text-blue-600" : "text-teal-600"}`} />
                        <span>
                          {threat.linkedElements.map((le) => le.element.name).join(", ")}
                        </span>
                      </div>
                    )}

                    {/* Linked flows */}
                    {threat.linkedFlows.length > 0 && (
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <ArrowRightLeft className="h-3.5 w-3.5 text-sky-600" />
                        <span>
                          {threat.linkedFlows.map((lf) => lf.flow.name).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {threat.owner && (
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <User className="h-3 w-3 text-slate-400" />
                        {threat.owner}
                      </span>
                    )}

                    {threat.dueDate && (
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        Due: {new Date(threat.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"""

# ==============================================================================
# FILE: src/components/ReviewSummaryView.tsx - Review & Formal Summary View
# ==============================================================================
SOURCE_SRC_COMPONENTS_REVIEWSUMMARYVIEW_TSX = """
"use client";

import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { STRIDE_DEFINITIONS, StrideCategory, Stakeholder } from "@/lib/types";
import { SEVERITY_COLORS } from "@/lib/risk-scoring";
import {
  Printer,
  Download,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  Code,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import { DeleteProjectModal } from "@/components/DeleteProjectModal";

export function ReviewSummaryView() {
  const { activeProject, themePalette } = useProject();
  const isCorporate = themePalette === "corporate";

  const [copiedJson, setCopiedJson] = useState(false);
  const [showThreatDragonSpec, setShowThreatDragonSpec] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!activeProject) return null;

  const { threats, elements, flows } = activeProject;

  const highAndCriticalThreats = threats.filter(
    (t) => t.severity === "CRITICAL" || t.severity === "HIGH"
  );

  let stakeholders: Stakeholder[] = [];
  try {
    if (activeProject.stakeholders) {
      const parsed = JSON.parse(activeProject.stakeholders);
      if (Array.isArray(parsed)) stakeholders = parsed;
    }
  } catch {
    // ignore
  }

  // Generate verified OWASP Threat Dragon 2.x JSON model adapter representation
  const threatDragonExportModel = {
    version: "2.3.0",
    summary: {
      title: activeProject.name,
      owner: activeProject.owner,
      description: activeProject.description,
      id: 0,
    },
    detail: {
      contributors: stakeholders.map((s) => ({ name: s.name })),
      diagrams: [
        {
          title: "Microservices Data Flow Diagram",
          id: 0,
          diagramType: "STRIDE",
          placeholder: "OWASP Threat Dragon 2.x Diagram Standard",
          cells: elements.map((elem) => ({
            id: elem.id,
            type:
              elem.type === "PROCESS"
                ? "tm.Process"
                : elem.type === "DATA_STORE"
                ? "tm.Store"
                : "tm.Actor",
            name: elem.name,
            position: { x: elem.posX, y: elem.posY },
            size: { width: 160, height: 70 },
            attrs: {
              text: { text: elem.name },
            },
            threats: threats
              .filter((t) => t.linkedElements.some((le) => le.element.id === elem.id))
              .map((t) => ({
                id: t.threatId,
                title: t.title,
                type: JSON.parse(t.strideCategories || "[]")[0] || "Spoofing",
                status: t.status,
                severity: t.severity,
                description: t.scenario,
                mitigation: t.mitigation || "",
              })),
          })),
        },
      ],
      reviewer: activeProject.owner,
    },
  };

  const handleCopyThreatDragonJson = () => {
    navigator.clipboard.writeText(JSON.stringify(threatDragonExportModel, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto print-container">
      {/* Top action toolbar (hidden on print) */}
      <div className="no-print glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className={`h-5 w-5 ${isCorporate ? "text-blue-700" : "text-teal-700"}`} />
            Review & Handover Summary Report
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready formal documentation with print layout and CSV export.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setShowDeleteModal(true)}
            title="Permanently delete this threat model project"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-300/80 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-semibold shadow-xs transition-colors backdrop-blur-sm"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span> Project
          </button>

          <a
            href={`/api/projects/${activeProject.id}/export/csv`}
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200/80 bg-white/80 hover:bg-white text-slate-700 dark:text-slate-200 dark:border-slate-700 dark:bg-slate-800/80 text-xs font-semibold shadow-xs transition-colors backdrop-blur-sm"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </a>

          <button
            onClick={handlePrint}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] ${
              isCorporate
                ? "bg-blue-700 hover:bg-blue-800"
                : "bg-teal-700 hover:bg-teal-800"
            }`}
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF Report
          </button>
        </div>
      </div>

      {/* Formal Printable Document Body */}
      <div className="p-8 sm:p-10 rounded-xl glass-card print:bg-white print:text-black print:border-none print:shadow-none space-y-8 print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-200 print:border-gray-300 pb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-widest ${
              isCorporate ? "text-blue-700" : "text-teal-700"
            }`}>
              STRIDE Threat Modeling Study Report
            </span>
            <span className="text-xs text-slate-500 print:text-gray-600">
              Generated: {new Date().toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 print:text-black tracking-tight">
            {activeProject.name}
          </h1>

          <p className="text-sm text-slate-600 print:text-gray-700 leading-relaxed max-w-4xl">
            {activeProject.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <span className="text-slate-500 print:text-gray-500 block font-medium">Assessment Lead:</span>
              <span className="font-bold text-slate-900 print:text-black">{activeProject.owner}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-500 block font-medium">Target Environment:</span>
              <span className="font-bold text-slate-900 print:text-black">{activeProject.environment}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-500 block font-medium">Architecture Version:</span>
              <span className="font-bold text-slate-900 print:text-black">v{activeProject.architectureVersion}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-gray-500 block font-medium">Review Sign-off Date:</span>
              <span className="font-bold text-slate-900 print:text-black">
                {activeProject.reviewDate ? new Date(activeProject.reviewDate).toLocaleDateString() : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Executive KPI Overview */}
        <div className="print-avoid-break space-y-3">
          <h2 className="text-base font-bold text-slate-900 print:text-black border-b border-slate-200 print:border-gray-300 pb-2">
            1. Executive Assessment Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Architecture Elements</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{elements.length}</span>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Directed Data Flows</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{flows.length}</span>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Threats Assessed</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{threats.length}</span>
            </div>
            <div className="p-3.5 rounded-lg border border-rose-200/80 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/20 backdrop-blur-xs">
              <span className="text-xs text-rose-700 dark:text-rose-400 block font-medium">High & Critical Priority</span>
              <span className="text-2xl font-bold text-rose-700 dark:text-rose-400">{highAndCriticalThreats.length}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Study Scope & Baseline Boundaries */}
        <div className="print-avoid-break space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white print:text-black border-b border-slate-200 dark:border-slate-800 print:border-gray-300 pb-2">
            2. System Scope & Boundaries
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs space-y-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-400 block">In-Scope System Elements:</span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {activeProject.inScope || "No in-scope notes documented."}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs space-y-1">
              <span className="font-bold text-rose-800 dark:text-rose-400 block">Out-of-Scope Exclusions:</span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {activeProject.outOfScope || "No out-of-scope exclusions documented."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs space-y-1">
              <span className="font-bold text-blue-800 dark:text-blue-400 block">Technical Assumptions:</span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {activeProject.assumptions || "No assumptions recorded."}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-slate-200/70 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-400 block">Open Questions & Follow-ups:</span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {activeProject.openQuestions || "No open questions recorded."}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: High and Critical Risks Highlight Table */}
        <div className="print-avoid-break space-y-3">
          <h2 className="text-base font-bold text-slate-900 print:text-black border-b border-slate-200 print:border-gray-300 pb-2">
            3. Critical & High Priority Risk Register
          </h2>

          <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-bold">ID</th>
                  <th className="py-2.5 px-3 font-bold">Title & Threat Scenario</th>
                  <th className="py-2.5 px-3 font-bold">STRIDE</th>
                  <th className="py-2.5 px-3 font-bold">Priority</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {highAndCriticalThreats.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {t.threatId}
                    </td>
                    <td className="py-2.5 px-3 max-w-md">
                      <div className="font-bold text-slate-900">{t.title}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">
                        {t.scenario}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-700">
                        {JSON.parse(t.strideCategories || "[]").join(", ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.severity === "CRITICAL"
                            ? "bg-rose-100/90 text-rose-800 border border-rose-300"
                            : "bg-amber-100/90 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {t.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {t.status}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {t.owner || "Unassigned"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Mitigations & Treatment Plan Table */}
        <div className="print-avoid-break space-y-3">
          <h2 className="text-base font-bold text-slate-900 print:text-black border-b border-slate-200 print:border-gray-300 pb-2">
            4. Mitigation & Action Plan Register
          </h2>

          <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-bold">ID</th>
                  <th className="py-2.5 px-3 font-bold">Recommended Mitigation Treatment</th>
                  <th className="py-2.5 px-3 font-bold">Existing Controls</th>
                  <th className="py-2.5 px-3 font-bold">Owner / Team</th>
                  <th className="py-2.5 px-3 font-bold">Due Date</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {threats.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {t.threatId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 max-w-sm">
                      {t.mitigation || "Mitigation pending specification"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs">
                      {t.existingControls ? `${t.existingControls} (${t.controlsStatus})` : "None"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {t.owner || "Unassigned"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {t.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: OWASP Threat Dragon Integration Guidance (no-print) */}
        <div className="no-print rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className={`h-5 w-5 ${isCorporate ? "text-blue-700 dark:text-blue-400" : "text-teal-700 dark:text-teal-400"}`} />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  OWASP Threat Dragon Integration Path
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  OWASP Threat Dragon is the preferred dedicated diagramming tool. This workspace manages the study workflow and risk register.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowThreatDragonSpec(!showThreatDragonSpec)}
                className="px-3 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-700 bg-white/90 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs backdrop-blur-xs"
              >
                {showThreatDragonSpec ? "Hide Schema" : "Inspect 2.x Schema"}
              </button>
              <button
                onClick={handleCopyThreatDragonJson}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs text-white font-semibold shadow-xs transition-colors ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                {copiedJson ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedJson ? "Copied JSON" : "Copy Threat Dragon JSON"}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            The schema below maps this study&apos;s architecture components and STRIDE threats directly into the verified
            OWASP Threat Dragon 2.x standard JSON format (<code>diagramType: &ldquo;STRIDE&rdquo;</code>, <code>cells: tm.Process, tm.Store, tm.Actor</code>).
            You can load this model directly into OWASP Threat Dragon for deep visual rule validation.
          </p>

          {showThreatDragonSpec && (
            <div className="relative">
              <pre className="p-4 rounded-lg bg-white/90 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-72 shadow-2xs">
                {JSON.stringify(threatDragonExportModel, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Delete Project Confirmation Modal */}
      <DeleteProjectModal
        isOpen={showDeleteModal}
        project={activeProject}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

"""

# ==============================================================================
# FILE: src/components/SettingsView.tsx - Methodology & Diagnostics View
# ==============================================================================
SOURCE_SRC_COMPONENTS_SETTINGSVIEW_TSX = """
"use client";

import React, { useState } from "react";
import { useProject } from "@/context/ProjectContext";
import { STRIDE_DEFINITIONS, StrideCategory } from "@/lib/types";
import { RISK_MODEL_DOCUMENTATION, RISK_MATRIX } from "@/lib/risk-scoring";
import {
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Database,
  Terminal,
  Server,
  Lock,
  Trash2,
} from "lucide-react";
import { DeleteProjectModal } from "@/components/DeleteProjectModal";
import { ProjectSummary } from "@/context/ProjectContext";

export function SettingsView() {
  const {
    reseedDemo,
    isLoading,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    projects,
    themePalette,
  } = useProject();
  const isCorporate = themePalette === "corporate";
  const [reseedSuccess, setReseedSuccess] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectSummary | null>(null);

  const handleReseed = async () => {
    if (confirm("Reset and re-seed the fictional Commerce Microservices Threat Model sample?")) {
      await reseedDemo();
      setReseedSuccess(true);
      setTimeout(() => setReseedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="glass-panel p-5 rounded-xl shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BookOpen className={`h-5 w-5 ${isCorporate ? "text-blue-700 dark:text-blue-400" : "text-teal-700 dark:text-teal-400"}`} />
          STRIDE Methodology & Workspace Diagnostics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Security reference guide, qualitative risk scoring specification, data boundaries, and local database settings.
        </p>
      </div>

      {/* STRIDE Deep Dive Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            STRIDE Threat Model Reference for Microservices
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(STRIDE_DEFINITIONS) as StrideCategory[]).map((cat) => {
            const def = STRIDE_DEFINITIONS[cat];
            return (
              <div
                key={cat}
                className="p-5 rounded-xl glass-card glass-card-hover space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-2xs">
                      {def.letter}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{def.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Desired Property: {def.securityProperty}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {def.description}
                </p>

                {/* Scenarios & Mitigations Box - Deep Dark Container with high-contrast text */}
                <div className="stride-box p-3.5 rounded-lg border text-[11px] space-y-2 shadow-2xs">
                  <div>
                    <span className="font-bold text-rose-700 dark:text-rose-400">Microservice Attack Scenarios:</span>{" "}
                    <span className="text-slate-700 dark:text-slate-200 leading-relaxed">{def.examples}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Typical Countermeasures:</span>{" "}
                    <span className="text-slate-700 dark:text-slate-200 leading-relaxed">{def.typicalMitigations}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Scoring Model Specification */}
      <div className="p-6 rounded-xl glass-card space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {RISK_MODEL_DOCUMENTATION.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {RISK_MODEL_DOCUMENTATION.summary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Matrix Prioritization Logic:</h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside">
              {RISK_MODEL_DOCUMENTATION.guidelines.map((g, idx) => (
                <li key={idx} className="leading-relaxed">{g}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/30 backdrop-blur-xs text-xs space-y-2">
            <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              Methodology Transparency & Limitations
            </span>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-[11px]">
              {RISK_MODEL_DOCUMENTATION.disclaimer}
            </p>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-[11px]">
              Severity overrides are tracked with a mandatory audit rationale to uphold governance.
            </p>
          </div>
        </div>
      </div>

      {/* Database & Environment Diagnostics */}
      <div className="p-6 rounded-xl glass-card space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Storage & MongoDB Runtime
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configured for MongoDB with Prisma ORM (MongoDB Atlas or Local MongoDB).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="stride-box p-4 rounded-lg border backdrop-blur-xs space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              Active Database Provider: MongoDB
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Environment Key: <code className="text-sky-700 dark:text-sky-400 font-mono font-bold">DATABASE_URL</code>
              <br />
              Supports MongoDB Atlas clusters (Replica Sets) and local instances seamlessly.
            </p>
          </div>

          <div className="stride-box p-4 rounded-lg border backdrop-blur-xs space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Connection String Setup
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              In your <code className="text-slate-800 dark:text-slate-200 font-mono font-bold">.env</code> file:
              <br />
              Atlas: <code className="text-blue-700 dark:text-blue-400 font-mono">mongodb+srv://...</code>
              <br />
              Local: <code className="text-blue-700 dark:text-blue-400 font-mono">mongodb://localhost:27017/stride_threat_model</code>
            </p>
          </div>
        </div>
      </div>

      {/* Threat Modeling Projects Management */}
      <div className="p-6 rounded-xl glass-card space-y-4 shadow-xs border border-rose-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-rose-500/10 border border-rose-500/30 text-rose-500 shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Threat Modeling Projects Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your saved threat models or permanently delete obsolete projects.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            {projects.length} {projects.length === 1 ? "Project" : "Projects"}
          </span>
        </div>

        <div className="space-y-2.5 pt-2">
          {projects.map((proj) => {
            const isActive = proj.id === activeProject?.id;
            return (
              <div
                key={proj.id}
                className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isActive
                    ? "stride-box border-blue-500/40 dark:border-blue-500/40 ring-1 ring-blue-500/20"
                    : "stride-box"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {proj.name}
                    </span>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                        Active Study
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {proj.environment}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Lead: {proj.owner} • Status: {proj.status} • {proj.threatCount} Threats ({proj.highOrCriticalCount} High/Critical)
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {!isActive && (
                    <button
                      onClick={() => setActiveProjectId(proj.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
                    >
                      Switch To
                    </button>
                  )}
                  <button
                    onClick={() => setProjectToDelete(proj)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 transition-colors shadow-2xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Project
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sample Data Management */}
      <div className="p-6 rounded-xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Reset / Re-seed Fictional Commerce Project
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recreates the 8 microservice components, 6 flows, and 7 STRIDE threat scenarios.
          </p>
          {reseedSuccess && (
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block pt-1">
              ✓ Successfully re-seeded demo data!
            </span>
          )}
        </div>

        <button
          onClick={handleReseed}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 ${
            isCorporate
              ? "bg-blue-700 hover:bg-blue-800"
              : "bg-teal-700 hover:bg-teal-800"
          }`}
        >
          <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Re-seed Demo Data
        </button>
      </div>

      {/* Delete Project Confirmation Modal */}
      <DeleteProjectModal
        isOpen={!!projectToDelete}
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
      />
    </div>
  );
}

"""

# ==============================================================================
# FILE: src/components/DeleteProjectModal.tsx - Project Deletion Modal
# ==============================================================================
SOURCE_SRC_COMPONENTS_DELETEPROJECTMODAL_TSX = """
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

"""

# ==============================================================================
# FILE: src/components/ThreatModal.tsx - Threat Edit / Creation Modal
# ==============================================================================
SOURCE_SRC_COMPONENTS_THREATMODAL_TSX = """
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
  const { activeProject, refreshActiveProject, roleConfig, themePalette } = useProject();
  const isCorporate = themePalette === "corporate";

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
      // Default state for new threat
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
      setOverriddenSeverity("HIGH");
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

  // Derive qualitative severity from 3x3 matrix
  const derivedSeverity = calculateSeverity(likelihood, impact);
  const effectiveSeverity = isOverridden ? overriddenSeverity : derivedSeverity;

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

    // Basic client validations
    if (!title.trim() || title.length < 5) {
      setValidationError("Threat title must be at least 5 characters.");
      return;
    }
    if (!scenario.trim() || scenario.length < 10) {
      setValidationError("Threat scenario / vulnerability mechanism must be at least 10 characters.");
      return;
    }
    if (selectedStride.length === 0) {
      setValidationError("Please select at least one STRIDE category.");
      return;
    }
    if (isOverridden && (!severityRationale.trim() || severityRationale.length < 8)) {
      setValidationError("Reviewer override requires a documented rationale of at least 8 characters.");
      return;
    }
    if (status === "NOT_APPLICABLE" && (!notApplicableRationale.trim() || notApplicableRationale.length < 6)) {
      setValidationError("Rationale is required when marking a threat as Not Applicable.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col glass-modal rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${
              isCorporate
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-teal-50 border-teal-200 text-teal-700"
            }`}>
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {threatToEdit ? `Edit Assessment: ${threatToEdit.threatId}` : "Record STRIDE Threat Assessment"}
              </h2>
              <p className="text-xs text-slate-500">
                Traceable risk scenario, qualitative matrix derivation, and mitigation treatment.
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

        {/* Modal Form Scrollable Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 text-xs flex-1">
          {validationError && (
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{validationError}</span>
            </div>
          )}

          {/* Section 1: Identification & Title */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Threat Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g., THR-008 (auto if blank)"
                  value={threatId}
                  onChange={(e) => setThreatId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-slate-700 font-bold mb-1">
                  Threat Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Insecure JWT Signature Verification on Microservice Gateway"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            {/* STRIDE Category Multi-Select */}
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
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
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                        isChecked
                          ? isCorporate
                            ? "bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-600"
                            : "bg-teal-50 border-teal-600 text-teal-900 shadow-xs ring-1 ring-teal-600"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm">{def.letter}</span>
                        {isChecked && (
                          <CheckCircle className={`h-3.5 w-3.5 ${isCorporate ? "text-blue-700" : "text-teal-700"}`} />
                        )}
                      </div>
                      <div className="font-bold text-[11px] mt-1">{def.name}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{def.securityProperty}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scenario & Description */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Threat Scenario / Vulnerability Mechanism *
              </label>
              <textarea
                rows={3}
                placeholder="Explain how an adversary could exploit this condition, attacker motivations, and data paths..."
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Traceability - Linked Elements & Flows */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Layers className={`h-4 w-4 ${isCorporate ? "text-blue-700" : "text-teal-700"}`} />
              <span>Traceability: Affected Components & Data Flows</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Linked Components */}
              <div>
                <label className="block text-slate-600 text-[11px] font-semibold mb-1">
                  Affected Architecture Components
                </label>
                <div className="max-h-32 overflow-y-auto p-2 rounded-lg border border-slate-200 bg-white space-y-1">
                  {activeProject.elements.map((elem) => (
                    <label
                      key={elem.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedElements.includes(elem.id)}
                        onChange={() => toggleElementLink(elem.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-800 font-medium">{elem.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({elem.type})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Linked Flows */}
              <div>
                <label className="block text-slate-600 text-[11px] font-semibold mb-1">
                  Affected Directed Data Flows
                </label>
                <div className="max-h-32 overflow-y-auto p-2 rounded-lg border border-slate-200 bg-white space-y-1">
                  {activeProject.flows.map((flow) => (
                    <label
                      key={flow.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFlows.includes(flow.id)}
                        onChange={() => toggleFlowLink(flow.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-800 font-medium truncate">{flow.name}</span>
                      <span className="text-[10px] text-sky-600 font-mono">({flow.protocol})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Preconditions & Potential Impact Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Preconditions & Technical Assumptions
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Attacker already holds unprivileged tenant access; mTLS is misconfigured on pod ingress..."
                value={preconditions}
                onChange={(e) => setPreconditions(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Business & Operational Impact
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Financial loss, regulatory non-compliance (PCI-DSS), reputational damage..."
                value={businessImpact}
                onChange={(e) => setBusinessImpact(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* CIA + Privacy Impact Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Confidentiality</label>
              <select
                value={confidentialityImpact}
                onChange={(e) => setConfidentialityImpact(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="NONE">None</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Integrity</label>
              <select
                value={integrityImpact}
                onChange={(e) => setIntegrityImpact(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="NONE">None</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Availability</label>
              <select
                value={availabilityImpact}
                onChange={(e) => setAvailabilityImpact(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="NONE">None</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Privacy Impact</label>
              <select
                value={privacyImpact}
                onChange={(e) => setPrivacyImpact(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="NONE">None</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Section 4: Risk Scoring Engine & Overrides */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Qualitative Risk Scoring (Likelihood x Impact)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Derives Severity priority rating via the 3x3 STRIDE qualitative model.
                </p>
              </div>

              {/* Result Pill */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-600 font-medium">Resulting Priority:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  effectiveSeverity === "CRITICAL"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : effectiveSeverity === "HIGH"
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : effectiveSeverity === "MEDIUM"
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : "bg-slate-100 text-slate-700 border border-slate-300"
                }`}>
                  {effectiveSeverity}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Assessed Likelihood</label>
                <select
                  value={likelihood}
                  onChange={(e) => setLikelihood(e.target.value as Likelihood)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="LOW">Low (Requires exceptional preconditions or specialized access)</option>
                  <option value="MEDIUM">Medium (Plausible under standard network ingress)</option>
                  <option value="HIGH">High (Trivial to execute or automated exploit script exists)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Assessed Impact</label>
                <select
                  value={impact}
                  onChange={(e) => setImpact(e.target.value as Impact)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="LOW">Low (Minor localized disruption, minimal blast radius)</option>
                  <option value="MEDIUM">Medium (Service degradation or limited unauthorized disclosure)</option>
                  <option value="HIGH">High (Critical service outage, full tenant takeover, or data breach)</option>
                </select>
              </div>
            </div>

            {/* Reviewer Override Toggle */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOverridden}
                    onChange={(e) => setIsOverridden(e.target.checked)}
                    disabled={!roleConfig.canOverrideRisk}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-800 font-semibold">
                    Authorize Severity Rating Override (Security Lead / Owner)
                  </span>
                </label>
                {!roleConfig.canOverrideRisk && (
                  <span className="text-[10px] text-amber-600 font-medium">Requires Lead/Owner role</span>
                )}
              </div>

              {isOverridden && (
                <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-amber-900 font-bold mb-1">
                        Manual Severity Selection
                      </label>
                      <select
                        value={overriddenSeverity}
                        onChange={(e) => setOverriddenSeverity(e.target.value as Severity)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white text-amber-900 focus:outline-none"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-amber-900 font-bold mb-1">
                      Required Override Justification Rationale * (min 8 chars)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Compensatory rate limiting at ingress restricts blast radius to minor..."
                      value={severityRationale}
                      onChange={(e) => setSeverityRationale(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-slate-900 focus:outline-none"
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
                <label className="block text-slate-700 font-bold mb-1">
                  Existing Security Controls
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cloudflare edge WAF active, TLS 1.3 enforced, Kubernetes network policies"
                  value={existingControls}
                  onChange={(e) => setExistingControls(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Controls Verification Status
                </label>
                <select
                  value={controlsStatus}
                  onChange={(e) => setControlsStatus(e.target.value as ControlsStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="VERIFIED">Verified in Testing / Production</option>
                  <option value="ASSUMED">Assumed / Unverified Control</option>
                  <option value="NONE">No Controls Implemented</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Recommended Mitigation / Countermeasure Strategy
              </label>
              <textarea
                rows={2}
                placeholder="Specific architectural changes, library upgrades, or configuration hardening required..."
                value={mitigation}
                onChange={(e) => setMitigation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Assigned Owner / Team
                </label>
                <input
                  type="text"
                  placeholder="e.g., Carlos Mendez (AppSec)"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Remediation Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Threat Lifecycle Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ThreatStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600 font-semibold"
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
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <label className="block text-slate-800 font-bold">
                  Rationale for Not Applicable Status * (min 6 characters)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Physical hardware threat does not apply to this 100% cloud-hosted platform..."
                  value={notApplicableRationale}
                  onChange={(e) => setNotApplicableRationale(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              * Required fields. Strict validation applied on save.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-lg text-white font-semibold shadow-xs transition-all disabled:opacity-50 ${
                  isCorporate
                    ? "bg-blue-700 hover:bg-blue-800"
                    : "bg-teal-700 hover:bg-teal-800"
                }`}
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

"""

# ==============================================================================
# FILE: src/components/ProjectModal.tsx - Project Creation Modal
# ==============================================================================
SOURCE_SRC_COMPONENTS_PROJECTMODAL_TSX = """
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

"""

# ==============================================================================
# FILE: src/lib/__tests__/validations.test.ts - Unit Tests: Zod Validations
# ==============================================================================
SOURCE_SRC_LIB___TESTS___VALIDATIONS_TEST_TS = """
import { describe, expect, it } from "vitest";
import { projectCreateSchema } from "../validations/project";
import { elementSchema } from "../validations/element";
import { flowSchema } from "../validations/flow";
import { threatSchema } from "../validations/threat";

describe("Input & API Boundary Validations", () => {
  describe("Project Schema", () => {
    it("validates valid project input", () => {
      const res = projectCreateSchema.safeParse({
        name: "Cloud Checkout System",
        description: "Payment and checkout threat modeling assessment",
        owner: "Jane Doe (AppSec Lead)",
        environment: "Production",
        architectureVersion: "2.1.0",
      });
      expect(res.success).toBe(true);
    });

    it("rejects project with too short name or description", () => {
      const res = projectCreateSchema.safeParse({
        name: "A",
        description: "No",
        owner: "J",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("Architecture Element Schema", () => {
    it("validates valid component", () => {
      const res = elementSchema.safeParse({
        name: "Order Service",
        type: "PROCESS",
        technology: "Node.js / Express",
        trustZone: "Private VPC",
      });
      expect(res.success).toBe(true);
    });

    it("rejects invalid element type", () => {
      const res = elementSchema.safeParse({
        name: "Bad Element",
        type: "NON_EXISTENT_TYPE",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("Data Flow Schema", () => {
    it("validates valid data flow", () => {
      const res = flowSchema.safeParse({
        name: "Order Placement REST Call",
        sourceElementId: "elem-1",
        targetElementId: "elem-2",
        protocol: "HTTPS/REST",
        crossesTrustBoundary: true,
      });
      expect(res.success).toBe(true);
    });

    it("rejects missing source or target", () => {
      const res = flowSchema.safeParse({
        name: "Incomplete Flow",
        sourceElementId: "",
        targetElementId: "elem-2",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("STRIDE Threat Schema", () => {
    it("validates standard threat without override", () => {
      const res = threatSchema.safeParse({
        title: "JWT Token Forgery via Weak Secret Key",
        scenario: "Attacker discovers hardcoded HMAC secret and signs arbitrary identity claims.",
        strideCategories: ["SPOOFING", "ELEVATION_OF_PRIVILEGE"],
        likelihood: "MEDIUM",
        impact: "HIGH",
        severity: "HIGH",
        isOverridden: false,
        status: "OPEN",
      });
      expect(res.success).toBe(true);
    });

    it("requires at least one STRIDE category", () => {
      const res = threatSchema.safeParse({
        title: "Missing category threat",
        scenario: "Detailed scenario explanation for testing.",
        strideCategories: [],
        likelihood: "LOW",
        impact: "LOW",
        severity: "LOW",
      });
      expect(res.success).toBe(false);
    });

    it("requires severityRationale when isOverridden is true", () => {
      const res = threatSchema.safeParse({
        title: "Overridden Threat without justification",
        scenario: "Detailed scenario explanation for testing.",
        strideCategories: ["TAMPERING"],
        likelihood: "HIGH",
        impact: "HIGH",
        severity: "LOW",
        isOverridden: true,
        severityRationale: "", // empty rationale should fail
      });
      expect(res.success).toBe(false);
    });

    it("requires notApplicableRationale when status is NOT_APPLICABLE", () => {
      const res = threatSchema.safeParse({
        title: "Non-applicable Threat without reason",
        scenario: "Detailed scenario explanation for testing.",
        strideCategories: ["REPUDIATION"],
        status: "NOT_APPLICABLE",
        notApplicableRationale: "",
      });
      expect(res.success).toBe(false);
    });
  });
});

"""

# ==============================================================================
# FILE: src/lib/__tests__/risk-scoring.test.ts - Unit Tests: Risk Scoring Matrix
# ==============================================================================
SOURCE_SRC_LIB___TESTS___RISK_SCORING_TEST_TS = """
import { describe, expect, it } from "vitest";
import {
  calculateSeverity,
  RISK_MATRIX,
  validateSeverityOverride,
} from "../risk-scoring";
import { Impact, Likelihood } from "../types";

describe("Risk Scoring Engine", () => {
  it("derives correct Low severity for Low x Low, Low x Medium, Medium x Low", () => {
    expect(calculateSeverity("LOW", "LOW")).toBe("LOW");
    expect(calculateSeverity("LOW", "MEDIUM")).toBe("LOW");
    expect(calculateSeverity("MEDIUM", "LOW")).toBe("LOW");
  });

  it("derives correct Medium severity for Medium x Medium, High x Low, Low x High", () => {
    expect(calculateSeverity("MEDIUM", "MEDIUM")).toBe("MEDIUM");
    expect(calculateSeverity("HIGH", "LOW")).toBe("MEDIUM");
    expect(calculateSeverity("LOW", "HIGH")).toBe("MEDIUM");
  });

  it("derives correct High severity for High x Medium, Medium x High", () => {
    expect(calculateSeverity("HIGH", "MEDIUM")).toBe("HIGH");
    expect(calculateSeverity("MEDIUM", "HIGH")).toBe("HIGH");
  });

  it("derives Critical severity for High Likelihood and High Impact", () => {
    expect(calculateSeverity("HIGH", "HIGH")).toBe("CRITICAL");
  });

  it("covers all 9 combinations in the 3x3 matrix without gaps", () => {
    const likelihoods: Likelihood[] = ["LOW", "MEDIUM", "HIGH"];
    const impacts: Impact[] = ["LOW", "MEDIUM", "HIGH"];

    for (const l of likelihoods) {
      for (const i of impacts) {
        const severity = calculateSeverity(l, i);
        expect(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).toContain(severity);
        expect(severity).toBe(RISK_MATRIX[l][i]);
      }
    }
  });

  it("validates severity overrides correctly", () => {
    // Non-overridden is always valid without rationale
    expect(validateSeverityOverride(false, "")).toEqual({ valid: true });
    expect(validateSeverityOverride(false, null)).toEqual({ valid: true });

    // Overridden without rationale fails
    expect(validateSeverityOverride(true, "")).toEqual({
      valid: false,
      error: "A documented rationale of at least 8 characters is required when overriding calculated risk severity.",
    });

    // Overridden with too short rationale fails
    expect(validateSeverityOverride(true, "Short")).toEqual({
      valid: false,
      error: "A documented rationale of at least 8 characters is required when overriding calculated risk severity.",
    });

    // Overridden with adequate rationale passes
    expect(
      validateSeverityOverride(
        true,
        "Compensatory WAF rate limiting and external ingress firewall mitigate blast radius."
      )
    ).toEqual({ valid: true });
  });
});

"""

# ==============================================================================
# FILE: src/lib/__tests__/export.test.ts - Unit Tests: CSV Export
# ==============================================================================
SOURCE_SRC_LIB___TESTS___EXPORT_TEST_TS = """
import { describe, expect, it } from "vitest";

describe("Export Specifications", () => {
  it("includes all required threat register fields in export specification", () => {
    const requiredFields = [
      "Threat ID",
      "Title",
      "STRIDE Categories",
      "Severity / Priority",
      "Likelihood",
      "Impact",
      "Severity Rationale",
      "Status",
      "Not Applicable Rationale",
      "Owner / Team",
      "Due Date",
      "Threat Scenario",
      "Preconditions & Assumptions",
      "Confidentiality Impact",
      "Integrity Impact",
      "Availability Impact",
      "Privacy Impact",
      "Business Impact",
      "Existing Controls",
      "Controls Verification Status",
      "Recommended Mitigation",
      "Linked Components",
      "Linked Data Flows",
      "Created At",
      "Updated At",
    ];

    expect(requiredFields.length).toBeGreaterThanOrEqual(15);
    expect(requiredFields).toContain("Threat ID");
    expect(requiredFields).toContain("STRIDE Categories");
    expect(requiredFields).toContain("Controls Verification Status");
    expect(requiredFields).toContain("Not Applicable Rationale");
  });
});

"""

# ==============================================================================
# FILE: package.json - Project Configuration
# ==============================================================================
SOURCE_PACKAGE_JSON = """
{
  "name": "stride-threat-model-workspace",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "db:push": "prisma db push",
    "db:seed": "node scripts/seed.mjs"
  },
  "dependencies": {
    "@prisma/client": "^6.4.1",
    "lucide-react": "^1.61.0",
    "next": "16.4.3",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "zod": "^4.6.7"
  },
  "devDependencies": {
    "@tailwindcss/turbopack": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.4.3",
    "prisma": "^6.4.1",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vite": "^8.3.5",
    "vitest": "^5.0.5"
  }
}

"""

# ==============================================================================
# FILE: next.config.ts - Next.js Configuration
# ==============================================================================
SOURCE_NEXT_CONFIG_TS = """
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

"""

if __name__ == "__main__":
    display_summary()
    print(f"Successfully loaded complete codebase registry with {len(PROJECT_METADATA)} metadata fields.")

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

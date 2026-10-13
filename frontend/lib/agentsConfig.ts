export interface AgentProfile {
  id: string;
  name: string;
  title: string;
  role: "supervisor" | "specialized" | "assistance";
  meaning: string;
  description: string;
  tasks: string[];
  tools: string[];
  avatarSrc: string;
  accentColor: string;
}

export const SYSTEM_AGENTS: AgentProfile[] = [
  {
    id: "datu",
    name: "Datu",
    title: "Supervisor & Orchestrator Agent",
    role: "supervisor",
    meaning: "Leader, Chieftain, or Sovereign Guide",
    description:
      "Sits above all specialized agents to interpret user requests, select appropriate multi-agent pipelines, coordinate agent handoffs, and consolidate final outputs.",
    tasks: [
      "Request intent interpretation & routing",
      "Dynamic multi-agent workflow selection",
      "Inter-agent handoff coordination & state management",
      "Result consolidation and response synthesis",
    ],
    tools: ["LangGraph Orchestrator", "Routing Router", "State Checkpointer", "Consolidation Engine"],
    avatarSrc: "/datu.png",
    accentColor: "#F59E0B", // Gold / Amber
  },
  {
    id: "alon",
    name: "Alon",
    title: "Document Ingestion & Archiving Agent",
    role: "specialized",
    meaning: "Wave (continuous flow of incoming streams)",
    description:
      "Transforms incoming files into organized, searchable archival records through multi-stage OCR, classification, and metadata extraction.",
    tasks: [
      "Document-type identification, OCR, and parsing",
      "Classification and metadata extraction",
      "Duplicate identification and version management",
      "Indexing and cataloging into vector & relational stores",
      "Identification of potential new document categories",
    ],
    tools: ["OCR Engine", "SetFit", "BERTopic", "Embedding Model", "Metadata Extractor", "Indexing API"],
    avatarSrc: "/alon.png",
    accentColor: "#06B6D4", // Cyan / Ocean Blue
  },
  {
    id: "mutya",
    name: "Mutya",
    title: "Records Management Agent",
    role: "specialized",
    meaning: "Treasure, Pearl, or Cherished Archive",
    description:
      "Assists users with document discovery, archival organization, and records lifecycle operations across physical and digital storage.",
    tasks: [
      "Natural-language document discovery",
      "Metadata and version lookup",
      "Records lifecycle and retention assistance",
      "Organization-specific policy queries",
      "Records-management recommendations",
    ],
    tools: ["Document Search", "Metadata Services", "Records Lifecycle APIs", "Policy Knowledge Base"],
    avatarSrc: "/mutya.png",
    accentColor: "#10B981", // Emerald / Jade
  },
  {
    id: "makisig",
    name: "Makisig",
    title: "Document Analysis Agent",
    role: "specialized",
    meaning: "Sharp, Impressive, and Perceptive",
    description:
      "Interprets and analyzes the deep contents of selected documents, identifying inconsistencies and extracting statutory directives.",
    tasks: [
      "Document summarization & executive briefing",
      "Key-information and clause extraction",
      "Multi-document comparative analysis",
      "Identification of textual & policy inconsistencies",
      "Evidence-grounded question answering",
    ],
    tools: ["LLM Reasoning", "Structured Extraction", "Comparison Tools", "Document Parser"],
    avatarSrc: "/makisig.png",
    accentColor: "#3B82F6", // Royal Blue
  },
  {
    id: "bituin",
    name: "Bituin",
    title: "Research & Knowledge Discovery Agent",
    role: "specialized",
    meaning: "Star (illuminating connections across constellations)",
    description:
      "Conducts complex multi-step investigations across authorized archival records, discovering patterns and cross-document evidence.",
    tasks: [
      "Multi-step research and query decomposition",
      "Cross-document evidence retrieval",
      "Identification of related information and precedent patterns",
      "Synthesis of multi-source archival findings",
      "Research responses with verifiable citations",
    ],
    tools: ["Hybrid Retrieval", "BM25", "pgvector", "RRF", "Reranker", "RAG Pipeline"],
    avatarSrc: "/bituin.png",
    accentColor: "#8B5CF6", // Purple / Indigo
  },
  {
    id: "bayani",
    name: "Bayani",
    title: "Document Validation & Quality Assurance Agent",
    role: "specialized",
    meaning: "Hero (defender of integrity and truth)",
    description:
      "Coordinates intelligent validation and quality assurance throughout document workflows, ensuring completeness and compliance before archiving.",
    tasks: [
      "Classification-confidence validation",
      "Metadata consistency and completeness checks",
      "Duplicate and version verification",
      "Cross-document consistency checks",
      "Escalation of uncertain results for human review",
    ],
    tools: ["Validation Rules", "ML Confidence Scores", "Anomaly Detection", "Duplicate Detection", "Human-Review Services"],
    avatarSrc: "/bayani.png",
    accentColor: "#EF4444", // Crimson / Red
  },
  {
    id: "mayumi",
    name: "Mayumi",
    title: "User Assistance Agent",
    role: "assistance",
    meaning: "Gentle, Refined, and Approachable",
    description:
      "Provides friendly, courteous, and contextual guidance directly to employees on the frontend, explaining directives without overwhelming jargon.",
    tasks: [
      "Interactive in-place document Q&A",
      "Friendly executive briefings for employees",
      "Plain-language explanation of complex policies",
      "Quick prompt suggestions and guidance",
    ],
    tools: ["In-Place Assistant Drawer", "Summary Generator", "Clause Explainer"],
    avatarSrc: "/mayumi.png",
    accentColor: "#EC4899", // Rose / Pink
  },
];

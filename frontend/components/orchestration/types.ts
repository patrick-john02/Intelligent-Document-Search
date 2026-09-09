export interface AgentExecutionStep {
  id: string;
  name: string;
  agent: string;
  status: "idle" | "running" | "completed" | "clarification";
  title: string;
  detail: string;
  duration?: string;
  badgeColor?: "primary" | "secondary" | "success" | "warning" | "info";
}

export interface CitedDocument {
  id: number;
  title: string;
  orderNo: string;
  seriesYear: string;
  page: number;
  section: string;
  snippet: string;
  shelfLocation: string;
  relevanceScore: string;
}

export const SAMPLE_QUERIES = [
  {
    id: "query-1",
    label: "Property Tax Penalties",
    query: "What is the penalty rate for delinquent real property tax in Region II under BLGF-DO-2024-018?",
    intent: "Document Analysis & Policy Extraction",
    targetDoc: "BLGF-DO-2024-018",
  },
  {
    id: "query-2",
    label: "Treasury Revenue Directives",
    query: "Extract the local revenue collection calendar and deadlines from Treasury Circular TC-2024-009.",
    intent: "Table Extraction & Scheduling",
    targetDoc: "TC-2024-009",
  },
  {
    id: "query-3",
    label: "Franchise Tax Audit",
    query: "Audit municipal franchise tax exemptions across recent directives and verify legal precedent.",
    intent: "Cross-Document Deep Research",
    targetDoc: "LO-R2-2023-042",
  },
];

export const MOCK_CITATIONS: CitedDocument[] = [
  {
    id: 1,
    title: "LGU Real Property Assessment Advisory Guidelines",
    orderNo: "BLGF-DO-2024-018",
    seriesYear: "2024",
    page: 4,
    section: "Section 2.1 — Delinquency Surcharges & Penalties",
    snippet:
      "Failure to pay the basic real property tax upon the expiration of the period prescribed shall subject the taxpayer to the payment of interest at the rate of two percent (2%) per month on the unpaid amount, until the delinquent tax is paid in full: Provided, that in no case shall the total interest exceed seventy-two percent (72%).",
    shelfLocation: "Cabinet A • Shelf 2 (Regional Records Rm 104)",
    relevanceScore: "98.4% Match",
  },
  {
    id: 2,
    title: "Treasury Circular on Local Revenue Collections",
    orderNo: "TC-2024-009",
    seriesYear: "2024",
    page: 12,
    section: "Annex B — Payment Amortization Schedules",
    snippet:
      "Quarterly installments shall be remitted on or before March 31, June 30, September 30, and December 31. LGUs may extend amnesty periods solely with regional bureau concurrence.",
    shelfLocation: "Cabinet B • Shelf 1 (Treasury Archive)",
    relevanceScore: "92.1% Match",
  },
];

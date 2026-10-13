import { SearchResultItem } from "./types";

export const SAMPLE_SEARCH_DOCUMENTS: SearchResultItem[] = [
  {
    id: "doc-1",
    title: "Real Property Assessment Advisory Guidelines and Valuation Standards",
    orderNo: "BLGF-DO-2024-018",
    seriesYear: 2024,
    category: "Assessment Regulations",
    clearance: "Public",
    relevanceScore: 0.98,
    shelfLocation: "Cabinet A • Shelf 2",
    summary:
      "Operational guidelines for local government units regarding property valuations, schedule of market values, and delinquent penalty enforcement.",
    excerptSnippet:
      "Delinquent assessment penalties: Municipal treasurers shall enforce the revised 2% monthly surcharges on unremitted real property taxes, with a statutory ceiling of 72 months from the date of final notice.",
    fileSize: "4.8 MB",
    pageCount: 28,
    ingestedDate: "2024-08-28",
    tags: ["Property Tax", "Assessment", "Valuation", "Penalties"],
  },
  {
    id: "doc-2",
    title: "Treasury Circular on Local Revenue Collections and Automation Protocols",
    orderNo: "TC-2024-009",
    seriesYear: 2024,
    category: "Treasury Advisories",
    clearance: "Public",
    relevanceScore: 0.93,
    shelfLocation: "Cabinet B • Shelf 1",
    summary:
      "Directs provincial and municipal treasury collection units to interface electronic receipts with the central regional archival repository.",
    excerptSnippet:
      "All municipal and provincial collection offices are directed to integrate electronic treasury receipting systems with the Central Archival repository to ensure automated compliance auditing and cash reporting.",
    fileSize: "2.3 MB",
    pageCount: 16,
    ingestedDate: "2024-08-24",
    tags: ["Treasury", "Electronic Receipts", "Revenue", "Collections"],
  },
  {
    id: "doc-3",
    title: "Legal Opinion on Municipal Franchise Tax Exemption for Public Utilities",
    orderNo: "LO-R2-2023-042",
    seriesYear: 2023,
    category: "Legal Opinions",
    clearance: "Internal",
    relevanceScore: 0.88,
    shelfLocation: "Cabinet C • Shelf 4",
    summary:
      "Formal legal opinion on municipal franchise tax authority regarding telecommunication lines and public utility franchises under the Local Government Code.",
    excerptSnippet:
      "Pursuant to the Local Government Code of 1991, local government units retain the authority to levy franchise tax on businesses enjoying a legislative franchise, unless an explicit statutory exemption is provided by national charter.",
    fileSize: "1.7 MB",
    pageCount: 9,
    ingestedDate: "2023-11-19",
    tags: ["Franchise Tax", "Public Utilities", "Legal Opinion", "Exemption"],
  },
  {
    id: "doc-4",
    title: "Standard Operating Procedure for Physical Document Ingestion and Scanning",
    orderNo: "SOP-DOC-2024-001",
    seriesYear: 2024,
    category: "Standard Procedures",
    clearance: "Internal",
    relevanceScore: 0.82,
    shelfLocation: "Cabinet A • Shelf 1",
    summary:
      "Procedures for receiving physical paper records, barcode tagging, high-resolution scanning, and indexing into the digital repository.",
    excerptSnippet:
      "Upon physical intake at the records division, documents must receive a barcode tracking tag indicating Cabinet and Shelf coordinates before high-speed multi-page scanning and digital indexing.",
    fileSize: "3.1 MB",
    pageCount: 22,
    ingestedDate: "2024-08-15",
    tags: ["SOP", "Document Scanning", "Physical Archive", "Intake"],
  },
  {
    id: "doc-5",
    title: "Regional Memorandum on Financial Audits and Inter-Agency Ingestion",
    orderNo: "RM-2024-011",
    seriesYear: 2024,
    category: "Memorandums",
    clearance: "Confidential",
    relevanceScore: 0.79,
    shelfLocation: "Cabinet D • Shelf 3",
    summary:
      "Annual schedule for mandatory regional compliance audits covering revenue collections and document integrity across local offices.",
    excerptSnippet:
      "Regional audit supervisors will review quarterly revenue ledger reconciliations, cash account books, and physical archive security standards across all provincial districts.",
    fileSize: "5.6 MB",
    pageCount: 34,
    ingestedDate: "2024-08-10",
    tags: ["Financial Audit", "Compliance", "Memorandum", "Security"],
  },
  {
    id: "doc-6",
    title: "Administrative Directive on Digital Document Retention and Disposition",
    orderNo: "AD-2023-015",
    seriesYear: 2023,
    category: "Standard Procedures",
    clearance: "Public",
    relevanceScore: 0.74,
    shelfLocation: "Cabinet B • Shelf 3",
    summary:
      "Retention periods, declassification procedures, and permanent archive guidelines for official government issuances.",
    excerptSnippet:
      "Administrative orders, executive issuances, and regulatory guidelines must be preserved permanently in both physical climate-controlled shelving and redundant electronic storage.",
    fileSize: "2.8 MB",
    pageCount: 18,
    ingestedDate: "2023-09-05",
    tags: ["Retention", "Archiving", "Disposition", "Regulations"],
  },
];

from enum import Enum

class TaskType(str, Enum):
    SUMMARIZATION = "summarization"
    COMPARISON = "comparison"
    EXTRACTION = "extraction"
    INCONSISTENCY_CHECK = "inconsistency_check"
    REPORT_GEN = "report_gen"

class SenderType(str, Enum):
    USER = "user"
    SUPERVISOR = "supervisor"
    SR_AGENT = "semantic_retrieval_agent"
    SYNTHESIS_AGENT = "synthesis_agent"
    ANALYTICS_AGENT = "analytics_agent"
    QA_AGENT = "quality_assurance_agent"

class ReportType(str,Enum):
    SUMMARY = "summary"
    COMPARISON = "comparison"
    INCONSISTENCY_AUDIT = "inconsistency_audit"
    ANALYTICS_SUMMARY = "analytics_summary"
from __future__ import annotations

from datetime import datetime

from sqlalchemy import select, update

from api.models.agents_tasks import AgentExecutions
from api.models.document import ArchiveProposal as ArchiveProposalRow, DocumentVersion
from api.models.enums.docs import ProposalStatus
from core.dependencies import SessionLocal
from tools.access.permissions import get_user_clearance_levels

AGENT_NAME = "alon"
TASK_TYPE = "archive_review"



#clearance levels of the user who uploaded this version.
async def get_uploader_clearance(document_version_id: int)->list[str]:
    async with SessionLocal() as session:
        version = await session.get(DocumentVersion, document_version_id)
        uploader = version.uploaded_by if version else None # lazy="selectin" on the model
        return [lvl.lower() for lvl in get_user_clearance_levels(uploader)]


async def save_alon_result(document_version_id:int, result)->int:
    now = datetime.now()
    ok =  result.proposal is not None

    async with SessionLocal() as session:
        version = await session.get(DocumentVersion, document_version_id)
        if version is None:
            raise ValueError(f"Document version {document_version_id} not found")


        execution = AgentExecutions( 
            agent_name=AGENT_NAME,
            task_type=TASK_TYPE,
            status="success" if ok else "failed",
            input_params={
                "document_version_id": document_version_id,
                "tool_calls": result.tool_calls,
                "tokens_used" : result.tokens_used,
            },
            output_summary=((result.proposal.summary if ok else result.findings) or "")[:4000], 
            execution_time_ms=round(result.elapsed_ms, 1),
            model_name=result.model_name or "unknown",
            error_log=result.error or "",
            created_at=now,
        )

        session.add(execution)
        await session.flush() #get execution.id

        if ok:
            #all versions of the same document: a new version's proposal replaces older pending ones.
            same_document_versions = select(DocumentVersion.id).where(
                DocumentVersion.document_id == version.document_id
            )
            await session.execute(
                update(ArchiveProposalRow)
                .where(
                    ArchiveProposalRow.document_version_id.in_(same_document_versions),
                    ArchiveProposalRow.status == ProposalStatus.PENDING.value,
                )
                .values(status=ProposalStatus.SUPERSEDED.value, updated_at=now)
            )

        row = ArchiveProposalRow(
            document_version_id=document_version_id,
            status=ProposalStatus.PENDING.value if ok else ProposalStatus.FAILED.value,
            proposal=result.proposal.model_dump(mode="json") if ok else None,
            needs_human_review=result.proposal.needs_human_review if ok else True,
            model_name=result.model_name or None, 
            error_message=result.error,
            agent_execution_id=execution.id,
            created_at=now,
        )

        session.add(row)
        session.commit()
        return row.id
    



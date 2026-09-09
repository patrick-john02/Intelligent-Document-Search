from fastapi import (
    APIRouter, status, HTTPException, Depends
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
import asyncio


#imports
from core.dependencies import get_db
from core.security import get_current_active_user

from api.models.users import Users
from api.models.document import DocumentModel
from api.models.agents_tasks import AgentExecutions

from api.schema.document_schema import RecArcDirSchema



app = APIRouter(prefix="/dashbard", tags=["Staff Dashboard"])


class AnalyticsResponse(BaseModel):
    archived_documents: int
    ai_inquiries_resolved: int
    recent_uploads: int

@app.get("/analytics", status_code=status.HTTP_200_OK)
async def analytics_counts(
    db:AsyncSession=Depends(get_db),
    current_user: Users = Depends(get_current_active_user)
):

    recent_week = datetime.now(timezone.utc) - timedelta(days=7)

    #count active documents and recent uploads
    docs_query=select(
        func.count(DocumentModel.id)
        .filter(DocumentModel.is_deleted.is_(False))
        .label("total_docs"),

    #recent uploads
    func.count(DocumentModel.id)
        .filter(
            DocumentModel.is_deleted.is_(False),
            DocumentModel.created_at >= recent_week
        )
        .label("recent_docs")
    )


    agent_query=select(func.count(AgentExecutions.id))

    #execute queries concurrently to minimize I/O wait time
    doc_res, agent_res = await asyncio.gather(
        db.execute(docs_query),
        db.execute(agent_query)
    )

    total_docs, recent_docs = doc_res.one() 
    total_agents = agent_res.scalar_one()


    return AnalyticsResponse(
        archived_documents=total_docs,
        ai_inquiries_resolved=total_agents,
        recent_upload=recent_docs,
    )


@app.get("/list_archived_dir", status_code=status.HTTP_200_OK, response_model=list[RecArcDirSchema])
async def get_archive_dir(
    db:AsyncSession=Depends(get_db),
    current_user:Users=Depends(get_current_active_user)
):
    recent_docs = datetime.now(timezone.utc) - timedelta(days=7)

    query = select(DocumentModel).where(
        DocumentModel.is_deleted.is_(False),
        DocumentModel.created_at >= recent_docs
    )

    result = await db.execute(query)
    return result.scalars().all()



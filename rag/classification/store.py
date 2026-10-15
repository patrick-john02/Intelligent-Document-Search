#saves results, human confirmation store.py. 
# It has no model imports, so the API can safely use it for human confirmation:

from __future__ import annotations

from datetime import datetime

from sqlalchemy import delete, select, update

from api.models.document import DocumentClassifications, DocumentVersion
from api.models.enums.docs import ClassificationStatus
from core.dependencies import SessionLocal
from rag.classification.labels import DOC_TYPES


async def has_verified_label(document_version_id: int) -> bool:
    async with SessionLocal() as db_session:
        found = await db_session.scalar(
            select(DocumentClassifications.id)
            .where(
                DocumentClassifications.document_version_id == document_version_id,
                DocumentClassifications.source == "human",
            )
            .limit(1)
        )
        return found is not None


async def save_classification(document_version_id: int, decision) -> None:
    now = datetime.now()
    async with SessionLocal() as db_session:
        # idempotent on retry, but never delete human labels
        await db_session.execute(
            delete(DocumentClassifications).where(
                DocumentClassifications.document_version_id == document_version_id,
                DocumentClassifications.source != "human",
            )
        )

        for p in decision.tier_predictions:
            db_session.add(DocumentClassifications(
                document_version_id=document_version_id,
                source=p.source,
                label=p.label,
                confidence=p.confidence,
                probabilities=p.probabilities,
                model_version=p.model_version,
                is_final=False,
                created_at=now,
            ))

        db_session.add(DocumentClassifications(
            document_version_id=document_version_id,
            source="ensemble",
            label=decision.label,
            confidence=decision.confidence,
            probabilities=decision.probabilities,
            model_version="ensemble-v1",
            status=decision.status,
            is_final=True,
            created_at=now,
        ))

        version = await db_session.get(DocumentVersion, document_version_id)
        if version:
            version.doc_type = decision.label
            version.classification_status = decision.status
            version.classification_confidence = decision.confidence

        await db_session.commit()


async def get_doc_type(document_version_id: int) -> str | None:
    async with SessionLocal() as db_session:
        return await db_session.scalar(
            select(DocumentVersion.doc_type).where(DocumentVersion.id == document_version_id)
        )


async def confirm_classification(document_version_id: int, label: str, user_id: int) -> None:
    if label not in DOC_TYPES:
        raise ValueError(f"Unknown document type '{label}'. Allowed: {DOC_TYPES}")

    async with SessionLocal() as db_session:
        version = await db_session.get(DocumentVersion, document_version_id)
        if version is None:
            raise ValueError(f"Document version {document_version_id} not found.")

        await db_session.execute(
            update(DocumentClassifications)
            .where(DocumentClassifications.document_version_id == document_version_id)
            .values(is_final=False)
        )
        db_session.add(DocumentClassifications(
            document_version_id=document_version_id,
            source="human",
            label=label,
            confidence=1.0,
            probabilities={label: 1.0},
            model_version="human",
            status=ClassificationStatus.VERIFIED.value,
            is_final=True,
            verified_by_id=user_id,
            created_at=datetime.now(),
        ))

        version.doc_type = label
        version.classification_status = ClassificationStatus.VERIFIED.value
        version.classification_confidence = 1.0
        await db_session.commit()
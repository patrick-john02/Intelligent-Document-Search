from langchain.tools import tool
from pathlib import Path
from pydantic import BaseModel, Field
from typing import(
    List, Tuple, Optional,
)
from langchain_core.prompts import ChatPromptTemplate
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload


from api.models.document import DocumentModel, DocumentVersion
from core.configurations import chat_model
from core.database import SessionLocal


class DocumentComprison():
    summary: str = Field(
        description="High-level overview synthesizing how the two documents compare."
    )
    similarities: List[str] = Field(
        default_factory=list,
        description="Key similarities, common themes, or shared provisions between both documents."
    )
    differences: List[str] = Field(
        default_factory=list,
        description="Key differences, discrepancies, version updates, or conflicting points."
    )
    doc_a_unique_points: List[str]=Field(
        default_factory=list,
        description="Noteworthy poitns, clauses, or facts found exclusively in the first document."
    )
    doc_b_unique_points: List[str] = Field(
        default_factory=list,
        description="Noteworthy points, clauses, or facts found exclusively in the second document."
    )
    conclusion: str = Field(
        default="",
        description="Concluding assessment, synthesis, or actionable takeaway based on the comparison."
    )
    confidence: float = Field(
        description=""
    )


class DocComparisonService:
    def __init__(self):
        self.llm = chat_model
        self.structured_llm=self.llm.with_structured_output(DocComparisonService)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """
            You are an expert Document Analysis and comparison Agent.
            Your responsibilities:
            1. Perform an objective, detailed comparative analysis between two documents.
            2. Identify common topics, shared provisions, and alignment between both documents.
            3. Highlight critical discrepancies, modifications, conflicting statements, or missions of details.
            4. Explicitly categorize unique points belonging to each document.
            5.Provide an actionable conclusion/synthesis addressing the user's specific query.
            6. Assign a realistic confidence score (0.0 to 1.0)

            Guidelines:
            - The documents may contain OCR noise, formatting inconsistencies, or extraction artifcats.
            - Analyze only facts supported by the provided text. Do not invent missing information.
            - Focus directly on the user's query or comparison intent.
            """)
            ("human", """User Comparison Query: {query}
            --- DOCUMENT 1: {doc_a_title} ---
            {doc_a_text}
            
            --- DOCUMENT 2: {doc_b_title} ---
            {doc_b_text}""")
        ])


        self.chain = self.prompt | self.structured_llm

    async def compare(
            self,
            query: str,
            doc_a_text:str,
            doc_b_text:str,
            doc_a_title:str = "Document 1",
            doct_b_title:str = "Document 2",
    )->DocumentComprison:
        return await self.chain.ainvoke({
            "query": query or "Compare key points, similarities, and differences between these two documents.",
            "doc_a_text": doc_a_text,
            "doc_b_text": doc_b_text,
            "doc_a_title": doc_a_title,
            "doc_b_title": doct_b_title,
        })

doc_comparison_service = DocComparisonService()


#this will be a content resolver (using database id , title , and raw text)
#will be using the table DocumentModel and DocumentChunks
# title and fileanem lookup in the database
# then raw text string passed here directly
async def resolve_document_content(doc_ref: str)->Tuple[str,str]:
    trimmed = str(doc_ref).strip()

    if trimmed.isdigit():
        doc_id=int(trimmed)
        try:
            async with SessionLocal() as session:
                query = (
                    select(DocumentModel)
                    .where(DocumentModel.id == doc_id, DocumentModel.is_deleted.is_(False))
                    .options(
                        selectinload(DocumentModel.versions).selectinload(DocumentVersion.chunks)
                    )
                )
                result = await session.execute(query)
                doc = result.scalar_one_or_none()
                if doc: 
                    active_version = next(
                        (v for v in doc.versions if v.is_current),
                        doc.versions[-1] if doc.versions else None
                    )

                    if active_version and active_version.chunks:
                        sorted_chunk = sorted(active_version.chunks)
                        text = "\n\n".join(c.content for c in sorted_chunk if c.content)
                        if text.strip():
                            return doc.title or f"Document #{doc.id}", text

                    if active_version and active_version.storage_path:
                        path = Path(active_version.storage_path)
                        if path.exists() and path.is_file():
                            text = path.read_text(encoding="utf-8", errors = "ignore")
                            if text.strip():
                                return doc.title or f"Document #{doc.id}", text
        except Exception:
            pass

    if len(trimmed) < 100 and "\n" not in trimmed:
        try:
            async with SessionLocal() as session:
                query = (
                    select(DocumentModel)
                    .where(
                        or_(
                            DocumentModel.title.ilike(trimmed),
                            DocumentModel.versions.any(DocumentModel.file_name.ilike(trimmed))
                        ),
                        DocumentModel.is_deleted.is_(False)
                    )
                    .options(
                        selectinload(DocumentModel.versions).selectinload(DocumentVersion.chunks)
                    )
                )

                result = await session.execute(query)
                doc = result.scalar_one_or_none()
                if doc: 
                    active_version = next(
                        (v for v in doc.versions if v.is_current),
                        doc.versions[-1] if doc.versions else None
                    )

                    if active_version and active_version.chunks:
                        sorted_chunks = sorted(active_version.chunks, key=lambda c: c.chunk_index)
                        text = "\n\n".join(c.content for c in sorted_chunks if c.content)
                        if text.strip():
                            return doc.title or trimmed, text
        except Exception:
            pass

    return "Provided Document", trimmed


async def compare_documents(
    query: str,
    current_doc:str,
    doc_compare:str
)->Optional[DocumentComprison]:

    if not current_doc or not doc_compare:
        return None

    title_a, text_a = await resolve_document_content(current_doc)
    title_b, text_b = await resolve_document_content(doc_compare)

    if not text_a.strip() or not text_b.strip():
        return None

    return await doc_comparison_service.compare(
        query=query,
        doc_a_text=text_a,
        doc_b_text=text_b,
        doc_a_title=title_a,
        doct_b_title=title_b
    )


#tools for the document analysis agent

@tool("compare_documents")
async def compare_document_tool(query:str, current_doc: str, doc_compare: str) -> str:
    #comparing the two documents to identify similarities,differences and unique points.


    results = await compare_documents(query=query, current_doc=current_doc,doc_compare=doc_compare)
    if not results:
        return "Unable to perform comparison: One or both documents could not be found or have no readable text"

    output=[
        f"### Document Comparison Summary\n{results.summary}\n"
    ]
    if results.similarities:
        output.append("### Key Similarities:")
        output.extend([f"- {item}" for item in results.differences])
        output.append("")

    if results.differences:
        output.append("#### Key Similarities")
        output.extend([f"- {item}" for item in results.differences])

    if results.doc_a_unique_points:
        output.append("#### Unique to First Document:")
        output.extend([f"- {item}" for item in results.doc_a_unique_points])
        output.append("")

    if results.doc_b_unique_points:
        output.append("#### Unique to Second Document:")
        output.extend([f"- {item}" for item in results.doc_b_unique_points])
        output.append("")

    if results.conclusion:
        output.append(f"#### Conclusion / Synthesis:\n{results.conclusion}\n")
        output.append(f"*(Confidence: {results.confidence:.2f})*")
        return "\n".join(output)
    

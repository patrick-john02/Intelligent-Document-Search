from __future__ import annotations

import re
import logging
from dataclasses import dataclass, field
from typing import Any

import tiktoken
from depicdoc import linearize_document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from rag.metadata import DocumentMetadata, build_chunk_metadata
from core.configurations import app_settings

def _init_tokenizer():
    logger = logging.getLogger(__name__)
    model_name = app_settings.EMBEDDING_TOKENIZER
    try:
        from transformers import AutoTokenizer
        tok=AutoTokenizer.from_pretrained(model_name)
        tok.model_max_length=8192
        return tok
    
    except Exception as e:
        logger.error(
            f"Could not load tokenizer '{model_name}':{e}. "
            f"Falling back to tiktoken cl100k_base - token counts will NOT match the embedding model."
        )
        
        
        try:
            return tiktoken.get_encoding("cl100k_base")
        except Exception:
            return None

_tokenizer = _init_tokenizer()


def count_tokens(text: str) -> int:

    if not text:
        return 0
    if _tokenizer is not None:
        try:
            return len(_tokenizer.encode(text, add_special_tokens=False))
        except TypeError:
            try:
                # tiktoken fallback
                return len(_tokenizer.encode(text, disallowed_special=()))
            except Exception:
                return len(_tokenizer.encode(text))
        except Exception:
            pass
    # Basic word approximation fallback if tokenizer is unavailable
    return len(text.split())

@dataclass
class ParentChunk:
    parent_id: str                      
    document_id: int
    document_version_id: int
    section_title: str
    content: str                      
    token_count: int
    page_number: int | None = None
    chunk_type: str = "section"         
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class FileChunk:


    content: str
    document_id: int
    document_version_id: int
    chunk_index: int
    chunk_id: str
    file_name: str
    page_number: int | None = None
    section_title: str = ""
    chunk_type: str = "paragraph" 
    token_count: int = 0
    clearance_level: str = "PUBLIC"
    parent_chunk_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ChunkingResult:

    chunks: list[FileChunk]
    parents: list[ParentChunk]

    def __iter__(self):
        return iter(self.chunks)

    def __len__(self):
        return len(self.chunks)

    def __getitem__(self, index):
        return self.chunks[index]


@dataclass
class StructuralBlock:

    content: str
    block_type: str  # 'heading', 'table', 'list', 'paragraph'
    heading: str = ""
    page_number: int | None = None


SemanticBlock = StructuralBlock


@dataclass
class StructuredSection:

    content: str
    heading: str = ""
    page_number: int | None = None
    chunk_type: str = "paragraph"
    tokens: int = 0
    parent_id: str | None = None

SemanticSection = StructuredSection

def detect_block_type(text: str) -> str:
    """Classifies markdown text into semantic categories."""
    lines = [l.strip() for l in text.strip().split("\n") if l.strip()]
    if not lines:
        return "paragraph"
    first = lines[0]
    if "[Columns:" in first or ("\n|" in text or text.startswith("|")):
        return "table"
    if re.match(r"^(#{1,6})\s+", first):
        return "heading_section"
    if all(re.match(r"^(\*|-|\d+\.)\s+", l) for l in lines[:min(3, len(lines))]):
        return "list"
    return "paragraph"


def detect_structural_blocks(markdown_text: str) -> list[StructuralBlock]:

    raw_blocks = [b.strip() for b in markdown_text.split("\n\n") if b.strip()]
    blocks: list[StructuralBlock] = []

    current_page: int | None = None
    current_heading: str = ""

    for block in raw_blocks:

        page_match = re.match(r"^##\s+Page\s+(\d+)", block, re.IGNORECASE)
        if page_match:
            current_page = int(page_match.group(1))
            lines = [
                line for line in block.split("\n")
                if not re.match(r"^##\s+Page\s+\d+", line, re.IGNORECASE)
            ]
            block = "\n".join(lines).strip()
            if not block:
                continue


        heading_match = re.match(r"^(#{1,6})\s+(.+)$", block.split("\n")[0])
        if heading_match and "[Columns:" not in block and " | " not in block:
            current_heading = heading_match.group(2).strip()

        b_type = detect_block_type(block)
        blocks.append(
            StructuralBlock(
                content=block,
                block_type=b_type,
                heading=current_heading,
                page_number=current_page,
            )
        )

    return blocks


def split_oversized_table(
    table_text: str,
    heading: str = "",
    page_number: int | None = None,
    max_tokens: int = 500,
    parent_id: str | None = None,
) -> list[StructuredSection]:
    """Splits large tables by rows while repeating column headers at the top of every chunk."""
    lines = [l for l in table_text.splitlines() if l.strip()]
    if not lines:
        return []


    if lines[0].startswith("[Columns:"):
        header_lines = [lines[0]]
        row_lines = lines[1:]
    elif lines[0].startswith("|") and len(lines) > 1 and "---" in lines[1]:
        header_lines = [lines[0], lines[1]]
        row_lines = lines[2:]
    else:
        header_lines = [lines[0]]
        row_lines = lines[1:]

    header_text = "\n".join(header_lines)
    header_tokens = count_tokens(header_text)

    sections: list[StructuredSection] = []
    current_rows: list[str] = []
    current_tokens = header_tokens
    part_idx = 1

    for row in row_lines:
        row_tokens = count_tokens(row)
        if current_tokens + row_tokens > max_tokens and current_rows:
            chunk_content = f"{header_text}\n" + "\n".join(current_rows)
            sections.append(
                StructuredSection(
                    content=chunk_content,
                    heading=heading,
                    page_number=page_number,
                    chunk_type="table",
                    tokens=current_tokens,
                    parent_id=parent_id,
                )
            )
            part_idx += 1
            current_rows = []
            current_tokens = header_tokens

        current_rows.append(row)
        current_tokens += row_tokens

    if current_rows:
        chunk_content = f"{header_text}\n" + "\n".join(current_rows)
        sections.append(
            StructuredSection(
                content=chunk_content,
                heading=heading,
                page_number=page_number,
                chunk_type="table",
                tokens=current_tokens,
                parent_id=parent_id,
            )
        )

    return sections


def create_structured_sections_with_parents(
    blocks: list[StructuralBlock],
    doc_meta: DocumentMetadata,
    parent_target: int = 1200,
    parent_max: int = 1600,
    child_target: int = 400,
) -> tuple[list[StructuredSection], list[ParentChunk]]:
    """Groups structural blocks into large ParentChunks (~1,200 to 1,600 tokens).

    Why separate parent and child budgets?
    - Parent chunks serve as broad contextual containers retrieved by `fetch_parent_context`.
    - By grouping parents at 1,200–1,600 tokens and downstream splitting them into ~400-token
      children with overlap, we ensure each parent encompasses multiple child chunks.
    - This allows child chunks to have high retrieval precision while the parent provides
      meaningful surrounding context without 1:1 redundancy.
    """
    sections: list[StructuredSection] = []
    parent_chunks: list[ParentChunk] = []
    current_content: list[str] = []
    current_tokens = 0
    current_heading = ""
    current_page: int | None = None
    section_counter = 0

    def flush():
        nonlocal current_content, current_tokens, current_heading, current_page, section_counter
        if current_content:
            text = "\n\n".join(current_content).strip()
            if text:
                section_counter += 1
                parent_id = f"P{section_counter:03d}"
                tokens = count_tokens(text)

                parent_meta = build_chunk_metadata(doc_meta, chunk_id=section_counter)
                parent_meta.update({
                    "parent_id": parent_id,
                    "page_number": current_page,
                    "section_title": current_heading,
                    "chunk_type": detect_block_type(text),
                    "token_count": tokens,
                    "is_parent": True,
                })
                # Store the full parent section (~1,200 tokens) in ParentChunk for database persistence
                parent_chunks.append(
                    ParentChunk(
                        parent_id=parent_id,
                        document_id=doc_meta.document_id,
                        document_version_id=doc_meta.document_version_id,
                        section_title=current_heading,
                        content=text,
                        token_count=tokens,
                        page_number=current_page,
                        chunk_type=detect_block_type(text),
                        metadata=parent_meta,
                    )
                )

                # Keep this section linked to parent_id; downstream split_oversized_sections
                # will partition it into ~400-token children with overlap.
                sections.append(
                    StructuredSection(
                        content=text,
                        heading=current_heading,
                        page_number=current_page,
                        chunk_type=detect_block_type(text),
                        tokens=tokens,
                        parent_id=parent_id,
                    )
                )
            current_content = []
            current_tokens = 0

    for block in blocks:

        if block.block_type == "table":
            flush()
            section_counter += 1
            parent_id = f"P{section_counter:03d}"
            table_tokens = count_tokens(block.content)

            parent_meta = build_chunk_metadata(doc_meta, chunk_id=section_counter)
            parent_meta.update({
                "parent_id": parent_id,
                "page_number": block.page_number,
                "section_title": block.heading,
                "chunk_type": "table",
                "token_count": table_tokens,
                "is_parent": True,
            })
            # ParentChunk retains the complete, undivided table for full context
            parent_chunks.append(
                ParentChunk(
                    parent_id=parent_id,
                    document_id=doc_meta.document_id,
                    document_version_id=doc_meta.document_version_id,
                    section_title=block.heading,
                    content=block.content,
                    token_count=table_tokens,
                    page_number=block.page_number,
                    chunk_type="table",
                    metadata=parent_meta,
                )
            )

            # Child section(s) fit within child_target (~400 tokens)
            if table_tokens <= child_target:
                sections.append(
                    StructuredSection(
                        content=block.content,
                        heading=block.heading,
                        page_number=block.page_number,
                        chunk_type="table",
                        tokens=table_tokens,
                        parent_id=parent_id,
                    )
                )
            else:
                # Oversized tables are split row-by-row while repeating column headers
                table_parts = split_oversized_table(
                    block.content,
                    heading=block.heading,
                    page_number=block.page_number,
                    max_tokens=child_target,
                    parent_id=parent_id,
                )
                sections.extend(table_parts)

            current_heading = block.heading
            current_page = block.page_number
            continue

        # Flush when section heading changes, or across pages (if non-trivial content exists)
        if block.heading != current_heading or (block.page_number != current_page and current_tokens > 80):
            flush()
            current_heading = block.heading
            current_page = block.page_number

        block_tokens = count_tokens(block.content)

        # Flush parent accumulator only when reaching parent budget (target 1,200, max 1,600)
        if current_tokens >= parent_target and (current_tokens + block_tokens > parent_max):
            flush()
            current_heading = block.heading
            current_page = block.page_number

        current_content.append(block.content)
        current_tokens += block_tokens

    flush()
    return sections, parent_chunks


def create_structured_sections(
    blocks: list[StructuralBlock],
    target_tokens: int = 400,
    max_tokens: int = 600,
    parent_target: int = 1200,
    parent_max: int = 1600,
) -> list[StructuredSection]:
    """Compatibility wrapper returning StructuredSection list without requiring doc_meta."""
    dummy_meta = DocumentMetadata(document_id=0, document_version_id=0, version_number=0, file_name="", clearance_level="")
    secs, _ = create_structured_sections_with_parents(
        blocks,
        dummy_meta,
        parent_target=parent_target,
        parent_max=parent_max,
        child_target=target_tokens,
    )
    return secs


create_semantic_sections = create_structured_sections



def split_oversized_sections(
    sections: list[StructuredSection],
    max_tokens: int = 400,
    overlap_tokens: int = 50,
) -> list[StructuredSection]:
    """Splits parent sections into ~400-token child chunks with overlap.

    - Table chunks are already split with headers retained, so they pass through directly.
    - Text sections <= max_tokens (400) remain intact as single child chunks.
    - Large parent sections (~1,200 tokens) are split into ~3-4 child chunks of ~400 tokens
      with 50-token overlap, each retaining the parent_id pointing to the parent.
    """
    if overlap_tokens >= max_tokens:
        overlap_tokens = max(0, max_tokens // 4)
    try:
        from transformers import PreTrainedTokenizerBase
        if isinstance(_tokenizer, PreTrainedTokenizerBase) or hasattr(_tokenizer, "is_fast"):
            splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(
                _tokenizer,
                chunk_size=max_tokens,
                chunk_overlap=overlap_tokens,
                separators=["\n\n", "\n", ". ", " ", ""],
            )
        else:
            splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
                chunk_size=max_tokens,
                chunk_overlap=overlap_tokens,
                separators=["\n\n", "\n", ". ", " ", ""],
            )
    except Exception:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=max_tokens,
            chunk_overlap=overlap_tokens,
            length_function=count_tokens,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    final_sections: list[StructuredSection] = []

    for sec in sections:
        # Tables were already split with headers in create_structured_sections_with_parents
        if sec.chunk_type == "table" or sec.tokens <= max_tokens:
            final_sections.append(sec)
        else:
            # Split parent section into ~400-token child chunks with overlap
            sub_chunks = splitter.split_text(sec.content)
            for sub in sub_chunks:
                final_sections.append(
                    StructuredSection(
                        content=sub,
                        heading=sec.heading,
                        page_number=sec.page_number,
                        chunk_type=sec.chunk_type,
                        tokens=count_tokens(sub),
                        parent_id=sec.parent_id,
                    )
                )

    return final_sections


def chunk_document(
    markdown_text: str,
    doc_meta: DocumentMetadata,
    target_tokens: int = 400,
    max_tokens: int = 600,
    overlap_tokens: int = 50,
    parent_target: int = 1200,
    parent_max: int = 1600,
) -> ChunkingResult:
    """Chunks a document into parent chunks (~1,200 tokens) and child chunks (~400 tokens).

    1. Blocks are grouped into parent chunks using `parent_target=1200` and `parent_max=1600`.
    2. Parent sections are then partitioned into ~400-token child chunks with 50-token overlap.
    3. Every child chunk retains `parent_chunk_id`, enabling rich contextual retrieval via
       `fetch_parent_context`.
    """
    if not markdown_text:
        return ChunkingResult(chunks=[], parents=[])

    linearized = linearize_document(markdown_text)
    blocks = detect_structural_blocks(linearized)

    # Step 1: Group into larger parent sections (~1,200-1,600 tokens)
    sections, parent_chunks = create_structured_sections_with_parents(
        blocks,
        doc_meta,
        parent_target=parent_target,
        parent_max=parent_max,
        child_target=target_tokens,
    )

    # Step 2: Split each parent section into ~400-token child chunks (with overlap)
    final_sections = split_oversized_sections(
        sections,
        max_tokens=target_tokens,
        overlap_tokens=overlap_tokens,
    )

    chunks: list[FileChunk] = []
    for i, sec in enumerate(final_sections):
        chunk_id = f"C{i+1:03d}"
        chunk_meta = build_chunk_metadata(doc_meta, chunk_id=i)



        chunk_meta.update({
            "chunk_id": chunk_id,
            "page_number": sec.page_number,
            "section_title": sec.heading,
            "chunk_type": sec.chunk_type,
            "token_count": sec.tokens,
            "clearance_level": doc_meta.clearance_level,
            "parent_chunk_id": sec.parent_id,
        })

        chunks.append(
            FileChunk(
                content=sec.content,
                document_id=doc_meta.document_id,
                document_version_id=doc_meta.document_version_id,
                chunk_index=i,
                chunk_id=chunk_id,
                file_name=doc_meta.file_name,
                page_number=sec.page_number,
                section_title=sec.heading,
                chunk_type=sec.chunk_type,
                token_count=sec.tokens,
                clearance_level=doc_meta.clearance_level,
                parent_chunk_id=sec.parent_id,
                metadata=chunk_meta,
            )
        )

    return ChunkingResult(chunks=chunks, parents=parent_chunks)

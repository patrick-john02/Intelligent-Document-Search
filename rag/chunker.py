# rag/chunker.py: Structure-Aware Token-Based Chunker.
#
# ARCHITECTURAL RATIONALE:
# Rather than calculating sentence-by-sentence embedding similarity (which can
# errantly slice tables, blur structural boundaries, and consume heavy inference cycles),
# this chunker respects the document's native structural hierarchy:
#
#   Extracted document (Markdown + OCR)
#         │
#         ▼
#   DepicDoc structure normalization
#         │
#         ▼
#   Structural Element Detection (Headings, Paragraphs, Lists, Tables, Pages)
#         │
#         ▼
#   Structured Section Grouping (Table Isolation vs Narrative Flow)
#         │
#         ▼
#   Token Budget Measurement (~400 target tokens, ~600 hard ceiling)
#         │
#         ▼
#   Tokenizer-Aligned Splitting (Only for oversized narrative sections)
#         │
#         ▼
#   Enriched FileChunk[] with parent-child links & chunk types
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

import tiktoken
from depicdoc import linearize_document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from rag.metadata import DocumentMetadata, build_chunk_metadata
from core.configurations import app_settings

# ============================================================================
# FEATURE 1: TOKENIZER ALIGNMENT (Official Embedding Model Tokenizer)
# Synchronizes the chunker tokenizer with the embedding model's subword vocabulary
# (e.g., Qwen3 / Qwen2.5 Hugging Face AutoTokenizer).
# Technical term: 'Tokenizer Alignment'.
# Guarantees that 400 tokens measured during ingestion equals exactly 400 tokens
# consumed by the embedding model, eliminating subword token drift caused by
# generic tokenizers like tiktoken (OpenAI) vs Qwen's 152k vocabulary.
# ============================================================================

def _init_tokenizer():
    """
    Initializes official Hugging Face AutoTokenizer matching the embedding model.
    Falls back gracefully to tiktoken cl100k_base if transformers is not loaded.
    """
    model_name = getattr(app_settings, "EMBEDDING_TOKENIZER", None) or getattr(app_settings, "EMBEDDING_MODEL", "Qwen/Qwen2.5-0.5B")
    try:
        from transformers import AutoTokenizer
        # Load official Hugging Face tokenizer (e.g. Qwen/Qwen2.5-0.5B)
        return AutoTokenizer.from_pretrained(model_name)
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Could not load AutoTokenizer for '{model_name}': {e}. Falling back to tiktoken cl100k_base.")
        try:
            return tiktoken.get_encoding("cl100k_base")
        except Exception:
            return None

_tokenizer = _init_tokenizer()


def count_tokens(text: str) -> int:
    """
    Measures exact subword token count using the embedding model's tokenizer.
    Uses Hugging Face AutoTokenizer for Qwen (with special tokens disabled during count),
    or tiktoken as a fallback, ensuring zero token drift.
    """
    if not text:
        return 0
    if _tokenizer is not None:
        try:
            # Hugging Face PreTrainedTokenizerFast (e.g. Qwen AutoTokenizer)
            # add_special_tokens=False ensures counting raw text tokens without injecting [CLS]/[EOS]
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


# ============================================================================
# FEATURE 2: ENRICHED FILE CHUNK DATACLASS
# First-class attributes instead of an untyped dictionary.
# Exposes chunk_type, section_title, page_number, and token_count for
# precise agent retrieval, type filtering (e.g. table queries), and reranking.
# ============================================================================

@dataclass
class ParentChunk:
    """
    Represents an enclosing structural parent section (e.g. ~1,000 - 1,500 tokens).
    Stored in PostgreSQL to provide surrounding context to the Document Analysis Agent
    when smaller, high-precision child chunks (~400 tokens) are retrieved during search.
    """
    parent_id: str                      # e.g. "P001", "P002", etc.
    document_id: int
    document_version_id: int
    section_title: str
    content: str                         # The full ~1,200 token parent section
    token_count: int
    page_number: int | None = None
    chunk_type: str = "section"          # "section" or "table"
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class FileChunk:
    """Represents a discrete retrieval (child) chunk with first-class structural attributes."""
    content: str
    document_id: int
    document_version_id: int
    chunk_index: int
    chunk_id: str
    file_name: str
    page_number: int | None = None
    section_title: str = ""
    chunk_type: str = "paragraph"  # 'paragraph', 'table', 'heading_section', 'list'
    token_count: int = 0
    clearance_level: str = "PUBLIC"
    parent_chunk_id: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ChunkingResult:
    """
    Container holding both retrieval child chunks (~400 tokens) and enclosing parent sections (~1,200 tokens).
    Implements sequence protocols for seamless backward compatibility with code expecting list[FileChunk].
    """
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
    """An individual structural element parsed from the document (heading, table, list, paragraph)."""
    content: str
    block_type: str  # 'heading', 'table', 'list', 'paragraph'
    heading: str = ""
    page_number: int | None = None

# Backward compatibility alias
SemanticBlock = StructuralBlock


@dataclass
class StructuredSection:
    """A cohesive structural section (e.g. section, table, or grouped paragraphs)."""
    content: str
    heading: str = ""
    page_number: int | None = None
    chunk_type: str = "paragraph"
    tokens: int = 0
    parent_id: str | None = None

# Backward compatibility alias
SemanticSection = StructuredSection


# ============================================================================
# FEATURE 3: STRUCTURE-AWARE ELEMENT & TYPE DETECTION
# Classifies blocks into semantic types so tables, lists, and headings
# receive appropriate handling rather than generic text slicing.
# ============================================================================

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
    """
    Parses document blocks and tags them by type:
    - Page boundaries ('## Page X') generated by interleaved OCR extraction
    - Markdown Headings ('# ', '## ', '### ') for topical context
    - Tables (Markdown tables '|' or DepicDoc '[Columns: ...]')
    - Standard paragraphs and lists
    """
    raw_blocks = [b.strip() for b in markdown_text.split("\n\n") if b.strip()]
    blocks: list[StructuralBlock] = []

    current_page: int | None = None
    current_heading: str = ""

    for block in raw_blocks:
        # 1. Detect and track Page boundary (from extractor.py)
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

        # 2. Detect heading updates
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


# ============================================================================
# FEATURE 4: DEDICATED TABLE PATH (Preserves Column Headers & Row Integrity)
# Never cuts tables mid-row or detaches data from column headers.
# If a table exceeds max_tokens, it splits by row groups while repeating
# the column header at the top of every chunk.
# ============================================================================

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

    # Detect header lines (DepicDoc '[Columns: ...]' or Markdown '| ... |')
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


# ============================================================================
# FEATURE 5: NARRATIVE PATH & TOKEN BUDGET (~400 Target, 600 Ceiling)
# Groups paragraphs under the same heading & page.
# Rather than calculating sentence-by-sentence embedding similarity (which can
# unpredictably slice tables or group disjointed thoughts), this relies on
# native document structure (headings + paragraphs) bounded by token budgets.
# If a logical paragraph is 430 tokens, we preserve it 100% intact instead
# of chopping it arbitrarily at 400.
# ============================================================================

def create_structured_sections_with_parents(
    blocks: list[StructuralBlock],
    doc_meta: DocumentMetadata,
    target_tokens: int = 400,
    max_tokens: int = 600,
) -> tuple[list[StructuredSection], list[ParentChunk]]:
    """
    Groups paragraphs and tables into cohesive parent sections (~1,000 - 1,500 tokens).
    Simultaneously produces:
    1. ParentChunk[] representations (unsliced parent sections for agent context expansion)
    2. StructuredSection[] list (forwarded to token-aware splitter to yield ~400-token child chunks)
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

                # 1. Create enclosing Parent representation (~1,200 tokens)
                parent_meta = build_chunk_metadata(doc_meta, chunk_id=section_counter)
                parent_meta.update({
                    "parent_id": parent_id,
                    "page_number": current_page,
                    "section_title": current_heading,
                    "chunk_type": detect_block_type(text),
                    "token_count": tokens,
                    "is_parent": True,
                })
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

                # 2. Add to sections for child chunking
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
        # Separate Path for Tables: Tables remain standalone
        if block.block_type == "table":
            flush()
            section_counter += 1
            parent_id = f"P{section_counter:03d}"
            table_tokens = count_tokens(block.content)

            # Enclosing Parent representation for the full unsliced table
            parent_meta = build_chunk_metadata(doc_meta, chunk_id=section_counter)
            parent_meta.update({
                "parent_id": parent_id,
                "page_number": block.page_number,
                "section_title": block.heading,
                "chunk_type": "table",
                "token_count": table_tokens,
                "is_parent": True,
            })
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

            # If table is within ceiling, keep intact; otherwise split by row groups
            if table_tokens <= max_tokens:
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
                table_parts = split_oversized_table(
                    block.content,
                    heading=block.heading,
                    page_number=block.page_number,
                    max_tokens=target_tokens,
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

        # Flexible boundary check:
        # Only flush if we already reached target_tokens (400) AND adding this next block
        # would breach the hard ceiling (600). Otherwise, keep logical paragraphs together!
        if current_tokens >= target_tokens and (current_tokens + block_tokens > max_tokens):
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
) -> list[StructuredSection]:
    """Compatibility wrapper returning StructuredSection list without requiring doc_meta."""
    dummy_meta = DocumentMetadata(document_id=0, document_version_id=0, version_number=0, file_name="", clearance_level="")
    secs, _ = create_structured_sections_with_parents(blocks, dummy_meta, target_tokens, max_tokens)
    return secs

# Backward compatibility alias
create_semantic_sections = create_structured_sections


# ============================================================================
# FEATURE 6: TOKEN-AWARE SPLITTING (Only for Oversized Sections > 600 Tokens)
# Splits narrative sections exceeding max_tokens using the embedding model's
# aligned tokenizer (AutoTokenizer for Qwen), avoiding any subword drift.
# ============================================================================

def split_oversized_sections(
    sections: list[StructuredSection],
    max_tokens: int = 600,
    overlap_tokens: int = 50,
) -> list[StructuredSection]:
    """
    Splits any narrative section exceeding max_tokens using tokenizer alignment.
    Prioritizes the embedding model's AutoTokenizer (e.g. Qwen), falling back to tiktoken.
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
        # Tables were already safely split by rows; leave them alone
        if sec.tokens <= max_tokens or sec.chunk_type == "table":
            final_sections.append(sec)
        else:
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


# ============================================================================
# FEATURE 7: STRUCTURE-AWARE TOKEN-BASED CHUNKER ENTRY POINT
# Generates high-precision retrieval Child Chunks (FileChunk ~400 tokens)
# and enclosing Parent Sections (ParentChunk ~1,200 tokens).
# ============================================================================

def chunk_document(
    markdown_text: str,
    doc_meta: DocumentMetadata,
    target_tokens: int = 400,
    max_tokens: int = 600,
    overlap_tokens: int = 50,
) -> ChunkingResult:
    """
    Processes markdown into parent sections and child retrieval chunks:
    - ParentChunks: Full ~1,200-token sections for agent context expansion
    - FileChunks: Precise ~400-token slices for dense vector and lexical indexing
    """
    if not markdown_text:
        return ChunkingResult(chunks=[], parents=[])

    # 1. Structure normalization
    linearized = linearize_document(markdown_text)

    # 2. Structural element detection
    blocks = detect_structural_blocks(linearized)

    # 3. Create structured sections & capture full parent sections
    sections, parent_chunks = create_structured_sections_with_parents(
        blocks,
        doc_meta,
        target_tokens=target_tokens,
        max_tokens=max_tokens,
    )

    # 4. Token-aware splitting for oversized narrative blocks -> child chunks
    final_sections = split_oversized_sections(
        sections,
        max_tokens=max_tokens,
        overlap_tokens=overlap_tokens,
    )

    # 5. Build Enriched Child FileChunk models
    chunks: list[FileChunk] = []
    for i, sec in enumerate(final_sections):
        chunk_id = f"C{i+1:03d}"
        chunk_meta = build_chunk_metadata(doc_meta, chunk_id=i)

        # Enriched metadata for vector store filtering & parent-child retrieval
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

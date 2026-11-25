"""Alon, the archiving agent: Targeted ReAct investigation step.

Same specialist pattern as the researcher and analyst (`create_agent` + its own prompt + tools),
paired with deterministic pre-fetching in `runner.py`. Alon starts with the mandatory dossier
(overview, TF-IDF + SetFit ML votes, Page 1 text, duplicates, similar archived docs) and uses
`TARGETED_ARCHIVE_TOOLS` (`read_pages`, `find_similar_archived`) only when he needs to investigate
further.

Why no response_format here: forcing the final answer to be a tool call ("ToolStrategy")
fails on some Groq models (gpt-oss writes the proposal as text instead of calling the tool,
and Groq rejects it with 400 tool_use_failed). So Alon finishes with a plain-text findings
report, and runner.py converts that report into an ArchiveProposal in a small structured-output
call and applies deterministic guardrails.
"""
from langchain.agents import create_agent

from core.configurations import chat_model
from tools.archiving.archive_tools import TARGETED_ARCHIVE_TOOLS
from agents.archiving_agent.context import DOC_ARCHIVING_SYSTEM_PROMPT

doc_archiving_app = create_agent(
    model=chat_model,
    tools=TARGETED_ARCHIVE_TOOLS,
    system_prompt=DOC_ARCHIVING_SYSTEM_PROMPT,
)

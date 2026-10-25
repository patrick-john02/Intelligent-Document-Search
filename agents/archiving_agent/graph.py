"""Alon, the archiving agent: investigation step (ReAct agent with tools).

Same pattern as the researcher and analyst (create_agent + its own tools + its own prompt),
so all specialists are built the same way.

Why no response_format here: forcing the final answer to be a tool call ("ToolStrategy")
fails on some Groq models (gpt-oss writes the proposal as text instead of calling the tool,
and Groq rejects it with 400 tool_use_failed). So Alon finishes with a plain-text findings
report, and runner.py converts that report into an ArchiveProposal in a second, small
structured-output call. That is reliable on any model.
"""
from langchain.agents import create_agent

from core.configurations import chat_model
from tools.archiving.archive_tools import ARCHIVE_TOOLS
from agents.archiving_agent.context import DOC_ARCHIVING_SYSTEM_PROMPT

doc_archiving_app = create_agent(
    model=chat_model,
    tools=ARCHIVE_TOOLS,
    system_prompt=DOC_ARCHIVING_SYSTEM_PROMPT,
)
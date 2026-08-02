from langchain.agents import create_agent
from langchain.agents.middleware import (
    PIIMiddleware, ModelCallLimitMiddleware,
    ToolCallLimitMiddleware, HumanInTheLoopMiddleware
)
from core.dependencies import chat_model


agent = create_agent(
    model=chat_model,
    tools=tools,
middleware=[
        PIIMiddleware("email", strategy="redact", apply_to_output=True),
        ModelCallLimitMiddleware(run_limit=8, exit_behavior="end"),
        ToolCallLimitMiddleware(run_limit=12),
        HumanInTheLoopMiddleware(interrupt_on=sensitive_tools),
    ],   
)
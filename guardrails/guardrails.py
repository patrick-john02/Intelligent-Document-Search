from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware

agent = create_agent(
    model = "qwen3:7b",
    tools = ['personal_information', 'credentials', 'legal_document'],
    middleware=(
        PIIMiddleware(
            'email', 
            strategy="redact",
            apply_to_inport=True,
        ),
        PIIMiddleware(
            'legal_document'
        )
    )
)

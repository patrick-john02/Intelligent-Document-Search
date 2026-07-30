# from langgraph.types import (
#     RetryPolicy, Command
# )
# from langgraph.errors import NodeError
# from typing import Literal

# from agents.state import DocumentAgentState

# #transient errors
# workflow.add_node(
#     "search_documentation",
#     search_documentation,
#     retry_policy=RetryPolicy(max_attempts=3, initial_interval=1.0)
# )

# #LLM-recoverable
# def execute_tool(state:State)->Command[Literal["agent", "execute_tool"]]:
#     try:
#         result = run_tool(state['tool_call'])
#         return Command(update={"tool_result":result}, goto="agent")


# #user fixable
# def lookup_customer_history(
#         state:State
# )->Command[Literal["lookup_document_history", "draft_response"]]:
#     if not state.get('document_id'):
#         user_input = interrupt({
#             "message": "Customer ID needed",
#             "request": "Please provide the Document name to look up the valid document you are finding"
#         })



# #Unexpected
# def send_reply(state: DocumentAgentState):
#     try:
#         document_service.send(state["draft_response"])
#     except Exception as e:
#         print (f"Invalid input {str(e)}")


# #saga compensation
# def payment_error_handler(state:State, error: NodeError)->Command:
#     return Command(
#         update={"status": f"compensated: {error.error}"},
#         goto="finalized",
#     )

# workflow.add_node(
#     "charge_payment",
#     charge_payment,
#     retry_policy=RetryPolicy(max_attempts=3, retry_on=ConnectionError),
#     error_handler=payment_error_handler, 
# )


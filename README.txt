#Ingestion Approach Sequence
1. Create DocumentModel
2. Flush to obtain document ID
3. Build storage directory
4. Save the physical file
5. Assign path to DocumentModel
6. Set ingestion_status = "pending"
7. Commit
8. Trigger ingestion

#Thinking in Langgraph
LLM Steps: 
-Classify intent-
Static context (prompt): Classification categories, urgency definitions, response format
Dynamic context (from state): Email content, sender information
Desired outcome: Structured classification that determines routing

-Draft reply
Static context (prompt): Tone guidelines, company policies, response templates
Dynamic context (from state): Classification results, search results, customer history
Desired outcome: Professional email response ready for review

Data steps:
-Document search-

Parameters: Query built from intent and topic
Retry strategy: Yes, with exponential backoff for transient failures
Caching: Could cache common queries to reduce API calls

-Customer history lookup-
Parameters: Customer email or ID from state
Retry strategy: Yes, but with fallback to basic info if unavailable
Caching: Yes, with time-to-live to balance freshness and performance


Action steps:
When a step needs to perform an external action:
-Send reply-

When to execute node: After approval (human or automated)
Retry strategy: Yes, with exponential backoff for network issues
Should not cache: Each send is a unique action

-Bug track-
When to execute node: Always when intent is “bug”
Retry strategy: Yes, critical to not lose bug reports
Returns: Ticket ID to include in response


agent/
├── state.py      # Defines shared workflow data
├── context.py    # Defines services/dependencies
├── nodes.py      # Contains node functions
├── routing.py    # Contains conditional routing functions
└── graph.py      # Connects nodes and compiles the graph


START
→ classify_question
→ search_documents
→ generate_answer
→ END


Agents to create:
Chat Supervisor Agent
Document Analysis Agent
Document Retrieval Agent
Leave Credits Agent
Attachment Intake Agent


temperature controls how random or creative the LLM’s token selection is.
0 - Predictable and focused
0.2-0.4 - Slight flexibility, still controlled
0.7 - More varied and conversational
1.0+ - Highly varied and potentially unreliable



User message
→ Supervisor Agent
→ choose the right specialist agent
→ specialist agent does the work
→ supervisor returns the final response



----RecursiveTextSplitter-------
It breaks one large document into smaller pieces called chunks before embedding them.






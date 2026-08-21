Intelligent Document Searching System

stack used: LangChain, Langgraph, FASTAPI, 
llm: local Ollama

# setup the docker
type on terminal vscode : 

cd deployment
docker compose up -d
docker compose up -d pgadmin - for the UI on browser

# creds
Email: admin@admin.com
Password: admin


#  model/database migrations
alembic init -t async alembic
uv run alembic revision --autogenerate -m "create documents table"
uv run alembic upgrade head


new update: i used Anydoc on the part of ingestion.py for text extraction, rather than doing if else manully on python.

agents to be created: 
1. supervisor agent 
2. ingestion and tagging agent (archiving agent)
3. semantic search agent(researcher agent)
4. document analysis agent
5. report generator agent

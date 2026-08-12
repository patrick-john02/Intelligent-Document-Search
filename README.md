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

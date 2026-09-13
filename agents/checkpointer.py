from psycopg_pool import AsyncConnectionPool
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.store.memory import InMemoryStore

#imports
from core.configurations import app_settings


POSTGRES_CONN_STRING = (
    f"postgresql://{app_settings.POSTGRES_USER}:{app_settings.POSTGRES_PASSWORD}"
    f"@{app_settings.HOST}:{app_settings.POSTGRES_PORT}/{app_settings.POSTGRES_DB}"
)



#async connection pool for postgres checkpointer
checkpointer_pool = AsyncConnectionPool(
    conninfo=POSTGRES_CONN_STRING,
    max_size=20, #upto 20 connections
    kwargs={"autocommit": True},
    open=False #open asynchronously in FASTAPI lifespan
)


posgres_checkpointer = AsyncPostgresSaver(checkpointer_pool)
#store long-term cross-conversation memory
#InMemoryStore stores key-value pairs organized by namespaces across threads
store = InMemoryStore()



#open the pool and creates checkpoints table in postgresql if they do not exists
async def init_checkpointer():
    await checkpointer_pool.open()
    await posgres_checkpointer.setup()


#closes the connection pool on app shutdown.
async def close_checkpointer():
    await checkpointer_pool.close()



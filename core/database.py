from sqlalchemy.ext.asyncio import(
    async_sessionmaker,create_async_engine, 
)



# from core.configurations.App
engine = create_async_engine()
SessionLocal = async_sessionmaker()


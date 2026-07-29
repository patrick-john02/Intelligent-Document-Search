from sqlalchemy.ext.asyncio import(
    async_sessionmaker,create_async_engine, 
)
from core.configurations import app_settings



# from core.configurations.App
engine = create_async_engine(app_settings.DATABASE_URL)
SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)



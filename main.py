from fastapi import FastAPI
from fastapi_pagination import add_pagination
from fastapi.middleware.cors import CORSMiddleware
from core.configurations import app_settings

from api.views import (
    document_views,
    authentication,
    category_views,
    chat_view,
    search_views,
)
from api.views.admin import (
    user_management,
    admin_dashboard,
)

app = FastAPI(title="Document Archiving system with Semantic Retrieval System")

origins = [origin.strip() for origin in app_settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authentication.router, prefix="/api")
app.include_router(user_management.router, prefix="/api")
app.include_router(admin_dashboard.router, prefix="/api")
app.include_router(document_views.router, prefix="/api")
app.include_router(search_views.router, prefix="/api")
app.include_router(category_views.router, prefix="/api")
app.include_router(chat_view.router, prefix="/api")

add_pagination(app)
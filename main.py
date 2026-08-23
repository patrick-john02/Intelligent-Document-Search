from fastapi import FastAPI, Depends
from fastapi_pagination import add_pagination
from fastapi.middleware.cors import CORSMiddleware
from core.configurations import app_settings

from api.views import(
    document_views, authentication, category_views,
)
from api.views.admin import(
    user_management, 
)


app = FastAPI(title="Document Archiving system with Semantic Retrieval System")
# auth_router = Login()

origins = [origins.strip() for origins in app_settings.CORS_ORIGINS.split(",") if origins.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

app.include_router(document_views.app, prefix='/api')
app.include_router(authentication.router, prefix="/api" )
app.include_router(user_management.router, prefix="/api")
app.include_router(category_views.router, prefix="/api")


add_pagination(app)
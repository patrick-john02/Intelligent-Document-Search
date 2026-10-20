"""Turns every `document_category_id` form field in Swagger UI into a dropdown
filled with the categories currently in the database."""
from fastapi import FastAPI, Request
from sqlalchemy import select

from core.database import SessionLocal
from api.models.document import DocumentCategory

FIELD = "document_category_id"


def setup_category_dropdown(app: FastAPI) -> None:
    categories: list[tuple[int, str]] = []
    original_openapi = app.openapi

    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema
        schema = original_openapi()
        if categories:
            for component in schema.get("components", {}).get("schemas", {}).values():
                prop = component.get("properties", {}).get(FIELD)
                if prop is not None:
                    prop["enum"] = [cid for cid, _ in categories]
                    prop["description"] = ", ".join(f"{cid} = {name}" for cid, name in categories)
        return schema

    app.openapi = custom_openapi

    @app.middleware("http")
    async def refresh_categories(request: Request, call_next):
        # Reload categories each time /openapi.json is requested, so new ones show up.
        if request.url.path == app.openapi_url:
            try:
                async with SessionLocal() as db:
                    rows = (await db.execute(
                        select(DocumentCategory.id, DocumentCategory.name).order_by(DocumentCategory.id)
                    )).all()
                categories[:] = [(r.id, r.name) for r in rows]
            except Exception:
                pass  # keep last known list if the DB is unavailable
            app.openapi_schema = None
        return await call_next(request)

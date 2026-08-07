from fastapi import FastAPI, APIRouter, Depends
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from core.dependencies import get_db

#imports
from api.schema.authentication.auth import Token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
async def login(
    db: Annotated[AsyncSession, Depends(get_db)]
):
    
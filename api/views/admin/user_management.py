from fastapi import(
    APIRouter, status, HTTPException, Depends
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime


#imports
from api.models.users import Users
from api.schema.users_schema import UserSchema, CreateUsers

from core.dependencies import get_db
from core.security import get_current_active_user, get_password_hash

app = APIRouter(prefix="/user_management", tags=["User Management"])
router = app


@app.get("/lists", status_code=status.HTTP_200_OK, response_model=list[UserSchema])
async def get_users_lists(
    db:AsyncSession=Depends(get_db),
    current_user: Users=Depends(get_current_active_user)
):
    
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="you are not authorized"
        )
    
    query = select(Users).where(
        Users.is_active.is_(True)
    ).order_by(Users.created_at.desc())
    
    results = await db.execute(query)
    return results.scalars().all()

@app.post("/create", status_code=status.HTTP_201_CREATED, response_model=UserSchema)
async def create_users(
    payload: CreateUsers,
    db:AsyncSession=Depends(get_db),
    current_user: Users=Depends(get_current_active_user)
    
):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="you are not authorized"
        )
        
    existing_user = await db.execute(
        select(Users).where((Users.username == payload.username) | (Users.email == payload.email))
    )
    
    if existing_user.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
        
    
    create_users = Users(
        username = payload.username,
        password = get_password_hash(payload.password),
        first_name = payload.first_name,
        middle_name = payload.middle_name,
        last_name = payload.last_name,
        email = payload.email,
        birth_date = payload.birth_date,
        position = payload.position,
        employee_number = payload.employee_number,
        office = payload.office,
        division = payload.division,
        account_status=payload.account_status,
        is_active=True,
        is_superuser=False,
        system_role_id=1,
        created_at=datetime.now()
    )
    
        
    db.add(create_users)
    await db.commit()
    await db.refresh(create_users)
    
    return create_users
        
    
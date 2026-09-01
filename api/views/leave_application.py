# from fastapi import(
#     HTTPException, status, Depends, APIRouter
# )
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select



# #imports
# from core.dependencies import get_db
# from core.security import get_current_active_user
# from api.models.users import Users
# from api.models.leave import ApplicationForLeave
# from api.schema.leave_schema import LeaveResponse, LeaveCreate


# app = APIRouter(prefix="/leave", tags=["Application For Leave"])

# @app.get("/list", status_code=status, response_model=list[LeaveResponse])
# async def get_list(
#     db:AsyncSession=Depends(get_db),
#     current_user: Users = Depends(get_current_active_user)
# ):

#     query = select(ApplicationForLeave).where(
#         ApplicationForLeave.is_deleted.is_(False),
#     ).order_by(ApplicationForLeave.created_at.desc())

#     result = await db.execute(query)
#     return result.scalars().all()


# @app.get("/{id}", status_code=status.HTTP_200_OK, response_model=LeaveResponse)
# async def view_leave(
#     id: int,

#     db:AsyncSession=Depends(get_db),
#     current_user: Users=Depends(get_current_active_user)
# ):

#     query = select(ApplicationForLeave).where(
#         ApplicationForLeave.id == id,
#         ApplicationForLeave.user_id == current_user.id,
#     )

#     result = await db.execute(query)
#     leave = result.scalar_one_or_none()

#     if not leave:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Leave not Found"
#         )

#     return leave


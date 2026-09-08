# from fastapi import (
#     APIRouter, status, HTTPException, Depends
# )
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy import select, func


# #imports
# from core.dependencies import get_db
# from core.security import get_current_active_user

# from api.models.users import Users
# from api.models.document import DocumentModel
# from api.models.agents_tasks import AgentExecutions



# app = APIRouter(prefix="/dashbard", tags=["Staff Dashboard"])

# @app.get("/analytics", status_code=status.HTTP_200_OK)
# async def analytics_counts(
#     db:AsyncSession=Depends(get_db),
#     current_user: Users = Depends(get_current_active_user)
# ):

#     query=select(func.count(DocumentModel.id)).where(
#         DocumentModel.is_deleted.is_(False)
#     )

#     docs = await db.execute(query)
#     doc_result = docs.scalars().all()


#     query=select(func.count(AgentExecutions.id))

#     count ml
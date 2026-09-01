# from pydantic import BaseModel
# from datetime import datetime
# from typing import Optional

# class LeaveResponse(BaseModel):
#     id:int
#     user_id: int
#     number_of_days: int
#     number_of_hours: int
#     inclusive_period: str
#     reason_for_leave: Optional[str]= None
#     chargeable_against:Optional[str]=None
#     viewed_by: Optional[str] = None
#     is_deleted: bool
#     created_at:datetime


# class LeaveCreate(BaseModel):
#     number_of_days: int
#     user_id: int
#     number_of_hours: int
#     inclusive_period: str
#     reason_for_leave: Optional[str]= None
#     chargeable_against:Optional[str]=None

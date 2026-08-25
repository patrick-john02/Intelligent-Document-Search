from datetime import datetime, timezone

from fastapi import(
    status, HTTPException, APIRouter, Depends
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func


from api.models.conversations import(
    Conversation, ChatMessages, ChatMessageSources
)
from api.schema.chat_schema import (
    ConversationsResponse, ChatMessagesResponse,
    ChatSchema, ConvSchema, 
)

from api.models.users import Users
from core.dependencies import get_db
from core.security import get_current_active_user

#imports from agents
from agents.graph import app as agent_app

router = APIRouter(prefix="/chat", tags=["Chat App"])

@router.get("/list", status_code=status.HTTP_200_OK, response_model=list[ConversationsResponse])
async def conversation_lists(
    db:AsyncSession=Depends(get_db),
    current_user: Users=Depends(get_current_active_user)
):

    query = select(Conversation).where(
        Conversation.user_id == current_user.id,
    ).order_by(Conversation.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()



@router.get("/{conversation_id}/chats-lists", status_code=status.HTTP_200_OK, response_model=list[ChatMessagesResponse])
async def view_chats(
    conversation_id: int, 
    db:AsyncSession=Depends(get_db),
    current_user:Users=Depends(get_current_active_user)

):

    conv_query = select(Conversation).where(
        Conversation.id==conversation_id,
        Conversation.user_id == current_user.id,
    )
    conv_result = await db.execute(conv_query)
    conversation = conv_result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    
    query = (
        select(ChatMessages)
        .where(ChatMessages.conversation_id == conversation_id)
        .order_by(ChatMessages.created_at.asc()) 
    )
    result =  await db.execute(query)
    return result.scalars().all()


@router.post("/talk", status_code=status.HTTP_201_CREATED)
async def talk_to_ai(
    payload: ChatSchema,
    db:AsyncSession=Depends(get_db),
    current_user:Users=Depends(get_current_active_user)
):
    if payload.conversation_id:
        conv_query = select(Conversation).where(
            Conversation.id == payload.conversation_id,
            Conversation.user_id == current_user.id,
        )
        conv_result = await db.execute(conv_query)
        conversation = conv_result.scalar_one_or_none()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail = "Conversation not found"
            )
            
    else:
        conv_title = payload.title if payload.title else(payload.content[:30] + "...")
        conversation = Conversation(
            title=conv_title,
            user_id=current_user.id,
            created_at=datetime.now(timezone.utc)
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        
    user_message = ChatMessages(
        conversation_id = conversation.id,
        sender_type="user",
        content=payload.content,
        tokens_used=0,
        created_at=datetime.now(timezone.utc)
        
    )
    
    db.add(user_message)
    await db.commit()
    await db.refresh(user_message)
    
    initial_state = {
        "question": payload.content,
        "attachment_ids": [],
    }
    config = {"configurable": {"thread_id":str(conversation.id)}}
    
    agent_output = await agent_app.ainvoke(initial_state, config=config)
    ai_content = agent_output.get("final_response") or "No response generated."
    
    assistant_message = ChatMessages(
        conversation_id = conversation.id,
        sender_type="assistant",
        content=ai_content,
        tokens_used=0,
        created_at=datetime.now(timezone.utc),
    )
    db.add(assistant_message)
    await db.commit()
    await db.refresh(assistant_message)
    
    
    
    return{
        "message": "Chat Created Successfully", 
        "conversation_id": conversation.id,
        "chat": user_message,
        "assitant_message": assistant_message
    }


#TODO: Delete a conversation 
#TODO: Rename a conversation title
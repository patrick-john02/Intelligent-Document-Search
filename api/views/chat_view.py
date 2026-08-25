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

app = APIRouter(prefix="/chat", tags=["Chat App"])

@app.get("/list", status_code=status.HTTP_200_OK, response_model=list[ConversationsResponse])
async def conversation_lists(
    db:AsyncSession=Depends(get_db),
    current_user: Users=Depends(get_current_active_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="you are unauthorized"
        )

    query = select(Conversation).where(
        Conversation.user_id == current_user.id,
    ).order_by(Conversation.created_at.desc())

    result = await db.execute(query)
    return result.scalars()


@app.get("/{conversation_id}/chats-lists", status_code=status.HTTP_200_OK, response_model=list[ChatMessagesResponse])
async def view_chats(
    conversation_id: int, 
    db:AsyncSession=Depends(get_db),
    current_user:Users=Depends(get_current_active_user)

):

    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="you are unauthorized"
        )

    query = (
        select(ChatMessages)
        .join(Conversation)
        .where(
            ChatMessages.conversation_id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .order_by(ChatMessages.created_at.asc())
    )


    result = await db.execute(query)
    conversation = result.scalars().all()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat's not found"
        )

    return conversation

@app.post("/talk", status_code=status.HTTP_201_CREATED)
async def talk_to_ai(
    payload: ChatSchema,
    conv_payload_title: ConvSchema,
    db:AsyncSession=Depends(get_db),
    current_user:Users=Depends(get_current_active_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="you are unauthorized"
        )

    create_chat = ChatMessages(
        content = payload.content
    )

    db.add(create_chat)
    await db.commit()
    await db.refresh(create_chat)

    count_query = select(func.count(ChatMessages.id))
    result = await db.execute(count_query)
    message_count = result.scalar()

    if message_count > 2:
        # NOTE: Fetching ChatMessages.id == 2 specifically
        conv_title_query = select(ChatMessages).where(
            ChatMessages.id == 2
        )

        title_result = await db.execute(conv_title_query)
        message_for_title = title_result.scalar_one_or_none()

        created_conv = Conversation(
            title=conv_payload_title.conv_title
        )

        db.add(created_conv)
        await db.commit()
        await db.refresh(created_conv)

        return {"message": "Chat and conversation created", "chat": create_chat, "conversation": created_conv}

    return {"message": "Chat created", "chat": create_chat}






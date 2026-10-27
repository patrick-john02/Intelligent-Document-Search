
import logging
import json

from datetime import datetime, timezone

from langchain_core.messages import HumanMessage, ToolMessage, AIMessage
from langchain_core.callbacks import get_usage_metadata_callback
from langgraph.errors import GraphRecursionError

from tools.access.permissions import get_user_clearance_levels, clearance_filter, current_allowed_clearance
from api.models.document import DocumentModel

from fastapi.responses import StreamingResponse
from fastapi import(
    status, HTTPException, APIRouter, Depends
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func


from api.models.conversations import(
    Conversation, ChatMessages, ChatMessageSources,
    GeneratedReports,
)
from api.schema.chat_schema import (
    ConversationsResponse, ChatMessagesResponse,
    ChatSchema, ConvSchema, ChatRating,
    ReportResponseSchema, ReportCreateSchema,
)
from api.models.enums.conv import TaskType

from api.models.users import Users
from core.dependencies import get_db, SessionLocal
from core.security import get_current_active_user


#imports from agents
from agents.graph import app as agent_app

logger=logging.getLogger(__name__)

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

# ---------- Non-streaming (kept for tests / fallback) ----------
# @router.post("/talk", status_code=status.HTTP_201_CREATED)
# async def talk_to_ai(
#     payload: ChatSchema,
#     db:AsyncSession=Depends(get_db),
#     current_user:Users=Depends(get_current_active_user)
# ):
#     #validate attachments BEFORE creating anything
#     allowed_levels = [lvl.lower() for lvl in get_user_clearance_levels(current_user)]
#     attachment_ids = list(dict.fromkeys(payload.attachment_ids or [])) # dedupe, keep order

#     if attachment_ids:
#         found = (await db.execute(
#             select(DocumentModel.id).where(
#                 DocumentModel.id.in_(attachment_ids),
#                 DocumentModel.is_deleted.is_(False),
#                 clearance_filter(allowed_levels),
#             )
#         )).scalars().all()

#         if len(found) !=len(attachment_ids):
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail= "One or more attachments were not found."
#             )

#     if payload.conversation_id:
#         conv_query = select(Conversation).where(
#             Conversation.id == payload.conversation_id,
#             Conversation.user_id == current_user.id,
#         )
#         conv_result = await db.execute(conv_query)
#         conversation = conv_result.scalar_one_or_none()

        
#         if not conversation:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail = "Conversation not found"
#             )
            
#     else:
#         conv_title = payload.title if payload.title else(payload.content[:30] + "...")
#         conversation = Conversation(
#             title=conv_title,
#             user_id=current_user.id,
#             created_at=datetime.now(timezone.utc).replace(tzinfo=None)
#         )
#         db.add(conversation)
#         await db.commit()
#         await db.refresh(conversation)
        
#     user_message = ChatMessages(
#         conversation_id = conversation.id,
#         sender_type="user",
#         content=payload.content,
#         tokens_used=0,
#         task_type = TaskType.EXTRACTION,
#         created_at=datetime.now(timezone.utc).replace(tzinfo=None)
        
#     )
    
#     db.add(user_message)
#     await db.commit()
#     await db.refresh(user_message)
    
#     initial_state = {
#         "messages": [HumanMessage(content=payload.content)],
#         # "question": payload.content,
#         "attachment_ids": attachment_ids, # validated list, not payload.attachment_ids
#         "user_id" : current_user.id,
#         "user_profile":{
#             "name": f"{current_user.first_name} {current_user.last_name}".strip(),
#             "position": current_user.position,
#             "office": current_user.office,
#         }
#     }
#     config = {
#         "configurable": {"thread_id":str(conversation.id)},
#         "recursion_limit": 20 #guardrail : stops execution after 20 steps maximum
#     }

#     # token = current_allowed_clearance.set(get_user_clearance_levels(current_user))
#     token = current_allowed_clearance.set(allowed_levels)

#     sources: list[dict] = []
#     try:
#         agent_output = await agent_app.ainvoke(initial_state, config=config)
#         msgs = agent_output.get("messages", [])
#         ai_content = (msgs[-1].text if msgs else "") or "No response generated."

#         # sources from THIS turn only (tool results after the last human message)
#         last_human = max((i for i, m in enumerate(msgs) if isinstance(m, HumanMessage)), default=-1)
#         for m in msgs[last_human + 1:]:
#             if isinstance(m, ToolMessage) and isinstance(m.artifact, list):
#                 sources.extend(m.artifact)

#     except GraphRecursionError:
#         ai_content = "Sorry, that request needed too many steps. Please make it more specific."

#     except Exception:
#         logger.exception("[Chat] Agent failed (conversation_id=%s)", conversation.id)
#         ai_content = "Sorry, I couldn't process that request right now. Please try again in a moment."

#     finally:
#         current_allowed_clearance.reset(token)

    
#     assistant_message = ChatMessages(
#         conversation_id = conversation.id,
#         sender_type="assistant",
#         content=ai_content,
#         tokens_used=0,
#         task_type = TaskType.SUMMARIZATION,
#         created_at=datetime.now(timezone.utc).replace(tzinfo=None),
#     )
#     db.add(assistant_message)
#     await db.commit()
#     await db.refresh(assistant_message)
    
    
#     return{
#         "message": "Chat Created Successfully", 
#         "conversation_id": conversation.id,
#         "chat": ChatMessagesResponse.model_validate(user_message),
#         "assistant_message": ChatMessagesResponse.model_validate(assistant_message),
#         "sources": sources,
#     }








STATUS_LABELS = {
    "ask_researcher": "Searching the archive...",
    "ask_doc_analyst": "Analyzing the document...",
}

#Add up all tokens used in one request (supervisor + every specialist + tool LLM calls).
#Purpose: fill `ChatMessages.tokens_used` instead of always saving 0. and report token efficiency in your thesis evaluation.
def _total_tokens(usage_cb)->int:
    if not usage_cb:
        return 0
    return sum(int(u.gt("total_tokens", 0)) for u in usage_cb.usage_metadata.values())

#Collect the cited sources from THIS turn only (tool results after the last human message).
#Purpose: return the documents the answer was based on, as structured data.
def _turn_sources(msgs)->list[dict]:
    last_human = max((i for i, m in enumerate(msgs) if isinstance(m, HumanMessage)), default=-1)
    sources:list[dict]=[]
    for m in msgs[last_human + 1:]:
        if isinstance(m, ToolMessage) and isinstance(m.artifact, list):
            sources.extend(m.artifact)
    return sources


#Format one Server-Sent Event: `event: <name>` + `data: <json>` + blank line.
#Purpose: a single place to build stream messages (meta, status, reset, token, done).
def _sse(event:str, data:dict)->str:
    return f"event:{event}\ndata:{json.dumps(data,default=str)}\n\n"

#Everything that must happen BEFORE the agent runs, shared by /talk and /talk/stream.
async def _prepare_turn(payload:ChatSchema, db:AsyncSession, current_user:Users):
    allowed_levels = [lvl.lower() for lvl in get_user_clearance_levels(current_user)]
    attachment_ids = list(dict.fromkeys(payload.attachment_ids or []))

    if attachment_ids:
        found=(await db.execute(
            select(DocumentModel.id).where(
                DocumentModel.id.in_(attachment_ids),
                DocumentModel.is_deleted.is_(False),
                clearance_filter(allowed_levels),
            )
        )).scalars().all()
        if len(found) != len(attachment_ids):
               raise HTTPException(
                   status_code=status.HTTP_404_NOT_FOUND,
                   detail="One or more attachments were not found."
               )

    if payload.conversation_id:
        conversation = (await db.execute(
            select(Conversation).where(
                Conversation.id == payload.conversation_id,
                Conversation.user_id == current_user.id,
            )
        )).scalar_one_or_none()
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
    else:
        conversation = Conversation(
            title=payload.title or (payload.content[:30] + "..."),
            user_id=current_user.id,
            created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

    user_message = ChatMessages(
        conversation_id=conversation.id,
        sender_type="user",
        content=payload.content,
        tokens_used=0,
        task_type=TaskType.EXTRACTION,
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db.add(user_message)
    await db.commit()
    await db.refresh(user_message)


    initial_state={
        "messages": [HumanMessage(content=payload.content)],
        "attachment_ids": attachment_ids,
        "user_id": current_user.id,
        "user_profile": {
            "name": f"{current_user.first_name or ''} {current_user.last_name or ''}".strip(),
            "position": current_user.position,
            "office": current_user.office,
        },
    }
    config = {
        "configurable": {"thread_id": str(conversation.id)},
        "recursion_limit": 20, #guardrail: max 20 graph steps per request
    }

    return conversation, user_message, initial_state, config, allowed_levels

async def _save_assistant_message(db: AsyncSession, conversation_id: int, content: str, tokens_used: int) -> ChatMessages:
    msg = ChatMessages(
        conversation_id=conversation_id,
        sender_type="assistant",
        content=content,
        tokens_used=tokens_used,
        task_type=TaskType.SUMMARIZATION,
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg




@router.post("/talk", status_code=status.HTTP_201_CREATED)
async def talk_to_ai(
    payload: ChatSchema,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_active_user),
):
    conversation, user_message, initial_state, config, allowed_levels = await _prepare_turn(payload, db, current_user)

    token = current_allowed_clearance.set(allowed_levels)
    sources: list[dict] = []
    usage_cb = None
    try:
        with get_usage_metadata_callback() as usage_cb:   # counts supervisor + specialists
            agent_output = await agent_app.ainvoke(initial_state, config=config)
        msgs = agent_output.get("messages", [])
        ai_content = (msgs[-1].text if msgs else "") or "No response generated."
        sources = _turn_sources(msgs)
    except GraphRecursionError:
        ai_content = "Sorry, that request needed too many steps. Please make it more specific."
    except Exception:
        logger.exception("[Chat] Agent failed (conversation_id=%s)", conversation.id)
        ai_content = "Sorry, I couldn't process that request right now. Please try again in a moment."
    finally:
        current_allowed_clearance.reset(token)

    tokens_used = _total_tokens(usage_cb)
    assistant_message = await _save_assistant_message(db, conversation.id, ai_content, tokens_used)

    return {
        "message": "Chat Created Successfully",
        "conversation_id": conversation.id,
        "chat": ChatMessagesResponse.model_validate(user_message),
        "assistant_message": ChatMessagesResponse.model_validate(assistant_message),
        "sources": sources,
        "tokens_used": tokens_used,
    }


# ---------- Streaming (SSE) ----------
@router.post("/talk/stream")
async def talk_to_ai_stream(
    payload: ChatSchema,
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_active_user),
):
    # validation + saving the user message happen BEFORE streaming,
    # so a bad attachment/conversation is still a normal 404
    conversation, user_message, initial_state, config, allowed_levels = await _prepare_turn(payload, db, current_user)
    conversation_id = conversation.id
    user_message_out = ChatMessagesResponse.model_validate(user_message).model_dump(mode="json")

    async def event_stream():
        token = current_allowed_clearance.set(allowed_levels)
        final_text, sources, usage_cb = "", [], None

        yield _sse("meta", {"conversation_id": conversation_id, "chat": user_message_out})

        try:
            with get_usage_metadata_callback() as usage_cb:
                async for mode, chunk in agent_app.astream(
                    initial_state, config=config, stream_mode=["messages", "updates"]
                ):
                    if mode == "messages":
                        msg_chunk, meta = chunk
                        # only the supervisor's own words; sub-agent tokens are skipped
                        if meta.get("langgraph_node") == "agent_node" and msg_chunk.text:
                            yield _sse("token", {"text": msg_chunk.text})

                    elif mode == "updates":
                        for node, update in chunk.items():
                            for m in (update or {}).get("messages", []):
                                if node == "agent_node" and isinstance(m, AIMessage):
                                    if m.tool_calls:
                                        yield _sse("reset", {})
                                        for tc in m.tool_calls:
                                            yield _sse("status", {"text": STATUS_LABELS.get(tc["name"], "Working…")})
                                    else:
                                        final_text = m.text
                                elif node == "tools" and isinstance(m, ToolMessage) and isinstance(m.artifact, list):
                                    sources.extend(m.artifact)

            ai_content = final_text or "No response generated."
        except GraphRecursionError:
            ai_content = "Sorry, that request needed too many steps. Please make it more specific."
        except Exception:
            logger.exception("[Chat/stream] Agent failed (conversation_id=%s)", conversation_id)
            ai_content = "Sorry, I couldn't process that request right now. Please try again in a moment."
        finally:
            try:
                current_allowed_clearance.reset(token)
            except ValueError:
                pass  # generator closed from another context (client disconnected)

        tokens_used = _total_tokens(usage_cb)
        # the request's db session may be closed while streaming -> use a fresh one
        async with SessionLocal() as session:
            assistant_message = await _save_assistant_message(session, conversation_id, ai_content, tokens_used)

        yield _sse("done", {
            "assistant_message": ChatMessagesResponse.model_validate(assistant_message).model_dump(mode="json"),
            "content": ai_content,
            "sources": sources,
            "tokens_used": tokens_used,
        })

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},  # no buffering behind nginx
    )




    
#TODO: Rename a conversation title
@router.patch("/{id}", status_code=status.HTTP_200_OK, response_model=ConversationsResponse)
async def update_conversation(
    id:int,
    payload: ConvSchema,
    db:AsyncSession=Depends(get_db),
    current_user:Users=Depends(get_current_active_user)
):
    query = select(Conversation).where(
        Conversation.id == id,
        Conversation.user_id == current_user.id
    )
    
    result = await db.execute(query)
    update_conv = result.scalar_one_or_none()
    
    if not update_conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not Found"
        )
        
    update_conv.title = payload.title

    await db.commit()
    await db.refresh(update_conv)
    
    return update_conv
    


#TODO: Delete a conversation
@router.delete("/delete/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    id: int,
    db:AsyncSession=Depends(get_db),
    current_user:Users=Depends(get_current_active_user)
):
    query = select(Conversation).where(
        Conversation.id == id,
        Conversation.user_id == current_user.id
        
    )
    
    result = await db.execute(query)
    delete_conv = result.scalar_one_or_none()
    
    if not delete_conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation Not Found"
        )
        
    await db.delete(delete_conv)
    await db.commit()
    
    return None


#TODO: message feedback endpoint
@router.patch("/messages/{id}/feedback", status_code=status.HTTP_200_OK, response_model=ChatMessagesResponse)
async def users_feedback(
    id:int,
    payload: ChatRating,
    db:AsyncSession=Depends(get_db),
    current_user:Users=Depends(get_current_active_user)
):
    
    query = (
        select(ChatMessages)
        .join(Conversation, ChatMessages.conversation_id == Conversation.id)
        .where(
            ChatMessages.id == id,
            Conversation.user_id == current_user.id,
        )

    )

    result = await db.execute(query)
    feedback = result.scalar_one_or_none()
    
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail ="Message not found bor access denied"
        )

    if payload.user_rating is not None:
        feedback.user_rating = payload.user_rating
    if payload.is_helpful is not None:
        feedback.is_helpful = payload.is_helpful

    await db.commit()
    await db.refresh(feedback)
        
    return feedback

#TODO: gerated reports endpoints
@router.post("/{conversation_id}/reports", status_code=status.HTTP_201_CREATED, response_model=ReportResponseSchema)
async def create_generated_report(
    conversation_id: int,
    payload: ReportCreateSchema,
    db:AsyncSession=Depends(get_db),
    current_user:Users=Depends(get_current_active_user)
):
    conv_query = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
    )
    
    conv_result = await db.execute(conv_query)
    conversation = conv_result.scalar_one_or_none()
    
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    new_report = GeneratedReports(
        title=payload.title,
        report_type=payload.report_type,
        report_content=payload.report_content,
        conversation_id=conversation.id,
        created_by_id=current_user.id
    )
    
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    
    return new_report


@router.get("/{conversation_id}/reports", status_code=status.HTTP_200_OK, response_model=list[ReportResponseSchema])
async def generated_reports(
    conversation_id: int,
    db:AsyncSession=Depends(get_db),
    current_user:Users=Depends(get_current_active_user)
):
    
    conv_query = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
        
    )
    
    conv_result = await db.execute(conv_query)
    if not conv_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
        
    query = select(GeneratedReports).where(
        GeneratedReports.conversation_id==conversation_id,
        GeneratedReports.created_by_id==current_user.id,
    ).order_by(GeneratedReports.id.desc())
    
    result = await db.execute(query)
    return result.scalars().all()

    
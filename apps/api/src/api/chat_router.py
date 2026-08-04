import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.session import get_db
from db.models.chat_session import ChatSessionModel, ChatMessageModel

router = APIRouter(prefix="/chats", tags=["Chat History"])


class ThinkingStepSchema(BaseModel):
    text: str
    done: bool = True


class SourceSchema(BaseModel):
    name: str
    url: str
    domain: str
    icon: str


class ChatMessageSchema(BaseModel):
    id: str
    role: str
    text: str
    progress: Optional[int] = 100
    progressLabel: Optional[str] = None
    thinking: Optional[List[ThinkingStepSchema]] = None
    sources: Optional[List[SourceSchema]] = None
    thinkingDuration: Optional[int] = None
    showGraph: Optional[bool] = False


class SaveChatSessionRequest(BaseModel):
    id: str
    title: str
    user_email: Optional[str] = "admin@enterprise.com"
    messages: List[ChatMessageSchema]


class ChatSessionSummarySchema(BaseModel):
    id: str
    title: str
    timestamp: float
    messages: List[ChatMessageSchema]


@router.get("", response_model=List[ChatSessionSummarySchema])
def get_chat_sessions(
    user_email: Optional[str] = Query(None, description="Optional user email filter"),
    db: Session = Depends(get_db)
):
    """Fetch saved chat sessions with messages, optionally filtered by user_email."""
    query = db.query(ChatSessionModel)
    if user_email:
        query = query.filter(ChatSessionModel.user_email == user_email)

    sessions = query.order_by(ChatSessionModel.updated_at.desc()).all()
    result = []

    for s in sessions:
        msgs = []
        for m in s.messages:
            thinking = json.loads(m.thinking_json) if m.thinking_json else []
            sources = json.loads(m.sources_json) if m.sources_json else []
            msgs.append(
                ChatMessageSchema(
                    id=m.id,
                    role=m.role,
                    text=m.text or "",
                    progress=m.progress,
                    progressLabel=m.progress_label,
                    thinking=thinking,
                    sources=sources,
                    thinkingDuration=m.thinking_duration,
                    showGraph=m.show_graph or False,
                )
            )

        ts = s.updated_at.timestamp() * 1000 if s.updated_at else datetime.datetime.utcnow().timestamp() * 1000
        result.append(
            ChatSessionSummarySchema(
                id=s.id,
                title=s.title,
                timestamp=ts,
                messages=msgs,
            )
        )

    return result


@router.post("")
def save_chat_session(req: SaveChatSessionRequest, db: Session = Depends(get_db)):
    """Save or update a chat session with full message history."""
    session = db.query(ChatSessionModel).filter(ChatSessionModel.id == req.id).first()

    if not session:
        session = ChatSessionModel(
            id=req.id,
            title=req.title,
            user_email=req.user_email,
        )
        db.add(session)
    else:
        session.title = req.title
        if req.user_email:
            session.user_email = req.user_email
        session.updated_at = datetime.datetime.utcnow()

    # Sync messages safely using merge to prevent duplicate key race conditions
    existing_ids = {m.id for m in db.query(ChatMessageModel.id).filter(ChatMessageModel.session_id == req.id).all()}
    incoming_ids = {m.id for m in req.messages}
    
    ids_to_delete = existing_ids - incoming_ids
    if ids_to_delete:
        db.query(ChatMessageModel).filter(ChatMessageModel.id.in_(ids_to_delete)).delete(synchronize_session=False)

    for m in req.messages:
        msg_model = ChatMessageModel(
            id=m.id,
            session_id=req.id,
            role=m.role,
            text=m.text,
            progress=m.progress,
            progress_label=m.progressLabel,
            thinking_json=json.dumps([t.model_dump() for t in m.thinking]) if m.thinking else None,
            sources_json=json.dumps([s.model_dump() for s in m.sources]) if m.sources else None,
            thinking_duration=m.thinkingDuration,
            show_graph=m.showGraph,
        )
        db.merge(msg_model)

    try:
        db.commit()
    except Exception:
        db.rollback()
    return {"status": "ok", "session_id": req.id}


@router.delete("/{session_id}")
def delete_chat_session(session_id: str, db: Session = Depends(get_db)):
    """Delete a chat session."""
    session = db.query(ChatSessionModel).filter(ChatSessionModel.id == session_id).first()
    if session:
        db.delete(session)
        db.commit()
    return {"status": "deleted"}

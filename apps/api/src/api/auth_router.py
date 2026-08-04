import os
import json
import time
import hmac
import hashlib
import base64
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from db.session import get_db
from db.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-digital-twin-key-2026")


def hash_password(password: str) -> str:
    salt = "modus_salt_2026"
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()


def create_jwt_token(payload: dict, expires_in_seconds: int = 86400 * 7) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload_copy = payload.copy()
    payload_copy["exp"] = int(time.time()) + expires_in_seconds

    b64_header = base64.urlsafe_b64encode(json.dumps(header).encode("utf-8")).decode("utf-8").rstrip("=")
    b64_payload = base64.urlsafe_b64encode(json.dumps(payload_copy).encode("utf-8")).decode("utf-8").rstrip("=")

    signature_input = f"{b64_header}.{b64_payload}".encode("utf-8")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), signature_input, hashlib.sha256).digest()
    b64_signature = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")

    return f"{b64_header}.{b64_payload}.{b64_signature}"


def verify_jwt_token(token: str) -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise HTTPException(status_code=401, detail="Invalid token format")

    b64_header, b64_payload, b64_signature = parts
    signature_input = f"{b64_header}.{b64_payload}".encode("utf-8")
    expected_sig = base64.urlsafe_b64encode(
        hmac.new(SECRET_KEY.encode("utf-8"), signature_input, hashlib.sha256).digest()
    ).decode("utf-8").rstrip("=")

    if not hmac.compare_digest(b64_signature, expected_sig):
        raise HTTPException(status_code=401, detail="Invalid token signature")

    # Add back padding
    padded_payload = b64_payload + "=" * (-len(b64_payload) % 4)
    payload = json.loads(base64.urlsafe_b64decode(padded_payload.encode("utf-8")).decode("utf-8"))

    if payload.get("exp") and payload["exp"] < time.time():
        raise HTTPException(status_code=401, detail="Token expired")

    return payload


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    existing = db.query(User).filter(User.email == email_clean).first()

    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in.")

    hashed = hash_password(req.password)
    user = User(email=email_clean, hashed_password=hashed, name=req.name or email_clean.split("@")[0])
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_jwt_token({"user_id": user.id, "email": user.email, "name": user.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.name}
    }


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    hashed = hash_password(req.password)

    user = db.query(User).filter(User.email == email_clean).first()
    if not user or user.hashed_password != hashed:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_jwt_token({"user_id": user.id, "email": user.email, "name": user.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.name}
    }


@router.get("/me")
def get_current_user(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ")[1]
    payload = verify_jwt_token(token)

    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"id": user.id, "email": user.email, "name": user.name}

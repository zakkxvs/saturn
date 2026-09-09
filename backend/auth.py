"""JWT email+password auth for Saturn / PresetBridge.

Exposes:
  - build_auth_router(db) -> APIRouter mounted at /auth (parent already has /api prefix)
  - get_current_user(request, db) dependency helper
  - seed_admin(db)
  - ensure_indexes(db)
"""
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field

JWT_ALGO = "HS256"
ACCESS_MIN = 60 * 24  # 24h — no refresh flow for now
MAX_ATTEMPTS = 5
LOCKOUT_MIN = 15


def _secret() -> str:
    s = os.environ.get("JWT_SECRET")
    if not s:
        raise RuntimeError("JWT_SECRET not configured")
    return s


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_MIN),
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGO)


def decode_token(token: str) -> dict:
    return jwt.decode(token, _secret(), algorithms=[JWT_ALGO])


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    name: Optional[str] = Field(default=None, max_length=80)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    role: str = "user"
    created_at: str


class AuthOut(BaseModel):
    user: UserOut
    access_token: str
    token_type: str = "bearer"


def _user_to_out(u: dict) -> UserOut:
    return UserOut(
        id=u["id"],
        email=u["email"],
        name=u.get("name"),
        role=u.get("role", "user"),
        created_at=u.get("created_at"),
    )


async def _extract_token(request: Request) -> Optional[str]:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return request.cookies.get("access_token")


async def get_current_user(request: Request):
    db = request.app.state.db
    token = await _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def _bump_login_attempt(db, identifier: str) -> int:
    now = datetime.now(timezone.utc)
    res = await db.login_attempts.find_one_and_update(
        {"identifier": identifier},
        {"$inc": {"count": 1}, "$set": {"last_attempt": now.isoformat()}, "$setOnInsert": {"first_attempt": now.isoformat()}},
        upsert=True,
        return_document=True,
    )
    return (res or {}).get("count", 1)


async def _is_locked_out(db, identifier: str) -> bool:
    doc = await db.login_attempts.find_one({"identifier": identifier})
    if not doc:
        return False
    if doc.get("count", 0) < MAX_ATTEMPTS:
        return False
    last = doc.get("last_attempt")
    if not last:
        return False
    try:
        last_dt = datetime.fromisoformat(last)
    except Exception:
        return False
    return (datetime.now(timezone.utc) - last_dt) < timedelta(minutes=LOCKOUT_MIN)


async def _clear_attempts(db, identifier: str):
    await db.login_attempts.delete_one({"identifier": identifier})


def build_auth_router(db) -> APIRouter:
    router = APIRouter(prefix="/auth", tags=["auth"])

    @router.post("/register", response_model=AuthOut)
    async def register(body: RegisterIn):
        email = body.email.lower().strip()
        existing = await db.users.find_one({"email": email})
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")
        user = {
            "id": str(uuid.uuid4()),
            "email": email,
            "name": body.name or email.split("@")[0],
            "password_hash": hash_password(body.password),
            "role": "user",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user)
        token = create_access_token(user["id"], user["email"])
        return AuthOut(user=_user_to_out(user), access_token=token)

    @router.post("/login", response_model=AuthOut)
    async def login(body: LoginIn, request: Request):
        email = body.email.lower().strip()
        ip = request.client.host if request.client else "unknown"
        identifier = f"{ip}:{email}"
        if await _is_locked_out(db, identifier):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in a few minutes.")
        user = await db.users.find_one({"email": email})
        if not user or not verify_password(body.password, user.get("password_hash", "")):
            await _bump_login_attempt(db, identifier)
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        await _clear_attempts(db, identifier)
        token = create_access_token(user["id"], user["email"])
        return AuthOut(user=_user_to_out(user), access_token=token)

    @router.get("/me", response_model=UserOut)
    async def me(current=Depends(get_current_user)):
        return _user_to_out(current)

    @router.post("/logout")
    async def logout(_=Depends(get_current_user)):
        # Stateless JWT — client drops the token. Endpoint exists for symmetry.
        return {"ok": True}

    @router.post("/forgot-password")
    async def forgot_password(body: dict):
        email = (body.get("email") or "").lower().strip()
        if not email:
            raise HTTPException(status_code=400, detail="email required")
        user = await db.users.find_one({"email": email})
        # Always return ok to prevent user enumeration
        if user:
            token = secrets.token_urlsafe(32)
            await db.password_reset_tokens.insert_one({
                "token": token,
                "user_id": user["id"],
                "used": False,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            })
            print(f"[auth] password reset link for {email}: /reset-password?token={token}")
        return {"ok": True}

    @router.post("/reset-password")
    async def reset_password(body: dict):
        token = body.get("token")
        new_password = body.get("password") or ""
        if not token or len(new_password) < 8:
            raise HTTPException(status_code=400, detail="token and 8+ char password required")
        doc = await db.password_reset_tokens.find_one({"token": token, "used": False})
        if not doc:
            raise HTTPException(status_code=400, detail="Invalid or used token")
        exp = doc.get("expires_at")
        if isinstance(exp, str):
            try:
                exp = datetime.fromisoformat(exp)
            except Exception:
                exp = None
        if isinstance(exp, datetime) and exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if not isinstance(exp, datetime) or exp < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Token expired")
        await db.users.update_one({"id": doc["user_id"]}, {"$set": {"password_hash": hash_password(new_password)}})
        await db.password_reset_tokens.update_one({"token": token}, {"$set": {"used": True}})
        return {"ok": True}

    return router


async def ensure_indexes(db):
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)


async def seed_admin(db):
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@saturn.dev").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Saturn2026!")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Admin",
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        print(f"[auth] seeded admin {admin_email}")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}},
        )
        print(f"[auth] updated admin {admin_email} password hash")

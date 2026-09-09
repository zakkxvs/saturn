import base64
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

from converter import analyze_preset, build_package_zip
from rules_data import AE_VERSIONS, RULES
from samples_data import SAMPLES
from auth import build_auth_router, ensure_indexes, seed_admin
from downloads import build_downloads_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Saturn / PresetBridge API")
app.state.db = db
api = APIRouter(prefix="/api")
api.include_router(build_auth_router(db))
api.include_router(build_downloads_router(db))


# ---------- helpers ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_session_id(x_session_id: Optional[str]) -> str:
    if not x_session_id:
        raise HTTPException(status_code=400, detail="X-Session-Id header required")
    return x_session_id


# ---------- models ----------
class NewsletterIn(BaseModel):
    email: EmailStr
    source: Optional[str] = "marketing"


class PresetSaveIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    filename: str
    content_b64: str
    tags: list[str] = []
    source_version: Optional[str] = None
    notes: Optional[str] = ""


class SettingsIn(BaseModel):
    default_ae_version: str = "2024"
    default_os: str = "macos"
    theme: str = "dark"
    autosave: bool = True
    notifications: bool = True
    first_run_completed: bool = True


# ---------- system ----------
@api.get("/")
async def root():
    return {"service": "saturn-presetbridge", "status": "ok", "time": now_iso()}


@api.get("/health")
async def health():
    return {"ok": True}


@api.get("/ae-versions")
async def ae_versions():
    return {"versions": AE_VERSIONS, "os": ["macos", "windows"]}


# ---------- rules ----------
@api.get("/rules")
async def get_rules():
    return {"count": len(RULES), "version": "v1.0.0", "rules": RULES}


# ---------- samples ----------
@api.get("/samples")
async def get_samples():
    return {
        "samples": [
            {"id": s["id"], "filename": s["filename"], "label": s["label"],
             "description": s["description"], "size_bytes": len(s["content"].encode("utf-8"))}
            for s in SAMPLES
        ]
    }


@api.get("/samples/{sample_id}")
async def get_sample(sample_id: str):
    for s in SAMPLES:
        if s["id"] == sample_id:
            return {"id": s["id"], "filename": s["filename"], "content": s["content"]}
    raise HTTPException(status_code=404, detail="sample not found")


# ---------- convert ----------
@api.post("/convert")
async def convert_preset(
    x_session_id: Optional[str] = Header(default=None, alias="X-Session-Id"),
    file: UploadFile = File(...),
    target_version: str = Form(...),
    target_os: str = Form("macos"),
    safe_conversion: bool = Form(True),
    save_history: bool = Form(True),
):
    session_id = get_session_id(x_session_id)
    if target_version not in AE_VERSIONS:
        raise HTTPException(status_code=400, detail=f"target_version must be one of {AE_VERSIONS}")
    if target_os not in ("macos", "windows"):
        raise HTTPException(status_code=400, detail="target_os must be macos|windows")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="file too large (max 5MB)")

    report = analyze_preset(
        filename=file.filename or "preset",
        content=content,
        target_version=target_version,
        target_os=target_os,
        safe_conversion=safe_conversion,
    )

    conversion_id = str(uuid.uuid4())
    doc = {
        "id": conversion_id,
        "session_id": session_id,
        "filename": file.filename,
        "target_version": target_version,
        "target_os": target_os,
        "safe_conversion": safe_conversion,
        "report": report,
        "content_b64": base64.b64encode(content).decode("ascii"),
        "created_at": now_iso(),
    }
    if save_history:
        await db.conversions.insert_one(doc)

    return {"id": conversion_id, "report": report}


@api.get("/convert/{conversion_id}/package")
async def download_package(
    conversion_id: str,
    x_session_id: Optional[str] = Header(default=None, alias="X-Session-Id"),
):
    session_id = get_session_id(x_session_id)
    doc = await db.conversions.find_one({"id": conversion_id, "session_id": session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="conversion not found")
    content = base64.b64decode(doc["content_b64"])
    zip_bytes = build_package_zip(doc["filename"], content, doc["report"])
    base = (doc["filename"] or "preset").rsplit(".", 1)[0]
    fname = f"{base}__{doc['target_version']}_{doc['target_os']}_compat.zip"
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )


# ---------- history ----------
@api.get("/history")
async def get_history(x_session_id: Optional[str] = Header(default=None, alias="X-Session-Id")):
    session_id = get_session_id(x_session_id)
    docs = await db.conversions.find(
        {"session_id": session_id},
        {"_id": 0, "content_b64": 0},
    ).sort("created_at", -1).to_list(200)
    return {"count": len(docs), "items": docs}


@api.delete("/history/{conversion_id}")
async def delete_history(conversion_id: str, x_session_id: Optional[str] = Header(default=None, alias="X-Session-Id")):
    session_id = get_session_id(x_session_id)
    res = await db.conversions.delete_one({"id": conversion_id, "session_id": session_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="not found")
    return {"ok": True}


# ---------- library (saved presets) ----------
@api.post("/presets")
async def save_preset(body: PresetSaveIn, x_session_id: Optional[str] = Header(default=None, alias="X-Session-Id")):
    session_id = get_session_id(x_session_id)
    # sanity check b64
    try:
        raw = base64.b64decode(body.content_b64, validate=False)
    except Exception:
        raise HTTPException(status_code=400, detail="content_b64 invalid")
    if len(raw) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="preset too large")
    doc = {
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "name": body.name,
        "filename": body.filename,
        "content_b64": body.content_b64,
        "tags": body.tags,
        "source_version": body.source_version,
        "notes": body.notes,
        "size_bytes": len(raw),
        "created_at": now_iso(),
    }
    await db.presets.insert_one(doc)
    doc.pop("_id", None)
    doc.pop("content_b64", None)
    return doc


@api.get("/presets")
async def list_presets(x_session_id: Optional[str] = Header(default=None, alias="X-Session-Id")):
    session_id = get_session_id(x_session_id)
    docs = await db.presets.find(
        {"session_id": session_id},
        {"_id": 0, "content_b64": 0},
    ).sort("created_at", -1).to_list(500)
    return {"count": len(docs), "items": docs}


@api.get("/presets/{preset_id}")
async def get_preset(preset_id: str, x_session_id: Optional[str] = Header(default=None, alias="X-Session-Id")):
    session_id = get_session_id(x_session_id)
    doc = await db.presets.find_one({"id": preset_id, "session_id": session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="not found")
    return doc


@api.delete("/presets/{preset_id}")
async def delete_preset(preset_id: str, x_session_id: Optional[str] = Header(default=None, alias="X-Session-Id")):
    session_id = get_session_id(x_session_id)
    res = await db.presets.delete_one({"id": preset_id, "session_id": session_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="not found")
    return {"ok": True}


# ---------- settings ----------
@api.get("/settings")
async def get_settings(x_session_id: Optional[str] = Header(default=None, alias="X-Session-Id")):
    session_id = get_session_id(x_session_id)
    doc = await db.settings.find_one({"session_id": session_id}, {"_id": 0})
    if not doc:
        return {
            "session_id": session_id,
            "default_ae_version": "2024",
            "default_os": "macos",
            "theme": "dark",
            "autosave": True,
            "notifications": True,
            "first_run_completed": False,
        }
    return doc


@api.put("/settings")
async def put_settings(body: SettingsIn, x_session_id: Optional[str] = Header(default=None, alias="X-Session-Id")):
    session_id = get_session_id(x_session_id)
    doc = body.model_dump()
    doc["session_id"] = session_id
    doc["updated_at"] = now_iso()
    await db.settings.update_one({"session_id": session_id}, {"$set": doc}, upsert=True)
    return doc


# ---------- newsletter ----------
@api.post("/newsletter")
async def subscribe(body: NewsletterIn):
    existing = await db.newsletter.find_one({"email": body.email.lower()})
    if existing:
        return {"ok": True, "already_subscribed": True}
    doc = {
        "id": str(uuid.uuid4()),
        "email": body.email.lower(),
        "source": body.source or "marketing",
        "created_at": now_iso(),
    }
    await db.newsletter.insert_one(doc)
    return {"ok": True, "already_subscribed": False}


# ---------- register ----------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")


@app.on_event("startup")
async def _startup():
    await ensure_indexes(db)
    await seed_admin(db)


@app.on_event("shutdown")
async def _shutdown():
    client.close()
